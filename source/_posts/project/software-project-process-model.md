---
title: Project | 软件项目过程模型与规划
date: 2019-4-19
categories: Project Management and Tools
tags:
- Software
---

本文为《系统分析与设计》课程作业，探讨一下软件项目常见的过程模型。

<!-- more -->

## 软件项目开发模型

从项目特点、风险特征、人力资源利用等三个角度来思考瀑布模型、增量模型、螺旋模型，以及分析它们的优缺点。

### 瀑布模型

瀑布模型将软件生存周期的各项活动规定为按固定顺序而连接的若干阶段工作，模型中的每个阶段都会产生循环反馈。如果发现问题，需要返回上一阶段；如果没有问题，则从该阶段流动到下一个阶段。

瀑布模型的优势在于：

* 定义了软件开发基本流程与活动，为项目提供了按阶段划分的检查点。
* 在需求是明确的情况下，当前一个阶段完成后，项目开发只需要关注后续阶段。
* 采用结构化的分析与设计方法将逻辑实现与物理实现分开，便于分工协作。

瀑布模型的缺点在于：

* 各个阶段的划分完全固定，需要大量的文档来协调配合阶段与阶段之间的工作。
* 容错问题严重，早期的错误可能等到开发后期的测试阶段才能发现。
* 依赖问题严重，由于瀑布模型的线性结构，每个阶段必须严格依赖于上一个阶段的工作成果。
* 项目可控性差，线性模型导致只有到开发后期才能得到开发成果，开发风险高。

### 增量模型

增量模型将待开发的软件系统模块化，将每个模块作为一个增量组件，分批次地分析、设计、编码和测试增量组件。增量模型可以有计划地对产品进行改进，每一次需求的更改都相当于一次增量。

增量模型的优势在于：

* 可分批次地提交软件产品，使得用户可以及时了解软件项目的进展。
* 模块化开发降低了软件开发的风险。
* 模块化开发使得团队开发灵活，模块的开发顺序可以进行适当调整。

增量模型的缺点在于：

* 不适用于难以模块化的开发项目。
* 模块的粒度难以确定，粒度太小开发效率降低，粒度太大无法运用增量模型的优势。

### 螺旋模型

螺旋模型兼顾了快速原型的迭代特征以及瀑布模型的系统化与严格监控，其最大特点是引入了其它模型不具备的风险分析。

螺旋模型的优势在于：

* 支持原型建立，使软件开发在每个迭代的开始明确方向。
* 引入风险分析，降低软件风险。
* 其快速原型的迭代特征，使得开发过程具备高灵活性。

螺旋模型的缺点在于：

* 过分依赖风险分析，如果分析出错，将导致重大损失。
* 风险分析的成本大，只适用于大型软件。

## 统一过程模型与面向对象的方法

统一过程模型具有以下三大特点：

* 软件开发是一个迭代过程。
* 软件开发是由Use Case驱动的。
* 软件开发是以架构设计为中心的。

统一软件开发过程是一个面向对象且基于网络的软件开发方法论。统一过程与其它的面向对象的软件开发过程都是将开发中面向过程的方面和其它开发组件整合在一个统一的框架内，都属于理解性的软件工具。

## 统一过程四个阶段与里程碑

统一过程的软件生命周期在时间上被分解为四个顺序的阶段。

### 构思阶段

构思阶段包括用户沟通和计划活动两个方面，强调定义和细化用例。

其里程碑为声明周期目标里程碑，评价项目基本的生存能力。

### 细化阶段

细化阶段包括用户沟通和建模活动，强调类的定义和体系结构的表示。

其里程碑为声明周期结构里程碑，为系统的结构建立管理基准。

### 构造阶段

构造阶段将设计转化为实现，并进行集成和测试。

其里程碑为初始功能里程碑，决定产品是否可以在测试环境中进行部署。

### 交付阶段

交付阶段将产品发布给用户进行测试评价，并收集用户的意见，之后再次进行迭代修改产品使之完善。

其里程碑为产品发布里程碑，要确定目标是否实现，是否开始另一个开发周期。

## 软件产品的生产发布与企业项目管理

软件企业能按固定节奏生产、固定周期发布软件产品，是因为企业通常都使用一套适合自己的软件开发过程模型，使得产品的生产在每一个迭代周期内都是需求明确、规划合理、开发有序的。

一个好的软件开发过程模型在企业项目管理中起着至关重要的作用，它可以让项目开发流程化、项目规划合理化、项目构造标准化。模型使得软件生成按固定节奏运行，在固定的开发周期内完成集成、测试、版本交付，并实现产品发布。





