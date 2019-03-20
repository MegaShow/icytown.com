---
title: Langs | C++、Java、C#中的Map
date: 2017-11-1
categories: Languages Explore
tags:
- CSharp
- Java
- Cpp
---

呃，先说写题外话，这篇文章涉及了C++、Java、C#，但是本菜秀分类于`.NET Core`，是因为写这篇文章的初衷是为了学习C#的Map，只不过因为某些原因顺便提一下C++和Java。(为了这玩意我又把WSL装回来，顺便~Google真的好用)

<!-- more -->

## 什么是Map

什么是Map？Map就是数学中的映射，可以说是Injection Function(单射)。查了一下维基百科，在计算机科学里面，有三种叫法：关联数组(Associative Array)、映射(Map)、字典(Dictionary)。Map可以说是一种数据结构吧，可以储存(key, value)这样的键值对。

在维基百科里面，描述了这种数据结构常见的几种操作：

* 向关联数组添加配对
* 从关联数组内删除配对
* 修改关联数组内的配对
* 根据已知的键寻找配对

本文呢，本菜秀也主要是围绕这四点进行描述。

---

## C++中的Map

C++的STL提供了8个关联数组容器模板，如下：

|              类模板              |                说明                 |
| :---------------------------: | :-------------------------------: |
|        std::map<K, V>         |            从K到V的一对一字典             |
|   std::unordered_map<K, V>    | 不带unordered_前缀为根据K排序的红黑树，带前缀的为散列表 |
|      std::multimap<K, V>      |            从K到V的一对多字典             |
| std::unordered_multimap<K, V> |                 *                 |
|          std::set<T>          |               T的集合                |
|     std::unordered_set<T>     |                 *                 |
|       std::multiset<T>        |               T的多重集               |
|  std::unordered_multiset<T>   |                 *                 |

### std::map

std::map定义于头文件`<map>`，是根据了键K进行排序的关联数组容器。

```c++
map<int, double> m;
m.insert(make_pair(2017, 10.31)); // 插入
m.insert(make_pair(2016, 8.26));
m.insert(make_pair(2016, 1.01));  // 插入失败
m[2016] = 1.01;  // 修改成功
m.erase(m.begin());  // 删除头
cout << m[2017] << endl;  // 通过key获取value
cout << m.find(2017)->second << endl;  // find返回迭代器
```

### std::unordered_map

std::unordered_map定义于头文件`<unordered_map>`，跟上面的map区别不大，最主要的区别就是unordered_map的实现是散列表，即储存不对key做排序。

不过在运行上述代码的时候，你会发现unordered_map的输出跟map是一样的，这是因为unordered_map的插入是在头部插入。

### std::multimap

std::multimap定义于头文件`<map>`，跟map最大的区别就是键值之间可以一对多。并且，为了避免产生一些很迷的问题，C++在multimap中取消了`[]`下标的操作符重载。通过`find`函数获取的也只是在multimap里面key对应的第一个value，通过find无法获取其余的value。

在一对多Map里面，那么函数`count`就起作用了(在map和set里面count永远返回1或0，因为key只存在一次或者零次)。

为了访问其余的value，multimap就需要利用某个(我)不常使用的函数`equal_range`了，其返回值是一个迭代器pair，标记了相关的value的开端和结尾。

```c++
template< class K >
std::pair<iterator,iterator> equal_range( const K& x );
template< class K >
std::pair<const_iterator,const_iterator> equal_range( const K& x ) const;
```

### std::unordered_multimap

std::unordered_multimap定义于头文件`<unordered_map>`，这个就真的没啥好讲了，对照前面的unordered_map和multimap基本都知道怎么用了。

### std::set

std::set定义于头文件`<set>`，字面意思就是集合。

一开始我查阅维基百科的时候，也感到纳闷，为什么set也是map的一类？后来在[CPLusPlus](http://www.cplusplus.com/reference/set/set/)中找到了答案，原来set的key就是value本身。

在C++里面，set跟map的确很相像，一样插入是用`insert`，`count`的结果要不是1就是0。区别估计就是只需要声明value的类型一点而已。

### std::unordered_set

std::unordered_set定义于头文件`<unordered_set>`，没啥好说~

### std::multiset

std::multiset定义于头文件`<set>`，没啥好说

### std::unordered_multiset

std::unordered_multiset定义于头文件`<unordered_set>`，没啥好说~

**顺便一提，貌似C++17有个新特性叫推导指引(Deduction Guide)，貌似在某些情况把容器的模板类型给省略掉，有空玩玩~**

---

## Java中的Map

在Java中，Map只是一个接口，它的实现有很多，这里我们只讲几个常见的Map实现。

### HashMap

哈希映射，也叫散列映射，基于哈希表实现。在Java里面是从K到V的一对一字典，并且进行了排序。

```java
HashMap<Integer, Double> m = new HashMap<Integer, Double>();
m.put(2017, 8.16);
m.put(2016, 3.12);  // 排序在开端
m.put(2018, 9.01);
m.replace(2017, 0.);  // 修改成功
m.put(2016, 2.);  // 输入成功，修改了2016的value
m.remove(2016, 3.12);  // 删除失败，2016的value已经不是3.12
m.remove(2016);  // 删除成功
System.out.println(m.get(2018));
m.forEach((k,v) -> System.out.println("key: " + k + " value:" + v));
```

Java貌似很多数据结构都不支持[]作为下标访问(或者说全部？)，因为没有学过Java，没法定论。

### TreeMap

TreeMap跟HashMap差不多，不过是基于红黑树实现的。HashMap的性能要优于TreeMap，但是在需要排序的时候TreeMap更优。不过貌似HashMap本身也是排序好的，所以真的不知道TreeMap有什么优势。

### Hashtable

(**注意table的t是小写**)

Hashtable不支持key和value的值为null，但是HashMap支持。

---

## C#中的Map

C#中的Map大概用的最多的就是HashTable和Dictionary了。值得注意的是，C#里面没有HashMap，但是在Java里面HashMap用的又是最多。在CSDN里面有一个回复说在他的理解里面，是因为Java的HashTable设计的怪异，然后才再设计了HashMap(也不知道这种说法是否正确啊)。

### HashTable

HashTable定义于命名空间`System.Collections`，据说是查询速度相对快，但是添加速度相对慢。

C#貌似对异常处理都比较严格，如果我在HashTable里面插入一个已有的key，那将会抛出一个异常。

```c#
Hashtable openWith = new Hashtable();
openWith.Add("txt", "notepad.exe");
openWith.Add("bmp", "paint.exe");
openWith.Add("dib", "paint.exe");
openWith.Add("rtf", "wordpad.exe");

// 必须捕捉异常
try {
  openWith.Add("txt", "winword.exe");
} catch {
  Console.WriteLine("An element with Key = \"txt\" already exists.");
}

// 利用下标获取值的时候也需要捕捉异常
try {
  Console.WriteLine("For key = \"tif\", value = {0}.", openWith["tif"]);
} catch (KeyNotFoundException) {
  Console.WriteLine("Key = \"tif\" is not found.");
}

openWith["doc"] = "winword.exe";  // 修改键值, 如果不存在就新添加
openWith.Remove("doc");  // 删除键值对

// 判断键是否存在, 相似函数还有ContainsKey(Object)、ContainsValue(Object)
if (!openWith.Contains("doc")) {
  Console.WriteLine("Key \"doc\" is not found.");
}
```

### Dictionary

Dictionary定义于命名空间`System.Collections.Generic`，跟HashTable最大的区别大概就是Dictionary支持泛型，而HashTable只接受Object类型，这将导致HashTable在使用的时候会产生大量的类型转换开销。

```c#
Dictionary<string, string> openWith = new Dictionary<string, string>();
openWith.Add("txt", "notepad.exe");
openWith.Add("bmp", "paint.exe");
openWith.Add("dib", "paint.exe");
openWith.Add("rtf", "wordpad.exe");

// 必须捕捉异常
try {
  openWith.Add("txt", "winword.exe");
} catch {
  Console.WriteLine("An element with Key = \"txt\" already exists.");
}

// 利用下标获取值的时候也需要捕捉异常
try {
  Console.WriteLine("For key = \"tif\", value = {0}.", openWith["tif"]);
} catch (KeyNotFoundException) {
  Console.WriteLine("Key = \"tif\" is not found.");
}

openWith["doc"] = "winword.exe";  // 修改键值, 如果不存在就新添加
openWith.Remove("doc");  // 删除键值对

// 判断键是否存在, 值得注意的是Dictionary没有Contains(TKey)方法
if (!openWith.ContainsKey("doc")) {
  Console.WriteLine("Key \"doc\" is not found.");
}
```

### SortedDictionary

如果我们认真研究上面的输出，就会发现，无论是HashTable还是Dictionary，都没有对输入的键进行排序。谷歌之后我发现所有人询问HashTable怎么排序的时候，回答的首选都是SortedDictionary。

SortedDictionary定义于命名空间`System.Collections.Generic`，跟Dictionary的区别是，SortedDictionary是二叉搜索树的实现，它的检索复杂度是`O(lgn)`而不是类似哈希表一样的`O(1)`。

---

## 后续

呃~没啥后续~

