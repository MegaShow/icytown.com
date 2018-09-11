---
title: Start | Hexo初探
date: 2017-8-28
categories: Start
tags: Hexo
---

本秀真是太懒了，原本打算在暑假把[冰淇淋](https://github.com/MegaShow/ice-cream)给完工，结果一个暑假什么事情都没做。开学又不能花很多时间来搞这些，所以决定先上个[Hexo](https://hexo.io/)来玩玩，代替一下冰淇淋作为我的冰镇。

<!-- more -->

## Hexo介绍

A fast, simple & powerful blog framework, powered by Node.js.

这个是官方的解释，通俗来说就是Hexo是一个博客框架，搭建静态网站非常简单。

## Hexo使用

### 安装

Hexo需要npm和nodejs的支持，Windows用户可以直接在官网找到npm和nodejs的二进制包安装，Linux用户可以参考[这里](https://icytown.com/install/first-exp-nodejs.html)安装。

然后打开shell(或者power shell)，输入下面命令。(这里使用power shell进行测试)

```shell
[PS ~]# npm install hexo-cli -g
```

### 创建博客

```shell
[PS ~]# hexo init blog
```

blog是储存hexo博客信息的文件夹，blog必须不存在或者存在且为空文件夹。

```shell
[PS ~]# cd blog
```

### 修改博客信息

在blog文件夹里面有个文件`_config.yml`，里面储存了博客的信息。

修改站点信息：

```yaml
title: 冰镇  # 网站标题
subtitle: 千万世界的一个小小镇  # 网站副标题
description: MegaShow的第二个小圈子  # 网站描述
author: Mega Show  # 网站站长
language: zh-Hans  # 网站语言
timezone:   # 网站时区, 留空默认使用电脑时区
```

修改链接信息：

```yaml
url: https://icytown.com  # 网站网址
root: /  # 网站根目录
permalink: :category/:title/  # 文章永久链接格式
permalink_defaults:  # 文章永久链接各部分的默认值
```

如果博客不是`https://icytown.com`，而是`https://icytown.com/blog`，那就把`url`改为`https://icytown.com/blog`，把`root`改为`/blog/`。

|     变量      |                   描述                    |
| :---------: | :-------------------------------------: |
|   `:year`   |              文章的发表年份（4 位数）              |
|  `:month`   |              文章的发表月份（2 位数）              |
| `:i_month`  |             文章的发表月份（去掉开头的零）             |
|   `:day`    |             文章的发表日期 (2 位数)              |
|  `:i_day`   |             文章的发表日期（去掉开头的零）             |
|  `:title`   |                  文件名称                   |
|    `:id`    |                  文章 ID                  |
| `:category` | 分类。如果文章没有分类，则是 `default_category` 配置信息。 |

### 生成静态文件并调试

生成静态网站

```shell
[PS blog]# hexo generate
```

调试

```shell
[PS blog]# hexo server
```

然后本地访问`localhost:4000`，查看静态网站是否正常生成。

删除生成的静态网站文件

```shell
[PS blog]# hexo clean
```

### 写博客

hexo的文章储存在`source/_posts`文件夹中，hexo的文章用的是`markdown`格式。

创建一个`hello-hexo.md`：

```markdown
---
title: Hello Hexo
data: 2017-8-28
categories: hello
tags: a-tag
---

上面的头储存的是文章title、时间、分类、标签

如果没有储存data信息，那默认为md文件的修改时间。

```

## Hexo进阶

hexo进阶篇需要`Git`的支持。

### 修改主题

`_config.yml`文件里面有个`theme`变量储存主题名称，而主题文件储存在`themes`文件夹中。

这里我们使用[NexT](http://theme-next.iissnan.com/)作为我们的hexo主题。

```shell
[PS blog]# git clone https://github.com/iissnan/hexo-theme-next themes/next
```

利用Git下载好next之后就在`_config.yml`中修改信息：

```yaml
theme: next
```

这时候生成静态网站之后可以发现网站主题发生显著变化。

#### 添加分类、标签、关于功能

修改了主题之后，分类、标签的目录页面(`/categories`、`/tags`页面)无法正常打开，需要我们手动创建。

在`themes/next/_config.yml`文件中，储存了主题的配置信息，我们需要修改这个文件。

```yaml
menu:
  home: /
  archives: /archives/
  categories: /categories/
  tags: /tags/
  about: /about/
  #sitemap: /sitemap.xml
  #commonweal: /404/
```

打开shell，输入：

```shell
[PS blog]# hexo new page categories
[PS blog]# hexo new page tags
[PS blog]# hexo new page about
```

然后修改`source/categories/index.md`和`source/tags/index.md`两个文件。

```markdown
---
title: 分类
date: 2017-08-28
type: "categories"
---
```

```markdown
---
title: 标签
date: 2017-08-28
type: "tags"
---
```

而about页面则是修改`source/about/index.md`，想写啥就写啥。

#### 添加头像

修改主题配置文件

```yaml
avatar: /images/avatar.jpg
```

然后将`avatar.jpg`放到`source/images`中。

#### 添加社交链接

在主题配置文件里面有两项数据，`social`、`social_icons`。

我们修改`social`信息：

```yaml
social:
	GitHub: https://github.com/MegaShow
	E-Mail: mailto:megaxiu@outlook.com
```

然后就添加了GitHub和E-Mail的地址到博客上了。

#### 添加友情链接

```yaml
links_title: 友情链接
links:
  Zhenly's Blog: https://blog.zhenly.cn/
```

### Github Pages

首先创建一个格式为`username.github.io`的repository，然后修改博客配置文件`_config.yml`。

```yaml
deploy:
  type: git
  repo: https://github.com/MegaShow/MegaShow.github.io.git  # username => MegaShow
  branch: master
```

然后执行命令：

```shell
[PS blog]# npm install hexo-deployer-git --save
```

接下来就可以通过命令来把本地静态网站代码上传到GitHub上。

```shell
[PS blog]# hexo deploy
```

（如果上传失败，请检查本地是否配置好Git邮箱、用户名，和GitHub的SSL证书认证）

