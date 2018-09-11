---
title: Start | NodeJS配置
date: 2017-7-31
categories: Start
tags:
  - Node
  - NPM
---

<!-- more -->

```sh
$ wget https://nodejs.org/dist/v8.1.0/node-v8.1.0-linux-x64.tar.xz
$ tar -xvJf node-v8.1.0-linux-x64.tar.xz
$ sudo mv node-v8.1.0-linux-x64 /opt
$ sudo ln -s /opt/node-v8.1.0-linux-x64/bin/node /usr/local/bin/node
$ sudo ln -s /opt/node-v8.1.0-linux-x64/bin/npm /usr/local/bin/npm
```

验证

```sh
$ node -v
$ npm -v
```

