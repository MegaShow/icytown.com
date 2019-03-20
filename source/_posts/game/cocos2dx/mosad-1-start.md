---
title: Game | Cocos2d-x游戏开发(1) Cocos2d-x初探
date: 2018-5-9
categories: Game and Computer Graphics
tags:
- Cocos2dx
---

Cocos2d-x游戏开发系列文章是本菜秀在《现代操作系统应用开发(MOSAD)》课程上的作业笔记，旨在加深自己对Cocos2d-x的认识，所以可能会排版无比奇葩。当然，这里不仅仅局限于课程上学到的东西，菜秀尽力分享更多东西。如果学疏才浅的菜秀有啥错误，欢迎指正。

本文是本系列的第一篇文章，重点是先初步认识Cocos2d-x。

<!-- more -->

# Cocos2d-x游戏开发(1) Cocos2d-x初探

[GitHub源码](https://github.com/MegaShow/college-programming/tree/master/Homework/Modern%20Operating%20System%20Application%20Development/Cocos%20-%20HelloCocos)

## Cocos2d-x安装

安装前提：

* 安装[Visual Studio 2017](https://www.visualstudio.com/)，作为IDE，安装时勾上**C++游戏开发工具**
* 安装[Python](https://www.python.org/downloads/) 2.7.x系列最新版本，写这篇文章的时候是2.7.15
* 下载[Cocos2d-x](http://www.cocos2d-x.org/download)的安装包

**注意：Cocos2d-x不支持Python 3。**(官方年年都说下一个版本支持，然而~)

安装Python的时候勾上将`python.exe`加入到`PATH`中，或者手动将Python添加到环境变量`PATH`中，然后进入命令行测试Python环境是否配置成功。

```sh
$ python --version
```

下载了Cocos2d-x的源码包之后，解压到适合的位置，然后命令行进入该目录，执行环境配置脚本：

```sh
$ python setup.py
```

执行脚本的过程中，可以跳过对`NDK_ROOT`、`ANDROID_SDK_ROOT`、`ANT_ROOT`的设置，这些是开发Android平台的工具目录环境配置。脚本执行完之后，重启终端，测试Cocos2d-x环境是否配置成功：

```sh
$ cocos
```

## Cocos2d-x引擎文件结构

### Cocos2d-x根目录文件结构

|     文件/文件夹     |                         说明                         |
| :-----------------: | :--------------------------------------------------: |
|      `build/`       |                官方编译的项目解决方案                |
|      `cmake/`       |           构建Android、iOS应用的cmake文件            |
|      `cocos/`       |          Cocos2d-x开发中使用的所有源码文件           |
|       `docs/`       |              放置Release信息以及PR要求               |
|    `extensions/`    |          扩展库目录，比如2.5D特效、网络控制          |
|     `external/`     |      第三方库目录，比如Box2D、chipmunk物理引擎       |
|     `licenses/`     |            Cocos2d-x所有使用到的库的协议             |
|      `plugin/`      |                第三方SDK插件，比如Ads                |
|    `templates/`     |        模板目录，提供各种平台新工程的项目模板        |
|      `tests/`       | 官方样例，`cpp-tests`里面包含了Cocos2d-x所有类的使用 |
|      `tools/`       | 工具目录，提供各个平台创建Cocos2d-x新项目的脚本工具  |
|       `web/`        |                Cocos2d-html5引擎目录                 |
| ` download-deps.py` |       自动下载Cocos2d-x所需的第三方插件的脚本        |
|     `setup.py`      |            配置Cocos2d-x的环境变量的脚本             |

### Cocos2d-x源码目录文件结构

|    文件/文件夹    |                             说明                             |
| :---------------: | :----------------------------------------------------------: |
|       `2d/`       | Cocos2d-x引擎核心部分，存放核心类如Sprite、Layer、Label、Menu |
|       `3d/`       |       Cocos2d-x对3D的支持，存放类如Sprite3D、Animate3D       |
|     `audio/`      |                         声音引擎源码                         |
|      `base/`      |   Cocos2d-x引擎核心部分，Ref、Director、Vector、Map、Value   |
|   `deprecated/`   | 存放2.x被废弃的规则，目的是为了兼容2.x，如`typedef Label CCLabel` |
| `editor-support/` |    对编辑器的支持，`cocosbuilder`、`cocostudio`、`spine`     |
|      `math/`      |              数学源码，`Vec2.h`、`CCGeometry.h`              |
|    `navmesh/`     |                      导航网格，自动寻路                      |
|    `network/`     |               网络控制，HttpClient、WebSocket                |
|    `physics/`     |                      物理引擎，chipmunk                      |
|   `physics3d/`    |                          3D物理引擎                          |
|    `platform/`    |                        平台不同的源码                        |
|    `renderer/`    |            引擎渲染，Texture2D、Renderer、Shader             |
|   `scripting/`    |                     JavaScript、Lua脚本                      |
|    `storage/`     |                           本地存储                           |
|       `ui/`       |                             GUI                              |
|       `vr/`       |                           虚拟现实                           |
|   `cocos2d.cpp`   |                       Cocos2d-x版本号                        |
|    `cocos2d.h`    |                   Cocos2d-x引擎核心头文件                    |

## Cocos2d-x第一个项目

### 创建新项目

Cocos2d-x提供了`cocos new`命令来创建一个新项目。输入命令`cocos new -h`可以获取创建新项目的帮助文本：

```
usage: cocos new [-h] [-p PACKAGE_NAME] [-d DIRECTORY] [-t TEMPLATE_NAME]
                 [--ios-bundleid IOS_BUNDLEID] [--mac-bundleid MAC_BUNDLEID]
                 [-e ENGINE_PATH] [--portrait] -l {cpp,lua,js}
                 [PROJECT_NAME]
```

其中`-p`指定包名，这个包名的规则与Java的包名规则一样，是域名的倒置。`-d`指定新项目所在目录，`-t`指定继承的模板。`--ios-bundleid`和`--mac-bundleid`指定相应的bundle id，这个id是iOS应用和macOS应用在App Store上的唯一标识。`-e`指定引擎的路径，这里我们可以直接忽视，我们只安装了一个Cocos2d-x版本。`--portrait`指定项目为肖像模式，也就是竖版界面，而默认的项目是横板界面，也叫风景模式。`-l`指定编程使用语言，可选`cpp`、`lua`、`js`。

如果我们需要将新项目创建为`D:\Project\HelloCocos`，那么我们可以使用下面的命令：

```sh
$ cocos new -p com.icytown.hellococos -d D:\Project -l cpp HelloCocos
```

如果我们的终端现在处于`D:\Project`目录下，那么我们可以直接输入下面的命令创建新项目：

```sh
$ cocos new -p com.icytown.hellococos -l cpp HelloCocos
```

### Cocos2d-x项目文件结构

|      文件/文件夹      |                             说明                             |
| :-------------------: | :----------------------------------------------------------: |
|      `Classes/`       |                         开发源码文件                         |
|      `cocos2d/`       | Cocos2d-x源码文件，是的，就是我们上面所说的引擎文件直接复制粘贴所得 |
|       `proj.*/`       | Android、Android Studio、iOS/macOS、Linux、Win32五种解决方案工程文件 |
|     `Resources/`      |                           资源文件                           |
| `.cocos-project.json` |                    Cocos2d-x项目配置文件                     |
|   `CMakeLists.txt`    |                          CMake脚本                           |

### 项目编译运行

首先我们进入`proj.win32`文件夹，双击打开相应的`.sln`解决方案工程文件，或者用Visual Studio 2017打开解决方案。

如果你没有打开或修改过Cocos2d-x引擎路径内的解决方案工程文件的话，开启工程之后，会提示是否重定向项目。为了更好的开发体验，我们选择确认重定向项目，将SDK设为Windows 10和VS工具版本设为v141。(如果打开过Cocos2d-x引擎目录下的解决方案，重定向了那里的工程文件，就不会提示需要重定向了)

然后我们需要在解决方案资源管理器中选择我们创建的项目`HelloCocos`，右键选中`属性`。在属性页的`常规`中，有个设置为`Windows SDK版本`，Cocos2d-x创建的项目默认使用Windows 8.1的SDK，所以我们在这里需要修改成Windows 10的SDK，本人电脑有SDK 16299、17134，这里选了Windows 10 17134的SDK。同样需要修改的项目还有`libcocos2d`和`libSpine`，一样改为Windows 10 SDK。

其实一劳永逸的方法是打开Cocos2d-x引擎路径内的解决方案工程文件，修改其SDK。毕竟创建新项目的依赖项目文件是直接从引擎路径中复制粘贴的。

配置好之后，直接点击编译运行，等待一段时间之后就可以执行我们所创建的新项目了。(过程非常久~)

**Tip**：如果提示找不到文件`msvcr100.dll`和`msvcr110.dll`，请确保安装的Visual Studio 2017已经勾上功能`Game Development with C++`(即C++游戏开发工具)。如果还是提示找不到文件，请安装相应的Runtime，`msvcr100.dll`对应[Visual C++ 2010 Redistributable Package](https://www.microsoft.com/zh-CN/download/details.aspx?id=14632)，`msvcr110.dll`对应[Visual C++ 2012 Redistributable Package](https://www.microsoft.com/zh-CN/download/details.aspx?id=30679#)。如果提示缺少别的运行库，请到微软官网搜索。

### 代码分析

让我们来看一下HelloCocos的代码，来分析一下一个最简单的Cocos2d-x程序是怎么编写的。不得不说，像Cocos2d-x、RGSS这类游戏引擎真的有很多异曲同工之处，感觉基本游戏开发都是这种结构。

Cocos2d-x的基础概念里面有导演(Director)、场景(Scene)、层(Layer)、精灵(Sprite)。一个游戏就相当于一个导演，或者说一个游戏只拥有一个导演，这个是一个单例模式，导演负责场景显示、场景切换。场景就是游戏界面，比如游戏场景、任务菜单场景、物品菜单场景、开始界面场景，而不是游戏的一个个关卡。一个场景内可以声明多个层，以模块的方式组合成一个场景。层里面可以声明多个精灵，而精灵就是一个个可移动可操作或可改变的小物品。

这跟RGSS很类似。RGSS本身就相当于一个Director，底层封装了场景显示、场景切换，而外部依靠全局变量`$scene`来改变当前场景。而场景内部，有很多直接或间接继承于`Window_Base`的类实例化的实例变量，共同布局整个场景。同时，场景内部定义了一些用户操作。这些直接或间接继承于`Window_Base`的类就相当于层，这些类里面有很多构建布局的`Sprite`或`Bitmap`。

我们可以发现HelloCocos的`Classes/`里面有四个文件：`AppDelegate.h`、`AppDelegate.cpp`、`HelloWorldScene.h`、`HelloWorldScene.cpp`。其中AppDelegate定义了应用类，内部创建和使用导演类，HelloWorldScene定义了一个HelloWorld场景。

首先我们看一下应用类的声明：

```cpp
/**
@brief    The cocos2d Application.

Private inheritance here hides part of interface from Director.
*/
class AppDelegate : private cocos2d::Application {
public:
    AppDelegate();
    virtual ~AppDelegate();

    virtual void initGLContextAttrs();

    /**
    @brief    Implement Director and Scene init code here.
    @return true    Initialize success, app continue.
    @return false   Initialize failed, app terminate.
    */
    virtual bool applicationDidFinishLaunching();

    /**
    @brief  Called when the application moves to the background
    @param  the pointer of the application
    */
    virtual void applicationDidEnterBackground();

    /**
    @brief  Called when the application reenters the foreground
    @param  the pointer of the application
    */
    virtual void applicationWillEnterForeground();
};
```

通过注释我们可以知道，应用类要通过私有继承的方式隐藏`cocos2d::Application`的一些方法和成员，用来隐藏到导演类的接口。`initGLContextAttrs`对OpenGL的Context属性初始化。`applicationDidFinishLaunching`获取导演类的实例，设置帧数，并创建应用窗体(或者没有窗体)和适配屏幕，同时跳转到初始场景。`applicationDidEnterBackground`执行应用进入后台时的任务，比如导演类停止渲染、音乐、存储等任务，与之相反的是`applicationWillEnterForeground`。

接下来我们看一下场景类：

```cpp
class HelloWorld : public cocos2d::Scene {
public:
    static cocos2d::Scene* createScene();

    virtual bool init();

    // a selector callback
    void menuCloseCallback(cocos2d::Ref* pSender);

    // implement the "static create()" method manually
    CREATE_FUNC(HelloWorld);
};
```

查看定义可以看到`createScene`是这样定义的，这个方法是在应用类跳转初始场景的时候有调用。

```cpp
Scene* HelloWorld::createScene() {
    return HelloWorld::create();
}
```

但是问题来了，在`HelloWorld`这个类里面，貌似我们没有定义`create`方法，因为有`HelloWorld::`前缀，这又不可能是调用了父类的方法。

如果刚刚认真看了`HelloWorld`类的声明，就会发现注释上已经说明了，`create`方法是用`CREATE_FUNC(HelloWorld);`手动声明的。跳转到`CREATE_FUNC`的定义，即`CCPlatformMacros.h`文件，得到下列代码：

```cpp
#define CREATE_FUNC(__TYPE__) \
static __TYPE__* create() \
{ \
    __TYPE__ *pRet = new(std::nothrow) __TYPE__(); \
    if (pRet && pRet->init()) \
    { \
        pRet->autorelease(); \
        return pRet; \
    } \
    else \
    { \
        delete pRet; \
        pRet = nullptr; \
        return nullptr; \
    } \
}
```

`create`方法首先创建一个实例，然后执行`init`和`autorelease`方法。`init`方法是我们自己定义的，主要用于初始化场景的布局。`autorelease`方法主要是将场景添加到内存管理池中，这个管理池用的貌似是引用计数法。

```cpp
Ref* Ref::autorelease()
{
    PoolManager::getInstance()->getCurrentPool()->addObject(this);
    return this;
}
```

至于`menuCloseCallback`方法，是`init`里面声明的按钮的回调方法，用来结束程序。

那么，C++的main函数在哪呢？我们在`proj.win32/`文件夹中，可以找到`main.cpp`和`main.h`中，里面定义了C++程序的入口。

```cpp
int WINAPI _tWinMain(HINSTANCE hInstance,
                       HINSTANCE hPrevInstance,
                       LPTSTR    lpCmdLine,
                       int       nCmdShow)
{
    UNREFERENCED_PARAMETER(hPrevInstance);
    UNREFERENCED_PARAMETER(lpCmdLine);

    // create the application instance
    AppDelegate app;
    return Application::getInstance()->run();
}
```

## Cocos2d-x CPP Tests

前面我们了解Cocos2d-x引擎文件结构的时候，曾提到`tests/cpp-tests/`项目里面拥有Cocos2d-x所有类的使用方法。打开这个项目的方法是，打开位于`build/cocos2d-win32.sln`的解决方案，重定向项目和设置好SDK后，直接编译运行。这个解决方案默认的项目入口就是`cpp-tests`。

## Cocos2d-x Hello World程序

任务：

* 制作自己的Hello World界面，有自己名字、学号，更换背景图片
* 设置文字样式
* 添加一个MenuItem(Label、文字、Sprite、图片)，有简单的触发事件

### HelloWorld界面

首先我们更换背景图片，我们先从项目中找到了下列代码：

```cpp
// add "HelloWorld" splash screen"
auto sprite = Sprite::create("HelloWorld.png");
if (sprite == nullptr) {
    problemLoading("'HelloWorld.png'");
} else {
    // position the sprite on the center of the screen
    sprite->setPosition(Vec2(visibleSize.width / 2 + origin.x, visibleSize.height / 2 + origin.y));

    // add the sprite as a child to this layer
    this->addChild(sprite, 0);
}
```

如果是要将图片做简单的更换，只需要修改图片的路径就可以了。但是更换图片之后会发现一个问题，图片是按实际大小显示的，如果图片过大或过小，都会导致界面很难看。我们需要利用`setScale`方法对图片进行缩放。

```cpp
auto sprite = Sprite::create("Background.png");
float scaleW = visibleSize.width / sprite->getContentSize().width * 0.3;
sprite->setScale(scaleW);
```

这样可以使得图片宽度只有应用窗体宽度的30%大小，而图片宽度高度比例保持不变。如果我们需要将图片按比例填充满场景，即`UniformToFill`的方式，可先将宽度高度需要缩放的比例计算出来，然后再确定如何缩放。

```cpp
auto sprite = Sprite::create("Background.png");
float scaleW = visibleSize.width / sprite->getContentSize().width;
float scaleH = visibleSize.width / sprite->getContentSize().height;
sprite->setScale(scaleW > scaleH ? scaleW : scaleH);
```

然后编写两个Label分别显示学号和姓名：

```cpp
auto label = Label::createWithTTF("埃希汤", "fonts/Marker Felt.ttf", 24);
if (label == nullptr) {
    problemLoading("'fonts/Marker Felt.ttf'");
} else {
    label->setTextColor(Color4B::BLACK);
    label->setPosition(Vec2(origin.x + visibleSize.width / 2, 
        origin.y + visibleSize.height - label->getContentSize().height));
    this->addChild(label, 1);
}

auto label2 = Label::createWithTTF("12345678", "fonts/Marker Felt.ttf", 24);
if (label2 == nullptr) {
    problemLoading("'fonts/Marker Felt.ttf'");
} else if (label != nullptr) {
    label2->setTextColor(Color4B::BLACK);
    label2->setPosition(Vec2(origin.x + visibleSize.width / 2, 
        origin.y + visibleSize.height - label->getContentSize().height - 
        label2->getContentSize().height));
    this->addChild(label2, 1);
}
```

这个时候你会发现只显示了label2，而label是什么都没有显示的。这是因为`fonts/Marker Felt.ttf`这个字体不支持中文，我们需要选择一个支持中文的字体，这里将第一句修改成从系统字体中创建label。

```cpp
auto label = Label::createWithSystemFont("埃希汤", "Microsoft YaHei", 24);
```

`createWithSystemFont`是一个依赖于系统环境API的方法，如果你想让你的程序跨平台，就不应该使用这个方法来创建Label，而是自己将字体文件放在资源文件夹中，用`createWithTTF`来创建Label。

编译运行之后，会发现中文都是乱码，这是因为我们的`"埃希汤"`不是Unicode编码的字符，而是普通的`char*`字符串。如果是`wchar_t`，即`L"埃希汤"`就可以正常存储Unicode编码，可是`std::string`没有接受`wchar_t*`参数的构造函数。

解决中文乱码问题我查询到了有三种方法：

* 将`char*`转换成Unicode字符集的`std::string`
* 使用iconv库
* 解析XML或者JSON文件

我们可以写一个函数，将不是Unicode字符集存储方式的字符串转换成Unicode字符集字符串。

```cpp
std::string StringToUTF8(const char* font) {
    int len = MultiByteToWideChar(CP_ACP, 0, font, -1, NULL, 0);
    wchar_t *wstr = new wchar_t[len + 1];
    memset(wstr, 0, len + 1);
    MultiByteToWideChar(CP_ACP, 0, font, -1, wstr, len);
    len = WideCharToMultiByte(CP_UTF8, 0, wstr, -1, NULL, 0, NULL, NULL);
    char *str = new char[len + 1];
    memset(str, 0, len + 1);
    WideCharToMultiByte(CP_UTF8, 0, wstr, -1, str, len, NULL, NULL);
    if (wstr) delete[] wstr;
    std::string res(str);
    if (str) delete[] str;
    return res;
}
```

虽然这种方法有效，但是据说是**效果不稳定，容易产生错误或依然乱码**。

第二个方法需要我们先include一下iconv库的头文件。

```cpp
#include "cocos2d/external/win32-specific/icon/include/iconv.h"
```

然后编写一个字符串编码转换的函数，这里本菜秀也不知道为什么编码是在`utf-8`和`gb2312`之间转换。

```cpp
std::string StringToUTF8(const char* strChar) {
    iconv_t iconvH;
    iconvH = iconv_open("utf-8", "gb2312");
    if (iconvH == 0) {
        return nullptr;
    }
    const char** pin = &strChar;
    size_t strLength = strlen(strChar);
    char *outbuf = new char[strLength * 4];
    char *pBuff = outbuf;
    memset(outbuf, 0, strLength * 4);
    size_t outLength = strLength * 4;
    if (iconv(iconvH, pin, &strLength, &outbuf, &outLength) == -1) {
        iconv_close(iconvH);
        return nullptr;
    }
    std::string res(pBuff);
    iconv_close(iconvH);
    delete[] pBuff;
    return res;
}
```

不过第二个方法是利用Windows32平台下支持的iconv库，在别的平台不一定直接支持使用该库。而且因为编写字符串编码函数也很复杂很蛋疼很难懂，所以我们一般采用第三种方法，解析XML或JSON文件。采用第三种方法的另一个原因是将字符串外置于外部资源文件中，有助于I18N的实现。

因为Cocos2d-x有内置的Dictionary类，所以这里我们实现解析XML文件的方法，而JSON不做研究。首先，我们需要将字符串写入XML文件中。

```xml
<?xml version="1.0" encoding="utf-8"?>
<dict>
    <key>name</key>
    <string>埃希汤</string>
    <key>studentId</key>
    <string>12345678</string>
</dict>
```

然后在创建Label之前读取这个文件：

```cpp
auto dict = Dictionary::createWithContentsOfFile("zh_cn.xml");
auto name = (String*) dict->objectForKey("name");
auto studentId = (String*) dict->objectForKey("studentId");
```

这时候`name`和`studentId`都是Cocos2d-x内部的`String`类指针，通过`getCString`方法可以得到其`char*`值。

```cpp
auto label = Label::createWithSystemFont(name->getCString(), "DengXian", 24);
```

### 设置文字样式

其实在上一小节中，我们已经用上了设置文字样式的代码。我们有利用`setTextColor`来设置Label中的文字的颜色，同样也可以利用`setColor`来设置Label这个节点的颜色，而不仅仅是文字。前者接受的参数是`Color4B`类型，后者接受的参数是`Color3B`类型。

我们也可以通过`setAlignment`、`setHorizontalAlignment`和`setVerticalAlignment`来改变Label的对齐方式。

当我们设置label的字体足够大的时候，会发现它的文字高度上溢出了，部分区域与label2重叠，这个时候就需要用上`setDimensions`方法了。

```cpp
label->setDimensions(label->getContentSize().width, 100);
```

### 添加MenuItem触发事件

Menu的创建需要MenuItem，MenuItem可以是多种形式，可以是图像、Label、Font等等。HelloWorld项目右下角的菜单按钮就是用的`MenuItemImage`，我们这里写一个用`MenuItemFont`实现的Menu。

`MenuItemFont`继承于`MenuItemLabel`，首先我们需要创建一个`MenuItemFont`，然后利用其创建一个`Menu`。

```cpp
auto customItem = MenuItemFont::create("Click Me", CC_CALLBACK_1(HelloWorld::menuCustomCallback, this));

if (customItem == nullptr || closeItem == nullptr) {
    problemLoading("Fail to create MenuItemFont");
} else {
    customItem->setColor(Color3B::BLACK);
    float x = origin.x + visibleSize.width / 2;
    float y = origin.y + 100 + customItem->getContentSize().height / 2;
    customItem->setPosition(Vec2(x, y));
}

auto menu2 = Menu::create(customItem, NULL);
menu2->setPosition(Vec2::ZERO);
this->addChild(menu2, 1);
```

至于这个`MenuItemFont`的回调方法，简单地写了一下一些很无趣的东西。

```cpp
void HelloWorld::menuCustomCallback(cocos2d::Ref * pSender) {
    auto menuItem = (MenuItemFont*) pSender;
    if (menuItem->getString() == "Click Me") {
        menuItem->setString("Don't Click Me");
    } else if (menuItem->getString() == "Don't Click Me") {
        menuItem->setString("Please, don't click me");
    } else {
        menuItem->setString("Emmm...");
    }
}
```