/**
 * WebSocket客户端封装类
 * 提供完整的WebSocket连接管理、重连机制、消息队列、心跳检测等功能
 *
 * @author Claude
 * @version 1.0.0
 */
class WebSocketClient {
    /**
     * WebSocket连接状态枚举
     * @readonly
     * @enum {number}
     */
    static STATUS = {
        /** 连接中 */
        CONNECTING: 0,
        /** 已连接 */
        OPEN: 1,
        /** 关闭中 */
        CLOSING: 2,
        /** 已关闭 */
        CLOSED: 3,
        /** 重连中 */
        RECONNECTING: 4
    };

    /**
     * 构造函数
     * @param {string} url - WebSocket服务器地址
     * @param {Object} options - 配置选项
     * @param {number} [options.timeout=5000] - 连接超时时间（毫秒）
     * @param {number} [options.reconnectInterval=3000] - 重连间隔（毫秒）
     * @param {number} [options.maxReconnectAttempts=5] - 最大重连次数
     * @param {number} [options.heartbeatInterval=30000] - 心跳间隔（毫秒）
     * @param {number} [options.heartbeatTimeout=5000] - 心跳超时时间（毫秒）
     * @param {boolean} [options.autoReconnect=true] - 是否自动重连
     * @param {boolean} [options.enableHeartbeat=true] - 是否启用心跳检测
     * @param {boolean} [options.debug=false] - 是否开启调试模式
     * @param {Array<string>} [options.protocols=[]] - WebSocket协议列表
     * @param {Object} [options.headers={}] - 连接时额外的请求头
     */
    constructor(url, options = {}) {
        // 验证必要参数
        if (!url || typeof url !== 'string') {
            throw new Error('WebSocket URL is required and must be a string');
        }

        // 基本配置
        this.url = url;
        this.options = {
            timeout: 5000,
            reconnectInterval: 3000,
            maxReconnectAttempts: 5,
            heartbeatInterval: 30000,
            heartbeatTimeout: 5000,
            autoReconnect: true,
            enableHeartbeat: true,
            debug: false,
            protocols: [],
            headers: {},
            ...options
        };

        // WebSocket实例
        this.ws = null;

        // 连接状态管理
        this.status = WebSocketClient.STATUS.CLOSED;
        this.reconnectAttempts = 0;
        this.manualClose = false;

        // 定时器管理
        this.connectTimer = null;
        this.reconnectTimer = null;
        this.heartbeatTimer = null;
        this.heartbeatTimeoutTimer = null;

        // 消息队列管理
        this.messageQueue = [];
        this.messageHandlers = new Map();
        this.eventHandlers = new Map();

        // 心跳相关
        this.lastHeartbeatTime = 0;
        this.isWaitingHeartbeatResponse = false;

        // 唯一ID计数器
        this.messageId = 0;

        // 绑定方法上下文
        this._bindMethods();
    }

    /**
     * 绑定方法上下文，避免this指向问题
     * @private
     */
    _bindMethods() {
        this.handleOpen = this.handleOpen.bind(this);
        this.handleMessage = this.handleMessage.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.handleError = this.handleError.bind(this);
    }

    /**
     * 记录调试日志
     * @param {string} level - 日志级别
     * @param {string} message - 日志消息
     * @param {...any} args - 额外参数
     * @private
     */
    _log(level, message, ...args) {
        if (!this.options.debug) return;

        const timestamp = new Date().toISOString();
        const prefix = `[${timestamp}] [WebSocketClient] [${level.toUpperCase()}]`;
        console[level](prefix, message, ...args);
    }

    /**
     * 创建WebSocket连接
     * @param {Object} customOptions - 自定义连接选项（可选）
     * @returns {Promise<boolean>} 连接是否成功
     */
    async connect(customOptions = {}) {
        // 如果已经连接，直接返回
        if (this.status === WebSocketClient.STATUS.OPEN) {
            this._log('warn', 'WebSocket is already connected');
            return true;
        }

        // 如果正在连接，等待连接完成
        if (this.status === WebSocketClient.STATUS.CONNECTING) {
            this._log('info', 'WebSocket is connecting, please wait');
            return new Promise((resolve) => {
                const checkConnection = () => {
                    if (this.status !== WebSocketClient.STATUS.CONNECTING) {
                        resolve(this.status === WebSocketClient.STATUS.OPEN);
                    } else {
                        setTimeout(checkConnection, 100);
                    }
                };
                checkConnection();
            });
        }

        try {
            // 更新状态
            this.status = WebSocketClient.STATUS.CONNECTING;
            this._log('info', 'Connecting to WebSocket server:', this.url);

            // 合并自定义选项
            const finalOptions = { ...this.options, ...customOptions };

            // 创建WebSocket实例
            this.ws = new WebSocket(this.url, finalOptions.protocols);

            // 设置连接超时
            this._setConnectionTimeout(finalOptions.timeout);

            // 绑定事件处理器
            this._bindEventHandlers();

            // 触发连接中事件
            this._emit('connecting');

            // 等待连接完成
            return new Promise((resolve, reject) => {
                this.ws.addEventListener('open', () => {
                    this._clearConnectionTimeout();
                    resolve(true);
                });

                this.ws.addEventListener('error', (error) => {
                    this._clearConnectionTimeout();
                    reject(error);
                });
            });

        } catch (error) {
            this._log('error', 'Failed to create WebSocket connection:', error);
            this.status = WebSocketClient.STATUS.CLOSED;
            this._emit('error', error);
            return false;
        }
    }

    /**
     * 设置连接超时
     * @param {number} timeout - 超时时间
     * @private
     */
    _setConnectionTimeout(timeout) {
        this.connectTimer = setTimeout(() => {
            if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
                this._log('error', 'Connection timeout');
                this.ws.close();
                this._handleConnectionTimeout();
            }
        }, timeout);
    }

    /**
     * 清除连接超时定时器
     * @private
     */
    _clearConnectionTimeout() {
        if (this.connectTimer) {
            clearTimeout(this.connectTimer);
            this.connectTimer = null;
        }
    }

    /**
     * 处理连接超时
     * @private
     */
    _handleConnectionTimeout() {
        this.status = WebSocketClient.STATUS.CLOSED;
        this._emit('timeout');
        this._emit('error', new Error('Connection timeout'));

        if (this.options.autoReconnect && !this.manualClose) {
            this._scheduleReconnect();
        }
    }

    /**
     * 绑定WebSocket事件处理器
     * @private
     */
    _bindEventHandlers() {
        this.ws.addEventListener('open', this.handleOpen);
        this.ws.addEventListener('message', this.handleMessage);
        this.ws.addEventListener('close', this.handleClose);
        this.ws.addEventListener('error', this.handleError);
    }

    /**
     * 处理连接打开事件
     * @param {Event} event - 连接事件
     */
    handleOpen(event) {
        this._log('info', 'WebSocket connection established');
        this.status = WebSocketClient.STATUS.OPEN;
        this.reconnectAttempts = 0;
        this.manualClose = false;

        // 启动心跳检测
        if (this.options.enableHeartbeat) {
            this._startHeartbeat();
        }

        // 发送消息队列中的消息
        this._flushMessageQueue();

        // 触发连接成功事件
        this._emit('open', event);
        this._emit('connected');
    }

    /**
     * 处理接收到的消息
     * @param {MessageEvent} event - 消息事件
     */
    handleMessage(event) {
        try {
            let data;

            // 尝试解析JSON数据
            try {
                data = JSON.parse(event.data);
            } catch {
                data = event.data;
            }

            this._log('debug', 'Received message:', data);

            // 处理心跳响应
            if (this._isHeartbeatResponse(data)) {
                this._handleHeartbeatResponse();
                return;
            }

            // 处理普通消息
            this._handleMessage(data);

            // 触发消息接收事件
            this._emit('message', data, event);

        } catch (error) {
            this._log('error', 'Error handling message:', error);
            this._emit('messageError', error, event);
        }
    }

    /**
     * 处理连接关闭事件
     * @param {CloseEvent} event - 关闭事件
     */
    handleClose(event) {
        this._log('info', 'WebSocket connection closed:', {
            code: event.code,
            reason: event.reason,
            wasClean: event.wasClean
        });

        this.status = WebSocketClient.STATUS.CLOSED;
        this._cleanup();

        // 触发关闭事件
        this._emit('close', event);
        this._emit('disconnected');

        // 自动重连
        if (this.options.autoReconnect && !this.manualClose) {
            this._scheduleReconnect();
        }
    }

    /**
     * 处理连接错误事件
     * @param {Event} event - 错误事件
     */
    handleError(event) {
        this._log('error', 'WebSocket error:', event);
        this._emit('error', event);

        // 连接过程中的错误需要重连
        if (this.status === WebSocketClient.STATUS.CONNECTING) {
            this.status = WebSocketClient.STATUS.CLOSED;
            if (this.options.autoReconnect && !this.manualClose) {
                this._scheduleReconnect();
            }
        }
    }

    /**
     * 发送消息
     * @param {any} data - 要发送的数据
     * @param {Object} options - 发送选项
     * @param {boolean} [options.queueIfNotConnected=true] - 连接未建立时是否加入队列
     * @param {string} [options.id] - 消息ID（可选）
     * @param {number} [options.timeout=5000] - 发送超时时间
     * @returns {Promise<boolean>} 发送是否成功
     */
    async send(data, options = {}) {
        const sendOptions = {
            queueIfNotConnected: true,
            id: null,
            timeout: 5000,
            ...options
        };

        // 检查连接状态
        if (!this._isConnected()) {
            if (sendOptions.queueIfNotConnected) {
                this._log('debug', 'Connection not ready, queuing message');
                return this._queueMessage(data, sendOptions);
            } else {
                this._log('warn', 'Cannot send message: WebSocket not connected');
                return false;
            }
        }

        try {
            // 准备消息数据
            const message = this._prepareMessage(data, sendOptions);

            // 发送消息
            this.ws.send(JSON.stringify(message));
            this._log('debug', 'Message sent:', message);

            // 触发发送事件
            this._emit('send', data, sendOptions);

            return true;

        } catch (error) {
            this._log('error', 'Failed to send message:', error);
            this._emit('sendError', error, data, sendOptions);
            return false;
        }
    }

    /**
     * 准备消息数据
     * @param {any} data - 原始数据
     * @param {Object} options - 发送选项
     * @returns {Object} 格式化的消息对象
     * @private
     */
    _prepareMessage(data, options) {
        const message = {
            id: options.id || this._generateMessageId(),
            type: 'message',
            timestamp: Date.now(),
            data: data
        };

        return message;
    }

    /**
     * 生成消息ID
     * @returns {string} 唯一的消息ID
     * @private
     */
    _generateMessageId() {
        return `msg_${++this.messageId}_${Date.now()}`;
    }

    /**
     * 将消息加入队列
     * @param {any} data - 消息数据
     * @param {Object} options - 发送选项
     * @returns {Promise<boolean>} 是否成功加入队列
     * @private
     */
    _queueMessage(data, options) {
        return new Promise((resolve) => {
            const message = {
                data,
                options,
                resolve,
                timestamp: Date.now()
            };

            this.messageQueue.push(message);
            this._log('debug', 'Message queued:', message);
        });
    }

    /**
     * 刷新消息队列，发送所有待发送的消息
     * @private
     */
    _flushMessageQueue() {
        if (this.messageQueue.length === 0) {
            return;
        }

        this._log('info', `Flushing ${this.messageQueue.length} queued messages`);

        const messages = [...this.messageQueue];
        this.messageQueue = [];

        messages.forEach(({ data, options, resolve }) => {
            this.send(data, { ...options, queueIfNotConnected: false })
                .then(resolve);
        });
    }

    /**
     * 启动心跳检测
     * @private
     */
    _startHeartbeat() {
        this._clearHeartbeat();

        this.heartbeatTimer = setInterval(() => {
            this._sendHeartbeat();
        }, this.options.heartbeatInterval);

        this._log('debug', 'Heartbeat started');
    }

    /**
     * 清除心跳相关定时器
     * @private
     */
    _clearHeartbeat() {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }

        if (this.heartbeatTimeoutTimer) {
            clearTimeout(this.heartbeatTimeoutTimer);
            this.heartbeatTimeoutTimer = null;
        }
    }

    /**
     * 发送心跳包
     * @private
     */
    _sendHeartbeat() {
        if (!this._isConnected()) {
            return;
        }

        try {
            const heartbeat = {
                type: 'heartbeat',
                timestamp: Date.now()
            };

            this.ws.send(JSON.stringify(heartbeat));
            this.lastHeartbeatTime = Date.now();
            this.isWaitingHeartbeatResponse = true;

            // 设置心跳超时检测
            this.heartbeatTimeoutTimer = setTimeout(() => {
                if (this.isWaitingHeartbeatResponse) {
                    this._log('warn', 'Heartbeat timeout, connection may be lost');
                    this._handleHeartbeatTimeout();
                }
            }, this.options.heartbeatTimeout);

            this._log('debug', 'Heartbeat sent');

        } catch (error) {
            this._log('error', 'Failed to send heartbeat:', error);
        }
    }

    /**
     * 检查是否为心跳响应
     * @param {any} data - 接收到的数据
     * @returns {boolean} 是否为心跳响应
     * @private
     */
    _isHeartbeatResponse(data) {
        return data && data.type === 'heartbeat_response';
    }

    /**
     * 处理心跳响应
     * @private
     */
    _handleHeartbeatResponse() {
        this.isWaitingHeartbeatResponse = false;

        if (this.heartbeatTimeoutTimer) {
            clearTimeout(this.heartbeatTimeoutTimer);
            this.heartbeatTimeoutTimer = null;
        }

        const roundTripTime = Date.now() - this.lastHeartbeatTime;
        this._log('debug', `Heartbeat response received, RTT: ${roundTripTime}ms`);

        this._emit('heartbeat', roundTripTime);
    }

    /**
     * 处理心跳超时
     * @private
     */
    _handleHeartbeatTimeout() {
        this._emit('heartbeatTimeout');

        // 心跳超时，强制关闭连接并重连
        if (this.ws) {
            this.manualClose = false;
            this.ws.close(1000, 'Heartbeat timeout');
        }
    }

    /**
     * 安排重连
     * @private
     */
    _scheduleReconnect() {
        // 检查重连次数限制
        if (this.reconnectAttempts >= this.options.maxReconnectAttempts) {
            this._log('error', 'Max reconnect attempts reached');
            this._emit('reconnectFailed');
            return;
        }

        this.status = WebSocketClient.STATUS.RECONNECTING;
        this.reconnectAttempts++;

        const delay = this.options.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1);
        const maxDelay = 30000; // 最大延迟30秒
        const finalDelay = Math.min(delay, maxDelay);

        this._log('info', `Scheduling reconnect attempt ${this.reconnectAttempts}/${this.options.maxReconnectAttempts} in ${finalDelay}ms`);

        this.reconnectTimer = setTimeout(() => {
            this._emit('reconnecting', this.reconnectAttempts);
            this.connect();
        }, finalDelay);
    }

    /**
     * 手动重连
     * @returns {Promise<boolean>} 重连是否成功
     */
    async reconnect() {
        this._log('info', 'Manual reconnect requested');

        // 清除当前连接
        this.disconnect();

        // 重置重连计数
        this.reconnectAttempts = 0;
        this.manualClose = false;

        // 立即重连
        return await this.connect();
    }

    /**
     * 断开WebSocket连接
     * @param {number} [code=1000] - 关闭代码
     * @param {string} [reason='Manual disconnect'] - 关闭原因
     */
    disconnect(code = 1000, reason = 'Manual disconnect') {
        this._log('info', 'Disconnecting WebSocket');

        this.manualClose = true;
        this.status = WebSocketClient.STATUS.CLOSING;

        // 清除所有定时器
        this._cleanup();

        // 关闭连接
        if (this.ws) {
            this.ws.close(code, reason);
        }

        // 触发断开连接事件
        this._emit('disconnect');
    }

    /**
     * 清理资源
     * @private
     */
    _cleanup() {
        // 清除定时器
        this._clearConnectionTimeout();
        this._clearHeartbeat();

        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }

        // 清空消息队列
        this.messageQueue = [];
    }

    /**
     * 处理接收到的消息
     * @param {any} data - 消息数据
     * @private
     */
    _handleMessage(data) {
        // 如果消息有ID且有对应的处理器，调用特定处理器
        if (data.id && this.messageHandlers.has(data.id)) {
            const handler = this.messageHandlers.get(data.id);
            handler(data);
            this.messageHandlers.delete(data.id);
        }
    }

    /**
     * 检查连接状态
     * @returns {boolean} 是否已连接
     */
    _isConnected() {
        return this.ws && this.ws.readyState === WebSocket.OPEN;
    }

    /**
     * 获取当前连接状态
     * @returns {number} 连接状态
     */
    getStatus() {
        return this.status;
    }

    /**
     * 获取状态描述
     * @returns {string} 状态描述
     */
    getStatusText() {
        const statusMap = {
            [WebSocketClient.STATUS.CONNECTING]: 'Connecting',
            [WebSocketClient.STATUS.OPEN]: 'Connected',
            [WebSocketClient.STATUS.CLOSING]: 'Closing',
            [WebSocketClient.STATUS.CLOSED]: 'Closed',
            [WebSocketClient.STATUS.RECONNECTING]: 'Reconnecting'
        };

        return statusMap[this.status] || 'Unknown';
    }

    /**
     * 检查是否支持WebSocket
     * @returns {boolean} 是否支持
     */
    static isSupported() {
        return typeof WebSocket !== 'undefined';
    }

    /**
     * 添加事件监听器
     * @param {string} event - 事件名称
     * @param {Function} callback - 回调函数
     */
    on(event, callback) {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, []);
        }
        this.eventHandlers.get(event).push(callback);
    }

    /**
     * 移除事件监听器
     * @param {string} event - 事件名称
     * @param {Function} callback - 回调函数
     */
    off(event, callback) {
        if (this.eventHandlers.has(event)) {
            const handlers = this.eventHandlers.get(event);
            const index = handlers.indexOf(callback);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
    }

    /**
     * 触发事件
     * @param {string} event - 事件名称
     * @param {...any} args - 事件参数
     * @private
     */
    _emit(event, ...args) {
        if (this.eventHandlers.has(event)) {
            this.eventHandlers.get(event).forEach(callback => {
                try {
                    callback(...args);
                } catch (error) {
                    this._log('error', `Error in event handler for '${event}':`, error);
                }
            });
        }
    }

    /**
     * 发送请求并等待响应
     * @param {any} data - 请求数据
     * @param {Object} options - 请求选项
     * @param {number} [options.timeout=10000] - 请求超时时间
     * @param {Function} [options.responseFilter] - 响应过滤函数
     * @returns {Promise<any>} 响应数据
     */
    async request(data, options = {}) {
        const requestOptions = {
            timeout: 10000,
            responseFilter: null,
            ...options
        };

        return new Promise((resolve, reject) => {
            const messageId = this._generateMessageId();

            // 设置响应处理器
            const responseHandler = (response) => {
                // 检查是否是匹配的响应
                if (response.replyTo !== messageId) {
                    return;
                }

                // 应用响应过滤器
                if (requestOptions.responseFilter && !requestOptions.responseFilter(response)) {
                    return;
                }

                resolve(response.data);
            };

            this.messageHandlers.set(messageId, responseHandler);

            // 准备请求数据
            const requestData = {
                ...data,
                requestId: messageId,
                timestamp: Date.now()
            };

            // 发送请求
            this.send(requestData, { id: messageId });

            // 设置超时
            setTimeout(() => {
                this.messageHandlers.delete(messageId);
                reject(new Error('Request timeout'));
            }, requestOptions.timeout);
        });
    }

    /**
     * 获取连接统计信息
     * @returns {Object} 统计信息
     */
    getStats() {
        return {
            status: this.status,
            statusText: this.statusText,
            url: this.url,
            reconnectAttempts: this.reconnectAttempts,
            queuedMessages: this.messageQueue.length,
            lastHeartbeatTime: this.lastHeartbeatTime,
            isWaitingHeartbeatResponse: this.isWaitingHeartbeatResponse
        };
    }

    /**
     * 销毁WebSocket客户端实例
     */
    destroy() {
        this._log('info', 'Destroying WebSocket client');

        // 断开连接
        this.disconnect();

        // 清空所有处理器
        this.messageHandlers.clear();
        this.eventHandlers.clear();
        this.messageQueue = [];

        // 清空引用
        this.ws = null;
    }
}

// 导出类
export default WebSocketClient;