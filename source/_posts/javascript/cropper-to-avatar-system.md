---
title: JavaScript | Cropper制作头像系统(前端)
date: 2017-9-6
categories: JavaScript
tags: JQuery
---

最近开发Violet的时候，需要上线一个头像系统，搜索之后发现有个叫[Cropper](https://github.com/fengyuanchen/cropper)的jQuery裁剪插件。然后几经使用之后，又发现它的脱离jQuery版本[Cropper.JS](https://github.com/fengyuanchen/cropperjs)。虽然官方推荐使用Cropper.JS，但是为了方便一点我还是决定先尝试Cropper，毕竟原项目使用了jQuery。

<!-- more -->

## Cropper引入

```html
<link href="https://cdn.bootcss.com/cropper/3.0.0/cropper.min.css" rel="stylesheet">
<script src="https://cdn.bootcss.com/jquery/3.2.1/jquery.min.js"></script>
<script src="https://cdn.bootcss.com/cropper/3.0.0/cropper.min.js"></script>
```

然后在body里面添加下面样式：

```html
<div>
  <img id="image" style="max-width:100%;">
</div>
```

在script里面添加下面JavaScript代码：

```javascript
$('#image').cropper({
  aspectRatio: 16 / 9,
  crop: function(e) {
    // Output the result data for cropping image.
    console.log(e.x);
    console.log(e.y);
    console.log(e.width);
    console.log(e.height);
    console.log(e.rotate);
    console.log(e.scaleX);
    console.log(e.scaleY);
  }
});
```

然后打开该html文件，就可以看到一个简单的裁剪框的出现。

## Cropper属性

### viewMode

视图模式，默认值：0

* 0：没有限制。
* 1：限制裁剪框在图片范围内。
* 2：限制裁剪框在图片范围内，并且图片缩放限制在视图框内。
* 3：限制裁剪框在图片范围内，图片用填充的方式布满视图框。

### dragMode

鼠标左键点击事件模式，默认值：'crop'

* 'crop'：创建一个新的裁剪框。
* 'move'：移动画布(图片)。
* 'none'：不做任何事。

### aspectRatio

裁剪框的固定比例，默认值：NaN

* NaN：裁剪框比例不固定。
* 16 / 9：显然。


## Cropper实现头像系统前端

```html
<!doctype html>

<html>

<head>
  <title>Cropper</title>
  <link href="https://cdn.bootcss.com/cropper/3.0.0/cropper.min.css" rel="stylesheet">
</head>

<body>
  <div>
    <img id="image" style="max-width:100%;">
  </div>
  <input id="pic" value="picture" type="file">
  <button onclick="open()">打开图片</button>
  <button onclick="crop()">剪裁</button>
  <script src="https://cdn.bootcss.com/jquery/3.2.1/jquery.min.js"></script>
  <script src="https://cdn.bootcss.com/cropper/3.0.0/cropper.min.js"></script>
  <script>
    let option = {
      viewMode: 2,
      dragMode: 'crop',
      aspectRatio: 1 / 1,
    };
    let URL = window.URL || window.webkitURL;

    function open() {
      let arr = document.getElementById('pic').files;
      if (arr.length == 0) {
        return 0;
      }
      let uploadedImageURL = URL.createObjectURL(arr[0]);
      $('#image').cropper('destroy').attr('src', uploadedImageURL).cropper(option);
    }

    function crop() {
      let val = $('#image').cropper('getCroppedCanvas', { width: 256, height: 256 });
      $('#image').cropper('destroy').attr('src', val.toDataURL()).cropper(option);
    }

    $(function (){
      $('#image').cropper(option);
    });
  </script>
</body>

</html>
```

前端的简单的裁剪就实现了，然后弄个button提交画布的`DataURL`到后台，后台储存，就可以做好头像系统了。

---

突然觉得自己好水啊~
