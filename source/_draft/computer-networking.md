---
title: Note | Computer Networking
date: 2018-9-6
categories: Note
comments: false
tags:
  - Network
  - Design
---

《计算机网络：自顶向下方法》。

<!-- more -->

# 第1章 计算机网络和因特网

## 1.1 什么是因特网

因特网是一个世界范围的计算机网络。

连接到因特网的设备称为**主机(host)**或**端系统(end system)**，端系统通过**通信链路(communication link)**和**分组交换机(packet switch)**连接到一起。发送端系统将数据分段，形成的数据包称为**分组(packet)**。

分组交换机中最著名的类型是**路由器(router)**和**链路层交换机(link-layer switch)**，链路层交换机通常用于接入网中，而路由器通常用于网络核心中。

端系统通过**因特网服务提供商(Internet Service Provider, ISP)**接入因特网。

## 1.2 网络边缘

**接入网(access network)**是指将端系统连接到其**边缘路由器(edge router)**的物理链路。宽带住宅接入有两种最流行的类型：**数字用户线(Digital Subscriber Line, DSL)**和电缆，除此之外还有新兴技术**光纤到户(Fiber To The Home, FTTH)**。

光纤分布体系结构：主动光纤网络(Active Optical Network, AON)、被动光纤网络(Passive Optical Network, PON)。

物理媒体划分为两类：**导引性媒体(guided media)**，如光缆、双绞铜线、同轴电缆；**非导引型媒体(unguided media)**，如无限局域网、数字卫星频道。

## 1.3 网络核心

端系统之间交换的数据叫**报文(message)**。多数分组交换机在链路的输入端使用**存储转发传输(store-and-forward transmission)**机制，指在交换机能够开始向输出链路传输该分组的第一个bit之前，必须接收到整个分组。

