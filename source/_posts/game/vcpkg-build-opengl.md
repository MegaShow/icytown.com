---
title: Game | 使用Vcpkg来构建OpenGL项目
date: 2019-5-2
categories: Game and Computer Graphics
tags:
- OpenGL
- Vcpkg
- CMake
---

开发OpenGL项目的时候，通常需要导入GLFW、GLAD、GLM等各种各样的库，个人不喜欢将它们放置在项目仓库中，放置在项目外又会遇到不同设备环境不同的配置问题。像NodeJS具有NPM，Ruby具有Gems，Golang也可以通过Go Modules来对第三方库进行管理，而C/C++有这样的工具么？

答案是肯定的，Vcpkg是微软旗下开源的跨平台C/C++库管理工具，通过CMake来管理库。接下来我们尝试使用Vcpkg来构建OpenGL项目。

<!-- more -->

## 安装Vcpkg

Vcpkg并不像NPM一样，给每个项目提供存放第三方库源码的目录，而是类似Golang一样，每台设备仅有一份源码。但是Vcpkg本身并不提供构建脚本，而是通过CMake来实现构建。

Vcpkg是一个开源项目，其源码仓库位于[GitHub](https://github.com/Microsoft/vcpkg)。

本文所依赖的环境如下：

* Windows (Vcpkg也支持Linux和macOS，不过本文所有命令均在PowerShell上执行)
* Visual Studio 2019
* Git
* CMake
* Python 3

首先，我们先下载Vcpkg。

```
$ git clone https://github.com/Microsoft/vcpkg.git
```

然后编译安装Vcpkg。

```
$ cd vcpkg
$ .\bootstrap-vcpkg.bat
```

接下来需要在管理员权限下整合Vcpkg。

```
$ .\vcpkg integrate install --triplet x64-windows
```

这时候，Vcpkg会提示只需要在CMake的命令上添加参数`-DCMAKE_TOOLCHAIN_FILE=[vcpkg root]\scripts\buildsystems\vcpkg.cmake`即可使用安装的第三方库。

## 创建CMake项目

前面我们提及本文所依赖的环境有Visual Studio，使用VS的其中一个原因是Vcpkg的编译安装需要VS工具链，另一个原因是现在Visual Studio已经支持安装CMake工具，使用CMake开发了。(Visual Studio 2017以上)

首先我们打开Visual Studio，选择新建一个CMake C++项目。Visual Studio的CMake项目模板包含了三个文件，分别是`CMakeLists.txt`、`[Source].cpp`、`[Source].h`。

打开`CMakeLists.txt`，里面定义了CMake所需要的最低版本以及可执行文件的相关源码文件。

```cmake
# CMakeList.txt: OpenGL 的 CMake 项目，在此处包括源代码并定义
# 项目特定的逻辑。
#
cmake_minimum_required (VERSION 3.8)

# 将源代码添加到此项目的可执行文件。
add_executable (OpenGL "OpenGL.cpp" "OpenGL.h")
```

我们只需在Visual Studio中选中`CMakeLists.txt`，将其作为启动项执行，Visual Studio将会构建CMake Cache，并且会构建二进制文件并执行。

当然，作为一名CMake新手，我应该也学习一下如何使用命令行来构建CMake项目。

接下来我们打开PowerShell，将当前目录切换为`CMakeLists.txt`所在的目录，构建CMake Cache。

```
$ cmake -B ./build
```

以上的命令中，CMake将自动寻找合适的构建系统和合适的编译器。本人在上述命令中选中的构建系统是Viusal Studio 16 2019，当然，我们可以自己指定构建系统。

```
$ cmake -G Ninja -B ./build
```

不要问什么是Ninja，也不要问为什么是Ninja，因为Visual Studio的CMake项目默认使用的就是这个构建系统，而不是VS本身。

构建完Cache之后就可以Build了。(这里Build的是使用Ninja构建系统生成的Cache)

```
$ cmake --build ./build
```

然后就可以运行VS默认的HelloWorld代码了。

```
$ ./build/OpenGL.exe
Hello CMake。
```

## 安装GLFW、GLAD、GLM

学习了一下CMake的使用之后，就要正式开始我们的工作，使用Vcpkg安装GLFW、GLAD、GLM，并在CMake项目中使用它们。

为了方便起见，我们首先将Vcpkg所在的目录加入到环境变量PATH中。

通过`search`命令可以搜索Vcpkg所支持的第三方库。

```
n$ vcpkg search glfw
glfw3                3.3              GLFW is a free, Open Source, multi-platform library for OpenGL, OpenGL ES and ...
magnum[glfwapplication]               GlfwApplication library
```

搜索的结果告诉我们，并不存在`glfw`这个库，而应该是`glfw3`。

接下来先安装`glfw3`试试水。

```
$ vcpkg install glfw3
```

如果是第一次尝试安装库，Vcpkg会寻找本地的Git、7Zip、NuGet，并且对这些工具有一定的版本要求。如果本地没有这些工具或者版本过低，Vcpkg会自动下载便携版的工具，存放到Vcpkg的安装目录下。

需要注意的是，NuGet需要带有英文语言包的Visual Studio的支持，因此如果提示了警告，请通过VS的安装程序安装英文语言包，然后再安装第三方库。

安装完GLFW，可以通过`list`查看Vcpkg本地的库。

```
$ vcpkg list
```

当然，我们会发现安装的GLFW居然是x86版本，这怎么能忍。通过`help triplet`可以查看Vcpkg支持的版本，通过`:target`可以指定安装的版本。

```
$ vcpkg help triplet
$ vcpkg install glfw3:x64-windows
```

接下来安装一下GLAD、GLM，安装GLAD需要Python3的支持。

```
$ vcpkg install glad:x64-windows glm:x64-windows
```

如果之前接触GLAD，必然知道GLAD是通过一个生成器来生成代码的，不同的参数生成的源码不一样。可是我们好像安装GLAD并没有指定什么参数，不知道Vcpkg给我们提供的源码是Core版本还是Compatibility版本，也不知道OpenGL的版本是多少。

实际上Vcpkg的预构建的规则是编写在`ports/[package_name]/portfile.cmake`文件中，我们通过`edit`命令可以编辑它。

```
$ vcpkg edit glad
```

可以发现GLAD默认生成的是Compatibitlity版本，而我们需要的是Core版本，因此我们可以修改GLAD的构建参数，具体参数内容可以看GLAD官方的[CMakeLists.txt](https://github.com/Dav1dde/glad/blob/master/CMakeLists.txt)。

```cmake
vcpkg_configure_cmake(
    SOURCE_PATH ${SOURCE_PATH}
    PREFER_NINJA
    OPTIONS
        -DGLAD_NO_LOADER=OFF
        -DGLAD_EXPORT=OFF
        -DGLAD_INSTALL=ON
        -DGLAD_REPRODUCIBLE=ON
        -DGLAD_SPEC="gl" # {gl,egl,glx,wgl}
        -DGLAD_PROFILE="core" # {core,compatibility}
        -DGLAD_API="gl=4.6"
    OPTIONS_DEBUG
        -DGLAD_GENERATOR="c-debug"
)
```

接下来重新构建GLAD。

```
$ vcpkg build glad:x64-windows
```

我们通过查看`packages/glad_x64-windows`目录下的`glad.h`文件即可知道修改是否成功。

## 运行OpenGL程序

安装好GLFW、GLAD、GLM，就要试一下这些库是否能正常使用了。

首先，我们往项目的`CMakeLists.txt`文件中添加以下的配置。

```cmake
# CMakeList.txt: OpenGL 的 CMake 项目，在此处包括源代码并定义
# 项目特定的逻辑。
#
cmake_minimum_required(VERSION 3.8)

if (DEFINED ENV{VCPKG_ROOT} AND NOT DEFINED CMAKE_TOOLCHAIN_FILE)
    set(CMAKE_TOOLCHAIN_FILE "$ENV{VCPKG_ROOT}/scripts/buildsystems/vcpkg.cmake" CACHE STRING "")
endif()
if (DEFINED ENV{VCPKG_DEFAULT_TRIPLET} AND NOT DEFINED VCPKG_TARGET_TRIPLET)
    set(VCPKG_TARGET_TRIPLET "$ENV{VCPKG_DEFAULT_TRIPLET}")
endif()

project(OpenGL)

message("CMAKE_TOOLCHAIN_FILE=${CMAKE_TOOLCHAIN_FILE}")

find_package(glad REQUIRED)
find_package(glfw3 REQUIRED)
find_package(glm REQUIRED)

# 将源代码添加到此项目的可执行文件。
add_executable(OpenGL "OpenGL.cpp")

target_link_libraries(OpenGL PRIVATE glad::glad)
target_link_libraries(OpenGL PRIVATE glfw)
target_link_libraries(OpenGL PRIVATE glm)
```

然后Visual Studio就会将这些库指定的源文件、头文件目录添加到项目的源文件和头文件目录列表中，这样就可以正常引入头文件了。

```cpp
#include <iostream>

#include <glad/glad.h>
#include <GLFW/glfw3.h>
#include <glm/glm.hpp>

int main() {
    glfwInit();
    glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 4);
    glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 5);
    glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);

    GLFWwindow* window = glfwCreateWindow(800, 600, "OpenGL", NULL, NULL);
    if (window == NULL) {
        std::cout << "Failed to create GLFW window" << std::endl;
        glfwTerminate();
        return -1;
    }
    glfwMakeContextCurrent(window);
    glfwSwapInterval(1); // V-Sync

    if (!gladLoadGL()) {
        std::cout << "Failed to initialize GLAD" << std::endl;
        glfwTerminate();
        return -1;
    }
    std::cout << "OpenGL Version: " << glGetString(GL_VERSION) << std::endl;

    while (!glfwWindowShouldClose(window)) {
        glfwPollEvents();

        glClearColor(0.2f, 0.3f, 0.3f, 1.0f);
        glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

        int display_w, display_h;
        glfwMakeContextCurrent(window);
        glfwSwapBuffers(window);
        glfwGetFramebufferSize(window, &display_w, &display_h);
        glViewport(0, 0, display_w, display_h);
    }

    glfwDestroyWindow(window);
    glfwTerminate();
}
```

我们编写一个简单的C++源文件，这个程序通过GLAD加载OpenGL API，并且使用GLFW来创建一个窗体，然后给窗体添加背景色。当然，我们的目的并不是学习OpenGL，而是看一下Vcpkg是否能正常使用。

在Visual Studio里面直接点击启动该项目，即可发现OpenGL程序能顺利运行。

接下来我们来探讨一下如何在控制台中编译运行程序，首先我们按照上上节所提到的CMake使用方法，构建CMake Cache。

```
$ cmake -B ./build
```

这时候CMake会报出找不到GLAD的相关文件，而使用Visual Studio却一切都很顺利。你是否记得我们安装Vcpkg完成时，有提示我们定义`CMAKE_TOOLCHAIN_FILE`。而Visual Studio不需要定义工具链，是因为Visual Studio 2017以上的版本支持自动寻找Vcpkg配置。除此之外我们还需要定义目标平台。

```
$ cmake -B ./build -DVCPKG_TARGET_TRIPLET="x64-windows" -DCMAKE_TOOLCHAIN_FILE="D:/Software/Language/vcpkg/scripts/buildsystems/vcpkg.cmake"
```

当然，如果刚刚仔细阅读CMakeLists的源码，就会发现其实我们也不需要定义这两个变量，只需要添加环境变量`VCPKG_ROOT`和`VCPKG_DEFAULT_TRIPLET`即可。

然后我们构建二进制文件。

```
$ cmake --build ./build
```

最后即可运行我们的OpenGL程序。

```
$ ./build/Debug/OpenGL.exe
```

## Learning OpenGL范例：Model Loading

上一节证实了Vcpkg安装的GLFW、GLAD等可以正常使用，也可以看到Vcpkg简化了开发配置环境的很多操作。接下来我们使用Vcpkg来运行一下Learning OpenGL的范例Model Loading，再看看Vcpkg的开发效率和效果。

[Learning OpenGL](https://learnopengl.com/)是著名的OpenGL学习网站，里面的教程非常丰富，其源码也被公开于[GitHub](https://github.com/JoeyDeVries/LearnOpenGL)。接下来我们将不贴出Model Loading的源码，需要查看源码的同学可以去GitHub查看。

首先我们需要下载Stb Image和Assimp库。

```
$ vcpkg install assimp:x64-windows stb:x64-windows
```

安装完Assimp和Stb Image之后，需要在CMakeLists里面引入它们。

```cmake
cmake_minimum_required(VERSION 3.8)

if (DEFINED ENV{VCPKG_ROOT} AND NOT DEFINED CMAKE_TOOLCHAIN_FILE)
    set(CMAKE_TOOLCHAIN_FILE "$ENV{VCPKG_ROOT}/scripts/buildsystems/vcpkg.cmake" CACHE STRING "")
endif()
if (DEFINED ENV{VCPKG_DEFAULT_TRIPLET} AND NOT DEFINED VCPKG_TARGET_TRIPLET)
    set(VCPKG_TARGET_TRIPLET "$ENV{VCPKG_DEFAULT_TRIPLET}")
endif()

project(OpenGL)

message("CMAKE_TOOLCHAIN_FILE=${CMAKE_TOOLCHAIN_FILE}")

find_package(assimp CONFIG REQUIRED)
find_package(glad CONFIG REQUIRED)
find_package(glfw3 CONFIG REQUIRED)
find_package(glm CONFIG REQUIRED)

configure_file("config/root_directory.h.in" "config/root_directory.h")
file(COPY "1.model_loading.vs" "1.model_loading.fs" DESTINATION ${CMAKE_BINARY_DIR})
file(COPY "resources" DESTINATION ${CMAKE_BINARY_DIR})

include_directories("${CMAKE_BINARY_DIR}/config")
include_directories("./")

add_executable(OpenGL "OpenGL.cpp" "stb_image.cpp")

target_link_libraries(OpenGL PRIVATE ${ASSIMP_LIBRARIES})
target_link_libraries(OpenGL PRIVATE glad::glad)
target_link_libraries(OpenGL PRIVATE glfw)
target_link_libraries(OpenGL PRIVATE glm)
```

Assimp的链接和其它的库不太一样，这是因为Assimp仓库里面的CMake文件内置了硬编码配置，导致Vcpkg上的Assimp会出现各种问题。实际上你前往Vcpkg和Assimp的GitHub仓库都可以搜到不少Issue，这里我也是折腾了很久才让程序正常工作。

而CMakeLists里面并没有出现寻找Stb和链接Stb库的命令，这是因为Stb库提供的Stb Image源码仅仅是一个文件，实际上Stb库提供的所有工具都是仅有一个文件。我们在根目录下创建`stb_image.cpp`，写下如下的源码。

```cpp
#define STB_IMAGE_IMPLEMENTATION
#include "stb_image.h"
```

然后在CMakeLists中修改编译命令。

```cmake
add_executable(OpenGL "OpenGL.cpp" "stb_image.cpp")
```

接下来，我们复制粘贴Learning OpenGL的C++源码、着色器源码和资源文件，同时为头文件添加目录。

```cmake
configure_file("config/root_directory.h.in" "config/root_directory.h")
file(COPY "1.model_loading.vs" "1.model_loading.fs" DESTINATION ${CMAKE_BINARY_DIR})
file(COPY "resources" DESTINATION ${CMAKE_BINARY_DIR})

include_directories("${CMAKE_BINARY_DIR}/config")
include_directories("./")
```

编译运行，即可得到一个Model Loading范例程序。

## 结语

其实我本人在好久之前就知道有Vcpkg这个工具，不过如今才尝试去学习和使用它。Vcpkg的确是一个不错的工具，结合CMake的使用很方便，并且貌似Vcpkg对于项目集成，也是支持NuGet的。不过不得不说，Vcpkg目前还是有蛮多不足，社区很多第三方库的portfile维护力度不大，还是很多库出现多多少少BUG。(比如Assimp，就很难受)

当然，这种社区驱动的包管理就是这样的，看一下同是微软儿子的DefinitelyTyped的issue数量就知道了。

