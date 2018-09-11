---
title: Start | JUnit初探
date: 2018-4-14
categories: Start
tags:
  - Java
  - Unit Test
---

JUnit是一个Java单元测试框架，版本之间的区别比较大，因为实训的需要，我这里采用了JUnit 4。

<!-- more -->

## JUnit 4环境配置

我下载了JUnit 4.9，并放在了`/opt/jar`文件夹下。

为了验证环境是否配置正确，我们需要编写一个类和一个测试类：

```java
package hello;

public class Hello {
    String str;

    public void hello() {
        str = "Hello, world!";
    }

    public String getStr() {
        return str;
    }
}
```

```java
package test;

import static org.junit.Assert.*;
import org.junit.Test;
import hello.*;

public class HelloTest {
    private Hello hello = new Hello();

    @Test
    public void hello() {
        hello.hello();
        assertEquals("Hello, world!", hello.getStr());
    }
}
```

首先我们需要将`/opt/jar`加进Java的classpath里面：

```sh
$ sudo vi /etc/profile
```

```shell
CLASSPATH=.:$JAVA_HOME/lib/dt.jar:$JAVA_HOME/lib/tools.jar:/opt/jar/junit-4.9.jar
```

更新配置文件：

```sh
$ source /etc/profile
```

然后执行下列命令，如果成功测试就表明JUnit 4配置成功了：

```sh
$ javac -classpath src:$CLASSPATH src/test/HelloTest.java
$ java -classpath src:$CLASSPATH -ea org.junit.runner.JUnitCore test.HelloTest
```

当然，我们也可以利用Ant来跑JUnit：

```xml
<property environment="SystemVariable" />
<target name="test-compile">
    <mkdir dir="build/test"/>
    <javac srcdir="src" classpath="src:${SystemVariable.CLASSPATH}" destdir="build/test" includeantruntime="false"/>
</target>
<target name="test" depends="test-compile">
    <junit printsummary="on" haltonfailure="yes" fork="true">
        <classpath>
            <pathelement location="build/test"/>
        </classpath>
        <formatter type="brief" usefile="false" />
        <batchtest>
            <fileset dir="src" includes="**/*Test.java" />
        </batchtest>
    </junit>
</target>
```

## JUnit元数据

* `@Test`：测试方法
* `@Test(expected=*.class)`：测试方法，可声明异常类型
* `@Test(timeout=xxx)`：测试方法，可声明限制时间
* `@Before`：使用了该元数据的方法在每个测试方法执行之前都要执行一次
* `@After`：使用了该元数据的方法在每个测试方法执行之后要执行一次
* `@Ignore`：忽视该测试方法
* `@RunWith`：指明Runner
* `@Parameters`：参数化测试
* `@Suite.SuiteClasses`：打包测试


## JUnit测试私有方法

JUnit里面其实不建议测试私有方法，不过也有测试的方法。Java可以利用反射来调用私有方法：

```java
public class PrivateMethod {  
    private int add(int a, int b)  {         
        return a + b;  
    }  
} 
```

```java
import java.lang.reflect.Method;  
import static org.junit.Assert.*;
import org.junit.Test;
import org.junit.Before;
   
public class PrivateMethodTest {
    private PrivateMethod c;
    
    @Before void setUp() {
        c = new PrivateMethod();
    }
    
    @Test
    public void testAdd() {   
        Method method = c.getClass().getDeclaredMethod("add", new Class[] { int.class, int.class });  
        method.setAccessible(true);  
        Object result = method.invoke(c, new Object[]{ 1, 2 });  
        Assert.assertEquals(3, result);  
    }
}  
```

