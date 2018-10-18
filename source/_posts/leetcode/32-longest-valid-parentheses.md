---
title: LeetCode | 32 Longest Valid Parentheses
date: 2018-10-2
categories: LeetCode
---

## Description

Given a string containing just the characters `'('` and `')'`, find the length of the longest valid (well-formed) parentheses substring.

<!-- more -->

**Example 1:**

```
Input: "(()"
Output: 2
Explanation: The longest valid parentheses substring is "()"
```

**Example 2:**

```
Input: ")()())"
Output: 4
Explanation: The longest valid parentheses substring is "()()"
```

## Approach #1 Brute Force

### Intuition

首先，我们考虑如何检查一段字符串是否满足括号匹配。

通常情况，括号匹配问题使用栈来实现，遇到左括号时将左括号入栈，遇到右括号时将左括号出栈，并判断是否是同一个类型的括号。如果没有出现类型不一致的括号，并且最终栈为空，则说明是合法的字符串。

但是本题只有一种类型的括号，那么就不会出现类型不一致的括号，并且栈内的元素肯定是一样的。这种情况下，并不需要用栈来检查括号匹配，只需要用一个变量来记录栈内元素的数量即可。

最长合法串的长度，取决于栈内元素的数量为0时，遍历字符串操作时指针所在的字符位置。因此，可以在遍历字符串时，每个字符操作之后，都检查栈元素数量是否为0。若为0，则表示该串为合法串，则可以求出该字符串内从第0个字符开始的最长合法串。

要求字符串`s`内最长合法串，只需暴力求字符串`s[i:]`内最长合法串($0 \le i < len(s)$)，最终再求最大值即可。

### Algorithm

方法一虽然使用了模拟栈的方法，但模拟栈本身与栈相比复杂度是一个等级的。且最外层的遍历还是使用了暴力法求解，其复杂度是比较高的。

```go
func longestValidParentheses(s string) int {
	max, l := 0, len(s)
	for i := 0; i < l; i++ {
		for valid, index := i, 0; valid < l && index >= 0; valid++ {
			if s[valid] == '(' {
				index++
			} else {
				index--
			}
			if index == 0 && max < valid-i+1 {
				max = valid - i + 1
			}
		}
	}
	return max
}
```

### Complexity Analysis

* 时间复杂度：$O(n^2)$。
* 空间复杂度：$O(1)$。

## Approach #2 Stack

### Intuition

方法一用一个变量模拟栈的指针位置，从而实现了括号匹配的判断。但是这个只是在减少了空间上的消耗，对于时间没有任何的优化。即使是采用栈存储括号，也没有办法在时间复杂度上进行优化。

观察一下方法一的代码，为什么需要嵌套两个循环？最外层的循环是用来确定匹配字符串的头部位置的，而内层的循环是用来扫描获取匹配字符串长度的，即确定匹配字符串的尾部位置的。内层循环是不可能省略的操作，而能不能在确定匹配字符串的头部位置上优化呢？

实际上是可行的，设想一下栈存储的是左括号在字符串中的下标，而不是左括号本身。事实方法一已经证实了存储左括号本身是没有意义、没有任何帮助的。

如果栈存储的是下标，那每一次出栈之后，必定会存在一个匹配字符串$s[stack.top+1:valid+1]$。栈顶下标加1之后即为匹配字符串的头部，而当前遍历所达的字符下标`valid`，即为匹配字符串的尾部。

那么，我们就可以省略外部的循环，而全部交给内部循环的栈负责获取匹配字符串的长度。

### Algorithm

比较麻烦的是，Golang中并没有`stack`数据结构。因此我们采用切片来模拟栈，通过`append`切片操作函数来实现入栈出栈，通过切片的长度来获取栈顶元素的值。

```go
func longestValidParentheses(s string) int {
	max, stack := 0, []int{-1}
	for valid := 0; valid < len(s); valid++ {
		if s[valid] == '(' {
			stack = append(stack, valid)
		} else {
			stack = append(stack[0:len(stack)-1])
			l := len(stack)
			if l == 0 {
				stack = []int{valid}
			} else if max < valid - stack[len(stack)-1] {
				max = valid - stack[len(stack)-1]
			}
		}
	}
	return max
}
```

### Complexity Analysis

* 时间复杂度：$O(n)$。
* 空间复杂度：$O(n)$。

## Approach #3 Dynamic Programming

### Intuition

本题亦可以采用动态规划的思想来实现。

设$DP[i]$为以$s[i]$结尾的最长匹配字符串的长度，那么可以探讨求解出$DP[i]$的公式。

因为是以$s[i]$结尾，所以$s[i]$必定为`)`，则可以知道`(`所在的$DP=0$，在动态规划过程中可以省去所有左括号的$DP$值计算。

如果$s[i]$为`)`，接下来需要判断是否能找到与其匹配的`(`。一种情况是$s[i-1]$为`(`，这时与$s[i]$匹配的左括号必为$s[i-1]$，应该有$DP[i]=DP[i-2]+2$；另一种情况是$s[i-1]$为`)`，这时与$s[i]$匹配的左括号必为$s[i-1-DP[i-1]]$，应该有$DP[i]=DP[i-1]+2+DP[i-1-DP[i-1]-1]$。

在$s[i-1]=')'$时，有

$DP[i]=
\begin{cases}
2& \text{s[i-1]='(' and i=1}\\
DP[i-2]+2& \text{s[i-1]='(' and i>1}\\
DP[i-1]+2& \text{s[i-1]=')' and s[i-1-DP[i-1]]='(' and i-1-DP[i-1]=0}\\
DP[i-1]+2+DP[i-1-DP[i-1]-1]& \text{s[i-1]=')' and s[i-1-DP[i-1]]='(' and i-1-DP[i-1]>0}\\
0& \text{otherwise}
\end{cases}$

### Algorithm

由于Golang不支持三目表达式，代码写得特别难受。

```go
func longestValidParentheses(s string) (max int) {
	dp := make([]int, len(s))
	for i := 1; i < len(s); i++ {
		if s[i] == ')' {
			if s[i-1] == '(' {
				if i == 1 {
					dp[i] = 2
				} else {
					dp[i] = dp[i-2] + 2
				}
			} else if i-1-dp[i-1] >= 0 && s[i-1-dp[i-1]] == '(' {
				if i-2-dp[i-1] >= 0 {
					dp[i] = dp[i-1] + 2 + dp[i-2-dp[i-1]]
				} else {
					dp[i] = dp[i-1] + 2
				}
			}
			if max < dp[i] {
				max = dp[i]
			}
		}
	}
	return
}
```

### Complexity Analysis

* 时间复杂度：$O(n)$。
* 空间复杂度：$O(n)$。

## Approach #4 Two-side Scanning

### Intuition

方法二、三的时间复杂度比方法一高，但是空间利用上却没有方法一高效率。方法四在用时上比前面两种方法要慢，但复杂度均为一个等级，并且空间复杂度可以达到常数级别。

方法四将对字符串进行正序扫描和逆序扫描两次扫描操作，两次遍历之后将得到最长匹配字符串的长度。

匹配字符串有以下三个特点：

* 匹配字符串$S$中左括号的数量等于右括号的数量。
* 对任意$1 \le i \le len(S)$，字符串$S[0:i]$中左括号数量不小于右括号的数量。
* 对任意$0 \le j \le len(S)-1$，字符串$S[j:len(S)]$中右括号数量不小于左括号的数量。

根据匹配字符串的必要条件，可以反推出下面的结论：

* 如果存在$1 \le i \le len(S)$，字符串$S[0:i]$中左括号数量小于右括号的数量，那$S$将不是匹配字符串。
* 如果存在$0 \le j \le len(S)-1$，字符串$S[j:len(S)]$中右括号数量小于左括号的数量，那$S$将不是匹配字符串。

讨论字符串$R$从左到右遍历的情况，寻找最长的匹配字符串$S$。如果出现字符串$R[0:k]$中左括号数量等于右括号数量，且对于$0 \le i \lt k$任意值满足$R[0:i]$中左括号数量大于右括号数量，并且有$R[0:k+1]$中左括号数量小于右括号数量。那么可得，$R[0:k]$是一个匹配字符串，而对于任意满足$k < i < len(R)$的$R[0:i]$均不是匹配字符串。

按照方法一的想法，这时应该从下标为1的位置开始从左到右遍历。但是由于$R[0:k]$是一个匹配字符串，那$R[1:k]$中的左括号数量必定少于右括号数量，且$R[0:k]$的任意子串即使是匹配字符串，但长度也比$R[0:k]$短。因此下标可以直接跳转到从$k+2$下标位置继续遍历。

但是从左到右遍历，如果遍历完整个字符串时，左括号数量大于右括号数量，就无法获取此时满足最长匹配字符串的长度。但是如果我们再从右到左遍历一次，则该情况将提前满足左括号数量等于右括号数量的条件，并求解匹配字符串的长度。同理，反过来亦是如此。比如，`()((())`字符串从左到右遍历所得的长度是2，从右到左长度为4。`(()))`字符串从左到右遍历长度为4，从右到左遍历长度为0。

### Algorthm

```go
func longestValidParentheses(s string) (max int) {
	var left, right int
	for i := 0; i < len(s); i++ {
		if s[i] == '(' {
			left++
		} else {
			right++
		}
		if left == right {
			if max < left * 2 {
				max = left * 2
			}
		} else if left < right {
			left, right = 0, 0
		}
	}
	left, right = 0, 0
	for i := len(s) - 1; i >= 0; i-- {
		if s[i] == '(' {
			left++
		} else {
			right++
		}
		if left == right {
			if max < left * 2 {
				max = left * 2
			}
		} else if left > right {
			left, right = 0, 0
		}
	}
	return
}
```

### Complexity Analysis

* 时间复杂度：$O(n)$。
* 空间复杂度：$O(1)$。

## Finally

一道蛮不错的题目，虽然比较简单，不太符合`Hard`标签，但是其两次扫描求解的思想还是蛮强大的，感觉很难想到这种解法。不过方法四实际上相比方法二、方法三，时间效率还是低了。





