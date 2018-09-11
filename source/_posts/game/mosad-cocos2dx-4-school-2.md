---
title: Game | Cocos2d-x游戏开发(4) 可以玩的崩坏学园
date: 2018-6-15
categories: Game
tags: Cocos2d-x
---

Cocos2d-x游戏开发系列文章是本菜秀在《现代操作系统应用开发(MOSAD)》课程上的作业笔记，旨在加深自己对Cocos2d-x的认识，所以可能会排版无比奇葩。当然，这里不仅仅局限于课程上学到的东西，菜秀尽力分享更多东西。如果学疏才浅的菜秀有啥错误，欢迎指正。

本文是本系列的第四篇文章，实现一个可以玩的崩坏学园。

<!-- more -->

# Cocos2d-x游戏开发(4) 可以玩的崩坏学园

[GitHub源码地址](https://github.com/MegaShow/college-programming/tree/master/Homework/Modern%20Operating%20System%20Application%20Development/Cocos%20-%20TheEndOfSchool)

## 迁移解决方案

参照第二篇文章。

## TileMap地图创建

本文章将实现类似RM那种瓷砖式地图，又叫TileMap。我们使用Tiled作为生成瓷砖式地图的工具，这里不详细说明创建的地图的过程，而只是简单说明一下注意事项。

首先我们需要一个图集，即存储瓷砖的图片集图片，该图片按照固定大小切割下来就成了一块块瓷砖了。这里我们采用了RPG Maker XP的`023-FarmVillage01`作为图集。

然后我们需要一个图集信息XML文件，通常为`.tsx`后缀，里面说明了图集的属性信息，以及图集如何切割成瓷砖，小瓷砖的大小等信息。**值得注意，图集信息里面的图集路径必须是相对路径。**

而用Tiled生成的地图，其后缀为`.tmx`，也是一个XML文件，说明了使用哪个`.tsx`文件，同时指明地图各个位置使用什么瓷砖。类似RM，地图可以创建多个图层，实现层次效果。地图里面还能创建对象，用于碰撞检测等。

```cpp
auto tmx = TMXTiledMap::create("map.tmx");
tmx->setScale(tmx->getMapSize().width * tmx->getTileSize().width / tmx->getContentSize().width);
tmx->setPosition(visibleSize.width / 2, visibleSize.height / 2);
tmx->setAnchorPoint(Vec2(0.5, 0.5));
this->addChild(tmx, 0);
```

这里我们设置了新的`Scale`，是因为默认的全局缩放因子不是1，而是2，这个是Cocos2d-x在`AppDelegate`中根据初始化窗体大小来决定的。

## 怪物工厂

模板提供了一个单例类怪物工厂类，提供了很多实现封装。

### 随机产生怪物

在上一次作业的基础上，我们需要在`MapLayer`中使用工厂类来随机产生怪物。

```cpp
void MapLayer::updateCreateMonster(float dt) {
	auto monster = Factory::getInstance()->createMonster();
	float x = random(0.f, this->getContentSize().width);
	float y = random(0.f, this->getContentSize().height);
	monster->setPosition(Vec2(x, y));
	this->addChild(monster, 2);
}
```

同时，需要让怪物向玩家移动。

```cpp
void MapLayer::updateMoveMonster(float dt) {
	Factory::getInstance()->moveMonster(Player::getInstance()->getPosition(), 1);
}
```

对于这两个调度器，我们均设置为2秒执行一次。

```cpp
this->schedule(schedule_selector(MapLayer::updateCreateMonster), 2.0f);
this->schedule(schedule_selector(MapLayer::updateMoveMonster), 2.0f);
```

### 怪物攻击

怪物当碰到玩家的时候就相当于攻击玩家，于是我们需要默认调度器来监听碰撞事件。

```cpp
void MapLayer::update(float dt) {
    auto player = Player::getInstance();
    auto monster = Factory::getInstance()->collider(player->getBoundingBox());
    if (monster != nullptr)
    {
        Factory::getInstance()->removeMonster(monster);
        double hp = player->Hit(15);
        if (hp <= 0)
        {
            this->unscheduleAllCallbacks();
        }
    }
}
```

这里调用了`Player::Hit`方法，该方法用来减低玩家的血量。

```cpp
double Player::Hit(double x) {
	this->hp -= x;
	if (this->hp <= 0) {
		Dead();
		return 0;
	}
	return this->hp;
}
```

### 玩家攻击

玩家攻击的逻辑需要在`Player`类里面实现，首先我们修改`Attack`方法。

```cpp
void Player::Attack() {
    if (this->isDead || this->getNumberOfRunningActions()) {
        return;
    }
    auto fn = CallFunc::create(CC_CALLBACK_0(Player::ResetSpriteFrame, this));
	auto delay = DelayTime::create(0.3);
	auto checkFn = CallFunc::create(CC_CALLBACK_0(Player::CheckAttack, this));
    auto sequence = Sequence::create(this->attack, fn, nullptr);
	auto sequence2 = Sequence::create(delay, checkFn, nullptr);
	auto spawn = Spawn::create(sequence, sequence2, nullptr);
    this->runAction(spawn);
}
```

这里可以发现，我们在玩家执行攻击动画的0.3秒之后会调用`CheckAttack`方法，该方法用于检测攻击是否有效。因为怪物工厂只提供返回一个怪物的碰撞方法，所以我们每次只能攻击一个怪物。

```cpp
void Player::CheckAttack() {
	auto playerRect = this->getBoundingBox();
	auto monsterRect = Rect(playerRect.getMinX() - 40, playerRect.getMinY() - 20,
		playerRect.getMaxX() - playerRect.getMinX() + 80, playerRect.getMaxY() - playerRect.getMinY() + 40);
	auto monster = Factory::getInstance()->collider(monsterRect);
	if (monster != nullptr) {
		this->Cure(15);
		Factory::getInstance()->removeMonster(monster);
	}
}
```

因为每次攻击怪物可以给玩家回复生命，我们调用`Cure`方法。

```cpp
double Player::Cure(double x) {
	this->hp += x;
	if (this->hp > 100) {
		this->hp = 100;
	}
	return this->hp;
}
```

## 本地存储

`UserDefault`提供了本地存储键值对的工具，这是一个单例类。下面是设置和获取值为整型的键值对。

```cpp
int val = UserDefault::getInstance()->getIntegerForKey("Monster");
UserDefault::getInstance()->setIntegerForKey("Monster", val + 1);
```

## 结语

日常无。

