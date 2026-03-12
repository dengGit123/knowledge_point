function example() {
  try {
    return 'return from try';
    console.log(444)
  } catch (err) {
    console.log('catch block');
    return 'return from catch'; 
  } finally {
    console.log('finally block');
    return 'return from finally';
  }
}
console.log(example())

function Person() {}  
var person = new Person();
console.log(person instanceof Person)
console.log(person)
console.log(Person)
console.log(Person.prototype == person.__proto__)