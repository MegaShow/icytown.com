---
title: Start | SonarQube初探
date: 2018-4-14
categories: Start
tags:
  - QA
---

SonarQube是一个用户代码质量管理的开源平台，用于管理源代码的质量。目前SonarQube可以通过插件的形式，支持包括Java、C#、C、C++、JavaScript、Groovy等二十多种编程语言。

<!-- more -->

## SonarQube的用途

SonarQube从七个维度来检测代码质量：

1. 复杂度分析
2. 重复
3. 单元测试
4. 代码标准
5. 注释
6. 潜在的BUG
7. 糟糕的设计(包与包、类与类的关系)

## SonarQube安装

首先去[SonarQube 官网](https://www.sonarqube.org/downloads/)下载解压SonarQube：

```sh
$ wget https://sonarsource.bintray.com/Distribution/sonarqube/sonarqube-6.7.3.zip
$ unzip sonarqube-6.7.3.zip
$ sudo mv sonarqube-6.7.3 /opt/sonarqube
```

然后下载SonarQube Scanner（前身是SonarQube Runner）：

```sh
$ wget https://sonarsource.bintray.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-3.1.0.1141-linux.zip
$ unzip sonar-scanner-cli-3.1.0.1141-linux.zip
$ sudo mv sonar-scanner-3.1.0.1141-linux /opt/sonar-scanner
```

然后修改环境变量：

```sh
$ sudo vi /etc/profile
```

```shell
SONAR_HOME=/opt/sonarqube/bin/linux-x86-64
SONAR_SCANNER_HOME=/opt/sonar-scanner/bin
PATH=$SONAR_HOME:$SONAR_SCANNER_HOME:$PATH
```

## SonarQube使用

首先我们需要开启Sonar平台，然后才能利用Scanner扫描。

```sh
$ sonar.sh start
```

当我们不用Sonar的时候，必须关闭Sonar：

```sh
$ sonar.sh stop
```

开启了Sonar之后我们就能用Sonar Scanner了，Scanner会自动识别当前目录的`sonar-project.properties`文件。

下面是一个配置文件：

```
sonar.projectKey=Calculator
sonar.projectName=Calculator
sonar.projectVersion=1.0
sonar.sourceEncoding=UTF-8
sonar.modules=java-module
sonar.java.binaries=build

java-module.sonar.projectName=Java Module
java-module.sonar.language=java
java-module.sonar.sources=src
java-module.sonar.projectBaseDir=.
```

我们可以执行命令来测试：

```sh
$ sonar-scanner
```

如果输出结果是SUCCESS，那么我们就可以进入`localhost:9000`查看scan的结果了。

## Ant上使用Sonar Scanner

跟JUnit一样，Ant同样也支持Sonar Scanner。

首先我们需要下载一个jar文件：

```sh
$ wget https://sonarsource.bintray.com/Distribution/sonarqube-ant-task/sonarqube-ant-task-2.5.jar
$ sudo mv sonarqube-ant-task-2.5.jar /opt/jar/sonarqube-ant-task-2.5.jar
```

然后修改`build.xml`：

```xml
<project default="build" xmlns:sonar="antlib:org.sonar.ant">
    
    ...
    
    <property name="sonar.host.url" value="http://localhost:9000"/>
    <property name="sonar.projectKey" value="Calculator"/>
    <property name="sonar.projectName" value="Calculator"/>
    <property name="sonar.projectVersion" value="1.0"/>
    <property name="sonar.sources" value="src"/>
    <property name="sonar.java.binaries" value="build"/>
    <property name="sonar.java.libraries" value="lib/*.jar"/>
    <target name="sonar">
        <taskdef uri="antlib:org.sonar.ant" resource="org/sonar/ant/antlib.xml">
            <classpath path="/opt/jar/sonarqube-ant-task-2.5.jar"/>
        </taskdef>
        <sonar:sonar/>
    </target>
</project>
```

