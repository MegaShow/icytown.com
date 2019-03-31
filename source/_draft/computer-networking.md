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

 DHT能被设计成每个对等方的邻居数量以及每个请求的报文数量均为$O(logN)$，其中$N$是对等方的数量。

## 2.7 TCP套接字编程

**UDP套接字编程**：

```python
# client.py
from socket import *

serverName = 'localhost'
serverPort = 23334

clientSocket = socket(AF_INET, SOCK_DGRAM)
message = raw_input('Input lowercase sentence: ')
clientSocket.sendto(message, (serverName, serverPort))
modifiedMessage, serverAddress = clientSocket.recvfrom(2048)
print modifiedMessage
clientSocket.close()
```

```python
# server.py
from socket import *

serverPort = 23334

serverSocket = socket(AF_INET, SOCK_DGRAM)
serverSocket.bind(('', serverPort))
print 'This server is ready to receive'
while 1:
    message, clientAddress = serverSocket.recvfrom(2048)
    serverSocket.sendto(message.upper(), clientAddress)
```

`AF_INET`指定了底层网络使用IPv4，`SOCK_DGRAM`意味着这是一个UDP套接字。

**TCP套接字编程**：

```python
# client.py
from socket import *

serverName = 'localhost'
serverPort = 23334

clientSocket = socket(AF_INET, SOCK_STREAM)
clientSocket.connect((serverName, serverPort))
message = raw_input('Input lowercase sentence: ')
clientSocket.send(message)
modifiedMessage, addr = clientSocket.recvfrom(1024)
print modifiedMessage
clientSocket.close()
```

```python
# server.py
from socket import *

serverPort = 23334

serverSocket = socket(AF_INET, SOCK_STREAM)
serverSocket.bind(('', serverPort))
serverSocket.listen(1)
print 'This server is ready to receive'
while 1:
    connectionSocket, addr = serverSocket.accept()
    message, addr = connectionSocket.recvfrom(1024)
    connectionSocket.send(message.upper())
    connectionSocket.close()
```

`SOCK_STREAM`表明它是一个TCP套接字。

# 第3章 运输层

## 3.1 概述和运输层服务

运输层协议为运行在不同主机上的应用进程之间提供了**逻辑通信(logic communication)**功能。在发送端，运输层将发送应用程序进程接收到的报文转换成运输层分组，该分组被称为运输层**报文段(segment)**。运输层将报文端传递给网络层。

因特网网络层协议有一个名字叫IP，即网际协议。IP为主机之间提供了逻辑通信，IP的服务模型是**尽力而为交付服务(best-effort delivery service)**，意味着IP尽力再主机间交付报文段，但它并不做任何确保。IP被称为**不可靠服务(unreliable service)**。每一台主机至少有一个网络层地址，即所谓的IP地址。

UDP和TCP最基本的责任是，将两个端系统间IP的交付服务扩展为运行再端系统上的两个进程之间的交付服务。将主机间交付扩展到进程间交付被称为**运输层的多路复用(transport-layer multiplexing)**与**多路分解(demultiplexing)**。

TCP提供**可靠数据传输(reliable data transfer)**，通过使用流量控制、序号、确认和定时器确保正确地、按序地将数据从发送进程交付给接收进程。TCP还提供**拥塞控制(congestion control)**，而UDP流量是不可调节的。

## 3.2 多路复用与多路分解

一个进程有一个或多个**套接字(socket)**，运输层实际上并没有直接将数据交付给进程，而是将数据交给了一个中间的套接字。每个套接字都有唯一的标识符，格式取决于它是UDP还是TCP套接字。

将运输层报文段中的数据交付到正确的套接字的工作称为**多路分解(demultiplexing)**。套接字将报文传递到网络层的工作称为**多路复用(multiplexing)**。

## 3.3 无连接运输：UDP

部分应用更适合使用UDP的原因：

* 关于何时、发送什么数据的应用层控制更为精细。
* 无需连接建立。
* 无连接状态。
* 分组首部开销小。

**UDP检验和**提供了差错检测功能，检验和用于确定当UDP报文段从源到达目的地移动时，其中的比特是否发生了改变。发送方的UDP对报文段中的所有16比特字的和进行反码运算，求和时遇到的任何溢出都被回卷，得到的结果被放在UDP报文段中的检验和字段。

UDP必须在端到端基础上在运输曾提供差错检测，这是**端到端原则(end-end principle)**的系统设计。

## 3.4 可靠数据传输原理

数据可以通过一条可靠的信道进行传输，实现这种服务抽象是**可靠数据传输协议(reliable data transfer protocol)**的责任。

最简单的情况是，底层信道是完全可靠的，我们称该协议为**rdt 1.0**。

底层信道实际模型是分组中的比特可能受损，需要控制报文来使得接收方可以让发送方知道哪些内容被正确接受。基于这样重传机制的可靠数据传输协议成为**自动重传请求(Automatic Repeat reQuest, ARQ)协议**，包括差错检测、接收方反馈、重传。

**rdt 2.0**存在一个致命的缺陷，没有考虑到ACK或NAK分组受损的可能性。解决方法是在数据分组中添加一新字段，让发送方对其数据分组编号，即将发送数据分组的**序号(sequence number)**放在该字段。

假定比特受损外，底层信道还会丢包。为了实现基于时间的重传机制，**rdt 3.0**需要一个**倒计数定时器(countdown timer)**，在一个给定的时间量过期后，可中断发送方。因为分组序号在0和1之间交替，**rdt 3.0**有时被称为**比特交替协议(alternating-bit protocol)**。

**回退N步(Go-Back-N)协议**允许发送方发送多个分组而不需要等待确认，但也受限于在流水线中未确认的分组数不能超过某个最大允许数N。N常被称为**窗口长度(window size)**，GBN协议也常被称为**滑动窗口协议(sliding-window protocol)**。

TCP有一个32比特的序号字段，其中的TCP序号是按字节流中的字节进行计数的，而不是按分组计数。

**选择重传(SR)**协议通过让发送方仅重传那些它怀疑在接收方出错的分组，而避免了不必要的重传。

## 3.5 面向连接的运输：TCP

TCP被称为是**面向连接的(connection-oriented)**，这是因为在一个应用进程可以开始向另一个应用进程发送数据之前，这两个进程必须先相互“ 握手”。

TCP连接提供的是**全双工服务(full-duplex service)**，也总是**点对点(point-to-point)**的。TCP会将数据引导到该连接的**发送缓存(send buffer)**里，TCP可从缓存中取出并放入报文段中的数据数量受限于**最大报文段长度(Maximum Segment Size, MSS)**。MSS通常根据最初确定的由本地发送主机发送的最大链路层帧长度(即**最大传输单元(Maximum Transmission Unit, MTU)**)来设置。

TCP只确认数据流种至第一个丢失字节为止的字节，所以TCP被称为提供**累积确认(cumulative acknowledgment)**。确认号就是主机正在等待的数据的下一个字节序号。对客户到服务器的数据的确认被装载在一个承载服务器到客户的数据的报文段中，这种确认被称为是被**捎带(piggybacked)**在服务器到客户的数据报文段中的。

TCP采用超时/重传机制来处理报文段的丢失问题。报文段的样本RTT(表示为**SampleRTT**)就是从某报文段被发出(即交给IP)到对该报文段的确认被收到之间的时间量。TCP维持一个SampleRTT均值(称为**EstimatedRTT**)，一旦获得一个新的SampleRTT时，TCP就会根据公式来更新EstimatedRTT。

$EstimatedRTT=(1-\alpha) \cdot EstimatedRTT+\alpha \cdot SampleRTT$，$\alpha$的参考值为0.125。

从统计学观点讲，这种平均被称为**指数加权移动平均(Exponential Weighted Moving Average, EWMA)**。

$DevRTT=(1-\beta) \cdot DevRTT+\beta \cdot | SampleRTT-EstimatedRTT|$，这是SampleRTT和EstimatedRTT之间差值的EWMA。如果SampleRTT值波动较小，那么DevRTT的值就会很小。$\beta$推荐值为0.25。

$TimeoutInterval = EstimatedRTT + 4 \cdot DevRTT$，推荐的初始重传超时间隔为1秒，当出现超时后，TimeoutInterval值将加倍。

TCP在IP不可靠的尽力而为服务之上创建了一种**可靠数据传输服务(reliable data transfer service)**。

发送方通常可在超时事件发生之前通过注意所谓冗余ACK来较好地检测到丢包情况。**冗余ACK(duplicate ACK)**就是再次确认某个报文段地ACK，而发送方先前已经收到对该报文段的确认。一旦收到3个冗余ACK，TCP就执行**快速重传(fast retransmit)**，即在该报文段的定时器过期之前重传丢失的报文段。

TCP为它的应用程序提供了**流量控制服务(flow-control service)**以消除发送方使接收方缓存溢出的可能性。TCP发送方也可能因为IP网络的拥塞而被遏制，这种形式的放松方的控制被称为**拥塞控制(congestion control)**。

TCP通过让发送方维护一个称为**接收窗口(receive window)**的变量来提供流量控制，接收窗口用于给发送方一个指示，指示该接收方还有多少可用的缓存空间。TCP是全双工通信，连接两端的发送方都各自维护一个接收窗口。

TCP连接管理协议为经典的DoS攻击即**SYN洪泛攻击(SYN flood attack)**提供了环境。在这种攻击中，攻击者发送大量的TCP SYN报文段，而不完成第三次握手的步骤。现在有一种有效的防御系统称为**SYN cookie**。

## 3.6 拥塞控制原理

我们可根据网络层是否为运输层拥塞控制提供了显式帮助，来区分拥塞控制方法。

* 端到端拥塞控制。
* 网络辅助的拥塞控制。

## 3.7 TCP拥塞控制

TCP必须使用端到端拥塞控制而不是使用网络辅助的拥塞控制，因为IP层不向端系统提供显式的网络拥塞反馈。

TCP所采用的方法是让每一个发送方根据所感知到的网络拥塞程度来限制其能向连接发送流量的速率。TCP发送方在其运行的TCP拥塞控制机制跟踪一个额外的变量，即**拥塞窗口(congestion window)**。

在一个发送方中未被确认的数据量不会超过`cwnd`与`rwnd`中的最小值，即

$LastByteSent - LastByteAcked \le min \{cwnd, rwnd\}$

当出现过度的拥塞时，在沿着这条路径上的一台(或多台)路由器的缓存会溢出，引起一个数据报(包括一个TCP报文段)被丢弃。丢弃的数据报接着会引起发送方的丢包事件(要么超时或收到3个冗余ACK)，发送方就认为在发送方到接收方的路径上出现了拥塞的指示。

TCP使用确认来触发(或计时)增大它的拥塞窗口长度，所以TCP被说成是**自计时(self-clocking)**的。

**TCP拥塞控制算法(TCP congestion control algorithm)**的3个主要部分：慢启动、拥塞避免、快速恢复。

# 第4章 网络层

## 4.1 概述

网络层的功能：

* 转发：当一个分组到达路由器的一条输入链路时，路由器必须将该分组移动到适当的输出链路。
* 路由选择：当分组从发送方流向接收方时，网络层必须决定这些分组所采用的路由或路径。计算这些路径的算法被称为**路由选择算法(routing algorithm)**。
* 连接建立：允许发送方和接收方建立所需的状态信息。

每台路由器具有一张**转发表(forwarding table)**，路由器通过检查到达分组首部字段的值来转发分组，然后使用该分组将被转发的路由器的输出链路接口。

**分组交换机**时指一台通用分组交换设备，它根据分组首部字段中的值，从输入链路接口到输出链路接口转移分组。某些分组交换机称为**链路层交换机(link-layer switches)**，基于链路层字段中的值做转发决定。其他分组交换机称为**路由器(router)**，基于网络层字段中的值做转发决定。

**网络服务模型(network service model)**定义了分组在发送与接收端系统之间的端到端运输特性。

* 确保交付。
* 具有时延上界的确保交付。
* 有序分组交付。
* 确保最小带宽。
* 确保最大时延抖动。
* 安全性服务。

因特网的网络层提供了单一的服务，称为**尽力而为服务(best-effort service)**。ATM服务模型有**恒定比特率(Constant Bit Rate, CBR)ATM网络服务**、**可用比特率(Available Bit Rate, ABR)ATM网络服务**。

## 4.2 虚电路和数据报网络

仅在网络层提供连接服务的计算机网络称为**虚电路(Virtual-Circuit, VC)网络**，仅在网络层提供无连接服务的计算机网络称为**数据报网络(datagram network)**。

因特网是一个数据报网络，ATM、帧中断的体系结构等是虚电路网络。

VC号是沿着源到目的主机的路径的每段链路的一个号码，每条链路可能具有不同的VC号，每台中间路由器必须用一个新的VC号替代每个传输分组的VC号。该新的VC号从转发表获得。

* 逐链路代替该号码减少了在分组首部中VC字段的长度。
* 通过允许沿着该虚电路路径每条链路有一个不同的VC号，大大简化了虚电路的建立。

在虚电路网络中，该网络的路由器必须为进行中的连接维持**连接状态信息(connection state information)**。

* 虚电路建立。
* 数据传送。
* 虚电路拆除。

对于一个虚电路网络层，沿两个端系统之间的路径上的路由器都要参与虚电路的建立，且每台路由器都完全知道经过它的所有虚电路。

端系统向网络发送指示虚电路启动与终止的报文，以及路由器之间传递的用于建立虚电路(即修改路由器表中的连接状态)的报文，它们被称为**信令报文(signaling message)**，用来交换这些报文的协议常称为**信令协议(signaling protocol)**。

在数据报网络中，每当一个端系统要发送分组，它就为该分组加上目的端系统的地址，然后将分组推进网络中。

路由器用分组的目的地址的**前缀(prefix)**与该表中的表项进行匹配。当有多个匹配时，该路由器使用**最长前缀匹配规则(longest prefix matching rule)**，即在该表中寻找最长的匹配项，并向与最长前缀匹配相关联的链路接口转发分组。

## 4.3 路由器工作原理

网络层的**转发功能(forwarding function)**，即实际将分组从一台路由器的入链路传送到适当的出链路。

* 输入端口：执行将一条输入的物理链路与路由器相连接的物理层功能。
* 交换结构：将路由器的输入端口与输出端口相连接，即网络路由器中的网络。
* 输出端口：存储从交换结构接收的分组，并通过执行必要的链路层和物理层功能在输入链路上传输这些分组。
* 路由选择处理器：执行路由选择协议，维护路由选择表以及连接的链路状态信息，并为路由器计算转发表，还执行网络管理功能。

输入端口、输出端口、交换结构的转发功能，有时总称为**路由器转发平面(router forwarding plane)**。**路由器控制平面(router control plane)**通常用软件实现并在路由选择处理器上执行。

输入端口到交换结构之前需要执行查找，在转发表中查找需要输出的端口。

交换结构中三种交换技术：

* 经内存交换。
* 经总线交换。
* 经互联网络交换。

## 4.4 网际协议：因特网中的转发和编址

因特网编址和转发时网际协议(IP)的重要组件，目前有两个版本的IP在使用，分别是IPv4和IPv6。

构成因特网的网络层的三个主要组件：网际协议(IP)、路由选择协议、互联网控制报文协议(ICMP)。

网络层分组被称为数据报，一个链路层帧能承载的最大数据量叫做**最大传送单元(Maximum Transmission Unit, MTU)**。因为每个IP数据报封装在链路层帧中，故链路层协议的MTU严格地限制着IP数据报的长度。

如果出链路的MTU比该IP数据报的长度要小，必须将IP数据报中的数据分片成两个或更多个较小的IP数据报，用单独的链路层帧封装这些较小的IP数据报，然后发送这些帧。每个较小的数据报都称为**片(fragment)**。

为了坚持网络内核保持简单的原则，IPv4的设计者决定将数据报的重新组装工作放到端系统中，而不是放到网络路由器中。IPv6从根本上废止了分片，从而简化了IP分组的处理。Jolt2攻击向目标主机发送了小片的流，但是没有一个片的偏移量时0。

主机和物理链路之间的边界叫做**接口(interface)**，路由器与它的任意一条链路之间的边界也叫做接口。IP要求每台主机和路由器接口拥有自己的IP地址，因此，一个IP地址技术上是与一个接口相关联的。

IP地址按**点分十进制记法(dotted-decimal notation)**书写。

因特网的地址分配策略被称为**无类别域间路由选择(Classless Interdomain Routing, CIDR)**，CIDR将子网寻址的概念一般化。

使用单个网络前缀通告多个网络能力通常称为**地址聚合(address aggregation)**，也称为**路由聚合(route aggregation)**或**路由摘要(route summarization)**。

在CIDR被采用之前，IP地址的网络部分被限制为长度为8、16或24比特，这是一种称为**分类编址(classful addressing)**的编址方案。`255.255.255.255`是IP广播地址。IP地址由**因特网名字和编号分配机构(Internet Corporation for Assigned Names and Numbers, ICANN)**管理，且还管理DNS根服务器。

**动态主机配置协议(Dynamic Host Configuration, DHCP)**允许主机自动获取(被分配)一个IP地址，且允许主机知道它的子网掩码、第一跳路由器地址(常称为默认网关)、本地DNS服务器地址。由于DHCP具有能将主机连接进一个网络的网络相关方面的自动能力，故它又常被称为**即插即用协议(plug-and-play protocol)**。

DHCP是一个客户-服务器协议，每个子网将具有一台DHCP服务器。如果子网中没有，则需要一个DHCP中继代理(通常是一台路由器)，这个代理知道用于该网络的DHCP服务器的地址。

* **DHCP服务器发现**：使用**DHCP发现报文(DHCP discover message)**来完成，客户在UDP分组中向端口67发送该发现报文。源地址为0.0.0.0，广播目的地址255.255.255.255。
* **DHCP服务器提供**：DHCP服务器收到发现报文，用一个**DHCP提供报文(DHCP offer message)**向客户作出响应，包括发现报文的事务ID、推荐的IP地址、网络掩码、**IP地址租用期(address lease time)**。广播目的地址255.255.255.255。
* **DHCP请求**：从一个或多个服务器中选择一个，向选择服务器发送**DHCP请求报文(DHCP request message)**，回显配置参数。
* **DHCP ACK**：服务器用**DHCP ACK报文**对DHCP请求报文进行响应，证实所要求的参数。

**网络地址转换(Network Address Translation, NAT)**是用于管理IP地址的典型方法。NAT路由器上有一张**NAT转换表(NAT translation table)**，并且在表项中包含了端口号及其IP地址。

NAT另一个重要的问题在于它妨碍P2P应用。如果对等方A不在NAT后面，而对等方B在NAT后面，对等方A能够首先通过一个中间对等方C与对等方B联系，其中C不位于NAT之后并与B已经建立了一条进行中的TCP连接。对等方A则能经对等方C请求对等方B，发起直接返回对等方A的一条TCP连接。这种雇佣关系被称为**连接反转(connection reversal)**，实际上被许多P2P应用用于**NAT穿越(NAT traversal)**。

UPnP是一种允许主机发现并配置邻近NAT的协议，UPnP要求主机和NAT都是UPnP兼容的。通用即插即用(UPnP)提供了NAT穿越。

ICMP被主机和路由器用来彼此沟通网络层的信息，ICMP最典型的用途是差错报告。目的网络不可达之类的错误报文就是在ICMP中产生的。ICMP通常被认为是IP的一部分，但从体系结构上讲它是位于IP之上的，因为ICMP报文是承载在IP分组中的。

IPv6将IP地址长度从32位增加到128位，除了单播和多播地址外，IPv6还引入了一种称为**任播地址(anycast address)**的新型地址，这种地址可以使数据报交付给一组主机中的任意一个。

引入IPv6使能结点的最直接方式使一种**双栈(dual-stack)**方法，即使用该方法的IPv6结点还具有完整的IPv4实现。另一种双栈方法叫做**建隧道(tunneling)**，该方法可以解决IPv6/IPv4丢失初始IPv6字段的问题。我们将两台IPv6路由器之间的中间IPv4路由器的集合称为一个**隧道(tunnel)**，借助于隧道，在隧道发送端的IPv6结点可将整个IPv6数据报放到一个IPv4数据报的数据(有效载荷)字段中。

IPsec是一种提供各种安全性服务的新型网络层协议，在虚拟专用网(VPN)中得到了广泛部署。

## 4.5 路由选择算法

主机通常直接与一台路由器相连接，该路由器即为该主机的**默认路由器(default router)**，又称为该主机的**第一跳路由器(first-hop router)**。我们把源主机的默认路由器称作**源路由器(source router)**，把目的主机的默认路由器称作**目的路由器(destination router)**。

路由选择算法的目标是找出从源到目的地间的**最低费用路径(least-cost path)**。

* **全局式路由选择算法(global routing algorithm)**用完整的、全局性的网络知识计算出从源到目的地之间的最低费用路径。具有全局状态信息的算法常被称作**链路状态(Link State, LS)算法**。
* **分散式路由选择算法(decentralized routing algorithm)**以迭代、分布式的方式计算出最低费用路径。

路由选择算法还分为**静态路由选择算法(static routing algorithm)**、**动态路由选择算法(dynamic routing algorithm)**，**负载敏感算法(load-sensitive algorithm)**、**负载迟钝算法(load-insensitive algorithm)**。

因特网上的路由器能在它们之间进行自同步，即时它们初始时以同一周期但在不同时刻执行算法，算法执行时机最终会在路由器上变为同步并保存之。避免这种自同步的一种方法是，让每台路由器发送链路通告的时间随机化。

拥塞敏感的路由选择会产生振荡。

**距离向量(Distance-Vector, DV)算法**是一种迭代的、异步的和分布式的算法，而LS算法是一种使用全局信息的算法。

$d_x(y)=min_v\{c(x,v)+d_v(y)\}$

**路由选择环路(routing loop)**可以通过使用一种称为**毒性逆转(poisoned reverse)**的技术而加以避免。如果z通过y路由选择到目的地x，则z将通告y，它到x的距离是无穷大。

毒性逆转没有解决一般性的无穷计数问题，如果涉及3个或更多结点的环路将无法用毒性逆转技术检测到。

每个**自治系统(Autonomous System, AS)**由一组通常处在相同管理控制下的路由器组成，在相同的AS中的路由器都全部运行同样的路由选择算法，且拥有彼此的信息。在一个自治系统内运行的路由选择算法叫做**自治系统内部路由选择协议(intra-autonomous system routing protocol)**。将AS彼此互联的路由器称为**网关路由器(gateway router)**。

从相邻AS获取可达性信息和向该AS中所有路由器传播可达性信息是两项由**自治系统间路由选择协议(inter-autonomous system routing protocol)**处理的任务。因特网中的所有AS中都运行相同的AS间路由选择协议，该协议称为BGP4。

**热土豆路由选择(hot potato routing)**中，AS尽可能快地(尽可能经济地)扔掉分组(热土豆)。

## 4.6 因特网中的路由选择

AS内部路由选择协议又称为**内部网关协议(interior gateway protocol)**，历史上有两个路由选择协议曾被广泛用于因特网上自治系统内的路由选择：**路由选择信息协议(Routing Information Protocol, RIP)**、**开放最短路优先(Open Shortest Path First, OSPF)**。

RIP是一种距离向量协议，使用跳数作为其费用测度，即每条链路的费用为1。一条路径的最大费用被限制为15，因此RIP的使用限制在网络直径不超过15跳的自治系统内。在RIP中，路由选择更新信息在邻居间通过使用一种**RIP响应报文(RIP response message)**来交换，大约每30秒相互交换一次。响应报文又称为**RIP通告(RIP advertisement)**。

每台路由器维护一张称为**路由选择表(routing table)**的RIP表，一台路由器的路由选择表包括该路由器的距离向量和该路由器的转发表。

如果一台路由器一旦超过180秒没有从邻居听到报文，则该邻居不再被认为是可达的。路由器在UDP上使用端口520相互发送RIP请求与响应报文。

OSPF的核心就是一个使用洪泛链路状态信息的链路状态协议和一个Dijkstra最低费用路径算法。

由RFC4271定义的**边界网关协议(Broder Gateway Protocol, BGP)**版本4是当今因特网中域间路由旋转协议事实上的标准。在BGP中，路由器对通过使用179端口的半永久TCP连接来交换路由选择信息。在BGP中，目的地不是主机而是CDIR化的**前缀(prefix)**，每个前缀表示一个子网或一个子网的集合。

在BGP中，一个自治系统由其全局唯一的**自治系统号(Autonomous System Number, ASN)**所标识。特殊是有一种所谓**桩(stub)**AS通常就没有ASN，这种桩AS仅承载源地址或目的地址为本AS的流量。

当一台路由器通过BGP会话通告一个前缀时，它在前缀中包括一些BGP属性，包括AS-PATH、NEXT-HOP。当一台网关路由器接收到一台路由器通告时，它使用其**输入策略(import policy)**来决定是否接收或过滤该路由。

**多宿桩网络(multi-homed stub network)**是经由多个不同的提供商连到网络的**桩网络(stub network)**。

## 4.7 广播和多播路由选择

在**广播路由选择(broadcast routing)**中，网络层提供了从一种源结点到网络中的所有其他结点交付分组的服务；**多播路由选择(multicast routing)**使单个源结点能够向其他网络结点的一个子集发送分组的副本。

实现广播的最显而易见的技术是**洪泛(flooding)**方法，该方法要求源结点向它的所有邻居发送分组的副本。如果该图具有圈，则会无休无止地循环，这称为**广播风暴(broadcast storm)**。

在**序号控制洪泛(sequence-number-controlled flooding)**中，源结点将其地址(或其他唯一的标识符)以及**广播序号(broadcast sequence number)**放入广播分组，再向它的所有邻居发送该分组。每个站点维护它已经收到的、复制的和转发的源地址和每个广播分组的序号列表。

受控洪泛的第二种方法被称为**反向路径转发(Reverse Path Forwarding, RPF)**，有时候也称为反向路径广播(RPB)。当一台路由器接收到具有给定源地址的广播分组时，仅当该分组到达的链路正好是位于它自己的返回其源的最短单播路径上，它才向其所有出链路传输报文。

虽然序号控制洪泛和RPF避免了广播风暴，但它们不能完全避免冗余广播分组的传输。提供广播的另一种方法是首先对网络结点构造出一颗生成树。采用**基于中心的方法(center-based approach)**建立一颗生成树时，要定义一个中心结点(也称之为**汇合点(rendezvous point)**或**核(core)**)，结点则向中心结点单播加入树(tree-join)报文。

在因特网体系结构中，多播数据报使用**间接地址(address indirection)**来编址。这就是说，用一个标识来标识一组接收方，寻址到该组的分组副本被交付给所有与该组相关联的多播接收方，且该组使用这个单一标识符。

在因特网中，这种表示一组接收方的单一标识就是一个D类多播地址。与一个D类地址相关联的接收方小组被称为一个**多播组(multicast group)**。

IGMP只有三种报文类型，与ICMP类似，IGMP报文也是承载(封装)在一个IP数据报中，使用的IP协议号为2。

# 第5章 链路层：链路、接入网和局域网

## 5.1 链路层概述

我们将运行链路层协议的任何设备均称为**结点(node)**，结点包括主机、路由器、交换机和WiFi接入点。我们也把沿着通信路径连接相邻结点的通信信道称为**链路(link)**。在通过特定的链路时，传输结点将数据报封装在**链路层帧**中，并将该帧传送到链路中。

链路层协议能够提供的可能服务：

* 成帧(framing)。
* 链路接入。**媒体访问控制(Medium Access Control, MAC)**协议规定了帧在链路上传输的规则。
* 可靠交付。链路层的可靠交付服务通常时通过确认和重传取得的。
* 差错检测和纠正。

链路层的主体部分是在**网络适配器(network adapter)**中实现的，网络适配器有时也称为**网络接口卡(Network Interface Card, NIC)**。位于网络适配器核心的是链路层控制器，该控制器通常是一个实现了许多链路层服务(成帧、链路接入、差错检测等)的专用芯片。

## 5.2 差错检测和纠正技术

**比特级差错检测和纠正(bit-level error detection and correction)**，即对从一个结点发送到另一个物理上连接的邻近结点的链路层帧中的比特损伤进行检测和纠正，它们通常是链路层提供的两种服务。

即使采用差错检测比特，也还是可能有**未检出的比特差错(undetected bit error)**。传输数据中检测差错的3种技术：奇偶校验、检验和方法、循环冗余检测。

差错检测最简单的方式就是用单个**奇偶校验位(parity bit)**。如果出现奇数个1，那就表示出现了奇数个比特差错。

使用**二维奇偶校验(two-dimensional parity)**方案，可以检测一个分组中两个比特差错的任何组合，但是不能纠正。

接收方检测和纠正差错的能力被称为**前向纠错(Forward Error Correction, FEC)**。

现今的计算机网络中广泛应用的差错检测技术基于**循环冗余检测(Cyclic Redundancy Check, CRC)**，CRC编码也称为**多项式编码(polynomial code)**，因为该编码能够将要发送的比特串看作为系数是0和1一个多项式，对比特串的操作被解释为多项式算术。

发送方和接收方首先必须协商一个r+1比特模式，称为**生成多项式(generator)**，我们将其表示为G。我们要求G的最高有效位的比特(最左边)是1。所有CRC计算采用模2算术来做，即等价于操作数的按位异或(XOR)。

每个CRC标准都能检测小于r+1比特的突发差错。

## 5.3 多路访问链路和协议

**点对点链路(point-to-point link)**由链路一端的单个发送方和链路另一端的单个接收方组成。许多链路层协议都是为点对点链路设计的，如点对点协议(point-to-point protocol, PPP)和高级数据链路控制(high-level data link control, HDLC)就是两种这样的协议。

**广播链路(broadcast link)**能够让多个发送和接收节点都连接到相同的、单一的、共享的广播信道上。

多路访问协议划分为3种类型：**信道划分协议(channel partitioning protocol)**、**随机接入协议(random access protocol)**、**轮流协议(taking-turns protocol)**。

时分多路复用(TDM)和频分多路复用(FDM)是两种能够用于在所有共享信道结点之间划分广播信道带宽的技术。第三种信道划分协议是**码分多址(Code Division Multiple Access, CDMA)**。

随机接入协议在结点碰撞时，重发它的帧。但是在重发该帧之前等待一个随机时延。在时隙ALOHA和纯ALOHA中，一个结点传输的决定独立于连接到这个广播信道上的其他结点的活动。CSMA和CSMA/CD有**载波侦听(carrier sensing)**和**碰撞检测(collision detection)**。

轮流协议中的**轮询协议(polling protocol)**要求这些结点之一要被指定为主结点。另一个轮流协议是**令牌传递协议(token-passing protocol)**，一个称为**令牌(token)**的小的特殊帧在结点之间以某种固定的次序进行交换。

## 5.4 交换局域网

链路层地址有不同的称呼：**LAN地址**、**物理地址**、**MAC地址**。MAC地址长度为6字节，通常用十六进制表示法。MAC地址被设计为永久的，但是用软件可以改变一块适配器的MAC地址。IEEE管理MAC地址空间。

发送适配器通过向帧的目的地址字段中插入一个特殊的MAC**广播地址**，让其他所有适配器来接收并处理帧。广播地址由48个连续的1组成的字符串。

对网络层地址(IP)和链路层地址(MAC)的转换，对因特网而言，这是**地址解析协议(Address Resolution Protocol, ARP)**的任务。

DNS为在因特网中任何地方的主机解析主机名，而ARP只为同一个子网上的主机和路由器接口解析IP地址。

每台主机或路由器在其内存中具有一个**ARP表(ARP table)**，这张表包含IP地址到MAC地址的映射关系。该ARP表也包含一个寿命(TTL)值，它指示了从表中删除每个映射的时间，通常过期时间是20分钟。

如果ARP表中当前没有该目的主机的表项，首先发送方构造一个称为**ARP分组(ARP packet)**的特殊分组，包含发送和接收IP地址及MAC地址。ARP查询分组和响应分组都具有相同的格式。ARP查询分组的目的是询问子网上所有其他主机和路由器，以确定对应于要解析的IP地址的那个MAC地址。

查询ARP报文是在广播帧中发送的，而响应ARP报文在一个标准帧中发送。ARP分组封装在链路层帧中，因而在体系结构上位于链路层之上。

以太网技术都向网络层提供**不可靠服务(unreliable service)**。

**过滤(filtering)**是决定一个帧应该转发到某个接口还是应当将其丢弃的交换机功能，**转发(forwarding)**是决定一个帧应该被导向哪个接口并把该帧移动到那些接口的交换机功能。交换机的过滤和转发借助于**交换机表(switch table)**完成。

交换机是**自学习(self-learning)**的。交换机是**即插即用设备(plug-and-play device)**，因为它们不需要网络管理员或用户干预。交换机是双工的，这意味着任何交换机接口能够同时发送和接收。

链路层交换机的优点：

* 消除碰撞，决不会在网段上同时传输多余一个帧。
* 异质的链路，局域网不同链路能够以不同的速率运行并且能够在不同的媒体上运行。
* 管理，除了提供强化的安全性，交换机也易于进行网络管理。

**虚拟局域网(Virtual Local Network, VLAN)**将交换机的端口划分为组，在每个VLAN中的端口形成一个广播域。一种更具扩展性互联VLAN交换机的方法称为**VLAN干线连接(VLAN trunking)**，在VLAN干线方法中，每台交换机上的一个特殊端口被配置为干线端口，以互联这两台VLAN交换机。该干线端口属于所有VLAN，发送到任何VLAN的帧经过干线链路转发到其他交换机。

IEEE定义了一种扩展的以太网帧格式——802.1Q，用于跨越VLAN干线的帧。802.1Q帧由标准以太网帧与加进首部的4字节**VLAN标签(VLAN tag)**组成，而VLAN标签承载着该帧所属的VLAN标识符。VLAN标签自身由一个2字节的**标签协议标识符(Tag Protocol Identifier, TPID)**字段、一个2字节的标签控制信息字段、一个3比特优先权字段组成。

## 5.5 链路虚拟化：网络作为链路层

**多协议标签交换(Multiprotocol Label Switching, MPLC)**与IP协同工作，使用IP寻址和路由选择，有效地将虚电路技术综合进了路由选择地数据报网络。

一个MPLS加强的帧仅能在两个均为MPLS使能的路由器之间发送。一个MPLS使能的路由器常被称为**标签交换路由器(label-switched router)**，因为它通过在其转发表中查找MPLS标签，然后立即将数据报传递给适当的输出接口来转发MPLS帧。

## 5.6 数据中心网络

数据中心中的主机称为**刀片(blade)**，每个机架一般堆放20~40台刀片，在每个几家顶部由一台交换机，这台交换机被形象地称为**机架顶部(Top of Rack, TOR)交换机**。

数据中心网络包括了一台或者多台**边界路由器(border router)**，它们将数据中心网络与公共因特网相连。

在数据中心内部，外部请求首先被定向到一个**负载均衡器(load balancer)**。负载均衡器的任务是向主机分发请求，以主机当前的负载作为函数来在主机之间均衡负载。

# 第6章 无线网络和移动网络

## 6.1 概述

* 无线主机：wireless host。
* 无线链路：主机通过**无线通信链路(wireless communication link)**连接到一个基站或者另一台无线主机。
* 基站：base station。

与基站关联的主机通常被称为以**基础设施模式(infrastructure mode)**运行，因为所有传统的网络服务(如地址分配和路由选择)都由网络向通过基站相连的主机提供。在**自组织网络(ad hoc network)**中，无线主机没有这样的基础设施与之相连。

当一台移动主机移动超过一个基站的覆盖范围而到达另一个基站的覆盖范围后，它将改变其接入到更大网络的连接点，这一过程称作**切换(hand off)**。

## 6.2 无线链路和网络特征

* **路径损耗(path loss)**：信号强度随着发送方和接收方距离的增加而减弱。
* 来自其他源的干扰。
* **多径传播(multipath propagation)**：受物体和地面反射，这使得接收方收到的信号变得模糊。

**信噪比(Signal-to-Noise Ratio, SNR)**是所收到的信息(如被传输的信息)和噪声强度的相对测量，SNR的度量单位通常是分贝(dB)。

在第5章中，我们描述了3类媒体访问协议：信道划分、随机访问、轮流。

**码分多址(Code Division Multiple Access, CDMA)**属于信道划分协议一族，它在无线LAN和蜂窝技术中应用很广泛。在CDMA协议中，要发送的每个比特都通过乘以一个信号(编码)的比特来进行编码，这个信号的变化速率(通常称为**码片速率(chipping rate)**)比初始数据比特序列的变化速率快得多。

## 6.3 WiFi：802.11无线LAN

802.11标准都使用相同得媒体访问协议CSMA/CA。

802.11体系结构的基本构件模块是**基本服务集(Basic Service Set, BSS)**，一个BBS包含一个或多个无线站点和一个在802.11术语中称为**接入点(Access Point, AP)**的中央**基站(base station)**。配置AP的无线LAN经常被称作**基础设施无线LAN(infrastructure wireless LAN)**，其中“基础设施”是指AP连同互联AP和一台路由器的有线以太网。

当网络管理员安装一个AP时，管理员为该接入点分配一个单字或双字的**服务集标识符(Service Set Identifier, SSID)**。

802.11标准要求每个AP周期性地发送**信标帧(beacon frame)**，每个信标帧包括该AP地SSID和MAC地址。

扫描信道和监听信标帧的过程被称为**被动扫描(passive scanning)**，无线主机也能够执行**主动扫描(active-scanning)**，这是通过向位于无线主机范围内的所有AP广播探测帧完成的。

802.11的设计者为802.11无线LAN选择了一种随机访问协议，这个随机访问协议称作**带碰撞避免的CSMA(CSMA with collision avoidance)**，或简称为**CSMA/CA**。

802.15.1网络以小范围、低功率和低成本运行，有时被称为**无线个人区域网络(Wireless Personal Area Network, WPAN)**标准。802.15.1的链路层和物理层基于早期用于个人区域网络的**蓝牙(Bluetooth)**规范。被称作**跳频扩展频谱(Frequency-Hopping Spread Spectrum, FHSS)**的信道跳动的形式将传输及时扩展到整个频谱。

802.15.1网络是自组织网络，不需要网络基础设施(如一个接入点)来互连802.15.1设备。802.15.1设备首先组织成一个多达8个活动设备的**皮可网(piconet)**，这些设备之一被指定为主设备，其余充当从设备。

IEEE的第二个个人区域网络标准是802.14.5，它被称为ZigBee。

## 6.4 蜂窝因特网接入

**全球移动通信系统(GSM)**，每个小区包含一个**收发基站(Base Transceiver Station, BTS)**，负责向位于其小区内的移动站点发送或接收信号。

一个GSM网络的**基站控制器(Base Station Controller, BSC)**通常服务于几十个收发基站。BSC的责任是为移动用户分配BTS无线信道，执行**寻呼(paging)**，执行移动用户的切换。基站控制器及其控制的收发基站共同构成了**GSM基站系统(Base Station System, BSS)**。

## 6.5 移动管理：原理

在一个网络环境中，一个移动结点的永久居所被称为**归属网络(home network)**，在归属网络中代表移动结点执行下面讨论的移动管理功能的实体叫**归属代理(home agent)**。移动结点当前所在网络叫做**外部网络(foreign network)**或**被访网络(visited network)**，在外部网络中帮助移动结点做移动管理功能的实体称为**外部代理(foreign agent)**。

## 6.6 移动IP

支持移动性的因特网体系结构与协议合起来称为移动IP。移动IP的标准由三部分组成：

* 代理发现。
* 向归属代理注册。
* 数据报的间接路由选择。

## 6.7 蜂窝网中的移动性管理

与移动IP类似，GSM采用了一种间接路由选择方法，首先将通信者的呼叫路由选择到移动结点的归属网络，再从那到达被访网络。

