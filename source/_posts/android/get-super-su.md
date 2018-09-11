---
title: Android | 手机获取Super Su记录
date: 2018-2-22
categories: Android
tags: Root
---

菜秀也是一个新手，所以以下的步骤实际上不是菜秀在刷机过程中一步步操作的。在途中菜秀也犯了很多错误，做了很多补救的操作。以下步骤仅供参考，如果有啥不妥不妨留言于我。

<!-- more -->

## Xiaomi 5

### Unlock BootLoader

1. 将手机的MIUI刷成开发板
2. 向小米官方申请解锁BootLoader，申请成功后消息会通过短信发到手机上
3. 将手机连接至电脑，手机关机后按`电源`+`音量减小`，进入FastBoot模式(小米又叫兔子模式)
4. 利用小米官方解锁工具解锁手机

### Unlock System Disk

1. 进入MIUI系统，`安全中心`APP，选择`应用管理`、`权限`、`开启ROOT权限`，获取Root权限(手机此时会重启获取)
2. 下载安装`Syslock`
3. 在`权限`中允许`Syslock`使用ROOT权限，并打开`Syslock`，解锁System分区

### Install TWRP(Team Win Recovery Project)

1. 下载TWRP的recovery img包
2. 利用小米解锁工具里面带有的fastboot.exe，执行下列命令，待到出现`Finish`

```shell
$ ./fastboot.exe flash recovery ./twrp.img
```

3. 小米手机按`电源`+`音量增大`，如果出现Team Win的logo就表明TWRP刷入成功了(退出TWRP的时候会提示是否安装APP，切记在未解锁System分区的时候千万别安装，会卡米。同时本人也没安装TWRP应用APP)

### Install Supersu

1. 下载Supersu卡刷包
2. 按`电源`+`音量增大`，进入TWRP界面，安装Supersu卡刷包
3. 安装成功后，清除Cache/Dalvik，选择重启手机，取消安装TWRP应用
4. 手机开机后如果出现Supersu APP则表示安装成功，可利用Supersu获取全部ROOT权限
