---
title: Tool | lrun的简单使用
date: 2017-8-19
categories: Tool Usage and Wiki
---

最近组织决定对XMOJ的评测姬进行重构，我在想要不就把沙盒的事情也落实了。但又碍于自己水平低下，只能在网上各种搜索沙盒实现等资料。某天偶然在V2EX上看到一些关于QDOJ的帖子，在评论区发现有人在聊lrun，去百度了一下，发现还是不错，于是决定研究一波。

<!-- more -->

## lrun介绍

Github上[lrun](https://github.com/quark-zju/lrun)的介绍是Run programs on Linux with resources (ex. time, memory, network, device, syscall, etc.) limited。顾名思义就是一个简单的沙盒轮子了，据说是ZOJ的产物。不过V2EX上说lrun与docker不兼容，暂时不知道什么情况，先用着再说。

## lrun安装

### Dependencies

* Linux(这里用的是CentOS)
* GNU GCC/G++
* libseccomp开发包(CentOS可通过`yum install libseccomp-devel`安装)
* rake
* Git

### Installation

先下载lrun源码

```shell
[centos ~]# git clone https://github.com/quark-zju/lrun.git
[centos ~]# cd lrun
```

然后编译并安装lrun

```shell
[centos lrun]# make install
```

添加用于跑lrun的用户和用户组

```shell
[centos ~]# useradd lrun_user
[centos ~]# groupadd lrun
[centos ~]# gpasswd -a lrun_user lrun
```

查询lrun_user的uid与gid

```shell
[centos ~]# id lrun_user
uid=1000(lrun_user) gid=1000(lrun_user) 组=1000(lrun_user),1001(lrun)
```

### Run

下面写了一个c的程序，并编译成`a.out`。

```c
#include <stdio.h>

int main() {
    printf("hello, world!\n");
  	while (1) ;
  	printf("test failed!\n");
}
```

跑lrun：

```#shell
[centos ~]# lrun --uid 1000 --gid 1000 --max-real-time 1.0 ./a.out
hello, world!
```

## lrun参数

#### --max-real-time

限制程序运行的实际时间

```c
#include <stdio.h>

int main() {
    printf("hello, world!\n");
  	while (1) ;
  	printf("test failed!\n");
}
```

```shell
[centos ~]# lrun --uid 1000 --gid 1000 --max-real-time 1.0 ./a.out 3>&1
hello, world!
MEMORY   131072
CPUTIME  1.003
REALTIME 1.000
SIGNALED 0
EXITCODE 0
TERMSIG  0
EXCEED   REAL_TIME
```

#### --max-memory

限制程序运行的内存

```c
#include <stdio.h>
#include <stdlib.h>

int main() {
        printf("hello, world!\n");
        while (1) {
                malloc(1000);
        }
        printf("test failed!\n");
}
```

```shell
[centos ~]# lrun --uid 1000 --gid 1000 --max-memory 1000000 ./a.out 3>&1
hello, world!
MEMORY   999424
CPUTIME  0.027
REALTIME 0.045
SIGNALED 1
EXITCODE 0
TERMSIG  9
EXCEED   none
```

不知道这里为什么EXCEED是none，MEMORY一直达不到1000000。

