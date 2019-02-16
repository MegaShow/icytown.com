---
title: Langs | Go Muxie，一个路由框架的源码分析
categories: Languages Explore
date: 2018-11-15
tags:
- Go
- Router
---

得益于Golang标准库的完善，使用Golang开发Web后端应用非常简单。也因此催生出了诸如httprouter、Mux、Muxie等multiplexer，也有类似于Gin、Echo、Iris、Beego等Web框架。

本文将从Golang标准库`net/http`、第三方框架`Muxie`的源码入手，分析一下原生的路由框架，以及如何基于原生网络库构建路由框架。

值得一提，Muxie发布至今仅有一个月。

<!-- more -->

## 为什么选择Muxie？

首先，我们先认识一下什么是路由框架。路由是Web框架中的一个组成部分，负责将不同的URL映射到相应的处理方法(函数)上。如果一个Web库仅仅负责路由映射，那么我们可以称之为路由框架；如果一个Web库不仅仅是负责路由映射，还负责其他诸如Session管理、上下文管理等事务，那么我们可以称之为Web框架。

比如httprouter就是主要负责路由逻辑的，这类库我们又叫做Router、Multiplexer、Mux。

Muxie不是一个著名的Mux库，本文编写时GitHub上的Star数量仅有55，连小有名声也算不上。相比之下，httprouter和Mux这些Mux库Star数量都是7k+。

选择Muxie的原因如下：

* Muxie跟著名Web框架Iris是同一个开发者开发的。虽然Iris有代码抄袭的争议，还因号称地球最快的Web框架经常被怼，但毕竟用户基数在那里，Muxie的代码水平应该不会差。
* Muxie号称100%兼容标准库`net/http`。不知道是不是跟Iris一样夸大其谈来博人眼球，但是如果跟标准库类似，那更有助于我们的分析。
* Muxie发布距今才一个月。Muxie推送到GitHub上的第一个Commit记录是2018年10月15日，作为新生儿的Muxie，代码中几乎不会有任何历史包袱，方便阅读和理解源码。

Muxie的GitHub地址在此：[Muxie](https://github.com/kataras/muxie)

## 通过Muxie的例子来认识路由框架

值得一提，无论是Iris还是Muxie，开发者都提供了大量代码例子来辅助学习，这是我觉得其他框架比不上的一点。

那么，接下来我们就通过官方给我们提供的例子来认识和分析Mux框架。

### Example 1 Hello world

在开始阅读Muxie的例子之前，我们先来分析一下原生路由的使用。

```go
func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/", indexHandler)
	fmt.Println(`Server started at http://localhost:8080`)
	http.ListenAndServe(":8080", mux)
}

func indexHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/html;charset=utf8")
	fmt.Fprintf(w, "Hello, <strong>%s</strong>", "MegaShow")
}
```

或者main函数可以更加简单。

```go
func main() {
	http.HandleFunc("/", indexHandler)
	fmt.Println(`Server started at http://localhost:8080`)
	http.ListenAndServe(":8080", nil)
}
```

如果你之前用过一些著名的Golang库，比如Viper等，就会知道，Golang库通常设计成方法+默认库函数的形式。当我调用库函数的时候，实际上相当于间接调用了库内部实例变量的方法。

```go
func HandleFunc(pattern string, handler func(ResponseWriter, *Request)) {
	DefaultServeMux.HandleFunc(pattern, handler)
}
```

如上，调用`http.HandleFunc`就相当于调用默认`ServeMux`的`HandleFunc`。在Golang库中基本都是这样的设计，比如`http.ListenAndServe`实际上是调用了默认`Server`的`ListenAndServe`。

现在我们来分析第一段代码，首先是创建一个标准库的Mux，然后去注册一个句柄，将指定的URL映射到相应的方法中，最后开启服务监听。

接下来，我们打开Muxie的GitHub地址，进入`_examples`文件夹查看Muxie例子。

```go
func main() {
	mux := muxie.NewMux()
	mux.HandleFunc("/", indexHandler)
	fmt.Println(`Server started at http://localhost:8080`)
	http.ListenAndServe(":8080", mux)
}

func indexHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/html;charset=utf8")
	fmt.Fprintf(w, "Hello, <strong>%s</strong>", "MegaShow")
}
```

估计大家都发现了，Muxie的Hello World代码跟标准库几乎完全一样。那么Muxie是怎么做到兼容标准库的呢？

代码的第5行将Muxie的Mux变量和标准库的Mux变量都传给了`http.ListenAndServe`，很明显，这两个Mux变量的类型不一样。阅读标准库相关方法的源码，有第二个参数`Handler`的类型定义。

```go
type Handler interface {
	ServeHTTP(ResponseWriter, *Request)
}
```

也就是说，只要Muxie的Mux变量类型，绑定了方法`ServeHTTP`，那就可以传给`http.ListenAndServe`，负责管理服务端的路由。

### 基于Trie的路由

> **trie based:** performance and useness are first class citizens, Muxie is based on the prefix tree data structure, designed from scratch and built for HTTP, and it is among the fastest out here, if not the fastest one

摘自Muxie的Features介绍，Muxie的路由是基于前缀树的。

Trie，又称为**前缀树**或**字典树**，是一种有序树，用于保存关联数组，键通常为字符串。与二叉搜索树不一样的是，前缀树的键不是直接保存在节点中，而是由节点在树中的位置决定的。因此一个节点的所有子孙都拥有相同的前缀，也就是这个节点的键。

URL的路径是以`/`分割层级目录的，我们可以将每一个层级作为树的一个节点，那么一个路由表就可以简单的使用一个前缀树来表示出来。

```
Node           Handler  Path
/               *<1>    /
|amdin/         *<2>    /admin/  
|user/          nil
     |:name     *<3>    /user/:name/
|blog/          nil
     |:id       *<4>    /blog/:id/
|about/         *<5>    /about/
      |contact  *<6>    /about/contact/
      |team     *<7>    /about/team/
```

阅读Muxie源码可以得到Trie树的定义和路由节点Node的定义。

```go
// Trie contains the main logic for adding and searching nodes for path segments.
// It supports wildcard and named path parameters.
// Trie supports very coblex and useful path patterns for routes.
// The Trie checks for static paths(path without : or *) and named parameters before that in order to support everything that other implementations do not,
// and if nothing else found then it tries to find the closest wildcard path(super and unique).
type Trie struct {
	root *Node
	// if true then it will handle any path if not other parent wildcard exists,
	// so even 404 (on http services) is up to it, see Trie#Insert.
	hasRootWildcard bool
	hasRootSlash bool
}
```

```go
// Node is the trie's node which path patterns with their data like an HTTP handler are saved to.
// See `Trie` too.
type Node struct {
	parent *Node
	children               map[string]*Node
	hasDynamicChild        bool // does one of the children contains a parameter or wildcard?
	childNamedParameter    bool // is the child a named parameter (single segmnet)
	childWildcardParameter bool // or it is a wildcard (can be more than one path segments)
	paramKeys []string // the param keys without : or *.
	end       bool     // it is a complete node, here we stop and we can say that the node is valid.
	key       string   // if end == true then key is filled with the original value of the insertion's key.
	// if key != "" && its parent has childWildcardParameter == true,
	// we need it to track the static part for the closest-wildcard's parameter storage.
	staticKey string
	// insert main data relative to http and a tag for things like route names.
	Handler http.Handler
	Tag     string
	// other insert data.
	Data interface{}
}
```

接下来我们看一下Muxie构建Trie树的过程。在Hello World源码中我们通过`NewMut`创建了一个Muxie Mux变量，这个变量带有一个拥有根节点的Trie树，同时分配了`sync.Pool`临时对象池。

```go
// NewMux returns a new HTTP multiplexer which uses a fast, if not the fastest
// implementation of the trie data structure that is designed especially for path segments.
func NewMux() *Mux {
	return &Mux{
		Routes: NewTrie(),
		paramsPool: &sync.Pool{
			New: func() interface{} {
				return &paramsWriter{}
			},
		},
		root: "",
	}
}
```

众所周知，垃圾回收(GC)一直都是一把双刃剑，虽然在编程上便捷了，但运行时垃圾回收增加了运行时的开销。如果是简单的计数引用，GC要在固定时间段后执行一遍，将计数为0的引用销毁。但是实际上GC实现肯定不是简单的计数引用，还会涉及到新旧引用堆等问题。对于Web请求这种高并发的应用来说，不管是怎么样的GC都会造成一定的性能开销。

但是`sync.Pool`的定位也不是实现类似于连接池的东西，而是增加对象的重用几率，减少GC频繁创建对象、销毁对象的负担。为什么说`sync.Pool`不能实现类似于连接池的东西呢，在这个包的init函数中，有这样一段代码。

```go
func init() {
    // This function is called with the world stopped, at the beginning of a garbage collection.
	// It must not allocate and probably should not call any runtime functions.
	// Defensively zero out everything, 2 reasons:
	// 1. To prevent false retention of whole Pools.
	// 2. If GC happens while a goroutine works with l.shared in Put/Get,
	//    it will retain whole Pool. So next cycle memory consumption would be doubled.
	runtime_registerPoolCleanup(poolCleanup)
}
```

注释是描述poolCleanup函数的，也就是说，这个函数将在每次GC发生的时候被调用。每次GC之后，所有`sync.Pool`实例中的对象都会被清除，是不可能实现一个能够持续连接的连接池的。`sync.Pool`在这里的用途，我们等会再探究，先继续分析路由实现。

```go
// HandleFunc registers a route handler function for a path pattern.
func (m *Mux) HandleFunc(pattern string, handlerFunc func(http.ResponseWriter, *http.Request)) {
	m.Handle(pattern, http.HandlerFunc(handlerFunc))
}

// Handle registers a route handler for a path pattern.
func (m *Mux) Handle(pattern string, handler http.Handler) {
	m.Routes.Insert(m.root+pattern,
		WithHandler(
			Pre(m.beginHandlers...).For(handler)))
}
```

如果去阅读一下标准库的源码，会发现两者是非常相似的。`HandleFunc`都是将处理方法强制转换成`http.HandlerFunc`类型，而这个类型绑定了方法`ServeHTTP`，因此满足`http.Handler`接口的方法，可以将参数传递给`Handle`处理。而`Handle`方法中，都是执行了路由插入的操作。

Muxie中的路由插入，就是向Trie树插入一个数据。前面也提及了，前缀树实际上值是通过节点的位置所决定的，而路由URL以每一个层次目录作为一个节点，因此我们会发现在Trie树插入方法的第一句语句就是分割路由地址。

```go
func (t *Trie) insert(key, tag string, optionalData interface{}, handler http.Handler) *Node {
	input := slowPathSplit(key)
    // more code
}
```

开启服务监听的代码是由`http.ListenAndServe`负责的，Muxie只是实现了相应的接口。

### 基于Map的路由

 上一节我们了解到Muxie的路由表使用前缀树来实现，那么标准库又是怎么实现的呢？

Muxie的`Handle`方法中是负责执行路由插入的，标准库也一样，现在我们来分析一下路由插入的代码。

```go
// Handle registers the handler for the given pattern.
// If a handler already exists for pattern, Handle panics.
func (mux *ServeMux) Handle(pattern string, handler Handler) {
	// more code
	if _, exist := mux.m[pattern]; exist {
		panic("http: multiple registrations for " + pattern)
	}
	if mux.m == nil {
		mux.m = make(map[string]muxEntry)
	}
	mux.m[pattern] = muxEntry{h: handler, pattern: pattern}
	// more code
}
```

一查，发现m实际上就是一个map，答案显而易见。标准库的路由表使用map来实现路由表，本质上是哈希表。

```go
type ServeMux struct {
	mu    sync.RWMutex
	m     map[string]muxEntry
	hosts bool // whether any patterns contain hostnames
}
```

路由表主要的功能是提供键为字符串的插入和查询功能，而删除通常不会在考虑范围内，因为路由不会用上删除功能。那么一个路由框架采用哪种方式存储路由，这就取决于两者的插入和查询的效率。

Trie树的核心思想是用空间来换时间，如果每个节点只能存储一个字符，插入和查询的时间复杂度可以稳定达到$O(n)$，其中$n$为插入或查询的字符串长度。Hash的插入和查询虽然能达到$O(1)$复杂度，但是那只是没有哈希冲突的情况，如果发生冲突，效率可能不如Trie树。其次Hash需要计算哈希值，如果计算一个字符串的哈希值，可能也需要遍历字符串。

在众多Web框架、路由框架中，基本都是采用前缀树来构建路由表。不过通常情况下，框架并不会仅仅使用单一的前缀树来构建，比如Muxie，实际上是结合了前缀树和Map。

普通的前缀树由于需要考虑到子节点的所有字节键的情况，需要分配大量的空间存储子节点的引用，哪怕这个子节点并不存在。比如一个存储单词的前缀树，有如下的声明。

```go
type TrieNode struct {
	isKey    bool
	children [26]*TrieNode
}
```

但是，路由表的每个节点并不可能存储一个字节，通常都是某一层目录名，也就是一个单词或者参数，那么自然不会考虑所有键的情况。Muxie存储子节点的引用采用了map。

```go
type Node struct {
	parent   *Node
	children map[string]*Node
	end      bool
    // more members
}
```

这样的前缀树可以降低空间开销，又能提高查询效率。不过实际上，两类路由有利也有弊，针对不同情况有各自的优势。

### Example 2 Parameterized

个人认为，一个简洁的路由表设计应该是将参数都存放在Query或者Body里面，路由地址的本体不应该带有任何参数。不过，有些人可能倾向于使用下面的URL地址。

```
GET /authors/12/categories/2
GET /authors/12?categories=2
```

前者不是一个好的URL地址，但是无论是前者还是后者，URL地址中都带有参数值。我们不可能将注册所有的路由，因为参数值的范围可以很大。最佳的方案是在路由层支持URL带参数或通配符，在路由映射的时候映射到带参数或通配符的路由处理方法上，而参数和通配符的值通过参数的形式传递给处理方法。

标准库并不支持这种形式的路由，并且基于Map的路由表如果想要处理这种形式的路由，必须对整个URL进行处理。如果路由表基于Trie树，那在处理通配符或参数的时候，我们只需要处理某个节点的键。这也是大部分Web框架均采用Trie树构建路由表的原因。

接下来我们阅读Muxie关于参数、通配符的范例，来分析Muxie是如何实现这类路由的。

```go
func main() {
	mux := muxie.NewMux()
	mux.PathCorrection = true

	mux.HandleFunc("/profile/:name", profileHandler)
	mux.HandleFunc("/profile/:name/photos", profilePhotosHandler)
	mux.HandleFunc("/uploads/*file", listUploadsHandler)
	fmt.Println("Server started at http://localhost:8080")
	http.ListenAndServe(":8080", mux)
}

func profileHandler(w http.ResponseWriter, r *http.Request) {
	name := muxie.GetParam(w, "name")
	fmt.Fprintf(w, "Profile of: '%s'", name)
}

func profilePhotosHandler(w http.ResponseWriter, r *http.Request) {
	name := muxie.GetParam(w, "name")
	fmt.Fprintf(w, "Photos of: '%s'", name)
}

func listUploadsHandler(w http.ResponseWriter, r *http.Request) {
	file := muxie.GetParam(w, "file")
	fmt.Fprintf(w, "Showing file: '%s'", file)
}
```

**这里实际上已经删除了大部分代码，完整的范例对静态URL、带参数的URL、带通配符的URL多种形式比较，来分析它们的优先级。**

在Muxie的Trie树节点插入方法中，将URL按目录层次分割之后，将遍历分割后得到的数组。Muxie就在这个时候检查是否存在参数、通配符。

```go
func (t *Trie) insert(key, tag string, optionalData interface{}, handler http.Handler) *Node {
	input := slowPathSplit(key)
	// more code
	for _, s := range input {
		c := s[0]
		if isParam, isWildcard := c == ParamStart[0], c == WildcardParamStart[0]; isParam || isWildcard {
			// more code
			if isParam {
				// more code
			}
			if isWildcard {
				// more code
			}
		}
		// more code
	}
	// more code
}
```

这里的`ParamStart`和`WildcardParamStart`被定义成`:`和`*`，显然，URL的每一层如果以这两个符号开头，就被视为参数或通配符。

当服务监听启动时，http库会调用Mux的ServeHTTP方法，在Muxie的相应方法中，有从Trie树中查找节点的代码。

```go
// ServeHTTP exposes and serves the registered routes.
func (m *Mux) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	// more code
	pw := m.paramsPool.Get().(*paramsWriter)
	pw.reset(w)
	n := m.Routes.Search(path, pw)
	if n != nil {
		n.Handler.ServeHTTP(pw, r)
	} else {
		http.NotFound(w, r)
		// or...
		// http.Error(w, http.StatusText(http.StatusNotFound), http.StatusNotFound)
		// w.WriteHeader(http.StatusNotFound)
		// doesn't matter because the end-dev can customize the 404 with a root wildcard ("/*path")
		// which will be fired if no other requested path's closest wildcard is found.
	}
	m.paramsPool.Put(pw)
}
```

`sync.Pool`在这里给每一个请求都分配了一个`paramsWriter`，而这个变量是负责存储参数、通配符的键值。显然，方法`GetParam`就是从`paramsWriter`中拿出参数、通配符的值。

```go
// GetParam returns the path parameter value based on its key, i.e
// "/hello/:name", the parameter key is the "name".
// For example if a route with pattern of "/hello/:name" is inserted to the `Trie` or handlded by the `Mux`
// and the path "/hello/kataras" is requested through the `Mux#ServeHTTP -> Trie#Search`
// then the `GetParam("name")` will return the value of "kataras".
// If not associated value with that key is found then it will return an empty string.
//
// The function will do its job only if the given "w" http.ResponseWriter interface is an `paramsWriter`.
func GetParam(w http.ResponseWriter, key string) string {
	if store, ok := w.(*paramsWriter); ok {
		return store.Get(key)
	}

	return ""
}
```

在Trie树的插入操作中，添加子节点是如下代码。如果是存在通配符或参数，那s的值将是`*`或`:`，而不是参数标识符或通配符标识符。

```go
if !n.hasChild(s) {
    child := NewNode()
    n.addChild(s, child)
}
```

回到Trie树的搜索操作中，一层层检索下去，根据既定的优先级关系，先查找是否有静态路径，然后查找参数路由，最终才是通配符路径。如果当前路径找不到通配符，则向父节点回溯，找到距离当前节点最近的满足条件的通配符。

```go
if child := n.getChild(q[start:i]); child != nil {
    n = child
} else if n.childNamedParameter { // && n.childWildcardParameter == false {
    n = n.getChild(ParamStart)
    // more code
} else if n.childWildcardParameter {
    n = n.getChild(WildcardParamStart)
    // more code
    break
} else {
    n = n.findClosestParentWildcardNode()
    if n != nil {
        params.Set(n.paramKeys[0], q[len(n.staticKey):])
        return n
    }
    return nil
}
```

### Example 3 Root wildcard and custom 404

通过对例2的Trie树的搜索代码分析，我们得到了Muxie各种路由的优先级，其规律大致如下：

1. 在Trie树中一层层检索路由，初始当前节点为路由的根节点。
2. 如果URL中下一层可以在当前节点的子节点中匹配，那么将当前节点置为该子节点。
3. 如果当前节点的子节点中存在`:`，那么将URL的下一层视为参数，将当前节点置为`:`子节点。
4. 如果当前节点的子节点中存在`*`，那么将URL的剩下路径均视为通配符的值，终止检索路由。
5. 以上条件均不满足时，将回溯当前节点的父节点，并找兄弟中是否有通配符，如果有，终止检索路由，如果无，将视为找不到路由。

举个例子，比如我们有如下的注册的路由。

```
/user/zhenly/*
/user/zhenly/hello/world
/user/zhenly/hello/:word
```

如果我们访问以下的URL。

```
/user/zhenly/hello/world
=>  find  /user
=>  find  /user/zhenly
=>  find  /user/zhenly/hello
=>  match /user/zhenly/hello/world

/user/zhenly/hello/mega
=>  find  /user
=>  find  /user/zhenly
=>  find  /user/zhenly/hello
=>  match /user/zhenly/hello/:word

/user/zhenly/hello/mega/show
=>  find  /user
=>  find  /user/zhenly
=>  find  /user/zhenly/hello
=>  find  /user/zhenly/hello/:word
=>  back  /user/zhenly/hello/
=>  back  /user/zhenly
=>  match /user/zhenly/*

/user/mega
=>  find  /user
=>  back  /
=>  404
```

可以发现，最后会回溯到根节点，再返回404错误。如果我们给根节点添加一个通配符路由，由于通配符优先级最低，那就意味着匹配失败的路由，最终会被这个路由匹配。那我们就可以实现自定义的404页面了。

### Example 4 Grouping

路由分组几乎是所有现代路由框架都会支持的功能，使用路由分组可以将同一功能、同一类型的路由写在一起，这样有助于项目架构的搭建。

Muxie的路由分组方式如下，调用了Mux的方法`Of`来创建子Mux，这样，子Mux上的路由地址都拥有相同的前缀，这个前缀在子Mux创建的时候被定义。

```go
func main() {
	mux := muxie.NewMux()
	mux.PathCorrection = true
	mux.HandleFunc("/*path", func(w http.ResponseWriter, r *http.Request) {
		path := muxie.GetParam(w, "path")
		fmt.Fprintf(w, "Site Custom 404 Error Message\nPage of: '%s' was unable to be found", path)
	})

	profileRouter := mux.Of("/profile")
	profileRouter.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprint(w, "Profile Index")
	})
	profileRouter.HandleFunc("/:username", func(w http.ResponseWriter, r *http.Request) {
		username := muxie.GetParam(w, "username")
		fmt.Fprintf(w, "Profile of username: '%s'", username)
	})

	fmt.Println("Server started at http://localhost:8080")
	http.ListenAndServe(":8080", mux)
}
```

阅读`Of`方法源码，可以发现，返回的子Mux与父Mux是共用一个Trie树，只是它们的前缀不一致。

```go
func (m *Mux) Of(prefix string) SubMux {
	// more code
	return &Mux{
		Routes: m.Routes,
		root:   prefix,
        // more members
	}
}
```

因此，Muxie的路由分组只是为开发提供更优雅的方式，而没有性能上的提升。它的本质，还是在原有的Trie树上进行路由插入和搜索。

### Example 5 Internal route node

例5是一个在路由处理方法里面操作Trie树的例子，个人觉得没啥好分析的。但是我个人觉得，暴露Trie树到外部是一个不太好的设计。

### Example 6 Middleware

中间件相当于Web框架中的插件，其实际上就是具有扩展功能的模块。在不同的路由处理方法中，可能有很多相同的处理代码，但是我们又不想在每一个路由处理方法中添加这些代码，即使是封装了还是要调用。

中间件的引入，可以让每个路由分组在调用处理方法之前或之后，自动执行绑定在路由分组上的中间件。中间件起到了很好的解耦效果。

Muxie的中间件类似于洋葱模型，中间件是一层一层间接执行，并且要按照规定在中间体中调用`next.ServeHTTP`来执行下一个中间件。既然是一个中间件调用下一个中间件，那就意味着下一个中间件执行结束之后，会跳转回到上一个中间件，继续执行该中间件剩余的代码。

Muxie的中间件原理分析起来很像是函数的执行，实际上，Muxie的本质就是函数封装。

```go
func (m *Mux) Use(middlewares ...Wrapper) {
	m.beginHandlers = append(m.beginHandlers, middlewares...)
}
```

```go
func (m *Mux) Handle(pattern string, handler http.Handler) {
	m.Routes.Insert(m.root+pattern,
		WithHandler(
			Pre(m.beginHandlers...).For(handler)))
}
```

```go
func Pre(middleware ...Wrapper) Wrappers {
	return Wrappers(middleware)
}
```

Muxie在注册路由的时候，会将所有中间件通过`For`方法依次嵌套，最终封装成一个`http.Handler`方法。

下面代码是一个简单的Muxie中间件。

```go
func myGlobalMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Println("execute: my global and first of all middleware for all following mux' routes and sub muxes")
		next.ServeHTTP(w, r)
		log.Println("hello")
	})
}
```

### Example 7 By methods

Muxie使用了链式的形式来注册不同请求方法的路由。

```go
mux.Handle("/user/:id", muxie.Methods().
	HandleFunc(http.MethodGet, getUser).
	HandleFunc(http.MethodPost, saveUser).
	HandleFunc(http.MethodDelete, deleteUser))
```

```go
type MethodHandler struct {
	handlers map[string]http.Handler // method:handler
	methodsAllowedStr string
}
```

`muxie.Methods`返回一个`MethodHandler`变量，然后通过`MethodHandler`的Handle和HandleFunc方法将对应的处理方法存储到Map中。调用ServeHTTP的时候再判断需要执行哪个Handler。

```go
func (m *MethodHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if handler, ok := m.handlers[r.Method]; ok {
		handler.ServeHTTP(w, r)
		return
	}
	w.Header().Set("Allow", m.methodsAllowedStr)
	http.Error(w, http.StatusText(http.StatusMethodNotAllowed), http.StatusMethodNotAllowed)
}
```

### Example 8 Bind request, send response

Muxie提供了简单的解析请求体和发送应答的方法。

```go
// Bind accepts the current request and any `Binder` to bind
// the request data to the "ptrOut".
func Bind(r *http.Request, b Binder, ptrOut interface{}) error {
	return b.Bind(r, ptrOut)
}
```

利用`Bind`方法可以将请求Body的数据通过b解析器的解析，存储到ptrOut变量中。

Muxie提供了JSON解析器和XML解析，实际上就是将请求Body转化为byte数组，然后交给Golang的标准库负责解析。

```go
func (p *xmlProcessor) Bind(r *http.Request, v interface{}) error {
	b, err := ioutil.ReadAll(r.Body)
	if err != nil {
		return err
	}

	return xml.Unmarshal(b, v)
}
```

发送应答也是如此，将变量编码为byte数组，然后写入到ResponseWriter中。

### Example 9 Subdomains and matchers

Muxie使用`HandleRequest`将Mux绑定到相应的子域名中。

```go
mySubdomain := muxie.NewMux()
mySubdomain.HandleFunc("/", handleMySubdomainIndex)
mySubdomain.HandleFunc("/about", aboutHandler)

mux.HandleRequest(muxie.Host("mysubdomain.localhost:8080"), mySubdomain)
```

`Host`并不是一个方法，而是一个类型，本质上就是字符串。

```go
// Host is a Matcher for hostlines.
// It can accept exact hosts line like "mysubdomain.localhost:8080"
// or a suffix, i.e ".localhost:8080" will work as a wildcard subdomain for our root domain.
// The domain and the port should match exactly the request's data.
type Host string

// Match validates the host, implementing the `Matcher` interface.
func (h Host) Match(r *http.Request) bool {
	s := string(h)
	return r.Host == s || (s[0] == '.' && strings.HasSuffix(r.Host, s)) || s == WildcardParamStart
}
```

在`ServeHTTP`方法中，会对`requestHandler`做匹配。

```go
func (m *Mux) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	for _, h := range m.requestHandlers {
		if h.Match(r) {
			h.ServeHTTP(w, r)
			return
		}
	}
	// more code
}
```

### Example 10 Fileserver

Muxie实现File Server跟标准库实现相同，也是依靠`http.FileServer`。

```go
func main() {
	mux := muxie.NewMux()
	mux.Handle("/static/*file", http.StripPrefix("/static/", http.FileServer(http.Dir("./static"))))

	log.Println("Server started at http://localhost:8080\nGET: http://localhost:8080/static/\nGET: http://localhost:8080/static/js/empty.js")
	http.ListenAndServe(":8080", mux)
}
```

`StripPrefix`方法用于将给定前缀从URL的Path参数中移除掉，这样就能保证本地文件系统中的文件能与相应的路由地址匹配了。

```go
// StripPrefix returns a handler that serves HTTP requests
// by removing the given prefix from the request URL's Path
// and invoking the handler h. StripPrefix handles a
// request for a path that doesn't begin with prefix by
// replying with an HTTP 404 not found error.
func StripPrefix(prefix string, h Handler) Handler {
	if prefix == "" {
		return h
	}
	return HandlerFunc(func(w ResponseWriter, r *Request) {
		if p := strings.TrimPrefix(r.URL.Path, prefix); len(p) < len(r.URL.Path) {
			r2 := new(Request)
			*r2 = *r
			r2.URL = new(url.URL)
			*r2.URL = *r.URL
			r2.URL.Path = p
			h.ServeHTTP(w, r2)
		} else {
			NotFound(w, r)
		}
	})
}
```

## 结语

本文通过分析标准库`net/http`和第三方库`Muxie`，学到了不少路由框架、Web框架上的知识。原本打算开发一个小玩具框架来试试手，不过时间有限，课程压力也蛮大，就先留个小计划，有空再玩玩。

