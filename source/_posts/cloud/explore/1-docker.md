---
title: Cloud | 云与容器化探索系列(1) Docker容器的使用
date: 2019-7-26
categories: Cloud
tags:
- Docker
---

一直以来都想学习一下容器化、微服务、持续集成以及软件自动化等方面的知识，但是由于自己太懒了，学习计划一拖再拖。于是，有了这个系列来督促我去学习相关知识。

《云与容器化探索》系列为本人探索云服务相关的学习笔记，但不仅限于云服务与容器化。本文作为该系列的第一篇文章，将学习Docker容器的使用。

<!-- more -->

## 什么是Docker？

Docker是一个开源的应用容器，允许开发者将应用以及应用的依赖打包到一个可移植的镜像下，然后发布到任何安装了Docker的Windows或Linux系统上。

简单地说，Docker就是一种容器的封装，也就是所谓的虚拟化。通过Docker，我们可以抽象出一个额外的软件层，让我们的应用或服务的运行环境与操作系统层的环境实现隔离。同时，容器的弹性特性也使得Docker可以很好地提供动态扩容或缩容的功能。

Docker主要用于以下的场景：

* 提供一次性的环境、沙盒环境，比如持续集成等。
* 提供弹性的云服务，比如动态扩容、动态缩容。
* 组建微服务架构。

目前，Docker是最流行的容器解决方案。

## 安装Docker

Docker官方提供了两个版本的Docker，一个是CE社区版本，另一个为EE企业版本，本系列均使用Docker社区版。本系列的物理机系统均为CentOS，且Docker CE最低系统版本要求为CentOS 7。如果你们使用别的操作系统，可以阅读[Docker文档](https://docs.docker.com/install/)进行Docker的安装。

首先，我们需要安装一些工具包和必要依赖。

```sh
$ yum install -y yum-utils device-mapper-persistent-data lvm2
```

接下来添加安装源。

```sh
$ yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
```

然后安装Docker最新稳定版。

```sh
$ yum install docker-ce docker-ce-cli containerd.io
```

接下来查看Docker是否安装成功。

```sh
$ docker version
```

这时候Docker除了输出了它的Client版本信息之外，还输出了以下的提示信息。

> Cannot connect to the Docker daemon at unix:///var/run/docker.sock. Is the docker daemon running?

Docker命令本质上是Docker使用Unix Socket和Docker Engine通讯，而我们并没有在后台启动Docker Engine。因此，我们接下来使用`systemctl`对Docker Engine进行进程守护。

```sh
$ systemctl start docker
```

此时再输出版本信息，会发现多了一部分与Server相关的信息，即表示启动Engine成功。

我们可以运行官方提供的hello world容器来查看Docker是否能正常运行。

```sh
$ docker run hello-world
```

## Docker的基本概念

### Image

Docker镜像是一个特殊的文件系统，它打包了容器运行时所需的程序、依赖库、资源、配置等文件及参数信息。

在Docker镜像中，并不包含任何动态数据，其内容是只读的，即在构建之后不会被改变。镜像可以看作是容器的模板、定义，通过镜像可以生成Docker容器实例。

我们可以通过`image`命令查看本机的镜像。

```sh
$ docker image ls
```

或者，

```sh
$ docker images
```

此时我们机器上仅有`hello-world`镜像，这是Docker官方提供的镜像。前面我们运行它的时候因为在本地找不到该镜像，就会自动去仓库中搜索并下载。

### Container

Docker容器是镜像的实例，是运行的基本单位，实际上就是进程。但是容器的进程与在宿主执行的进程不一样，容器进程在独立的命名空间中运行，即拥有一套独立的运行时环境。

与镜像的只读不一样，容器作为镜像运行时的实体，可以被创建、启动、暂停、恢复、停止、删除等。同时，Docker为每个容器提供容器存储层，允许应用进行读写操作。但是在容器被销毁的时候，与之相关的存储层也会被销毁。

我们可以通过`container`命令查看本机正在运行的容器。

```sh
$ docker contrainer ls
```

或者，

```sh
$ docker ps
```

当然，此时我们查不到任何在运行的容器。如果我们加上`-a`参数，就可以看到`hello-world`镜像存在一个已经终止的容器。

### Repository

当我们构建好镜像，需要分发到各个服务器或者互联网上时，就需要一个集中的存储、分发镜像平台。Docker Registry是镜像存储分发服务平台，Docker官方公开提供的服务平台即为[Docker Hub](https://hub.docker.com/)。

每个Registry平台可以包含多个仓库，每个仓库可以包含多个标签，而每个标签即对应一个镜像。仓库里面实际上就是存储了某个应用的多个版本的镜像，我们可以通过`<仓库名>:<标签>`的格式来指定某个特定的镜像，其中标签`latest`为默认标签。

通常情况，仓库名的格式为`<用户名>/<软件名>`，但是这并不是绝对的，通常官方镜像仓库并没有用户名一部分。

## Docker镜像使用

在Docker的官方Registry平台[Docker Hub](https://hub.docker.com/)上，存在大量高质量的镜像。这里我们将介绍如何获取和使用它们。

之前我们已经拉取了`hello-world`镜像，不过由于是运行的时候自动拉取的，接下来我们将主动拉取两个镜像。从Docker镜像仓库获取镜像的命令是`pull`，其格式如下：

```sh
$ docker pull [选项] [Docker Registry 地址[:端口号]/]仓库名[:标签]
```

这里的仓库名的形式为`<用户名>/<软件名>`，如果不指定用户名，则默认为`library`。

接下来我们将拉取`alpine`仓库，Alpine是一个轻型Linux发行版，相比Ubuntu、Debian等主流Linux发行版，采用了`musl libc`和`busybox`来减小系统体积和运行时资源消耗。Alpine的Docker镜像也是非常小，仅有5MB左右，而Ubuntu大小为64MB。

当然，我们这里下载Alpine并不是说什么原因，只是为了接触一下这个在Docker社区比较受人青睐的Linux发行版。

```sh
$ docker pull alpine
```

通过`images`命令可以查看本地镜像的大小。

```sh
$ docker images
```

接下来就是生成一个容器实例，执行Alpine。由于Alpine实在太瘦身了，所以连基本的bash都没有提供，因此我们没有办法通过bash来访问容器实例，仅可以简单执行Alpine。

```sh
$ docker run alpine echo 'hello, world'
```

由于Alpine功能比较小，接下来我们拉取一个功能比较齐全的Linux发行版。这里我们选择Debian，Debian也是Docker镜像主要选择的基础镜像之一。

```sh
$ docker pull debian
```

然后创建容器实例，并通过bash访问容器。其中`-it`是为了保证与容器之间的交互正常，`i`确保持久的标准输入，`t`为容器分配一个tty来交互。

```sh
$ docker run -it debian bash
```

接下来，就进入了容器内部的shell，就相当于在一个Debian虚拟机里面进行shell操作了。

## Docker镜像构建

### hello-world的镜像构建

在自己尝试进行Docker镜像构建之前，我们先来分析一下`hello-world`镜像的构建。

`hello-world`镜像的源码被托管于[docker-library/hello-world](https://github.com/docker-library/hello-world)，浏览仓库之后你可以会发现里面的文件比较多，很明显可以观察到有平台的区分。当然，早期的镜像并没有这么复杂，我们也可以通过访问仓库里面早期的Commit来学习。

比如，记录[b7a78b7c](https://github.com/docker-library/hello-world/tree/b7a78b7ccca62cc478919b101f3ab1334899df2b)中，仅有汇编源码文件、Makefile文件、Dockerfile文件、二进制文件。而最新的镜像，已经是使用C来实现的。当然，我们这里的重点是研究怎么构建Docker镜像，因此我们不考虑不同平台编译的差异。

首先，我们打开`amd64/hello-world/Dockerfile`，可以发现如下的构建源码。

```dockerfile
FROM scratch
COPY hello /
CMD ["/hello"]
```

`FROM`关键词指定基础镜像，即以该镜像作为基础定制我们的镜像。Docker的镜像是分层存储的，镜像的构建是一层层构建的，每一层构建完之后就不会发生改变。

这里的`scratch`是一个保留词，表示这是一个空镜像。也就是说`hello-world`镜像仅有本身一层，并不存在下层的镜像。

`COPY`指令用于复制文件，这里即将hello二进制文件复制到镜像的根目录。

`CMD`指令用于指定默认的容器主进程的启动命令，如果我们启动容器时不指定需要执行的命令，将执行这里的启动命令。

本节简单地了解了一下`hello-world`镜像的构建，接下来我们就需要实现自己应用的镜像构建了。

### 简单的Node后台服务实现

接下来我们将实现一个简单的Node后台应用，由于我们的侧重点不在此，我们将快速完成应用实现。

前置条件：

* NPM、Node (必须)
* TypeScript (可选，下面均为TypeScript源码，你可以自行修改为JavaScript源码)

执行下面的命令。

```sh
$ npm init
$ tsc --init
$ npm install express
$ npm install -D typescript @types/node @types/express
```

然后编写如下的简单后台源码。

```typescript
import express, { Request, Response } from 'express'

const app = express()

app.get('/ping', (_: Request, res: Response) => {
    res.contentType('application/json')
    res.status(200)
    res.send({ code: 200, msg: 'pong' })
})

app.listen(2333)
console.log('listen at 2333')
```

一个简单的后台应用就实现了，接下来我们往`package.json`里面添加一些脚本，方便我们编译运行。

```json
{
  "scripts": {
    "build": "tsc",
    "dev": "npm run build && npm run serve",
    "serve": "node index.js"
  }
}
```

只要我们运行`dev`脚本即可执行应用。

```sh
$ npm run dev
```

### 构建Node应用镜像

现在我们就要来编写Dockerfile文件了，在Docker Hub的[node](https://hub.docker.com/_/node)页面中可以查看到有非常多的tags，这里我们选择`node:12-slim`。如果你感兴趣，可以拉取`node:12`和`node:12-slim`来对比，前者900M，后者120M。当然，`node:12-alpine`更加小，但是前面我们也提过了Alpine并没有bash，为了方便调试和找问题我们选择了Debian。

```dockerfile
FROM node:12-slim
```

然后就是一系列指令，`WORKDIR`指定了工作区目录，接下来的指令都在该目录下进行。`COPY`就是从本机复制文件到镜像中，而`RUN`就是运行命令，`EXPOSE`指定暴露到外部的端口，而`CMD`即为默认的容器主进程的启动命令。

```dockerfile
FROM node:12-slim  # 基础镜像
WORKDIR /root/app  # 工作目录

COPY . .
RUN npm ci 
RUN npm run build

EXPOSE 2333
CMD ["npm", "run", "serve"]
```

可能你在想，这里将整个当前目录复制到工作区目录上，那岂不是`node_modules`和`.git`这类文件也被复制进去了？Docker提供了类似了Git忽视文件的方法，使用`.dockerignore`去忽视构建过程中的文件。

```sh
.git/
node_modules/
*.js  # 因为我们上面的项目为TypeScript项目，js文件也算是中间文件
Dockerfile
```

接下来就可以使用`build`命令构建镜像了。

```sh
$ docker build -t node-web-app .
```

然后创建容器实例，`-p`将容器暴露的端口2333映射到本机端口80，`-d`以分离模式运行Docker容器，这样容器就可以在后台运行。

```sh
$ docker run -p 80:2333 -d node-web-app
```

此时访问`localhost/ping`，来验证我们的应用是否正常工作。

```sh
$ curl localhost/ping
```

当然，我们也可以通过`exec`命令进入容器，查看运行日志或者进行别的工作。

```sh
$ docker exec -it <container_id> bash
```

### 镜像构建优化

当我们构建镜像的时候，肯定是希望镜像越小越好。其实上一节构建镜像使用的Dockerfile并不是很完美。仔细一想，其实你会发现TypeScript项目的ts文件与应用运行并没有半毛钱关系，而且Node的开发依赖对于运行也没有帮助，比如`@types`依赖。

Docker的镜像是一层层叠加的，其实Dockerfile里面的每一个指令都会创建一个新的镜像层。而且镜像层是不可变的，如果我们在上一层添加了一个新的文件，到下一层再删除，实际上镜像中还是存在这个文件，不过最终运行容器的时候它并不存在。

所以我们应该避免创建过多的镜像层，而Dockerfile里面用的最多的应该是`RUN`指令。我们可以将多个`RUN`指令合并为一个，并且在`RUN`命令之后应该删除多余的文件，防止这些文件被保留在镜像中。

```dockerfile
FROM node:12-slim
WORKDIR /root/app

COPY . .
RUN npm ci && npm run build && npm prune --production

EXPOSE 2333
CMD ["npm", "run", "serve"]
```

此时再构建镜像，就会发现镜像大小从211M缩水到了165M。

当然，此时我们的镜像里面还是有ts文件。如果我们在`RUN`中删除ts文件，它也会存在镜像中，因为`COPY`层已经存在该文件。当然，最简单的删除ts文件的方法就是我们在Docker外编译，然后将最终js文件复制到镜像中。

### 多阶段构建

上述的执行命令之后手动删除多余文件的方式其实并不高效，如果遗漏删除某个文件，那它将被打包进镜像中。甚至可能文件删除记录会被保留在镜像中，而我们希望镜像中仅有我们所需要的文件的内容。而且我们还需要人为地将多个`RUN`来合起来，防止生成多个镜像层。

在Docker的早期版本中，人们会维护多个Dockerfile文件，分别负责构建最终执行文件和构建镜像。这样镜像的构建就没有了中间的记录，不过维护多个Dockerfile的成本还是略高。

Docker在17.05之后提供了多阶段构建的特性，允许在Dockerfile中进行多个阶段的构建。Docker允许选择性地将文件从一个阶段复制到另一个阶段，最终仅生成某个阶段的镜像层，也不需要维护多个Dockerfile文件。

```dockerfile
FROM node:12-slim AS builder
WORKDIR /root/app
COPY . .
RUN npm ci
RUN npm run build
RUN npm prune --production
RUN rm index.ts tsconfig.json

FROM node:12-slim
WORKDIR /root/app
COPY --from=builder /root/app .
CMD ["node", "index.js"]
```

此时构建镜像，从原有的165M缩水到了153M。

## 结语

好了，本文接触了不少Docker的内容，终于能够系统地学习一下Docker的使用以及一些基础、原理。接下来，本系列将带大家接触一下Docker容器编排之类的知识，比如大名鼎鼎的k8s。

