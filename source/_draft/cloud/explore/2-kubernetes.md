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

本文我们将使用两台设备来尝试搭建k8s环境，首先，我们需要确保每个节点的MAC地址和`product_uuid`均为不一致的。

```sh
$ ip link
$ cat /sys/class/dmi/id/product_uuid
```

然后需要确保各个节点之间能互通，且要确保以下端口是开放的。

对于Master节点，有如下端口：

| 规则 | 端口范围  |          作用           |        使用者        |
| :--: | :-------: | :---------------------: | :------------------: |
| TCP  |   6443    |  Kubernetes API server  |         All          |
| TCP  | 2379-2380 | etcd server client API  | kube-apiserver, etcd |
| TCP  |   10250   |       Kubelet API       | Self, Control plane  |
| TCP  |   10251   |     kube-scheduler      |         Self         |
| TCP  |   10252   | kube-controller-manager |         Self         |

对于Worker节点，有如下端口：

| 规则 |  端口范围   |       作用        | 使用者 |
| :--: | :---------: | :---------------: | :----: |
| TCP  |    10250    |  Kubernetes API   |  All   |
| TCP  | 30000-32767 | NodePort Services |  All   |

然后，我们需要安装runtime。Kubernetes的默认容器运行时是Docker，只要我们按照上一篇文章安装好Docker即可。当然，我们可以选择别的容器运行时，Kubernetes也支持`containerd`、`cri-o`、`frakti`、`rkt`等。

接下来，配置国内的`yum`源，这里我们选择阿里云。

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

然后禁用SELinux，目前kubelet并不支持SELinux。

```sh
$ setenforce 0
$ sed -i 's/^SELINUX=enforcing$/SELINUX=permissive/' /etc/selinux/config
```

安装`kubeadm`等工具。

```sh
$ yum install -y kubelet kubeadm kubectl --disableexcludes=kubernetes
```

启动`kubelet`服务。

```sh
$ systemctl enable kubelet && systemctl start kubelet
```

## 初始化k8s节点

由于国内无法访问`gcr.io`，我们需要使用阿里云的镜像。

首先，输出`kubeadm`的默认配置。

```sh
$ kubeadm config print init-defaults > kubeadm-init.yaml
```

`imageRepository`修改成`registry.aliyuncs.com/google_containers`。

```sh
$ kubeadm config images pull --config kubeadm-init.yaml
```

```sh
$ kubeadm init --config kubeadm-init.yaml
```



```sh
$ kubeadm join 192.168.10.21:6443 --token abcdef.0123456789abcdef --discovery-token-ca-cert-hash sha256:564e3ba4b76649e981300fcea9e4400b759f91a02f4a968e035ada454f3a1d2e
```

```sh
$ kubectl get nodes
```

