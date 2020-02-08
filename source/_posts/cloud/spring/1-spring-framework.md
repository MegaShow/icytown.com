---
title: Cloud | Spring应用开发系列(1) 初识Spring Framework
date: 2019-12-29
categories: Cloud
tags:
- Spring
---

Spring是一个为解决企业级应用程序开发复杂性而创建的开源框架，在业界使用广泛。同时，Spring家族提供了一系列云相关的依赖，是学习微服务的一个不错的途径。作为一个Spring新人，想通过这个系列更好地了解和使用Spring以及微服务相关知识。

《Spring应用开发》系列为本人学习Spring的笔记，若有错误请多多指导。本系列文章中均使用Kotlin，但也提供Java的源码实现。本文作为该系列的第一篇文章，将了解一下Spring与Spring Framework。

<!-- more -->

## 什么是Spring？

Spring是一个为解决企业级应用程序开发复杂性而创建的开源框架。Spring为应用程序提供了丰富的基础设施支持，让开发团队专注于业务逻辑。

Spring是一个大家族。Spring Framework提供了Spring应用程序的核心，Spring Boot允许尽可能快地构建Spring应用，Spring Cloud提供Spring应用的分布式、微服务式架构。

## 构建简单的Spring应用

要构建一个简单的Spring应用，首先我们应该了解一下Spring的核心Spring Framework。

Spring Framework提供了以下的功能：

* 核心技术：依赖注入(DI)、事件、资源、国际化、验证、数据绑定、类型转换、SpEL、面向切面编程(AOP)
* 测试：mock对象、`TestContext`框架、Spring MVC Test、`WebTestClient`
* 数据访问：事务、DAO、JDBC、ORM、Marshalling XML
* 集成：远程、JMS、JCA、JMX、电子邮件、任务、调度、缓存
* 语言支持：Kotlin、Groovy等

首先，我们先创建一个Gradle项目，需要加入Spring Framework的依赖。

```groovy
repositories {
    mavenCentral()
}

dependencies {
    implementation 'org.springframework:spring-context:5.2.2.RELEASE'
}
```

```kotlin
class Application {
    @Bean
    fun sayHello(): String {
        return "hello, world!"
    }
}

fun main() {
    val ctx: ApplicationContext = AnnotationConfigApplicationContext(Application::class.java)
    val str = ctx.getBean(String::class.java)
    println(str)
}
```

