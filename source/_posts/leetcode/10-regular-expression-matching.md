---
title: LeetCode | 10 Regular Expression Matching
date: 2018-9-15
categories: LeetCode
---

## Description

[LeetCode 10 Regular Expression Matching](https://leetcode.com/problems/regular-expression-matching/description/)

Given an input string (`s`) and a pattern (`p`), implement regular expression matching with support for `'.'` and `'*'`.

```
'.' Matches any single character.
'*' Matches zero or more of the preceding element.
```

The matching should cover the **entire** input string (not partial).

<!-- more -->

**Note:**

- `s` could be empty and contains only lowercase letters `a-z`.
- `p` could be empty and contains only lowercase letters `a-z`, and characters like `.` or `*`.

**Example 1:**

```
Input:
s = "aa"
p = "a"
Output: false
Explanation: "a" does not match the entire string "aa".
```

**Example 2:**

```
Input:
s = "aa"
p = "a*"
Output: true
Explanation: '*' means zero or more of the precedeng element, 'a'. Therefore, by repeating 'a' once, it becomes "aa".
```

**Example 3:**

```
Input:
s = "ab"
p = ".*"
Output: true
Explanation: ".*" means "zero or more (*) of any character (.)".
```

**Example 4:**

```
Input:
s = "aab"
p = "c*a*b"
Output: true
Explanation: c can be repeated 0 times, a can be repeated 1 time. Therefore it matches "aab".
```

**Example 5:**

```
Input:
s = "mississippi"
p = "mis*is*p*."
Output: false
```

## Approach #1 Recursion

### Intuition

本题是简单的正则匹配，涉及到的规则只有两条：`.`可以替代任意字符，`*`为前一个字符的Kleene闭包。那么可以简单将正则匹配分为下面几类。

（令`x/y`表示某个特定字符，令`+`表示正闭包，下面情况酌情采用括号分割给定字符串）

**对于模式为空的情况：**

| string | pattern | isMatch |
| :----: | :-----: | :-----: |
|   空   |   空    |  True   |
|  `y+`  |   空    |  False  |

**对于模式不为空、且第一个模式匹配字符可为任意字符的情况：**

| string | pattern  |         isMatch         |
| :----: | :------: | :---------------------: |
|   空   | `.`/`.x` |          False          |
|  `y+`  | `.`/`.x` | `isMatch(s[1:], p[1:])` |
|   空   |   `.*`   |   `isMatch(s, p[2:])`   |
|  `y+`  |   `.*`   |     需匹配任意长度      |

**对于模式不为空、且第一个模式匹配字符不为任意字符的情况：**

| string | pattern |         isMatch         |
| :----: | :-----: | :---------------------: |
|   空   |  `x+`   |          False          |
|  `y+`  |  `x+`   |    False (`x != y`)     |
|  `x+`  |  `x+`   | `isMatch(s[1:], p[1:])` |
|   空   |  `x*`   |   `isMatch(s, p[2:])`   |
|  `y+`  |  `x*`   |     需匹配任意长度      |

按上述所列举的情况，通过递归的方式，可以将最初的字符串和匹配字符串一步步截取，直到最终可以直接判断是否匹配。

### Algorithm

这种方法是最粗暴的方法，直接将匹配的所有情况都列举出来，然后实现算法。

```go
func isMatch(s string, p string) bool {
	if len(s) == 0 && len(p) == 0 {
		return true
	} else if len(p) == 0 && len(s) != 0 {
		return false
	} else if p[0] == '.' && (len(p) == 1 || p[1] != '*') {
		if len(s) == 0 {
			return false
		}
		return isMatch(s[1:], p[1:])
	} else if p[0] == '.' {
		if isMatch(s, p[2:]) {
			return true
		}
		for i := 0; i < len(s); i++ {
			if isMatch(s[i+1:], p[2:]) {
				return true
			}
		}
	} else {
		if len(p) != 1 && p[1] == '*' {
			if isMatch(s, p[2:]) {
				return true
			}
			if len(s) != 0 {
				c := p[0]
				for i := 0; i < len(s) && c == s[i]; i++ {
					if isMatch(s[i+1:], p[2:]) {
						return true
					}
				}
			}
		} else if len(s) == 0 {
			return false
		} else if p[0] == s[0] {
			return isMatch(s[1:], p[1:])
		} else {
			return false
		}
	}
	return false
}
```

## Approach #2 Recursion

### Intuition

方法二跟方法一类似，采用了递归的方法。但是在出现Kleene闭包的时候，由于Kleene闭包的性质，我们可以在递归是不删除Kleene闭包的匹配字符。

因为$x* = x(x*)$，所以对于某个字符串`xy+`如果符合`x*y+`匹配字符，那么字符串`y+`也必定符合`x*y+`匹配字符。因此很轻松处理Kleene闭包匹配，而不需要用循环把各种情况都计算一遍。虽然在复杂度上区别不大，但是代码编写会很美观。

### Algorithm

无论是有Kleene闭包，还是无Kleene闭包，我们均需要判断第一个字符是否匹配。因为Kleene闭包匹配符必定会出现在第二个字符或之后。因此我们可以将需要重复判断的第一个字符的匹配提前判断，然后再递归。

```go
func isMatch(s string, p string) bool {
	if len(p) == 0 {
		return len(s) == 0
	}
	firstMatch := len(s) != 0 && (s[0] == p[0] || p[0] == '.')
	if len(p) > 1 && p[1] == '*' {
		return isMatch(s, p[2:]) || (firstMatch && isMatch(s[1:], p))
	}
	return firstMatch && isMatch(s[1:], p[1:])
}
```

## Approach #3 Dynamic Programming

### Intuition

本题还可以采用动态规划的方法来实现，可以假设`dp[i][j]`为`isMatch(s[i:], p[j:])`的结果。首先，可以得到$dp[len(s)][len(p)]=true$。然后根据方法二的算法，从后往前一步步推出$dp$二维数组的所有值。

$dp[0][0]$即为本题的最终结果。

### Algorithm

因为当匹配字符串P为空时，仅有S也为空的情况下才满足正则匹配。所以对于$dp[0:len(S)-1][len(P)]$，我们可以直接默认其为false，而$dp[len(s)][len(p)]=true$，可以省去二维数组中最后一列的计算。

```go
func isMatch(s string, p string) bool {
	lenS, lenP := len(s), len(p)
	dp := make([][]bool, lenS+1)
	for i := 0; i <= lenS; i++ {
		dp[i] = make([]bool, lenP+1)
	}
	dp[lenS][lenP] = true
	for i := lenS; i >= 0; i-- {
		for j := lenP - 1; j >= 0; j-- {
			firstMatch := i != lenS && (s[i] == p[j] || p[j] == '.')
			if j+1 < lenP && p[j+1] == '*' {
				dp[i][j] = dp[i][j+2] || (firstMatch && dp[i+1][j])
			} else {
				dp[i][j] = firstMatch && dp[i+1][j+1]
			}
		}
	}
	return dp[0][0]
}
```

### Complexity Analysis

* 时间复杂度：$O(TP)$，当T、P为给定字符串和匹配字符串的长度时。
* 空间复杂度：$O(TP)$，当T、P为给定字符串和匹配字符串的长度时。

## Finally

正则匹配看起来不难，实际上刚刚拿到手开始打码的时候是没有思路。方法一采用了极其暴力的方法将一个正则匹配展开成非常多的条件判断，时间复杂度上非常高。方法二简化了很多步骤，实际上我在看别人的题解之前是没法想象这道题可以简化成这样。方法三用了动态规划的方法，从复杂度的角度上看，它没有最优解和最差解，时间都是一致的，而前两种的复杂度很大程度上受匹配字符串的影响。

