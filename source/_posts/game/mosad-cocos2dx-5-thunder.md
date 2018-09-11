---
title: Game | Cocos2d-x游戏开发(5) 可以玩的雷电
date: 2018-6-16
categories: Game
tags: Cocos2d-x
---

Cocos2d-x游戏开发系列文章是本菜秀在《现代操作系统应用开发(MOSAD)》课程上的作业笔记，旨在加深自己对Cocos2d-x的认识，所以可能会排版无比奇葩。当然，这里不仅仅局限于课程上学到的东西，菜秀尽力分享更多东西。如果学疏才浅的菜秀有啥错误，欢迎指正。

本文是本系列的第五篇文章，实现一个可以玩的雷电。

<!-- more -->

# Cocos2d-x游戏开发(5) 可以玩的雷电

[GitHub源码地址](https://github.com/MegaShow/college-programming/tree/master/Homework/Modern%20Operating%20System%20Application%20Development/Cocos%20-%20Thunder)

## 迁移解决方案

参照第二篇文章。

## 飞船移动、子弹发射(键盘、触摸事件)

本节的任务是，使用键盘、触摸事件实现飞船的移动和子弹的发射。这里需要用上一个叫“事件分发”的概念，即将相应的事件绑定到某节点上，作为订阅者的存在。当监听器监听到相应事件触发时，会将事件分发至订阅者手上，从而执行相应的方法。

### 事件监听

首先，我们需要监听键盘和触摸事件。

```cpp
void Thunder::addKeyboardListener()
{
    auto listener = EventListenerKeyboard::create();
    listener->onKeyPressed = CC_CALLBACK_2(Thunder::onKeyPressed, this);
    listener->onKeyReleased = CC_CALLBACK_2(Thunder::onKeyReleased, this);
    _eventDispatcher->addEventListenerWithSceneGraphPriority(listener, player);
}

void Thunder::addTouchListener()
{
    auto listener = EventListenerTouchOneByOne::create();
    listener->onTouchBegan = CC_CALLBACK_2(Thunder::onTouchBegan, this);
    listener->onTouchEnded = CC_CALLBACK_2(Thunder::onTouchEnded, this);
    listener->onTouchMoved = CC_CALLBACK_2(Thunder::onTouchMoved, this);
    _eventDispatcher->addEventListenerWithSceneGraphPriority(listener, this);
}
```

这里使用一个叫`_eventDispatcher`的分发器来添加监听，这是一个`EventDispatcher`单例对象，我们也可以通过下列代码来获取其实例并添加监听。

```cpp
auto dispatcher = Director::getInstance()->getEventDispatcher();
dispatcher->addEventListenerWithSceneGraphPriority(listener, this);
```

当然，我们也可以这样来添加监听。

```cpp
this->getEventDispatcher()->addEventListenerWithSceneGraphPriority(listener, this);
```

### 事件实现

给定模板已经实现了上面绑定的`onKeyPressed`和`onKeyReleased`，我们可以观察到，这两个方法主要对`moveKey`和`isMove`成员变量做了修改。因此对于飞船的移动，我们应该实现在调度器中。

```cpp
void Thunder::onKeyPressed(EventKeyboard::KeyCode code, Event* event)
{
    switch (code)
    {
    case EventKeyboard::KeyCode::KEY_LEFT_ARROW:
    case EventKeyboard::KeyCode::KEY_CAPITAL_A:
    case EventKeyboard::KeyCode::KEY_A:
        movekey = 'A';
        isMove = true;
        break;
    case EventKeyboard::KeyCode::KEY_RIGHT_ARROW:
    case EventKeyboard::KeyCode::KEY_CAPITAL_D:
    case EventKeyboard::KeyCode::KEY_D:
        movekey = 'D';
        isMove = true;
        break;
    case EventKeyboard::KeyCode::KEY_SPACE:
        fire();
        break;
    }
}
```

```cpp
void Thunder::onKeyReleased(EventKeyboard::KeyCode code, Event* event)
{
    switch (code)
    {
    case EventKeyboard::KeyCode::KEY_LEFT_ARROW:
    case EventKeyboard::KeyCode::KEY_A:
    case EventKeyboard::KeyCode::KEY_CAPITAL_A:
    case EventKeyboard::KeyCode::KEY_RIGHT_ARROW:
    case EventKeyboard::KeyCode::KEY_D:
    case EventKeyboard::KeyCode::KEY_CAPITAL_D:
        isMove = false;
        break;
    }
}
```

在默认调度器中，有如下的代码。

```cpp
if (isMove)
    this->movePlane(movekey);
```

因此，我们只需要在`movePlane`方法里面实现对飞船的移动。

```cpp
void Thunder::movePlane(char c)
{
    const float scale = 15;
    Vec2 pos(0, 0);
    switch (c)
    {
    case 'A':
        pos.x -= scale;
        break;
    case 'D':
        pos.x += scale;
        break;
    default:
        return;
    }
    auto moveBy = MoveBy::create(0.1f, pos);
    player->runAction(moveBy);
}

```

上述的代码是没有对飞船做地图边界判断的，因此飞船可以移动到窗口之外，下面我们对飞船移动执行一个简单的判断操作。

```cpp
const float scale = 15;
Vec2 pos(0, 0);
auto boundingBox = player->getBoundingBox();
switch (c)
{
case 'A':
    pos.x -= (boundingBox.getMinX() < scale ? boundingBox.getMinX() : scale);
    break;
case 'D':
    pos.x += (boundingBox.getMaxX() > visibleSize.width - scale ? visibleSize.width - scale - boundingBox.getMaxX() : scale);
    break;
default:
    return;
}
auto moveBy = MoveBy::create(0.1f, pos);
player->runAction(moveBy);
```

代码看起来是没有问题，如果接近了边界，就不再移动`scale`个像素，而是根据飞船和边界的距离来移动。但是实际上因为按住A时，一直触发`movePlane`事件，从而导致飞船一直在执行移动动作。在边际判断时，飞船可能还存在好几个动作没有执行完，然后就移动到窗口之外了。因为这时候`boundingBox.getMinX()`的结果为负，从而导致飞船又向右移动，回到窗体内。然后又继续往左移动，一直循环反弹。如果按A的频率减低，最终的确是能移动到窗口最左边，并停止下来不能继续向左移动。

所以我们需要对上述代码进行修改，如果接近边界采用不同的动作执行方式。

```cpp
switch (c)
{
case 'A':
    if (boundingBox.getMinX() < scale)
    {
        auto moveTo = MoveTo::create(0.05f, Vec2(boundingBox.getMidX() - boundingBox.getMinX(), player->getPositionY()));
        player->stopAllActions();
        player->runAction(moveTo);
        return;
    }
    pos.x -= scale;
    break;
case 'D':
    if (boundingBox.getMaxX() > visibleSize.width - scale)
    {
        auto moveTo = MoveTo::create(0.05f, Vec2(visibleSize.width - (boundingBox.getMaxX() - boundingBox.getMidX()), player->getPositionY()));
        player->stopAllActions();
        player->runAction(moveTo);
        return;
    }
    pos.x += scale;
    break;
default:
    return;
}
```

接下来，我们需要实现用鼠标可以拖动飞船移动。在`onTouchBegan`和`onTouchEnded`中对`isClick`成员变量进行了修改，我们利用这个变量判断是否处于拖动飞船的状态。因为之前我们监听绑定的是整个场景，而不是飞船。在`onTouchMoved`方法中，我们使用类似上述的方法来移动飞船。

```cpp
void Thunder::onTouchMoved(Touch *touch, Event *event)
{
    if (isClick)
    {
        Vec2 pos(touch->getDelta().x, 0);
        auto boundingBox = player->getBoundingBox();
        if (player->getPosition().x + pos.x < boundingBox.getMidX() - boundingBox.getMinX())
        {
            auto moveTo = MoveTo::create(0.05f, Vec2(boundingBox.getMidX() - boundingBox.getMinX(), player->getPositionY()));
            player->stopAllActions();
            player->runAction(moveTo);
            return;
        }
        else if (player->getPosition().x + pos.x > visibleSize.width - (boundingBox.getMaxX() - boundingBox.getMidX()))
        {
            auto moveTo = MoveTo::create(0.05f, Vec2(visibleSize.width - (boundingBox.getMaxX() - boundingBox.getMidX()), player->getPositionY()));
            player->stopAllActions();
            player->runAction(moveTo);
            return;
        }
        auto moveBy = MoveBy::create(0.1f, pos);
        player->runAction(moveBy);
    }
}
```

不过这里有个问题就是，移动到边界的时候会异常抖动。菜秀也不知道怎么解决，所以这个BUG就没有修复。如果有什么好方法解决，不如邮给菜秀~

模板里面提供了一个叫`fire`的方法，用于开火事件。我们可以发现`onKeyPressed`事件中已经调用了该方法，而我们要实现触摸发射炮弹，需要在`onTouchBegan`中也添加相应调用。

```cpp
bool Thunder::onTouchBegan(Touch *touch, Event *event)
{
    if (touch->getLocation().getDistance(player->getPosition()) <= 30)
    {
        isClick = true;
    }
    else
    {
        fire();
    }
    return true;
}
```

编译运行，可以发现能正常发射子弹了。但是子弹是静止不动的，我们需要在`fire`里面给子弹添加动作。其中，需要实现移动动作和移除飞出屏幕外的子弹。

```cpp
auto moveBy = MoveBy::create(1.0f, Vec2(0, visibleSize.height - bullet->getBoundingBox().getMinY()));
auto fn = CallFunc::create([bullet, this]()
{
    for (auto it = bullets.begin(); it != bullets.end(); it++)
    {
        if (*it == bullet)
        {
            bullets.erase(it);
            break;
        }
    }
    bullet->removeFromParentAndCleanup(true);
});
auto sequence = Sequence::create(moveBy, fn, nullptr);
bullet->runAction(sequence);
```

## 陨石爆炸、子弹消失(自定义事件)

子弹碰到陨石的时候，子弹会消失、陨石会爆炸，接下来我们实现这个效果。

### 事件监听

可以观察到调度器里，每一次调度都会手动触发一个叫`meet`的自定义事件。

```cpp
EventCustom e("meet");
_eventDispatcher->dispatchEvent(&e);
```

因此我们需要在游戏开始的时候监听事件，该事件的触发会调用`meet`方法。

```cpp
void Thunder::addCustomListener()
{
    auto listener = EventListenerCustom::create("meet", CC_CALLBACK_1(Thunder::meet, this));
    _eventDispatcher->addEventListenerWithSceneGraphPriority(listener, this);
}
```

### 事件实现

首先我们需要将陨石爆炸的动画加载进来，我们需要分割图片，实现帧动画。

```cpp
auto texture = Director::getInstance()->getTextureCache()->addImage("explosion.png");
for (int i = 0; i < 5; i++)
{
    auto frame = SpriteFrame::createWithTexture(texture, CC_RECT_PIXELS_TO_POINTS(Rect(4 + 188 * i, 0, 188, 188)));
    explore.pushBack(frame);
}
for (int i = 0; i < 3; i++)
{
    auto frame = SpriteFrame::createWithTexture(texture, CC_RECT_PIXELS_TO_POINTS(Rect(4 + 188 * i, 188, 188, 188)));
    explore.pushBack(frame);
}
```

在碰撞事件判定中，我们采用遍历的方式，对子弹和陨石嵌套遍历。然后通过计算其两者的距离来判断是否发生碰撞，再执行相应的动作。

```cpp
void Thunder::meet(EventCustom * event)
{
    auto bulletIt = bullets.begin();
    while (bulletIt != bullets.end())
    {
        auto enemyIt = enemys.begin();
        bool destroy = false;
        while (enemyIt != enemys.end())
        {
            if ((*bulletIt)->getPosition().getDistance((*enemyIt)->getPosition()) < 25)
            {
                log("hello");
                auto animate = Animate::create(Animation::createWithSpriteFrames(explore, 0.05f, 1));
                auto fn = CallFunc::create(CC_CALLBACK_0(Sprite::removeFromParentAndCleanup, *enemyIt, true));
                auto sequence = Sequence::create(animate, fn, nullptr);
                (*enemyIt)->runAction(sequence);
                enemys.erase(enemyIt);
                bulletIt = bullets.erase(bulletIt);
                (*bulletIt)->removeFromParentAndCleanup(true);
                destroy = true;
                break;
            }
            else
            {
                enemyIt++;
            }
        }
        if (destroy == false)
        {
            bulletIt++;
        }
    }
}
```

## 陨石下移和游戏结束

调度器里面调用了方法`newEnemy`，我们需要在其中实现陨石下移，并且新增一行陨石的效果。如果游戏结束，我们需要调用`stopAc`方法移除所有监听器和调度器。

首先我们在`newEnemy`方法中对现有的陨石往下移动50像素点，然后再新增一行陨石。

```cpp
void Thunder::newEnemy()
{
    for (auto enemy : enemys)
    {
        Vec2 pos = enemy->getPosition();
        pos.y -= 50;
        enemy->setPosition(pos);
    }
    char enemyPath[20];
    sprintf(enemyPath, "stone%d.png", stoneType + 1);
    double width = visibleSize.width / (5 + 1.0),
        height = visibleSize.height - 50;
    for (unsigned i = 0; i < 5; i++)
    {
        auto enemy = Sprite::create(enemyPath);
        enemy->setAnchorPoint(Vec2(0.5, 0.5));
        enemy->setScale(0.5, 0.5);
        enemy->setPosition(width * (i + 0.5), height);
        enemys.push_back(enemy);
        addChild(enemy, 1);
    }
    stoneType++;
    if (stoneType == 3)
    {
        stoneType = 0;
    }
}
```

这里我们将游戏结束的判断放在`newEnemy`里面，因为飞船不能上下移动，而陨石的上下移动只在该方法中。

```cpp
bool gameOver = false;
for (auto enemy : enemys)
{
    Vec2 pos = enemy->getPosition();
    pos.y -= 50;
    enemy->setPosition(pos);
    if (enemy->getBoundingBox().getMinY() < player->getBoundingBox().getMaxY())
    {
        gameOver = true;
    }
}
// more code
if (gameOver)
{
    stopAc();
}
```

在`stopAc`方法中，我们需要移除调度器和监听器，同时播放飞船销毁动画。

```cpp
void Thunder::stopAc()
{
    auto animate = Animate::create(Animation::createWithSpriteFrames(explore, 0.05f, 1));
    auto fn = CallFunc::create([this]() 
    {
        player->removeFromParentAndCleanup(true);
        auto gameOver = Sprite::create("gameOver.png");
        gameOver->setPosition(Vec2(visibleSize.width / 2, visibleSize.height / 2));
        this->addChild(gameOver);
    });
    auto sequence = Sequence::create(animate, fn, nullptr);
    player->runAction(sequence);
    Director::getInstance()->getActionManager()->removeAllActions();
    _eventDispatcher->removeAllEventListeners();
    this->unscheduleAllCallbacks();
}
```

这里需要注意的是，如果移除了调度器，那么子弹数和陨石数就没有办法更新了。所以如果在死亡的时候窗口内还有子弹，那么子弹离开窗口之后，子弹数就是一个错误的值了。

## 音效实现

我们需要利用`SimpleAudioEngine`来负责音效的预加载和播放功能。因为音效文件可能会很大，如果等到播放的时候再加载会产生卡顿的效果，所以我们要在游戏开始的时候预加载音效。

```cpp
void Thunder::preloadMusic()
{
    auto audio = SimpleAudioEngine::getInstance();
    audio->preloadBackgroundMusic("music/bgm.mp3");
    audio->preloadEffect("music/explore.wav");
    audio->preloadEffect("music/fire.wav");
}
```

这里的`preloadBackgroundMusic`实际上什么都没有做，如果你跳转到该方法的内部实现，会发现该方法是空的。这很神奇，大概是因为背景音乐跟特效音乐的定位不一样吧。

播放背景音乐：

```cpp
void Thunder::playBgm()
{
    auto audio = SimpleAudioEngine::getInstance();
    audio->playBackgroundMusic("music/bgm.mp3", true);
}
```

播放音效：

```cpp
SimpleAudioEngine::getInstance()->playEffect("music/explore.wav");
```

## EXE解压打包

这里采用了Bandizip来压缩生成EXE，很简单，只需要将压缩格式改为EXE，并增加一个自解压后执行程序的相对路径，即可实现EXE解压打包。

我们需要压缩的是`Debug.win32`里面的资源文件和`exe`以及`dll`文件，其他文件均可以删除，都是调试使用的文件。

## 结语

没有结语，速速结束。

