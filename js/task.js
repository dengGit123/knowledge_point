console.log('start script')
setTimeout(() => {
  console.log('setTimeout1')
  new Promise((resove) => {
    console.log('promise1')
    resove()
  }).then(() => {
    new Promise((resove) => {
      console.log('promise2')
      resove()
    }).then(() => [
      console.log('promise3')
    ])
  })
})
new Promise((resove) => { 
  console.log('promise4')
  resove()
}).then(() => {
  console.log('promise5')
})
setTimeout(() => {
  console.log('setTimeout2')
})
console.log(22)
queueMicrotask(() => {
  console.log('queueMicrotask')
})
new Promise((resove) => { 
  console.log('promise6')
  resove()
}).then(() => {
  console.log('promise7')
})
console.log('end script')
//start script promise4 22,promise6, end script , promise5,queueMicrotask,promise7,setTimeout1,promise1,promise2,promise3,setTimeout2