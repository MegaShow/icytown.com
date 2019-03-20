---
title: Game | Cocos2d-x游戏开发(7) 网络请求
date: 2018-6-23
categories: Game and Computer Graphics
tags:
- Cocos2dx
---

Cocos2d-x游戏开发系列文章是本菜秀在《现代操作系统应用开发(MOSAD)》课程上的作业笔记，旨在加深自己对Cocos2d-x的认识，所以可能会排版无比奇葩。当然，这里不仅仅局限于课程上学到的东西，菜秀尽力分享更多东西。如果学疏才浅的菜秀有啥错误，欢迎指正。

本文是本系列的第七篇文章，主要来学习网络请求和JSON解析。

<!-- more -->

# Cocos2d-x游戏开发(7) 网络请求

[GitHub源码地址](https://github.com/MegaShow/college-programming/tree/master/Homework/Modern%20Operating%20System%20Application%20Development/Cocos%20-%20Network)

## 迁移解决方案

参照第二篇文章。

## 网络请求初探

Cocos2d-x提供了`HttpClient`和`HttpRequest`类用于HTTP网络请求服务，不过所提供的都是异步执行的请求方法。

`HttpClient`内部采用`curl`的easy接口来实现，这是一个HTTP同步请求函数库，但是由于Cocos2d-x内部的实现，使得其变成了异步执行。`HttpClient`有两种请求的方法，一种是将请求放入一个请求队列中，等待队列的请求执行；另一种是不经过队列，直接发起请求。`HttpClient::send`方法所执行的请求是将请求放入队列中。

无论是哪一种请求方法，最终都是异步执行的，无法阻塞线程。如果需要使用同步请求，那只能自己手动封装`curl`的easy接口。其实，`curl`本身也提供了一套异步请求的接口，叫`multi`接口。

我们现在先写一个简单的GET请求，来请求一个网页，比如`icytown.com`。

```cpp
auto req = new HttpRequest();
req->setRequestType(HttpRequest::Type::GET);
req->setUrl("https://icytown.com");
req->setResponseCallback(callback);
HttpClient::getInstance()->send(req);
req->release();
```

`callback`函数的类型是`ccHttpRequestCallback`，可以通过`CC_CALLBACK_2`来绑定相应的对象的方法。其Lambda表达式形式如下：

```cpp
auto callback = [](HttpClient* sender, HttpResponse* res) -> void
{
    if (!res || !res->isSucceed())
    {
        return;
    }
    // code
};
```

我们可以通过`res->getResponseData()`来获取`vector<char>*`类型的请求回复体的数据，这里即为我们网站的内容。

```cpp
auto v = res->getResponseData();
string str(v->begin(), v->end());
cout << str << endl;
```

## 注册登录

首先，我们先实现注册登录功能，这两个均是用到POST请求。POST请求和GET请求的区别是需要设置不同的请求类型，同时POST需要设置请求数据。这里我们考虑对请求进行封装，将请求封装在`Net`类中，然后将API实现在`APIService`里面，最后我们再调用`APIService`的方法。

因为登录功能需要使用Cookie，我们应该设置`HttpClient`允许使用Cookie，这个设置只需要执行一次，所以只要在构造函数里面实现。`enableCookies`接受一个字符指针类型，指明Cookie存储的文件名，也可以为`nullptr`，但是这里我遇到了一个问题，如果为空，在第一次访问Cookie的时候不知道给服务端发送了什么数据，导致服务端异常并返回了500错误，所以这里随便写一个文件名。(**实际上是我太菜了，这个问题不是Cookie文件导致的，而是给服务端发送了失效的Cookie，因为看不懂Python无法判断服务端如何认证。**)

```cpp
Net::Net()
{
    HttpClient::getInstance()->enableCookies("cookies.co");
}
```

我们需要封装POST请求，对于请求数据，我们这里采用JSON类型。这里使用了Cocos2d-x内置的RapidJson，所以参数类型为`Document`。

```cpp
void Net::Post(const string& url, const Document& query, const ccHttpRequestCallback& callback)
{
    StringBuffer buf;
    Writer<StringBuffer> writer(buf);
    query.Accept(writer);

    auto req = new HttpRequest();
    req->setRequestType(HttpRequest::Type::POST);
    req->setUrl(url);
    req->setRequestData(buf.GetString(), buf.GetSize());
    req->setResponseCallback(callback);
    HttpClient::getInstance()->send(req);
    req->release();
}
```

`Document`是RapidJson的DOM树的数据类型，其每一个节点都可以用`Value`来表示。我们需要利用`StringBuffer`和`Writer`来将一个`Document`或`Value`转换成字符串buffer，并通过`StringBuffer::GetString()`方法来获取字符串数据。

接下来我们需要实现`APIService`中相关的API请求方法。

```cpp
void APIService::Register(const string & username, const string & password,
                          const ccHttpRequestCallback & callback)
{
    Document d;
    Value su, pu;
    d.SetObject();
    su.SetString(username.c_str(), d.GetAllocator());
    pu.SetString(password.c_str(), d.GetAllocator());
    d.AddMember("username", su, d.GetAllocator());
    d.AddMember("password", pu, d.GetAllocator());
    Singleton<Net>::getInstance()->Post(baseUrl + "/users", d, callback);
}
```

```cpp
void APIService::Login(const string & username, const string & password,
                       const ccHttpRequestCallback & callback)
{
    Document d;
    Value su, pu;
    d.SetObject();
    su.SetString(username.c_str(), d.GetAllocator());
    pu.SetString(password.c_str(), d.GetAllocator());
    d.AddMember("username", su, d.GetAllocator());
    d.AddMember("password", pu, d.GetAllocator());
    Singleton<Net>::getInstance()->Post(baseUrl + "/auth", d, callback);
}
```

这里的`baseUrl`定义为`127.0.0.1:8000`。

对于Register需要我们传递一个带有用户名和密码的Json数据。

```json
{
    "username": string,
    "password": string
}
```

我们首先创建`Document`，并且将其设为Object，同时创建两个`Value`，将其加入`Document`中。

```cpp
Document d;
Value su, pu;
d.SetObject();
su.SetString(username.c_str(), d.GetAllocator());
pu.SetString(password.c_str(), d.GetAllocator());
d.AddMember("username", su, d.GetAllocator());
d.AddMember("password", pu, d.GetAllocator());
```

这里可以看到用了一个模板类叫`Singleton`，这是一个单例模板，用于创建各种单例实例。其实我们可以发现`Net`类是有构造函数的，那么意味着它不能实现成一个静态类，那么就必须选择单例模式了。

```cpp
template <class T>
class Singleton final
{
public:
    static T* getInstance()
    {
        static T instance;
        return &instance;
    }

private:
    Singleton() {}
};
```

这种实现单例模式的方法在C++14之后是属于线程安全的。

接下来我们就可以使用这些API方法了，比如注册功能。

```cpp
APIService::Login(usernameInput->getString(), passwordInput->getString(),
    [&](HttpClient* sender, HttpResponse* res) -> void
{
    if (!res || !res->isSucceed())
    {
        return;
    }
    Document d = APIService::GetDocument(res);
    if (d["status"].GetBool() == false)
    {
        messageBox->setString(string("Login Failed\n") + d["msg"].GetString());
    }
    else
    {
        messageBox->setString("Login OK\n");
    }
});
```

`APIService::GetDocument(HttpResponse*)`是封装好的获取返回信息的一个方法。

```cpp
Document APIService::GetDocument(HttpResponse * res)
{
    auto v = res->getResponseData();
    string json(v->begin(), v->end());
    Document d;
    d.Parse(json.c_str());
    if (d.HasParseError())
    {
        throw d.GetParseError();
    }
    return d;
}
```

虽然这里抛出了异常，但是可以发现在调用该方法的时候，我们并没捕获异常。其实只是因为菜秀懒得写。

## 获取用户信息

获取用户信息采用GET请求，GET请求的封装非常简单，甚至不需要做什么处理。

```cpp
void Net::Get(const string& url, const ccHttpRequestCallback& callback)
{
    auto req = new HttpRequest();
    req->setRequestType(HttpRequest::Type::GET);
    req->setUrl(url);
    req->setResponseCallback(callback);
    HttpClient::getInstance()->send(req);
    req->release();
}
```

封装也很简单，只需要修改一下请求URL。

```cpp
void APIService::GetUsersInfo(const string& limit, const ccHttpRequestCallback & callback)
{
    Singleton<Net>::getInstance()->Get(baseUrl + "/users" + "?limit=" + limit, callback);
}
```

唯一比较麻烦的是回调里面对数据的处理，我们需要对返回的数据做一个简单处理。

```cpp
APIService::GetUsersInfo(limitInput->getString(), [&](HttpClient* sender, HttpResponse* res) -> void
{
    if (!res || !res->isSucceed())
    {
        return;
    }
    Document d = APIService::GetDocument(res);
    if (d["status"].GetBool() == false)
    {
        messageBox->setString(string("Get Users Failed\n") + d["msg"].GetString());
    }
    else
    {
        string msg;
        for (auto& data : d["data"].GetArray())
        {
            msg.append(string("Username: ") + data["username"].GetString() + "\nDeck:\n");
            for (auto& deck : data["deck"].GetArray())
            {
                for (auto it = deck.MemberBegin(); it != deck.MemberEnd(); it++)
                {
                    msg.append(string("  ") + it->name.GetString() + ": " + to_string(it->value.GetInt()) + "\n");
                }
                msg.append("  ---\n");
            }
            msg.append("---\n");
        }
        messageBox->setString(msg);
    }
});
```

`Document`类对`[]`操作符进行了重载，因此我们可以利用其来获取子节点。我们返回的数据结构是这样的：

```cpp
{
    "status": boolean,
    "msg": string,
    "data":  [
        {
            "username": string,
            "deck": [
                {
                    string: integer,
                    string: integer,
                    ...
                }
            ]
        }
    ]
}
```

对于RapidJson，我们可以用C++的foreach语句来遍历Array，可以用迭代器来遍历Object，于是就有了上面的代码。

## 修改用户卡组

修改用户卡组用上PUT请求，该请求的封装和POST几乎一模一样。

对于传递进来的数据，只是一个简单的deck数组，我们还需要创建一个Object，将数组作为一个子节点添加进Object里面。

```cpp
void APIService::UpdateDeck(const string & deck, const ccHttpRequestCallback & callback)
{
    Document d;
    Document arr(kArrayType);
    arr.Parse(deck.c_str());
    d.SetObject();
    d.AddMember("deck", arr, d.GetAllocator());
    if (d.HasParseError())
    {
        throw d.GetParseError();
    }
    Singleton<Net>::getInstance()->Put(baseUrl + "/users", d, callback);
}
```

调用API：

```cpp
APIService::UpdateDeck(deckInput->getString(), [&](HttpClient* sender, HttpResponse* res) -> void
{
    if (!res || !res->isSucceed())
    {
        return;
    }
    Document d = APIService::GetDocument(res);
    if (d["status"].GetBool() == false)
    {
        messageBox->setString(string("PUT Failed\n") + d["msg"].GetString());
    }
    else
    {
        messageBox->setString("PUT OK\n");
    }
});
```

## 结语

其实本人对异步请求不是很感冒，所以如果在Cocos2d-x上使用Http请求，我个人还是比较倾向于使用curl封装一个同步请求。不过实现起来可能就有点蛋疼了，因为要预处理判断目标平台。不过，值得庆幸的是，curl本身就支持跨平台，这大概也可能是Cocos2d-x内部使用的就是curl的原因吧。

