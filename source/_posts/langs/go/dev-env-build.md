---

title: Langs | Go开发环境搭建与Go1.11模块
date: 2018-9-23
categories: Languages Explore
tags: Go
---

Golang是Google开发的一种静态强类型、编译型、开发型，并具有垃圾回收的编程语言。本文将介绍Go开发环境的搭建、Go开发基础知识以及Go 1.11的新特性Module。

<!-- more -->

学习Golang需要有基础的Git知识，可参考[Tool | Git日常使用总结](https://icytown.com/tool/git-manual/)。

## 前言

![qzone](dev-env-build/qzone.png)

Bug服务端用啥？GoGoGo！

冰淇淋服务端用啥？GoGoGo！

**真香！**

---

那么Golang语言语言又是怎么样的呢？摘自维基百科，有

>Go的语法接近C语言，但对于变量的声明有所不同。Go支持垃圾回收功能。Go的并行模型是以东尼·霍尔的通信顺序进程（CSP）为基础，采取类似模型的其他语言包括Occam和Limbo，但它也具有Pi运算的特征，比如通道传输。在1.8版本中开放插件（Plugin）的支持，这意味着现在能从Go中动态加载部分函数。
>
>与C++相比，Go并不包括如枚举、异常处理、继承、泛型、断言、虚函数等功能，但增加了 切片(Slice) 型、并发、管道、垃圾回收、接口（Interface）等特性的语言级支持。Go 2.0版本将支持泛型，对于断言的存在，则持负面态度，同时也为自己不提供类型继承来辩护。
>
>不同于Java，Go内嵌了关联数组（也称为哈希表（Hashes）或字典（Dictionaries）），就像字符串类型一样。

Golang简洁、标准库强大，可以说是一门面向开发编程的系统级语言(不是系统语言)。

## 环境准备

本次开发环境搭建将不基于[上篇文章](https://icytown.com/linux/centos-vps-build/)所搭建的CentOS云，为了方便开发，采用了可视化的Windows。在Golang环境上，可选Windows本地环境或者基于WSL的Ubuntu。后者与CentOS开发环境搭建流程类似。

**环境方案一：**

* Windows上的[VS Code](https://code.visualstudio.com/)，官方推荐使用**User Installer**，不需要UAC权限。
* Windows平台的Golang。

由于不需要开启虚拟机，方案一方便且消耗资源少。再加上Golang的编译器支持交叉编译，能编译成最终跑在Linux服务器上的程序。缺点是如果涉及到平台相关的代码，可能难以调试。

**环境方案二：**

* Linux上的VS Code。
* 带图形界面的Linux发行版，也可选择基于WSL且安装xubuntu的Ubuntu。
* Linux平台的Golang。

因为编译调试均是在Linux上，如果最终运行环境为Linux，那平台相关的代码的BUG将在开发过程中就会被找出来。缺点是资源消耗大。若是WSL，有很多网络上的限制，如果涉及到底层网络开发可能满足不了要求。

**环境方案三：**

* Windows上的Golang IDE软件[GoLand](https://www.jetbrains.com/go/)，JetBrains全家桶之一。
* Windows平台的Golang。

方便直接，可以直接使用JetBrains系列庞大数量的插件。缺点是安装包大、略慢。(可能是对于本辣鸡的机械硬盘来说)

当然，并不是说仅有以上三个方案。本人只是认为以上三个方案是比较好的选择。虽然本人目前采用方案三，但本文将不会提及方案三，相信大家都很熟悉JetBrains公司的全家桶。

虽然VS Code只是一个编辑器，而GoLand是一个IDE，但得益于Go大量的工具都是用Go本身写的，再加上VS Code的插件系统，使得VS Code在开发Golang程序的时候功能很强大。所以说在很多情况下，使用VS Code开发已经能满足我们的需求了。

安装VS Code的过程本文将不再提及，毕竟无论是Windows还是Linux，都是简单的下载安装的过程。

## Golang安装

### 在Windows上安装Golang

进入[Golang官网](https://golang.org/dl/)，下载MSI包，直接运行安装。安装完成之后运行PowerShell，检测Golang的二进制文件目录是否被加入到环境变量PATH中。

```sh
$ go version
```

如果找不到`go`命令，则将`go.exe`所在文件夹路径加入到环境变量`PATH`中。

### 在Linux上安装Golang

在Ubuntu上使用软件包管理工具安装Golang。

```sh
$ sudo apt install golang-go
```

在CentOS上使用软件包管理工具安装Golang。

```sh
$ yum install golang
```

不过软件包管理中的包版本可能不是最新的，在本文编写的时候，WSL-Ubuntu的Golang仅仅为1.10版本。

Golang官网提供了二进制包，我们可以下载并安装最新版本的Golang。

```sh
$ wget https://dl.google.com/go/go1.11.linux-amd64.tar.gz
```

解压。

```sh
$ tar -zvxf go1.11.linux-amd64.tar.gz
```

移动解压之后的文件夹。

```sh
$ mv go /opt/go
```

编辑环境变量配置。

```sh
$ vi /etc/profile
```

将下面的配置信息加到`/etc/profile`最尾部。

```shell
export GOROOT=/opt/go
export PATH=$PATH:$GOROOT/bin
```

更新环境变量。

```sh
$ source /etc/profile
```

检测配置是否正常。

```sh
$ go version
```

### GOROOT和GOPATH设置

查看Go的环境变量。

```sh
$ go env
```

目前，我们需要关注的是`GOROOT`和`GOPATH`两个环境变量。在这两个路径下，都会有以下的目录结构。

```
bin
pkg
src
```

三个目录的用途分别为

| 目录  |          用途          |
| :---: | :--------------------: |
| `bin` |      编译后的程序      |
| `pkg` | 编译时，生成的对象文件 |
| `src` |      引用的外部库      |

其中，`GOROOT`通常放置标准库的代码、中间对象文件，而`GOPATH`放置第三方库的代码、中间对象文件。因此可以发现，上面Linux配置环境变量的时候，将`GOROOT`设置为了我们解压所在的目录。

默认的`GOPATH`是在用户主目录的`go`文件夹下，而鉴于本人经常重装系统等，选择将其设置在非系统盘。

在Windows下，通过系统提供的环境变量编辑工具修改`GOPATH`的值即可，在Linux下，可以修改`/etc/profile`文件。

```sh
$ vi /etc/profile
```

将`GOPATH`的值添加到配置文件中。

```shell
export GOPATH=/mnt/d/Git/Go
```

更新环境变量。

```sh
$ source /etc/profile
```

检测配置是否成功。

```sh
$ go env
```

### 安装VS Code插件

在Windows下用VS Code新建一个扩展名为`go`的文本文件，这时候VS Code就会提示是否需要安装Golang相关的插件，选择安装。

 前面我们有提及过，Golang的很多工具都是用Golang开发的，都会直接或间接地引用了官方、第三方库。然而因为不可描述的原因，位于`golang.org`下的官方或第三方库都是不可拉取的。所以，安装Golang相关插件的时候可能得到网络连接错误的提示。

解决方法有两个：魔法上网、拉取镜像。

如果你有魔法上网的途径，可以依靠代理来拉取位于`golang.org`的库。Windows用户可以利用SSTap、SocksCap等工具将本地代理服务器代理全局的流量，Linux用户可以修改`/etc/profile`文件加入代理设置。

```shell
export http_proxy=http://ip:port
```

记得用`source`命令更新配置文件。

如果没有魔法上网的途径，可以选择拉取镜像。Golang在[GitHub Golang组织](https://github.com/golang)上备份了很多库的镜像，仓库的简介中带有`[mirror]`标识。我们可以利用Git将相关镜像克隆下来，然后复制到相应的文件夹中，那么在安装插件的时候在本地找到相应的库，就不会再向`golang.org`发起库请求了。

那么，问题来了，Golang存储第三方库的规则是什么？

这是Golang比较偏执的一面，Golang打造的是一个绝对开源的生态，Golang的库只能以源码的形式发布。因为Golang没有任何形式的链接库的存在，想要使用一个库，只能获取该库的源码，一起编译成二进制可执行文件。这样的好处是，**任意Golang开发的程序仅仅需要glibc链接库的支持即可运行。**

Golang使用Git仓库来约束世界各地的第三方库，对于每一个第三方库，它的Git仓库地址就是唯一标识。Go可以依靠地址标识和Git工具来拉取库的源码。Golang本地存储第三方库也是依靠其仓库地址来决定其本地路径。

比如官方库`golang.org/x/tools`，将被存储在`$GOPATH/src/golang.org/x/tools`文件夹中。而第三方库`github.com/XMatrixStudio/IceCream`，将被存储在`$GOPATH/src/github.com/XMatrixStudio/IceCream`中。它们都是以Git仓库的形式被存储在本地，所以它们的默认分支为哪个分支，工作区的代码即为哪个分支。这跟`git clone`本质一样，因此我们可以采用`git clone`来拉取镜像。

使用官方途径拉取`golang.org/x/tools`库的方法为：

```sh
$ go get golang.org/x/tools
```

但是我们可以在GitHub上拉取镜像：

Linux Shell：

```sh
$ git clone https://github.com/XMatrixStudio/Violet.SDK.Go $GOPATH/src/github.com/XMatrixStudio/Violet.SDK.Go
```

Windows PowerShell：

```sh
$ git clone https://github.com/XMatrixStudio/Violet.SDK.Go $env:GOPATH/src/github.com/XMatrixStudio/Violet.SDK.Go
```

将导致插件安装失败的库一个个手动拉取，然后重启VS Code，即可愉快开启打码之旅。

## Golang入门

### 你好，世界

创建一个叫`hellogo`的文件夹，打开VS Code，开始编写我们的第一个Go程序。(不是

```go
// main.go
package main

import "fmt"

func main() {
	fmt.Println("Hi, world.")
}
```

运行。

```sh
$ go run main.go
```

生成。

```sh
$ go build main.go
```

### 包管理

一个Golang项目由多个包组成，每个源代码文件用`package`声明其所在的包，用`import`来引用所需要的包。

根目录所在包名为`main`，主函数`main()`位于`main`包中，其余包名通常为所在文件夹的名字。

下面是一个简单的项目文件结构。

```
.
├── main.go
└── str
    └── strings.go
```

```go
// main.go
package main

import (
	"fmt"

	"github.com/MegaShow/hellogo/str"
)

func main() {
	fmt.Println(str.Hiworld)
}
```

```go
// str/strings.go
package str

var Hiworld = "Hi, world."
```

引入包有很多种方式。

```go
// 相对路径引入
import "./str"

// 绝对路径引入
import "github.com/MegaShow/hellogo/str"

// 点操作，引入之后可以省略包名对包内容调用(不建议)
import (
    . "str"
)

// 别名操作，用别名代替包名，用于有相同包名或包名很长的情况
import (
	s "str"
)

// _操作，只执行包中的init函数，而不引入包
import (
	_ "str"
)
```

绝对路径引入包，是在`GOROOT`和`GOPATH`中按绝对路径寻找包。如果在开发过程中，我们引入的包会随着开发而修改，那么`GOPATH`中引入的代码可能不是最新的。而相对路径在包名一致的时候很容易产生歧义，通常我们都会采用绝对路径。

为了保证引入的包是最新的，通常我们将开发中的Git仓库放在`GOPATH`中，直接对`GOPATH`中的代码进行修改。然后直接利用Git工具对代码进行版本控制。

### 包管理(for 1.11+)

不管是哪种语言，包管理的重要性都是不言而喻的。如果你接触了Golang，并且用了它的包管理系统一段时间之后，或者说负责长期项目开发，就会感到Go包管理系统的深深恶意。Golang的包管理一直以来都是被人诟病。

是的，Go的`import`的确是一个亮点，用Git来作为包管理既简单又方便。但是Golang的包管理并没有任何版本限制，就是说如果我重新部署环境拉取第三方库，碰巧第三方库出现了不兼容的更新，那么我不得不需要用Git去将第三方库回退到之前的版本。而类似于NodeJS等语言，很明显在`package.json`写明了依赖库的版本限制，只要`package.json`和`package-lock.json`没变，那重新部署的环境一定是正常的。

为此，社区先后出现了一大堆诸如godep、glide、govendor、dep、gvt等依赖管理工具。这些工具大部分都是基于Golang的vendor特性。vendor属性就是让go编译时，优先从项目源码树根目录下的vendor目录查找代码。如果vendor中有，则不再去GOPATH中去查找。

目前，Golang 1.11开启了对Module特性的实验性支持，并决定到Golang 1.12删除对`GOPATH`的支持。到时候，`go get`命令就变成了获取模块而不是一个简单的包项目。而Module依赖Git的提交哈希索引以及Tag，来实现依赖控制。

可以使用环境变量`GO111MODULE`开启或关闭模块支持：

* `GO111MODULE = off`：无模块支持，Go从GOPATH和vendor文件夹中寻找包。
* `GO111MODULE = on`：模块支持，Go忽视GOPATH和vendor，只根据`go.mod`下载依赖。
* `GO111MODULE = auto`：当项目在GOPATH外且项目根目录有`go.mod`文件时，有模块支持。

该环境变量默认值为`auto`，因此如果我们项目在GOPATH之外的时候，那就可以来体验Golang的新特性Module了。

初始化项目，生成模块文件。

```sh
$ go mod init
```

根据当前依赖自动生成`require`语句。

```sh
$ go mod tidy
```

Module特性允许重定向源的地址，我们可以将`golang.org`上的包都使用`replace`语句重定向到镜像地址上，就不需要采用上文所说的Git克隆大法了。下面是一个简单的`go.mod`文件范例。

```go
module example.com/m 

require (
    golang.org/x/text v0.3.0
    gopkg.in/yaml.v2 v2.1.0 
)

replace (
    golang.org/x/text => github.com/golang/text v0.3.0
)
```

查看当前的依赖和版本。

```sh
$ go list -m
```

## 结语

不得不说，Golang是一门很不错的语言，这是一门非常简洁、实用的编程语言，尤其是在服务端领域。

但是，就像前言里面的说说提及的，Golang是一门代码风格很固定的语言。在团队质量参差不齐的情况下，这点非常适合于代码风格约束。但是如果作为一门周末语言，相信很多人不是很喜欢Golang。

Golang很简单，但是也很怪。它没有类与对象，采用了方法绑定的特性。它的异常仅有panic一种类型，因此在项目中会出现大量嵌套的`if err != nil`等语句。它的变量类型声明中类型放在变量标识符后面，跟Kotlin相似，但是对于大多数习惯于C系语言的程序员可能是极度不习惯。还有很多......

据说Go 2.0将引入泛型和新的错误处理机制，期待更高开发效率的Go++。



