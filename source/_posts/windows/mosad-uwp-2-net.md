---
title: Windows | UWP应用开发(2) 网络访问
date: 2018-4-24
categories: Windows
tags: UWP
---

UWP应用开发系列文章是本菜秀在《现代操作系统应用开发(MOSAD)》课程上的作业笔记，旨在加深自己对UWP的认识，所以可能会排版无比奇葩。当然，这里不仅仅局限于课程上学到的东西，菜秀尽力分享更多东西。如果学疏才浅的菜秀有啥错误，欢迎指正。

本文是本系列的第二篇文章，由于懒于写文章，距离第一次学习UWP已经经历了6周，本文重点是学习UWP的网络访问。

<!-- more -->

# UWP应用开发(2) 网络访问

## 应用介绍

本文要实现的应用名字叫做`This Is Only Bing`，要实现的是主页提供一个必应的搜索入口，一个天气获取入口，并且主页背景为必应每日一图。应用内部嵌入一个浏览器，在搜索的时候使用，其余情况均用UWP自己实现。

[GitHub源码地址](https://github.com/MegaShow/college-programming/tree/master/Homework/Modern%20Operating%20System%20Application%20Development/ThisIsOnlyBing)、[APPX安装包](https://github.com/MegaShow/college-programming/releases/tag/ThisIsOnlyBing)

## Windows Template Studio

近日(2018年4月19日)微软面向开发者人员发布了Windows Template Studio 2.0版本。这是一个UWP向导项目创建的Visual Studio 2017扩展程序，给UWP项目提供了很多向导范例项目创建，利用WTS创建的UWP项目有一个良好的文件结构和代码风格，功能异常强大。

本着学习的态度，本希(新称呼，希娃，笑~)决定开始试着使用Windows Template Studio来做接下来两周的UWP作业。

WTS是一个开源项目，其主页在[这里](https://github.com/Microsoft/WindowsTemplateStudio/)。

### WTS获取

首先我们打开Visual Studio 2017，选择`工具`-`扩展与更新`，进入`联机`-`Visual Studio Marketplace`页面，然后搜索Windows Template Studio，选择下载。

接下来就是等待WTS下载完毕和手动重启VS安装WTS。

### WTS使用

首先，我们选择新建项目，这时候你会发现在`Windows通用`里面多了一个叫`Windows Template Studio (Universal Windows)`的项目类型。选择该项目类型，输入项目名字，创建项目，然后下一步就进入WTS向导界面了。

在WTS向导界面里面，我们主要设置四类信息：项目类型、设计模式、页面、功能。其中项目类型是选择你的项目是汉堡式菜单应用还是空应用还是标签页应用。而设计模式是选择传统模式还是各种MVVM架构(包括官方架构和第三方架构实现)。页面设置提供了多种页面的模板，可以在此一次性把所有页面都新建出来。功能是提供多种功能的代码模板。

因为我们的(伪)必应应用是一个简单的小程序，所以我们不需要太花里胡哨的代码架构。这里我们项目类型选择`Blank`，设计模式选择`Code Behind`，页面分别添加`Blank`、`Web View`、`Grid`，功能只需保留`Grid`自带的`SampleData`。然后创建项目，等待漫长的包恢复过程。

## Bing页面设计

### BingPage页面

首先我们的Bing页面需要显示一个Bing的logo，和提供一个搜索入口，还有一个天气搜索入口。这里我们将Bing的logo和搜索入口设计在页面的中心，而天气搜索入口设计在下方的命令栏。

```xml
<Page
    x:Class="ThisIsOnlyBing.Views.BingPage"
    xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
    xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
    xmlns:d="http://schemas.microsoft.com/expression/blend/2008"
    xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
    Style="{StaticResource PageStyle}"
    mc:Ignorable="d">

    <Page.Background>
        <ImageBrush x:Name="background" Opacity="1" Stretch="UniformToFill"/>
    </Page.Background>
    <Grid Height="60" Margin="30,160,30,0" VerticalAlignment="Top">
        <Grid.ColumnDefinitions>
            <ColumnDefinition Width="Auto"/>
            <ColumnDefinition Width="*" MaxWidth="768"/>
        </Grid.ColumnDefinitions>
        <Image Grid.Column="0" Margin="0,0,30,0" Source="ms-appx:///Assets/bing-logo-white.png"/>
        <TextBox Grid.Column="1" Padding="12,12,12,12" FontSize="24" KeyDown="TextBox_KeyDown_Search"/>
    </Grid>
    <Page.BottomAppBar>
        <CommandBar Grid.Row="0" Grid.Column="0" Grid.ColumnSpan="2" Opacity="0.7"
                    HorizontalAlignment="Right"
                    VerticalAlignment="Top"
                    Background="{ThemeResource SystemControlBackgroundAltHighBrush}">
            <AppBarButton Label="天气" Click="AppBarButton_Click_Browser">
                <AppBarButton.Icon>
                    <FontIcon FontFamily="Segoe MDL2 Assets" Glyph="&#xE753;"/>
                </AppBarButton.Icon>
            </AppBarButton>
        </CommandBar>
    </Page.BottomAppBar>
</Page>
```

### BingPage跳转

在`TextBox`搜索框中创建`KeyDown`事件，用来监听`Enter`键，达到按下回车就搜索的功能。

```csharp
private void TextBox_KeyDown_Search(object sender, Windows.UI.Xaml.Input.KeyRoutedEventArgs e) {
    TextBox textBox = sender as TextBox;
    if (e.Key == VirtualKey.Enter && textBox.Text.Length != 0) {
        NavigationService.Frame.Navigate(typeof(BrowserPage), textBox.Text);
    }
}
```

WTS在新项目里面封装了很多工具，代码结构和风格都非常良好，很值得学习。比如说Frame的控制，就封装在了`NavigationService`类里面，回退、各种判断还有左上角的后退按钮，都已经重新实现并封装在了Service里面。不得不说，WTS目前对于我来说还是有些难理解，比如它的Page都实现了`INotifyPropertyChanged`接口，菜秀也不是很理解。

在底部的命令栏里面，我们实现了天气搜索的入口：

```csharp
private void AppBarButton_Click_Browser(object sender, Windows.UI.Xaml.RoutedEventArgs e) {
    NavigationService.Frame.Navigate(typeof(WeatherPage));
}
```

### 获取Bing每日一图

这个时候就要实现Bing的每日一图背景功能了，首先通过谷歌，我们得知了可以通过下面的链接来获取必应每日一图的信息。

```
https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1
https://www.bing.com/HPImageArchive.aspx?format=xml&idx=0&n=1
https://www.bing.com/HPImageArchive.aspx?format=rss&idx=0&n=1
```

其中，`format`是返回文本格式；`idx`是指需要获取的日期，如果是0就是当日，1就是昨日；`n`表示获取图片信息的数量，如果是0返回的信息是null，如果是1就返回一张图的信息。

首先我们利用浏览器获取到一组数据：

```json
{
    "images": [
        {
            "startdate": "20180423",
            "fullstartdate": "201804231600",
            "enddate": "20180424",
            "url": "/az/hprichbg/rb/SatelliteGlades_ZH-CN11389308210_1920x1080.jpg",
            "urlbase": "/az/hprichbg/rb/SatelliteGlades_ZH-CN11389308210",
            "copyright": "大沼泽地国家公园的卫星视图，佛罗里达州 (© Satellite Earth Art/Aurora Photos)",
            "copyrightlink": "http://www.bing.com/search?q=%E5%A4%A7%E6%B2%BC%E6%B3%BD%E5%9C%B0%E5%9B%BD%E5%AE%B6%E5%85%AC%E5%9B%AD&form=hpcapt&mkt=zh-cn",
            "quiz": "/search?q=Bing+homepage+quiz&filters=WQOskey:%22HPQuiz_20180423_SatelliteGlades%22&FORM=HPQUIZ",
            "wp": true,
            "hsh": "9926603351c94d203e7d9e7e8d7c9518",
            "drk": 1,
            "top": 1,
            "bot": 1,
            "hs": []
        }
    ],
    "tooltips": {
        "loading": "正在加载...",
        "previous": "上一个图像",
        "next": "下一个图像",
        "walle": "此图片不能下载用作壁纸。",
        "walls": "下载今日美图。仅限用作桌面壁纸。"
    }
}
```

这时候我们可以发现到`url`存储的是图片的地址，如果我们在前面加上域名`https://cn.bing.com`，会发现可以访问到具体的图片。那我们现在来编写程序获取`url`，这里首先编写处理JSON的程序。因为一直都是用`NewtonJson`，这次也不例外，所以我们首先要写一个Model。

```csharp
namespace ThisIsOnlyBing.Models {
    public class BingPicture {
        public class Image {
            public string startdate { get; set; }
            public string fullstartdate { get; set; }
            public string enddate { get; set; }
            public string url { get; set; }
            public string urlbase { get; set; }
            public string copyright { get; set; }
            public string copyrightlink { get; set; }
            public string quiz { get; set; }
            public bool wp { get; set; }
            public string hsh { get; set; }
            public int drk { get; set; }
            public int top { get; set; }
            public int bot { get; set; }
            public Object[] hs { get; set; }
        }

        public class ToolTip {
            public string loading { get; set; }
            public string previous { get; set; }
            public string next { get; set; }
            public string walle { get; set; }
            public string walls { get; set; }
        }

        public Image[] images { get; set; }
        public ToolTip tooltips { get; set; }
    }
}
```

`NewtonJson`是一个微软官方都在使用的第三方JSON库，支持C#各种类型的序列化和反序列化，功能很强大。不过也因此我一直没有去用过微软官方的JSON库，也不了解原生是怎么实现JSON解析的。

然后实现Http请求的代码：

```csharp
try {
    var httpClient = new HttpClient();
    Uri uri = new Uri("https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1");
    HttpResponseMessage httpResponse = await httpClient.GetAsync(uri);
    httpResponse.EnsureSuccessStatusCode();
    string responseBody = await httpResponse.Content.ReadAsStringAsync();
    BingPicture bingPicture = JsonConvert.DeserializeObject<BingPicture>(responseBody);
    var image = new BitmapImage(new Uri("https://cn.bing.com" + bingPicture.images[0].url));
    background.ImageSource = image;
} catch (Exception e) {
    Debug.WriteLine($"{e.ToString()}");
}
```

将上述的代码封装进函数里面，然后在页面的构造函数里面调用，之后启动程序，等待一会就会将背景加载出来了。

接下来我们不妨去看一下XML返回了什么数据：

```xml
<images>
    <image>
        <startdate>20180423</startdate>
        <fullstartdate>201804230900</fullstartdate>
        <enddate>20180424</enddate>
        <url>/az/hprichbg/rb/SatelliteGlades_ZH-CN11389308210_1366x768.jpg</url>
        <urlBase>/az/hprichbg/rb/SatelliteGlades_ZH-CN11389308210</urlBase>
        <copyright>大沼泽地国家公园的卫星视图，佛罗里达州 (© Satellite Earth Art/Aurora Photos)</copyright>
        <copyrightlink> http://www.bing.com/search?q=%E5%A4%A7%E6%B2%BC%E6%B3%BD%E5%9C%B0%E5%9B%BD%E5%AE%B6%E5%85%AC%E5%9B%AD&form=hpcapt&mkt=zh-cn</copyrightlink>
        <drk>1</drk>
        <top>1</top>
        <bot>1</bot>
        <hotspots/>
    </image>
    <tooltips>
        <loadMessage>
            <message>正在加载...</message>
        </loadMessage>
        <previousImage>
            <text>上一个图像</text>
        </previousImage>
        <nextImage>
            <text>下一个图像</text>
        </nextImage>
        <play>
            <text>播放视频</text>
        </play>
        <pause>
            <text>暂停视频</text>
        </pause>
    </tooltips>
</images>
```

也不知道是什么原因，可以看出JSON返回的是`1920*1080`的图片，而XML返回的是`1366*768`的图片。当然，这不是重点，接下来我们要从数据中找到`url`XML节点，然后获取它的`InnerText`。不过我对XML的数据操作不是很了解，下面大概用了一种很蠢的方法来实现找节点。

```csharp
try {
    var httpClient = new HttpClient();
    Uri uri = new Uri("https://www.bing.com/HPImageArchive.aspx?format=xml&idx=0&n=1");
    HttpResponseMessage httpResponse = await httpClient.GetAsync(uri);
    httpResponse.EnsureSuccessStatusCode();
    string responseBody = await httpResponse.Content.ReadAsStringAsync();
    var xml = new XmlDocument();
    xml.LoadXml(responseBody);
    XmlNode node = xml.GetElementsByTagName("url")[0];
    var image = new BitmapImage(new Uri("https://cn.bing.com" + node.InnerText));
    background.ImageSource = image;
} catch (Exception e) {
    Debug.WriteLine($"{e.ToString()}");
}
```

这里要注意的一点是，在UWP的`XmlDocument`中，没有`SelectSingleNode`这个方法，所以很多操作都显得特别蛋疼。但是在Framework等其他.NET架构中又支持这个方法，网上的教程基本都用了这个方法。

## Browser参数处理

因为用了WTS构建解决方案，`BrowserPage`的页面基本没有啥好修改的。不过在`BingPage`中，我们在页面跳转到`BrowserPage`的时候传了一个参数，即搜索的内容。我们这里需要重写`OnNavigatedTo`方法来实现对参数的处理。

```csharp
protected override void OnNavigatedTo(NavigationEventArgs e) {
    string uri = e.Parameter as string;
    if (uri.Length != 0) {
        Source = new Uri(String.Format(DefaultUrl, uri));
        IsLoading = true;
    } else {
        NavigationService.Frame.GoBack();
    }
}
```

除了重写的工作之外，我们还要修改`BrowserPage`的构造函数和成员`DefaultUrl`：

```csharp
private const string DefaultUrl = "https://cn.bing.com/search?q={0}";

public BrowserPage() {
    InitializeComponent();
}
```

## Weather页面设计

### WeatherPage页面

对于`WeatherPage`，我们只需要实现一个输入框，一个显示城市名字或结果的`TextBlock`，一个用于数据绑定的`GridView`。

```xml
<Grid>
    <Grid.RowDefinitions>
        <RowDefinition Height="Auto"/>
        <RowDefinition Height="Auto"/>
        <RowDefinition/>
    </Grid.RowDefinitions>
    <TextBox Grid.Row="0" Height="60" MaxWidth="768" TextAlignment="Center" FontSize="28" Margin="30,30,30,30" Padding="0,5,0,0" PlaceholderText="请输入城市名字, 并回车搜索" KeyDown="TextBox_KeyDown"/>
    <TextBlock x:Name="textBlock" Grid.Row="1" Height="60" FontSize="24" Text="未知地" HorizontalAlignment="Center"/>
    <GridView Grid.Row="2" ItemsSource="{x:Bind Source, Mode=OneWay}" Margin="30,30,30,30" HorizontalAlignment="Center">
        <GridView.ItemTemplate>
            <DataTemplate x:DataType="md:Weather">
                <Grid Padding="30,30,30,30" Width="240" Background="{ThemeResource SystemControlPageBackgroundChromeLowBrush}">
                    <Grid.RowDefinitions>
                        <RowDefinition Height="30"/>
                        <RowDefinition Height="30"/>
                        <RowDefinition Height="30"/>
                        <RowDefinition Height="30"/>
                    </Grid.RowDefinitions>
                    <Grid Grid.Row="0">
                        <Grid.ColumnDefinitions>
                            <ColumnDefinition Width="Auto"/>
                            <ColumnDefinition Width="*"/>
                        </Grid.ColumnDefinitions>
                        <TextBlock Grid.Column="0" Text="{x:Bind date}"/>
                        <TextBlock Grid.Column="1" Text="{x:Bind week}" HorizontalAlignment="Right"/>
                    </Grid>
                    <TextBlock Grid.Row="1" Text="{x:Bind nongli}"/>
                    <Grid Grid.Row="2">
                        <Grid.ColumnDefinitions>
                            <ColumnDefinition Width="60"/>
                            <ColumnDefinition Width="*"/>
                            <ColumnDefinition Width="*"/>
                            <ColumnDefinition Width="*"/>
                        </Grid.ColumnDefinitions>
                        <TextBlock Grid.Column="0" Text="温度："/>
                        <TextBlock Grid.Column="1" Text="{x:Bind info.night[2]}"/>
                        <TextBlock Grid.Column="2" Text="~"/>
                        <TextBlock Grid.Column="3" Text="{x:Bind info.day[2]}"/>
                    </Grid>
                    <Grid Grid.Row="3">
                        <Grid.ColumnDefinitions>
                            <ColumnDefinition Width="60"/>
                            <ColumnDefinition Width="*"/>
                        </Grid.ColumnDefinitions>
                        <TextBlock Grid.Column="0" Text="天气："/>
                        <TextBlock Grid.Column="1" Text="{x:Bind info.day[1]}"/>
                    </Grid>
                </Grid>
            </DataTemplate>
        </GridView.ItemTemplate>
    </GridView>
</Grid>
```

这里涉及到交互的只有输入框一个地方，和上面的搜索框一样，我们用`KeyDown`方式实现监听：

```csharp
private void TextBox_KeyDown(object sender, Windows.UI.Xaml.Input.KeyRoutedEventArgs e) {
    TextBox textBox = sender as TextBox;
    if (e.Key == VirtualKey.Enter && textBox.Text.Length != 0) {
        GetWeatherInfo(textBox.Text);
        textBox.Text = String.Empty;
    }
}
```

这里的`GetWeatherInfo`就是我们后面要实现的通过城市地名获取天气的方法了。

### 阿凡达天气数据获取

这里我用了[阿凡达数据](https://avatardata.cn/)，不过这不是安利，这玩意实在太蛋疼了，给的api接口返回的数据还和文档的不一致。

首先我们需要定义一个天气数据的Model，不过这里使用了大量的`Object`，因为有些数据我们不需要的，只需要让`NewtonJson`解析成`Object`，然后我们不去使用它。

```csharp
namespace ThisIsOnlyBing.Models {
    public class WeatherInfo {
        public class Result {
            public Object realtime { get; set; }
            public Object life { get; set; }
            public Weather[] weather { get; set; }
            public Object pm25 { get; set; }
            public Object isForeign { get; set; }

        }

        public Result result { get; set; }
        public int error_code { get; set; }
        public string reason { get; set; }
    }

    public class Weather {
        public class Info {
            public string[] dawn { get; set; }
            public string[] day { get; set; }
            public string[] night { get; set; }
        }

        public string date { get; set; }
        public string week { get; set; }
        public string nongli { get; set; }
        public Info info { get; set; }
    }
}
```

至于ViewModel，我们这样编写：

```csharp
namespace ThisIsOnlyBing.Services {
    public static class WeatherDataService {
        public static WeatherInfo WeatherInfo { get; set; }
        public static ObservableCollection<Weather> Data = new ObservableCollection<Weather>();

        public static void UpdateData() {
            Data.Clear();
            foreach (Weather item in WeatherInfo.result.weather) {
                Data.Add(item);
            }
        }
    }
}
```

在`WeatherPage.xaml.cs`中，我们定义一个方法做简单的数据更新处理：

```csharp
private void UpdateData(string city) {
    WeatherDataService.UpdateData();
    if (Source.Count == 0) {
        textBlock.Text = $"找不到 \"{city}\" 的信息";
    } else {
        textBlock.Text = city;
    }
}
```

然后编写获取JSON数据、获取XML数据和解析的代码：

```csharp
try {
    var httpClient = new HttpClient();
    Uri uri = new Uri("http://api.avatardata.cn/Weather/Query?key=" + apiKey + "&cityname=" + city);
    HttpResponseMessage httpResponse = await httpClient.GetAsync(uri);
    httpResponse.EnsureSuccessStatusCode();
    string responseBody = await httpResponse.Content.ReadAsStringAsync();
    WeatherDataService.WeatherInfo = JsonConvert.DeserializeObject<WeatherInfo>(responseBody);
} catch (Exception e) {
    Debug.WriteLine($"{e.ToString()}");
}
UpdateData(city);
```

```csharp
try {
    var httpClient = new HttpClient();
    Uri uri = new Uri("http://api.avatardata.cn/Weather/Query?dtype=xml&key=" + apiKey + "&cityname=" + city);
    HttpResponseMessage httpResponse = await httpClient.GetAsync(uri);
    httpResponse.EnsureSuccessStatusCode();
    string responseBody = await httpResponse.Content.ReadAsStringAsync();
    var xml = new XmlDocument();
    xml.LoadXml(responseBody);
    XmlNodeList nodeList = xml.GetElementsByTagName("WeatherDetailObj");
    WeatherDataService.WeatherInfo = new WeatherInfo();
    WeatherDataService.WeatherInfo.result = new WeatherInfo.Result();
    WeatherDataService.WeatherInfo.result.weather = new Weather[nodeList.Count];
    for (int i = 0; i < nodeList.Count; i++) {
        WeatherDataService.WeatherInfo.result.weather[i] = new Weather();
        foreach (XmlNode node in nodeList[i].ChildNodes) {
            switch (node.Name) {
                case "date":
                    WeatherDataService.WeatherInfo.result.weather[i].date = node.InnerText;
                    break;
                case "week":
                    WeatherDataService.WeatherInfo.result.weather[i].week = node.InnerText;
                    break;
                case "nongli":
                    WeatherDataService.WeatherInfo.result.weather[i].nongli = node.InnerText;
                    break;
                case "info":
                    WeatherDataService.WeatherInfo.result.weather[i].info = new Weather.Info();
                    XmlNodeList info = node.ChildNodes;
                    foreach (XmlNode infoNode in info) {
                        if (infoNode.Name == "day") {
                            WeatherDataService.WeatherInfo.result.weather[i].info.day = new string[6];
                            WeatherDataService.WeatherInfo.result.weather[i].info.day[1] = infoNode.ChildNodes[1].InnerText;
                            WeatherDataService.WeatherInfo.result.weather[i].info.day[2] = infoNode.ChildNodes[2].InnerText;
                        } else if (infoNode.Name == "night") {
                            WeatherDataService.WeatherInfo.result.weather[i].info.night = new string[6];
                            WeatherDataService.WeatherInfo.result.weather[i].info.night[2] = infoNode.ChildNodes[2].InnerText;
                        }
                    }
                    break;
                default:
                    break;
            }
        }
    }
} catch (Exception e) {
    Debug.WriteLine($"{e.ToString()}");
}
UpdateData(city);
```

这里写的XML解析真的写的很累，本菜秀又不知道有啥好的写法，感觉XML比JSON蛋疼好多。不过听说XML是可以和Linq直接互相转换的，下次有空可以研究一下。

## 结语

至此，一个简单的`This is only Bing`应用就写完了。

