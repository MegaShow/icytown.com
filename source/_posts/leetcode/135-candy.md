---
title: LeetCode | 135 Candy
date: 2018-12-1
categories: LeetCode
---

## Description

There are *N* children standing in a line. Each child is assigned a rating value.

You are giving candies to these children subjected to the following requirements:

- Each child must have at least one candy.
- Children with a higher rating get more candies than their neighbors.

What is the minimum candies you must give?

<!-- more -->

**Example 1:**

```
Input: [1,0,2]
Output: 5
Explanation: You can allocate to the first, second and third child with 2, 1, 2 candies respectively.
```

**Example 2:**

```
Input: [1,2,2]
Output: 4
Explanation: You can allocate to the first, second and third child with 1, 2, 1 candies respectively.
             The third child gets 1 candy because it satisfies the above two conditions.
```

## Approach #1 Two Sides Scan

### Intuition

简单而言，题目的要求就是给小朋友们分糖果，每个小朋友有一个优先级值，每相邻两个小朋友，优先级高的小朋友拿到的糖果数量一定比优先级低的小朋友拿到的糖果数量要多。

那么，这就意味着，我们给某个小朋友分糖果的时候，一定要判断一下他的左右邻居拿到的糖果数量。可是这样就有一个问题，我们在遍历队列的时候，是无法知道某个小朋友的右边的邻居的糖果数量的，因为我们还没有给下一个小朋友分糖果。

也就是说，一次遍历，只能判断先前分配过糖果的数量是否满足要求。如果想要判断所有是否满足，最简单的方式就是双重循环，每一次遍历都纠正错误分配的糖果数量。但是这种方法属于暴力解法，方法不可取。

我们从左到右遍历一遍队列，对$Rating[i] > Rating[i-1]$，所分配的糖果是满足条件$Candy[i] > Candy[i-1]$的。我们从右到左遍历一遍队列，对$Rating[i] > Rating[i+1]$，所分配的糖果是满足条件$Candy[i] > Candy[i+1]$的。如果我们将两次遍历的结果整合起来，就得到了我们所需要的结果。

现在，我们来看一下循环分配糖果的结果。

```
Ratings:  12,  4,  3, 11, 34, 34,  1, 67

LeftScan:  1,  1,  1,  2,  3,  1,  1,  2
RightScan: 3,  2,  1,  1,  1,  2,  1,  1

Scan:      3,  2,  1,  2,  3,  2,  1,  2
```

### Algorithm

在实际的代码实现中，我们可以合并从右到左的遍历和整合两次遍历结果的代码。这样，我们就可以仅用一个数组就可以实现算法逻辑。

```cpp
class Solution {
public:
    int candy(vector<int>& ratings) {
        int num[ratings.size()], sum = 0;
        for (int i = 0; i < ratings.size(); i++) {
            if (i == 0 || ratings[i-1] >= ratings[i]) {
                num[i] = 1;
            } else {
                num[i] = num[i-1] + 1;
            }
        }
        for (int i = ratings.size() - 1; i >= 0; i--) {
            if (i + 1 < ratings.size() && ratings[i] > ratings[i+1]) {
                num[i] = max(num[i], num[i+1] + 1);
            }
            sum += num[i];
        }
        return sum;
    }
};
```

### Complexity Analysis

* 时间复杂度：$O(n)$。
* 空间复杂度：$O(1)$。

## Approach #2 Climb Scan

### Intuition

实际上，本题还有一种仅需要遍历一次队列即可求解的方案，并且这种方案仅需要使用常数空间。

现在我们来分析一下方案一中的例子。

```
Ratings:  12,  4,  3, 11, 34, 34,  1, 67

Scan:      3,  2,  1,  2,  3,  2,  1,  2
```

可以发现，这实际上就相当于一个爬山的过程，要么在上坡，要么在下坡，或者直走。如果数据更多，可以观察到下坡的终点都是1，上坡的起点都是1，并且平移只会发生在1上。

那么，我们以一个上坡-下坡为周期，遍历一次队列。下面观察一个更加复杂的例子。

```
Ratings: [1 2 3 4 5 3 2 1 2 6 5 4 3 3 2 1 1 3 3 3 4 2]
```

如果我们以遇到$Rating[i] < Rating[i+1]$称为上坡，以遇到$Rating[i]>Rating[i+1]$称为下坡，那么有如下数据。

```
Ratings: 1, 2, 3, 4, 5, 3, 2, 1, 2
Up:      +  +  +  +
Down:                -  -  -
```

我们可以将每个周期的糖果数量分成三部分：上坡、坡顶、下坡。那么有

$CandyUp=\frac{(1+Up)*Up}{2}$

$CandyTop=Max(Up+1,Down+1)$

$CandyDown=\frac{(2+Down)*(Down-1)}{2}$

这里有一个问题，就是如果$Down$为0，那么$CandyDown=-1$。我们可以将$Up、Down$都为0的情况单独拿出来讨论，因为两者为零的时候表示是平移，前面的讨论也证实了平移只会发生在糖果数量为1的情况。

那么如果$Up \ne 0$，比如下列的例子。

```
Ratings: 1, 3, 3, 3, 4, 2
Up:      +        +
Down:                -
```

前面单独一个1构成了一个周期，并且计算出$CandyUp=1$、$CandyTop=2$、$CandyDown=-1$。可以发现实际上这种情况虽然单独一个1构成了周期，但是也囊括了3在周期里面，并且计算的结果还比正确值少1。

不过，按照上坡-下坡作为周期，那3必定会被再次计算一次，在$Up=Down=0$的情况下，$Candy=1$，这时候，刚好与$CandyDown$相抵消，因此这种计算方式是正确的。

### Algorithm

```cpp
class Solution {
public:
    int candy(vector<int>& ratings) {
        int start = 0, sum = 0;
        while (start < ratings.size()) {
            int up = 0, down = 0;
            while (start + 1 < ratings.size() && ratings[start] < ratings[start+1]) {
                start++;
                up++;
            }
            while (start + 1 < ratings.size() && ratings[start] > ratings[start+1]) {
                start++;
                down++;
            }
            if (up == 0 && down == 0) {
                sum += 1;
                start++;
                continue;
            }
            sum += (1+up)*up/2 + (max(up, down)+1) + (2+down)*(down-1)/2;
        }
        return sum;
    }
};
```

### Complexity Analysis

* 时间复杂度：$O(n)$。
* 空间复杂度：$O(1)$。

## Finally

这道题不是很难，不过方案二思路比较新奇。







