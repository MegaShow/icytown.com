---
title: Explore | (a == 1 && a == 2 && a == 3)能否为true?
date: 2018-1-20
categories: Explore
tags:
  - JavaScript
  - Ruby
---

今天在朋友圈看到某大佬转发的关于`(a == 1 && a == 2 && a == 3)`在`JavaScript`上能否为`true`的[文章](https://zhuanlan.zhihu.com/p/33029291)，觉得特别有趣，于是想了解一波。

某国外哥们在面试的时候被问到这个问题，他的回答是`impossible`，而面试官的回答是`nothing is impossible`，然后就没有然后了。

然后这哥们左思右想，决定去`StackOverFlow`上问问到底有什么方法，原帖[在此](https://stackoverflow.com/questions/48270127/can-a-1-a-2-a-3-ever-evaluate-to-true)。

<!-- more -->

## JavaScript

拿到这个问题的时候，我们都知道第一反应是，如果`a`是个普通的变量，那怎么都不可能做到等于1之后马上变成2。(当然，也或许我太菜不知道有没有什么方法)

但是，如果`a`不是一个对象，那就很多可操作性了。阅读了一下`StackOverFlow`的原帖，我决定把上面的一些方法都Copy下来讨论一下。

### #1: ==的非严格相等特性

MDN的[==工作原理](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness#Loose_equality_using)里面有提到，对于`==`的非严格相等比较来说，如果A是Object、B是Number，那么就比较`B === ToPrimitive(A)`。`ToPrimitive(A)`实际上就是尝试依次调用`A.toString()`和`A.valueOf()`。

那么如果我们在`toString()`或者`valueOf()`里面做手脚，自然可以达到上述的效果。

```javascript
let a = {
  val: 1,
  toString: function () {
    return this.val++
  }
}

console.log(a == 1 && a == 2 && a == 3)
```

这里亦可将`toString`改为`valueOf`。

### #2: Array.prototype.join()

这里也是利用了`==`的非严格相等特性，我们上面知道如果类型不一样是会有可能调用`toString()`的，而数组的`toString()`是通过调用`Array.prototype.join()`来获取字符串的。如果我们修改了该函数，那一样可以达到题目效果。

```javascript
let a = [ 1, 2, 3 ]
a.join = a.shift

console.log(a == 1 && a == 2 && a == 3)
```

这里利用了`shift`依次删除数组头部元素。

### #3: Symbol.toPrimitive

还是`==`，上面我们说了比较实际上是`B === ToPrimitive(A)`。我们直接修改`a`的`toPrimitive`，也可以达到这样的效果。

```javascript
let a = { [Symbol.toPrimitive]: ((i) => () => i++)(1) }

console.log(a == 1 && a == 2 && a == 3)
```

第一行代码看起来或许有点变扭，我一开始也没看懂什么意思。不过，我们知道`[Symbol.toPrimitive]`是一个函数，这里的代码本质上是做了一个闭包，然后返回一个函数。我们或许可以这样写：

```javascript
let a = {
  [Symbol.toPrimitive]: (function (i) {
    return function () {
      return i++
    }
  })(1)
}

console.log(a == 1 && a == 2 && a == 3)
```

### #4: get访问器

```javascript
with ({
  val: 1,
  get a() {
    return this.val++
  }
}) {
  console.log(a == 1 && a == 2 && a == 3)
}
```

这里利用了`get访问器`使得`a`可以直接访问对象里面的`val`，然后再通过`with`关键词使得该对象的所有成员都在该作用域下，无需通过对象来访问成员。

当然，`with`关键词的使用会导致代码无法优化，使得运行效率下降。

### Extend: 精度

在阅读这个问题的答案的时候，有一个回答令我眼前一亮，不过这个回答不是针对于使得`a == 1 && a == 2 && a == 3`为`true`的。代码如下：

```javascript
let a = 100000000000000000

console.log(a === a + 1 && a === a + 2 && a === a + 3)
```

这段代码利用了精度的问题，使得上述表达式为真。说实话，我还是第一次看到精度还能这样用。果然还是学识浅薄，果然还是太菜了。

## Ruby

看到这个问题的时候，我的第一个反应就是运算符重载。不过题目给的是`JavaScript`，也没想出什么方法。不过`Ruby`就爽了，毕竟，一切皆为对象。什么运算符什么都是虚的，本来就是方法嘛，我对方法修改就好了嘛。

```ruby
class Fixnum < Integer
  def ==(o)
    true
  end
end

a = 1
puts a == 1 && a == 2 && a == 3
```

然后美滋滋地输出了`true`。

当然，`Ruby`还有别的奇怪的方法，有空再来补充。

---

如果你有别的好的方法，不妨交流一下！（逃

