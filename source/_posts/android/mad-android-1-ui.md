---
title: Android | 移动应用开发(1) 基本UI界面设计
date: 2018-8-2
categories: Android
tags: Android
---

Android移动应用开发系列文章是本菜秀在《移动应用开发(MAD)》课程上的笔记，旨在加深自己对Android开发的认识，所以可能会排版无比奇葩。当然，这里不仅仅局限于课程上学到的东西，菜秀尽力分享更多东西。如果学疏才浅的菜秀有啥错误，欢迎指正。

本文是本系列的第一篇文章，重点是先初步认识Android开发。

<!-- more -->

# 移动应用开发(1) 基本UI界面设计

## Week1 智能手机

### Android、iOS

智能手机的操作系统主流的有Android、iOS，非主流有Windows Phone。不过随着微软官方宣告Windows Phone计划失败之后，市场手机OS基本就剩下Android、iOS了。想当初高中刚刚入学的时候，IT一堆人都人手一部Lumia呢！

先来看看iOS，从系统上看，首先我们需要了解一个叫Darwin的操作系统内核。Darwin是苹果公司开发的XNU操作系统内核，作为iOS、macOS的内核存在，其中XNU是X is Not Unix的缩写。iOS分为核心操作系统层(the Core OS Layer)、核心服务层(the Core Services Layer)、媒体层(the Media Layer)、触控应用层(the Cocoa Touch Layer)。

iOS应用开发一般都是采用XCode，所以必不可少需要macOS，如果是只有普通的PC或者Laptop，那么必然需要装黑苹果了。iOS开发所使用的编程语言通常是Objective-C和Swift，其中Swift是由苹果设计和发布的编程语言，苹果官方有意让Swift替代Objective-C成为iOS、macOS的首选开发语言。从语言的层面上看，Swift比Objective-C更加优雅，但是在iOS开发上两者还是不能分胜负，这一定程度上也是因为iOS系统类库早期设计考虑的因素。

iOS开发需要获取开发者证书，开发者证书每年99美元，并且苹果官方并没有提供学生免费或优惠的政策。

接下来我们看看Android，Android是Google推出，由Google和OHA共同开发的基于Linux内核的移动操作系统。其最初版本基于Linux 2.6，2017年发布的Android O基于Linux 3.4。很多人都说Android不算是Linux发行版，因为Android所使用的Linux内核是经过了大量修改的。不过我个人很喜欢下面的看法，Android是一个Linux发行版，但不是GNU/Linux发行版，因为Android移除了所有GNU套件。即使是修改了Linux内核，但怎么说都是属于Linux的一个分支。

Android应用开发工具一般采用Android Studio，这是一个基于IntelliJ IDEA的IDE。其开发所用的编程语言通常是Java，官方也曾经支持用Kotlin来开发Android应用，这是一门与Java紧密结合的编程语言。同时，值得注意的是，Android内部集成了Android Runtime(ART)作为Java虚拟机(Dalvik虚拟机已经被ART取代了)。

Android相比iOS最大的劣势就是系统、硬件分裂太严重，太碎片化。iOS的机型是可以数的清楚的，而且同时代机型配置相差都不大。而Android由于开放的缘故，同时代的机型配置、屏幕分辨率、所支持最高的SDK版本等都有明显区别，开发测试难度加大。

### Web OS

理想很丰满，现实很骨感。

个人感觉基于Web的OS本质上没有什么优势，也没有什么亮点，实用性不如本地OS。

### Native APP、Web APP

Native APP就是我们所开发的本地应用，而Web APP就是类似微信小程序的东东，Chrome貌似也支持Web APP。

## Lab 开发环境

本节将在WSL Ubuntu 18.04下配置Java和Kotlin的Stand Alone编译器，已提前更换至[清华大学TUNA镜像源](https://mirrors.tuna.tsinghua.edu.cn/help/ubuntu/)。

### Java

这里将安装Java的开源版本OpenJDK 11。

```sh
$ sudo apt install openjdk-11-jdk
```

检查Java安装是否成功。

```sh
$ java --version
```

编写Java的hello world程序`a.java`。

```java
class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, world!");
    }
}
```

编译运行。

```sh
$ javac a.java
$ java HelloWorld
```

### Kotlin

这里采用`SDKMAN!`包管理工具来安装Kotlin，官方也提供了其他包管理工具的教程，如果不想用`SDKMAN!`可以去官方查资料。Kotlin依赖于Java运行，所以要先安装好Java。

安装`SDKMAN!`。

```sh
$ curl -s https://get.sdkman.io | bash
```

如果提示找不到`unzip`命令，则需要安装`unzip`和`zip`。

```sh
$ sudo apt install unzip zip
```

接下来重启终端并安装Kotlin。

```sh
$ sdk install kotlin
```

检查Kotlin安装是否成功。

```sh
$ kotlin -version
```

编写Kotlin的hello world程序`a.kt`。

```kotlin
fun main(args: Array<String>) {
    println("Hello, world!")
}
```

编译运行。

```sh
$ kotlinc a.kt -include-runtime -d a.jar
$ java -jar a.jar
```

## Week2 平台概述

### Android的特点

* Linux内核：Android O基于Linux 3.4。
* 源代码开放：Linux kernel采用GPL v2协议，Android Framework采用Apache 2.0协议。
* ART虚拟机：兼容运行Dex字节码，支持预先(AoT)编译。
* WebView组件：Android 4.4以前采用WebKit内核，Android 4.4开始采用Chromium内核。
* SQLite数据库：`android.database.sqlite `包中封装了SQLite操作。

### Android HAL

[这篇文章](https://www.ifanr.com/92261)很好，以下观点记录来源于该文章的观点和评论的观点。

硬件抽象层(Hardware Abstract Layer)是将Android Framework和Linux kernel区分开的驱动层，这样Android Framework就不需要考虑驱动程序的差异而进行不一样的开发了。

很多地方都说HAL是为了规避GPL约束而诞生的，不可否认会有这种因素。但是要值得注意的是，HAL在很多操作系统中普遍存在，其设计用于简化驱动的开发。

Bionic libc取代glibc的目的不是为了规避GPL约束，而是精简运行时开销。不过Bionic libc的确暴露了更多的内核API。其次取代glibc对GPL约束没有任何影响，因为glibc是LGPL协议，动态链接不受GPL污染。

### 设计模式

Android系统的框架层采用了大量的设计模式，其中部分如下：

#### MVC

模型-视图-控制器架构(Model-View-Controller)，下面是一个JavaScript的MVC模型，来源于Wikipedia。

```javascript
/** 模擬 Model, View, Controller */
var M = {}, V = {}, C = {};

/** Model 負責存放資料 */
M.data = "hello world";

/** View 負責將資料輸出到螢幕上 */
V.render = (M) => { alert(M.data); }

/** Controller 作為一個 M 和 V 的橋樑 */
C.handleOnload = () => { V.render(M); }

/** 在網頁讀取的時候呼叫 Controller */
window.onload = C.handleOnload;
```

#### Template Method

模板方法模式，定义了一个算法的步骤，并且允许子类分别为一个或多个步骤提供实现。

模板方法中的方法分为模板方法(Template Method)和基本方法(Primitive Method)。模板方法是总算法或总行为的方法，定义在抽象类并由子类不加修改地继承下来。基本方法又分为抽象方法、具体方法、钩子方法。抽象方法由抽象类声明，由子类实现；具体方法由抽象类声明并实现，子类不实现或置换；钩子方法由抽象类声明并实现，而子类会加以扩展。

```java
abstract class Algorithm {
    protected final void templateMethod() {
        abstractPrimitiveMethod();
        implementedPrimitiveMethod();
        defaultPrimitiveMethod();
    }

    protected abstract void abstractPrimitiveMethod();

    private final void implementedPrimitiveMethod() {
        System.out.println("Algorthm: implementedPrimitiveMethod");
    }

    protected void defaultPrimitiveMethod() {
        System.out.println("Algorthm: defaultPrimitiveMethod");
    }
}

final class ConcreteAlgorithm extends Algorithm {
    @Override
    protected void abstractPrimitiveMethod() {
        System.out.println("ConcreteAlgorthm: abstractPrimitiveMethod");
    }
}

class Main {
    public static void main(String[] args) {
        ConcreteAlgorithm c = new ConcreteAlgorithm();
        c.templateMethod();
    }
}
```

#### Factory Method

工厂方法模式，定义了一个创建对象的接口，由实现该接口的类来决定实例化哪个类。工厂是负责创建其他对象的对象，通常该对象含有多个方法，用来决定创建的对象的类型。

#### Observer

观察者模式，每一个对象都依赖于一个或多个观察者对象，并在该对象本身的状态发生改变的时候主动发出通知，告知观察者该变化，观察者做出相应的回应。

#### Abstract Factory

抽象工厂模式，将同一类工厂封装起来，在需要使用工厂的时候，实现抽象工厂的具体实现。

#### Adapter

适配器模式，适配器将一个类的接口转换成用户所期待的，可以使得接口不兼容的类正常工作。

#### Composite

组合模式，也叫部分-整体模式，将对象层次地组合成树形结构，模糊了简单元素和复杂元素的概念，使得用户可以像处理简单元素一样处理复杂元素。

#### Strategy

策略模式，对象的某个行为在不同场景下有不同的实现。

#### State

状态模式，对象的内部状态决定了对象的行为。

#### Proxy

代理模式，给目标对象提供一个代理对象，由代理对象来控制对目标对象的引用。相当于引入一个代理对象，来间接访问目标对象。在某些情况下，直接访问目标对象时，获取目标对象的引用的复杂度很高，可以利用代理对象来获取目标对象的引用。

#### Bridge

桥接模式，把事物对象和其具体行为、具体特征分离开来，使它们可以各自独立的变化。 

#### Iterator

迭代器模式，可以让用户透过特定的接口遍历容器中的每一个元素而不用了解底层的实现。 

#### Mediator

中介者模式，又叫调停者模式，中介者使各对象不需要显示地相互作用，而是由中介者负责各对象之间的作用。

#### Facade

外观模式，又叫门面模式，为子系统中的一组接口提供一个统一的高层接口。

#### IoC

控制反转(Inversion of Control)，对象在被创建的时候，由一个调控系统内所有对象的外界实体，将其所依赖的对象的引用传递给它。主要方法有依赖注入(Dependency Injection)和依赖查找(Dependency Lookup)。

### Android系统架构

Android架构可以分成4层，分别是：

* 应用程序(Applications)
* 应用程序框架(Applications Frameworks)
* 系统运行库与Android运行环境(Libraries & Android Runtime)
* Linux内核(Linux Kernel)

#### 应用程序

Activity类的实例负责显示窗口，以前台模式运行；Service类的实例以后台模式运行。

#### 应用程序框架

* Views：可扩展视图
* Content Providers：内容提供器，使得应用程序访问其它应用程序的数据，或共享数据。
* Resource Manager：资源管理器，提供非代码资源的访问。
* Notification Manager：通知管理器，使得应用可以在状态栏中显示自定义的提示信息。
* Activity Manager：活动管理器，管理应用的生命周期并提供常用的导航回退功能。

#### 系统运行库与Android运行环境

* Bionic libc 标准C函数库
* OpenCore媒体库
* SQLite
* FreeType

#### Linux内核

基于Linux 3.4。

## Week3 开发入门

### 安装Android Studio

下载Android Studio并安装。

第一次启动Android Studio会提示需要下载并安装Android SDK，这里建议下载最新的Android版本的SDK(原因接下来说明)。

因为总所周知的缘故，Android SDK无法正常下载。如果有科学上网的途径可以去`Settings-Proxy`中设置代理，如果没有，可以使用下面的下载方法。

1. 进入[ChinaZ](http://ping.chinaz.com/)，ping网址`dl.google.com`。
2. 选择响应时间相对低的IP，将其添加入HOSTS里面。
3. 关闭`Settings-Proxy`中的代理设置，下载SDK。

如果上述方法依然无法下载，可以尝试搜索相关的代理，比如东软Android SDK代理。

### 新建Android项目

打开Android Studio，新建Android新项目。

**Create Android Project**:

|       Name       |            Note            |
| :--------------: | :------------------------: |
| Application name |           应用名           |
|  Company domain  |   公司域名，用于生成包名   |
| Project location |          项目路径          |
|   Package name   | 包名，自动生成，不可自定义 |

可选包含C++、Kotlin支持。

**Target Android Devices**:

设置最低支持的SDK，该SDK可以不被下载安装。

**Add an Activity to Mobile**:

选择默认模板。

**Configure Activity**:

设置上一个选项中选择的模板的活动类名、布局文件名。

### Android应用工程文件

|                Name                |                             Note                             |
| :--------------------------------: | :----------------------------------------------------------: |
| `app/src/main/AndroidManifest.xml` |  项目的配置文件，声明应用的主Activity、Service、Receiver等   |
|        `app/src/main/java/`        |                           代码目录                           |
|        `app/src/main/res/`         | 资源目录，`drawable`放置图片资源，`layout`放置布局资源，`values`放置字符串(string.xml)、颜色(colors.xml)、样式(styles.xml)、尺寸资源(dimens.xml) |

Android Studio利用Gradle来实现自动化构建，Gradle是Android Studio默认的build工具，是一个依赖管理、自动化编译测试部署打包工具。Gradle使用基于Groovy的特定领域语言(DSL)来声明项目设置。

#### Android Manifest

项目配置文件制定了程序的入口点。

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.icytown.mad.helloworld">
    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme">
        <activity android:name=".MainActivity">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
```

`application`标签定义了应用的属性，`activity`定义了活动的属性，`intent-filter`负责筛选广播。

#### Build Gradle for APP

`build.gradle`位于文件夹`app/`下，用于设置SDK版本和jar包依赖等信息。

```groovy
apply plugin: 'com.android.application'

android {
    compileSdkVersion 28
    defaultConfig {
        applicationId "com.icytown.mad.helloworld"
        minSdkVersion 23
        targetSdkVersion 28
        versionCode 1
        versionName "1.0"
        testInstrumentationRunner "android.support.test.runner.AndroidJUnitRunner"
    }
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}

dependencies {
    implementation fileTree(dir: 'libs', include: ['*.jar'])
    implementation 'com.android.support:appcompat-v7:28.0.0-beta01'
    implementation 'com.android.support.constraint:constraint-layout:1.1.2'
    testImplementation 'junit:junit:4.12'
    androidTestImplementation 'com.android.support.test:runner:1.0.2'
    androidTestImplementation 'com.android.support.test.espresso:espresso-core:3.0.2'
}
```

这里的SDK版本有三个设置参数：

* `compileSdkVersion`：编译SDK版本，告诉Gradle使用哪个版本的SDK编译你的应用。修改该版本不会影响运行时行为，但是能获得额外的编译警告消息，比如某API在新版本已被弃用。所以建议编译SDK版本选择最新的版本。
* `minSdkVersion`：最低SDK版本，即设备运行该应用的最低要求。该SDK版本会影响能运行该应用的设备数量比重，可以参考Google Play每日访问设备数据来选择最低SDK版本。
* `targetSdkVersion`：目标SDK版本，Android提供向前兼容的手段。API在某个版本的行为可能受到了修改，而决定该API行为的是目标SDK版本。该API在目标SDK版本下是什么行为，编译运行的行为就是什么行为。

因此，SDK版本需要保证`minSdkVersion` $\le$ `targetSdkVersion` $\le$ `compileSdkVersion`。

#### Build Gradle for Project

`buidl.gradle`位于项目根目录，用于配置脚本自身需要的资源、仓库地址等。

#### Settings Gradle

`settings.gradle`位于项目根目录，用于选择编译所包含的module。

```groovy
include ':app'
```

### 第一个Android程序

#### 代码

选择不导入或导入Kotlin支持，创建两个Android项目，得到如下的代码。

```java
package com.icytown.mad.helloworld;

import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;

public class MainActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
    }
}
```

```kotlin
package com.icytown.mad.helloworld

import android.support.v7.app.AppCompatActivity
import android.os.Bundle

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
    }
}
```

AppCompatActivity的继承关系如下，是活动类的扩展。

```
java.lang.Object
  android.content.Context
    android.content.ContextWrapper
      android.view.ContextThemeWrapper
        android.app.Activity
          android.support.v4.app.FragmentActivity
            android.support.v7.app.AppCompatActivity
```

setContentView会将设置活动的布局界面，这里的R是一个自动生成的类，其里面的资源来自资源文件夹。比如`R.layout.activity_main`即是文件`app/src/main/res/layout/activity_main.xml`的布局界面，所有资源都是以这种形式引用并使用。

下面是Activity的主要的方法：

|               Name               |                             Note                             |
| :------------------------------: | :----------------------------------------------------------: |
|        `onCreate(Bundle)`        | 活动第一次创建时调用，参数以键值对形式存储上一次活动关闭的状态 |
|           `onStart()`            | 在活动已经显示但是仍无法和用户交互时调用，该方法可以直接绕过`onResume()`、`onPause()`直接执行`onStop()` |
|           `onResume()`           |               调用该方法后，活动即可与用户交互               |
|           `onPause()`            | 离开活动时调用，用于存储变化的数据和停止动画等消耗CPU的工作  |
|            `onStop()`            |                      活动不再显示时调用                      |
|          `onDestory()`           |                       活动被销毁时调用                       |
|          `onRestart()`           |      活动重启时调用，在`onStop()`之后、`onStart()`之前       |
|  `onSaveInstanceState(Bundle)`   |        非正常应用行为销毁活动时调用，用于存储某些状态        |
| `onRestoreInstanceState(Bundle)` |                  只在存在要恢复的状态时调用                  |

#### 布局

```xml
<?xml version="1.0" encoding="utf-8"?>
<android.support.constraint.ConstraintLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    tools:context=".MainActivity">

    <TextView
        android:id="@+id/textView"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Hello World!"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintLeft_toLeftOf="parent"
        app:layout_constraintRight_toRightOf="parent"
        app:layout_constraintTop_toTopOf="parent" />

</android.support.constraint.ConstraintLayout>
```

`ConstraintLayout`是Android Studio 2.2引入的新的样式配置方案，相比其他样式配置方案，更加适合用于可视化构建布局。

## Week4 界面编程上

### UI概览

Android应用中的所有用户界面元素都是使用View和ViewGroup对象构建而成的，其中上一节的TextView是View的子类，ConstraintLayout是ViewGroup的子类。View负责在屏幕绘制交互内容，ViewGroup负责存储View和ViewGroup而定义界面的布局。

Android应用开发支持不同的度量单位，提倡采用与分辨率无关的度量单位来开发程序。通常sp作为文字大小的单位，而dp作为其他元素的单位。

### Layout布局

* 线性布局Linear Layout：按水平或垂直的顺序将子元素依次排序。
* 相对布局Relative Layout：允许子元素指定它们相对于其它元素或父元素的位置。
* 约束布局Constraint Layout：布局受三类约束，分别是其它视图、父容器、基准线。
* 表格布局Table Layout：与TableRow配合使用，布局可以放多个控件，但是一行(列)只能放一个控件。
* 帧布局Frame Layout：视图以层叠方式展示，最后一个添加到框架布局中的视图显示在最上面。
* 网格布局Grid Layout：相当于线性布局的嵌套布局，按网格划分，子视图可以占用一格或多格。

## Lab1 基本UI界面设计

### 新建活动、布局

创建Android项目的时候如果选择Empty Activity即可创建一个空的活动、布局，就不需要执行本节的操作了。不过为了尝试手动创建活动，本节新建项目的时候选择Add No Activity。

新建项目之后，在包名里面创建类MainActivity。

```java
package com.icytown.mad.java;

import android.support.v7.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {
}
```

这时候会提示MainActivity未在Manifest中注册，将光标移动至MainActivity出，`ALT+ENTER`可以选择将该活动添加至Manifest中。不过这个时候程序仍然是不能运行的，因为没有指定程序运行时的主活动，需要修改`AndroidManifest.xml`。

```xml
<activity android:name=".MainActivity">
    <intent-filter>
        <action android:name="android.intent.action.MAIN"/>
        <category android:name="android.intent.category.LAUNCHER"/>
    </intent-filter>
</activity>
```

这个时候就可以编译运行了，不过应用什么布局都没有。

接下来我们创建布局。

我们在`res`文件夹中创建`layout`文件夹，并创建Layout XML文件。

```xml
<?xml version="1.0" encoding="utf-8"?>
<android.support.constraint.ConstraintLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    tools:context=".MainActivity">

</android.support.constraint.ConstraintLayout>
```

这个时候，会提示找不到`android.support.constraint.ConstraintLayout`这个类，我们可以直接在提示中自动引入该包的实现，也可以去手动修改APP的`build.gradle`。

```groovy
dependencies {
    implementation 'com.android.support.constraint:constraint-layout:1.1.2'
}
```

同时需要注意，如果提示找不到AppCompat，并且无法预览XML布局的时候，即看不到应用标题栏的时候，可以尝试修改AppCompat的包的版本。

```groovy
dependencies {
    // implementation 'com.android.support:appcompat-v7:28.0.0-beta01'
    implementation 'com.android.support:appcompat-v7:28.0.0-alpha1'
}
```

给活动类添加代码。

```java
@Override
protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    setContentView(R.layout.activity_main);
}
```

### 构建布局

ConstraintLayout是一种适合于可视化构建的布局，这里有一篇[文章](https://blog.csdn.net/guolin_blog/article/details/53122387)值得阅读，就不展开记录布局过程了。

对于实现圆角的按钮，我们需要借助资源XML文件来声明按钮的背景属性，创建文件`res/drawable/button.xml`。

```xml
<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android">
    <corners android:radius="10dp"/>
    <solid android:color="#3F51B5"/>
</shape>
```

然后将按钮的background属性声明为`@drawable/button`。

### 滚动布局

我们构建完ConstraintLayout之后，正常运行会发现，如果没有锁定方向，横屏情况下部分控件可能无法显示出来，因为屏幕高度不够大。

这个时候我们可以利用ScrollView来实现布局的滚动，这样在高度不足的情况下，可以通过下拉获取无法显示的控件。

```xml
<ScrollView xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent">

    <android.support.constraint.ConstraintLayout ...>
        ...
    </android.support.constraint.ConstraintLayout>
</ScrollView>
```

## 结语

本篇文章主要是了解了Android开发的一些细节和简单的接触UI开发，那就这样结束吧。

