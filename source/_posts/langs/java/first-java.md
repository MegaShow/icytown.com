---
title: Langs | Java语法初探
date: 2018-4-13
categories: Languages Explore
tags:
- Java
---

这里使用的环境是Windows Subsystem for Linux，发行版为Ubuntu，图形界面使用Xfce(Xubuntu)。

<!-- more -->

## Java安装

首先我们需要前往[Oracle官网](http://www.oracle.com/technetwork/java/javase/downloads/)下载JDK，这里我下载了JDK SE Development Kit 10。然后将它移动到我们的用户文件夹中。

```sh
$ cp /mnt/c/Users/MegaX/Downloads/jdk-10_linux-x64_bin.tar.gz jdk-10_linux_x64_bin.tar.gz
```

然后解压JDK：

```sh
$ tar -zvxf jdk-10_linux_x64_bin.tar.gz
$ sudo mv jdk-10 /opt/jdk
```

配置环境变量：

```sh
$ sudo vi /etc/profile
```

在文件末尾加上下列sh语句：

```shell
JAVA_HOME=/opt/jdk
PATH=$JAVA_HOME/bin:$PATH
CLASSPATH=.:$JAVA_HOME/lib/dt.jar:$JAVA_HOME/lib/tools.jar

export JAVA_HOME ANT_HOME CLASSPATH
```

让`/etc/profile`修改后生效：

```sh
$ source /etc/profile
```

查看环境变量是否配置成功：

```sh
$ java --version
java 10 2018-03-20
Java(TM) SE Runtime Environment 18.3 (build 10+46)
Java HotSpot(TM) 64-Bit Server VM 18.3 (build 10+46, mixed mode)
```

## JDK工具

在`/opt/jdk/bin`里面有46个可执行程序，这里简单了解一些本人认为重要的工具。

* `jar`：多用途存档及压缩工具，用于打包成jar归档文件。
* `java`：Java解释器，解释`.class`文件。
* `javac`：Java编译器，将`.java`编译成`.class`字节文件。
* `javadoc`：Java文档生成工具，根据源码和注释生成HTML文档。
* `javap`：Java反汇编器。
* `jdb`：用于调试Java程序。


## Java的HelloWorld

###Java代码编译运行

```java
public class a {
    public static void main(String args[]) {
        System.out.println("Hi, world!");
    }
}
```

然后执行命令：

```sh
$ javac a.java
$ java a
Hi, world!
```

这里值得注意的是，Java对于文件和类有下列规定：

* Java的源码文件名必须和类名一致
* 一个Java文件中最多只能有一个public类
* 如果Java文件中有public类，Java文件名必须是public类的类名
* 如果Java文件中没有public类，Java文件名可以是任一类名


### Java代码打包

我们知道Java代码每个文件都会编译生成`class`字节文件，一个大的项目肯定有多个`class`。但是如果你搭建过Minecraft服务器的时候会发现，它的服务器程序只有一个`jar`文件，这就涉及到了打包的步骤。

`jar`是JDK中提供的多用途的存档和压缩工具，基于zip和zlib压缩格式，能将多个文件打包成jar归档文件。

```java
// a.java
public class a {
    public static void main(String args[]) {
        System.out.println("Hi, world!");
        b.hello();
    }
}
```

```java
// b.java
public class b {
    public static void hello() {
        System.out.println("Hello, world!");
    }
}
```

因为`a.java`和`b.java`在同一个目录，所以不需要声明`package`和`import`。(看不懂可以先忽视)

```sh
$ javac a.java
$ ls
a.class  a.java  b.class  b.java
```

虽然这里我们执行`java a`也可以执行程序，但是如果最终发布程序的时候看着有两个`class`文件会很不爽，利用`jar`可以打包它们。

```sh
$ jar cvf hi.jar a.class b.class
```

这里的`c`是指创建新的存档，`v`是生成详细输出并输出到标准输出，`f`是指定存档文件名。

如果你搭建过Minecraft服务器，肯定毫不犹豫打下下面的命令：

```sh
$ java -jar hi.jar
no main manifest attribute, in hi.jar
```

默认的归档打包是不会指明Main Class的，当然，我们可以通过增加`MANIFEST.MF`文件来指明Main Class入口，或许还有更好的办法。因为搜索无果，本人使用了下面的命令：

```sh
$ java -cp hi.jar a
Hi, world!
Hello, world!
```

## Java语法基础

### 数据类型

1. 基本数据类型
   * 逻辑型：boolean
   * 文本型：char
   * 整型：byte、short、int、long
   * 浮点型：double、float
2. 复合数据类型
   * 类
   * 接口
   * 数组


`char`是一个16位的Unicode字符，而`String`是一个类。

数据类型可分为基本类型和对象类型，因此变量类型可分为基本类型和引用类型。

打印一维数组可以使用`Array.toString(array)`，打印二维数组可以使用`Array.deepToString(array)`。

### 数据结构

Java的工具包`java.util.*`提供了很多数据结构接口，比如Set、List、Map、Queue。

* Set：HashSet、TreeSet、EnumSet
* List：LinkedList、SortedList、ArrayList
* Map：HashMap、EnumMap、TreeMap、HashTable
* Queue：BlockingQueue、DelayQueue、ArrayDeque

### 继承与接口实现

Java的继承只能是单继承，即Java的派生类最多只能拥有一个父类。但是Java的类可以有多个接口，这又满足了一些需要的多继承场景。

* `extends`：继承
* `implements`：接口

在子类中，可以通过`super`来调用父类中被重写的方法。需要注意的是，子类不能重写父类的静态方法，也不能把父类不是静态的方法重写成静态方法，只能隐藏父类的静态方法。

### 抽象类、接口和内部类

抽象类是包含一个或多个抽象方法的类，抽象方法是只有名字没有具体实现的方法，必须用`abstract`描述，抽象类也需要声明`abstract`关键字。抽象类不能实例化。

与抽象类相似，接口也是不能实例化。接口是比抽象类更抽象的类，接口里面的方法全是抽象方法，里面的变量全是final变量或static变量，接口不能拥有构造函数。接口使用关键字`interface`来声明，并使用`implements`来实现。

内部类是写在类内部的类，内部类可以看成一个普通的方法，甚至可以声明为static类。


## Java实践

### 拆箱与装箱问题

Java里面提供一种叫**包装类(wrapper)**的东西，使得基本类型有一一对应的对象类型。比如int有Integer，long有Long，char有Character。但是对象类型是引用类型，会产生下列的情况：

```java
public class a {
    public static void main(String args[]) {
        Integer i1 = 256;
        Integer i2 = 256;
        System.out.println(i1 == i2);
    }
}
```

这里的结果是`false`，但是如果我们将256改成100之后，结果就是`true`了。对于对象类型，我们应该使用`equals`来进行判断是否相等。

### 垃圾回收

垃圾回收(GC)是Java和C/C++最大的区别之一，即Java的对象是由垃圾回收器来决定何时删除的，这样程序员就不需要对内存进行管理。

但是GC的过程通常是在系统空闲时执行，如果我们需要手动进行垃圾回收，我们可以调用`System.gc()`。

`finalize()`是从Object中继承而来的方法，在GC过程中调用，负责处理对象空间的释放。如果我们要自己实现空间释放，那么我们可以重载`finalize()`方法。

### 反射

个人觉得，反射是一种元编程的技术，类似于Ruby里面的内省。利用下列代码，可以获取String类里面的所有方法。

```java
import java.lang.reflect.*;

public class a {
    public static void main(String args[]) {
        try {
            Class c = Class.forName("java.lang.String");
            Method m[] = c.getDeclaredMethods();
            for (Method item : m) {
                System.out.println(item.toString());
            }
        } catch (Throwable e) {
            System.err.println(e);
        }
    }
}
```

利用反射可以构建新类实例和新数组、访问并修改对象和类的字段、调用对象和类中的方法、访问并修改数组的元素。

### 多线程

Java中实现多线程的方式有两种：

1. 继承java.lang.Thread
2. 实现Runnable接口(推荐)


