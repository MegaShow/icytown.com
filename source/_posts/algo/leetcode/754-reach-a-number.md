---
title: Algo | LeetCode 754 Reach a Number
date: 2018-1-6
categories: Algorithm Analysis and Implementation
tags:
- LeetCode
---

 This is the first problem in LeetCode Weekly Contest 65. Firstly, its difficulty is marked "Easy". But as for me, I solve the problem for 45 minutes. Isn't it an easy problem? Also, now the problem contributor mark it as "Medium".

<!-- more -->

## Description

[LeetCode 754 Reach a Number](https://leetcode.com/problems/reach-a-number/description/)

**Difficulty:** `Medium`

You are standing at position `0` on an infinite number line. There is a goal at position `target`.

On each move, you can either go left or right. During the *n*-th move (starting from 1), you take *n* steps.

Return the minimum number of steps required to reach the destination.

**Example 1:**

```
Input: target = 3
Output: 2
Explanation:
On the first move we step from 0 to 1.
On the second step we step from 1 to 3.

```

**Example 2:**

```
Input: target = 2
Output: 3
Explanation:
On the first move we step from 0 to 1.
On the second move we step  from 1 to -1.
On the third move we step from -1 to 2.
```

**Note:**

`target` will be a non-zero integer in the range `[-10^9, 10^9]`.

## Approach #1 Mathematical

### Intuition

After reading this description, I plan to use DFS to solve this problem. But I think that since the contributor regards it as an easy problem and it's the first problem, it must be solved by other method.

Virtually, this is a math problem.

Basically, what we should do is to put the symbol `+` and `-` into `1, 2, 3, ..., n` in order to let their sum be `target`.

Firstly, we know that `target` is a non-zero integer. But for `target > 0` and for `target < 0`, they are both the same. So we can execute `target = Math.abs(target)` first. Under the circumstance, we can only consider `target > 0`.

And then, we find the smallest number `n` to make `sum = 1 + 2 + 3 + ... + n >= target`. Next, the problem will be changed as how to step from `n` to `target`.

Let `delta = sum - target`, and consider the following:

* If `delta = 0`, it means `1 + 2 + 3 + ... + n = target`. So the answer is `n`.
* If `delta % 2 = 0`, firstly `delta / 2 < n` must be true, an it means `1 + 2 + ... - (delta / 2) + ... + n = sum - delta = target`. So the answer is also `n`.

If `delta % 2 != 0`, we can't take `n` steps from `0` to `target`, so the final answer must greater than `n`. We know that if we replace one `+` with `-`, then `sum` will minus an even number. However, `delta` is an odd number. So we should take a new step with an odd number. But we can't ensure the new number `n + 1` is an odd number. So for `delta % 2 != 0`, there are two circumstances.

* If `delta % 2 != 0` and `n % 2 = 0`, then `n + 1` must be an odd number. We can find that `k * 2 - (n + 1) = delta` with `1 <= k <= n`, which means `1 + 2 + ... - k + ... + (n + 1) = target `. So the answer is `n + 1`.
* If `delta % 2 != 0` and `n % 2 != 0`, then `n + 1` must be an even number. In order to let `sum` minus an odd number, we need another step `n + 2`. Then `k * 2 - (n + 1) + (n + 2) = delta` with `1 <= k <= n`. So the answer is `n + 2`.

For instance:

* If `target = 3`, then `delta = 0, n = 2`, we can get `1 + 2 = 3`. So the answer is `2`.
* If `target = 4`, then `delta = 2, n = 3`, we can get `- 1 + 2 + 3 = 4`. So the answer is `3`.
* If `target = 5`, then `delta = 1, n = 3`, we can get `k = 0`, `1 + 2 + 3 + 4 - 5 = 5`. So the answer is `3 + 2 = 5`.
* If `target = 7`, then `delta = 3, n = 4`, we can get `k = 4`, `1 + 2 + 3 - 4 + 5 = 7`. So the answer is `4 + 1 = 5`.

### Algorithm

In order to get the smallest number `n`, we can use `Math.Sqrt()`.

We know that $sum = \frac{n(n + 1)}{2}  \geq target$, so we can get `n` by the formula: $n \geq \sqrt{2 * target + \frac{1}{4}} - \frac{1}{2}$

```csharp
public class Solution {
  public int ReachNumber(int target) {
    target = Math.Abs(target);
    int n = (int)Math.Ceiling(Math.Sqrt(target * 2 + 0.25) - 0.5);
    int delta = n * (n + 1) / 2 - target;
   	return delta % 2 == 0 ? n : (n + 1 + n % 2);
  }
}
```

### Complexity Analysis

* Time Complexity: $O(1)$.
* Space Complexity: $O(1)$.

