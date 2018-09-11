---
title: Android | 移动应用开发(2) 事件处理
date: 2018-8-10
categories: Android
tags: Android
---

Android移动应用开发系列文章是本菜秀在《移动应用开发(MAD)》课程上的笔记，旨在加深自己对Android开发的认识，所以可能会排版无比奇葩。当然，这里不仅仅局限于课程上学到的东西，菜秀尽力分享更多东西。如果学疏才浅的菜秀有啥错误，欢迎指正。

本文是本系列的第二篇文章，重点是了解Android UI控件的事件处理。

<!-- more -->

# 移动应用开发(2) 事件处理

## Week6 界面编程下

### 控件概述

Android系统的界面控件的分类：

* 系统控件：Android系统提供给用户已经封装好的界面控件，不一定在SDK内。
* 自定义控件：用户独立开发的控件，继承于系统控件。

设置控件属性的方法：

* 在布局文件中设置参数
* 在代码中调用对应方法实现，会产生`findViewById`地狱。(可以通过预编译的插件避免，Kotlin无此问题)

## Kotlin语法

### Function

Kotlin的函数使用`fun`关键词声明，函数参数采用Pascal表示法定义，即name:type。参数使用逗号分隔，每个参数必须有显式类型。

```kotlin
fun double(x: Int): Int {
    return 2 * x
}
```

函数参数允许有缺省值，并且缺省值参数可以在无缺省值的参数之前。如果一个缺省参数在无缺省值的参数之前，那么该缺省值函数的调用需要使用命名参数。如果无缺省值的参数是lambda表达式且表达式写在括号外，那么就允许调用的时候不考虑lambda参数的命名。

```kotlin
fun add(lhs: Int = 1, rhs: Int): Int {
    return lhs + rhs
}

add(rhs = 2)
```

```kotlin
fun opr(lhs: Int = 1, rhs: Int = 2, fn: (Int, Int) -> Int): Int {
    return fn(lhs, rhs)
}

opr() { a, b -> a - b }
```

在没有缺省值的时候，函数调用也允许使用命名参数。命名参数在有大量参数且类型相同的时候，能让代码更具有可读性。但是，在调用Java函数的时候不能使用命名参数的语法，因为Java字节码并不保留函数参数的名称。

Kotlin的函数还支持可变数量的参数、中缀表达式、泛型、尾递归函数修饰符等，不过这里就不一一细述了。

### Class

Kotlin用关键词`class`声明类，类声明包括类名、类头、类体。其中类头指定类型参数、主构造函数等，类体由花括号包围，类头和类体都是可选的。

```kotlin
class Invoice { ... }
class Empty
```

Kotlin中的类可以由一个主构造函数以及一个或多个次构造函数，主构造函数是类头的一部分，跟在类名和可选类型参数后。

```kotlin
class Person constructor(firstName: String) { ... }
```

如果主构造函数没有任何注解或修饰符，那么可以省略`constructor`关键词。主构造函数不能包含任何代码，初始化的代码可以放在`init`初始化块中或者属性初始化器中。

```kotlin
class Person(firstName: String, lastName: String) {
    var firstName: String = firstName
    var lastName: String

    init {
        this.lastName = lastName
    }

    fun print() {
        println(firstName)
        println(lastName)
    }
}

fun main(args: Array<String>) {
    Person("Mega", "Chan").print()
}
```

类的属性也可以声明在主构造函数中。

```kotlin
class Person(val firstName: String, val lastName: String) { ... }
```

次构造函数用`constructor`声明前缀，次构造函数内部可以调用其它构造函数，这个过程叫做委托。委托处于构造函数执行中的第一句语句，因此主构造函数将会首先被调用。如果没有主构造函数，`init`初始化块也会被首先调用。

```kotlin
class Person(val firstName: String, val lastName: String) {
    constructor(firstName: String): this(firstName, "Show") {}
    
    fun print() {
        println(firstName)
        println(lastName)
    }
}

fun main(args: Array<String>) {
    Person("Mega").print()
}
```

Kotlin中的类如果没有指明父类，那么它将默认继承于类Any，因此Kotlin中所有类的共同超类为Any。Kotlin的Any类并不是Java中的java.lang.Object。Kotlin的`open`标注用于表明该类可以被继承，与Java的`final`正好相反。

```kotlin
open class Base(p: Int)

class Derived(p: Int) : Base(p)
```

次构造函数中利用`this`来调用同一个类中别的构造函数，用`super`来调用父类的构造函数。

Kotlin中类没有静态方法，需要用伴生对象来模拟静态方法。

### Lambda

Kotlin中lambda表达式具有很重要的地位，很多地方都依赖lambda表达式和匿名函数来工作。

Kotlin的lambda表达式总是括在花括号中，参数声明也放在花括号内，类型标注可选，函数体跟在`->`之后。

```kotlin
val sum = { x: Int, y: Int -> x + y }
```

lambda表达式可以作为参数传递给函数。在Kotlin中有一个约定，如果函数的最后一个参数类型是函数，那么将lambda表达式作为参数传递的时候，lambda表达式可以放在小括号外面。如果是唯一参数，那么小括号将可以省略。

```kotlin
fun opr(lhr: Int, rhs: Int, fn: (Int, Int) -> Int): Int {
    return fn(lhr, rhs)
}

var res = opr(1, 2) { a, b -> a + b }
```

```kotlin
fun printfn(fn: (Int, Int) -> Int) {
    println(fn)
}

printfn { a, b -> a + b }
```

lambda表达式中不需要的参数可以用`_`替代，这个语法跟Golang一样。并且，如果lambda表达式只有一个参数，那么可以不声明唯一的参数且忽视`->`，该参数会被隐式声明为`it`。

```kotlin
fun printfn(fn: (Int) -> Int) {
    println(fn)
}

printfn { it }
printfn { _ -> -1 }
```

lambda表达式在Android开发中广泛用于各种监听器设置，在Kotlin自身的语法中也被用于switch/case表达式。

## Lab2 事件处理

### TextInputLayout

本次实验要求使用TextInputLayout来替代EditText，这个控件并没有集成进SDK框架里面，而是集成进support库里面。

因此，我们在布局界面拖拉TextInputLayout的时候，会提示下载相应的支持库，点击下载，Android Studio会自动修改`build.gradle`文件。

```groovy
dependencies {
    implementation 'com.android.support:design:28.0.0-alpha1'
}
```

这个design是和appcompat一样的版本号，本人进行实验的时候最新版本为`28.0.0-beta01`，但是由于无法可视化布局，将版本降为了`28.0.0-alpha1`。

这里或许你要问了，为什么实验文档上给的是`compile`，而不是`implementation`？

实际上，这是依赖关键词，这样的关键词有三个：

* `implementation`：依赖不可以传递，即该库依赖的库对app module是不可见的。
* `compile`：依赖可以传递，即该库依赖的库对app module是可见的。
* `api`：同compile，依赖可见。

或许你还要问，compile和api有啥区别？本菜鸡也不知道有啥区别，不过compile已经在Gradle新版本中明确规定已经弃用了，并且Android Studio在2018年之后不再对compile进行支持。所以，即使需要依赖可见，我们也应该使用api，而不是compile。当然，为了减少编译速度，我们更提倡使用implementation而不是api。

使用可视化的方式将TextInputLayout布局好，因为需要设置学号只能输入数字，密码必须隐藏，我们可以修改TextInputEditText的`inputType`属性。

```xml
<android.support.design.widget.TextInputLayout
    android:id="@+id/inputPassword"
    android:layout_width="0dp"
    android:layout_height="wrap_content"
    android:layout_marginEnd="20dp"
    android:layout_marginStart="20dp"
    android:layout_marginTop="20dp"
    app:layout_constraintEnd_toEndOf="parent"
    app:layout_constraintStart_toStartOf="parent"
    app:layout_constraintTop_toBottomOf="@+id/inputStudentId">

    <android.support.design.widget.TextInputEditText
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:hint="请输入密码"
        android:inputType="textPassword" />
</android.support.design.widget.TextInputLayout>

<android.support.design.widget.TextInputLayout
    android:id="@+id/inputStudentId"
    android:layout_width="0dp"
    android:layout_height="wrap_content"
    android:layout_marginEnd="20dp"
    android:layout_marginStart="20dp"
    android:layout_marginTop="20dp"
    app:layout_constraintEnd_toEndOf="parent"
    app:layout_constraintStart_toStartOf="parent"
    app:layout_constraintTop_toBottomOf="@+id/imageView">

    <android.support.design.widget.TextInputEditText
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:hint="请输入学号"
        android:inputType="number" />
</android.support.design.widget.TextInputLayout>
```

这个时候问题来了，你会发现在Design界面报了一个missing styles的错误。本菜秀也不知道怎么解决这个错误，在网络上也找不到解决方案。不过，这个错误并不影响开发。如果你是强迫症，可以尝试将SDK降为27，这样就不会出现该错误了。

```groovy
android {
    compileSdkVersion 27
    defaultConfig {
        //noinspection OldTargetApi
        targetSdkVersion 27
    }
}

dependencies {
    implementation 'com.android.support:appcompat-v7:27.1.1'
    implementation 'com.android.support:design:27.1.1'
}
```

在Design里面会报一个叫Layout fidelity warning的警告，是说用的控件有阴影效果，在该Design界面的效果可能与物理设备上的效果是不一样的。在Design上显示正确，并不表示在物理设备上显示正确，因为Design不知道它的具体实现。该警告可以忽视。

### Button

根据实验要求，我们需要处理注册、登陆按钮的事件。通常情况下，我们需要设置按钮的点击监听器。

```java
findViewById(R.id.buttonLogin).setOnClickListener(new View.OnClickListener() {
    @Override
    public void onClick(View v) {
        /* code */
    }
});
```

```kotlin
buttonLogin.setOnClickListener { v ->
    /* code */
}
```

上面的代码分别用了Java和Kotlin，为了学习一下Kotlin，以后的代码我都会使用Android Studio的工具将Java代码转换成Kotlin，然后自己做一些修改。上面并不是原生的Kotlin安卓，而是使用了Kotlin安卓扩展，这里使用了安卓扩展中的视图绑定功能。该功能允许直接绑定布局上相关id的视图到相应的变量上，而不需要用findViewById方法。为了使用该功能，我们需要在`build.gradle`中添加扩展。

```groovy
apply plugin: 'kotlin-android-extensions'
```

通过上面的的方式可以给每个按钮绑定一个监听器，然后重写onClick方法，实现点击事件。不过对于onClick事件，我更喜欢用下面的方式来实现。

```java
public class MainActivity extends AppCompatActivity implements View.OnClickListener {
    @Override
    public void onClick(View view) {
        switch (view.getId()) {
            case R.id.buttonLogin:
                /* code */
                break;
        }
    }
}
```

```kotlin
class MainActivityKt : AppCompatActivity(), View.OnClickListener {
    override fun onClick(view: View) {
        when (view.id) {
            R.id.buttonLogin -> { /* code */ }
        }
    }
}
```

这样同时需要在布局文件中，将buttonLogin的onClick属性设置为onClick。

我们可以将注册登陆的逻辑写在私有方法中，然后在onClick方法中调用逻辑私有方法。

```java
case R.id.buttonLogin:
    login();
    break;
case R.id.buttonRegister:
    register();
    break;
```

```kotlin
R.id.buttonLogin -> login()
R.id.buttonRegister -> register()
```

接下来实现逻辑，其中Objects.requireNonNull方法用于判断对象是否为null，并可能抛出NullPointerException异常。

```java
private void login() {
    try {
        TextInputLayout inputStudentId = findViewById(R.id.textInputStudentId);
        TextInputLayout inputPassword = findViewById(R.id.textInputPassword);
        String studentId = Objects.requireNonNull(inputStudentId.getEditText(), "StudentId TextInputEditText Error")
                .getText().toString();
        String password = Objects.requireNonNull(inputPassword.getEditText(), "Password TextInputEditText Error")
                .getText().toString();
        inputStudentId.setError("学号不能为空");
        inputPassword.setError("密码不能为空");
        inputStudentId.setErrorEnabled(studentId.isEmpty());
        inputPassword.setErrorEnabled(!studentId.isEmpty() && password.isEmpty());
        if (studentId.isEmpty() || password.isEmpty()) {
            return;
        }
        String msg;
        if (studentId.equals("123456") && password.equals("6666")) {
            msg = "登录成功";
        } else {
            msg = "学号或密码错误";
        }
        makeSnackbar(msg).show();
    } catch (NullPointerException e) {
        Log.d(TAG, "login: " + e.toString());
    }
}
```

```kotlin
private fun login() {
    val studentId = textInputStudentId.editText?.text.toString()
    val password = textInputPassword.editText?.text.toString()
    textInputStudentId.error = "学号不能为空"
    textInputPassword.error = "密码不能为空"
    textInputStudentId.isErrorEnabled = studentId.isEmpty()
    textInputPassword.isErrorEnabled = !studentId.isEmpty() && password.isEmpty()
    if (studentId.isEmpty() || password.isEmpty()) {
        return
    }
    val msg = if (studentId == "123456" && password == "6666") {
        "登录成功"
    } else {
        "学号或密码错误"
    }
    makeSnackbar(msg).show()
}
```

这里我们需要实现封装两个关于Toast和Snackbar的方法，用于减少代码量。

```java
private Snackbar makeSnackbar(String msg) {
    return Snackbar.make(findViewById(R.id.buttonLogin), msg, Snackbar.LENGTH_SHORT)
            .setAction("确定", new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    makeToast("Snackbar的确定按钮被点击了").show();
                }
            });
}

private Toast makeToast(String msg) {
    return Toast.makeText(MainActivity.this, msg, Toast.LENGTH_SHORT);
}
```

```kotlin
private fun makeSnackbar(msg: String): Snackbar {
    return Snackbar.make(findViewById(R.id.scrollView), msg, Snackbar.LENGTH_SHORT)
            .setAction("确定") { makeToast("Snackbar的确定按钮被点击了").show() }
}

private fun makeToast(msg: String): Toast {
    return Toast.makeText(this@MainActivityKt, msg, Toast.LENGTH_SHORT)
}
```

这里值得说明一下的是，Snackbar.make的第一个参数接收的View变量的意义并不是跟实验资料上的一致。根据Android官方文档，这个View只要是该布局上的任意一个视图即可，make方法内部会通过这个视图来获取到最顶部的根视图。当然，你传入根视图也可以。

至于注册，我们只需要判断一下radioStudent是否处于选中状态，来决定输出字符串即可。

```java
private void register() {
    String msg = ((RadioButton)findViewById(R.id.radioStudent)).isChecked() ? "学生注册功能尚未启用" : "教职工注册功能尚未启用";
    makeSnackbar(msg).show();
}
```

```kotlin
private fun register() {
    val msg = if (radioStudent.isChecked) "学生注册功能尚未启用" else "教职工注册功能尚未启用"
    makeSnackbar(msg).show()
}
```

### RadioGroup

实验要求我们切换RadioButton的时候弹出提示信息，这里需要使用Snackbar。我们需要一个选中信息改变的监听器，本来想类似点击监听器一样通过实现接口的方式来监听，不过由于布局XML中没有相应的属性，那么只能用代码写。

```java
RadioGroup group = findViewById(R.id.radioGroup);
group.setOnCheckedChangeListener(new RadioGroup.OnCheckedChangeListener() {
    @Override
    public void onCheckedChanged(RadioGroup group, int checkedId) {
        switch (checkedId) {
            case R.id.radioStudent:
                makeSnackbar("您选择了学生").show();
                break;
            case R.id.radioTeacher:
                makeSnackbar("您选择了教职工").show();
                break;
        }
    }
});
```

```kotlin
radioGroup.setOnCheckedChangeListener { _, checkedId ->
    when (checkedId) {
        R.id.radioStudent -> makeSnackbar("您选择了学生").show()
        R.id.radioTeacher -> makeSnackbar("您选择了教职工").show()
    }
}
```

### ImageView

因为对ImageView的实验要求依然是点击事件，所以我们可以在onClick方法中添加ImageView的信息。

```java
case R.id.imageView:
    showDialog();
    break;
```

```kotlin
R.id.imageView -> showDialog()
```

对话框需要用到AlertDialog，首先需要创建一个AlertDialog.Builder，然后再利用Builder来生成一个AlertDialog。

```java
private void showDialog() {
    AlertDialog.Builder builder = new AlertDialog.Builder(MainActivity.this);
    final String[] items = {"拍照", "从相册选择"};
    builder.setTitle("上传头像")
        .setItems(items, new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int which) {
                makeToast("您选择了[" + items[which] + "]").show();
            }
        })
        .setNegativeButton("取消", new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int which) {
                makeToast("您选择了[取消]").show();
            }
        });
    AlertDialog dialog = builder.create();
    dialog.show();
}
```

```kotlin
private fun showDialog() {
    val builder = AlertDialog.Builder(this@MainActivityKt)
    val items = arrayOf("拍照", "从相册选择")
    builder.setTitle("上传头像")
            .setItems(items) { _, which -> makeToast("您选择了[" + items[which] + "]").show() }
            .setNegativeButton("取消") { _, _ -> makeToast("您选择了[取消]").show() }
    val dialog = builder.create()
    dialog.show()
}
```

## 结语

Kotlin真好用。

