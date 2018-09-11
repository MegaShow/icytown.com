---
title: Windows | UWP应用开发(4) 音乐视频播放器2
date: 2018-4-30
categories: Windows
tags: UWP
---

UWP应用开发系列文章是本菜秀在《现代操作系统应用开发(MOSAD)》课程上的作业笔记，旨在加深自己对UWP的认识，所以可能会排版无比奇葩。当然，这里不仅仅局限于课程上学到的东西，菜秀尽力分享更多东西。如果学疏才浅的菜秀有啥错误，欢迎指正。

本文是本系列的第四篇文章，本文重点是学习利用WTS构建音乐视频播放器。

<!-- more -->

# UWP应用开发(4) 音乐视频播放器2

## 应用介绍

本文要实现的应用名字叫做`SylPlayer`，支持简单的音频、视频播放。与上一篇文章的区别是，本文中的播放器不能使用`TransportControls`。(其实是本秀把作业做完了才知道有这个要求)。

本次应用在上一篇文章的应用项目上修改，添加了页面`BadMediaPlayerPage`，该页面在`MediaPlayerPage`的基础上修改。

[GitHub源码地址](https://github.com/MegaShow/college-programming/tree/master/Homework/Modern%20Operating%20System%20Application%20Development/SylPlayer)、[APPX安装包](https://github.com/MegaShow/college-programming/releases/tag/SylPlayer2)

## 复制代码

首先我们创建一个新的页面`BadMediaPlayerPage`，将`MediaPlayerPage`的代码和样式文件都复制过来，然后删除我们添加的一些方法、样式，把原有的`TransportControls`相关的代码都删除掉。

这里需要修改`App.xaml.cs`中的初始导航页面：

```csharp
private ActivationService CreateActivationService() {
    return new ActivationService(this, typeof(Views.BadMediaPlayerPage));
}
```

## BadMediaPlayer页面设计

因为我们不能用`TransportControls`，我们要自己设计一个类似的页面。这里还是仿照`TransportControls`进行设计，并且在代码上参考了`TransportControls`的一些做法。

首先我们需要将Controls部分分成三行，第一行为Slider，第二行显示时间，第三行放各种按钮。

```xml
<Grid Grid.Row="2" Height="96" Opacity="0.8">
    <Grid.RowDefinitions>
        <RowDefinition Height="33"/>
        <RowDefinition Height="15"/>
        <RowDefinition Height="48"/>
    </Grid.RowDefinitions>
    <Slider x:Name="PositionSlider" Grid.Row="0" Margin="10,0,10,0" Minimum="0" Maximum="0" VerticalAlignment="Bottom" ValueChanged="Slider_ValueChanged"/>
    <Grid Grid.Row="1" Margin="10,0,10,0">
        <!-- Time Text -->
    </Grid>
    <Grid Grid.Row="2">
        <!-- Appbar -->
    </Grid>
</Grid>
```

这里我们假定`Slider`的基本单位是秒，方便我们传递值，不过这里初始化`Maximum`为0，在音频、视频播放的时候再修改这个值。

对于显示时间，我们只需要定义两个`TextBlock`。

```xml
<Grid Grid.Row="1" Margin="10,0,10,0">
    <Grid.ColumnDefinitions>
        <ColumnDefinition/>
        <ColumnDefinition/>
    </Grid.ColumnDefinitions>
    <TextBlock x:Name="leftTime" Grid.Column="0" Text="0:00:00" FontSize="12" HorizontalAlignment="Left"/>
    <TextBlock x:Name="rightTime" Grid.Column="1" Text="0:00:00" FontSize="12" HorizontalAlignment="Right"/>
</Grid>
```

而在按钮命令栏上，就略复杂。在官方的`TransportControls`中，是利用`CommandBar`来构建有多个按钮的命令栏的。但是当我使用`CommandBar`的时候，没有办法将部分按钮靠左或者居中。虽然可以将按钮放在`Content`里面达到靠左的效果，但是总感觉怪怪的，所以没有用`CommandBar`，而是利用了`Grid`和`StackPanel`来实现。

```xml
<Grid Grid.Row="2">
    <Grid.Resources>
        <Style x:Key="FlyoutStyle" TargetType="FlyoutPresenter">
            <Setter Property="Background" Value="{ThemeResource SystemControlPageBackgroundMediumAltMediumBrush}"/>
        </Style>
    </Grid.Resources>
    <Grid.ColumnDefinitions>
        <ColumnDefinition/>
        <ColumnDefinition/>
        <ColumnDefinition/>
    </Grid.ColumnDefinitions>
    <StackPanel Grid.Column="0" Orientation="Horizontal" HorizontalAlignment="Left">
        <AppBarButton x:Name="VolumeMuteButton" Icon="Volume" Width="48" HorizontalAlignment="Left">
            <AppBarButton.Flyout>
                <Flyout FlyoutPresenterStyle="{StaticResource FlyoutStyle}">
                    <StackPanel Orientation="Horizontal" Height="48" Margin="0">
                        <AppBarButton x:Name="AudioMuteButton" Icon="Volume" Width="48" Click="AudioMuteButton_Click"/>
                        <Slider x:Name="VolumeSlider" Value="{x:Bind volume, Mode=TwoWay}" ValueChanged="VolumeSlider_ValueChanged"  Margin="10,5,0,10" Width="180" VerticalAlignment="Center" HorizontalAlignment="Center"/>
                        <TextBlock Text="{Binding ElementName=VolumeSlider, Path=Value}" TextAlignment="Center" Width="30" VerticalAlignment="Center" HorizontalAlignment="Center"/>
                    </StackPanel>
                </Flyout>
            </AppBarButton.Flyout>
        </AppBarButton>
    </StackPanel>
    <StackPanel Grid.Column="1" Orientation="Horizontal" HorizontalAlignment="Center">
        <AppBarButton x:Name="StopButton" Icon="Stop" Width="48" IsEnabled="False" Click="StopButton_Click"/>
        <AppBarButton x:Name="PlayPauseButton" Icon="Play" Width="48" IsEnabled="False" Click="PlayPauseButton_Click"/>
    </StackPanel>
    <StackPanel Grid.Column="2" Orientation="Horizontal" HorizontalAlignment="Right">
        <AppBarButton x:Name="FileOpenButton" Width="48" Click="FileOpenButton_Click">
            <AppBarButton.Icon>
                <FontIcon FontFamily="Segoe MDL2 Assets" Glyph="&#xEC50;"/>
            </AppBarButton.Icon>
        </AppBarButton>
        <AppBarButton x:Name="FullWindowButton" Icon="FullScreen" Width="48" Click="FullWindowButton_Click"/>
    </StackPanel>
</Grid>
```

可以看到，对于第一个音量按钮，这里声明了它的`Flyout`属性。这个是用来实现类似弹出框的功能的属性，我们利用它来实现音量设置框的弹出。(`Flyout`跟`Dialog`不一样)

```xml
<Flyout FlyoutPresenterStyle="{StaticResource FlyoutStyle}">
    <StackPanel Orientation="Horizontal" Height="48" Margin="0">
        <AppBarButton x:Name="AudioMuteButton" Icon="Volume" Width="48" Click="AudioMuteButton_Click"/>
        <Slider x:Name="VolumeSlider" Value="{x:Bind volume, Mode=TwoWay}" ValueChanged="VolumeSlider_ValueChanged"  Margin="10,5,0,10" Width="180" VerticalAlignment="Center" HorizontalAlignment="Center"/>
        <TextBlock Text="{Binding ElementName=VolumeSlider, Path=Value}" TextAlignment="Center" Width="30" VerticalAlignment="Center" HorizontalAlignment="Center"/>
    </StackPanel>
</Flyout>
```

这里利用`Flyout`定义了音量设置界面，这部分代码参考了UWP官方范例`CustomTransportControls`的代码，所以实现的样子跟原生的样式类似。

## 代码实现

### 打开文件功能

打开文件、选择文件的功能实现代码跟上篇文章的`SylMediaTransportControls_FileOpenClick`方法的代码几乎一样，唯一的区别估计就是28-30行这里需要手动修改按钮的Icon和是否可用属性。

```csharp
private async void FileOpenButton_Click(object sender, RoutedEventArgs e) {
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
        _isStop = false;
        if (mpe.MediaPlayer.PlaybackSession.NaturalVideoHeight == 0) {
            grid.Visibility = Visibility.Visible;
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
            grid.Visibility = Visibility.Collapsed;
        }
        PlayPauseButton.Icon = new SymbolIcon(Symbol.Pause);
        PlayPauseButton.IsEnabled = true;
        StopButton.IsEnabled = true;
    }
}
```

### 播放、暂停、停止功能

播放、暂停、停止这些功能都需要我们自己实现，其实这部分的代码在上篇文章中几乎都有，我们只需要对上篇文章我们定义的几个事件方法进行简单的修改就可以实现播放、暂停和停止功能了。

```csharp
private void PlayPauseButton_Click(object sender, RoutedEventArgs e) {
    if (_isStop == true) {
        PlayPauseButton.Icon = new SymbolIcon(Symbol.Pause);
        StopButton.IsEnabled = true;
        _isStop = false;
        _isPlay = true;
        mpe.MediaPlayer.Play();
        if (grid.Visibility == Visibility.Visible) {
            pictureRotate.Begin();
        }
    } else if (_isPlay == true) {
        PlayPauseButton.Icon = new SymbolIcon(Symbol.Play);
        _isPlay = false;
        mpe.MediaPlayer.Pause();
        if (grid.Visibility == Visibility.Visible) {
            pictureRotate.Pause();
        }
    } else if (_isPlay == false) {
        PlayPauseButton.Icon = new SymbolIcon(Symbol.Pause);
        _isPlay = true;
        mpe.MediaPlayer.Play();
        if (grid.Visibility == Visibility.Visible) {
            pictureRotate.Resume();
        }
    }
}

private void StopButton_Click(object sender, RoutedEventArgs e) {
    PlayPauseButton.Icon = new SymbolIcon(Symbol.Play);
    StopButton.IsEnabled = false;
    _isStop = true;
    _isPlay = false;
    mpe.MediaPlayer.Pause();
    mpe.MediaPlayer.PlaybackSession.Position = new TimeSpan(0);
    if (grid.Visibility == Visibility.Visible) {
        pictureRotate.Stop();
    }
    if (grid.Visibility == Visibility.Visible) {
        pictureRotate.Stop();
    }
}
```

在上述两个方法中，我们修改的只有对`mpe.MediaPlayer`的方法调用和一些`AppbarButton`的`Icon`修改。

### 音量修改功能

首先，我们可以将音量滑块对应的`Value`进行数据绑定。

```xml
<Slider x:Name="VolumeSlider" Value="{x:Bind volume, Mode=TwoWay}"/>
```

对于`BadMediaPlayerPage`页面，我们定义了下列的成员：

```csharp
private double oldVolume = 0;
private double volume {
    get { return mpe.MediaPlayer.Volume * 100; }
    set { mpe.MediaPlayer.Volume = value / 100; }
}
```

因为`MediaPlayer.Volume`的取值范围是`[0, 1]`，而对应滑块是`[0, 100]`，所以我们在绑定的时候要对数据进行处理。`oldVolume`是记录上一个稳定的音量值，用来直接点击音量键静音时恢复音量值用的。

我们定义了三个方法，用来支持音量修改，前两个是点击静音键、滑块值修改的事件方法。这里值得要注意的是点击静音键后，需要手动表明属性`volume`的值发生变化(我也很绝望)。

```csharp
private void AudioMuteButton_Click(object sender, RoutedEventArgs e) {
    if (volume == 0) {
        volume = oldVolume;
    } else {
        oldVolume = volume;
        volume = 0;
    }
    UpdateVolumeIcon();
    OnPropertyChanged("volume");
}

private void VolumeSlider_ValueChanged(object sender, Windows.UI.Xaml.Controls.Primitives.RangeBaseValueChangedEventArgs e) {
    UpdateVolumeIcon();
}

private void UpdateVolumeIcon() {
    if (VolumeSlider.Value == 0) {
        AudioMuteButton.Icon = new SymbolIcon(Symbol.Mute);
        VolumeMuteButton.Icon = new SymbolIcon(Symbol.Mute);
    } else {
        AudioMuteButton.Icon = new SymbolIcon(Symbol.Volume);
        VolumeMuteButton.Icon = new SymbolIcon(Symbol.Volume);
    }
}
```

### 进度条功能

进度条功能的实现是最蛋疼的，我本来打算是按照上面的音量条的方法实现，即数据绑定。但是数据绑定之后，不是数据绑定失效，就是各种数据绑定两个变量相互循环赋值的问题(大概我太菜了)。在Zhenly大佬的提示下，才发现官方的教程上，重点提示了**应该避免对`Position`使用数据绑定**，而应该是**采用`DispatcherTimer`来请求`Position`**。

首先我们在构造函数里面创建一个`DispatcherTimer`，其调用时间间距设为1秒。

```csharp
DispatcherTimer dispatcher;
dispatcher = new DispatcherTimer();
dispatcher.Interval = new TimeSpan(0, 0, 1);
dispatcher.Tick += PositionChanged;
```

在调用的方法里面，我们要做的自然是更新滑块的`Value`和两个`TextBlock`显示的时间。

```csharp
private void PositionChanged(object sender, object e) {
    TimeSpan timeSpanLeft = mpe.MediaPlayer.PlaybackSession.Position;
    TimeSpan timeSpanRight = mpe.MediaPlayer.PlaybackSession.NaturalDuration - timeSpanLeft;
    leftTime.Text = timeSpanLeft.ToString(@"hh\:mm\:ss");
    rightTime.Text = timeSpanRight.ToString(@"hh\:mm\:ss");
    PositionSlider.Value = mpe.MediaPlayer.PlaybackSession.Position.TotalSeconds;
}
```

那么这个`DispatcherTimer`在哪启用呢？又在哪关闭呢？还有我们之前需要设置的`Slider.Maximum`又在哪计算其值呢？

这里需要用上`MediaPlayer.MediaOpened`和`MediaPlayer.MediaEnded`两个事件来解决上述的问题，但是如果我们简单地把代码放在上面，执行程序地时候又会发现应用因为UI线程的问题崩溃了。这里需要用到异步方法执行，具体的代码是参考了WTS生成的Page里面自带的方法`PlaybackSession_PlaybackStateChanged`。

```csharp
private async void MediaOpened(MediaPlayer sender, object args) {
    await Dispatcher.RunAsync(CoreDispatcherPriority.Normal, () => {
        PositionSlider.Maximum = mpe.MediaPlayer.PlaybackSession.NaturalDuration.TotalSeconds;
        dispatcher.Start();
    });
}

private async void MediaEnded(MediaPlayer sender, object args) {
    await Dispatcher.RunAsync(CoreDispatcherPriority.Normal, () => {
        dispatcher.Stop();
        leftTime.Text = "0:00:00";
        rightTime.Text = "0:00:00";
        PositionSlider.Value = 0;
        _isPlay = false;
        _isStop = true;
        PlayPauseButton.Icon = new SymbolIcon(Symbol.Play);
        StopButton.IsEnabled = false;
        if (grid.Visibility == Visibility.Visible) {
            pictureRotate.Stop();
        }
    });
}
```

在构造函数里面：

```csharp
mpe.MediaPlayer.MediaOpened += MediaOpened;
mpe.MediaPlayer.MediaEnded += MediaEnded;
```

### 全屏功能

其实可以忽视4、7行。

```csharp
private void FullWindowButton_Click(object sender, RoutedEventArgs e) {
    if (ApplicationView.GetForCurrentView().IsFullScreenMode) {
        ApplicationView.GetForCurrentView().ExitFullScreenMode();
        titleRow.Height = new GridLength(32);
    } else {
        ApplicationView.GetForCurrentView().TryEnterFullScreenMode();
        titleRow.Height = new GridLength(0);
    }
}
```

本来还想做`TransportControls`的隐藏的，不过本菜秀实在是太懒了，然后就把功能割了。

## 结语

这次是真的结束了UWP的课程，不过即使做完期中作业，也还是要接触的UWP的。前些日子打`SylGL`的时候，打了两天，打出一堆BUG，感觉还不如直接打UI界面了。然后就愉快的把`SylGL.CLI`砍了，愉快的准备动工`SylGL.UWP`。所以，继续努力吧~加油！SylvaX~

