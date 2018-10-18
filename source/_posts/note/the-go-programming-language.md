---
title: Note | The Go Programming Language
date: 2018-5-18
categories: Note
comments: false
tags: Go
---

《Go语言圣经》，可在GitBook阅读。

<!-- more -->

# 第一章 入门

本章介绍Go语言的基本组件。

## 1.1 Hello, World

```go
// hiworld.go
package main

import "fmt"

func main() {
	fmt.Println("Hi, world")
}
```

Go是一门编译型语言，下面的命令将执行编译、链接并最终运行的过程。

```sh
$ go run hiworld.go
```

或者可以build生成可执行文件。

```sh
$ go build hiworld.go
```

Go语言原生支持Unicode。Go语言的代码通过**包(package)**组织，包类似于其它语言里的库(libraries)或者模块(modules)。一个包由位于单个目录下的一个或多个`.go`源代码文件组成，目录定义包的作用。每个源文件以`package`声明语句开始，表示该文件属于哪个包。`import`就是导入其它包。

Go的标准库提供了100多个包，比如`fmt`含有格式化输出、输入的函数。`Println`可以打印以空格间隔的一个或者多个值，并在最后添加一个换行符。

`main`包比较特殊，它定义了一个独立可执行的程序，而不是一个库。`main`里面的`main`函数是整个程序执行时的入口。

Go编译没有警告信息，如果代码中缺少了必要的包或者导入了不需要的包，程序都没法编译通过。`import`声明必须跟在文件的`package`之后，然后是函数(`func`)、变量(`var`)、常量(`const`)、类型(`type`)。

一个函数的声明由`func`关键词、函数名、参数列表、返回值列表以及函数体组成。Go不需要在语句末尾添加分号，除非一行有多条语句。实际上，编译器会主动把特定符号后面的换行符转换成分号，因此换行符的位置会影响Go代码的正确解析。比如，函数的左括号`{`必须和`func`在同一行，而`x + y`中，可在`+`后换行，不能在`+`之前换行。

`gofmt`工具把代码格式化为标准格式，并且不接受任何参数，即表明标准格式只有一种。

## 1.2 命令行参数

`os`包以跨平台的方式，提供了一些与操作系统交互的函数和变量。`os.Args`变量是一个字符串(string)的**切片(slice)**。如果把切片`s`当成数组元素序列，那么`s[i]`可以访问单个元素，而`s[m:n]`可以获取子序列，序列的元素数目是`len(s)`。Go语言的区间索引与大多数编程语言类似，采用了左闭右开形式。(比如`a = [1, 2, 3, 4, 5]`，`a[0:3] = [1, 2, 3]`)

`os.Args[0]`是命令本身的名字，其它元素则是程序启动时传给它的参数。如果省略切片表达式`s[m:n]`的`m`或者`n`，会默认传入`0`或者`len(s)`。

```go
// echo.go
package main

import (
	"fmt"
	"os"
)

func main() {
	echo1()
}

func echo1() {
	var s, sep string
	for i := 1; i < len(os.Args); i++ {
		s += sep + os.Args[i]
		sep = " "
	}
	fmt.Println("Echo1:", s)
}
```

Go的注释语句以`//`开头。`var`声明定义了两个`string`类型的变量，变量会在声明时直接初始化。如果变量没有显式初始化，则被隐式地赋予其类型地**零值(zero value)**。

符号`:=`是**短变量声明(short variable declaration)**的一部分，赋予初始化值。`i++`是语句，并不是表达式，所以`j = i++`是非法的，而且`++`和`--`只能放在变量名后面，`--i`也非法。

Go语言只有`for`循环这一种循环语句，不过有多种形式。`initialization`必须是一条简单语句(simple statement)，比如短变量声明、自增语句、赋值语句或函数调用。`condition`是一个布尔表达式(boolean expression)。

```go
for initialization; condition; post {
	// zero or more statements
}
```

`for`循环的每一个部分都可以省略，如果省略了`initialization`和`post`，如下：

```go
for condition {
	// ...
}
```

如果连`condition`也省略了，就变成了一个无限循环。不过，依然可以用`break`和`return`终止循环。

```go
for {
	// ...
}
```

`for`循环的另一种形式，在某种数据类型的区间(range)上遍历，如字符串或切片。

```go
func echo2() {
	s, sep := "", ""
	for _, arg := range os.Args[1:] {
		s += sep + arg
		sep = " "
	}
	fmt.Println("Echo2:", s)
}
```

每次循环迭代，`range`产生一对值：索引、该索引处的元素值。该例子不需要索引，但是`range`必须产生一对值，不能忽视索引。然而Go语言不允许使用无用的局部变量(local variables)，会编译错误。Go里面可以利用**空标识符(blank identifier)**来实现unused，即`_`下划线。上述程序隐式地而非显式地索引`os.Args`，是更值得提倡的。

```go
s := ""
var s string
var s = ""
var s string = ""
```

上述四种方式都是等价的。第一种形式，短变量声明只能用在函数内部，而不能用于包变量；第二种形式依赖于字符串的默认初始化零值机制；第三种形式用的少，除非同时声明多个变量；第四种形式显式标明变量类型，当变量类型与初值类型不同时所必须的。实践中常用前两种。

上述两种情况的开销都很大，因为`+=`生成新的字符串，而旧的字符串要等待`GC`进行垃圾回收。一种简单且高效的解决方案是使用`strings`包的`Join`函数。

```go
func echo3() {
	fmt.Println("Echo3:", strings.Join(os.Args[1:], " "))
}
```

当然，也可以直接输出切片，不过这样格式就跟上面的不一致了。

```go
func echo4() {
	fmt.Println("Echo4:", os.Args[1:])
}
```

## 1.3 查找重复的行

本节我们实现名为`dup`的程序，灵感来源于UNIX里面的`uniq`命令，用于寻找相邻的重复行。

`dup`的第一个版本打印标准输入中多次出现的行，以重复次数开头。

```go
// dup.go
package main

import (
	"bufio"
	"fmt"
	"os"
)

func main() {
	counts := make(map[string]int)
	input := bufio.NewScanner(os.Stdin)
	for input.Scan() {
		counts[input.Text()]++
	}
	// Note: ignoring potential errors from input.Err()
	for line, n := range counts {
		if n > 1 {
			fmt.Printf("%d\t%s\n", n, line)
		}
	}
}
```

`map`存储了键/值(key/value)的集合，对集合元素提供了常数时间级别的存、取、测试操作。键可以是任意类型，只要其值能用`==`运算符比较；值可以是任意类型。内置函数`make`可以用于创建空`map`。`map`的迭代顺序并不确定，即使输入一样，输出顺序也不一定一样。

程序利用短变量声明创建了`bufio.Scanner`类型的变量`input`。该变量从程序的标准输入中读取内容，每次调用`input.Scanner`，即读入下一行。读取的内容可以调用`input.Text()`来得到，`Scan`函数读到一行时返回`true`，无输入返回`false`。

`Printf`的转换被Go程序员称为动词(verb)。

```
%b, %o, %d, %x  二进制、八进制、十进制、十六进制 
%f, %g, %e      浮点数: 3.141593、3.141592653589793、3.141593e+00
%t              布尔：true false
%c              字符(rune): Unicode码点
%s              字符串
%q              带双引号的字符串"abc"或带单引号的字符'a'
%v              变量的自然形式(natural format)
%T              变量的类型
```

下面实现`dup`既能输入`Stdin`，又能指定文件名来操作。

```go
// dup.go
package main

import (
	"bufio"
	"fmt"
	"os"
)

func main() {
	counts := make(map[string]int)
	files := os.Args[1:]
	if len(files) == 0 {
		countLines(os.Stdin, counts)
	} else {
		for _, arg := range files {
			f, err := os.Open(arg)
			if err != nil {
				fmt.Fprintf(os.Stderr, "dup: %v\n", err)
				continue
			}
			countLines(f, counts)
			f.Close()
		}
	}
	for line, n := range counts {
		if n > 1 {
			fmt.Printf("%d\t%s\n", n, line)
		}
	}
}

func countLines(f *os.File, counts map[string]int) {
	input := bufio.NewScanner(f)
	for input.Scan() {
		counts[input.Text()]++
	}
	// NOTE: ignoring potential errors from input.Err()
}
```

`os.Open`函数返回两个值，一个是被打开的文件`*os.File`，一个是内置的`error`类型的值。如果`err`等于`nil`，那么文件被成功打开。

`map`是一个由`make`函数创建的数据结构的引用，类似C++里面的引用传递。

`dup`的前两个版本都是以“流”模式读取输入的，并根据需要拆分成多个行。还有另一种方法是一口气把全部输入数据读到内存中，一次分割为多行，然后处理它们。这里 需要引入`ReadFile`函数，其来自`io/ioutil`包，然后利用`strings.Split`分割成切片。由于`ReadFile`需要文件名作为参数，所以没法处理标准输入。

```go
// dup.go
package main

import (
	"bufio"
	"fmt"
	"io/ioutil"
	"os"
	"strings"
)

func main() {
	counts := make(map[string]int)
	files := os.Args[1:]
	if len(files) == 0 {
		input := bufio.NewScanner(os.Stdin)
		for input.Scan() {
			counts[input.Text()]++
		}
	} else {
		for _, arg := range files {
			data, err := ioutil.ReadFile(arg)
			if err != nil {
				fmt.Fprintf(os.Stderr, "dup: %v\n", err)
				continue
			}
			for _, line := range strings.Split(string(data), "\n") {
				counts[line]++
			}
		}
	}
	for line, n := range counts {
		if n > 1 {
			fmt.Printf("%d\t%s\n", n, line)
		}
	}
}
```

实际上，`bufio.Scanner`、`ioutil.ReadFile`和`ioutil.WriteFile`都使用`*os.File`的`Read`和`Write`方法。

## 1.4 GIF动画

此代码无法生成在Windows照片上打开的GIF，不知道原因，不想学，略过此节。

```go
// Lissajous generates GIF animations of random Lissajous figures.
package main

import (
    "image"
    "image/color"
    "image/gif"
    "io"
    "math"
    "math/rand"
    "os"
)

var palette = []color.Color{color.White, color.Black}

const (
    whiteIndex = 0 // first color in palette
    blackIndex = 1 // next color in palette
)

func main() {
    // The sequence of images is deterministic unless we seed
    // the pseudo-random number generator using the current time.
    // Thanks to Randall McPherson for pointing out the omission.
    rand.Seed(time.Now().UTC().UnixNano())
    lissajous(os.Stdout)
}

func lissajous(out io.Writer) {
    const (
        cycles  = 5     // number of complete x oscillator revolutions
        res     = 0.001 // angular resolution
        size    = 100   // image canvas covers [-size..+size]
        nframes = 64    // number of animation frames
        delay   = 8     // delay between frames in 10ms units
    )

    freq := rand.Float64() * 3.0 // relative frequency of y oscillator
    anim := gif.GIF{LoopCount: nframes}
    phase := 0.0 // phase difference
    for i := 0; i < nframes; i++ {
        rect := image.Rect(0, 0, 2*size+1, 2*size+1)
        img := image.NewPaletted(rect, palette)
        for t := 0.0; t < cycles*2*math.Pi; t += res {
            x := math.Sin(t)
            y := math.Sin(t*freq + phase)
            img.SetColorIndex(size+int(x*size+0.5), size+int(y*size+0.5),
                blackIndex)
        }
        phase += 0.1
        anim.Delay = append(anim.Delay, delay)
        anim.Image = append(anim.Image, img)
    }
    gif.EncodeAll(out, &anim) // NOTE: ignoring encoding errors
}
```

## 1.5 获取URL

```go
package main

import (
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
)

func main() {
	for _, url := range os.Args[1:] {
		res, err := http.Get(url)
		if err != nil {
			fmt.Fprintf(os.Stderr, "fetch: %v\n", err)
			os.Exit(1)
		}
		body, err := ioutil.ReadAll(res.Body)
		res.Body.Close()
		if err != nil {
			fmt.Fprintf(os.Stderr, "fetch: reading %s: %v\n", url, err)
			os.Exit(1)
		}
		fmt.Printf("%s", body)
	}
}
```

## 1.6 并发获取多个URL

```go
package main

import (
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"os"
	"time"
)

func main() {
	start := time.Now()
	ch := make(chan string)
	for _, url := range os.Args[1:] {
		go fetch(url, ch)
	}
	for range os.Args[1:] {
		fmt.Println(<-ch)
	}
	fmt.Printf("%.2fs elapsed\n", time.Since(start).Seconds())
}

func fetch(url string, ch chan<- string) {
	start := time.Now()
	res, err := http.Get(url)
	if err != nil {
		ch <- fmt.Sprint(err)
		return
	}
	nbytes, err := io.Copy(ioutil.Discard, res.Body)
	res.Body.Close()
	if err != nil {
		ch <- fmt.Sprintf("while reading %s: %v", url, err)
		return
	}
	secs := time.Since(start).Seconds()
	ch <- fmt.Sprintf("%.2fs %7d %s", secs, nbytes, url)
}
```

`goroutine`是一种函数的并发执行方式，而`channel`是用来在`goroutine`之间进行参数传递。main函数本身也运行在一个`goroutine`中。

`io.Discard`输出流是一个垃圾桶，可以向里面写一些不需要的数据，因为我们需要这个方法返回的字节数，但是又不想要其内容。(不可以直接获取Body的字节数？)

## 1.7 Web服务

```go
package main

import (
	"fmt"
	"log"
	"net/http"
)

func main() {
	http.HandleFunc("/", handler)
	log.Fatal(http.ListenAndServe("localhost:8000", nil))
}

func handler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "URL.Path = %q\n", r.URL.Path)
}
```

```go
package main

import (
	"fmt"
	"log"
	"net/http"
	"sync"
)

var mu sync.Mutex
var count int

func main() {
	http.HandleFunc("/", handler)
	http.HandleFunc("/count", counter)
	log.Fatal(http.ListenAndServe("localhost:8000", nil))
}

func handler(w http.ResponseWriter, r *http.Request) {
	mu.Lock()
	count++
	mu.Unlock()
	fmt.Fprintf(w, "URL.Path = %q\n", r.URL.Path)
}

func counter(w http.ResponseWriter, r *http.Request) {
	mu.Lock()
	fmt.Fprintf(w, "Count %d\n", count)
	mu.Unlock()
}
```

## 1.8 本章要点

**控制流**：

```go
switch statement {
case statement1:
    //
case statement2:
    //
default:
    //
}
```

Go不需要显式地在每一个case后写break，语言默认执行完case后地逻辑语句会自动退出。如果想要相邻地几个case都执行同一逻辑，需要显式地写上一个`fallthrough`语句来覆盖这种默认行为。

Go的switch也可以不带操作对象，默认用true值代替：

```go
func Signum(x int) int {
    switch {
    case x > 0:
      	return +1
    default:
        return 0
    case x < 0:
        return -1
    }
}
```

**命名类型**：

```go
type Point struct {
    X, Y int
}

var p Point
```

**指针**：指针是一种直接存储变量的内存地址的数据类型，`&`操作符可以返回一个变量的内存地址，`*`操作符可以获取指针指向的变量内容。但是Go里面没有指针运算。

**方法和接口**：方法是和命名类型关联的一类函数，Go语言里比较特殊的是方法可以被关联到任意一种命名类型。接口是一种抽象类型，这种类型可以让我们以同样的方式来处理不同的固有类型，不用关系它们的具体实现。

# 第二章 程序结构

本章深入讨论Go程序基础结构方面的一些细节。

## 2.1 命名

Go有25个关键词和30个预定义名词：

```go
break      default       func     interface   select
case       defer         go       map         struct
chan       else          goto     package     switch
const      fallthrough   if       range       type
continue   for           import   return      var
```

```go
内建常量: true false iota nil

内建类型: int int8 int16 int32 int64
          uint uint8 uint16 uint32 uint64 uintptr
          float32 float64 complex128 complex64
          bool byte rune string error

内建函数: make len cap new append copy close delete
          complex real imag
          panic recover
```

内部预定义的名字并不是关键词，可以在定义中重新使用它们。

名字的开头字母的大小写决定了名字在包外的可见性。字是大写字母开头的，那么将是导出的。包本身的名字一般总是用小写字母。

推荐使用**驼峰式**命名。

## 2.2 声明

Go语言有四种类型的声明语句：`var`、`const`、`type`、`func`，分别对应变量、常量、类型、函数实体对象的声明。

## 2.3 变量

```go
var 变量名字 类型 = 表达式
```

其中“类型”或“=表达式”两个部分可以省略其中一个部分，省略类型信息将根据初始化表达式来推导变量的类型信息，省略初始化表达式将用零值初始化该变量。

在函数内部，有一种称为简短变量声明语句`:=`的形式课用于声明和初始化局部变量。

```go
i, j = j, i // 交换i和j的值
```

简短变量声明左边的变量可能并不是全部都是刚刚声明的，如果有一些已经在相同的词法域声明过了，那么简短变量声明语句对这些已经声明过的变量就只有赋值行为了。但是至少要声明一个新的变量：

```go
// true
in, err := os.Open(infile)
out, err := os.Create(outfile)

// error
f, err := os.Open(infile)
f, err := os.Create(outfile)
```

变量有时候被称为可寻址的值，即使变量由表达式临时生成，也必须能接受`&`取地址操作。任何类型的指针的零值都是`nil`。

在Go语言中，返回函数中局部变量的地址也是安全的。

指针式实现标准库中`flag`包的关键技术。

```go
package main

import (
	"flag"
	"fmt"
	"strings"
)

var n = flag.Bool("n", false, "omit trailing newline")
var sep = flag.String("s", " ", "separator")

func main() {
	flag.Parse()
	fmt.Print(strings.Join(flag.Args(), *sep))
	if !*n {
		fmt.Println()
	}
}
```

另一个创建变量的方法是调用内建的new函数，表达式`new(T)`将创建一个T类型的匿名变量，初始化为T类型的零值，然后返回变量地址。new函数类似是一种语法糖，而不是一个新的基础概念。

```go
func newInt() *int {
    return new(int)
}

func newInt() *int {
    var dummy int
    return &dummy
}
```

如果两个类型都是空的，类型大小为0，例如`struct{}`和`[0]int`，调用new函数可能返回相同的地址。请谨慎使用大小为0的类型，因为如果类型的大小为0的话，可能导致Go的自动垃圾回收器有不同的行为，详情看`runtime.SetFinalizer`。

new不是关键词，只是一个预定义的函数。

函数的右小括号可以另起一行缩进，为了防止编译器在行尾自动插入分号，可以在末尾参数变量后面显式插入逗号。

```go
fmt.Print(
    string.Join(flag.Args()),
    *sep, // 逗号不会报错
)
```

编译器会自动选择在栈上还是在堆上分配局部变量的内存空间，但这个选择并不是由`var`还是`new`声明变量的方式决定的。局部变量可以从函数中逃逸出来，变成全局可达。

## 2.4 赋值

* 普通赋值：等号赋值、自增自减语句
* 元组赋值：允许同时更新多个变量的值

map查找、类型断言、通道接收可能产生两个结果，有一个额外的布尔结果来表示操作是否成功。

```go
v, ok = m[key]
v, ok = x.(T)
v, ok = <-ch

v = m[key] // 失败时返回零值
v = x.(T)  // 失败时panic异常
v = <-ch   // 失败时返回零值(阻塞不算失败)

_, ok = m[key]        // map返回2个值
_, ok = m[key], false // map返回1个值
_ = m[key]            // map返回1个值
```

map和chan有隐式赋值行为。对于任何类型的值的相等比较，第二个值必须是对第一个值类型对应的变量是可赋值的。

## 2.5 类型

```go
type 类型名字 底层类型
```

新命名的类型提供了一个方法，用来分隔不同概念的类型，这样即使它们底层类型相同也是不兼容的。与底层类型相互赋值时，需要用上类型显式转换。

比较运算符只能用来比较相同类型的变量。

命名类型可以为该类型定义新的行为，这些行为表示为一组关联到该类型的函数集合，我们称为类型的方法集。

```go
type Celsius float64

func (c Celsius) String() string {
    return fmt.Sprintf("%g°C", c)
}

var c Celsius = 26.1
fmt.Println(c.String())
```

## 2.6 包和文件

Go语言中的包和其他语言的库或者模块的概念类似，目的都是为了支持模块化、封装、单独编译和代码复用。包可以让我们通过控制哪些名字是外部可见的来隐藏内部实现信息。

包注释的第一句应该先是包的功能概要说明，一个包通常只有一个源文件有包注释，如果有多个包注释，文档工具会更具源文件名的先后顺序将它们链接为一个包注释。如果包注释很大，通常会放到一个独立的`doc.go`文件中。

如果导入了一个包，但是没有使用该包，这会被当成一个编译错误处理。

可以用一个特殊的`init`初始化函数来简化初始化的工作，每个文件都可以包含多个`init`初始化函数。初始化函数除了不能被调用或引用外，其他行为和普通函数类似。

```go
package main

import (
	"fmt"
)

var pc [256]byte = func() (pc [256]byte) {
	for i, _ := range pc {
		pc[i] = pc[i/2] + byte(i&1)
	}
	return
}()

// 	func init() {
//		for i, _ := range pc {
//	 		pc[i] = pc[i/2] + byte(i&1)
//		}
// 	}

func popCount(x uint64) int {
	return int(pc[byte(x>>(0*8))] +
		pc[byte(x>>(1*8))] +
		pc[byte(x>>(2*8))] +
		pc[byte(x>>(3*8))] +
		pc[byte(x>>(4*8))] +
		pc[byte(x>>(5*8))] +
		pc[byte(x>>(6*8))] +
		pc[byte(x>>(7*8))])
}

func main() {
	fmt.Printf("%d", popCount(126))
}
```

## 2.7 作用域

作用域不是生命周期。声明语句的作用于对应是一个源代码的文本区域，是一个编译时属性。而变量的生命周期是指程序运行时变量存在的有效时间段，是一个运行时的概念。

# 第三章 基础数据结构

Go语言将数据类型分为四类：基础类型、复合类型、引用类型和接口类型。本章介绍基础类型，包括：数字、字符串、布尔型。

## 3.1 整型

Go语言同时提供了有符号和无符号类型的整数运算。有符号类型`int8`、`int16`、`int32`、`int64`，无符号类型`uint8`、`uint16`、`uint32`、`uint64`。这里还有两种一般对应特定CPU平台机器字大小的有符号和无符号类型`int`、`uint`。

Unicode字符`rune`类型是和`int32`等价的类型，通常用来表示一个Unicode码点。`byte`是`uint8`类型的等价类型。

无符号整数类型`uintptr`没有指定具体的bit大小，但是足以容纳指针。`uintptr`类型只有在底层编程时才需要，特别是Go语言和C语言函数库或操作系统接口相交互的地方。

Go语言的算术运算、逻辑运算、比较运算，按优先级递减的顺序排列：(五种优先级)

```go
*      /      %      <<       >>     &       &^
+      -      |      ^
==     !=     <      <=       >      >=
&&
||
```

在Go语言中，`%`取模运算符的符号和被取模数的符号总是一致的，`-5%3`和`-5%-3`的结果都是-2。

`+`和`-`可以是一元运算符，移位运算符决定移位的参数必须是无符号数。

```go
&      位运算 AND
|      位运算 OR
^      位运算 XOR
&^     位清空 (AND NOT)
<<     左移
>>     右移
```

内置的`len`函数返回的是一个有符号`int`，可以处理逆序循环。

`%`后加`[1]`副词告诉`Printf`函数再次使用第一个操作数。

字符使用`%c`参数打印，或者使用`%q`参数打印带单引号的字符。

## 3.2 浮点数

Go语言提供了两种精度的浮点数，`float32`和`float64`。浮点数的范围极限值可以在`math`包找到，常量`math.MaxFloat32`表示`float32`能表示的最大数值，`math.MaxFloat64`表示`float64`能表示的最大数值。

通常优先使用`float64`类型，因为`float32`类型的累计计算误差很容易扩散。

`math.IsNaN`函数用于测试一个数是否是非数NaN，`math.NaN`返回非数对应的值，非数和任何数都是不相等的，非数和非数也是不相等的。

```go
package main

import (
	"fmt"
	"math"
	"os"
)

const (
	width, height = 600, 320            // canvas size in pixels
	cells         = 100                 // number of grid cells
	xyrange       = 30.0                // axis ranges (-xyrange..+xyrange)
	xyscale       = width / 2 / xyrange // pixels per x or y unit
	zscale        = height * 0.4        // pixels per z unit
	angle         = math.Pi / 6         // angle of x, y axes (=30°)
)

var sin30, cos30 = math.Sin(angle), math.Cos(angle) // sin(30°), cos(30°)

func main() {
	file, err := os.Create("a.svg")
	if err != nil {
		fmt.Println(err.Error())
		return
	}
	fmt.Fprintf(file, "<svg xmlns='http://www.w3.org/2000/svg' "+
		"style='stroke: grey; fill: white; stroke-width: 0.7' "+
		"width='%d' height='%d'>", width, height)
	for i := 0; i < cells; i++ {
		for j := 0; j < cells; j++ {
			ax, ay := corner(i+1, j)
			bx, by := corner(i, j)
			cx, cy := corner(i, j+1)
			dx, dy := corner(i+1, j+1)
			fmt.Fprintf(file, "<polygon points='%g,%g %g,%g %g,%g %g,%g'/>\n",
				ax, ay, bx, by, cx, cy, dx, dy)
		}
	}
	fmt.Fprintln(file, "</svg>")
}

func corner(i, j int) (float64, float64) {
	// Find point (x,y) at corner of cell (i,j).
	x := xyrange * (float64(i)/cells - 0.5)
	y := xyrange * (float64(j)/cells - 0.5)

	// Compute surface height z.
	z := f(x, y)

	// Project (x,y,z) isometrically onto 2-D SVG canvas (sx,sy).
	sx := width/2 + (x-y)*cos30*xyscale
	sy := height/2 + (x+y)*sin30*xyscale - z*zscale
	return sx, sy
}

func f(x, y float64) float64 {
	r := math.Hypot(x, y) // distance from (0,0)
	return math.Sin(r) / r
}
```

## 3.3 复数

Go提供了两种精度的复数类型，`complex64`和`complex128`，分别对应`float32`、`float64`两种浮点数精度。内置的`complex`函数用于构建复数，内建的`real`和`imag`函数分别返回复数的实部和虚部。

```go
var x complex128 = complex(1, 2) // 1 + 2i

x := 1 + 2i
```

复数可以用`==`和`!=`进行相等比较，但是浮点数的相等比较是危险的。

## 3.4 布尔型

布尔类型的值只有两种，`true`、`false`，布尔值并不会隐式转换为数字值0或1，反之亦然。

## 3.5 字符串

一个字符串是一个不可改变的字节序列。字符串可以包含任意的数据，包括`byte`值0，文本字符串通常被解释为采用UTF8编码的Unicode码点(`rune`)序列。

内置的`len`函数可以返回一个字符串种的字节数目(不是`rune`字符数目)，如果试图访问超出字符串索引范围的字节将会导致panic异常。字符串不可修改，因此尝试修改字符串内部数据的操作也是被禁止的。

```go
s[0] = 'L' // compile error: cannot assign to s[0]
```

不变性意味如果两个字符串共享相同的底层数据的话也是安全的，这使得复制任何长度的字符串代价是低廉的。同样，一个字符串s和对应的子字符串切片s[7:]的操作也可以安全地共享相同的内存，因此字符串切片操作代价也是低廉的。在这两种情况下都没有必要分配新的内存。

一个原生的字符串面值形式是反引号，原生字符串面值用于编写正则表达式会很方便，因为正则表达式往往包含很多反斜杠。

`rune`是`int32`的等价类型，这种编码方式叫UTF-32或UCS-4。

标准库中有四个包对字符串处理尤为重要：`bytes`、`strings`、`strconv`和`unicode`包。

## 3.6 常量

常量表达式的值在编译期计算，而不是在运行期。当操作数是常量时，一些运行时的错误也可以在编译时被发现，例如整数除零、字符串索引越界、无效浮点数操作。

对常量的类型转换操作或以下函数调用都是返回常量结果：`len`、`cap`、`real`、`imag`、`complex`和`unsafe.Sizeof`。

如果是批量声明的常量，除了第一个外其它的常量右边的初始化表达式都可以省略，如果省略初始化表达式则表示使用前面常量的初始化表达式写法，对应的常量类型也一样的。

常量声明可以使用`iota`常量生成器初始化，它用于生成一组以相似规则初始化的常量，但不用每行都写一遍初始化表达式，第一个常量值为0，每行加一。在其他语言中，这种类型称为枚举类型。

```go
type Weekday int

const (
    Sunday Weekday = iota
    Monday
    Tuesday
    Wednesday
    Thursday
    Friday
    Saturday
)
```

也可以在复杂的常量表达式中使用iota：

```go
type Flags uint

const (
    FlagUp Flags = 1 << iota // is up
    FlagBroadcast            // supports broadcast access capability
    FlagLoopback             // is a loopback interface
    FlagPointToPoint         // belongs to a point-to-point link
    FlagMulticast            // supports multicast access capability
)
```

无类型的常量至少有256bit的运算精度，有6种未明确类型的常量类型，分别是无类型的布尔型、无类型的整型、无类型的字符、无类型的浮点型、无类型的复数、无类型的字符串。

# 第四章 复合数据类型

本章主要讨论四种类型：数组、slice、map和结构体。

## 4.1 数组

数组是一个由固定长度的特定类型元素组成的序列，一个数组可以由零个或多个元素组成。和数组对应的类型是slice(切片)，它是可以增长和收缩的动态序列。

在数组字面值种，如果在数组的长度位置出现的是`...`，则表示数组的长度是根据初始值计算的。

```go
q := [...]int{1, 2, 3}
fmt.Printf("%T\n", q) // "[3]int"
```

数组也可以指定一个索引和对应值列表的方法初始化：

```go
r := [...]int{99: -1}
```

如果一个数组的元素类型是可以相互比较的，那么数组类型也是可以相互比较的。

## 4.2 Slice

Slice(切片)代表变成的序列，序列中每个元素都有相同的类型。内置的`len`和`cap`函数分别返回slice的长度和容量，slice的切片操作`s[i:j]`用于创建一个新的slice。

与数组不同的是，slice之间不能比较，不过标准库提供了高度优化的`bytes.Equal`函数来判断两个字节型slice是否相等([]byte)，但是对于其他类型的slice，我们必须自己展开元素进行比较。slice不支持比较的第一个原因是slice的元素是间接引用的，一个slice甚至可以包含自身；第二个原因因为slice的元素是间接引用的，一个固定的slice值在不同时刻可能包含不同的元素，因为底层数组的元素可能会被修改。

slice唯一合法的比较操作时和`nil`比较。一个零值的slice等于nil，但是非nil值的slice的长度和容量也可能是0。

内置的`make`函数创建一个指定元素类型、长度和容量的slice，容量部分可以省略。

```go
make([]T, len)
make([]T, len, cap) // same as make([]T, cap)[:len]
```

内置的`append`函数用于向slice追加元素。

## 4.3 Map

哈希表是一个无序的key/value对的集合，其中所有的key都是不同的。在Go语言中，一个map就是一个哈希表的引用，map类型可以写为`map[K]V`。

K对应的key必须是支持==比较运算符的数据类型，所以map可以通过测试key是否相等来判断是否已经存在。虽然浮点数类型也是支持相等运算符比较的，但是NaN和任何浮点数都不相等。

```go
ages := make(map[string]int) // mapping from strings to ints

ages := map[string]int{
    "alice":   31,
    "charlie": 34,
}
```

可以使用内置的`delete`函数删除元素：

```go
delete(ages, "alice") // remove element ages["alice"]
```

map中的元素并不是一个变量，因此我们不能对map的元素进行取址操作。禁止取址的原因是map可能随着元素数量的增长而重新分配更大的内存空间，从而可能导致之前的地址无效。

map类型的零值是nil，也就是没有引用任何哈希表。

Go语言中并没有提供一个set类型，但是可以用map来实现类似set的功能。

## 4.4 结构体

结构体是一种聚合的数据结构，是由零个或多个任意类型的值聚合成的实体。每个值称为结构体的成员。

```go
type Employee struct {
    ID        int
    Name      string
    Address   string
    DoB       time.Time
    Position  string
    Salary    int
    ManagerID int
}

var dilbert Employee
```

点操作符也可以和指向结构体的指针一起工作：

```go
var employeeOfTheMonth *Employee = &dilbert
employeeOfTheMonth.Position += " (proactive team player)"

(*employeeOfTheMonth).Position += " (proactive team player)"
```

如果结构体成员名字是以大写字母开头的，那么该成员就是导出的，一个结构体可能同时包含导出和未导出的成员。

Go语言由一个特性让我们只声明一个成员对应的数据类型而不指明成员的名字，这类成员就叫匿名成员。匿名成员的数据类型必须是命名的类型或指向一个命名的类型指针。

```go
type Point struct {
    X, Y int
}

type Circle struct {
    Point
    Radius int
}

type Wheel struct {
    Circle
    Spokes int
}

var w Wheel
w.X = 8            // equivalent to w.Circle.Point.X = 8
w.Y = 8            // equivalent to w.Circle.Point.Y = 8
w.Radius = 5       // equivalent to w.Circle.Radius = 5
w.Spokes = 20
```

在右边注释中给出的显式形式访问这些叶子成员的语法依然有效，因此匿名成员并不是真的无法访问了。结构体字面值并没有简短表示匿名成员的语法，必须遵循形状类型声明时的结构：

```go
w = Wheel{Circle{Point{8, 8}, 5}, 20}

w = Wheel{
    Circle: Circle{
        Point:  Point{X: 8, Y: 8},
        Radius: 5,
    },
    Spokes: 20, // NOTE: trailing comma necessary here (and at Radius)
}
```

因为匿名成员也有一个隐式的名字，因此不能同时包含两个类型相同的匿名成员，这会导致名字冲突。

匿名成员并不要求时结构体类型，其实任何命名的类型都可以作为结构体的匿名成员。实际上，外层的结构体不仅仅时获得了匿名成员类型的所有成员，而且也获得了该类型导出的全部的方法。

## 4.5 JSON

Go语言对JSON、XML、ASN.1等类似的协议有良好的支持，由标准库`encoding/json`、`encodig/xml`、`encoding/asn1`等包提供支持。

将Go语言中结构体slice转为JSON的过程叫编组(marshaling)，编组通过调用`json.Marshal`函数完成，另一个`json.MarshalIndent`函数将产生整齐缩进的输出。在编码时，默认使用Go语言结构体的成员名字作为JSON的对象(通过reflect反射技术)，只有导出的结构体成员才会被编码。

结构体成员Tag是在编译阶段关联到该成员的元信息字符串：

```go
type Movie struct {
    Title  string
    Year   int  `json:"released"`
    Color  bool `json:"color,omitempty"`
    Actors []string
}
```

`omitempty`表示当Go语言结构体成员为空或零值时不生成JSON对象。

解码通过`json.Unmarshal`函数完成，可以选择性地解码JSON中感兴趣地成员。

基于流式编码解码：`json.Encoder`、`json.Decoder`。

## 4.6 文本和HTML模板

`text/template`和`html/template`等模板包提供了一个将变量值填充到一个文本或HTML格式地模板的机制。

一个模板时一个字符串或一个文件，里面包含了一个或多个由双花括号包含的`{{action}}`对象。

```go
const templ = `{{.TotalCount}} issues:
{{range .Items}}----------------------------------------
Number: {{.Number}}
User:   {{.User.Login}}
Title:  {{.Title | printf "\%.64s"}}
Age:    {{.CreatedAt | daysAgo}} days
{{end}}`
```

模板`{{点TotalCount}}`对应action将展开为结构体的`TotalCount`成员；`{{range .Items}}`和`{{end}}`对应一个循环action；`|`操作符表示将前一个表达式的结果作为后一个函数的输入，类似UNIX的管道的概念。

生成模板输出有两个处理步骤：第一步是要分析模板并转为内部表示，然后基于指定的输入指向模板。

```go
report, err := template.New("report").
    Funcs(template.FuncMap{"daysAgo": daysAgo}).
    Parse(templ)
if err != nil {
    log.Fatal(err)
}
```

因为模板通常是在编译时就测试好了，如果模板解析失败将是一个致命的错误。`template.Mute`辅助函数可以简化这个致命错误的处理：它接受一个模板和一个error类型的参数，检测error是否为nil，然后返回传入的模板。

`html/template`使用和`text/template`包相同的API和模板语言，但是增加了一个将字符串自动转义特性，可以避免输入字符串和HTML、JavaScript、CSS或URL语法产生冲突的问题。


# 第五章 函数

本章的运行示例是一个网络爬虫。

## 5.1 函数声明

函数声明包括函数名、形式参数列表、返回值列表(可省略)以及函数体。

```go
func name(parameter_list) [result_list] {
    body
}
```

如果一组形参或返回值有相同的类型，我们不必为每一个形参都写出参数类型。下面两个声明是等价的：

```go
func f(i, j, k int, s, t string)                 { /* ... */ }
func f(i int, j int, k int,  s string, t string) { /* ... */ }
```

```go
func add(x int, y int) int   {return x + y}
func sub(x, y int) (z int)   { z = x - y; return}
func first(x int, _ int) int { return x }
func zero(int, int) int      { return 0 }
```

函数的类型被称为函数的标识符，如果两个函数的形式参数列表和返回值列表中的变量类型一一对应，那么这两个函数被认为有相同的类型和标识符。

没有函数体的函数声明，表示该函数不是以Go实现的。

```go
package math

func Sin(x float64) float //implemented in assembly language
```

## 5.2 递归

`golang.org/x/...`目录下存储了一些由Go团队设计、维护，对网络编程、国际化文件处理、移动平台、图像处理、加密解密、开发者工具提供支持的扩展包。未将这些扩展包加入到标准库原因有二，一是部分包仍在开发中，二是对大多数Go开发者而言，扩展包提供的功能很少被使用。

`golang.org/x/net/html`提供解析HTML的功能。

```go
package main

import (
	"fmt"
	"os"

	"golang.org/x/net/html"
)

func main() {
	doc, err := html.Parse(os.Stdin)
	if err != nil {
		fmt.Fprintf(os.Stderr, "outline: %v\n", err)
		os.Exit(1)
	}
	outline(nil, doc)
}

func outline(stack []string, n *html.Node) {
	if n.Type == html.ElementNode {
		stack = append(stack, n.Data) // push tag
		fmt.Println(stack)
	}
	for c := n.FirstChild; c != nil; c = c.NextSibling {
		outline(stack, c)
	}
}
```

## 5.3 多返回值

在Go中，一个函数可以返回多个值。

当调用接受多参数的函数时，可以将一个返回多参数的函数作为该函数的参数。

```go
log.Println(findLinks(url))

links, err := findLinks(url)
log.Println(links, err)
```

## 5.4 错误

内置的error是接口类型，现在我们只需要知道error类型可能是nil或者non-nil。

虽然Go有各种异常机制，但这些机制仅被使用在处理那些未被预料到的错误，即BUG。Go这样设计的原因是错误以异常的形式抛出会混乱对错误的描述，所以Go使用控制流机制(如if和return)处理异常。

`fmt.Errorf`函数使用`fmt.Sprintf`格式化错误信息并返回。由于错误信息经常是以链式组合在一起的，所以错误信息中应避免大写和换行符。

`io`包保证任何由文件结束引起的读取失败都返回同一个错误，即`io.EOF`。

```go
package io

import "errors"

// EOF is the error returned by Read when no more input is available.
var EOF = errors.New("EOF")
```

## 5.5 函数值

在Go中，函数被看作第一类值(first-class values)：函数像其他值一样，拥有类型，可以被赋值，可以传递、返回。

函数类型的零值是`nil`，调用值为`nil`的函数值会引起panic错误。

`strings.Map`对字符串中的每一个字符调用函数，并将返回值组成一个新的字符串返回给调用者。

## 5.6 匿名函数

拥有函数名的函数只能在包级语法块中被声明，通过函数字面量(function literal)，我们可以绕过这一限制，在任何表达式中表示一个函数值。

## 5.7 可变参数

参数数量可变的函数称为可变参数函数。声明可变参数函数时，需要在参数列表的最后一个参数类型之前加上省略符号`...`。

```go
func sum(vals...int) int {
    total := 0
    for _, val := range vals {
        total += val
    }
    return total
}
```

在函数体中，`vals`被看作是类型为`[]int`的切片。如果原始参数已经是切片，那么可以这一传参：

```go
values := []int{1, 2, 3, 4}
fmt.Println(sum(values...)) // "10"
```

## 5.8 Deferred函数

当`defer`语句被执行时，跟在`defer`后面的函数会被延迟执行。知道包含该`defer`语句的函数执行完毕时，`defer`后的函数才会被执行。

`defer`语句经常被用于处理成对的操作，如打开、关闭、连接、断开连接、加锁、释放锁。

`defer`机制可以用来记录函数执行时间：

```go
func bigSlowOperation() {
    defer trace("bigSlowOperation")()
    // ...lots of work…
    time.Sleep(10 * time.Second) // simulate slow
    operation by sleeping
}
func trace(msg string) func() {
    start := time.Now()
    log.Printf("enter %s", msg)
    return func() { 
        log.Printf("exit %s (%s)", msg,time.Since(start)) 
    }
}
```

对于`os.Create`打开的文件读写，不建议使用`defer`进行关闭文件。

## 5.9 Panic异常

一般而言，当panic异常发生时，程序会中断运行，并立即执行在该goroutine(可以先理解成线程)中被延迟的函数。随后，程序崩溃并输出日志信息。

## 5.10 Recover捕获异常

如果在deferred函数中调用了内置函数`recover`，并定义该defer语句的函数发生了panic异常，recover会使程序从panic中恢复，并返回panic value。导致panic异常的函数不会继续运行，但能正常返回。

# 第六章 方法

本章介绍OOP编程的封装和组合。

## 6.1 方法声明

