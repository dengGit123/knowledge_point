function MyPromise(executor) {
  let self = this
  self.status = 'pending' // 初始状态为pending
  self.value = null // 值
  self.onFulfilledCallbacks = [] // 成功回调函数列表
  self.onRejectedCallbacks = [] // 失败回调函数列表
  /**
   * 将Promise状态从pending变为fulfilled
   * 只有在pending状态下才会执行状态变更
   * 
   * @param {*} value Promise成功解决的值
   */
  function resolve(value) {
    if (self.status === 'pending') { 
      self.status = 'fulfilled'
      self.value = value
      self.onFulfilledCallbacks.forEach(fn => {
        fn(self.value)
      })
    }
  }
  /**
   * 将Promise状态从pending变为rejected
   * 只有在pending状态下才会执行状态变更
   * 
   * @param {*} value Promise被拒绝的原因或值
   */
  function reject(value) {
    if (self.status === 'pending') { 
      self.status = 'rejected'
      self.value = value
      self.onRejectedCallbacks.forEach(fn => fn(self.value))
    }
  }
  try {
    executor(resolve, reject)
  } catch (error) {
    reject(error)
  }
}
MyPromise.prototype.then = function (onFulfilled, onRejected) {
  return new MyPromise((resolve, reject) => { 
    // 默认回调函数
    if (typeof onFulfilled !== 'function') { 
    onFulfilled = function (value) {
      return value
    }
    }
    // 默认回调函数
  if (typeof onRejected !== 'function') { 
    onRejected = function (value) {
      throw value
    }
  }
    if (this.status === 'fulfilled') {
      // 判断返回值是否为Promise对象，如果是则等待其状态变更后再执行then的回调函数
    let result = onFulfilled(this.value)
    if (result instanceof MyPromise) {
      result.then((v) => {
        resolve(v)
      }, (r) => {
        reject(r)
      })
    } else {
      resolve(result)
    }
    } else if (this.status === 'rejected') { 
      // 判断返回值是否为Promise对象，如果是则等待其状态变更后再执行then的回调函数
    let result = onRejected(this.value)
    if (result instanceof MyPromise) {
      result.then((v) => {
        resolve(v)
      }, (r) => {
        reject(r)
      })
    } else {
      resolve(result)
    }
    
  } else {
      this.onFulfilledCallbacks.push(() => {
      // 判断返回值是否为Promise对象，如果是则等待其状态变更后再执行then的回调函数
      let result = onFulfilled(this.value)
      if (result instanceof MyPromise) {
        result.then((v) => {
          resolve(v)
        }, (r) => {
          reject(r)
        })
      } else {
        resolve(result)
      }
    })
      this.onRejectedCallbacks.push(() => {
      // 判断返回值是否为Promise对象，如果是则等待其状态变更后再执行then的回调函数
      let result = onRejected(this.value)
      if (result instanceof MyPromise) { 
        result.then((v) => {
          resolve(v)
        }, (r) => {
          reject(r)
        })
      } else {
        resolve(result)
      }
    })
  }
  })
}
MyPromise.prototype.catch = function (onRejected) {
  return this.then(null, onRejected)
}
MyPromise.resolve = function (value) {
  return new MyPromise((resolve, reject) => { 
    if (value instanceof MyPromise) { 
      value.then((v) => {
        resolve(v)
      }, (r) => {
        reject(r)
      })
    } else {
      resolve(value)
    }
  })
}
MyPromise.reject = function (value) {
  return new MyPromise((resolve, reject) => {
    reject(value)
  })
}
MyPromise.all = function (arr) {
  return new MyPromise((resolve,reject) => {
    let result = []
    let count = 0
    for (let i = 0; i < arr.length; i++) { 
      arr[i].then((v) => {
        result[i] = v
        count++
        if (count === arr.length) { 
          resolve(result)
        }
      }, (r) => {
        reject(r)
      })
    }
  })
}
MyPromise.race = function (promiseArr) {
  return new MyPromise((resolve,reject) => {
    for (let i = 0; i < promiseArr.length; i++) {
      promiseArr[i].then((v) => {
        resolve(v)
      }, (r) => {
        reject(r)
      })
    }
  })
}
let p = new MyPromise((resolve, reject) => {
  setTimeout(() => {
    resolve('s了')
  }, 1000)
})
console.log(p)
p.then((value) => {
  console.log(value)
  return new MyPromise((resolve, reject) => {
    setTimeout(() => {
      reject('失败了')
    }, 1000)
  })
}, (value) => {
  console.log(value)
  return '6666'
}).catch((v) => {
  console.log('v',v)
})
