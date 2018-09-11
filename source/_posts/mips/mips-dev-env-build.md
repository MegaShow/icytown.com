---
title: MIPS | MIPS开发环境搭建
date: 2018-1-26
categories: MIPS
tags:
  - MIPS
  - Cross-Compile
---

菜秀的开发环境小教程，本次主要是想记录一下MIPS的开发环境搭建。MIPS是一种RISC处理器的指令集架构，或者可以说是一种体系。在早期MIPS还是各种牛逼哄哄的，据说是很多路由器都是用的MIPS处理器，国内的龙芯也是用的MIPS架构。不过等到Android和iOS反哺育ARM的时候，MIPS就已经要死要死的了。

<!-- more -->

这里菜秀接触MIPS，是因为课程的需要。我们的`计算机组成原理`学习的就是MIPS，虽然菜秀还不知道到时候学习需不需要用上这些工具，不过自己瞎折腾一下也是挺好的。相比之前学习的`x86`，`MIPS`是RISC(Reduced Instruction Set Computer)处理器，比其CISC(Complex Instruction Set Computer)要精简很多，不过相对指令就少了很多。

废话少说，快快搭建MIPS环境。

## QEMU + MIPS Linux

我们都知道，我们平时使用的电脑基本上都是`x86`架构，除非你有什么老电脑是搭载`PowerPC`的Mac，或者是`ARM`的Linux。不过这里我们涉及的都是`x86`，毕竟菜秀穷，只有一台渣渣`x86`笔记本。

既然是CPU的架构都不一样，那么我们肯定没法在`x86`上直接跑`MIPS`的代码，自然需要一个虚拟机(或者模拟器)来执行二进制程序。

### QEMU安装

这里我们选择的模拟器是QEMU，为什么选择这个呢，作为一个小菜鸡，我接触过的轻量级的模拟器只有QEMU和Bochs。Bochs只是一个IA-32平台的模拟器，而QEMU可以模拟各种CPU平台。所以自然选择了QEMU。(当然，如果你有更好的选择不妨告诉菜秀哟~)

#### Windows

QEMU在Windows环境下的安装很简单，就是下载个安装包，小白式安装，妥妥的。

QEMU Windows w64: [下载地址](https://qemu.weilnetz.de/w64/)

QEMU Windows w32: [下载地址](https://qemu.weilnetz.de/w32/)

#### Ubuntu

这里说明一下，本文中的Ubuntu都是不具有图形界面的Linux。安装命令如下：

```sh
[ubuntu ~] sudo apt install qemu
```

这里顺便说一下，在早期，QEMU在Linux和Windows下的性能区别是特别大的，不过不知道现在的区别怎么样。值得一提的是，Android Studio所用的Android模拟器就是基于QEMU开发的，当你测试APP的时候，会发现任务管理器里面有个叫`qemu-i386`的进程在疯狂吃内存。

### MIPS Linux系统安装

有多个发行版都支持MIPS，其中这些发行版包括了Debian、OpenWRT、Buildroot、Yocto、Gentoo。这里我们选择了一个比较熟悉的发行版Debian。

我们可以到Debian的官网去下载相应的MIPS镜像，这里我们会发现有MIPS、MIPSEL两个版本，其中MIPS采用的是大端法，EL采用的是小端法。这里的el是`little endian`的缩写，与之相反的则是`big endian`。

#### Debian MIPS QCOW2镜像

在Debian的官方上，早就有人专门为开发者制作出了相应的`qcow2`镜像。这个镜像实际上是个硬盘镜像，是一个已经安装好的Debian系统的镜像，`qcow2`是QEMU支持的一种镜像格式。

首先我们先在[这里](https://people.debian.org/~aurel32/qemu/mips/)下载好相应的`vmlinux`和`debian`镜像，这里的`squeeze`和`wheezy`分别是Debian 6和Debian 7，大家看个人喜好下载。在这里，菜秀下载的是[vmlinux-3.2.0-4-5kc-malta](https://people.debian.org/~aurel32/qemu/mips/vmlinux-3.2.0-4-5kc-malta)和[debian_wheezy_mips_standard.qcow2](https://people.debian.org/~aurel32/qemu/mips/debian_wheezy_mips_standard.qcow2)。

下载完之后执行下列命令来开启QEMU-MIPS(或MIPS64)：

```sh
[debian ~] qemu-system-mips64 -M malta -kernel ./vmlinux -hda ./debian.qcow2 -append "root=/dev/sda1 console=tty0"
```

其中，预装的Debian的用户名和密码都是`root`。开机会无比的慢，在操作过程也会无比的慢，网速也特别慢，不知道为什么。

进入用户交互界面之后，我们输入`gcc`是没有反应的，因为这个镜像系统是没有预装`gcc`，这里需要利用`apt-get`来安装`gcc`。不过在安装之前我们需要修改一下Debian的镜像源，因为默认的源下载速度特别慢，这里我们采用了清华TUNA的镜像源。

由于清华源推荐使用的`https`协议，而这里的镜像又不支持`https`，所以在修改源之前需要安装一个叫`apt-transport-https`的东西。

```sh
[debian ~] apt-get install apt-transport-https
```

源列表在`/etc/apt/sources.list`中。

```sh
# https will fail
deb https://mirrors.tuna.tsinghua.edu.cn/debian wheezy main
deb-src https://mirrors.tuna.tsinghua.edu.cn/debian wheezy main

deb https://mirrors.tuna.tsinghua.edu.cn/debian-security wheezy/updates main
deb-src https://mirrors.tuna.tsinghua.edu.cn/debian-security wheezy/updates main

deb https://mirrors.tuna.tsinghua.edu.cn/debian wheezy-updates main
deb-src https://mirrors.tuna.tsinghua.edu.cn/debian wheezy-updates main
```

然后更新源，安装`gcc`。

```sh
[debian ~] apt-get update
[debian ~] apt-get install gcc
```

然后就可以利用`gcc`来搞各种MIPS平台开发了。

#### Debian MIPS ISO镜像

QEMU吃了我5G内存，频繁未响应，恕我无能为力。

扔下各种链接走人：

[Building a Debian Stretch (9) QEMU image running MIPSel](https://blahcat.github.io/2017/07/14/building-a-debian-stretch-qemu-image-for-mipsel/)

[Debian on an emulated MIPS(EL) machine](https://www.aurel32.net/info/debian_mips_qemu.php)

[Installing debian "stretch" mipsel on qemu](https://gist.github.com/extremecoders-re/3ddddce9416fc8b293198cd13891b68c)

## Codescape MIPS SDK

鉴于QEMU + MIPS Linux在使用过程中体验不佳(菜秀的体验)，所以我更倾向于利用Codescape MIPS SDK来搞交叉编译。

Codescape是Imagination Technologies公司为MIPS平台开发的一套SDK工具，其能够运行于Windows和Linux。在MIPS的[官网](https://www.mips.com/develop/tools/codescape-mips-sdk)上有Codescape的下载途径， 这里菜秀只尝试了Windows的下载和安装，下载安装比较简单，所以不在多说。唯一要注意的就是SDK的MIPS型号选择，由于菜秀也不了解MIPS怎么分类，所以直接全部都勾上安装了。

安装完之后，会发现SDK上的GNU套件，分成了四类：`mips-img-elf`、`mips-img-linux-gnu`、`mips-mti-elf`、`mips-mti-linux-gnu`。

`elf`和`linux-gnu`的区别就是，一个使用的是非`glibc`库，一个使用的是`glibc`库。

至于`img`和`mti`的区别，则是处理器的区别了，由于菜秀对MIPS处理器了解不深，也不太清楚有啥区别。不过，官方给出这样的[解释](https://www.mips.com/develop/tools/codescape-mips-sdk/mips-toolchain-configurations/)。

### x86平台编译

首先我们准备了一个hello, world的C程序`a.c`。

```sh
[PS ~] mips-mti-linux-gnu-gcc a.c -o a
[PS ~] file a
a: ELF 32-bit MSB executable, MIPS, MIPS32 rel2 version 1, dynamically linked (uses shared libs), for GNU/Linux 2.6.32, with unknown capability 0x41000000 = 0xf676e75, with unknown capability 0x10000 = 0x70405, not stripped
[PS ~] ./a
-bash: ./a: cannot execute binary file: Exec format error
```

值得注意的是，这里`mti`编译的程序，才能在上面所构建的Linux中执行，并且不能添加`-static`参数，否则会报出`Invalid Instruction`的错误。

如果是`img`编译的程序，执行会报出`segmentation fault`。

### MIPS平台执行

将文件`a`通过某种途径复制到MIPS平台中的Linux中执行：

```sh
[debian ~] chmod 777 a
[debian ~] ./a
hello, world
```

不知道为啥没权限。

## 结语

其实在很多时候，如果不是要直接写MIPS汇编，我们很多时候包括编写代码、编译程序、测试，基本上都不会用到MIPS平台。毕竟高级语言是不依赖于平台的，我可以直接在`x86`下把各种代码测试好了，然后最终生成release文件的时候再拿到MIPS平台上最终测试。

其实即使是MIPS汇编，我们也有很多很神奇的工具，让我们在`x86`上工作。比如Shell遗老风格的SPIM、XSPIM、QtSPIM，说是遗老风格只是因为名字倒过来写，跟Shell很像。(表打我~)

这篇文章写到这里也差不多了，菜秀也得投身进入《Computer Organization and Design》中去学习了！

拜~

