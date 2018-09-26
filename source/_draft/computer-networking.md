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

分组交换机具有一个**输出缓存(output buffer)**，也称为**输出队列(output queue)**。除了存储转发时延以外，分组还要承受输出缓存的**排队时延(queue delay)**。缓存空间的大小是有限的，因此会出现**分组丢失(丢包)(packet lost)**。

每台路由器具有一个**转发表(forwarding table)**，用于将目的地址(或目的地址的一部分)映射成为输出链路。因特网具有特殊的**路由选择协议(routing protocol)**，用于自动地设置转发表。

在电路交换网络中，在端系统间通信会话期间，预留了端系统间通信沿路径所需要的资源(缓存、链路传输速率)。在分组交换网路中，这些资源则不是预留的。传统的电话网络是电路交换网络的例子。

链路中的电路是通过**频分复用(Frequency-Division Multiplexing, FDM)**或**时分复用(Time-Division Multiplexing, TDM)**来实现的。对于FDM，链路的频谱由跨越链路创建的所有连接所共享。频段的宽度称为**带宽(bandwidth)**。对于一条TDM链路，时间被划分为固定区间的帧，并且每帧又被划分为固定数量的时隙。

## 1.4 分组交换网中的时延、丢包和吞吐量

分组在沿途的每个结点经受了几种不同类型的时延，最为重要的是**结点处理时延(nodal processing delay)**、**排队时延(queuing delay)**、**传输时延(transmission delay)**和**传播时延(propagation delay)**。这些时延总体累加起来是**结点总时延(total nodal delay)**。

$d_{nodal} = d_{proc} + d_{queue} + d_{trans} + d_{prop}$

令a表示分组到达队列的平均速率(分组/秒，pkt/s)；R是传输速率，即从队列中推出比特的速率(bps)；L比特组成一个分组，则比特到达队列的平均速率是La(bps)。比率La/R被称为**流量强度(traffic intensity)**。如果La/R > 1，则比特到达队列的平均速率超过从该队列传输出去的速率。**设计系统时流量强度不能大于1。**

随着流量强度接近1，排队时延并不实际趋向无穷大。相反，路由器将**丢弃(drop)**到达的分组，即该分组将会**丢失(lost)**，这是丢包的过程。

假定源主机和目的主机之间有N-1台路由器，且网络是无拥塞的(因此排队时延是微不足道的)。端到端时延：$d_{end-end} = N(d_{proc} + d_{trans} + d_{prop})$。 

**Traceroute**程序可以朝着指定的目的地发送多个特殊的分组，当路由器接收到这些特殊分组之一时，它向源回送一个短报文。该报文包括该路由器名字和地址。Traceroute实际上对实验重复了3次，因此该源实际上向目的地发送了3N个分组。

从主机A到主机B跨越计算机网络传送一个大文件，在任何时间瞬间的**瞬时吞吐量(instantaneous throughput)**时主机B接收到该文件的速率(以bps计)。如果该文件由F比特组成，主机B接收到所有F比特用去T秒，则文件传送的**平均吞吐量(average throughput)**是F/T bps。吞吐量通常是**瓶颈链路(bottleneck link)**的传输速率。

## 1.5 协议层次及其服务模型

协议分层：为了给网络协议的设计提供一个结构，网络设计者以**分层(layer)**的方式组织协议以及实现这些协议的网络硬件和软件。各层的所有协议被称为**协议栈(protocol stack)**。

* 应用层：网络应用程序及它们的应用层协议存留的地方，如HTTP、SMTP、FTP等。位于应用层的信息分组称为**报文(message)**。
* 运输层：因特网的运输层在应用程序端点之间传输应用层报文，运输协议TCP、UDP。运输层分组称为**报文段(segment)**。
* 网络层：因特网的网络层负责将称为**数据报(datagram)**的网络层分组从一台主机移动到另一台主机。因特网的网络层包括著名的IP协议。
* 链路层：为了将分组从一个结点(主机或路由器)移动到路径上的下一个结点，网络层必须依靠该链路层的服务。链路层分组称为**帧(frame)**。
* 物理层：任务是将帧的一个个比特从一个结点移动到下一个结点。

国际标准化组织(ISO)提出计算机网络应组织为大约7层，称为开发系统互连(OSI)模型。OSI参考模型的7层是：应用层、表示层、会话层、运输层、网络层、数据链路层、物理层。

## 1.6 面对攻击的网络

**僵尸网络(botnet)**可以对目标主机展开垃圾邮件分发或分布式拒绝服务攻击。

**病毒(virus)**是一种需要某种形式的用户交互来感染用户设备的恶意软件。

**蠕虫(worm)**是一种无需任何明显用户交互就能进入设备的恶意软件。

**拒绝服务攻击(Denial-of-Service(DoS) attack)**的三种类型：

* 弱点攻击
* 带宽洪泛
* 连接洪泛

**分布式DoS(Distributed DoS, DDoS)**是带宽洪泛攻击的一种。

记录每个流经的分组副本的被动接收机被称为**分组嗅探器(packet sniffer)**。将具有虚假源地址的分组注入因特网的能力被称为**IP哄骗(IP spoofing)**。

## 1.7 计算机网络和因特网的历史

* 分组交换的发展：1961~1972
* 专用网络和网络互联：1972~1980
* 网络的激增：1980~1990
* 因特网爆炸：20世纪90年代

# 第2章 应用层

## 2.1 应用层协议原理

**应用程序体系结构(application architecture)**由应用程序研发者设计：**客户-服务器体系结构(client-server architecture)**、**P2P体系(P2P architecture)**。

进程通过一个称为**套接字(socket)**的软件接口向网络发送报文和从网络接收报文。主机由其**IP地址(IP address)**标识，目的地**端口号(port number)**标识应用。

**TCP服务**是面向连接、可靠的数据传送服务，该协议具有拥塞控制机制。**安全套接字层**(Secure Sockets Layer, SSL)是对TCP的加强，是在应用层上实现的。

**UDP服务**是无连接的、不可靠的数据传送服务，该协议不保证报文到达接收进程，且接收到的报文可能是乱序的。

## 2.2 Web和HTTP

Web的应用层协议是**超文本传输协议(HyperText Transfer Protocol, HTTP)**。

**Web页面(Web Page)**(也叫文档)是由对象组成的，多数Web页面含有一个**HTML基本文件**(base HTML file)以及几个引用对象。HTTP定义了Web客户向Web服务器请求Web页面的方式，以及服务器向客户传送Web页面的方式。

HTTP使用TCP作为它的支撑运输协议，而不是UDP。所以HTTP协议不用担心数据丢失，也不关注TCP从网络的数据丢失和乱序故障中恢复的细节，这是分层体系结构最大的优点。

HTTP是一个**无状态协议(stateless protocol)**，因为HTTP服务器并不保存关于客户的任何信息。

**非持续连接**(non-persistent connection)的每个请求由一个单独的TCP连接发送，**持续连接**(persistent connection)的所有请求由相同的TCP连接发送。HTTP默认方式为持续连接，但是也可以配置成非持续连接。

在非持续连接的默认方式下，大部分浏览器打开5~10个并行的TCP连接，而每条连接处理一个请求响应事务。HTTP的默认模式是使用带流水线的持续连接。

HTTP规范包含了对HTTP报文格式的定义，HTTP报文有两种：**请求报文**、**响应报文**。

**HTTP请求报文如下：**

```
GET /somedir/page.html HTTP/1.1
Host: www.someschool.edu
Connection: close
User-agent: Mozilla/5.0
Accept-language: fr
```

HTTP请求报文的第一行叫做**请求行(request line)**，其后继的行叫做**首部行(header line)**。请求行有3个字段：方法字段、URL字段和HTTP版本字段。

**HTTP响应报文如下：**

```
HTTP/1.1 200 OK
Connection: close
Date: Tue, 09 Aug 2011 15:44:04 GMT
Server: Apache/2.2.3 (CentOS)
Last-Modified: Tue, 09 Aug 2011 15:11:03 GMT
Content-Length: 6021
Content-Type: text/html
```

HTTP响应报文有一个初始**状态行(status line)**、6个**首部行(header line)**，然后是**实体体(entity body)**。

**常见的状态码：**

* 200 OK：请求成功，信息在返回的响应报文中。
* 301 Moved Permanently：请求的对象已经被永久移除了，新的URL定义在响应报文的首部行中。
* 400 Bad Request：通用差错代码，指示该请求不能被服务器理解。
* 404 Not Found：被请求的文档不在服务器上。
* 505 HTTP Version Not Supported：服务器不支持请求报文使用的HTTP协议版本。

**Cookie技术的4个组件：**

* 在HTTP响应报文中的一个cookie首部行
* 在HTTP请求报文中的一个cookie首部行
* 在用户端系统中保留有一个cookie文件，并由用户的浏览器进行管理
* 位于Web站点的一个后端数据库

**Web缓存器(Web cache)**也叫**代理服务器(proxy server)**，能够代表初始Web服务器来满足HTTP请求的网络实体。通过使用**内容分发网络(Content Distribution Network, CDN)**，Web缓存器使大量流量实现本地化。

**条件GET(conditional GET)**方法使用`If-Modified-Since`首部行，允许缓存器证实它的对象是最新的。如果没有修改，Web服务器会向该缓存器发送`304 Not Modified`响应报文。

## 2.3 文件传输协议：FTP

FTP使用了两个并行的TCP连接来传输文件，端口21是**控制连接(control connection)**，端口20是**数据连接(data connection)**。FTP的控制信息是**带外(out-of-band)**传送的，HTTP是**带内(in-band)**发送控制信息的。

FTP服务器必须在整个会话期间保留用户的**状态(state)**，大大限制了FTP同时维持的会话总数。

|      命令       |                    备注                    |
| :-------------: | :----------------------------------------: |
| `USER username` |            向服务器传送用户标识            |
| `PASS password` |            向服务器发送用户口令            |
|     `LIST`      | 请求服务器回送当前远程目录中的所有文件列表 |
| `RETR filename` |      从远程主机当前目录检索文件(get)       |
| `STOR filename` |    在远程主机的当前目录上存放文件(put)     |

FTP返回报文：

* 331 Username OK, Password required
* 125 Data connection already open, transfer starting
* 425 Can't open data connection
* 452 Error writing file

## 2.4 因特网中的电子邮件

电子邮件是一种异步通信媒介。电子邮件系统有3个主要组成部分：**用户代理(user agent)**、**邮件服务器(mail server)**、**简单邮件传输协议(Simple Mail Transfer Protocol, SMTP)**。

如果Alice的服务器不能将邮件交付给Bob的服务器，Alice的邮件服务器在一个**报文队列(message queue)**中保持该报文并在以后尝试再次发送。通常30分钟一次，如果几天仍不能成功，服务器就删除该报文并以电子邮件的形式通知发送方(Alice)。

SMTP一般不使用中间邮件服务器发送邮件，在25号端口建立TCP连接。

HTTP主要是一个**拉协议(pull protocol)**，SMTP是一个**推协议(push protocol)**。SMTP要求每一个报文使用7bit的ASCII码格式，而HTTP数据不受这个限制。

**第三版的邮局协议(Post Office Protocol - Version 3, POP3)**：特许、事务处理、更新。

**因特网邮件访问协议(Internet Mail Acccess Protocol, IMAP)**：保留远程服务器的层次文件夹。

## 2.5 DNS：因特网的目录服务

主机的一种标识方法是用它的**主机名(hostname)**，也可以使用所谓**IP地址(IP address)**进行标识。

进行主机名到IP地址转换的目录服务，叫**域名系统(Domain Name System, DNS)**。DNS有一个由分层的DNS服务器实现的分布式数据库，和一个使得主机能够查询分布式数据库的应用层协议。DNS服务器通常是运行BIND(Berkeley Internet Name Domain)软件的UNIX机器。DNS协议运行在UDP上，使用53号端口。

MX记录允许一个公司的邮件服务器和Web服务器使用相同(别名化)的主机名。

DNS服务器有3种类型：根DNS服务器、顶级域(Top-Level Domain, TLD)DNS服务器、权威DNS服务器。**本地DNS服务器**不属于该服务器的层次结构。为了改善时延性能并减少在因特网上到处传输的DNS报文数量，DNS广泛使用缓存技术。

FNS服务器存储了**资源记录(Resource Record, RR)**，RR提供了主机名到IP地址的映射。

```
RR: (Name, Value, Type, TTL)

TTL: 生存时间，决定资源记录应当从缓存中删除的时间
Type:
  - A:     Name: 主机名, Value: IP地址
  - NS:    Name: 域, Value: 知道获得该域中主机IP地址的权威DNS服务器的主机名
  - CNAME: Name: 主机名, Value: 对应的规范主机名
  - MX:    Name: 主机名, Value: 别名为Name的邮件服务器的规范主机名
```

DNS只有查询(query)和回答(reply)报文，且两种报文拥有相同的格式。`nsloopup`程序可以直接向DNS服务器发送一个DNS查询报文。最近，DNS协议添加了一个**更新(UPDATE)**选项，允许通过DNS报文对数据库中的内容进行动态添加或者删除。

**因特网名字和地址分配机构(Internet Corporation for Assigned Names and Numbers, ICANN)**向各种注册登记机构授权。

## 2.6 P2P应用

**分发时间(distribution time)**是所有N个对等方得到该文件的副本所需要的时间。

BitTorrent是一种用于文件分发的流行P2P协议，参与一个特定文件分发的所有对等方的集合被称为一个**洪流(torrent)**。每个洪流具有一个基础设施节点，称为**追踪器(tracker)**。BT使用一种称为**最稀缺优先(rarest first)**的技术，首先请求自己没有且邻居的最稀缺的块。

**分布式散列表(Distributed Hash Table, DHT)**，键是一个目录名，值是具有该目录副本的对等方IP地址。

 