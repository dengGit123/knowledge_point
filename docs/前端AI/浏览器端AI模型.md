# 浏览器端 AI 模型

## 一、概述

浏览器端 AI 模型是指在用户的浏览器中直接运行机器学习模型的技术，无需将数据发送到服务器，具有**低延迟、隐私保护、离线可用**等优势。

## 二、核心技术对比

| 技术 | 运行后端 | 适用场景 | 性能 | 易用性 |
|-----|---------|---------|------|-------|
| TensorFlow.js | WebGL/WASM | 通用 ML 任务 | 中等 | 高 |
| ONNX Runtime Web | WebGL/WASM/WebGPU | 模型推理 | 高 | 中 |
| Transformers.js | WASM/WebGPU | NLP/CV 任务 | 中等 | 高 |
| WebGPU API | GPU | 高性能计算 | 很高 | 低 |
| WebNN API | GPU/NPU | 神经网络推理 | 很高 | 中 |
| MediaPipe | WASM/GPU | 视觉/音频任务 | 高 | 高 |

## 三、TensorFlow.js

### 1. 简介

TensorFlow.js 是 Google 推出的在浏览器和 Node.js 中运行机器学习模型的 JavaScript 库。

### 2. 安装

```bash
npm install @tensorflow/tfjs
# 或 GPU 版本
npm install @tensorflow/tfjs-backend-webgl
```

### 3. 基本使用

#### 张量操作

```typescript
import * as tf from '@tensorflow/tfjs';

// 创建张量
const a = tf.tensor([1, 2, 3, 4]);
const b = tf.tensor([[1, 2], [3, 4]]);

// 基本运算
const sum = a.sum();
const mean = a.mean();
const reshaped = a.reshape([2, 2]);

// 矩阵乘法
const c = tf.matMul(b, b);

// 清理内存
a.dispose();
b.dispose();
```

#### 加载预训练模型

```typescript
import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';

// 加载 MobileNet 图像分类模型
const model = await mobilenet.load();

// 对图片进行分类
const img = document.getElementById('my-image') as HTMLImageElement;
const predictions = await model.classify(img);

console.log('预测结果:', predictions);
// [
//   { className: 'tabby cat', probability: 0.98 },
//   { className: 'tiger cat', probability: 0.01 },
//   ...
// ]
```

#### 迁移学习

```typescript
import * as tf from '@tensorflow/tfjs';

// 加载基础模型
const baseModel = await tf.loadLayersModel(
  'https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_1.0_224/model.json'
);

// 冻结基础模型层
baseModel.trainable = false;

// 构建新的分类头
const newModel = tf.sequential({
  layers: [
    tf.layers.flatten({ inputShape: baseModel.outputShape.slice(1) }),
    tf.layers.dense({ units: 100, activation: 'relu' }),
    tf.layers.dense({ units: 10, activation: 'softmax' })
  ]
});

// 编译模型
newModel.compile({
  optimizer: tf.train.adam(0.0001),
  loss: 'categoricalCrossentropy',
  metrics: ['accuracy']
});
```

### 4. 目标检测示例

```typescript
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

// 加载 COCO-SSD 模型
const model = await cocoSsd.load();

// 检测图片中的物体
const img = document.getElementById('detection-image') as HTMLImageElement;
const predictions = await model.detect(img);

// 绘制检测结果
const canvas = document.getElementById('output') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

predictions.forEach(prediction => {
  const [x, y, width, height] = prediction.bbox;

  // 绘制边界框
  ctx.strokeStyle = '#00FF00';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, width, height);

  // 绘制标签
  ctx.fillStyle = '#00FF00';
  ctx.font = '16px Arial';
  ctx.fillText(
    `${prediction.class} (${(prediction.score * 100).toFixed(1)}%)`,
    x,
    y - 5
  );
});
```

### 5. 姿态检测

```typescript
import * as poseDetection from '@tensorflow-models/pose-detection';

// 创建检测器
const detector = await poseDetection.createDetector(
  poseDetection.SupportedModels.MoveNet,
  { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING }
);

// 检测姿态
const img = document.getElementById('pose-image') as HTMLImageElement;
const poses = await detector.estimatePoses(img);

// 获取关键点
poses.forEach(pose => {
  pose.keypoints.forEach(keypoint => {
    console.log(`${keypoint.name}: (${keypoint.x}, ${keypoint.y}) 置信度: ${keypoint.score}`);
  });
});
```

## 四、Transformers.js

### 1. 简介

Transformers.js 是 Hugging Face Transformers 的 JavaScript 版本，可以在浏览器中运行各种 NLP 和 CV 模型。

### 2. 安装

```bash
npm install @xenova/transformers
```

### 3. 文本分类

```typescript
import { pipeline } from '@xenova/transformers';

// 创建情感分析管道
const classifier = await pipeline(
  'sentiment-analysis',
  'Xenova/distilbert-base-uncased-finetuned-sst-2-english'
);

// 分析文本情感
const result = await classifier('I love TypeScript!');
console.log(result);
// [{ label: 'POSITIVE', score: 0.9998 }]
```

### 4. 文本生成

```typescript
import { pipeline } from '@xenova/transformers';

// 创建文本生成管道
const generator = await pipeline(
  'text-generation',
  'Xenova/distilgpt2'
);

// 生成文本
const output = await generator('前端 AI 技术的未来是', {
  max_new_tokens: 50,
  temperature: 0.7
});

console.log(output[0].generated_text);
```

### 5. 特征提取（Embedding）

```typescript
import { pipeline } from '@xenova/transformers';

// 创建特征提取管道
const extractor = await pipeline(
  'feature-extraction',
  'Xenova/all-MiniLM-L6-v2'
);

// 提取文本特征向量
const embedding = await extractor('Hello world', {
  pooling: 'mean',
  normalize: true
});

console.log(embedding); // Float32Array [384]
console.log(embedding.length); // 384 维向量
```

### 6. 图像分类

```typescript
import { pipeline } from '@xenova/transformers';

// 创建图像分类管道
const classifier = await pipeline(
  'image-classification',
  'Xenova/vit-base-patch16-224'
);

// 对图像进行分类
const img = document.getElementById('classify-image') as HTMLImageElement;
const result = await classifier(img.src);

console.log(result);
// [
//   { label: 'tabby cat', score: 0.95 },
//   ...
// ]
```

### 7. 语音识别

```typescript
import { pipeline } from '@xenova/transformers';

// 创建语音识别管道
const transcriber = await pipeline(
  'automatic-speech-recognition',
  'Xenova/whisper-tiny'
);

// 从音频元素获取音频数据
const audioContext = new AudioContext();
const response = await fetch('audio.mp3');
const arrayBuffer = await response.arrayBuffer();
const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

// 识别语音
const result = await transcriber(audioBuffer.getChannelData(0));
console.log(result.text);
```

## 五、ONNX Runtime Web

### 1. 简介

ONNX Runtime Web 是在浏览器中运行 ONNX 模型的高性能推理引擎，支持 WebAssembly、WebGPU 等后端。

### 2. 安装

```bash
npm install onnxruntime-web
```

### 3. 基本使用

```typescript
import * as ort from 'onnxruntime-web';

// 加载 ONNX 模型
const session = await ort.InferenceSession.create('./model.onnx');

// 准备输入
const inputTensor = new ort.Tensor('float32', Float32Array.from([1, 2, 3, 4]), [1, 4]);

// 运行推理
const results = await session.run({ input: inputTensor });

// 获取输出
const output = results.output;
console.log(output.data);
```

### 4. 使用 WebGPU 加速

```typescript
import * as ort from 'onnxruntime-web/webgpu';

// 使用 WebGPU 后端
const session = await ort.InferenceSession.create('./model.onnx', {
  executionProviders: ['webgpu']
});

// 其余用法相同，但推理速度更快
```

## 六、WebGPU API

### 1. 简介

WebGPU 是现代浏览器提供的高性能 GPU 计算 API，支持图形渲染和通用 GPU 计算（GPGPU）。

### 2. 基本使用

```typescript
// 获取 GPU 设备
async function getGPUDevice() {
  if (!navigator.gpu) {
    throw new Error('WebGPU 不受支持');
  }

  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) {
    throw new Error('无法获取 GPU 适配器');
  }

  return await adapter.requestDevice();
}

// 执行 GPU 计算
async function gpuCompute(inputData: Float32Array) {
  const device = await getGPUDevice();

  // 创建输入缓冲区
  const inputBuffer = device.createBuffer({
    size: inputData.byteLength,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
  });
  device.queue.writeBuffer(inputBuffer, 0, inputData);

  // 创建输出缓冲区
  const outputBuffer = device.createBuffer({
    size: inputData.byteLength,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC
  });

  // 创建计算管线
  const shaderModule = device.createShaderModule({
    code: `
      @group(0) @binding(0) var<storage, read> input: array<f32>;
      @group(0) @binding(1) var<storage, read_write> output: array<f32>;

      @compute @workgroup_size(64)
      fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
        let idx = global_id.x;
        if (idx < arrayLength(&input)) {
          output[idx] = input[idx] * 2.0;
        }
      }
    `
  });

  const pipeline = device.createComputePipeline({
    layout: 'auto',
    compute: { module: shaderModule, entryPoint: 'main' }
  });

  // 创建绑定组
  const bindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: { buffer: inputBuffer } },
      { binding: 1, resource: { buffer: outputBuffer } }
    ]
  });

  // 执行计算
  const commandEncoder = device.createCommandEncoder();
  const passEncoder = commandEncoder.beginComputePass();
  passEncoder.setPipeline(pipeline);
  passEncoder.setBindGroup(0, bindGroup);
  passEncoder.dispatchWorkgroups(Math.ceil(inputData.length / 64));
  passEncoder.end();
  device.queue.submit([commandEncoder.finish()]);
}
```

## 七、MediaPipe

### 1. 简介

MediaPipe 是 Google 推出的跨平台机器学习框架，提供多种预构建的 ML 解决方案。

### 2. 手部追踪

```typescript
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

// 加载模型
const vision = await FilesetResolver.forVisionTasks(
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
);

const handLandmarker = await HandLandmarker.createFromOptions(vision, {
  baseOptions: {
    modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task'
  },
  runningMode: 'VIDEO',
  numHands: 2
});

// 实时检测手部
const video = document.getElementById('video') as HTMLVideoElement;
const canvas = document.getElementById('output') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

function detectHands() {
  const startTimeMs = performance.now();
  const results = handLandmarker.detectForVideo(video, startTimeMs);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(video, 0, 0);

  for (const landmarks of results.landmarks) {
    // 绘制手部关键点
    landmarks.forEach(landmark => {
      ctx.beginPath();
      ctx.arc(landmark.x * canvas.width, landmark.y * canvas.height, 5, 0, 2 * Math.PI);
      ctx.fillStyle = '#FF0000';
      ctx.fill();
    });
  }

  requestAnimationFrame(detectHands);
}
```

### 3. 人脸检测

```typescript
import { FaceDetector, FilesetResolver } from '@mediapipe/tasks-vision';

const vision = await FilesetResolver.forVisionTasks(
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
);

const faceDetector = await FaceDetector.createFromOptions(vision, {
  baseOptions: {
    modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.task'
  },
  runningMode: 'IMAGE'
});

// 检测人脸
const img = document.getElementById('face-image') as HTMLImageElement;
const result = faceDetector.detect(img);

result.detections.forEach(detection => {
  const box = detection.boundingBox!;
  console.log(`人脸位置: (${box.originX}, ${box.originY}) ${box.width}x${box.height}`);

  detection.keypoints.forEach(keypoint => {
    console.log(`关键点: (${keypoint.x}, ${keypoint.y})`);
  });
});
```

## 八、性能优化策略

### 1. 模型量化

```typescript
// 使用量化模型减少模型大小和推理时间
// FP32 → INT8 量化可减少 4 倍大小，提升 2-4 倍速度

// Transformers.js 自动使用量化模型
const classifier = await pipeline(
  'sentiment-analysis',
  'Xenova/distilbert-base-uncased-finetuned-sst-2-english'
  // 默认使用 INT8 量化版本
);
```

### 2. Web Worker 卸载计算

```typescript
// main.ts
const worker = new Worker(new URL('./ml-worker.ts', import.meta.url), {
  type: 'module'
});

worker.postMessage({ type: 'classify', imageData: imageData });
worker.onmessage = (e) => {
  console.log('分类结果:', e.data);
};

// ml-worker.ts
import * as cocoSsd from '@tensorflow-models/coco-ssd';

let model: cocoSsd.ObjectDetection;

async function loadModel() {
  model = await cocoSsd.load();
}

self.onmessage = async (e) => {
  if (e.data.type === 'classify') {
    if (!model) await loadModel();
    const predictions = await model.detect(e.data.imageData);
    self.postMessage(predictions);
  }
};
```

### 3. 模型缓存

```typescript
// 使用 IndexedDB 缓存模型
import { openDB } from 'idb';

async function loadModelWithCache(modelUrl: string) {
  const db = await openDB('ml-models', 1, {
    upgrade(db) {
      db.createObjectStore('models');
    }
  });

  // 尝试从缓存加载
  let modelData = await db.get('models', modelUrl);

  if (!modelData) {
    // 下载并缓存
    const response = await fetch(modelUrl);
    modelData = await response.arrayBuffer();
    await db.put('models', modelData, modelUrl);
  }

  return modelData;
}
```

## 九、参考链接

- [TensorFlow.js 官方文档](https://www.tensorflow.org/js)
- [Transformers.js 文档](https://huggingface.co/docs/transformers.js)
- [ONNX Runtime Web](https://onnxruntime.ai/docs/tutorials/web/)
- [WebGPU 文档](https://gpuweb.github.io/gpuweb/)
- [MediaPipe](https://developers.google.com/mediapipe)
- [WebNN API](https://www.w3.org/TR/webnn/)
