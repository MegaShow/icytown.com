---
title: Windows | Linux子系统配置安装Xubuntu图形界面
date: 2018-4-12
categories: Windows
tags:
  - GUI
  - Linux
  - WSL
---

最近要开始实训了，需要用上Linux。又因为重装了Windows 1803，我就想着要不搞搞WSL的图形界面玩玩。

<!-- more -->

## 开始前的工作

首先要确保计算机已经安装好了WSL，安装的步骤大致如下：

1. 在`设置`-`更新与安全`-`开发者`中开启开发模式。
2. 在`控制面板`-`程序`-`开启或关闭Windows功能`中勾选上Windows子系统选项。
3. 进入Windows应用商店，安装Linux发行版。(这里假设安装的是Ubuntu)
4. 进入WSL，设置用户和密码。
5. 修改apt源。(非必须，建议，可以改成清华tuna源或者阿里云源，用命令`sudo apt update`更新)

## 安装Xrdp和Xubuntu

Xrdp是一个提供远程桌面服务的服务器程序，在Ubuntu上运行它，我们就可以在Windows下使用远程桌面来控制Ubuntu的GUI。

首先我们需要安装Xrdp：

```sh
[ubuntu ~] sudo apt-get install xrdp
[ubuntu ~] sudo apt-get install vnc4server tightvncserver
```

然后安装Xubuntu，这一步需要下载2G的东西，所以过程会十分漫长。

当然如果你不想安装Xubuntu，可以试试直接安装Xfce。

```sh
[ubuntu ~] sudo apt-get install xubuntu-desktop
```

在安装过程中如果中断了安装，可以重新输入上面的命令继续安装。如果提示`dpkg`错误，就按照错误信息提供的命令解决错误。在安装的最后，会出现`blueman`安装失败，这是一个Bluetooth Manager，安装失败也没事。

## 配置Xfce

```
[ubuntu ~] echo xfce4-session >~/.xsession
[ubuntu ~] sudo vi /etc/xrdp/startwm.sh
```

在`. /etc/X11/Xsession`前面加上一行文本：

```
xfce4-session
```

保存之后重启Xfce：

```
[ubuntu ~] sudo service xrdp restart
```

然后打开Windows自带的远程桌面，输入`127.0.0.1`，远程走起~ (顺便一提，如果第一次启动，会有个错误提示)

## 设置Xrdp自启动

Xrdp默认是没有自启动的，所有每次远程之前要使用service启动Xrdp。

未完待续~

## FAQ

### Firefox打不开怎么破？

Firefox打不开的原因是在Ubuntu里面 Firefox默认用户是root，所有使用我们创建的用户访问Firefox的时候会出现文件读写权限问题。

首先使用管理员权限打开Firefox：

```sh
$ sudo firefox
```

然后关闭Firefox，修改权限：

```sh
$ cd ~
$ sudo sudo chown -hR your_username:your_username .mozilla/
$ sudo sudo chown -hR your_username:your_username .cache/mozilla/
```

如果这个时候还打不开Firefox就接着执行下面的命令：

```sh
$ sudo sudo chown -hR your_username:your_username .cache/
```

