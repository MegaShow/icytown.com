---
title: Langs | Mongo for .NET Core
date: 2017-9-3
categories: Languages Explore
tags:
- DotNET
- CSharp
- MongoDB
---

在暑假正式来临之前，我们就打算把服务器数据库全部从MySQL迁移到MongoDB。自然，之前C#写的涉及数据库操作的代码要全盘修改。由于本菜秀的懒惰，一直拖到暑假结束都没有完成迁移，然而暑假一开始学的Mongo for C#又几乎忘光了，于是写篇博客来记录一下常用的操作。

<!-- more -->

## Mongo连接

### Nuget包管理MongoDB

在连接之前必须先要了解一下MongoDB的简单命令操作，并且已经创建好用户、数据库,这些就抛出Zhenly的教程吧([戳这里](https://blog.zhenly.cn/2017/07/21/linux-mongodb/))。

首先创建一个.NET Core控制台程序：

```shell
[PS test]# dotnet new console
```

然后往项目配置文件`test.csproj`中添加MongoDB库的信息：

```xml
<ItemGroup>
  <PackageReference Include="MongoDB.Driver" Version="2.4.4"/>
</ItemGroup>
```

或者可以通过包管理工具来添加MongoDB库：

```shell
[PS test]# dotnet add package MongoDB.Driver --version 2.4.4
```

### MongoDB连接服务器

首先，代码需要先引用下述命名空间：

```csharp
using System;
using System.Linq;  // 用于Enumerable类
using MongoDB.Driver;
using MongoDB.Bson;
```

通过下述代码可以连接到MongoDB的Collection(相当于MySQL的table)。

```csharp
var client = new MongoClient("mongodb://username:password@localhost:27017/database");
var db = client.GetDatabase("database");
var collection = db.GetCollection<BsonDocument>("collection");
```

## Mongo操作

### 添加数据

添加一条简单的数据：

```csharp
var document = new BsonDocument {
    { "name", "MegaShow" },
    { "website", "icytown.com" },
    { "tags", new BsonArray { 1, "web", "ruby", 2.0 } }
};
collection.InsertOne(document);
```

添加多条数据：

```csharp
var documents = Enumerable.Range(0, 47).Select(i => new BsonDocument("counter", i));
collection.InsertMany(documents);
```

### 查询数据

查询集合里的数据数量：

```csharp
var count = collection.Count(new BsonDocument());
Console.WriteLine("Count is " + count);
```

```csharp
var list = collection.Find(new BsonDocument()).ToList();
Console.WriteLine("Find is " + list.Count);
```

条件查询：

```csharp
var filter = Builders<BsonDocument>.Filter.Eq("counter", 37);
var document = collection.Find(filter).First();
Console.WriteLine(document);
```

条件函数有`Eq`、`Gt`、`Lt`、`Gte`、`Lte`，对应equal to、greater than、less than、 greater than or equal to、 less than or equal to。

条件之间可以用`&`、`|`来组合：

```csharp
var filterBuilder = Builders<BsonDocument>.Filter;
var filter_a = filterBuilder.Gt("counter", 10) & filterBuilder.Lte("counter", 20);
var filter_b = filterBuilder.Gt("counter", 42) | filterBuilder.Lte("counter", 20);
var cursor = collection.Find(filter_a).ToCursor();
foreach (var document in cursor.ToEnumerable()) {
    Console.WriteLine(document);   
}
cursor = collection.Find(filter_b).ToCursor();
foreach (var document in cursor.ToEnumerable()) {
    Console.WriteLine(document);   
}    
```

### 修改数据

```csharp
var filter = Builders<BsonDocument>.Filter.Eq("counter", 0);
var update = Builders<BsonDocument>.Update.Set("counter", 110);   
collection.UpdateOne(filter, update);  
```

其实除了修改已存在属性，还可以通过这种方法添加属性。

```csharp
var update = Builders<BsonDocument>.Update.Set("i", "what?");
```

可以通过下列的方式来判断是否修改成功：

```csharp
var result = collection.UpdateOne(filter, update);
if (result.IsModifiedCountAvailable) {
    Console.WriteLine(result.ModifiedCount);
} 
```

当修改数据前后是一模一样的情况下，mongo不做修改。

### 删除数据

```csharp
var filter = Builders<BsonDocument>.Filter.Eq("i", "what?");
collection.DeleteOne(filter);
```

或者可以这样删除多条数据。

```csharp
var filter = Builders<BsonDocument>.Filter.Gte("counter", 2);
var result = collection.DeleteMany(filter);
Console.WriteLine(result.DeletedCount);
```

## 后续

暂时先了解这么多吧，好像MongoDB还支持写function用来维护数据库逻辑，以后有空去学习一波。加油！菜鸡秀！

