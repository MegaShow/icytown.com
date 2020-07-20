---
title: Note | Distributed Systems Concepts and Design
date: 2019-2-26
categories: Note
comments: false
tags:
- Design
---

《分布式系统：概念与设计》

<!-- more -->

# 第1章 分布式系统的特征

## 1.1 简介

分布式系统的显著特征：

* 并发
* 缺乏全局时钟
* 故障独立性

## 1.2 分布式系统的例子

* Web搜索
* 大型多人在线游戏
* 金融交易

## 1.3 分布式系统的趋势

* 泛在联网和现代互联网
* 移动和无处不在计算
* 分布式多媒体系统
* 把分布式计算作为一个公共设施

## 1.4 关注资源共享

术语**服务**表示计算机系统中管理相关资源并提供功能给用户和应用的一个单独的部分。

## 1.5 挑战

* 异构性：网络、计算机硬件、操作系统、编程语言、不同开发者完成的软件实现。
* 开放性：接口的规约和文档。
* 安全性：机密性、完整性、可用性，拒绝服务攻击、移动代码的安全性。
* 可伸缩性：资源数量和用户数量的激增。
* 故障处理：检测故障、掩盖故障、容错、故障恢复、冗余。
* 并发性
* 透明性
* 服务质量

# 第2章 系统模型

## 2.1 简介

**物理模型**是描述系统的一个最显式的方法，它从计算机及其互联的网络方面考虑系统的硬件组成。

**体系结构模型**从系统的计算元素执行的计算和通信任务方面来描述系统。

**基础模型**采用抽象的观点描述分布式系统的某个方面。

## 2.2 物理模型

  
