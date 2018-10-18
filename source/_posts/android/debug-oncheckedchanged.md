---
title: Android | Debug之数据绑定和onCheckedChanged
date: 2018-9-28
categories: Android
tags:
  - Android
  - Bug
  - Java
---

在《移动应用开发(MAD)》课程第一次作业中，遇到了一些BUG。在数据绑定的情况下，`onCheckedChanged`回调事件莫名被调用了两次。本文将探究一下这些BUG。

<!-- more -->

## 这是BUG

### 代码重现

本BUG产生于Android Databinding。首先我们创建一个简单的布局如下：

![activity](debug-oncheckedchanged/activity.png)

定义RadioButton的id分别为`radioButtonA`和`radioButtonB`，定义Button的id分别为`buttonA`、`buttonB`，定义RadioGroup的id为`radioGroup`。同时，我们对Button的`onClick`和RadioGroup的`onCheckedChanged`事件进行方法绑定，对RadioGroup的`checkedButton`进行双向数据绑定。

Model类如下，负责RadioGroup的`checkedButton`的双向绑定。

```java
public class MainModel extends BaseObservable {
    @IdRes
    private int id;

    public MainModel() {
        id = R.id.radioButtonA;
    }

    @Bindable
    public @IdRes int getId() {
        return id;
    }

    public void setId(@IdRes int _id) {
        id = _id;
        notifyPropertyChanged(BR.id);
    }
}
```

Handler类如下，负责所有事件绑定。

```java
public class MainHandler {
    private static final String TAG = "MainHandler";
    private Context mContext;
    private ActivityMainBinding mBinding;

    public MainHandler(Context context, ActivityMainBinding binding) {
        Log.w(TAG, "MainHandler: Init");
        mContext = context;
        mBinding = binding;
    }

    public void onCheckedChanged(RadioGroup group, @IdRes int id) {
        Toast.makeText(mContext, "change", Toast.LENGTH_SHORT).show();
        Log.w(TAG, "onCheckedChanged: Be called");
    }

    public void onClickButtonA(View v) {
        mBinding.getModel().setId(R.id.radioButtonA);
    }

    public void onClickButtonB(View v) {
        mBinding.getModel().setId(R.id.radioButtonB);
    }
}
```

在Handler中可以观察到专门在`onCheckedChanged`方法中打log并且通过Toast显示信息，是的，本文将围绕这个方法展开一系列神奇的研究。

在Context中，实现了数据绑定和Handler、Model的设置。

```java
public class MainActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        ActivityMainBinding binding = 
            DataBindingUtil.setContentView(this, R.layout.activity_main);
        binding.setModel(new MainModel());
        binding.setHandler(new MainHandler(this, binding));
    }
}
```

然后编译运行，就会发现在不做任何操作的情况下打印出了以下的log。

```
W/MainHandler: MainHandler: Init
W/MainHandler: onCheckedChanged: Be called
W/MainHandler: onCheckedChanged: Be called
```

### 产生原因猜想

onCheckedChanged方法是在checkedButton被修改的时候，会被调用。既然checkedButton于`MainModel.id`双向绑定，那么在`MainModel.id`被修改的时候，onCheckedChanged也会被调用。

在Model的代码中，有一个id值从默认值变为`R.id.radioButtonA`的过程。这个变化的发生，从而触发了onCheckedChanged方法，于是产生了这个BUG，从这个角度去理解看似解释了BUG产生的原因。不过在Context中，很明显是`setModel`是在`setHandler`之前执行的，按照单线程模型来想，那这个BUG是不应该发生的。

因此，我们可以假设这是多线程，导致Model和Handler的绑定顺序不一致，在Model绑定的时候Handler已经完成了绑定，因此checkedButton从0变成了`R.id.radioButtonA`，触发了事件。

### 源码分析

需要判断猜想是否正确，那么我们需要分析数据绑定产生的源码。绑定类`ActivityMainBinding`实际上是一个抽象类，其具体实现交给它的子类`ActivityMainBindingImpl`，这是一个Android Studio根据布局和绑定信息生成的一个类。

在绑定实现类`ActivityMainBindingImpl`中，定义`setModel`和`setHandler`两个方法。

```java
public void setHandler(@Nullable com.icytown.course.mad.handler.MainHandler Handler) {
    this.mHandler = Handler;
    synchronized(this) {
        mDirtyFlags |= 0x2L;
    }
    notifyPropertyChanged(BR.handler);
    super.requestRebind();
}

public void setModel(@Nullable com.icytown.course.mad.model.MainModel Model) {
    updateRegistration(0, Model);
    this.mModel = Model;
    synchronized(this) {
        mDirtyFlags |= 0x1L;
    }
    notifyPropertyChanged(BR.model);
    super.requestRebind();
}
```

这两个方法均是在UI线程中调用的，那么对于mHandler、mModel的赋值肯定也是在UI线程中执行的，那赋值顺序必然是mModel才到mHandler。可证实BUG产生应该与Model和Handler赋值顺序不一致无关。

那么，BUG到底是什么原因产生的呢？

在`ActivityMainBindingImpl`类中的`executeBindings`方法中，我们找到了onCheckedChanged和onClick监听器设置的代码。这意味着调用`executeBindings`方法的调用方，将可能是导致这个BUG的源头。

通过Android Studio的工具，我们得知有以下两个方法调用了`executeBindings`，而executeBindingsInternal由executePendingBindings调用。

```java
public abstract class ViewDataBinding extends BaseObservable {
    private void executeBindingsInternal();
    void forceExecuteBindings();
}
```

`ViewDataBinding`是`ActivityMainBinding`的父类，由于forceExecuteBindings没有标注访问修饰关键词，默认为`friendly`，那么我们可以排除它是调用方。那么我们可以简单认为是executePendingBindings调用了executeBindings方法。

抛开监听器设置的代码，我们回到Model和Handler的Setter，看一下除了赋值之外的代码。父类的requestRebind方法如下：

```java
protected void requestRebind() {
    if (mContainingBinding != null) {
        mContainingBinding.requestRebind();
    } else {
        synchronized (this) {
            if (mPendingRebind) {
                return;
            }
            mPendingRebind = true;
        }
        if (mLifecycleOwner != null) {
            Lifecycle.State state = mLifecycleOwner.getLifecycle().getCurrentState();
            if (!state.isAtLeast(Lifecycle.State.STARTED)) {
                return; // wait until lifecycle owner is started
            }
        }
        if (USE_CHOREOGRAPHER) {
            mChoreographer.postFrameCallback(mFrameCallback);
        } else {
            mUIThreadHandler.post(mRebindRunnable);
        }
    }
}
```

可以看到代码最后，眼前一亮，Runnable不就是多线程么！代码首先判断SDK版本，如果是大于等于16就使用Choreographer，否则使用UIThreadHandler。

在`ViewDataBinding`的构造函数中也存在对SDK的判断，可见无论是Choreographer还是UIThreadHandler最终都会执行mRebindRunnable。

```java
if (USE_CHOREOGRAPHER) {
    mChoreographer = Choreographer.getInstance();
    mFrameCallback = new Choreographer.FrameCallback() {
        @Override
        public void doFrame(long frameTimeNanos) {
            mRebindRunnable.run();
        }
    };
} else {
    mFrameCallback = null;
    mUIThreadHandler = new Handler(Looper.myLooper());
}
```

一看mRebindRunnable，居然调用了executePendingBindings。

```java
private final Runnable mRebindRunnable = new Runnable() {
    @Override
    public void run() {
        synchronized (this) {
            mPendingRebind = false;
        }
        processReferenceQueue();

        if (VERSION.SDK_INT >= VERSION_CODES.KITKAT) {
            // Nested so that we don't get a lint warning in IntelliJ
            if (!mRoot.isAttachedToWindow()) {
                // Don't execute the pending bindings until the View
                // is attached again.
                mRoot.removeOnAttachStateChangeListener(ROOT_REATTACHED_LISTENER);
                mRoot.addOnAttachStateChangeListener(ROOT_REATTACHED_LISTENER);
                return;
            }
        }
        executePendingBindings();
    }
};
```

突然思路理清，**Model和Handler的赋值是在UI线程中执行的，但是具体赋值checkedButton和绑定事件监听器是另开线程执行的。**多线程的确会出现一些玄学问题，我们没法保证线程之间的执行顺序。

### 脏值

上述多线程的结论虽然是正确的，但是在断点调试的过程中，我发现setModel和setHandler中调用的requestRebind最终根本没法单步进入任何下一个函数。在两次调用该方法中，`mPendingRebind`值始终为true。

```java
protected void requestRebind() {
    /* ... */
    synchronized (this) {
        if (mPendingRebind) {
            return;
        }
        mPendingRebind = true;
    }
    /* ... */
}
```

因此说具体赋值checkedButton和绑定事件监听器根本不是在setModel和setHandler中直接间接调用的。因为`mPendingRebind`初始化值为false，通过查询只有在requestRebind中才有将其赋值为true的操作，那我们需要查找还有哪个方法调用了requestRebind。

```java
public void invalidateAll() {
    synchronized(this) {
        mDirtyFlags = 0x8L;
    }
    requestRebind();
}
```

该方法在`ActivityMainBindingImpl`的构造函数中被调用，因此说在数据绑定类被创建的那一刻，`mRebindRunnable`就被post进入Choreographer或者UIThreadHandler中，等待被执行。但`mPendingRebind`已经被赋值为true，而且只有在`mRebindRunnable`才被恢复成false。而实践中`mRebindRunnable`总是在Model和Handler赋值成功之后才调用，我猜这才是线程之间的执行顺序问题。

既然在setModel和setHandler中没有绑定事件监听器和绑定数据，那么又是在哪里绑定的呢？

在数据绑定实现类中，充斥着不少magic数值，它们以十六进制表示存在，并与一个叫`mDirtyFlags`的变量做条件判断或赋值操作。在实现类的底部，有这样的一段注释。

```java
// dirty flag
private  long mDirtyFlags = 0xffffffffffffffffL;
/* flag mapping
   flag 0 (0x1L): model
   flag 1 (0x2L): handler
   flag 2 (0x3L): model.id
   flag 3 (0x4L): null
flag mapping end */
//end
```

这个变量叫脏值，或者脏标记。该变量专门记录标记映射中哪个变量变脏了，即哪个变量被修改了。在`executeBindings`方法中，修改哪个监听器或者哪个数据就是通过脏值来判断。由于是使用位运算，一个脏值最多可以记录64个变量的状态，并且在`executeBindings`中，可以同时修改64个变量(监听器)相应的值。

由此可以得出结论，checkedButton值和onCheckedChanged监听器实际上是在同一次对`executeBindings`的调用中赋值的。那么它们赋值的先后顺序就由该方法的具体实现所决定了。

```java
if ((dirtyFlags & 0xaL) != 0) {
    // api target 1
    this.buttonA.setOnClickListener(handlerOnClickButtonAAndroidViewViewOnClickListener);
    this.buttonB.setOnClickListener(handlerOnClickButtonBAndroidViewViewOnClickListener);
    android.databinding.adapters.RadioGroupBindingAdapter.setListeners(
        this.radioGroup,
        (android.widget.RadioGroup.OnCheckedChangeListener)
            handlerOnCheckedChangedAndroidWidgetRadioGroupOnCheckedChangeListener,
        radioGroupandroidCheckedButtonAttrChanged);
}
if ((dirtyFlags & 0xdL) != 0) {
    // api target 1
    android.databinding.adapters.RadioGroupBindingAdapter.setCheckedButton(this.radioGroup, modelId);
}
```

上面代码很明显是先绑定了onCheckedChanged监听器，再设置checkedButton值。这时候checkedButton将由0变成R.id.radioButtonA，于是触发监听器。

### 总结

简单地说，数据绑定的机制导致setModel、setHandler不会直接去通知UI进行数据绑定，而是通过脏值的情况将修改记录下来。而Choreographer或者UIThreadHandler会通过另一个线程来调用相关方法，对脏值判断并作出相应处理。

checkedButton值和onCheckedChanged监听器将同时处理，由于数据绑定实现类生成的代码的顺序，导致先绑定了onCheckedChanged监听器，再设置checkedButton值。于是设置checkedButton值时触发监听器相关事件。

### 解决方案

首先先声明一点，以上并不是Android设计问题，而是本身就是这样设计的。数据绑定不同数据之间的冲突问题，应该由程序员自己解决，而不要奢望生成符合相应顺序的代码。(薛定谔的代码，在你阅读源码之前，并不知道它的具体顺序)

通过上面各种源码的分析，我们知道数据具体绑定最终是在`executeBindings`中的。既然绑定都是自动的，那么官方有没有给我们提供一种主动执行绑定的途径呢？

`ViewDataBinding`提供了公有方法`executePendingBindings`，可以用于主动执行需要绑定或已更新的数据。

```java
public void executePendingBindings() {
    if (mContainingBinding == null) {
        executeBindingsInternal();
    } else {
        mContainingBinding.executePendingBindings();
    }
}
```

那么，回到我们最初的Context代码，只需要加上一句代码，即可解决这个BUG。

```
ActivityMainBinding binding = DataBindingUtil.setContentView(this, R.layout.activity_main);
binding.setModel(new MainModel());
binding.executePendingBindings();
binding.setHandler(new MainHandler(this, binding));
```

`ViewDataBinding`还提供了两个方法`addOnRebindCallback`、`removeOnRebindCallback`来添加绑定被重新计算时调用的回调。以下代码可以使得绑定失效。

```java
OnRebindCallback<ActivityMainBinding> delayRebindCallback = new OnRebindCallback<ActivityMainBinding>() {
    @Override
    public boolean onPreBind(ActivityMainBinding binding) {
        return false;
    }
};
binding.addOnRebindCallback(delayRebindCallback);
```

> ### onPreBind
>
> ```java
> boolean onPreBind (T binding)
> ```
>
> Called when values in a ViewDataBinding should be reevaluated. This does not mean that values will actually change, but only that something in the data model that affects the bindings has been perturbed.
>
> Return true to allow the reevaluation to happen or false if the reevaluation should be stopped. If false is returned, it is the responsibility of the OnRebindListener implementer to explicitly call `executePendingBindings()`.
>
> The default implementation only returns `true`.

当`onPreBind`方法返回false时，绑定重新计算的过程将中止。可以通过下列代码恢复计算。

```java
binding.removeOnRebindCallback(delayRebindCallback);
binding.executePendingBindings();
```

注意，在恢复时`executePendingBindings`必须被显式调用。

## 这是另一个BUG

### 描述

在上一个BUG的代码重现中，本人刻意说明了布局中每一个控件的id值。

神奇的是，如果你将Button的id分别改成`zbuttonA`和`zbuttonB`，会发现上一个BUG并没有再重现。

### 产生原因

如果认真看完第一个BUG的分析，那么大概就明白这个BUG产生的原因了。

因为绑定都是同一次调用中执行的，执行顺序可能导致上一个BUG出现与否，那id可能就是决定这个顺序的关键值。

让我们观察两次生成的代码。

```java
if ((dirtyFlags & 0xaL) != 0) {
    // api target 1
    this.buttonA.setOnClickListener(handlerOnClickButtonAAndroidViewViewOnClickListener);
    this.buttonB.setOnClickListener(handlerOnClickButtonBAndroidViewViewOnClickListener);
    android.databinding.adapters.RadioGroupBindingAdapter.setListeners(this.radioGroup, (android.widget.RadioGroup.OnCheckedChangeListener)handlerOnCheckedChangedAndroidWidgetRadioGroupOnCheckedChangeListener, radioGroupandroidCheckedButtonAttrChanged);
}
if ((dirtyFlags & 0xdL) != 0) {
    // api target 1
    android.databinding.adapters.RadioGroupBindingAdapter.setCheckedButton(this.radioGroup, modelId);
}
```

```java
if ((dirtyFlags & 0xdL) != 0) {
    // api target 1
    android.databinding.adapters.RadioGroupBindingAdapter.setCheckedButton(this.radioGroup, modelId);
}
if ((dirtyFlags & 0xaL) != 0) {
    // api target 1
    android.databinding.adapters.RadioGroupBindingAdapter.setListeners(this.radioGroup, (android.widget.RadioGroup.OnCheckedChangeListener)handlerOnCheckedChangedAndroidWidgetRadioGroupOnCheckedChangeListener, radioGroupandroidCheckedButtonAttrChanged);
    this.zbuttonA.setOnClickListener(handlerOnClickButtonAAndroidViewViewOnClickListener);
    this.zbuttonB.setOnClickListener(handlerOnClickButtonBAndroidViewViewOnClickListener);
}
```

可以很明显观察到，在同一个脏标记内的绑定顺序，是id的字典序；不同脏标记的执行顺序，也是id的字典序。

虽然可以通过修改id来避免第一个BUG，但是这是一种治标不治本的解决方案。毕竟，顺序本来就不具有标准，说不定Android Studio的代码生成引擎某天改了执行顺序的机制呢！所以还是建议用挂起绑定+显式执行挂起绑定的方法。

## 这是Feature

### 描述

可能你注意到了，我在前言的描述是“onCheckedChanged被莫名调用两次”，是的，两次。并且，按照Handler里面的代码，当点击按钮切换checkedButton的时候，onCheckedChanged也是被调用两次，而不是一次。

数据绑定所实现的代码数据如下，-1表示未选中。

|            代码             |     原选中      |     参数     | onCheckedChanged调用次数 |
| :-------------------------: | :-------------: | :----------: | :----------------------: |
| `mBinding.getModel().setId` | radioButtonB    | radioButtonA |            3             |
| `mBinding.getModel().setId` |       -1        | radioButtonA |            2             |
| `mBinding.getModel().setId` |  radioButtonB   |      -1      |            2             |
| `mBinding.getModel().setId` |       -1        |      -1      |            1             |
| `mBinding.getModel().setId` |  radioButtonA   | radioButtonA |            0             |

也可以改用RadioGroup的check方法来修改checkedButton的值。


|            代码             |     原选中      |     参数     | onCheckedChanged调用次数 |
| :-------------------------: | :-------------: | :----------: | :----------------------: |
| `mBinding.radioGroup.check` |  radioButtonB   | radioButtonA |            3             |
| `mBinding.radioGroup.check` |       -1        | radioButtonA |            2             |
| `mBinding.radioGroup.check` |  radioButtonB   |      -1      |            2             |
| `mBinding.radioGroup.check` |       -1        |      -1      |            1             |
| `mBinding.radioGroup.check` |  radioButtonA   | radioButtonA |            0             |

除了通过RadioGroup，亦可以直接通过修改RadioButton的属性来修改checkedButton的值。

|                代码                |     原选中      | 参数  | onCheckedChanged调用次数 |
| :--------------------------------: | :-------------: | :---: | :----------------------: |
| `mBinding.radioButtonA.setChecked` | -1/radioButtonB | true  |            1             |
| `mBinding.radioButtonA.setChecked` |  radioButtonA   | false |            1             |
| `mBinding.radioButtonA.setChecked` |  radioButtonA   | true  |            0             |
| `mBinding.radioButtonA.setChecked` | -1/radioButtonB | false |            0             |

### 产生原因

观察到前两种方法的数据是一模一样的，开始怀疑数据绑定的实现是否用了RadioGroup的check方法。检查`ActivityMainBindingImpl`类，发现数据更新调用了`android.databinding.adapters.RadioGroupBindingAdapter`类的静态方法setCheckedButton，该静态方法源码如下：

```java
public static void setCheckedButton(RadioGroup view, int id) {
    if (id != view.getCheckedRadioButtonId()) {
        view.check(id);
    }
}
```

那我们只需要分析RadioGroup的check方法和RadioButton的setChecked方法。后者其实已经不用看了，因为后者的调用次数是符合逻辑的，而前者就有点匪夷所思了。

```java
public void check(@IdRes int id) {
    // don't even bother
    if (id != -1 && (id == mCheckedId)) {
        return;
    }
    if (mCheckedId != -1) {
        setCheckedStateForView(mCheckedId, false);
    }
    if (id != -1) {
        setCheckedStateForView(id, true);
    }
    setCheckedId(id);
}
```

按其源码逻辑，如果id和mCheckedId相等且不是-1，那么就不需要任何修改，直接返回。如果原选中RadioButton不是-1，那么就将原选中按钮的状态置为未选中。如果参数不是-1，那么就将参数按钮的状态置为选中。

setCheckedStateForView方法调用了RadioButton的setChecked方法，那么意味着setCheckedStateForView会调用onCheckedChanged事件0次或1次。

```java
private void setCheckedStateForView(int viewId, boolean checked) {
    View checkedView = findViewById(viewId);
    if (checkedView != null && checkedView instanceof RadioButton) {
        ((RadioButton) checkedView).setChecked(checked);
    }
}
```

而在setCheckedId中，onCheckedChanged事件还可能被调用1次。

```java
private void setCheckedId(@IdRes int id) {
    boolean changed = id != mCheckedId;
    mCheckedId = id;

    if (mOnCheckedChangeListener != null) {
        mOnCheckedChangeListener.onCheckedChanged(this, mCheckedId);
    }
    if (changed) {
        final AutofillManager afm = mContext.getSystemService(AutofillManager.class);
        if (afm != null) {
            afm.notifyValueChanged(this);
        }
    }
}
```

因此组合起来，`check`方法可能调用0~3次onCheckedChanged事件。

### 总结

>### onCheckedChanged
>
>added in [API level 1](https://developer.android.com/guide/topics/manifest/uses-sdk-element.html#ApiLevels)
>
>```java
>public abstract void onCheckedChanged (RadioGroup group, 
>                int checkedId)
>```
>
>
>
>Called when the checked radio button has changed. When the selection is cleared, checkedId is -1.

onCheckedChanged事件监听的是选中的RadioButton的改变，而check方法本质上是先改变原选中按钮的状态，再改变将要选中按钮的状态，再将成员变量mCheckedId的值改为id。

onCheckedChanged事件监听的目标是RadioGroup，而不是单个RadioButton。

## 结语

本文记录了本菜秀第一次作业遇到的一些问题，不过由于个人水平有限，如果有什么错误不妨多多指教。

顺便，阅读Android源码真的累，好想睡觉！

