---
title: Algo | LeetCode 87 Scramble String
date: 2018-11-18
categories: Algorithm Analysis and Implementation
tags:
- LeetCode
---

## Description

Given a string *s1*, we may represent it as a binary tree by partitioning it to two non-empty substrings recursively.

<!-- more -->

Below is one possible representation of *s1* = `"great"`:

```
    great
   /    \
  gr    eat
 / \    /  \
g   r  e   at
           / \
          a   t
```

To scramble the string, we may choose any non-leaf node and swap its two children.

For example, if we choose the node `"gr"` and swap its two children, it produces a scrambled string `"rgeat"`.

```
    rgeat
   /    \
  rg    eat
 / \    /  \
r   g  e   at
           / \
          a   t
```

We say that `"rgeat"` is a scrambled string of `"great"`.

Similarly, if we continue to swap the children of nodes `"eat"` and `"at"`, it produces a scrambled string `"rgtae"`.

```
    rgtae
   /    \
  rg    tae
 / \    /  \
r   g  ta  e
       / \
      t   a
```

We say that `"rgtae"` is a scrambled string of `"great"`.

Given two strings *s1* and *s2* of the same length, determine if *s2* is a scrambled string of *s1*.

**Example 1:**

```
Input: s1 = "great", s2 = "rgeat"
Output: true
```

**Example 2:**

```
Input: s1 = "abcde", s2 = "caebd"
Output: false
```

## Approach #1 Recursion

### Intuition

给定字符串$S$和$T$，判断两者是否满足混淆的条件。而混淆的条件是将字符串以树的形式交换兄弟节点。

实际上这道题是一道递归的题目，我们可以发现混淆是将字符串分成两段，然后交换这两段，构成一个新的字符串。那么对于任意一个字符串，我们有如下的混淆方案。

```
S -> T

1. S == T
2. S_left -> T.left, S_right -> T.right
3. S_left -> T.right, S_right -> T.left
```

可以观察到`->`混淆操作实际上就是一个递归的过程，条件1是递归基，条件2、3是递归本体。我们每一层递归都将字符串分割成左右节点，然后判断分割后的$S$能否通过混淆操作得到$T$。当$S=T$时，我们就认定混淆操作能达到目的。

但是，我们并不能确定分割字符串的位置，因为在任何位置都可以将字符串分割成左右节点。因此，我们要遍历递归，左右字符串的长度是不确定的，所有长度值都要判断是否能满足混淆条件。

因为每个长度都要判断，那么如果一直递归到最终$S$的长度为1，将会开销很大。为了将某些可以提前判断为不满足混淆条件的分支剪掉，我们需要每次递归判断一下$S$和$T$包含的字符是否相同。如果不相同，那肯定是无法通过混淆操作使$S$变成$T$的。

最终，只要简单处理一下每次递归的结果，就可以知道原本的字符串$S$、$T$是否满足条件了。

### Algorithm

```cpp
class Solution {
public:
    bool isScramble(string s1, string s2) {
        if (s1 == s2) {
            return true;
        }
        int count[26] = {0};
        for (int i = 0; i < s1.length(); i++) {
            count[s1[i]-'a']++;
        }
        for (int i = 0; i < s2.length(); i++) {
            count[s2[i]-'a']--;
            if (count[s2[i]-'a'] < 0) {
                return false;
            }
        }
        for (int i = 1; i < s1.length(); i++) {
            if (isScramble(s1.substr(0, i), s2.substr(0, i)) && isScramble(s1.substr(i), s2.substr(i))) {
                return true;
            }
            if (isScramble(s1.substr(0, i), s2.substr(s2.length()-i)) && isScramble(s1.substr(i), s2.substr(0, s2.length()-i))) {
                return true;
            }
        }
        return false;
    }
};
```

## Finally

这是一道简单的递归题目，需要留意的是可能漏掉任意长度都需要递归的情况。

