---
title: Langs | John Resig's Learning Advanced JavaScript
date: 2017-11-10
categories: Languages Explore
tags:
- JavaScript
---

这周的Web作业有个要求是去John Resig的个人网站上弄懂一个JavaScript教程，于是本菜秀写了这篇文章，如有不赞同的地方，请邮件联系，谢谢~

题外话：John Resig是jQuery的创始人~

<!-- more -->

##  Our Goal

### 2: Goal: To be able to understand this function

```javascript
// The .bind method from Prototype.js 
Function.prototype.bind = function(){ 
  var fn = this, args = Array.prototype.slice.call(arguments), object = args.shift(); 
  return function(){ 
    return fn.apply(object, args.concat(Array.prototype.slice.call(arguments))); 
  }; 
};
```

`Prototype.js`是一个对原生JS对象进行扩展的JS库，`jQuery`也包含和借鉴了这个库。这道题目的要求是让我们读懂这段代码。

首先我们先看看什么是`Function`，[MSN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Function)里面讲的有点奇怪，又是构造函数又是构造器。不过在我看来，`Function`可以相当于OO里面的类，在JavaScript里面的每一个函数都是它的对象。我们可以通过`Function`来构造一个函数。

```javascript
const func = new Function('a', 'b', 'return a + b')

func(1, 5) // => 6
```

那么`prototype`又是什么呢？[prototype](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Function/prototype)的中文意思是原型，如果从OO上说就是这个类原有的东西。

我们知道，每个函数对象都有一个`call()`方法，可以直接调用这个函数。

```javascript
const func = function () {
  alert('hi, world!')
}

func.call()  // => 'hi, world!'
```

那么如果我们修改了`Function.prototype.call`那就修改了所有函数的`call()`。

```javascript
const func = function () {
  alert('hi, world!')
}

func.call()  // => 'hi, world!'

Function.prototype.call = function () {
  alert('hi, diao sister~')
}

const anotherFunc = function () {
  return 1
}

func.call()  // => 'hi, diao sister~'
anotherFunc.call()  // => 'hi, diao sister~'
```

现在我们知道了这段代码的的功能就是修改原有的`Function.prototype.bind`(或者是新增)。那么，`Function.prototype.bind`本身是什么功能呢？

[bind()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Function/bind)函数的功能是在原函数的基础上创造一个新的函数，并将原函数的this指定为新函数的第一个参数，同时将新函数的剩余的参数插在原函数的参数前面。

```javascript
// thisArg: 原函数指定的this
// arg1, arg2 ... : 插入的参数
fun.bind(thisArg[, arg1[, arg2[, ...]]])
```

首先我们忽视`thisArg`，先看看后面的那些参数到底有啥作用。

```javascript
const func = function () {
  for (let x of arguments) {
      console.log(x)
  }
}

func(1, 2, 4, 5)  // => [1, 2, 4, 5]

const anotherFunc = func.bind(undefined, 9, 8, 7)

anotherFunc(1, 2, 4, 5)  // => [9, 8, 7, 1, 2, 4, 5]
```

那么为什么要指定一个新的this呢？

```javascript
this.val = 9

const a = {
  val: 12,
  func: function () {
    return this.val
  }
}

a.func()  // => 12

const bFunc = a.func
bFunc()  // => 9
```

在函数的位置发生变化之后，this的值也发生了变化，所以，这个时候bind的作用就是把this绑定到某个值。

```javascript
this.val = 9

const a = {
  val: 12,
  func: function () {
    return this.val
  }
}

a.func()  // => 12

const bFunc = a.func.bind(a)
bFunc()  // => 12
```

然后我们看回给定的代码，貌似并没有扩展什么，只是实现了bind的功能。

```javascript
// 解释代码
Function.prototype.bind = function(){ 
  var fn = this;  // 原函数
  var args = Array.prototype.slice.call(arguments);  // 将调用生成函数的参数转换成数组
  var object = args.shift();  // 去掉参数数组的第一个参数, 也就是thisArg, 保持兼容
  return function(){ 
    // 通过apply调用原函数 apply与call的区别是apply需要接受this参数和只接受参数数组
    // concat用于拼接数组, 将args和arguments拼接起来
    // 这里的arguments是内部函数的参数, 跟上面的arguments不是一个东西
    return fn.apply(object, args.concat(Array.prototype.slice.call(arguments)));
  }; 
};
```

在查询的时候我发现[MSN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Functions/arguments)上说`Array.prototype.slice`处理`arguments`会导致JS引擎无法优化代码。所以我用ES6写成这样(也不知道对不对，还请指导)。

```javascript
Function.prototype.bind = function () {
  let fn = this, args = Array.from(arguments), object = args.shift()
  return function () {
    return fn.apply(object, args.concat(Array.from(arguments)))
  }
}
```

### 3: Some helper methods that we have

```javascript
assert( true, "I'll pass." ); 
assert( "truey", "So will I." ); 
assert( false, "I'll fail." ); 
assert( null, "So will I." ); 
log( "Just a simple log", "of", "values.", true ); 
error( "I'm an error!" );
```

其实这里没啥特别的东西，就是介绍了控制台的调试函数`console.log`、`console.assert`、`console.error`。

首先介绍`console.log`，就是一个前端打日志的函数，会在控制台里面打出相应的东西。(调试啥的最好别用alert，用log美滋滋)。

```javascript
console.log('hi, world~')  // => 'hi, world~'
console.log('diao', 'jie', 'jie', 'hao', 'OWO')  // => 'diao jie jie hao OWO'

const str = '暴力皮皮'
console.log(str, false)  // => '暴力皮皮 false'
```

然后介绍`console.assert`，assert就是断言的意思啦，接受两个参数，一个用来判断断言为true还是false，后面就是输出的断言。

```javascript
console.assert(true, 'success')
console.assert(false, 'fail', 'some', 'problem')  // => 'fail some problem'
console.assert(null, 'fail', 'null')  // => 'fail null'
console.assert('false', 'ppddm')
```

最后是`console.error`，这个最简单了，就是断言永远为false的assert嘛，直接输出error。

```javascript
console.error('error', 'double~error')  // => 'error double~error'
```

---

## Defining Functions

### 5: What ways can we define functions? 

```javascript
function isNimble(){ return true; } 
var canFly = function(){ return true; }; 
window.isDeadly = function(){ return true; }; 
log(isNimble, canFly, isDeadly);
```

函数的定义在JavaScript有很多种方式，最简单的就是平时在各种编程语言里面最常见的定义方式。

```javascript
function funcName (parameters) {
  [funcBody]
}
```

这是最常见的声明方式，函数声明之后funcName绑定当前作用域，如果是全局就可以通过`window.funcName`来访问。同时，这种声明有几个特点：首先funcName会提升到代码最顶部；并且优于var提升。

其次是函数表达式的声明方式，这也是我经常用的函数声明方式。

```javascript
let funcName = function (parameters) {
  [funcBody]
}
```

当然，这里用var代替let也可以，不过都是ES6了(ES8都快出了)，不如好好学学新特性，用用let和const，同样也避免了变量提升问题和作用域问题。

在ES6里面还有一个新特性，叫箭头函数。顾名思义，箭头函数 + 函数表达式声明如下：

```javascript
let funcName = (parameters) => {
  [funcBody]
}
```

箭头函数可以写得很炫酷，比如下面：

```javascript
let add = (a, b) => {
  return a + b
}

let add = (a, b) => a + b

add(3, 8)  // => 11

// 甚至如果只有一个参数
let doubleVal = a => a + a
doubleVal(12)  // => 24
```

### 6: Does the order of function definition matter?

```javascript
var canFly = function(){ return true; }; 
window.isDeadly = function(){ return true; }; 
assert( isNimble() && canFly() && isDeadly(), "Still works, even though isNimble is moved." ); 
function isNimble(){ return true; }
```

上面第5个问题其实也说了，普通函数声明是会产生提升行为，并且比变量的优先级还要高。所以isNimble会提升到最前面，因此断言为true。而匿名函数(就是没有名字的函数)则没有提示行为。

### 7: Where can assignments be accessed?

```javascript
assert( typeof canFly == "undefined", "canFly doesn't get that benefit." ); 
assert( typeof isDeadly == "undefined", "Nor does isDeadly." ); 
var canFly = function(){ return true; }; 
window.isDeadly = function(){ return true; };
```

还是关于提升的问题，匿名函数不会提升。不过这里canFly作为一个var变量会提升，但是函数声明的位置还是不变。

```javascript
var canFly
/* ... */
canFly = function () { return true }
```

### 8: Can functions be defined below return statements?

```javascript
function stealthCheck(){ 
  assert( stealth(), "We'll never get below the return, but that's OK!" ); 
  return stealth(); 
  function stealth(){ return true; } 
} 
 
stealthCheck();
```

还是函数提升问题，`stealth`函数会提升到`stealthCheck`函数的第一句。

---

## Named Functions

### 10: We can refer to a function, within itself, by its name.

```javascript
function yell(n){ 
  return n > 0 ? yell(n-1) + "a" : "hiy"; 
} 
assert( yell(4) == "hiyaaaa", "Calling the function by itself comes naturally." );
```

简单的递归，不做解释。

### 11: What is the name of a function?

```javascript
var ninja = function myNinja(){ 
  assert( ninja == myNinja, "This function is named two things - at once!" ); 
}; 
ninja(); 
assert( typeof myNinja == "undefined", "But myNinja isn't defined outside of the function." ); 
log( ninja );
```

说实话，第一次看到这种奇葩的写法(~~如果以后遇到谁这样写函数马上拿刀砍人~~)。大概就是这样的函数声明方式下，myNinja这个标识符不在全局作用域下。(**14告诉了我们这样写的好处，果然还是太天真**)

### 12: We can even do it if we're an anonymous function that's an object property.

```javascript
var ninja = { 
  yell: function(n){ 
    return n > 0 ? ninja.yell(n-1) + "a" : "hiy"; 
  } 
}; 
assert( ninja.yell(4) == "hiyaaaa", "A single object isn't too bad, either." );
```

一个简单的递归，不解释。

### 13: But what happens when we remove the original object?

```javascript
var ninja = { 
  yell: function(n){ 
    return n > 0 ? ninja.yell(n-1) + "a" : "hiy";  // 调用ninja.yell
  } 
}; 
assert( ninja.yell(4) == "hiyaaaa", "A single object isn't too bad, either." ); 
 
var samurai = { yell: ninja.yell }; 
var ninja = null; 
 
try { 
  samurai.yell(4);  // 调用samurai.yell, 然后yell调用ninja.yell, ninja为null, exception
} catch(e){ 
  assert( false, "Uh, this isn't good! Where'd ninja.yell go?" ); 
}
```

### 14: Let's give the anonymous function a name!

```javascript
var ninja = { 
  yell: function yell(n){  // 这里的yell提供函数内部一个调用自身的接口
    return n > 0 ? yell(n-1) + "a" : "hiy"; 
  } 
}; 
assert( ninja.yell(4) == "hiyaaaa", "Works as we would expect it to!" ); 
 
var samurai = { yell: ninja.yell }; 
var ninja = {}; 
assert( samurai.yell(4) == "hiyaaaa", "The method correctly calls itself." );
```

原来给匿名函数一个名称，还能有利于递归的实现。

### 15: What if we don't want to give the function a name?

```javascript
var ninja = { 
  yell: function(n){ 
    return n > 0 ? arguments.callee(n-1) + "a" : "hiy";  // arguments.callee指向该函数
  } 
}; 
assert( ninja.yell(4) == "hiyaaaa", "arguments.callee is the function itself." );
```

不过这段代码更diao了，原来`arugments.callee`直接指向函数本身，连加名字用于递归都不需要。

本来到这里应该结束了，然后我手贱去MDN搜了一下啊[arugments.callee](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Functions/arguments/callee)，发现`arguments.callee`从ES5开始在严格模式下已经被禁止使用了。也就是说，`arguments.callee`是标准不建议使用的。

至于为什么不建议使用呢，可以看一下上述链接。不过我也知道了原来给函数表达式命名这个特性是在ES3的时候专门为了取代`arguments.callee`而提出的。

所以说啊，这份资料有点古老了。

---

## Functions as Objects

### 17: How similar are functions and objects?

```javascript
var obj = {}; 
var fn = function(){}; 
assert( obj && fn, "Both the object and function exist." );
```

从第一个问题开始我们就说了，函数的本质就是`Function`的对象。

### 18: How similar are functions and objects?

```javascript
var obj = {}; 
var fn = function(){}; 
obj.prop = "some value"; 
fn.prop = "some value"; 
assert( obj.prop == fn.prop, "Both are objects, both have the property." );
```

### 19: Is it possible to cache the return results from a function?

```javascript
function getElements( name ) { 
  var results; 
 
  if ( getElements.cache[name] ) { 
    results = getElements.cache[name]; 
  } else { 
    results = document.getElementsByTagName(name); 
    getElements.cache[name] = results; 
  } 
 
  return results; 
} 
getElements.cache = {}; 
 
log( "Elements found: ", getElements("pre").length ); 
log( "Cache found: ", getElements.cache.pre.length );
```

这段代码感觉除了要告诉我们函数与对象的相同处，就没别的作用了。

### 20: QUIZ: Can you cache the results of this function?

```javascript
function isPrime( num ) { 
  var prime = num != 1; // Everything but 1 can be prime 
  for ( var i = 2; i < num; i++ ) { 
    if ( num % i == 0 ) { 
      prime = false; 
      break; 
    } 
  } 
  return prime; 
} 
 
assert( isPrime(5), "Make sure the function works, 5 is prime." ); 
assert( isPrime.cache[5], "Is the answer cached?" );
```

### 21: One possible way to cache the results

```javascript
function isPrime( num ) { 
  if ( isPrime.cache[ num ] != null ) 
    return isPrime.cache[ num ]; 
   
  var prime = num != 1; // Everything but 1 can be prime 
  for ( var i = 2; i < num; i++ ) { 
    if ( num % i == 0 ) { 
      prime = false; 
      break; 
    } 
  } 
  
  isPrime.cache[ num ] = prime 
  
  return prime; 
} 
 
isPrime.cache = {}; 
 
assert( isPrime(5), "Make sure the function works, 5 is prime." ); 
assert( isPrime.cache[5], "Make sure the answer is cached." );
```

