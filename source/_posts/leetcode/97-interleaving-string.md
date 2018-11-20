---
title: LeetCode | 97 Interleaving String
date: 2018-11-20
categories: LeetCode
---

## Description

Given *s1*, *s2*, *s3*, find whether *s3* is formed by the interleaving of *s1* and *s2*.

<!-- more -->

**Example 1:**

```
Input: s1 = "aabcc", s2 = "dbbca", s3 = "aadbbcbcac"
Output: true
```

**Example 2:**

```
Input: s1 = "aabcc", s2 = "dbbca", s3 = "aadbbbaccc"
Output: false
```

## Approach #1 Dynamic Programming

### Intuition

这道题最简单的方式就是递归，但是递归的形式很暴力。本题需要判断$S3$是否为$S1、S2$的交错构成的字符串，实际上，交错问题可以划分为子交错问题进行求解。

我们假定$DP[i][j]$为$S1[:i]、S2[:j]$的交错问题的答案，即需要判断$S3[:i+j]$是否为$S1[:i]、S2[:j]$交错构成的字符串。那么，$DP[i][j]$跟$DP[i-1][j]$和$DP[i][j-1]$的值密切相关。

我们可以得到如下的表达式：

$$
\begin{equation}
DP[i][j]=\left\{
\begin{aligned}
False & , & (j=0 \ and \ S1[:i] \ne S3[:i]) \\
False & , & (i=0 \ and \ S2[:j] \ne S3[:j]) \\
True & , & (j=0 \ and \ S1[:i]=S3[:i]) \ or \ (i=0 \ and \ S2[:j]=S3[:j]) \\
DP[i-1][j] & , & DP[i-1][j]=True \ and \ S1[i-1]=S3[i+j-1] \\
DP[i][j-1] & , & DP[i][j-1]=True \ and \ S2[j-1]=S3[i+j-1] \\
False & , & Otherwise.
\end{aligned}
\right.
\end{equation}
$$

那么，最终$DP[S1.length][S2.length]$就是交错问题的答案。

### Algorithm

```cpp
class Solution {
public:
    bool isInterleave(string s1, string s2, string s3) {
        if (s1.length() + s2.length() != s3.length()) {
            return false;
        }
        bool dp[s1.length()+1][s2.length()+1];
        memset(dp, 0, sizeof(dp));
        dp[0][0] = true;
        for (int i = 0; i <= s1.length(); i++) {
            dp[i][0] = s1.substr(0, i) == s3.substr(0, i);
        }
        for (int j = 0; j <= s2.length(); j++) {
            dp[0][j] = s2.substr(0, j) == s3.substr(0, j);
        }
        for (int i = 1; i <= s1.length(); i++) {
            for (int j = 1; j <= s2.length(); j++) {
                dp[i][j] = (s1[i-1] == s3[i+j-1] && dp[i-1][j])
                    || (s2[j-1] == s3[i+j-1] && dp[i][j-1]);
            }
        }
        return dp[s1.length()][s2.length()];
    }
};
```

### Complexity Analysis

* 时间复杂度：$O(mn)$，其中$m$为字符串$S1$的长度，$n$为字符串$S2$的长度。
* 空间复杂度：$O(mn)$，其中$m$为字符串$S1$的长度，$n$为字符串$S2$的长度。

## Approach #2 Pointer move with stack

### Intuition

现在我们来分析一下暴力递归的做法，使用两个指针指向字符串$S1、S2$的头部，然后从左到右遍历，根据三个字符串的值来判断是否满足交错问题匹配。

这种做法在遇到两个指针指向的字符都相同的情况，需要分叉递归判断是否满足匹配。如果分叉不满足还需要回退，因此算法所用的时间呈指数增长。但是，实际上，我们可以分析指针指向的字符相同的情况，从而优化这种算法。

首先使用两个变量存储$S1、S2$当前需要处理的字节的下标，充当指针，这里我们记为$i、j$。首先，有如下几种情况。

* 如果$S1[i]=S3[i+j]$且$S2[j] \ne S3[i+j]$，那么我们可以将指针$i$右移一位。
* 如果$S1[i] \ne S3[i+j]$且$S2[j]=S3[i+j]$，那么我们可以将指针$j$右移一位。
* 如果$S1[i] \ne S3[i+j]$且$S2[j] \ne S3[i+j]$，那么匹配失败，需要回退。(暂时不考虑回退的具体步骤)
* 如果$S1[i]=S3[i+j]$且$S2[j]=S3[i+j]$，那么情况及其复杂。(接下来分析)

我们知道当两个指针都可以右移变成另一个子问题的时候，我们就必须要考虑到能否解决子问题，这里必须分开讨论两种不同的情况。因为分情况讨论无法避免，那么有没有可能优化其做法呢？

如果只扫描$S3[i+j]$的值，是没有办法避免分情况讨论的，但是我们可以扫描$S3[i+j]$之后的字符，我们将跟$S3[i+j]$值相同的字符都扫描出来，直到遇到第一个与其值不同的字符。因为此时$S1[i]、S2[j]、S3[i+j]$的值相同，扫描$S3$，必然也需要扫描$S1$和$S2$。

我们记扫描得到的相同字符的长度为$r1、r2、r3$，它们之间可以构成关系：

| r1与r3的关系 | r2与r3的关系 |            匹配方案             |
| :----------: | :----------: | :-----------------------------: |
| $r1 \le r3$  | $r2 \le r3$  |          无法直接匹配           |
| $r1 \le r3$  |  $r2 > r3$   | $i$右移$r1$位，$j$右移$r3-r1$位 |
|  $r1 > r3$   | $r2 \le r3$  | $i$右移$r3-r2$位，$j$右移$r2$位 |
|  $r1 > r3$   |  $r2 > r3$   |          无法直接匹配           |

| r1、r2与r3的关系 |           匹配方案           |
| :--------------: | :--------------------------: |
|  $r1 + r2 < r3$  |        匹配失败，回退        |
|  $r1 + r2 = r3$  | $i$右移$r1$位，$j$右移$r2$位 |
|  $r1 + r2 > r3$  |         无法直接匹配         |

根据这两个表格的策略，可以解决大部分分情况讨论的问题。但是，最终还是有少数分支无法直接去解决，那么这个时候必然要需要分支考虑。

但是，由于只有两个分支，要么选择$i$右移，要么选择$j$右移，我们可以考虑其中一种分支，然后将另一种分支存储到栈中。这样，回退的时候可以直接出栈，直接恢复成另一种分支。

如果匹配顺利，那么最终$i、j$均指向字符串的尾部。

### Algorithm

```cpp
class Solution {
private:
    int getRepeats(string &str, int index) {
        int res = 1;
        for (int i = index + 1; str[i] == str[index] && i < str.length(); i++) {
            res++;
        }
        return res;
    }

public:
    bool isInterleave(string s1, string s2, string s3) {
        if (s1.length() + s2.length() != s3.length()) {
            return false;
        }
        stack<pair<int, int>> s;
        for (int i = 0, j = 0; i < s1.length() || j < s2.length();) {
            if (s1[i] == s3[i+j] && s2[j] != s3[i+j]) {
                i++;
            } else if (s1[i] != s3[i+j] && s2[j] == s3[i+j]) {
                j++;
            } else if (s1[i] != s3[i+j] && s2[j] != s3[i+j]) {
                if (s.size() == 0) {
                    return false;
                } else {
                    i = s.top().first;
                    j = s.top().second;
                    s.pop();
                }
            } else {
                int r1 = getRepeats(s1, i);
                int r2 = getRepeats(s2, j);
                int r3 = getRepeats(s3, i + j);
                if (r1 + r2 == r3) {
                    i += r1;
                    j += r2;
                } else if (r3 >= r1 && r3 < r2) {
                    i += r1;
                    j += r3 - r1;
                } else if (r3 >= r2 && r3 < r1) {
                    i += r3 - r2;
                    j += r2;
                } else {
                    if (r1 + r2 < r3) {
                        if (s.size() == 0) {
                            return false;
                        } else {
                            i = s.top().first;
                            j = s.top().second;
                            s.pop();
                        }
                    } else {
                        s.push(make_pair(i, j + r2));
                        i += r1;
                    }
                }
            }
        }
        return true;
    }
};
```

## Finally

这道题也不算太难，不过一开始采用暴力递归的时候还TLE了，才决定直接使用DP来做。AC之后看了一下讨论区，发现居然可以优化递归。

