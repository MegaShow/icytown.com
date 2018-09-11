---
title: Windows | UWP应用开发(3) 音乐视频播放器
date: 2018-4-25
categories: Windows
tags: UWP
---

UWP应用开发系列文章是本菜秀在《现代操作系统应用开发(MOSAD)》课程上的作业笔记，旨在加深自己对UWP的认识，所以可能会排版无比奇葩。当然，这里不仅仅局限于课程上学到的东西，菜秀尽力分享更多东西。如果学疏才浅的菜秀有啥错误，欢迎指正。

本文是本系列的第三篇文章，本文重点是学习利用WTS构建音乐视频播放器。

<!-- more -->

# UWP应用开发(3) 音乐视频播放器

## 应用介绍

本文要实现的应用名字叫做`SylPlayer`，支持简单的音频、视频播放。

[GitHub源码地址](https://github.com/MegaShow/college-programming/tree/master/Homework/Modern%20Operating%20System%20Application%20Development/SylPlayer)、[APPX安装包](https://github.com/MegaShow/college-programming/releases/tag/SylPlayer)

## 利用WTS构建新解决方案

上篇文章我们用了Windows Template Studio来构建解决方案，在WTS的页面创建中，提供了一个`MediaPlayer`的页面选择。本着尝试新花样的态度，果断去选择使用WTS构建新的解决方案(说不定连代码都不用打了呢？笑~)。

由于`Player`不是一个复杂的应用，所以我们项目类型选择`Blank`，设计模式选择`Code Behind`，页面新建一个`MediaPlayer`页面，然后就可以完成构建解决方案前的设置了。

## 简单的Player实现

其实当WTS构建完解决方案之后，这周的作业已经算是完成了，因为`MediaPlayer`页面基本把作业要求实现了。不过实际上WTS也没有做什么，因为本身实现就很简单，只需在页面里面加入下面的控件：

```xml
<MediaPlayerElement x:Name="mpe"
                    AutoPlay="False"
                    AreTransportControlsEnabled="True">
    <MediaPlayerElement.TransportControls>
        <MediaTransportControls IsCompact="False"/>
    </MediaPlayerElement.TransportControls>
</MediaPlayerElement>
```

`MediaPlayerElement`这个控件实际上已经将我们要做的东西全实现了。`IsCompact`这个属性定义了控件最下方是有两栏按钮还是一栏，个人觉得两栏好看很多。

## 打开文件功能

### 自定义TransportControls控件

现在我们的首要任务是给播放器添加打开文件功能，然后接下来的才方便我们测试。

我们在`MediaPlayerElement`中看到的底部的按钮和进度条，实际上是定义在`MediaPlayerElement`中的。`MediaPlayerElement`控件无法修改，我们只能自定义一个继承`MediaPlayerElement`的控件，然后使用它来实现Player。

这里参考了[Create custom transport controls](https://docs.microsoft.com/en-us/windows/uwp/design/controls-and-patterns/custom-transport-controls)一文和例子[XamlCustomMediaTransportControls](https://github.com/Microsoft/Windows-universal-samples/tree/master/Samples/XamlCustomMediaTransportControls)。

首先我们定义一个控件类，在其构造函数中设置默认Style为自定义的Style。

```csharp
namespace SylPlayer.Controls {
    public sealed class SylMediaTransportControls : MediaTransportControls {
        public SylMediaTransportControls() {
            this.DefaultStyleKey = typeof(SylMediaTransportControls);
        }
    }
}
```

然后我们定义这个Style，Style的代码太长了，是直接Copy[例子](https://github.com/Microsoft/Windows-universal-samples/blob/master/Samples/XamlCustomMediaTransportControls/cs/Themes/generic.xaml)的代码。这个例子是添加了一个Like按钮，我们通过搜索功能找到Like按钮声明的代码位置，删除之后在附近合适的位置添加文件打开的按钮。(这里发现例子中涉及到可以用代码调用的东西都用了单引号，而其他的用了双引号，感觉这种风格好奇怪)

```csharp
<AppBarButton x:Name='FileButton' Label="File" Style='{StaticResource AppBarButtonStyle}'>
    <AppBarButton.Icon>
        <FontIcon FontFamily="Segoe MDL2 Assets" Glyph="&#xEC50;"/>
    </AppBarButton.Icon>
</AppBarButton>
```

注意要记得修改Style里面的Target和在`App.xaml`中引用定义的Style。

### 给FileButton添加Click事件

首先我们需要在`SylMediaTransportControls`中定义一个事件：

```csharp
public event EventHandler<EventArgs> FileOpenClick;
```

然后重写`OnApplyTemplate`方法，将这个事件绑定到FileButton的`Click`中。

```csharp
protected override void OnApplyTemplate() {
    var fileButton = GetTemplateChild("FileButton") as Button;
    fileButton.Click += FileButton_Click;
    base.OnApplyTemplate();
}

private void FileButton_Click(object sender, RoutedEventArgs e) {
    FileOpenClick?.Invoke(this, EventArgs.Empty);
}
```

### 使用控件

我们首先在Page中定义上面我们构建的控件的命名空间为`ctrl`，然后在页面设计中使用我们自定义的控件。

```xml
<MediaPlayerElement x:Name="mpe" Grid.Row="1"
                    AutoPlay="False"
                    AreTransportControlsEnabled="True">
    <MediaPlayerElement.TransportControls>
        <ctrl:SylMediaTransportControls IsCompact="False"
                                        IsSeekBarVisible="True"
                                        IsPlaybackRateButtonVisible="True"
                                        FileOpenClick="SylMediaTransportControls_FileOpenClick"/>
    </MediaPlayerElement.TransportControls>
</MediaPlayerElement>
```

然后添加`FileOpenClick`事件：

```csharp
private async void SylMediaTransportControls_FileOpenClick(object sender, EventArgs e) {
    var openPicker = new FileOpenPicker();
    openPicker.FileTypeFilter.Add(".wmv");
    openPicker.FileTypeFilter.Add(".mp4");
    openPicker.FileTypeFilter.Add(".wma");
    openPicker.FileTypeFilter.Add(".mp3");
    StorageFile file = await openPicker.PickSingleFileAsync();
    if (file != null) {
        mpe.Source = MediaSource.CreateFromStorageFile(file);
        mpe.MediaPlayer.Play();
    }
}
```

这样，我们的播放器就有了打开文件并播放音频或视频的功能。

## Page布局

### MediaPlayerPage页面设计

首先页面分成两行：第一行是标题栏，因为我们要将亚克力扩展到标题栏上，因此我们必须声明一个`TextBlock`来填充标题栏；第二行是`MediaPlayerElement`和专辑图重叠在一起，当输出是音频的时候，显示专辑图，当输出是视频的时候，隐藏专辑图。

因此我们首先在Page的构造函数中扩展标题栏：

```csharp
public MediaPlayerPage() {
    InitializeComponent();
    CoreApplication.GetCurrentView().TitleBar.ExtendViewIntoTitleBar = true;
    ApplicationViewTitleBar titleBar = ApplicationView.GetForCurrentView().TitleBar;
    titleBar.ButtonBackgroundColor = Colors.Transparent;
    titleBar.ButtonInactiveBackgroundColor = Colors.Transparent;
}
```

对于专辑图，我们用`Ellipse`来构建两个圆形，外面一个填充黑色，里面一个存放专辑图。并且，我们需要用上`Storyboard`来实现专辑图的旋转。

```xml
<Grid Background="{ThemeResource SystemControlChromeHighAcrylicWindowMediumBrush}">
    <Grid.RowDefinitions>
        <RowDefinition Height="32"/>
        <RowDefinition Height="*"/>
    </Grid.RowDefinitions>
    <TextBlock Grid.Row="0" Text="Syl Player" Margin="10,0,0,0" VerticalAlignment="Center"/>
    <Grid x:Name="grid" Grid.Row="1" VerticalAlignment="Center" HorizontalAlignment="Center" Height="280" Width="280">
        <Grid.ColumnDefinitions>
            <ColumnDefinition Width="*"/>
            <ColumnDefinition Width="Auto"/>
            <ColumnDefinition Width="*"/>
        </Grid.ColumnDefinitions>
        <Grid.RowDefinitions>
            <RowDefinition Height="*"/>
            <RowDefinition Height="Auto"/>
            <RowDefinition Height="*"/>
        </Grid.RowDefinitions>
        <Ellipse Grid.Column="0" Grid.Row="0" Grid.ColumnSpan="3" Grid.RowSpan="3" Fill="Black"/>
        <Ellipse x:Name="picture" Grid.Column="1" Grid.Row="1" Width="200" Height="200" RenderTransformOrigin="0.5,0.5">
            <Ellipse.RenderTransform>
                <CompositeTransform/>
            </Ellipse.RenderTransform>
            <Ellipse.Fill>
                <ImageBrush x:Name="pictureImage" ImageSource="ms-appx:///Assets/music.png"/>
            </Ellipse.Fill>
            <Ellipse.Resources>
                <Storyboard x:Name="pictureRotate" RepeatBehavior="Forever">
                    <DoubleAnimation Duration="0:0:20" From="0" To="360" Storyboard.TargetProperty="(UIElement.RenderTransform).(CompositeTransform.Rotation)" Storyboard.TargetName="picture"/>
                </Storyboard>
            </Ellipse.Resources>
        </Ellipse>
    </Grid>
    <MediaPlayerElement x:Name="mpe" Grid.Row="1"
                        AutoPlay="False"
                        AreTransportControlsEnabled="True">
        <MediaPlayerElement.TransportControls>
            <ctrl:SylMediaTransportControls IsCompact="False"
                                            IsSeekBarVisible="True"
                                            IsPlaybackRateButtonVisible="True"
                                            PlayPauseClick="SylMediaTransportControls_PlayPauseClick"
                                            FileOpenClick="SylMediaTransportControls_FileOpenClick"/>
        </MediaPlayerElement.TransportControls>
    </MediaPlayerElement>
</Grid>
```

这里`SylMediaTransportControls`实现了一个叫`PlayPauseClick`的事件，跟上一节的`FileOpenClick`同样的方法实现。这个事件主要是用于设置专辑图是否需要旋转的。

```csharp
private bool _isPlay = false;

private void SylMediaTransportControls_PlayPauseClick(object sender, EventArgs e) {
    if (grid.Visibility == Windows.UI.Xaml.Visibility.Visible) {
        if (_isPlay) {
            _isPlay = false;
            pictureRotate.Pause();
        } else {
            _isPlay = true;
            pictureRotate.Resume();
        }
    }
}
```

### 缩略图读取

这里听说Zhenly大佬采用了专辑图API和歌词API，感觉把上一个作业一起做了。不过值得注意的是有些`.mp3`文件是自带专辑缩略图的，比如网易云音乐下载的音频文件。在UWP里面我们可以利用`StorageFile.GetThumbnailAsyn`来获取文件的缩略图。

```csharp
private async void SylMediaTransportControls_FileOpenClick(object sender, EventArgs e) {
    var openPicker = new FileOpenPicker();
    openPicker.FileTypeFilter.Add(".wmv");
    openPicker.FileTypeFilter.Add(".mp4");
    openPicker.FileTypeFilter.Add(".wma");
    openPicker.FileTypeFilter.Add(".mp3");
    StorageFile file = await openPicker.PickSingleFileAsync();
    if (file != null) {
        pictureRotate.Stop();
        mpe.Source = MediaSource.CreateFromStorageFile(file);
        mpe.MediaPlayer.Play();
        _isPlay = true;
        if (mpe.MediaPlayer.PlaybackSession.NaturalVideoHeight == 0) {
            grid.Visibility = Windows.UI.Xaml.Visibility.Visible;
            StorageItemThumbnail thumbnail = await file.GetThumbnailAsync(ThumbnailMode.SingleItem);
            if (thumbnail == null) {
                pictureImage.ImageSource = new BitmapImage(new Uri("ms-appx:///Assets/music.png"));
            } else {
                BitmapImage image = new BitmapImage();
                image.SetSource(thumbnail);
                pictureImage.ImageSource = image;
            }
            pictureRotate.Begin();
        } else {
            grid.Visibility = Windows.UI.Xaml.Visibility.Collapsed;
        }
    }
}
```

## 实现背景媒体播放

打开`Package.appxmanifest`，选择`功能`，勾上`背景媒体播放`。然后打开播放器，就发现最小化也有媒体声音了，异常简单。

## 结语

这次作业感觉简简单单就做完了，不过很多东西感觉都是Copy - Paste，还不是很了解。对于WTS的文件结构和各种封装，也仍需要继续学习。不过接下来也该做MOSAD的期中作业了，并且下半学期MOSAD的课程也不是学习UWP了。大概，UWP学习之路需要暂停了？

