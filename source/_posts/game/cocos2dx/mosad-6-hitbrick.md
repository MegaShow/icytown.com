---
title: Game | Cocos2d-x游戏开发(6) 可以玩的打砖块
date: 2018-6-17
categories: Game and Computer Graphics
tags:
- Cocos2dx
---

Cocos2d-x游戏开发系列文章是本菜秀在《现代操作系统应用开发(MOSAD)》课程上的作业笔记，旨在加深自己对Cocos2d-x的认识，所以可能会排版无比奇葩。当然，这里不仅仅局限于课程上学到的东西，菜秀尽力分享更多东西。如果学疏才浅的菜秀有啥错误，欢迎指正。

本文是本系列的第六篇文章，实现一个可以玩的打砖块。

<!-- more -->

# Cocos2d-x游戏开发(6) 可以玩的打砖块

[GitHub源码地址](https://github.com/MegaShow/college-programming/tree/master/Homework/Modern%20Operating%20System%20Application%20Development/Cocos%20-%20HitBrick)

## 迁移解决方案

参照第二篇文章。

## 物理世界初探

Cocos2d-x为我们提供一套可用的物理引擎框架，使得我们可以很方便地模拟物理世界。Cocos2d-x内部封装了Chipmunk和Box2D两个物理引擎，而我们只需要调用Cocos2d-x暴露的API接口，而不需要关心用的是什么引擎。

### 物理场景

在Cocos2d-x中使用物理引擎是基于场景实现的，我们需要指定某个场景使用物理引擎。我们通常使用下面的方式来创建使用物理引擎的场景。

```cpp
Scene* HitBrick::createScene()
{
    srand((unsigned) time(NULL));
    auto scene = Scene::createWithPhysics();
    scene->getPhysicsWorld()->setAutoStep(true);
    scene->getPhysicsWorld()->setGravity(Vec2(0, -300.0f));
    auto layer = HitBrick::create();
    scene->addChild(layer);
    return scene;
}
```

在物理场景创建之前，我们需要初始化随机种子，用于物理场景的工作。然后利用`Scene::createWithPhysics`方法创建物理场景，同时将本场景作为一个节点加入物理场景中。

这里必须要创建`HitBrick`场景，因为我们需要通过它的`create`方法来调用其`init`方法。当然，我们也可以实现一个重写方法，对`createWithPhysics`进行重写，这样就不用创建两个场景了。

添加下面的代码可以让物理场景处于`Debug`模式，可以显示出刚体的轮廓等物理信息。

```cpp
scene->getPhysicsWorld()->setDebugDrawMask(PhysicsWorld::DEBUGDRAW_ALL);
```

### 创建刚体

刚体用于存储物体的物理属性，是物理引擎的一个重要概念。我们可以给每个精灵创建一个刚体，这样每个精灵就拥有对应的物理属性了。

```cpp
auto playerBody = PhysicsBody::createBox(player->getContentSize(), PhysicsMaterial(100.0f, 1.0f, 0.0f));
playerBody->setCategoryBitmask(0x00000001);
playerBody->setCollisionBitmask(0x00000002);
playerBody->setContactTestBitmask(0x80000000);
playerBody->setDynamic(true);
player->setPhysicsBody(playerBody);
```

首先我们需要创建一个刚体，`createBox`创建一个形状为长方形的刚体，`createCircle`创建一个形状为圆形的刚体。当然，还有别的刚体形状，甚至可以实现一个更加细致的刚体形状。

`PhysicsMaterial`指定刚体的材质，其中三个参数分别为密度、弹力系数、摩擦系数。弹力系数为0时是完全非弹性碰撞，为1时是完全弹性碰撞。摩擦系数为0时是没有摩擦力。

`CategoryBitmask`、`CollisionBitmask`、`ContactTestBitmask`为刚体的掩码，第一个指明刚体的类型，第二个指明与该刚体会发生碰撞的刚体类型，第三个指明会触发碰撞检测监听器的刚体类型。

`setDynamic`方法用于指明该刚体是动态还是静态。

通过`setPhysicsBody`将该刚体与精灵绑定之后，编译运行，就可以看到该精灵有相应的物理效果了。

## 打砖块实现物理世界

### 设置精灵的物理属性

首先我们分析我们需要监听的碰撞事件：板和边界碰撞事件，用于防止静态的板飞出边界；球和砖块碰撞事件，用于消除砖块；球和船碰撞事件，用于游戏结束。所以我们可以简单设计出如下的属性表，当然这个还有别的设计方案。

|    精灵     |  类别掩码  |  碰撞掩码  | 监听器掩码 | 动态/静态 | 精灵标签 |
| :---------: | :--------: | :--------: | :--------: | :-------: | :------: |
| `bound`边界 | 0x80000000 | 0xFFFFFFFF | 0x00000001 |  Static   |    31    |
|  `ship`船   | 0xFFFFFFFF | 0x00000002 | 0x00000002 |  Static   |    32    |
| `player`板  | 0x00000001 | 0x00000002 | 0x80000000 |  Static   |    1     |
|  `ball`球   | 0x00000002 | 0xFFFFFFFF | 0xFFFFFFFF |  Dynamic  |    2     |
|  `box`砖块  | 0x00000004 | 0x00000002 | 0x00000002 |  Static   |    4     |

根据属性表生成相关的刚体，与精灵相绑定。这里所有刚体都消除重力对其的作用。

### 生成小砖块

通过循环暴力的方式生成砖块。这里需要注意的是，每个小砖块的刚体都是分别单独创建的，一个刚体只能绑定于一个精灵，否则会产生异常。

```cpp
void HitBrick::BrickGeneraetd()
{
    for (int i = 0; i < 3; i++)
    {
        int cw = 0;
        while (cw <= visibleSize.width)
        {
            auto box = Sprite::create("box.png");
            if (cw == 0)
            {
                cw = box->getContentSize().width;
            }
            auto boxBody = PhysicsBody::createBox(box->getContentSize(), PhysicsMaterial(100.0f, 1.0f, 0.0f));
            boxBody->setCategoryBitmask(0x00000004);
            boxBody->setCollisionBitmask(0x00000002);
            boxBody->setContactTestBitmask(0x00000002);
            boxBody->setGravityEnable(false);
            boxBody->setDynamic(false);
            box->setPhysicsBody(boxBody);
            box->setPosition(Vec2(cw, visibleSize.height - box->getContentSize().height * (i + 0.5)));
            box->setTag(4);
            this->addChild(box, 0);
            cw += box->getContentSize().width;
        }
    }
}
```

### 实现板的移动

这里实现板的移动我们不采用之前几次作业的方式移动精灵，而是给精灵的刚体一个初速度，使之能左右移动。

对于`onKeyPressed`和`onKeyReleased`方法，有：

```cpp
void HitBrick::onKeyPressed(EventKeyboard::KeyCode code, Event* event)
{
    switch (code)
    {
    case EventKeyboard::KeyCode::KEY_A:
    case EventKeyboard::KeyCode::KEY_CAPITAL_A:
    case EventKeyboard::KeyCode::KEY_LEFT_ARROW:
        player->getPhysicsBody()->setVelocity(Vec2(-1000.0f, 0));
        break;
    case EventKeyboard::KeyCode::KEY_D:
    case EventKeyboard::KeyCode::KEY_CAPITAL_D:
    case EventKeyboard::KeyCode::KEY_RIGHT_ARROW:
        player->getPhysicsBody()->setVelocity(Vec2(1000.0f, 0));
        break;
    case EventKeyboard::KeyCode::KEY_SPACE: // 开始蓄力
        break;
    default:
        break;
    }
}
```

```cpp
void HitBrick::onKeyReleased(EventKeyboard::KeyCode code, Event* event)
{
    switch (code)
    {
    case EventKeyboard::KeyCode::KEY_A:
    case EventKeyboard::KeyCode::KEY_D:
    case EventKeyboard::KeyCode::KEY_CAPITAL_A:
    case EventKeyboard::KeyCode::KEY_CAPITAL_D:
    case EventKeyboard::KeyCode::KEY_LEFT_ARROW:
    case EventKeyboard::KeyCode::KEY_RIGHT_ARROW:
        player->getPhysicsBody()->setVelocity(Vec2::ZERO);
        break;
    case EventKeyboard::KeyCode::KEY_SPACE:   // 蓄力结束，小球发射
        break;
    default:
        break;
    }
}
```

然后就可以实现简单的左右移动了，不过因为板子和边界都是静态刚体，他们不会发生碰撞，所以我们需要手动限制板的移动。

```cpp
if (player->getBoundingBox().getMinX() > 3)
{
    player->getPhysicsBody()->setVelocity(Vec2(-1000.0f, 0));
}
```

```cpp
if (player->getBoundingBox().getMaxX() < visibleSize.width - 3)
{
    player->getPhysicsBody()->setVelocity(Vec2(1000.0f, 0));
}
```

### 使用关节固定板和球

在球没有被发射出去的时候，球和板应该是固定移动的，这里需要用到一个叫**关节**的概念。关节就是连接两个刚体的部件，可以用来限制和约束两个刚体之间的行为影响。

Cocos2d-x提供了很多类型的关节，这里我们使用的是`PhysicsJointPin`，即别针关节。

```cpp
joint1 = PhysicsJointPin::construct(player->getPhysicsBody(), ball->getPhysicsBody(),
    Vec2(0, ball->getBoundingBox().getMidY() - ball->getBoundingBox().getMinY()
        + player->getBoundingBox().getMaxY() - player->getBoundingBox().getMidY()),
    Vec2::ZERO);
m_world->addJoint(joint1);
```

说实话，菜秀没有搞懂构造函数的参数意义何在，只能简单地认为后面两个参数是两个刚体的锚点的偏移。这里将两个刚体的锚点都偏移至球的圆心上。

### 实现球的发射

球的发射有个蓄力的过程，我们在按键事件`onKeyPressed`中，标记球处于蓄力状态。

```cpp
case EventKeyboard::KeyCode::KEY_SPACE: // 开始蓄力
    if (onBall)
    {
        spHolded = true;
    }
    break;
```

然后在调度器中，实现蓄力因子的递增。

```cpp
void HitBrick::update(float dt)
{
    if (spHolded)
    {
        if (spFactor < 100)
        {
            spFactor++;
        }
    }
    else
    {
        spFactor = 0;
    }
}
```

最后在`onKeyReleased`里面删除关节，给球一个初速度。

```cpp
case EventKeyboard::KeyCode::KEY_SPACE:   // 蓄力结束，小球发射
    if (onBall)
    {
        onBall = false;
        spHolded = false;
        m_world->removeJoint(joint1, false);
        ball->getPhysicsBody()->setVelocity(Vec2(0, (float) spFactor * 10));
        ball->getPhysicsBody()->setVelocityLimit((float) spFactor * 10);
    }
    break;
```

### 实现碰撞事件

碰撞事件依靠标签值来判定碰撞的事物到底是什么，标签值我们在一开始设置物理属性的时候就规划好了。

```cpp
bool HitBrick::onConcactBegin(PhysicsContact & contact)
{
    auto c1 = contact.getShapeA()->getBody()->getNode();
    auto c2 = contact.getShapeB()->getBody()->getNode();
    if ((c1->getTag() == 31 && c2->getTag() == 1) || (c1->getTag() == 1 && c2->getTag() == 31))
    {
        c1->getPhysicsBody()->setVelocity(Vec2::ZERO);
        c2->getPhysicsBody()->setVelocity(Vec2::ZERO);
    }
    else if (c1->getTag() == 4 || c2->getTag() == 4)
    {
        auto box = (c1->getTag() == 4 ? c1 : c2);
        box->removeFromParentAndCleanup(true);
    }
    else if (c1->getTag() == 32 || c2->getTag() == 32) 
    {
        this->GameOver();
    }
    return true;
}
```

## 打砖块使用粒子系统

粒子系统就是一种模拟特定现象效果的系统，可以用来实现各种炫酷的特性。粒子系统依赖粒子发射器来发射粒子，然后实现粒子动画。

这里的发射器分为两类：重力模式、半径模式。重力模式模拟重力，粒子具有一个指向某一点的受力，或者具有反方向的受力。半径模式使得粒子以某个半径以圆圈的形式旋转。

### 预设粒子

这里我们给球一个星系粒子效果，这是Cocos2d-x内嵌的粒子系统，只需要简单设置参数即可以使用，甚至不设置参数也可以使用。

```cpp
auto galaxy = ParticleGalaxy::create();
float r = ball->getContentSize().width / 2;
galaxy->setEmitterMode(ParticleSystem::Mode::RADIUS);
galaxy->setPosition(Vec2(r, r));
galaxy->setStartRadius(r + 100);
galaxy->setRotatePerSecond(50);
ball->addChild(galaxy);
```

### 自定义粒子

自定义粒子可以导入我们编写的`plist`文件来设置粒子参数，这里的`plist`使用了[Effect Hub](http://www.effecthub.com/particle2dx)的模板Fire Work1，然后再设置一些相关参数。

我们将这个例子用于砖块被销毁的时候。

```cpp
auto flower = ParticleSystemQuad::create("flower.plist");
flower->setPosition(box->getPosition());
flower->setDuration(0.1);
flower->setEmissionRate(100);
flower->setAutoRemoveOnFinish(true);
this->addChild(flower);
```

## 结语

日常无。

