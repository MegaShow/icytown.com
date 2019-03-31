---
title: Tool | 构建工具Ant的简单使用
date: 2018-4-14
categories: Tool Usage and Wiki
---

Ant是一种基于Java的build工具，类似C的make、ruby的rake等。Ant的全称为another neat tool，是Apache软件项目，其文件使用XML编写。

<!-- more -->

## Ant安装

首先前往[Apache Ant官网](http://archive.apache.org/dist/ant/binaries/)下载bin压缩包，本人这里下载了1.10.0版本。

```sh
$ wget http://archive.apache.org/dist/ant/binaries/apache-ant-1.10.0-bin.tar.gz
```

然后解压：

```sh
$ tar -zxvf apache-ant-1.10.0-bin.tar.gz
$ sudo mv apache-ant-1.10.0 /opt/apache-ant
```

设置系统环境变量：

```sh
$ sudo vi /etc/profile
```

```shell
ANT_HOME=/opt/apache-ant
PATH=$ANT_HOME/bin:$PATH
export ANT_HOME
```

刷新环境变量，测试：

```sh
$ source /etc/profile
$ ant -version
Apache Ant(TM) version 1.10.0 compiled on December 27 2016
```

## Ant第一个生成文件

先写一个最基础的生成文件：

```xml
<?xml version="1.0"?>
<project default="main">
    <description>A java project that prints HelloWorld.</description>
    <target name="main" description="a.java"/>
</project>
```

然后执行Ant，Ant会默认把当前路径的`build.xml`文件作为生成文件：

```sh
$ ant
Buildfile: /mnt/c/Users/MegaX/Desktop/build.xml

main:

BUILD SUCCESSFUL
Total time: 0 seconds
```

这里的`project`标签是最顶层标签，需要包含一个`default`属性，当Ant没有指明执行目标时，就会执行default目标。`target`就是声明目标的标签，可以有多个target。`description`标签和属性都是用来描述备注的。

## Ant基础

### 属性

Ant里面的属性类似于编程语言的变量，而和上面的标签的属性不一致，Ant属性一经设置就不可修改了，所以其实相当于编程语言里面的常量。

```xml
<property name="metal" value="12345"/>
```

引用属性使用`${metal}`，比如：

```xml
<property name="metal-db" value="${metal}.db"/>
```

除了自定义的属性之外，Ant还定义了一系列很有用的属性：

* `${ant.version}`：Ant版本
* `${basedir}`：项目目录的绝对路径，由包含生成文件的目录所定义，或者`project`的属性`basedir`定义

Ant提供了一套文件系统路径属性声明方式，消除平台的误差：

```xml
<property name="file" location="archive/database/${metal}.db"/>
<property name="file" location="archive\database\${metal}.db"/>
```

### 依赖关系

```xml
<target name="init"/>
<target name="preprocess" depends="init"/>
<target name="compile" depends="init,preprocess"/>
<target name="package" depends="compile"/>
```

### 编译源代码

```xml
<javac srcdir="src"/>
```

`javac`标签编译src目录中所有java文件，生成对应的class文件，`javac`还有下列的属性：

* `classpath`：等价于javac的-classpath选项
* `debug`：值为true或false，编译是否生成带有调试信息的字节文件
* `fork`：值为true时可指明其他的javac编译器，而不是Ant本身的JVM编译器
* `executable`：fork指明的编译器路径，支持javac、Jikes、GCI
* `memoryMaximumSize`：编译使用最大内存

### JAR打包

```xml
<jar destfile="hi.jar" basedir="./">
    <manifest>
        <attribute name="Bult-By" value="MegaShow"/>
        <attribute name="Main-Class" value="a"/>
    </manifest>
</jar>
```

其中，这里的`Main-Class`的值格式为`package.class`，因为这里我们没有别的package，所以只声明了class的值。

这里指明了basedir之后，会把里面的所有文件都打包进来，即使不是class文件。

### 生成时间戳

Ant提供了三个时间戳属性：

|  属性  |        格式        |   备注   |
| :----: | :----------------: | :------: |
| DSTAMP | yyyymmdd(20180414) | 当前日期 |
| TSTAMP |     hhmm(0045)     | 当前时间 |
| TODAY  |  (April 14 2018)   | 当前日期 |

在使用时间戳之前要声明时间戳：

```xml
<tstamp/>
<tstamp profix="utc8"/>
<tstamp>
   <format property="OFFSET_TIME" pattern="HH:mm:ss" offset="10" unit="minute"/>
</tstamp>
```

第一种是直接声明，第二种是绑定到一个属性上，第三种是创建新的时间戳属性。

### 文件操作

其实文件操作就跟Shell差不多类似，Ant甚至可以支持`echo`标签。

```xml
<mkdir dir="new_folder"/>
<delete dir="new_folder"/>
<delete file="a.class"/>

<copy file="a.java" tofile="hi/a.java"/>
<move file="a.java" tofile="hi/a.java"/>
```

### 程序执行

Ant提供了`java`用来执行`class`文件和`jar`文件。

```xml
<java classname="com.icytown.test.main" classpath="build" fork="true"/>
<java jar="dist/test.jar" fork="true"/>
```

这里需要指明`fork`为`true`，我也不知道是为什么，如果不指明的话，会有些奇奇怪怪的`NullClassDefine`的错误。当然，也有可能和JavaFX有关，因为我的代码都是与JavaFX有关的。

## 利用Ant支持Sonar和JUnit

Ant支持了很多不同的Java工具，Sonar和JUnit在其中。

在另外两篇文章[Start Sonar](https://icytown.com/start/first-experience-sonarqube/)、[Start JUnit](https://icytown.com/start/first-experience-junit/)中略有提及，所以这里不记录了。

