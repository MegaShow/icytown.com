---
title: Game | Cocos2d-x游戏开发(3) 不能玩的崩坏学园
date: 2018-5-25
categories: Game
tags: Cocos2d-x
---

Cocos2d-x游戏开发系列文章是本菜秀在《现代操作系统应用开发(MOSAD)》课程上的作业笔记，旨在加深自己对Cocos2d-x的认识，所以可能会排版无比奇葩。当然，这里不仅仅局限于课程上学到的东西，菜秀尽力分享更多东西。如果学疏才浅的菜秀有啥错误，欢迎指正。

本文是本系列的第三篇文章，实现一个不能玩的崩坏学园。

<!-- more -->

# Cocos2d-x游戏开发(3) 不能玩的崩坏学园

[GitHub源码地址](https://github.com/MegaShow/college-programming/tree/9d9ba15e60bb24945c9a346c00e1e681d6eaa6c2/Homework/Modern%20Operating%20System%20Application%20Development/Cocos%20-%20TheEndOfSchool)

## 迁移解决方案

参照上一篇文章。

## 项目结构

本次实验模板提供的代码里面有四个代码文件，分别是`AppDelegate`、`HelloWorldScene`的源文件和头文件。本次实验不采用这种结构，因为菜秀想尝试一下用C++写类似RGSS这种结构的代码是否很简单，也是在为`Consola`做一下准备。

所以本次项目，使用一个叫`GameScene`的场景，场景内部有`MapLayer`、`StateLayer`两个`Layer`，前者存储地图图层，也就是背景、玩家、地图等信息，后者存储状态图层，也就是血条、按钮、计时器等信息。同时，我们声明一个`Player`单例类，负责玩家的操作和实现精灵等信息。

## State Layer

### 声明Layer

首先我们需要在`StateLayer.h`中添加类的声明。在Cocos2d-x中，`Layer`和`Scene`的区别不大，甚至很多时候可以混用，不像RGSS里面`Window`和`Scene`有明显区别。

```cpp
class StateLayer : public Layer {
public:
    static Layer* createLayer();
    virtual bool init();

    CREATE_FUNC(StateLayer);
};
```

虽然这里其实只要`CREATE_FUNC(StateLayer)`就可以创建一个对应的`create`静态方法，理论上来说我们是不需要`createLayer`的，两者实际上也就返回值有区别。不过看Cocos2d-x大多数代码都这样实现了，也就实现一下比较好吧。(或许是约定俗成，或许有别的意义，菜秀不懂~)

```cpp
Layer * StateLayer::createLayer() {
    return StateLayer::create();
}

bool StateLayer::init() {
    if (!Layer::init()) {
        return false;
    }
    return true;
}
```

实现这两个方法，一个简单的`Layer`类就实现了，接下来我们需要在`GameScene`里面使用它。

```cpp
auto stateLayer = StateLayer::createLayer();
this->addChild(stateLayer, 4);
```

### 移植HP血条

把`Layer`声明定义并使用，虽然运行没有问题，但是我们不能确保代码是能按我们想象中的执行。本小节我们将HP血条放到`StateLayer`里面实现，这样就能验证我们的代码写的是否有问题了。

HP血条的实现代码已经在原来的`GameScene`代码中，我们只需做一个简单的复制粘贴。

首先需要在`StateLayer`中声明一个私有成员进度条，因为我们后面还需要用上血条，而不是创建了显示就不用管了。

```cpp
ProgressTimer * hpBar;
```

然后在`init`方法中创建进度条，其实就是复制粘贴。

```cpp
Size visibleSize = Director::getInstance()->getVisibleSize();
Vec2 origin = Director::getInstance()->getVisibleOrigin();

//hp条
Sprite* sp0 = Sprite::create("hp.png", CC_RECT_PIXELS_TO_POINTS(Rect(0, 320, 420, 47)));
Sprite* sp = Sprite::create("hp.png", CC_RECT_PIXELS_TO_POINTS(Rect(610, 362, 4, 16)));

//使用hp条设置progressBar
hpBar = ProgressTimer::create(sp);
hpBar->setScaleX(90);
hpBar->setAnchorPoint(Vec2(0, 0));
hpBar->setType(ProgressTimerType::BAR);
hpBar->setBarChangeRate(Point(1, 0));
hpBar->setMidpoint(Point(0, 1));
hpBar->setPercentage(100);
hpBar->setPosition(Vec2(origin.x + 14 * hpBar->getContentSize().width, origin.y + visibleSize.height - 2 * hpBar->getContentSize().height));
this->addChild(hpBar, 1);
sp0->setAnchorPoint(Vec2(0, 0));
sp0->setPosition(Vec2(origin.x + hpBar->getContentSize().width, origin.y + visibleSize.height - sp0->getContentSize().height));
this->addChild(sp0, 0);
```

然后编译运行，如果血条还是正常显示，那么就表示我们代码没错。这里我们可以留意到代码中有个方法叫`setPercentage`，这个就是设置进度条(血条)的百分比的方法，自然，那肯定有个叫`getPercentage`的方法，我们可以通过这两个方法来修改血条的血量。

### 添加WASDXY按钮

按钮也是属于`StateLayer`，添加按钮的代码也很简单粗暴。首先我们要分析一下按钮的作用，WASD是用于移动的，XY是分别两个动画。那么我们可以创建三个回调方法，一个负责移动，两个负责动画。这些方法都可以是私有的，并且建议是私有的，方法的实现我们可以先留空，因为我们不知道要做什么操作。

```cpp
void PlayerMove(Ref* object, int direction);
void PlayerDead(Ref* object);
void PlayerAttack(Ref* object);
```

接下来就是暴力堆按钮了。

```cpp
auto menuLabelW = Label::createWithTTF("W", "fonts/arial.ttf", 36);
auto menuLabelA = Label::createWithTTF("A", "fonts/arial.ttf", 36);
auto menuLabelS = Label::createWithTTF("S", "fonts/arial.ttf", 36);
auto menuLabelD = Label::createWithTTF("D", "fonts/arial.ttf", 36);
auto menuLabelX = Label::createWithTTF("X", "fonts/arial.ttf", 36);
auto menuLabelY = Label::createWithTTF("Y", "fonts/arial.ttf", 36);
auto menuButtonW = MenuItemLabel::create(menuLabelW, CC_CALLBACK_1(StateLayer::PlayerMove, this, 0));
auto menuButtonA = MenuItemLabel::create(menuLabelA, CC_CALLBACK_1(StateLayer::PlayerMove, this, 2));
auto menuButtonS = MenuItemLabel::create(menuLabelS, CC_CALLBACK_1(StateLayer::PlayerMove, this, 4));
auto menuButtonD = MenuItemLabel::create(menuLabelD, CC_CALLBACK_1(StateLayer::PlayerMove, this, 6));
auto menuButtonX = MenuItemLabel::create(menuLabelX, CC_CALLBACK_1(StateLayer::PlayerDead, this));
auto menuButtonY = MenuItemLabel::create(menuLabelY, CC_CALLBACK_1(StateLayer::PlayerAttack, this));

Size buttonSize = menuButtonX->getContentSize();
menuButtonW->setPosition(Vec2(-visibleSize.width / 2 + buttonSize.width * 3,
                              -visibleSize.height / 2 + buttonSize.height * 3));
menuButtonA->setPosition(Vec2(-visibleSize.width / 2 + buttonSize.width * 1.5,
                              -visibleSize.height / 2 + buttonSize.height * 2));
menuButtonS->setPosition(Vec2(-visibleSize.width / 2 + buttonSize.width * 3,
                              -visibleSize.height / 2 + buttonSize.height * 1));
menuButtonD->setPosition(Vec2(-visibleSize.width / 2 + buttonSize.width * 4.5,
                              -visibleSize.height / 2 + buttonSize.height * 2));
menuButtonX->setPosition(Vec2(visibleSize.width / 2 - buttonSize.width * 2.5,
                              -visibleSize.height / 2 + buttonSize.height * 2));
menuButtonY->setPosition(Vec2(visibleSize.width / 2 - buttonSize.width * 1.5,
                              -visibleSize.height / 2 + buttonSize.height * 3));

auto menu = Menu::create(menuButtonW, menuButtonA, menuButtonS, menuButtonD,
                         menuButtonX, menuButtonY, nullptr);
this->addChild(menu, 1);
```

这里WASD的回调方法除了接收`Ref*`参数外，还接收一个`int`参数，用来表示移动的位置。

编译运行查BUG。

## Map Layer

### 声明Layer

`MapLayer`的声明定义跟`StateLayer`一模一样。

```cpp
class MapLayer : public Layer {
public:
    static Layer* createLayer();
    virtual bool init();

    CREATE_FUNC(MapLayer);
};
```

```cpp
Layer * MapLayer::createLayer() {
    return MapLayer::create();
}

bool MapLayer::init() {
    if (!Layer::init()) {
        return false;
    }
    return true;
}
```

接下来，在`GameScene`中使用`MapLayer`。

```cpp
auto mapLayer = MapLayer::createLayer();
this->addChild(mapLayer, 0);
```

### 移植玩家精灵

玩家`Sprite`的代码实现在`GameScene`里面也有了，我们可以复制粘贴到`MapLayer`的`init`方法中。

```cpp
//创建一张贴图
auto texture = Director::getInstance()->getTextureCache()->addImage("$lucia_2.png");
//从贴图中以像素单位切割，创建关键帧
auto frame0 = SpriteFrame::createWithTexture(texture, CC_RECT_PIXELS_TO_POINTS(Rect(0, 0, 113, 113)));
//使用第一帧创建精灵
player = Sprite::createWithSpriteFrame(frame0);
player->setPosition(Vec2(origin.x + visibleSize.width / 2,
                         origin.y + visibleSize.height / 2));
addChild(player, 3);
```

编译运行查BUG。这一步也运行成功之后，实际上已经表示我们将原模板做了一个简单的修改，接下来我们就要实现`Player`玩家类了。

## Player

### 帧动画

在实现`Player`类之前，我们需要了解一下帧动画是如何运行的。因为我们玩家需要绑定三个帧动画，可以作为创建玩家对象的参数传递。

帧动画也是一个动作，只不过是用`SpriteFrame`的数组容器创建的动作。首先我们需要将贴图添加到缓存里面。

```cpp
auto attackTexture = Director::getInstance()->getTextureCache()->addImage("$lucia_2.png");
```

然后创建一个存储`SpriteFrame`的`Vector`。

```cpp
Vector<SpriteFrame*> attackSFV;
for (int i = 0; i < 17; i++) {
    auto frame = SpriteFrame::createWithTexture(attackTexture, 
        CC_RECT_PIXELS_TO_POINTS(Rect(113 * i, 0, 113, 113)));
    attackSFV.pushBack(frame);
}
```

接下来，利用`Vector`来创建动作。

```cpp
auto attack = Animation::createWithSpriteFrames(attackSFV, 0.1f);
auto animate = Animate::create(attack);
player->runAction(animate);
```

我们可以在玩家对象创建的时候，传递三个相应的`Animation`指针，然后存储在类成员中，再在类内部封装帧动画的实现和调用。

### 声明Player

玩家类是一个单例类，即只能存在一个对象。当然，这里我们允许它实例化很多次，但是每次实例化都会先释放原有的对象。

```cpp
class Player : public Sprite {
public:
    static Player* getInstance();

    static Player* create();
    static Player* createWithSpriteFrame(SpriteFrame* spriteFrame);
    static Player* createWithAnimation(Animation* attack, Animation* dead, Animation* run);

private:
    Player(Animation* attack, Animation* dead, Animation* run);
    ~Player();

    static Player* player;
    
    Animate* attack;
    Animate* dead;
    Animate* run;
};
```

`Player`类继承于`Sprite`，因为玩家本身就是一个精灵。静态变量`player`用来存储类的唯一对象，而`getInstance`用来获取对象指针。

```cpp
Player* Player::player = nullptr;

Player* Player::getInstance() {
    return player;
}
```

跟普通的单例类不一样，我们不会在`getInstance`中实例化类。我们采用Cocos2d-x的习惯，在`create`相关静态方法中实例化。不过因为玩家类需要传递`Animation`参数，因此需要相应改一下名字。而这里的`create`和`createWithSpriteFrame`是为了覆盖`Sprite`的相应静态方法。

```cpp
Player* Player::create() {
    return nullptr;
}

Player* Player::createWithSpriteFrame(SpriteFrame* spriteFrame) {
    return nullptr;
}

Player* Player::createWithAnimation(Animation* attack, Animation* dead, Animation* run) {
    if (player) {
        CC_SAFE_DELETE(player);
    }
    player = new (std::nothrow) Player(attack, dead, run);
    if (player && attack && player->initWithSpriteFrame(attack->getFrames().front()->getSpriteFrame())) {
        return player;
    }
    CC_SAFE_DELETE(player);
    return nullptr;
}
```

在`createWithAnimation`中，我们首先判断`player`是否为`nullptr`。如果不为空，那么就首先调用`CC_SAFE_DELETE`宏释放内存。`CC_SAFE_DELETE`的定义如下：

```cpp
#define CC_SAFE_DELETE(p)           do { delete (p); (p) = nullptr; } while(0)
```

然后实例化，实例化的代码参考了`Sprite::createWithSpriteFrame`。实例化使用了`Player`带参数的构造函数，其构造函数和析构函数如下：

```cpp
Player::Player(Animation* attack, Animation* dead, Animation* run) {
    this->attack = Animate::create(attack);
    this->dead = Animate::create(dead);
    this->run = Animate::create(run);
    this->attack->retain();
    this->dead->retain();
    this->run->retain();
}

Player::~Player() {
    this->attack->release();
    this->dead->release();
    this->run->release();
}
```

`retain`方法将该内存的引用加一，`release`方法将该内存的引用减一。这里实在是不知道为什么要手动计数，虽然说这些对象都是采用`autorelease`方式，即自动添加和减少引用。

这时我们可以在`MapLayer`里面对玩家精灵的创建作修改。

```cpp
auto attackTexture = Director::getInstance()->getTextureCache()->addImage("$lucia_2.png");
auto deadTexture = Director::getInstance()->getTextureCache()->addImage("$lucia_dead.png");
auto runTexture = Director::getInstance()->getTextureCache()->addImage("$lucia_forward.png");
Vector<SpriteFrame*> attackSFV, deadSFV, runSFV;
for (int i = 0; i < 17; i++) {
    auto frame = SpriteFrame::createWithTexture(attackTexture, 
        CC_RECT_PIXELS_TO_POINTS(Rect(113 * i, 0, 113, 113)));
    attackSFV.pushBack(frame);
}
for (int i = 0; i < 22; i++) {
    auto frame = SpriteFrame::createWithTexture(deadTexture, 
        CC_RECT_PIXELS_TO_POINTS(Rect(79 * i, 0, 79, 90)));
    deadSFV.pushBack(frame);
}
for (int i = 0; i < 8; i++) {
    auto frame = SpriteFrame::createWithTexture(runTexture,
        CC_RECT_PIXELS_TO_POINTS(Rect(68 * i, 0, 68, 101)));
    runSFV.pushBack(frame);
}
auto attack = Animation::createWithSpriteFrames(attackSFV, 0.1f);
auto dead = Animation::createWithSpriteFrames(deadSFV, 0.1f);
auto run = Animation::createWithSpriteFrames(runSFV, 0.1f);
auto player = Player::createWithAnimation(attack, dead, run);
player->setPosition(Vec2(origin.x + visibleSize.width / 2,
                         origin.y + visibleSize.height / 2));
this->addChild(player, 3);
```

编译运行查BUG。

### 添加玩家动作

玩家有三个动作，因此我们需要创建三个成员方法。

```cpp
bool Move(int direction);
void Dead();
void Attack();
```

首先我们先实现简单的`Dead`和`Attack`，`Move`先留空。

```cpp
bool Player::Move(int direction) {
    return false;
}

void Player::Dead() {
    this->runAction(this->dead);
}

void Player::Attack() {
    this->runAction(this->attack);
}
```

还记得我们前面`StateLayer`的按钮的回调方法也是留空的吧，现在给它们添加具体的代码。

```cpp
void StateLayer::PlayerMove(Ref * object, int direction) {
    Player::getInstance()->Move(direction);
}

void StateLayer::PlayerDead(Ref * object) {
    Player::getInstance()->Dead();
}

void StateLayer::PlayerAttack(Ref * object) {
    Player::getInstance()->Attack();
}
```

编译运行，现在点击X和Y按钮，看一下有没有动画了。

接下来我们来实现`Move`方法，该方法是根据参数来决定怎么移动的，并且不能移动出视野。

```cpp
bool Player::Move(int direction) {
    const double scale = 30;
    Vec2 p;
    switch (direction) {
    case 0:
        p = Vec2(0, scale);
        break;
    case 2:
        p = Vec2(-scale, 0);
        break;
    case 4:
        p = Vec2(0, -scale);
        break;
    case 6:
        p = Vec2(scale, 0);
        break;
    default:
        return false;
    }
    Vec2 next = this->getPosition() + p;
    Size visibleSize = Director::getInstance()->getVisibleSize();
    if (next.x < 30 || next.y < 30 || next.x > visibleSize.width - 30
        || next.y > visibleSize.height - 30) {
        return false;
    }
    auto moveBy = MoveBy::create(0.5, p);
    auto spawn = Spawn::create(moveBy, this->run, nullptr);
    this->runAction(spawn);
    return true;
}
```

我们利用`Spawn`实现一边移动一边播放动画，移动使用的是`MoveBy`而不是`MoveTo`。

编译运行查看结果，这时候注意到玩家执行完动作之后是停留在该动作的帧动画最后一帧，我们需要实现恢复到初始精灵帧。首先编写一个方法，实现停止帧动画的执行并恢复初始精灵帧。

```cpp
void Player::ResetSpriteFrame() {
    this->stopAllActions();
    this->setSpriteFrame(attack->getAnimation()->getFrames().front()->getSpriteFrame());
}
```

但是这个方法不能直接在动作发生方法里面调用，因为一旦调用就直接结束动作了。这个方法应该用回调的方式调用，并且要在玩家执行完动作。于是，我们动作方法`Attack`可以这样写，其余两个方法同理。

```cpp
void Player::Attack() {
    auto fn = CallFunc::create(CC_CALLBACK_0(Player::ResetSpriteFrame, this));
    auto sequence = Sequence::create(this->attack, fn, nullptr);
    this->runAction(sequence);
}
```

### 禁止玩家动作同时发生

按照作业要求，玩家的三个动作是不能同时发生的，所以我们在执行动作之前，需要判断该玩家是否有动作在执行。

```cpp
if (this->getNumberOfRunningActions()) {
    return;
}
```

### HP血条

首先声明相应的成员变量存储生命值，然后在对应的X、Y动作中添加修改生命值的代码。

```cpp
double hp;

this->hp = (this->hp - 15 < 0 ? 0 : this->hp - 15);

this->hp = (this->hp + 15 > 100 ? 100 : this->hp + 15);
```

这些代码都是对于`Player`而言的，HP是玩家的一个属性。而在`StateLayer`的HP血条是不能直接被`Player`控制的，应该是`StateLayer`来获取`Player`的HP，然后对血条作修改。所以`Player`需要一个成员方法获取HP值。

```cpp
double Player::GetHP() {
    return hp;
}
```

至于`StateLayer`怎么修改血条进度，这里需要了解一个概念调度器。调度方法就是一个循环执行的方法，相当于RGSS里面的`update`，通过调度器可以将一个方法设为该类的调度方法。默认的调度器`scheduleUpdate`可以将`update`方法看成调度方法，默认调度方法一帧执行一次。这里我们不需要一帧执行一次，因此用别的调度器创建调度方法。

```cpp
this->schedule(schedule_selector(StateLayer::updateHPBar), 0.1f);
```

该方法会在每0.1秒后执行一次。

```cpp
void StateLayer::updateHPBar(float dt) {
    if (hpBar->getPercentage() < Player::getInstance()->GetHP()) {
        hpBar->setPercentage(hpBar->getPercentage() + 1);
    } else if (hpBar->getPercentage() > Player::getInstance()->GetHP()) {
        hpBar->setPercentage(hpBar->getPercentage() - 1);
    }
}
```

这样就能实现HP血条的增加和减少了。

### 计时器

计时器不属于`Player`的范畴，因为上一小节讲了调度器，而计时器也用了调度器，就在这里插入。

```cpp
time = 150;
timer = Label::createWithTTF("150", "fonts/arial.ttf", 36);
timer->setPosition(Vec2(visibleSize.width / 2, visibleSize.height - 80));
this->addChild(timer, 0);

this->schedule(schedule_selector(StateLayer::updateTimer), 1);
```

代码很简单，`timer`和`time`是`StateLayer`的成员变量。

```cpp
void StateLayer::updateTimer(float dt) {
    if (time) {
        time--;
        std::ostringstream ss;
        ss << time;
        timer->setString(ss.str());
    }
}
```

## 结语

事实证明，还是有点蛋疼，怪不得搜索说Cocos2d-x不推荐继承`Sprite`。感觉很大程度都是C++在拖后腿，导致这种写法写的很变扭(Yu说够别扭)。溜了~

