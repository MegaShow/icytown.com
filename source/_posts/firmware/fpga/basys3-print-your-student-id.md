---
title: Firmware | 利用Basys3显示你的学号
date: 2017-11-23
categories: Firmware and Kernel Development
tags:
- FPGA
- Basys3
---

欸，本来上周就想把Verilog的基本语法写成一篇文章，可是一直没有空。今天终于感觉轻松了，那就把这周的作业写成篇文章，顺便也让自己别在教学的时候丢大脸。

<!-- more -->

## 在数码管上实现简单的显示

首先，我们想要实现Basys3的数码管显示，那肯定需要先知道Basys3的数码管是怎么工作的。

这里，我们查询了Basys3的文档，得到下面的引脚图：

![数码管显示](basys3-print-your-student-id/digital.png)

这里我们可以观察到，Basys3的数码管其实跟Proteus里面的7-SEG数码管原理差不多，都是由位选端AN3、AN2、AN1、AN0和段选端CA、CB、CC、CD、CE、CF、CG、DP所组成。不过Basys3的输入端都是低电平有效，不像Proteus里面有多种数码管选择。

我们这里先做个简单的显示，那就是显示AN3位置和AN1位置是数字7。那么代码将如下：

```verilog
`timescale 1ns / 1ps

module Print(AN, display);
  output reg [3:0] AN;  // 位选端(4位)
  output reg [7:0] display;  // 段选端(8位)

  initial begin
    AN = 4'B0101;
    display = 8'B0001_1111;
  end
endmodule
```

前面说了，输入端都是低电平有效，那么要AN3和AN1输出，那么AN3和AN1就是0，所以AN就是0101。这里为了表达方便，我们用一个4位寄存器表示AN，一个8位寄存器表示段选端(其中，高位为CA，依次下去，低位为DP)。数字7的CA、CB、CC端有效，所以display为0001_1111。

设计代码写完，那就要写一下约束文件：

```verilog
set_property PACKAGE_PIN W4 [get_ports AN[3]]
set_property PACKAGE_PIN V4 [get_ports AN[2]]
set_property PACKAGE_PIN U4 [get_ports AN[1]]
set_property PACKAGE_PIN U2 [get_ports AN[0]]

set_property IOSTANDARD LVCMOS33 [get_ports AN[3]]
set_property IOSTANDARD LVCMOS33 [get_ports AN[2]]
set_property IOSTANDARD LVCMOS33 [get_ports AN[1]]
set_property IOSTANDARD LVCMOS33 [get_ports AN[0]]

set_property PACKAGE_PIN W7 [get_ports display[7]]
set_property PACKAGE_PIN W6 [get_ports display[6]]
set_property PACKAGE_PIN U8 [get_ports display[5]]
set_property PACKAGE_PIN V8 [get_ports display[4]]
set_property PACKAGE_PIN U5 [get_ports display[3]]
set_property PACKAGE_PIN V5 [get_ports display[2]]
set_property PACKAGE_PIN U7 [get_ports display[1]]
set_property PACKAGE_PIN V7 [get_ports display[0]]

set_property IOSTANDARD LVCMOS33 [get_ports display[7]]
set_property IOSTANDARD LVCMOS33 [get_ports display[6]]
set_property IOSTANDARD LVCMOS33 [get_ports display[5]]
set_property IOSTANDARD LVCMOS33 [get_ports display[4]]
set_property IOSTANDARD LVCMOS33 [get_ports display[3]]
set_property IOSTANDARD LVCMOS33 [get_ports display[2]]
set_property IOSTANDARD LVCMOS33 [get_ports display[1]]
set_property IOSTANDARD LVCMOS33 [get_ports display[0]]
```

然后Generate Bitstream一下，板子测试，就可以实现在AN3和AN1处显示7了。

## 实现简单的数字位置修改

前面我们已经知道了Basys3的数码管是怎么工作的了。我们知道显示学号，是要一位位显示，然后通过频率使得其看起来像是同时显示。如果我们要实现从左到右依次显示数字，那么我们的数码管位选端就应该是下列的顺序：

```haskell
0111 -> 1011 -> 1101 -> 1110
```

首先，我们在约束文件里面添加下面代码：

```verilog
set_property PACKAGE_PIN W5 [get_ports CLK]

set_property IOSTANDARD LVCMOS33 [get_ports CLK]
```

现在我们就来修改一下设计源码，使得板子满足上述功能。

```verilog
`timescale 1ns / 1ps

module Print(CLK, AN, display);
  input CLK;
  output reg [3:0] AN;  // 位选端(4位)
  output reg [7:0] display;  // 段选端(8位)
  reg [31:0] counter;  // 计数器, 用于适配显示间隔时间
  
  initial begin
    AN = 4'B0111;
    display = 8'B0001_1111;
    counter = 0;
  end
  
  always@(posedge CLK) begin
    counter = counter + 1;
    if(counter == 1_0000_0000) begin
      AN = (AN >> 1) + 4'B1000;
      counter = 0;
    end
    if(AN == 4'B1111) begin
      AN = 4'B0111;
    end
  end
endmodule
```

通过代码我们可以发现AN初始状态是0111，满足我们的状态机。然后在always里面，我们可以发现有一句`AN = (AN >> 1) + 4'B1000`，就是从0111到1011到1101到1110(这里或许有更好的方法，如果你有更好的实现不妨邮件交流，提前感谢~)。1110的下一个状态是1111，所以我们在always里面添加了一个判断AN是否为1111，如果为1111就转换成0111重新循环。

到这里，大概你要问了。什么是`posedge`，为什么多了个`CLK`，为什么要用一个计数器来决定AN的修改？

首先一一回答，这里，posedge是指上升沿。这里的`always@(posedge CLK)`就是当CLK的上升沿到来的时候执行always里面的代码。

那么CLK是用来干嘛的呢？我们通过观察约束文件可以发现，CLK是引脚分配给W5的输入。在板子数码管的右边，有W5的标志，W5上面还有`CLK 100MHz`的说明。没错，W5输入其实就是一个100MHz的脉冲。我们接入一个脉冲，通过脉冲来控制数码管的输出。因为如果频率过低和过高都会导致数码管的输出达不到目标(过低会无法实现感觉是同时输出的，过高会导致数码管直接输出8888)。

那么这里计数器的作用也应该知道了，就是调节频率。我们不一定需要100MHz的频率，比如这里counter跟100,000,000比较，其实就是将频率调节至了1Hz，每秒修改AN一次。

那么我们这个时候生成bit文件并用板子测试，就会发现板子的数码管是四位依次输出7。

## 实现显示四位学号

我们上面了解了如何实现修改显示位置，那么我们只要再添加一个always监听AN的修改，在这个always里面修改display就可以了。这里假设四位学号是1234：

```verilog
`timescale 1ns / 1ps

module Print(CLK, AN, display);
  input CLK;
  output reg [3:0] AN;  // 位选端(4位)
  output reg [7:0] display;  // 段选端(8位)
  reg [31:0] counter;  // 计数器, 用于适配显示间隔时间
  
  initial begin
    AN = 4'B0111;
    display = 8'B0001_1111;
    counter = 0;
  end
  
  always@(AN) begin
    case(AN)
      4'B0111: display = 8'B1001_1111;
      4'B1011: display = 8'B0010_0101;
      4'B1101: display = 8'B0000_1101;
      4'B1110: display = 8'B1001_1001;
    endcase
  end
  
  always@(posedge CLK) begin
    counter = counter + 1;
    if(counter == 1_0000_0000) begin
      AN = (AN >> 1) + 4'B1000;
      counter = 0;
    end
    if(AN == 4'B1111) begin
      AN = 4'B0111;
    end
  end
endmodule
```

测试板子可以看到四位依次输出1、2、3、4。不过我们的目的是同时显示，还记得我们有个counter吧，将counter的对比值修改成50000。再次测试板子就可以看到Basys3显示了1234。(逃~

## 实现显示模板

虽然上面我们显示了1234，但是实际上这种方法还是挺暴力的，因为1234的段选端是我们暴力写的。如果突然我要把显示改成5678，那就要重新暴力撸段选端。所以我们这里修改一下源码，让代码支持显示任何一个四位数，而不是固定的某个四位数。

因为本菜秀学校的学号是8位数，所以这里我先声明一个32位的寄存器`id`储存学号。因为Basys3只有4位数码管输出，所以我们输出后面4位学号，就是`id[15:0]`。

```verilog
`timescale 1ns / 1ps

module Print(CLK, AN, display);
  input CLK;
  output reg [3:0] AN;  // 位选端(4位)
  output reg [7:0] display;  // 段选端(8位)
  reg [31:0] counter;  // 计数器, 用于适配显示间隔时间
  parameter [31:0] MAX_COUNTER = 5_0000;  // 计数器捕捉点
  parameter [31:0] ID = 32'H1234_5678;  // 学号
  reg [15:0] num;  // 需要显示的4个数字
  reg [4:0] tmp;  // 正在显示的数字
  
  initial begin
    AN = 4'B0111;
    display = 8'B0000_0000;
    counter = 0;
    num = ID[15:0];  // 需要显示的后四位学号
  end
  
  always@(AN) begin
    case(AN)
      4'B0111: tmp = num[15:12];
      4'B1011: tmp = num[11:8];
      4'B1101: tmp = num[7:4];
      4'B1110: tmp = num[3:0];
    endcase
    case(tmp)
      4'H0: display = 8'B0000_0011;
      4'H1: display = 8'B1001_1111;
      4'H2: display = 8'B0010_0101;
      4'H3: display = 8'B0000_1101;
      4'H4: display = 8'B1001_1001;
      4'H5: display = 8'B0100_1001;
      4'H6: display = 8'B0100_0001;
      4'H7: display = 8'B0001_1111;
      4'H8: display = 8'B0000_0001;
      4'H9: display = 8'B0000_1001;
    endcase
  end
  
  always@(posedge CLK) begin
    counter = counter + 1;
    if(counter == MAX_COUNTER) begin
      AN = (AN >> 1) + 4'B1000;
      counter = 0;
    end
    if(AN == 4'B1111) begin
      AN = 4'B0111;
    end
  end
endmodule
```

这里出现了一个新的关键词，叫`parameter`，其实这是Verilog里面的一个常量定义。

当然，在Verilog里面还有一个叫`define`的关键词，也是用于定义常量的。只不过define的作用域是整个项目，而parameter是这个module内部。为了方便管理，我们这里自然选择parameter来定义常量。

在这段代码里面，我们定义了一个叫tmp的临时变量，用于储存当前需要输出的数字，然后再通过case选择出相对应的SEG段选端输出。这样，只要我们修改ID的值，就能简单的显示一个四位数了。

## 实现学号滚动

前面我有提到，我的学号是8位数，但是Basys3只有4位数码管。所以这里我们将要实现学号滚动的功能。首先，我们原有功能肯定不能修改，所以这里我们添加一个开关用于控制学号是否要进行滚动。首先往约束文件添加下面引脚约束，利用Basys3的最右下角的开关来控制：

```verilog
set_property PACKAGE_PIN V17 [get_ports TYPE]
set_property IOSTANDARD LVCMOS33 [get_ports TYPE]
```

然后修改设计源码：

```verilog
`timescale 1ns / 1ps

module Print(CLK, TYPE, AN, display);
  input CLK, TYPE;
  output reg [3:0] AN;  // 位选端(4位)
  output reg [7:0] display;  // 段选端(8位)
  reg [31:0] counter;  // 计数器, 用于适配显示间隔时间
  reg [31:0] move_counter;  // 计数器, 用于适配滚动间隔时间
  parameter [31:0] MAX_COUNTER = 5_0000;  // 显示间隔
  parameter [31:0] MAX_MOVE_COUNTER = 1_0000_0000;  // 滚动间隔
  parameter [31:0] ID = 32'H12345678;  // 学号
  reg [15:0] num;  // 需要显示的位数
  reg [4:0] tmp;  // 正在显示的数字
  
  initial begin
    AN = 4'B0111;
    display = 8'B0000_0000;
    counter = 0;
    move_counter = MAX_MOVE_COUNTER + 1;
    num = ID[15:0];
  end
  
  always@(AN) begin
    case(AN)
      4'B0111: tmp = num[15:12];
      4'B1011: tmp = num[11:8];
      4'B1101: tmp = num[7:4];
      4'B1110: tmp = num[3:0];
    endcase
    case(tmp)
      4'H0: display = 8'B0000_0011;
      4'H1: display = 8'B1001_1111;
      4'H2: display = 8'B0010_0101;
      4'H3: display = 8'B0000_1101;
      4'H4: display = 8'B1001_1001;
      4'H5: display = 8'B0100_1001;
      4'H6: display = 8'B0100_0001;
      4'H7: display = 8'B0001_1111;
      4'H8: display = 8'B0000_0001;
      4'H9: display = 8'B0000_1001;
      4'Hf: display = 8'B1111_1111;  // blank
    endcase
  end
  
  always@(posedge CLK) begin
    counter = counter + 1;
    if(counter == MAX_COUNTER) begin
      AN = (AN >> 1) + 4'B1000;
      counter = 0;
    end
    if(AN == 4'B1111) begin
      AN = 4'B0111;
    end
    if(TYPE == 1) begin
      if(move_counter == MAX_MOVE_COUNTER + 1) begin
        // 如果move_counter == MAX_MOVE_COUNTER + 1
        // 则说明TYPE刚刚从0->1, 先复位num为前四位
        num = ID[31:16];
        move_counter = 0;
      end
      move_counter = move_counter + 1;
      if(move_counter == MAX_MOVE_COUNTER) begin
        // 滚动需要显示的学号
        case(num)
          ID[31:16]:            num = ID[27:12];
          ID[27:12]:            num = ID[23:8];
          ID[23:8]:             num = ID[19:4];
          ID[19:4]:             num = ID[15:0];
          ID[15:0]:             num = {ID[11:0], 4'Hf};
          {ID[11:0], 4'Hf}:     num = {ID[7:0], 8'Hff};
          {ID[7:0], 8'Hff}:     num = {ID[3:0], 12'Hfff};
          {ID[3:0], 12'Hfff}:   num = 16'Hffff;
          16'Hffff:             num = {12'Hfff, ID[31:28]};
          {12'Hfff, ID[31:28]}: num = {8'Hff, ID[31:24]};
          {8'Hff, ID[31:24]}:   num = {4'Hf, ID[31:20]};
          {4'Hf, ID[31:20]}:    num = ID[31:16];
        endcase
        move_counter = 0;
      end
    end else begin
      num = ID[15:0];
      move_counter = MAX_MOVE_COUNTER + 1;
    end
  end
endmodule
```

在第二个always里面，我们添加了滚动的代码，并且确保了在开关切换的时候对显示的数字进行复位。在代码中，可以发现，我们将输出的数字为0xF的时候设为全空状态，即什么都不显示。测试板子时，将最右下角的开关置为开，则可以观察到滚动的12345678了。

---

到这里，应该就结束了~当然，上述的代码中，或许有些是通过暴力实现的。如果你有更好的实现方式，不妨邮件联系，谢谢~

