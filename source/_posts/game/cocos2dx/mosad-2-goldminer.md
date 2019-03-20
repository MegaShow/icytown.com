---
title: Game | Cocos2d-x游戏开发(2) 不能玩的黄金矿工
date: 2018-5-20
categories: Game and Computer Graphics
tags:
- Cocos2dx
---

Cocos2d-x游戏开发系列文章是本菜秀在《现代操作系统应用开发(MOSAD)》课程上的作业笔记，旨在加深自己对Cocos2d-x的认识，所以可能会排版无比奇葩。当然，这里不仅仅局限于课程上学到的东西，菜秀尽力分享更多东西。如果学疏才浅的菜秀有啥错误，欢迎指正。

本文是本系列的第二篇文章，实现一个不能玩的黄金矿工。

<!-- more -->

# Cocos2d-x游戏开发(2) 不能玩的黄金矿工

[GitHub源码](https://github.com/MegaShow/college-programming/tree/master/Homework/Modern%20Operating%20System%20Application%20Development/Cocos%20-%20GoldMiner)

## 迁移解决方案

因为Cocos2d-x关于引擎部分的代码是通过源代码的方式提供的，并且新建解决方案是通过复制粘贴的方式添加引擎代码，而不是引用引擎文件夹中的代码。所以每次新建解决方案，都要重新对引擎进行编译链接，所需时间非常长。

因此我们沿用上一次所用的工程，只对启动项目进行修改。

首先我们需要将之前项目的`src`筛选器中的代码文件删掉，然后在文件系统里面将新的代码文件复制粘贴到适合的地方，然后往`src`筛选器中添加现有项，将新的代码文件添加进筛选器中。

然后进行编译运行，等待编译结束。(别重新生成解决方案或启动项目，会后悔的)

## 主界面

### 背景适应

运行基础项目，会出现一个主界面实现了一部分的窗体。很明显可以看到窗体左右有两条黑框，有点不太爽。首先我们沿用上一篇文章适应大小的方式，来适应背景。

```cpp
float bgSkyScaleX = visibleSize.width / bg_sky->getContentSize().width;
float bgSkyScaleY = visibleSize.height / bg_sky->getContentSize().height;
bg_sky->setScale(MIN(bgSkyScaleX, bgSkyScaleY));

float bgScaleX = visibleSize.width / bg->getContentSize().width;
float bgScaleY = visibleSize.height / bg->getContentSize().height;
bg->setScale(MIN(bgScaleX, bgScaleY));
```

当然，以上的代码是只在窗体大小固定这种情况下有用的。如果窗体大小设为特定的情况下， 可能会导致上下两张图片不能契合在一起。

### 添加标题

添加标题很简单，只需要我们创建一个Sprite，然后将其位置设置好就可以了。

```cpp
auto title = Sprite::create("gold-miner-text.png");
title->setPosition(Vec2(visibleSize.width / 2 + origin.x, visibleSize.height + origin.y - 100));
this->addChild(title, 0);
```

### 添加开始按钮

首先我们创建一个`MenuItemImage`，然后根据这个Item创建一个`Menu`，最后设置一下位置。然后将菜单背景也添加上去。

```cpp
auto startItem = MenuItemImage::create("start-0.png", "start-1.png",
    CC_CALLBACK_1(MenuScene::startMenuCallback, this));
auto menu = Menu::create(startItem, NULL);
startItem->setPosition(Vec2(visibleSize.width + origin.x - 200, 200));
menu->setPosition(Vec2::ZERO);
this->addChild(menu, 1);

auto startPic = Sprite::create("menu-start-gold.png");
startPic->setPosition(Vec2(visibleSize.width + origin.x - 200, 150));
this->addChild(startPic, 0);
```

对于页面跳转的方法`startMenuCallback`，这里利用`replaceScene`来跳转页面：

```cpp
void MenuScene::startMenuCallback(cocos2d::Ref * pSender) {
    Director::getInstance()->replaceScene(GameScene::createScene());
}
```

不过这里记得需要`include`一下相应的头文件，否则将找不到`GameScene`。

```cpp
#include "GameScene.h"
```

## 游戏界面

### 场景布局

首先我们确定一下场景的布局：背景、石头、钻石老鼠、奶酪、Shoot按钮。按照要求我们需要创建两个`Layer`，分别放石头和钻石老鼠，那么我们的背景、奶酪和按钮就放在`Scene`了。

在写布局之前，需要注意，模板有`Scene`的拼写错误，并且`createScene`内部有严重错误。模板中的`createScene`调用了`Scene::create`，而这里需要调用`GameScene::create`。

```cpp
Scene* GameScene::createScene() {
    return GameScene::create();
}
```

然后开始写布局：

```cpp
auto bg = Sprite::create("level-background-0.jpg");
float scaleX = visibleSize.width / bg->getContentSize().width;
float scaleY = visibleSize.height / bg->getContentSize().height;
bg->setScale(MIN(scaleX, scaleY));
bg->setPosition(Vec2(visibleSize.width / 2 + origin.x, visibleSize.height / 2 + origin.y));
this->addChild(bg, 0);

auto shootItem = MenuItemFont::create("Shoot", CC_CALLBACK_1(GameScene::shootMenuCallback, this));
auto menu = Menu::create(shootItem, NULL);
shootItem->setPosition(Vec2(visibleSize.width + origin.x - 100, visibleSize.height + origin.y - 100));
menu->setPosition(Vec2::ZERO);
this->addChild(menu, 1);

stoneLayer = Layer::create();
stoneLayer->setPosition(Vec2::ZERO);
stoneLayer->setAnchorPoint(Vec2::ZERO);
stone = Sprite::create("stone.png");
stone->setPosition(Vec2(560, 480));
stoneLayer->addChild(stone);
this->addChild(stoneLayer, 1);

mouseLayer = Layer::create();
mouseLayer->setPosition(Vec2(0, visibleSize.height / 2 + origin.y));
mouseLayer->setAnchorPoint(Vec2::ZERO);
mouse = Sprite::createWithSpriteFrameName("gem-mouse-0.png");
mouse->setPosition(Vec2(visibleSize.width / 2 + origin.x, 0));
mouseLayer->addChild(mouse);
this->addChild(mouseLayer, 1);
```

这里的老鼠是用`createWithSpriteFrameName`创建的，自然在调用这个函数之前我们需要将相应的Frame添加进来，这里的`mouseAnimation`是老鼠移动的动画。

```cpp
SpriteFrameCache::getInstance()->addSpriteFramesWithFile("level-sheet.plist");
char totalFrames = 3;
char frameName[20];
Animation* mouseAnimation = Animation::create();

for (int i = 0; i < totalFrames; i++) {
    sprintf(frameName, "gem-mouse-%d.png", i);
    mouseAnimation->addSpriteFrame(SpriteFrameCache::getInstance()->getSpriteFrameByName(frameName));
}
mouseAnimation->setDelayPerUnit(0.1);
AnimationCache::getInstance()->addAnimation(mouseAnimation, "mouseAnimation");
```

### 点击屏幕行为

关于点击屏幕的事件有`onTouchBegan`、`onTouchMove`、`onTouchEnded`三个方法，这里我们采用`onTouchBegan`。

我们要实现的行为是在点击的位置添加一个奶酪，然后老鼠移动到奶酪的位置，将奶酪吃掉。

对于老鼠，我们需要有一个移动动画的动作和一个移动到奶酪位置的动作。

```cpp
auto moveTo = MoveTo::create(2, mouseLayer->convertToNodeSpace(location));
auto mouseAnimate = Animate::create(AnimationCache::getInstance()->getAnimation("mouseAnimation"));
mouse->runAction(moveTo);
mouse->runAction(Repeat::create(mouseAnimate, 2 / mouseAnimate->getDuration()));
```

因为点击屏幕的位置是世界坐标系，而老鼠是处于`mouseLayer`，所以我们要先将世界坐标系转换成`mouseLayer`的节点坐标系。`Repeat`只能接受执行次数的参数，而不能接受执行时间，所以我们要获取`Animate`的周期时间，然后用我们需要的执行时间去除周期时间。

对于奶酪，我们需要先创建精灵，然后需要等待老鼠移动的动作、淡出的动作、销毁自我的回调。

```cpp
auto cheese = Sprite::create("cheese.png");
cheese->setPosition(location);
this->addChild(cheese);

auto delay = DelayTime::create(2);
auto fadeOut = FadeOut::create(1);
auto fn = CallFunc::create(CC_CALLBACK_0(Sprite::removeFromParent, cheese));
auto sequence = Sequence::create(delay, fadeOut, fn, nullptr);
cheese->runAction(sequence);
```

因为老鼠移动的动作是1秒，延迟动作的参数我们也设为1秒；因为奶酪被老鼠吃掉之后就没有作用了，我们可以给奶酪添加一个回调事件，从父节点中移除自身。`Sequence`动作的最后一个参数必须保证是`nullptr`，如果不是会在运行时发生异常。

`Sequence`是按顺序执行的动作序列，`Spawn`是同时执行的动作序列。

当然，这里奶酪如果出现在地面上，会略不正常，所以在点击屏幕事件最开头我们可以做一个判断。

```cpp
auto location = touch->getLocation();
if (location.y >= Director::getInstance()->getVisibleSize().height / 640 * 420) {
    return false;
}
```

### 点击按钮行为

我们要实现的行为是发射一个石头到老鼠的位置，老鼠跑开留下钻石。

首先是需要创建一个石头精灵，石头的动作有：移动到老鼠位置、淡出、销毁自身。

```cpp
auto shootStone = Sprite::create("stone.png");
shootStone->setPosition(Vec2(560, 480));
stoneLayer->addChild(shootStone);
auto location = mouseLayer->convertToWorldSpace(mouse->getPosition());
auto moveTo = MoveTo::create(0.5, stoneLayer->convertToNodeSpace(location));
auto fadeOut = FadeOut::create(1);
auto fn = CallFunc::create(CC_CALLBACK_0(Sprite::removeFromParent, shootStone));
auto sequence = Sequence::create(moveTo, fadeOut, fn, nullptr);
shootStone->runAction(sequence);
```

我们先需要获得老鼠的位置，不过这个位置是本地坐标系，所以我们要利用`mouseLayer`的`convertToWorldSpace`方法中获得其世界坐标系的坐标。在构建移动动作时，因为石头在`stoneLayer`中，我们要利用`stoneLayer`的`convertToNodeSpace`方法来获取其应该移动的本地坐标系的坐标。

对于老鼠，首先需要通过随机数函数获取其下一个位置，然后移动到该位置。老鼠的动作有：等待石头，移动。

```cpp
float x = random(0.f, Director::getInstance()->getVisibleSize().width);
float y = random(0.f, Director::getInstance()->getVisibleSize().height / 640 * 420);
auto mouseDelay = DelayTime::create(0.3);
auto mouseMoveTo = MoveTo::create(2, mouseLayer->convertToNodeSpace(Vec2(x, y)));
auto mouseAnimate = Animate::create(AnimationCache::getInstance()->getAnimation("mouseAnimation"));
auto mouseSpawn = Spawn::create(mouseMoveTo,
    Repeat::create(mouseAnimate, 2 / mouseAnimate->getDuration()), nullptr);
auto mouseSequence = Sequence::create(mouseDelay, mouseSpawn, nullptr);
mouse->runAction(mouseSequence);
```

然后创建钻石：

```cpp
auto diamond = Sprite::create("diamond.png");
diamond->setScale(0.5);
diamond->setPosition(location);
this->addChild(diamond);
```

## 附加

### 动作中断

上面的代码会有两个BUG：在多次快速点击屏幕的时候，老鼠的位置会异常；在多次快速发射石头的时候，老鼠的位置会异常。这是因为老鼠之前的动作还没有执行，就插入新的动作。

对于第一个BUG，我们可以设定为老鼠没有吃掉奶酪的时候，不能生成新的奶酪，这需要我们在点击屏幕事件一开头做判断。

```cpp
if (Director::getInstance()->getActionManager()->getNumberOfRunningActionsInTarget(mouse) != 0) {
    return false;
}
```

对于第二个BUG，我们可以在发射石头之后停止老鼠之前的所有动作。

```cpp
mouse->stopAllActions();
```

当然，这里还有第三个BUG，就是点击屏幕生成奶酪之后，迅速发射石头。这样奶酪按照现实情况应该是没有被吃掉，但是因为代码里面用的是延迟方法，奶酪最终还是会消失。

其实可以让奶酪不消失，我们可以将奶酪的动作封装在方法里面，然后将这个方法作为老鼠的回调动作。如果老鼠的动作被停止，那么这个回调动作就不会被执行，即奶酪的动作不会被执行。

### 精灵翻转

因为精灵老鼠有左右移动的动作，所有我们应该在不同的情况让老鼠面向不同的位置，而不是一直朝右。这里要用到`setRotation`等方法，对精灵进行旋转。

```cpp
if (mouseLayer->convertToWorldSpace(mouse->getPosition()).x < location.x) {
    mouse->setRotationY(0);
} else {
    mouse->setRotationY(180);
}
```

### 场景切换淡出淡入

淡出淡入需要用上`TransitionFade`类，这里利用它的`create`方法返回一个带有淡出淡入效果的场景。

```cpp
auto scene = TransitionFade::create(1, GameScene::createScene(), Color3B::BLACK);
Director::getInstance()->replaceScene(scene);
```

## 结语

就这样吧~

