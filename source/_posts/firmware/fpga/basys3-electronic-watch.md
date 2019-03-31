---
title: Firmware | 利用Basys3实现电子钟
date: 2017-12-18
categories: Firmware and Kernel Development
tags:
- FPGA
- Basys3
---

数电实验课也快要结束了，大作业的要求也出来了，实现一个电子钟。看上去感觉好难，不过还好是可以用Verilog实现，不需要接触IP核。否则，这周菜秀就得哭死了。

<!-- more -->

## Basys3实现分秒计数器

首先，我们先实现一个简单的只支持分、秒的电子钟。毕竟，实现了分秒之后，其他的原理几乎都一样，可以很快的实现出来。

### 封装通用计数器

我们都知道，无论是年月日还是时分秒，其实原理上就只是不一样的计数器，那么如果我们可以将这些计数器封装起来，组成一个通用计数器。然后再在不同的需求之下赋予不同的参数，调用这些计数器，那岂不是代码会很清爽。

首先我们看一下，一个通用的计数器需要什么？当然，我们不需要实现跟74LS160一模一样，下列也只是我个人想法，不一定是最优的实现需求哦！

* CLK时钟信号
* 使能信号
* 计数器初始状态、截至状态
* 计数器当前状态
* 进位信号

因为我们的计数器只需要实现十进制的两位，于是就有了下面的代码：

```verilog
`timescale 1ns / 1ps

module CommonCounter(
  input mclk,            // 时钟信号, 不是驱动计数器的CLK, 
                           // 必须保证电路运行的时候所有计时器都要触发该时钟信号
  input en,              // 使能信号, 或许是真正的驱动计数器的CLK
  input [7:0] s,         // 初始状态(可达)
  input [7:0] e,         // 终止状态(不可达)
  input [7:0] init,      // 初始化置数值
  output reg [7:0] num,  // 当前状态输出
  output reg tc          // 进位输出
  );
  
reg init_tmp;
reg [7:0] tmp;
  
initial begin
  init_tmp = 0;
  tc = 0;
end

// 该信号用于解决initial无法在Basys3初始化置数值问题, 必须长期触发, 无论Counter是否工作
always@(posedge mclk) begin
  if(init_tmp) num = tmp;
  else num = init;
end

// 真时钟, clk
always@(posedge en) begin
  if(init_tmp == 0) begin
    init_tmp = 1;
    tmp = init;
  end
  tc = 0;
  tmp[3:0] = tmp[3:0] + 1;
  if(tmp[3:0] == 4'D10) begin
    tmp[3:0] = 0;
    tmp[7:4] = tmp[7:4] + 1;
  end
  if(tmp == e) begin
    tc = 1;
    tmp = s;
  end
end

endmodule
```

这里有两个迷之输入端，一个是mclk、一个是en，这是为了解决某些迷之BUG的遗留物。

或许有人问，init值为什么不直接像下面的代码一样，直接操作：

```verilog
// in Module CommonCounter
initial begin
  num = init;
end
```

而是用了下面的代码：

```verilog
always@(posedge mclk) begin
  if(init_tmp) num = tmp;
  else num = init;
end

// 真时钟, clk
always@(posedge en) begin
  if(init_tmp == 0) begin
    init_tmp = 1;
    tmp = init;
  end
  /* other code */
end
```

其实我们将代码跑起来的时候，发现仿真的时候前者是的确有效的，但是在Basys3上测试的时候前者是无效的。

是的，不知道为什么，我们的板子没办法在initial里面将s赋值给num。(当然，如果你知道为什么，不妨告知本菜秀一下~)于是，这里我们要采用特殊的方法在开始将s赋值给num。于是后者这种特殊的初始化方法就诞生了，所以就要求我们必须保证mclk是一直被触发，以保证num的值是正确的。当然，当en被触发之后，tmp的值就跟num的值一样。可是在en被触发之前还是有一段时间的，要是后面做了年月日等，等待en被触发可是要等很久。

所以在这里，en才是我们计数器实际上的那个clk，只是菜秀为了方便区别就这样命名了。(逃~

### 封装显示模块

既然也把通用计数器封装了，不妨我们也顺便封装一下显示模块。

```verilog
`timescale 1ns / 1ps

module Print(
  input clk,                 // 时钟信号
  input [15:0] num,          // 要显示的4位数
  input [3:0] flash,         // 4位, 是否闪烁, 1 => true, 0 => false
  output reg [7:0] display,  // 输出, 8位段选端(CA, CB, CC, CD, CE, CF, CG, DP)
  output reg [3:0] an        // 输出, 4位位选端
  );
  
reg flash_state;  // 当前闪烁状态, 1 => 处于闪烁状态
reg [3:0] tmp;
reg [15:0] counter;
reg [31:0] flash_counter;
reg [3:0] an_tmp;
  
parameter [15:0] MAX_COUNTER = 16'D5_0000;
parameter [31:0] MAX_FLASH_COUNTER = 32'D5000_0000;
  
initial begin
  an_tmp = 4'B0111;
  counter = 0;
  flash_counter = 0;
  flash_state = 0;
end

always@(an_tmp) begin
  case(an_tmp)
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

always@(posedge clk) begin
  // 显示扫描
  counter = counter + 1;
  if(counter == MAX_COUNTER) begin
    an_tmp = (an_tmp >> 1) + 4'B1000;
    counter = 0;
  end
  if(an_tmp == 4'B1111) begin
    an_tmp = 4'B0111;
  end
  // 闪烁扫描
  flash_counter = flash_counter + 1;
  if(flash_counter == MAX_FLASH_COUNTER) begin
    flash_counter = 0;
    flash_state = ~flash_state;
  end
  // 获得最终an值
  if(flash_state) an = an_tmp | flash;
  else an = an_tmp;
end

endmodule
```

这段代码其实是上篇文章改动一部分所得到的，最大的区别大概就是新增了闪烁的功能。这个是为了要实现后面的修改状态的闪烁而新增的功能。其实现机制大概是先得到本来要显示的an，然后再通过当前闪烁状态决定如何处理这个an。

### 编写顶层模块

把通用计数器封装好了之后，我们就可以写顶层模块了。

然后在最外部的模块可以这样写：

```verilog
`timescale 1ns / 1ps

module TimeCounter(
  input clk,                  // Basys3的100MHz脉冲
  output wire [7:0] display,  // 段选端
  output wire [3:0] an        // 位选段
  );

reg base_clk;
reg [15:0] num;
// 值
wire [7:0] sec, min;
// 进位
wire tc_sec_to_min, tc_min_to_hour;

reg [31:0] counter;
reg [3:0] flash;

reg [31:0] MAX_COUNTER = 32'D5000_0000;

CommonCounter sec_cc(
  .mclk(clk),
  .en(base_clk),
  .s(8'H00),
  .e(8'H60),
  .init(8'H00),
  .num(sec),
  .tc(tc_sec_to_min)
);

CommonCounter min_cc(
  .mclk(clk),
  .en(tc_sec_to_min),
  .s(8'H00),
  .e(8'H60),
  .init(8'H20),
  .num(min),
  .tc(tc_min_to_hour)
);

Print print(.clk(clk), .num(num), .flash(flash), .display(display), .an(an));

initial begin
  base_clk = 0;
  counter = 0;
  flash = 0;
  MAX_COUNTER = 32'D5000_0000;
end

always@(posedge clk) begin
  counter = counter + 1;
  if(counter >= MAX_COUNTER) begin
    counter = 0;
    base_clk = ~base_clk;
  end
  num = {min, sec};  // 确定要显示的数
end

endmodule
```

然后烧板测试，其实就已经实现了一个支持分、秒功能的电子钟。

## 周期调节

本次作业里面有一个要求，是要实现不同周期的电子钟，以方便TA检查。那么也是为了方便我们调试，我们把这一步提前到这里，先实现了周期的调节。

首先我们将TimeCounter的头改成如下：

```verilog
module TimeCounter(
  input clk,                  // Basys3的100MHz脉冲
  input clk_5000_0000,
  input clk_500_0000,
  input clk_50_0000,
  input clk_5_0000,
  input clk_5000,
  input clk_500,
  input clk_50,
  input clk_5,
  output wire [7:0] display,  // 段选端
  output wire [3:0] an        // 位选段
  );
endmodule
```

然后在TimeCounter里面添加一个always块，用8个开关实现周期大的优先级高的周期调节功能。

```verilog
always@(clk_5000_0000, clk_500_0000, clk_50_0000, clk_5_0000,
        clk_5000, clk_500, clk_50, clk_5) begin
  if(clk_5000_0000) MAX_COUNTER = 5000_0000;
  else if(clk_500_0000) MAX_COUNTER = 500_0000;
  else if(clk_50_0000) MAX_COUNTER = 50_0000;
  else if(clk_5_0000) MAX_COUNTER = 5_0000;
  else if(clk_5000) MAX_COUNTER = 5000;
  else if(clk_500) MAX_COUNTER = 500;
  else if(clk_50) MAX_COUNTER = 50;
  else if(clk_5) MAX_COUNTER = 5;
  else MAX_COUNTER = 5000_0000;
end
```

烧板之后，就可以利用Basys3的后面8个开关来调节周期了。

## Basys3实现年月日时分秒

前面我们了解了如何实现分秒，然后我们也实现了一个周期调节用于调试。现在，让我们来直接实现年月日时分秒的电子钟。

由于我们前面已经封装好了TimeCounter，这里我们实现年月日时分秒会很简单。然后我们再用一个按钮，来实现切换功能。这里我们的设计有4个状态，年、月日、时分、分秒。

```verilog
`timescale 1ns / 1ps

module TimeCounter(
  input clk,                    // Basys3的100MHz脉冲
  input clk_5000_0000,
  input clk_500_0000,
  input clk_50_0000,
  input clk_5_0000,
  input clk_5000,
  input clk_500,
  input clk_50,
  input clk_5,
  input btn_show,               // Button Right, 切换显示的内容
  output reg [3:0] show_state,  // 链接4个LED灯, 提示目前显示内容
  output wire [7:0] display,    // 段选端
  output wire [3:0] an          // 位选段
  );

reg base_clk;
reg [15:0] num;
// 值
wire [7:0] sec, min, hour, day, month, year;
// 进位
wire tc_sec_to_min, tc_min_to_hour, tc_hour_to_day,
     tc_day_to_month, tc_month_to_year, nil;

reg [1:0] show_signal;  // 2'B00 => min, sec
                        // 2'B01 => hour, min
                        // 2'B10 => month, day
                        // 2'B11 => year

reg btn_show_state;

reg [31:0] counter;
reg [3:0] flash;

reg [31:0] MAX_COUNTER = 32'D5000_0000;

CommonCounter sec_cc(
  .mclk(clk),
  .en(base_clk),
  .s(8'H00),
  .e(8'H60),
  .init(8'H00),
  .num(sec),
  .tc(tc_sec_to_min)
);

CommonCounter min_cc(
  .mclk(clk),
  .en(tc_sec_to_min),
  .s(8'H00),
  .e(8'H60),
  .init(8'H20),
  .num(min),
  .tc(tc_min_to_hour)
);

CommonCounter hour_cc(
  .mclk(clk),
  .en(tc_min_to_hour),
  .s(8'H00),
  .e(8'H24),
  .init(8'H14),
  .num(hour),
  .tc(tc_hour_to_day)
);

CommonCounter day_cc(
  .mclk(clk),
  .en(tc_hour_to_day),
  .s(8'H01),
  .e(8'H31),
  .init(8'H19),
  .num(day),
  .tc(tc_day_to_month)
);

CommonCounter month_cc(
  .mclk(clk),
  .en(tc_day_to_month),
  .s(8'H01),
  .e(8'H13),
  .init(8'H12),
  .num(month),
  .tc(tc_month_to_year)
);

CommonCounter year_cc(
  .mclk(clk),
  .en(tc_month_to_year),
  .s(8'H00),
  .e(8'Ha0),
  .init(8'H17),
  .num(year),
  .tc(nil)
);

Print print(.clk(clk), .num(num), .flash(flash), .display(display), .an(an));

initial begin
  base_clk = 0;
  counter = 0;
  flash = 0;
  MAX_COUNTER = 32'D5000_0000;
end

always@(posedge clk) begin
  // 模拟button的posedge状态, state储存的是前一个状态
  if(btn_show != btn_show_state && !btn_show_state) begin
    show_signal = show_signal + 1;
  end
  btn_show_state = btn_show;
  counter = counter + 1;
  if(counter >= MAX_COUNTER) begin
    counter = 0;
    base_clk = ~base_clk;
  end
  case(show_signal)
    2'B00: begin num = {min, sec};    show_state = 4'B0001; end
    2'B01: begin num = {hour, min};   show_state = 4'B0010; end
    2'B10: begin num = {month, day};  show_state = 4'B0100; end
    2'B11: begin num = {8'H20, year}; show_state = 4'B1000; end
  endcase
end

always@(clk_5000_0000, clk_500_0000, clk_50_0000, clk_5_0000,
        clk_5000, clk_500, clk_50, clk_5) begin
  if(clk_5000_0000) MAX_COUNTER = 5000_0000;
  else if(clk_500_0000) MAX_COUNTER = 500_0000;
  else if(clk_50_0000) MAX_COUNTER = 50_0000;
  else if(clk_5_0000) MAX_COUNTER = 5_0000;
  else if(clk_5000) MAX_COUNTER = 5000;
  else if(clk_500) MAX_COUNTER = 500;
  else if(clk_50) MAX_COUNTER = 50;
  else if(clk_5) MAX_COUNTER = 5;
  else MAX_COUNTER = 5000_0000;
end

endmodule
```

## Basys3实现时间修改

### 添加闪烁

我们的知道，电子钟，是有个按钮是专门用于设置，点击一下切换到秒的修改，再点击一下，切换到分的修改，然后接着是小时、日、月、年，然后回到计数状态。每切换到某一个修改状态的时候，对应的数值就会闪烁。这里，我们就用上了前面我们实现的显示模块里面的闪烁功能了。

以下代码略有混乱，如果看不下去，不妨去看看文章尾部的`代码`。

```verilog
// module io
input btn_set
output reg set_led
```

```verilog
// variable
reg [2:0] set_signal;  // 3'B000 => normal
                       // 3'B001 => sec
                       // 3'B010 => min
                       // 3'B011 => hour
                       // 3'B100 => day
                       // 3'B101 => month
                       // 3'B110 => year
                       // 3'B111 => return normal

reg [5:0] set_state; // {year, month, day, hour, min, sec}
reg btn_set_state;
```

```verilog
// always
always@(posedge clk) begin
  if(btn_set != btn_set_state && !btn_set_state) begin
    set_signal = set_signal + 1;
  end
  btn_set_state = btn_set;
  /* other code */
  case(set_signal)
    3'B000: begin set_state = 6'B000000; flash = 4'B0000; end
    3'B001: begin set_state = 6'B000001; flash = 4'B0011; show_signal = 2'B00; end
    3'B010: begin set_state = 6'B000010; flash = 4'B1100; show_signal = 2'B00; end
    3'B011: begin set_state = 6'B000100; flash = 4'B1100; show_signal = 2'B01; end
    3'B100: begin set_state = 6'B001000; flash = 4'B0011; show_signal = 2'B10; end
    3'B101: begin set_state = 6'B010000; flash = 4'B1100; show_signal = 2'B10; end
    3'B110: begin set_state = 6'B100000; flash = 4'B1111; show_signal = 2'B11; end
    3'B111: begin set_state = 6'B000000; flash = 4'B0000; show_signal = 2'B00; set_signal = 3'B000; end
  endcase
  if(set_signal == 0) set_led = 0;
  else set_led = 1;
end
```

同时，这里我们还得将所有CommonCounter的en端，加上个`& ~set_led`。只有在set的LED灯是灭的时候，计数器才正常计数。

### 添加修改

```verilog
// module io
input btn_add
output reg add_led
```

```verilog
// variable
reg [5:0] add_state; // {year, month, day, hour, min, sec}
reg btn_add_state;
```

```verilog
// always
always@(posedge clk) begin
  add_state = 0;
  if(btn_add != btn_add_state && !btn_add_state) begin
    if(set_signal != 0) begin
      case(set_signal)
        3'B001: add_state[0] = 1;  // sec
        3'B010: add_state[1] = 1;  // min
        3'B011: add_state[2] = 1;  // hour
        3'B100: add_state[3] = 1;  // day
        3'B101: add_state[4] = 1;  // month
        3'B110: add_state[5] = 1;  // year
      endcase
    end
  end
  btn_add_state = btn_add;
  /* other code */
  if(add_state == 0) add_led = 0;
  else add_led = 1;
end
```

同时，这里我们还得将所有CommonCounter的en端，加上个`| add_state[对应的下标]`。这样才能实现在修改状态的情况下，按下按钮也能触发计数器。

当然，这代码烧板之后，实际上按下按钮有时候会因为脉冲时间差的问题导致无法正常+1。如果你有什么好的方法不如告知菜秀（PS: 好菜啊~）

## 代码

### Basys3.xdc - 约束文件

```verilog
set_property PACKAGE_PIN W5 [get_ports clk]
set_property IOSTANDARD LVCMOS33 [get_ports clk]

set_property PACKAGE_PIN T17 [get_ports btn_show]
set_property PACKAGE_PIN U18 [get_ports btn_set]
set_property PACKAGE_PIN W19 [get_ports btn_add]
set_property IOSTANDARD LVCMOS33 [get_ports btn_show]
set_property IOSTANDARD LVCMOS33 [get_ports btn_set]
set_property IOSTANDARD LVCMOS33 [get_ports btn_add]

set_property PACKAGE_PIN V17 [get_ports clk_5000_0000]
set_property PACKAGE_PIN V16 [get_ports clk_500_0000]
set_property PACKAGE_PIN W16 [get_ports clk_50_0000]
set_property PACKAGE_PIN W17 [get_ports clk_5_0000]
set_property PACKAGE_PIN W15 [get_ports clk_5000]
set_property PACKAGE_PIN V15 [get_ports clk_500]
set_property PACKAGE_PIN W14 [get_ports clk_50]
set_property PACKAGE_PIN W13 [get_ports clk_5]
set_property IOSTANDARD LVCMOS33 [get_ports clk_5000_0000]
set_property IOSTANDARD LVCMOS33 [get_ports clk_500_0000]
set_property IOSTANDARD LVCMOS33 [get_ports clk_50_0000]
set_property IOSTANDARD LVCMOS33 [get_ports clk_5_0000]
set_property IOSTANDARD LVCMOS33 [get_ports clk_5000]
set_property IOSTANDARD LVCMOS33 [get_ports clk_500]
set_property IOSTANDARD LVCMOS33 [get_ports clk_50]
set_property IOSTANDARD LVCMOS33 [get_ports clk_5]

set_property PACKAGE_PIN U16 [get_ports show_state[0]]
set_property PACKAGE_PIN E19 [get_ports show_state[1]]
set_property PACKAGE_PIN U19 [get_ports show_state[2]]
set_property PACKAGE_PIN V19 [get_ports show_state[3]]
set_property PACKAGE_PIN L1 [get_ports add_led]
set_property PACKAGE_PIN P1 [get_ports set_led]
set_property IOSTANDARD LVCMOS33 [get_ports show_state[0]]
set_property IOSTANDARD LVCMOS33 [get_ports show_state[1]]
set_property IOSTANDARD LVCMOS33 [get_ports show_state[2]]
set_property IOSTANDARD LVCMOS33 [get_ports show_state[3]]
set_property IOSTANDARD LVCMOS33 [get_ports add_led]
set_property IOSTANDARD LVCMOS33 [get_ports set_led]

set_property PACKAGE_PIN W4 [get_ports an[3]]
set_property PACKAGE_PIN V4 [get_ports an[2]]
set_property PACKAGE_PIN U4 [get_ports an[1]]
set_property PACKAGE_PIN U2 [get_ports an[0]]
set_property IOSTANDARD LVCMOS33 [get_ports an[3]]
set_property IOSTANDARD LVCMOS33 [get_ports an[2]]
set_property IOSTANDARD LVCMOS33 [get_ports an[1]]
set_property IOSTANDARD LVCMOS33 [get_ports an[0]]

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

### Print.v - 显示模块

```verilog
`timescale 1ns / 1ps

module Print(
  input clk,                 // 时钟信号
  input [15:0] num,          // 要显示的4位数
  input [3:0] flash,         // 4位, 是否闪烁, 1 => true, 0 => false
  output reg [7:0] display,  // 输出, 8位段选端(CA, CB, CC, CD, CE, CF, CG, DP)
  output reg [3:0] an        // 输出, 4位位选端
  );
  
reg flash_state;  // 当前闪烁状态, 1 => 处于闪烁状态
reg [3:0] tmp;
reg [15:0] counter;
reg [31:0] flash_counter;
reg [3:0] an_tmp;
  
parameter [15:0] MAX_COUNTER = 16'D5_0000;
parameter [31:0] MAX_FLASH_COUNTER = 32'D5000_0000;
  
initial begin
  an_tmp = 4'B0111;
  counter = 0;
  flash_counter = 0;
  flash_state = 0;
end

always@(an_tmp) begin
  case(an_tmp)
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

always@(posedge clk) begin
  // 显示扫描
  counter = counter + 1;
  if(counter == MAX_COUNTER) begin
    an_tmp = (an_tmp >> 1) + 4'B1000;
    counter = 0;
  end
  if(an_tmp == 4'B1111) begin
    an_tmp = 4'B0111;
  end
  // 闪烁扫描
  flash_counter = flash_counter + 1;
  if(flash_counter == MAX_FLASH_COUNTER) begin
    flash_counter = 0;
    flash_state = ~flash_state;
  end
  // 获得最终an值
  if(flash_state) an = an_tmp | flash;
  else an = an_tmp;
end

endmodule
```

### CommonCounter.v - 通用计数器模块

```verilog
`timescale 1ns / 1ps

module CommonCounter(
  input mclk,            // 时钟信号, 不是驱动计数器的CLK, 
                           // 必须保证电路运行的时候所有计时器都要触发该时钟信号
  input en,              // 使能信号, 或许是真正的驱动计数器的CLK
  input [7:0] s,         // 初始状态(可达)
  input [7:0] e,         // 终止状态(不可达)
  input [7:0] init,      // 初始化置数值
  output reg [7:0] num,  // 当前状态输出
  output reg tc          // 进位输出
  );
  
reg init_tmp;
reg [7:0] tmp;
  
initial begin
  init_tmp = 0;
  tc = 0;
end

// 该信号用于解决initial无法在Basys3初始化置数值问题, 必须长期触发, 无论Counter是否工作
always@(posedge mclk) begin
  if(init_tmp) num = tmp;
  else num = init;
end

// 真时钟, clk
always@(posedge en) begin
  if(init_tmp == 0) begin
    init_tmp = 1;
    tmp = init;
  end
  tc = 0;
  tmp[3:0] = tmp[3:0] + 1;
  if(tmp[3:0] == 4'D10) begin
    tmp[3:0] = 0;
    tmp[7:4] = tmp[7:4] + 1;
  end
  if(tmp == e) begin
    tc = 1;
    tmp = s;
  end
end

endmodule
```

### TimeCounter.v - 顶部模块

```verilog
`timescale 1ns / 1ps

module TimeCounter(
  input clk,                    // Basys3的100MHz脉冲
  input clk_5000_0000,
  input clk_500_0000,
  input clk_50_0000,
  input clk_5_0000,
  input clk_5000,
  input clk_500,
  input clk_50,
  input clk_5,
  input btn_show,               // Button Right, 切换显示的内容
  input btn_set,                //
  input btn_add,                // 
  output reg [3:0] show_state,  // 链接4个LED灯, 提示目前显示内容
  output reg set_led,
  output reg add_led,
  output wire [7:0] display,    // 段选端
  output wire [3:0] an          // 位选段
  );

reg base_clk;
reg [15:0] num;
// 值
wire [7:0] sec, min, hour, day, month, year;
// 进位
wire tc_sec_to_min, tc_min_to_hour, tc_hour_to_day,
     tc_day_to_month, tc_month_to_year, nil;

reg [1:0] show_signal;  // 2'B00 => min, sec
                        // 2'B01 => hour, min
                        // 2'B10 => month, day
                        // 2'B11 => year

reg [2:0] set_signal;  // 3'B000 => normal
                       // 3'B001 => sec
                       // 3'B010 => min
                       // 3'B011 => hour
                       // 3'B100 => day
                       // 3'B101 => month
                       // 3'B110 => year
                       // 3'B111 => return normal

reg [5:0] set_state; // {year, month, day, hour, min, sec}
reg [5:0] add_state; // {year, month, day, hour, min, sec}

reg btn_show_state, btn_set_state, btn_add_state;

reg [31:0] counter;
reg [3:0] flash;

reg [31:0] MAX_COUNTER = 32'D5000_0000;

CommonCounter sec_cc(
  .mclk(clk),
  .en((base_clk & ~set_led) | add_state[0]),
  .s(8'H00),
  .e(8'H60),
  .init(8'H00),
  .num(sec),
  .tc(tc_sec_to_min)
);

CommonCounter min_cc(
  .mclk(clk),
  .en((tc_sec_to_min & ~set_led) | add_state[1]),
  .s(8'H00),
  .e(8'H60),
  .init(8'H20),
  .num(min),
  .tc(tc_min_to_hour)
);

CommonCounter hour_cc(
  .mclk(clk),
  .en((tc_min_to_hour & ~set_led) | add_state[2]),
  .s(8'H00),
  .e(8'H24),
  .init(8'H14),
  .num(hour),
  .tc(tc_hour_to_day)
);

CommonCounter day_cc(
  .mclk(clk),
  .en((tc_hour_to_day & ~set_led) | add_state[3]),
  .s(8'H01),
  .e(8'H31),
  .init(8'H19),
  .num(day),
  .tc(tc_day_to_month)
);

CommonCounter month_cc(
  .mclk(clk),
  .en((tc_day_to_month & ~set_led) | add_state[4]),
  .s(8'H01),
  .e(8'H13),
  .init(8'H12),
  .num(month),
  .tc(tc_month_to_year)
);

CommonCounter year_cc(
  .mclk(clk),
  .en((tc_month_to_year & ~set_led) | add_state[5]),
  .s(8'H00),
  .e(8'Ha0),
  .init(8'H17),
  .num(year),
  .tc(nil)
);

Print print(.clk(clk), .num(num), .flash(flash), .display(display), .an(an));

initial begin
  base_clk = 0;
  counter = 0;
  flash = 0;
  show_signal = 0;
  set_signal = 0;
  btn_show_state = 0;
  btn_set_state = 0;
  btn_add_state = 0;
  set_led = 0;
  add_led = 0;
  MAX_COUNTER = 32'D5000_0000;
end

always@(posedge clk) begin
  // 模拟button的posedge状态, state储存的是前一个状态
  add_state = 0;
  if(btn_show != btn_show_state && !btn_show_state) begin
    show_signal = show_signal + 1;
  end
  if(btn_set != btn_set_state && !btn_set_state) begin
    set_signal = set_signal + 1;
  end
  if(btn_add != btn_add_state && !btn_add_state) begin
    if(set_signal != 0) begin
      case(set_signal)
        3'B001: add_state[0] = 1;  // sec
        3'B010: add_state[1] = 1;  // min
        3'B011: add_state[2] = 1;  // hour
        3'B100: add_state[3] = 1;  // day
        3'B101: add_state[4] = 1;  // month
        3'B110: add_state[5] = 1;  // year
      endcase
    end
  end
  btn_show_state = btn_show;
  btn_set_state = btn_set;
  btn_add_state = btn_add;
  counter = counter + 1;
  if(counter >= MAX_COUNTER) begin
    counter = 0;
    base_clk = ~base_clk;
  end
  case(show_signal)
    2'B00: begin num = {min, sec};    show_state = 4'B0001; end
    2'B01: begin num = {hour, min};   show_state = 4'B0010; end
    2'B10: begin num = {month, day};  show_state = 4'B0100; end
    2'B11: begin num = {8'H20, year}; show_state = 4'B1000; end
  endcase
  case(set_signal)
    3'B000: begin set_state = 6'B000000; flash = 4'B0000; end
    3'B001: begin set_state = 6'B000001; flash = 4'B0011; show_signal = 2'B00; end
    3'B010: begin set_state = 6'B000010; flash = 4'B1100; show_signal = 2'B00; end
    3'B011: begin set_state = 6'B000100; flash = 4'B1100; show_signal = 2'B01; end
    3'B100: begin set_state = 6'B001000; flash = 4'B0011; show_signal = 2'B10; end
    3'B101: begin set_state = 6'B010000; flash = 4'B1100; show_signal = 2'B10; end
    3'B110: begin set_state = 6'B100000; flash = 4'B1111; show_signal = 2'B11; end
    3'B111: begin set_state = 6'B000000; flash = 4'B0000; show_signal = 2'B00; set_signal = 3'B000; end
  endcase
  if(set_state == 0) set_led = 0;
  else set_led = 1;
  if(add_state == 0) add_led = 0;
  else add_led = 1;
end

always@(clk_5000_0000, clk_500_0000, clk_50_0000, clk_5_0000,
        clk_5000, clk_500, clk_50, clk_5) begin
  if(clk_5000_0000) MAX_COUNTER = 5000_0000;
  else if(clk_500_0000) MAX_COUNTER = 500_0000;
  else if(clk_50_0000) MAX_COUNTER = 50_0000;
  else if(clk_5_0000) MAX_COUNTER = 5_0000;
  else if(clk_5000) MAX_COUNTER = 5000;
  else if(clk_500) MAX_COUNTER = 500;
  else if(clk_50) MAX_COUNTER = 50;
  else if(clk_5) MAX_COUNTER = 5;
  else MAX_COUNTER = 5000_0000;
end

endmodule
```

