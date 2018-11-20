---
title: LeetCode | 72 Edit Distance
date: 2018-11-10
categories: LeetCode
---

## Description

Given two words *word1* and *word2*, find the minimum number of operations required to convert *word1* to *word2*.

You have the following 3 operations permitted on a word:

1. Insert a character
2. Delete a character
3. Replace a character

<!-- more -->

**Example 1:**

```
Input: word1 = "horse", word2 = "ros"
Output: 3
Explanation: 
horse -> rorse (replace 'h' with 'r')
rorse -> rose (remove 'r')
rose -> ros (remove 'e')
```

**Example 2:**

```
Input: word1 = "intention", word2 = "execution"
Output: 5
Explanation: 
intention -> inention (remove 't')
inention -> enention (replace 'i' with 'e')
enention -> exention (replace 'n' with 'x')
exention -> exection (replace 'n' with 'c')
exection -> execution (insert 'u')
```

## Approach #1 Dynamic Programming

### Intuition

这是一道简单的动态规划题目。

题目要求是将一个字符串通过若干次三种操作的执行变成另一个字符串，其中操作包括插入一个字符、删除一个字符、更换一个字符。很明显，三种操作都是对单个字符操作。那么对于两个字符串S、T需要执行操作的最小次数，我们可以将其视为$MinOpr[S,T]$，该值必定与$MinOpr[S[:S.len-1], T]$、$MinOpr[S, T[:T.len-1]]$、$MinOpr[S[:S.len-1], T[:T.len-1]]$相关。

 我们假定$DP[i][j]$为字符串$S[:i]$、$T[:j]$执行操作后满足题意条件的最少操作数量，那么有如下的公式：

* 如果$i=0$，有$DP[i][j]=j$。
* 如果$j=0$，有$DP[i][j]=i$。
* 如果$i \ne 0, j \ne 0$，且$S[i-1]=T[j-1]$，有$DP[i][j]=DP[i-1][j-1]$。
* 如果$i \ne 0, j \ne 0$，且$S[i-1] \ne T[j-1]$，有$DP[i][j]=Min\{DP[i-1][j-1], DP[i-1][j], DP[i][j-1]\} + 1$。

最后一条公式的理解其实很简单：在确保了$S[:i-1]$变成$T[:j-1]$所需要的操作次数之后，将$S[i-1]$变成$T[j-1]$即可；在确保了$S[:i-1]$变成$T[:j]$所需要的操作次数之后，删除$S[i-1]$即可；在确保了$S[:i]$变成$T[:j-1]$所需要的操作次数之后，添加$T[j-1]$即可。因此找到三者的最小值，再加上这一次操作。

最终，所求得的$DP[S.len][T.len]$就是最终将$S$字符串变为$T$字符串所需要的最少操作次数。

### Algorithm

```c++
class Solution {
public:
    int minDistance(string word1, string word2) {
        int dp[word1.length() + 1][word2.length() + 1] = {0};
        for (int i = 1; i <= word1.length(); i++) {
            dp[i][0] = i;
        }
        for (int j = 1; j <= word2.length(); j++) {
            dp[0][j] = j;
        }
        for (int i = 1; i <= word1.length(); i++) {
            for (int j = 1; j <= word2.length(); j++) {
                if (word1[i-1] == word2[j-1]) {
                    dp[i][j] = dp[i-1][j-1];
                } else {
                    dp[i][j] = min({ dp[i-1][j-1], dp[i-1][j], dp[i][j-1] }) + 1;
                }
            }
        }
        return dp[word1.length()][word2.length()];
    }
};
```

### Complexity Analysis

* 时间复杂度：$O(|S| \cdot |T|)$。
* 空间复杂度：$O(|S| \cdot |T|)$。

## Finally

本题是一道简单的动态规划算法题。



