---
title: Algo | LeetCode 76 Minimum Window Substring
date: 2018-10-30
categories: Algorithm Analysis and Implementation
tags:
- LeetCode
---

从本次作业开始，决定使用C++，再不用C++就忘光了。

## Description

Given a string S and a string T, find the minimum window in S which will contain all the characters in T in complexity O(n).

<!-- more -->

**Example:**

```
Input: S = "ADOBECODEBANC", T = "ABC"
Output: "BANC"
```

**Note:**

- If there is no such window in S that covers all characters in T, return the empty string `""`.
- If there is such window, you are guaranteed that there will always be only one unique minimum window in S.

## Approach #1 Sliding Window

### Intuition

首先提一下这道题的数据，如果输入的T为`AA`，那么输出的应该是包含两个`A`的字符串，即重复的字符不能只算一个。

由于需要输出的是包含T所有字符的最小窗口，在只知道S的情况下，我们所要找的就是这个最小窗口的起始地址和长度，或者需要找的是这个最小窗口的起始地址和终止地址。两者都是一样的，为了方便使用`substring`方法获取子串，我们选择计算前者的值。

那么，现在问题就变成了如何确定最小窗口的起始地址和长度。需要确定最小窗口，那么必然需要遍历所有窗口，遍历窗口最简单暴力的方式是两重嵌套循环。

```
For start In 0 ... s.length       # [0, s.length)
    For end In 0 .. s.length      # [0, s.length]
        check window s[start:end]
    End
End
```

但是这样复杂度会很高，题目要求是在$O(n)$复杂度内解决问题。实际上，由于两重循环都是在S上操作，我们可以假设`start`和`end`是S上的两个指针。(取前闭后开)

在解决问题的过程中，并不需要遍历所有窗口，因为我们需要的窗口是包含T所有字符的，如果能确保某些窗口是不符合条件的，那就可以直接跳过这些窗口。

我们假设目前$s[start:end]$是恰巧符合要求的窗口，即子串前后不存在多余的字符，那么对于$\forall i \ge start, j \le end$，如果$i=start$与$j=end$不同时成立，那窗口$s[i:j]$不需要检验。

当然，有一种情况例外。上述的排除窗口的方法，是建立在我们找到第一个恰巧符合要求的窗口，因此在找到这个窗口之前，所有窗口都必须检验。那么如何找到这个窗口呢，下面举个例子来说明一下。

```c++
Input: S = "ADOBECODEBANC", T = "ABC"
Output: "BANC"

start = 0, end = 0, sub = "";
start = 0, end = 1, sub = "A";
start = 0, end = 2, sub = "AD";
start = 0, end = 3, sub = "ADO";
start = 0, end = 4, sub = "ADOB";
start = 0, end = 5, sub = "ADOBE";
start = 0, end = 6, sub = "ADOBEC"; // match
```

将`end`指针一直递增，直到包含到T内的所有字符，然后将`start`递增，直到恰巧包含T内所有字符。那么这个时候，我们就找到了恰巧符合要求的窗口。此时，`s[0:6]`的所有子串都不可能是符合要求的窗口，那么可以直接不检验这些窗口。

还有另一类窗口也不需要，目前$s[start:end]$是恰巧符合要求的窗口，那$\forall i > end$，$s[start:i]$也是符合要求的窗口，但是相当于$s[start:end]$而言，不可能是最小窗口，因为它们并不是恰巧符合要求。

两种可以忽略的窗口类型表明了此时不能移动`end`指针，那此时只能移动`start`指针，并且窗口将变成不符合要求。为了让窗口符合要求，我们需要将`end`指针一直递增，直到包含到T内的所有字符，然后将`start`递增，直到恰巧包含T内所有字符。

```c++
Input: S = "ADOBECODEBANC", T = "ABC"
Output: "BANC"

start = 0, end = 6, sub = "ADOBEC"; // match

start = 1, end = 6, sub = "DOBEC";
start = 1, end = 7, sub = "DOBECO";
start = 1, end = 8, sub = "DOBECOD";
start = 1, end = 9, sub = "DOBECODE";
start = 1, end = 10, sub = "DOBECODEB";
start = 1, end = 11, sub = "DOBECODEBA";
start = 2, end = 11, sub = "OBECODEBA";
start = 3, end = 11, sub = "BECODEBA";
start = 4, end = 11, sub = "ECODEBA";
start = 5, end = 11, sub = "CODEBA"; // match

start = 6, end = 11, sub = "ODEBA";
start = 6, end = 12, sub = "ODEBAN";
start = 6, end = 13, sub = "ODEBANC";
start = 7, end = 13, sub = "DEBANC";
start = 8, end = 13, sub = "EBANC";
start = 9, end = 13, sub = "BANC"; // match
```

此时最小的恰巧符合要求的窗口就是我们所要求的最小窗口。

依次循环，就得到了如下的算法：

1. `start`、`end`指针指向字符串S的首部。
2. `end`指针右移，直到$S[start:end]$包含T内所有字符。
3. `start`指针右移，直到$S[start:end]$恰巧包含T内所有字符。
4. 记录当前窗口的位置。
5. `start`指针右移，直到$S[start:end]$不符合要求。
6. 重复执行2、3、4、5步骤，直到`start`指针指向S的尾部的下一位，或者`end`指针指向S的尾部的下两位。
7. 在记录的窗口中找到最小窗口。

### Algorithm

```c++
class Solution {
public:
    string minWindow(string s, string t) {
        map<char, int> remain;
        for (int i = 0; i < t.length(); i++) {
            remain[t[i]]++;
        }
        int start = 0, end = 0, pass = 0, left = 0, min = INT_MAX;
        while (start < s.length() && end <= s.length()) {
            if (pass != t.length()) {
                if (end == s.length()) {
                    break;
                }
                remain[s[end]]--;
                if (remain[s[end]] >= 0) {
                    pass++;
                }
                end++;
            } else {
                if (min > end - start) {
                    left = start;
                    min = end - start;
                }
                remain[s[start]]++;
                if (remain[s[start]] > 0) {
                    pass--;
                }
                start++;
            }
        }
        return min == INT_MAX ? "" : s.substr(left, min);
    }
};
```

### Complexity Analysis

* 时间复杂度：$O(|S|+|T|)$，实际上为$O(2 \times |S| + |T|)$。
* 空间复杂度：$O(|S|+|T|)$。

## Approach #2 Optimized Sliding Window

### Intuition

方法一用两个指针实现滑动窗口，在时间复杂度为$O(2 \times |S| + |T|)$的情况下求得最小合法窗口。但是可以观察到，两个指针均遍历了一次字符串S，但实际上S中很多字符并不存在T中。

方法一中使用了Map来记录需要检验的字符的数量，但是在检验合法性过程中也检验了不存在T中的字符，实际上这些字符都不需要扫描的。

如果我们将S中多余的字符都删去，然后按照方法一的方式找到的窗口，实际上就是方法一所求得的窗口删去多余字符。那么，如果删除多余字符的操作是可逆的，那是不是意味着窗口的恢复也是可逆的。

我们可以将有用字符在S中的下标全都记录下来，然后删除多余字符得到字符串$S'$。通过$S'$所求到的窗口的首部位置和尾部位置，然后再回到记录中找回其在$S$中的相应的位置，这样就恢复了窗口。

对于范例数据，有如下的步骤：

```c++
Input: S = "ADOBECODEBANC", T = "ABC"
Output: "BANC"
    
S_ = "ABCBAC", T = "ABC"
Map = [ ('A',0), ('B',3), ('C',5), ('B',9), ('A',10), ('C',12) ]

start = 0, end = 0, sub = "";
start = 0, end = 1, sub = "A";
start = 0, end = 2, sub = "AB";
start = 0, end = 3, sub = "ABC"; // match
recover:
start = Map[0] = 0, end = Map[2] + 1 = 6, sub = "ADOBEC";

start = 1, end = 3, sub = "BC";
start = 1, end = 4, sub = "BCB";
start = 1, end = 5, sub = "BCBA";
start = 2, end = 5, sub = "CBA"; // match
recover:
start = Map[2] = 5, end = Map[4] + 1 = 11, sub = "CODEBA";

start = 3, end = 5, sub = "BA";
start = 3, end = 6, sub = "BAC"; // match
recover:
start = Map[3] = 9, end = Map[5] + 1 = 13, sub = "BANC";
```

很明显，所需要的步骤比方法一要少。

### Algorithm

```c++
class Solution {
public:
    string minWindow(string s, string t) {
        map<char, int> remain;
        vector<pair<char, int> > filter;
        for (int i = 0; i < t.length(); i++) {
            remain[t[i]]++;
        }
        for (int i = 0; i < s.length(); i++) {
            if (remain.count(s[i])) {
                filter.push_back(make_pair(s[i], i));
            }
        }
        int start = 0, end = 0, pass = 0, left = 0, min = INT_MAX;
        while (start < filter.size() && end <= filter.size()) {
            if (pass != t.length()) {
                if (end == filter.size()) {
                    break;
                }
                remain[filter[end].first]--;
                if (remain[filter[end].first] >= 0) {
                    pass++;
                }
                end++;
            } else {
                if (min > filter[end-1].second - filter[start].second + 1) {
                    left = filter[start].second;
                    min = filter[end-1].second - filter[start].second + 1;
                }
                remain[filter[start].first]++;
                if (remain[filter[start].first] > 0) {
                    pass--;
                }
                start++;
            }
        }
        return min == INT_MAX ? "" : s.substr(left, min);
    }
};
```

### Complexity Analysis

* 时间复杂度：$O(|S|+|T|)$，实际上为$O(2 \times |S\_Filter| + |S| + |T|)$。
* 空间复杂度：$O(|S| + |T|)$。

## Finally

这道题实际上还是有点难度的，想了蛮久，也看了一下论坛。

