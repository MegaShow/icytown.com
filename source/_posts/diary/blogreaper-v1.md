---
title: Diary | BlogReaper.v1总结
date: 2018-12-16
categories: Diary
tags:
  - XMatrix
---

BlogReaper的第一版本的开发基本已经完成了，接下来就是更换数据库的小更新v1.1，在重构代码之前本人也不再想碰这个项目了，换数据库的任务就交给队友了。

在这里呢，总结一下这次开发所学到的东西吧，以及写一些自己心里的感想。(由于这篇文章挂着Diary的分类，所以我会写得很随心)

## 项目

[BlogReaper](https://feed.xmatrix.studio/)名为博客收割机，实际上也是`BlogReader`。其实质上是一个高级的在线RSS、ATOM阅读器，通过添加自己感兴趣的RSS、ATOM源，可以正在这里分类浏览感兴趣的信息，第一时间阅读感兴趣的信息，而不需要到各个网站分别浏览。(抄袭啦！)

博客收割机这个项目主题是由我首先提出的，并同Zhenly大佬共同确认的。其实嘛，我一开始是想做纯粹的收割机，只收割认证的博客，一开始我定下来的项目名叫`Blog Machine`或者`Blog Resource Machine`。不过Zhenly大佬誓死不从，于是最后变成了`Blog Reaper`。(受死吧皮皮真！)

随着Zhenly大佬参考了feedly等网站，我们的博客收割机就慢慢变成了RSS、ATOM中转站了。

这个项目是《服务计算》课程上的作业，要求是做一个前后端分离的项目，比如“极简博客”。为什么不做极简博客呢？【广告】[IceCream](https://github.com/XMatrixStudio/IceCream)是一个由Golang实现的(伪)轻量化博客框架，也是我上个学期的《数据库》课程的作业。既然已经实现过类似的东西了，那当然要换个东西玩。不过冰淇淋并不是前后端分离，因为冰淇淋本身就是模仿hexo、gohuge设计的。不过随着冰镇重新回归到hexo大家庭，冰淇淋已经夭折且不会再更新。(其实在等待转型)

## 技术

本菜秀在收割机的开发中，负责后端的架构搭建、GraphQL API设计。在开发中，使用了以下的库。

* [99designs/gqlgen](https://github.com/99designs/gqlgen)：GraphQL API代码生成库，Schema First，因此很舒服。
* [go-chi/chi](https://github.com/go-chi/chi)：路由库，选择它是因为gqlgen的文档范例用了它，没别的原因。
* [kataras/go-session](https://github.com/kataras/go-sessions)：Session库，非常小众，随便选的，其作者是iris和muxie的作者。
* [PuerkitoBio/goquery](https://github.com/PuerkitoBio/goquery)：本来是搜类似jsoup的Golang库，然后搜到了这个。
* [globalsign/mgo](https://github.com/globalsign/mgo)：并不是用了MongoDB，而是提供BSON服务。
* [boltdb/bolt](https://github.com/boltdb/bolt)：BoltDB，键值对数据库。
* [XMatrixStudio/Violet.SDK.Go](https://github.com/XMatrixStudio/Violet.SDK.Go)：紫罗兰的Golang版本SDK。

接下来就一一谈一下我对这些库的使用感想和看法吧。

### 关于GraphQL

Golang的GraphQL库比较著名的有`gqlgen`、`gophers/graphql-go`、`graphql-go/graphql`。第三个是Star数量最多的，但是第三个是runtime types，写起代码很蛋疼，排除掉。剩下两个都是Schema First，也就是所谓的模式优先，代码写起来特别舒服。由于`gqlgen`文档比较多，看起来这个项目是被组织直接用于他们的产品，于是采用`gqlgen`。

`gqlgen`的确很优秀，也让我这个第一次接触GraphQL的菜鸡了解到了面向GraphQL API编程的乐趣，也了解到Resolve到底是个什么概念。不得不说，GraphQL和RESTFUL相比，其优点就在于各种复杂嵌套的Resolver。不过嘛，我觉得`gqlgen`不能强制生成所有Resolver这一点很蛋疼，除了默认的Query、Mutation、Subscription之外，需要在配置文件中指定强制生成的Resolver。虽然我不知道不强制生成的理由，不过既然都是写出来的约束条件了，那肯定是有用的，那就应该生成相应的Resolver呀。

其次，个人感觉GraphQL适合和关系型数据库结合使用。相比RESTFUL，GraphQL是用来解决一次请求拿到的数据有限的情景的。对于关系型数据库，通常需要使用第三范式来设计数据库，这时候用Resolver来约束相关数据的获取是很舒服的。但是对于非关系型数据库，相关数据通常都存储到同一个Document内，这时候用Resolver感觉会有数据冗余的情景发生。

当然，我个人还是觉得，不规范的RESTFUL最舒服。

### 关于Chi

Golang的路由库千篇一律，没啥好聊的。前面也说了，选择它纯粹是因为gqlgen文档范例用了它，复制粘贴方便。

### 关于Go-Session

可能算是第一次手动操作Session？之前都是使用Iris，Session都是web库实现好的，只要按文档引入就可以使用了。

不过，不得不说，往GraphQL的Resolver里面封装Session真的很蛋疼。而且，test关于Session有一个BUG，至今没有修复，完全不知道该怎么修复。

### 关于GoQuery

项目中用了GoQuery来获取文章的第一张图片，语法也是跟jQuery、jsoup一样，使用了选择器的语法，用起来很舒服。

### 关于Bolt

第一次接触基于键值对的数据库，看起来很新颖，适合玩玩。如果在实际项目中使用基于键值对的数据库，那恐怕维护起来是个灾难。并且貌似网上对Bolt的评价不是很好呀，都说速度慢。

### 关于Violet

Zhenly大法好。

## 闲谈

本次项目开发周期太短了，由于平时各种杂七杂八的事情，导致只有一周的时间开发收割机。为了尽快完成项目，Zhenly大佬砍掉了前端的几个页面，而后端的设计也是比较粗糙的。

在API的设计上，由于前期的设计失误，以及代码耦合度过高，导致我学会使用Resolver的时候，部分API已经不敢且没有办法改动了。因此部分API的效率是极低的，会在后端产生大量冗余数据，即使前端不需要。因此后面实现的API逻辑和前面的API逻辑有蛮明显的区别。

其次，在数据库的设计上也严重失误了。因为一开始不知道需要迁移到MySQL，设计上都是比较偏向NoSQL设计模式设计的，并且数据库采用BSON存储。如果要迁移到MySQL，我不敢想象这个工程量......(于是我开始寄希望于我的队友，你们加油~)

最后嘛，感觉紫罗兰是时候要升级了，不然包括测试、使用都好难受啊。(逃~



