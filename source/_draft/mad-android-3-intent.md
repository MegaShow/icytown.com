---
title: Android | 移动应用开发(3) Intent等应用
date: 2018-8-10
categories: Android
tags: Android
---

Android移动应用开发系列文章是本菜秀在《移动应用开发(MAD)》课程上的笔记，旨在加深自己对Android开发的认识，所以可能会排版无比奇葩。当然，这里不仅仅局限于课程上学到的东西，菜秀尽力分享更多东西。如果学疏才浅的菜秀有啥错误，欢迎指正。

本文是本系列的第三篇文章，重点是了解Android的Intent、Bundle、RecyclerView、ListView。

<!-- more -->

# 移动应用开发(3) Intent等应用

## Week7 事件处理

### Android Framework

* Activities：管理应用程序的展示。
* Services：管理后台服务。
* Broadcast Receivers：管理事件的广播与接收。
* Content Provider：管理数据共享。

### Android消息传递

* 组件之间：Intent
* 人机之间：Listener
* 线程之间：handler、Eventbus

### Intent

Intent的组成分成6部分：Component Name、Action、Data、Category、Extra、Flag。

IntentFilter用于描述一个Activity或IntentReceiver能够操作哪些Intent，可以在`AndroidManifest.xml`中静态定义。

IntentReceiver用于获取Intent通知，在`AndroidManifest.xml`中注册，也可以在代码中使用Context.registerReceiver()进行注册。

### Bundle

Bundle是一个类型安全的容器，是对HashMap的封装。Bundle的值只能是基本类型或基本类型数组，而HashMap的值可以是任何对象。

