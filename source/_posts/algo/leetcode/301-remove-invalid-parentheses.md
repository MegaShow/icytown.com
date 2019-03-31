---
title: Algo | LeetCode 301 Remove Invalid Parentheses
date: 2018-10-18
categories: Algorithm Analysis and Implementation
tags:
- LeetCode
---

## Description

Remove the minimum number of invalid parentheses in order to make the input string valid. Return all possible results.

**Note:** The input string may contain letters other than the parentheses `(` and `)`.

<!-- more -->

**Example 1:**

```
Input: "()())()"
Output: ["()()()", "(())()"]
```

**Example 2:**

```
Input: "(a)())()"
Output: ["(a)()()", "(a())()"]
```

**Example 3:**

```
Input: ")("
Output: [""]
```

## Approach #1 Brute Force

### Intuition

判断一个字符串是否符合括号匹配并不难，由于只有一类括号，我们甚至可以不用栈就能实现括号匹配判断。通过使用一个变量来模拟栈顶位置，因为栈内元素只有一种值，这种方法在此前的文章中也有提及。

如果是暴力做法，那我们必须考虑所有移除的情况。不过，由于每个字符都有存在或不存在两种状态，那么所有情况为$2^n$种，即使是暴力做法，也应该考虑提前终止遍历的情况。

遍历的方法可以采用BFS来实现，记录当前字符串上一次删除字符的位置，从该位置开始考虑删除直到字符串尾部的所有情况。由于我们要找的是最长的合法字符串，那么当我们找到第一个符合括号匹配的合法字符串之后，应该停止往队列中增加新的项。

### Algorithm

由于考虑了$2^n$种情况，那么必然有部分解是一样的，我们必须使用集合来防止最终返回数组中存在重复的合法字符串。

```go
type item struct {
	str         string
	deleteIndex int
	deleteNum   int
}

func removeInvalidParentheses(s string) []string {
	queue := []item{{str: s}}
	resMap := make(map[string]bool, 0)
	deleteNum := math.MaxInt32
	for len(queue) > 0 {
		front := queue[0]
		queue = append(queue[1:])
		if front.deleteNum > deleteNum {
			continue
		}
		if check(front.str) {
			deleteNum = front.deleteNum
			resMap[front.str] = true
		} else {
			for i := front.deleteIndex; i < len(front.str); i++ {
				str := front.str[:i]
				if i+1 < len(front.str) {
					str += front.str[i+1:]
				}
				queue = append(queue, item{str: str, deleteNum: front.deleteNum + 1, deleteIndex: i})
			}
		}
	}
	var res []string
	for k := range resMap {
		res = append(res, k)
	}
	return res
}

func check(s string) bool {
	stackTop := -1
	for _, v := range s {
		if v == '(' {
			stackTop++
		} else if v == ')' {
			if stackTop == -1 {
				return false
			}
			stackTop--
		}
	}
	return stackTop == -1
}
```

### Complexity Analysis

* 时间复杂度：$O(n \cdot 2^n)$。
* 空间复杂度：$O(2^n)$。

## Approach #2 Backtracking

### Intuition

首先观察任一匹配的合法字符串，有下列特征：

* 取合法字符串`s`的任一子串`s[:i]`，其子串的左括号数量必定不少于右括号数量。

那么，如果我们是从左到右遍历处理字符串`s`，我们将不需要再次判断其子串是否符合括号匹配，而是可以通过记录左括号和右括号的数量，在遍历的同时对两者的值进行判断。

需要从左到右遍历处理字符串`s`，又要将所有子串都考虑一遍，那么可以考虑使用DFS来解决本题。

对于DFS，如果深度足够了，我们可以通过判断左括号和右括号的数量来判断该串是否合法，然后再根据当前已删除字符数量来判断是否将该情况视为最终解之一。

如果深度不够，那应该有如下几种深搜方案：

* 如果当前所处理的字符不是括号，那深度+1，该字符不可删除。
* 如果当前所处理的字符是括号，那深度+1，删除该字符以DFS。
* 如果当前所处理的字符是左括号，那深度+1，左括号数量+1。
* 如果当前所处理的字符是右括号，并且左括号数量大于右括号数量，那深度+1，右括号数量+1。

### Algorithm

```go
import "math"

var resMap map[string]bool
var minDeleteNum int

func removeInvalidParentheses(s string) (res []string) {
	resMap = make(map[string]bool)
	minDeleteNum = math.MaxInt32
	dfs(0, 0, 0, 0, s, "")
	for k := range resMap {
		res = append(res, k)
	}
	return
}

func dfs(depth, left, right, deleteNum int, s, str string) {
	if depth == len(s) {
		if left == right {
			if deleteNum < minDeleteNum {
				minDeleteNum = deleteNum
				resMap = make(map[string]bool)
			}
			if deleteNum == minDeleteNum {
				resMap[str] = true
			}
		}
	} else {
		if s[depth] != '(' && s[depth] != ')' {
			dfs(depth+1, left, right, deleteNum, s, str+string(s[depth]))
		} else {
			dfs(depth+1, left, right, deleteNum+1, s, str)
			if s[depth] == '(' {
				dfs(depth+1, left+1, right, deleteNum, s, str+"(")
			} else if left > right {
				dfs(depth+1, left, right+1, deleteNum, s, str+")")
			}
		}
	}
}
```

### Complexity Analysis

* 时间复杂度：$O(2^n)$。
* 空间复杂度：$O(n)$。

## Approach #3 Limited Backtracking

### Intuition

方法二相比方法一复杂度已经简化了很多，但是实际上还有很多不必要的计算。方法二的DFS考虑到了可以删除任一字符，于是复杂度达到了$O(2^n)$，并且`deleteNum`也是不确定的，是在DFS的过程中逐渐找出来的。

由于要找到的是最长的合法字符串，并且结合方法二所提到的匹配字符串的特征，那我们实际上可以在一开始就确定需要删除的左括号和右括号数量。通过下面算法可以确定删除的数量：

1. 遍历字符串`s`的每个字符。
2. 如果当前字符为`(`，那么`leftRem++`。
3. 如果当前字符为`)`，且`leftRem`不为零，那么`leftRem--`。
4. 如果当前字符为`)`，且`leftRem`为零，那么`rightRem++`。
5. 最终所得的`leftRem`、`rightRem`即为需要删除的左括号和右括号数量。

那么，利用方法二的算法，将需要删除字符的部分修改为对`leftRem`、`rightRem`的判断，即可实现剪枝。

### Algorithm

```go
var resMap map[string]bool

func removeInvalidParentheses(s string) (res []string) {
	resMap = make(map[string]bool)
	var leftRem, rightRem int
	for _, v := range s {
		if v == '(' {
			leftRem++
		} else if v == ')' && leftRem == 0 {
			rightRem++
		} else if v == ')' {
			leftRem--
		}
	}
	dfs(0, 0, 0, leftRem, rightRem, s, "")
	for k := range resMap {
		res = append(res, k)
	}
	return
}

func dfs(depth, left, right, leftRem, rightRem int, s, str string) {
	if depth == len(s) {
		if left == right {
			resMap[str] = true
		}
	} else {
		if s[depth] != '(' && s[depth] != ')' {
			dfs(depth+1, left, right, leftRem, rightRem, s, str+string(s[depth]))
		} else if s[depth] == '(' {
			dfs(depth+1, left+1, right, leftRem, rightRem, s, str+"(")
		} else if left > right {
			dfs(depth+1, left, right+1, leftRem, rightRem, s, str+")")
		}
		if s[depth] == '(' && leftRem != 0 {
			dfs(depth+1, left, right, leftRem-1, rightRem, s, str)
		} else if s[depth] == ')' && rightRem != 0 {
			dfs(depth+1, left, right, leftRem, rightRem-1, s, str)
		}
	}
}

```

### Complexity Analysis

* 时间复杂度：$O(2^n)$，这是最坏的情况，实际用时没有这么多。
* 空间复杂度：$O(n)$。

## Finally

本题考验了对括号匹配的特征的灵活运用，以及DFS中的剪枝。

