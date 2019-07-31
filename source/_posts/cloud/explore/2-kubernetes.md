---
title: Cloud | 云与容器化探索系列(2) Kubernetes与容器编排
date: 2019-7-29
categories: Cloud
tags:
- Docker
- Kubernetes
---

上篇文章学习了Docker的使用，学习了如何构建镜像和创建容器，本文让我们来了解一下Docker的容器编排，了解如何管理容器。

《云与容器化探索》系列为本人探索云服务相关的学习笔记，但不仅限于云服务与容器化。

<!-- more -->

## 什么是Kubernetes？

Kubernetes是一个生产级别的容器编排系统，是用于自动部署、扩展和管理容器化应用程序的开源系统，又被称为k8s。

Kubernetes构建在Google的生产环境经验基础之上，深受Google内部系统Borg的影响，目前与Docker同为CNCF项目。

Kubernetes拥有以下的特性：

* 自动包装：根据需求和其他约束自动放置容器。
* 自我修复：自动重启失败的容器。
* 横向缩放：手动或自动调整应用程序副本数。
* 服务发现和负载均衡：为容器提供IP地址，并支持负载均衡。
* 自动部署和回滚：部署时逐个替换容器实例，确保不会同时终止所有实例。
* 密钥和配置管理：在不用重新编译镜像的情况下部署和更新密钥和配置。

接下来我们来尝试使用Kubernetes。

## 安装Kubernetes

我们需要在每一台设备上都安装以下的软件包：

* `kubeadm`：用来初始化集群的指令。
* `kubelet`：在集群中的每个节点上用来启动pod和container等。
* `kubectl`：用来与集群通信的命令行工具。

```sh
$ cat <<EOF > /etc/yum.repos.d/kubernetes.repo
[kubernetes]
name=Kubernetes
baseurl=http://mirrors.aliyun.com/kubernetes/yum/repos/kubernetes-el7-x86_64
enabled=1
gpgcheck=0
repo_gpgcheck=0
gpgkey=http://mirrors.aliyun.com/kubernetes/yum/doc/yum-key.gpg
       http://mirrors.aliyun.com/kubernetes/yum/doc/rpm-package-key.gpg
EOF
```

```sh
$ setenforce 0
$ sed -i 's/^SELINUX=enforcing$/SELINUX=permissive/' /etc/selinux/config
```

```sh
$ yum install -y kubelet kubeadm kubectl --disableexcludes=kubernetes
```

```sh
$ systemctl enable kubelet && systemctl start kubelet
```

