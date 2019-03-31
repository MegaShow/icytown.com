---
title: Explore | HTTP2.0初探
date: 2017-7-31
categories: Explore and Learning
tags:
- Network
- HTTP
---

<!-- more -->

## 什么是HTTP2.0？

HTTP 2.0即超文本传输协议2.0，是下一代HTTP协议。是由互联网工程任务组（IETF）的Hypertext Transfer Protocol Bis (httpbis)工作小组进行开发。是自1999年http1.1发布后的首个更新。HTTP 2.0在2013年8月进行首次合作共事性测试。在开放互联网上HTTP 2.0将只用于https网址，而 http网址将继续使用HTTP/1，目的是在开放互联网上增加使用加密技术，以提供强有力的保护去遏制主动攻击。DANE RFC6698允许域名管理员不通过第三方CA自行发行证书。——摘自《百度百科》

既然有效率更高、安全性更强的HTTP协议，为什么不去使用呢？(于是就有了这篇文章，逃)

## 准备工作

* CentOS 7.3 64bit
* GNU GCC/G++
* Nginx
* OpenSSL

### 安装 ~ GCC & G++

如果系统没有安装gcc和g++，可以用下面的命令安装

```shell
[centos ~]# yum install gcc
[centos ~]# yum install gcc-c++
```

### 编译安装 ~ Zlib & OpenSSL

首先我们要确认OpenSSL版本，支持HTTP2.0最低的OpenSSL版本为1.0.2，如果环境版本低于1.0.2，那我们就要自己配置新的OpenSSL。

```sh
[centos ~]# openssl version
OpenSSL 1.0.1e-fips 11 Feb 2013
```

这里使用的CentOS的OpenSSL版本过低，我们将升级此时最新版本的OpenSSL。

```shell
[centos ~]# wget https://www.openssl.org/source/openssl-1.1.0f.tar.gz
[centos ~]# wget http://www.zlib.net/zlib-1.2.11.tar.gz
[centos ~]# tar -zxvf openssl-1.1.0f.tar.gz
[centos ~]# tar -zxvf zlib-1.2.11.tar.gz
[centos ~]# cd zlib-1.2.11/
[centos zlib-1.2.11]# ./configure
[centos zlib-1.2.11]# make test
[centos zlib-1.2.11]# make install
[centos zlib-1.2.11]# make clean
[centos zlib-1.2.11]# ./configure --shared
[centos zlib-1.2.11]# make test
[centos zlib-1.2.11]# make install
[centos zlib-1.2.11]# cp zutil.h /usr/local/include
[centos zlib-1.2.11]# cp zutil.c /usr/local/include
[centos zlib-1.2.11]# cd ../openssl-1.1.0f/
[centos openssl-1.1.0f]# ./config shared zlib --prefix=/usr/local/ssl
[centos openssl-1.1.0f]# make
[centos openssl-1.1.0f]# make install
[centos openssl-1.1.0f]# make install_sw LIBDIR=lib
[centos openssl-1.1.0f]# mv /usr/bin/openssl /usr/bin/openssl.bak
[centos openssl-1.1.0f]# mv /usr/include/openssl /usr/include/openssl.bak
[centos openssl-1.1.0f]# ln -s /usr/local/ssl/bin/openssl /usr/bin/openssl
[centos openssl-1.1.0f]# ln -s /usr/local/ssl/include/openssl /usr/include/openssl
[centos openssl-1.1.0f]# cp /usr/local/ssl/lib/* /usr/local/lib/
[centos openssl-1.1.0f]# echo "/usr/local/ssl/lib" >> /etc/ld.so.conf
[centos openssl-1.1.0f]# ldconfig -v
```

此时，OpenSSL已经编译安装完成

```shell
[centos ~]# openssl version
OpenSSL 1.1.0f  25 May 2017
```

### 编译安装 ~ Nginx

```shell
[centos ~]# wget http://nginx.org/download/nginx-1.13.3.tar.gz
[centos ~]# wget https://ftp.pcre.org/pub/pcre/pcre-8.41.tar.gz
[centos ~]# tar -zxvf nginx-1.13.3.tar.gz
[centos ~]# tar -zxvf pcre-8.41.tar.gz
[centos ~]# cd nginx-1.13.3/
[centos nginx-1.13.3]# ./configure --with-pcre=../pcre-8.41  --with-stream --with-stream_ssl_module --with-http_ssl_module --with-http_v2_module --with-threads --with-http_flv_module --with-http_addition_module
[centos nginx-1.13.3]# make
[centos nginx-1.13.3]# make install
[centos nginx-1.13.3]# ln -s /usr/local/nginx/sbin/nginx /usr/local/bin/nginx
[centos nginx-1.13.3]# nginx -v
```

如果正常显示nginx版本，那编译安装成功。此时我们访问服务器IP，发现已经可以正常显示网站index.html文件。

接下来我们配置nginx，使之支持http2.

## 配置Nginx

进入/usr/local/nginx/conf/目录，对文件nginx.conf进行修改。把文件末尾的被注释掉的443端口的配置文件取消注释，并修改成下面这样。

```
server {
    listen       443 ssl http2;
    server_name  your-domain-website;

    ssl_certificate      path/to/crt;
    ssl_certificate_key  path/to/key;

    ssl_session_cache    shared:SSL:1m;
    ssl_session_timeout  5m;

    ssl_ciphers  HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers  on;

    location / {
        root   html;
        index  index.html index.htm;
    }
}
```

储存之后重启nginx

```shell
[centos ~]# nginx -s reload
```

这时我们访问我们的网站，并且F12打开开发者工具，在Network中查看表格的Protocol信息。如果Protocol为h2则表示http2.0配置成功。

(不行可先尝试Ctrl+F5强制刷新)
