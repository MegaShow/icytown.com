---
title: LeetCode | 4 Median of Two Sorted Arrays
date: 2018-9-8
categories: LeetCode
---

本题重点在于对中位数定义、用途的理解以及二分法的运用。

<!-- more -->

## Description

[LeetCode 4 Median of Two Sorted Arrays](https://leetcode.com/problems/median-of-two-sorted-arrays/description/)

**Difficulty:** `Hard`

There are two sorted arrays **nums1** and **nums2** of size m and n respectively.

Find the median of the two sorted arrays. The overall run time complexity should be O(log (m+n)).

You may assume **nums1** and **nums2** cannot be both empty.

**Example 1:**

```
nums1 = [1, 3]
nums2 = [2]

The median is 2.0
```

**Example 2:**

```
nums1 = [1, 2]
nums2 = [3, 4]

The median is (2 + 3)/2 = 2.5
```

## Approach #1 Solving Directly

### Intuition

求中位数，最简单直接的方法就是排序，然后找中间的一个数或两个数。不过这种方法时间几乎都消耗在排序上，即使是快速排序，其复杂度也为$O((m+n) log (m+n))$。

由于给定的是两个排序好的数组，这里有一种也较为直接的求解方法，其效率比排序要快一些，不过依然没有达到$O(log (m+n))$的要求。

因为两个数组的长度总和为$m+n$，如果将两个数组排序合并成一个数组，那么中位数将是第$\frac{m+n}{2}$个数，或者第$\frac{m+n-1}{2}$个数和第$\frac{m+n+1}{2}$个数的平均数。由于给定的数组是排序好的，那么我们可以从第一个数开始逐一从小到大删除，直到扫描到中位数。在数组的长度为m和n的前提下，只需扫描$[\frac{m+n+1}{2}]+1$个数，其中位数的值，将取决于扫描中的最后两个数或倒数第二个数。

```
Sort: A{1}, A{2}, A{3}, ... , A{(m+n+1)/2}, A{(m+n+1)/2+1}, ... , A{m+n}
Scan: A{1}, A{2}, A{3}, ... , A{(m+n+1)/2}, A{(m+n+1)/2+1}

If m + n is even
    median = (A{(m+n+1)/2} + A{(m+n+1)/2+1}) / 2

If m + n is odd
    median = A{(m+n+1)/2}
```

需要注意的是，扫描之后将得到两个数值，但是可能提供的数组长度之和为一，因此对这种情况我们需要特殊处理。

### Algorithm

算法中比较复杂的是，如何保证扫描的数是从小到大的。这里的实现有点类似于归并排序合并两个数组时候的操作，用两个变量作为两个数组当前扫描位置的下标，然后比较两个数组等待扫描的元素的大小，再决定扫描哪个元素。

```go
func findMedianSortedArrays(nums1 []int, nums2 []int) float64 {
	m, n := len(nums1), len(nums2)
	if m == 1 && n == 0 {
		return float64(nums1[0])
	} else if m == 0 && n == 1 {
		return float64(nums2[0])
	}
	skip := (m+n+1)/2 + 1
	var lhs1, lhs2, val1, val2 int
	for lhs1 + lhs2 < skip && lhs1 < m && lhs2 < n {
		val2 = val1
		if nums1[lhs1] <= nums2[lhs2] {
			val1 = nums1[lhs1]
			lhs1++
		} else {
			val1 = nums2[lhs2]
			lhs2++
		}
	}
	for lhs1 + lhs2 < skip && lhs1 >= m {
		val2 = val1
		val1 = nums2[lhs2]
		lhs2++
	}
	for lhs1 + lhs2 < skip && lhs2 >= n {
		val2 = val1
		val1 = nums1[lhs1]
		lhs1++
	}
	if (m+n)%2 == 0 {
		return float64(val1+val2) / 2
	}
	return float64(val2)
}
```

### Complexity Analysis

* 时间复杂度：$O(m+n)$.
* 空间复杂度：$O(1)$.

## Approach #2 kth Smallest Number

### Intuition

已知m、n是两个数组的长度，那么求解中位数，相当于求第$\frac{m+n}{2}$个数，或者第$\frac{m+n-1}{2}$个数和第$\frac{m+n+1}{2}$个数的平均数。在已经排序的数组中寻找第k个数，可以采用二分法进行扫描，其本质上即二分查找。

通常情况下，二分查找每次均从数据的中间查找，该题也可以严格在两个数组中间查找。不过，为了让算法更好理解，我们将通过k的值来决定每次二分查找的位置。

对于每一次二分操作的A、B两个数组，我们将扫描每个数组中第$[\frac{k}{2}]$个数，那么相当于我们已经扫描了$2 \times [\frac{k}{2}]$个数，每次可以证明其中某个数组的$[\frac{k}{2}]$个数均比中位数要小，同时剔除它们。

```
A: A{1}, A{2}, ... , A{k/2-1}, A{k/2}, A{k/2+1}, ... , A{m}
B: B{1}, B{2}, ... , B{k/2-1}, B{k/2}, B{k/2+1}, ... , B{n}

If A{k/2} < B{k/2} then
    All in A{1...k/2} < median
    Bisection scan for A{k/2+1...m}, B{1...n}
Else
    All in B{1...k/2} < median
    Bisection scan for A{1...m}, B{k/2+1...n}
```

当然，以上的操作需要确保$k \ge 2$且A、B不为空，因此我们需要对$k = 1$或A、B两者之一为空的情况进行单独讨论。

### Algorithm

算法实现并不是很复杂，只要将二分位置的思路想通了，直接实现即可。

```go
func findMedianSortedArrays(nums1 []int, nums2 []int) float64 {
	m, n := len(nums1), len(nums2)
	if (m+n)%2 != 0 {
		return float64(findKthSmallestNumber(nums1, nums2, (m+n)/2+1))
	}
	return float64(findKthSmallestNumber(nums1, nums2, (m+n)/2)+findKthSmallestNumber(nums1, nums2, (m+n)/2+1)) / 2
}

func findKthSmallestNumber(nums1, nums2 []int, k int) int {
	m, n := len(nums1), len(nums2)
	if m == 0 {
		return nums2[k-1]
	}
	if n == 0 {
		return nums1[k-1]
	}
	if k == 1 {
		return min(nums1[0], nums2[0])
	}
	if m < k/2 {
		return findKthSmallestNumber(nums1, nums2[k/2:], k-k/2)
	}
	if n < k/2 {
		return findKthSmallestNumber(nums1[k/2:], nums2, k-k/2)
	}
	if nums1[k/2-1] < nums2[k/2-1] {
		return findKthSmallestNumber(nums1[k/2:], nums2, k-k/2)
	} else {
		return findKthSmallestNumber(nums1, nums2[k/2:], k-k/2)
	}
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
```

但是，上面的算法有一个不足，便是在寻找第k小数的时候，由于中位数的定义，我们可能需要找第k小数和第k+1小数。但是上面的算法是分开查找的，而实际上第k小数和第k+1小数是可以同时查找的。

为了防止查找两个数的时候产生数组越界，可以在一开始添加一个元素到两个数组中，该值取尽可能大。

这种算法有点类似于方法一，同样，需要对数组长度之和为一的情况进行单独讨论。

```go
import "math"

func findMedianSortedArrays(nums1 []int, nums2 []int) float64 {
	m, n := len(nums1), len(nums2)
	if m == 1 && n == 0 {
		return float64(nums1[0])
	} else if m == 0 && n == 1 {
		return float64(nums2[0])
	}
	nums1, nums2 = append(nums1, math.MaxInt64), append(nums2, math.MaxInt64)
	min1, min2 := findKthSmallestNumber(nums1, nums2, (m+n)/2)
	if (m+n)%2 != 0 {
		return float64(min2)
	}
	return float64(min1 + min2) / 2
}

func findKthSmallestNumber(nums1, nums2 []int, k int) (int, int) {
	m, n := len(nums1) - 1, len(nums2) - 1
	if m == 0 {
		return nums2[k-1], nums2[k]
	}
	if n == 0 {
		return nums1[k-1], nums1[k]
	}
	if k == 1 {
		return min(nums1[0], nums1[1], nums2[0], nums2[1])
	}
	if m < k/2 {
		return findKthSmallestNumber(nums1, nums2[k/2:], k-k/2)
	}
	if n < k/2 {
		return findKthSmallestNumber(nums1[k/2:], nums2, k-k/2)
	}
	if nums1[k/2-1] < nums2[k/2-1] {
		return findKthSmallestNumber(nums1[k/2:], nums2, k-k/2)
	} else {
		return findKthSmallestNumber(nums1, nums2[k/2:], k-k/2)
	}
}

func min(a1, a2, b1, b2 int) (int, int) {
	if a1 <= b1 && a2 <= b1 {
		return a1, a2
	} else if a1 <= b1 {
		return a1, b1
	} else if a1 <= b2 {
		return b1, a1
	}
	return b1, b2
}
```

### Complexity Analysis

* 时间复杂度：$O(log (m+n))$.
* 空间复杂度：$O(1)$.

## Approach #3 Use of Median

### Intuition

方法三利用了中位数的作用，首先须知，中位数可以将一个数组分割成两个长度相等的数组，其中一个数组的任何一个元素都比另一个数组的任何一个元素要大。

首先，在一个随机数i位置将数组A分割成两个集合。(这里为了方便，与上面两种方法不同地，将$X{0}$作为数组开端)

```
          Left           |       Right
A{0}, A{1}, ... , A{i-1} | A{i}, ... , A{m-1}
```

同样在随机数j位置对数组B进行分割。

```
          Left           |       Right
B{0}, B{1}, ... , B{j-1} | B{j}, ... , B{n-1}
```

两者合并。

```
          Left           |       Right
A{0}, A{1}, ... , A{i-1} | A{i}, ... , A{m-1}
B{0}, B{1}, ... , B{j-1} | B{j}, ... , B{n-1}
```

如果我们假设$i+j=(m-i)+(n-j)$或$i+j=(m-i)+(n-j)+1$，同时满足$max(Left) \le min(Right)$，那么所需要求解的中位数将有下列两种情况。

```
If m + n is even
    median = (max(A{i-1}, B{j-1}) + min(A{i}, B{j})) / 2

If m + n is odd
    median = max(A{i-1}, B{j-1})
```

那么问题解析到这里，已经不是求解中位数，而是求满足上述条件的i和j了。总结一下上述条件的假设，可以得到下列的要求。

```
=> i+j=(m-i)+(n-j) or i+j=(m-i)+(n-j)+1
It can be simplified as i+j=(m+n+1)/2.

=> max(Left)<=min(Right)
It can be simplified as A{i-1}<=B{j} and A{i}>=B{j-1}.
```

$i$的取值范围为$[0,m]$，由$j=(m+n+1)/2-i$表达式可得$j$的取值范围为$[(m+n+1)/2-m, (m+n+1)/2]$。可以观察到$j$值是可能为负数，但是负数的数组下标是不合法的，如果分情况讨论将会导致算法更加复杂。由于A和B无差异性，因此我们在算法中应该确保$m \le n$，方可保证$i、j$均为非负数。

对于查找$i$，最简单的办法无非是遍历。

```
For i in [0,m]
    j = (m+n+1)/2-i
    If A{i-1} <= B{j} and A{i} >= B{j-1}
        i is found.
```

但是这样无疑是仅比第一种方法快一点，在这里也应该采用二分查找，可以对$i$值进行二分。

```
iMin, iMax = 0, m
For iMin <= iMax
    i = (iMin+iMax)/2
    j = (m+n+1)/2-i
    If A{i-1} <= B{j} and A{i} >= B{j-1}
        i is found.
    Else If A{i-1} > B{j}
        i should decrease.
    Else If A{i} < B{j-1}
        i should increase.
```

如果仔细观察的话，会发现如果$i=0$或$j=0$时，`A{i-1}`和`B{j-1}`是非法的；如果$i=m$或$j=n$，那`A{i}`和`B{j}`亦是非法的。这四种情况均需要单独处理。

* 若$i=0$，则Left里面最大值必为`B{j-1}`，那只需考虑`A{i} >= B{j-1}`。
* 若$i=m$，则Right里面最小值必为`B{j}`，那只需考虑`A{i-1} <= B{j}`。
* 若$j=0$，则Left里面最大值必为`A{i-1}`，那只需考虑`A{i-1} <= B{j}`。
* 若$j=n$，则Right里面最小值必为`A{i}`，那只需考虑`A{i} >= B{j-1}`。

```
If (i == 0 or j == n or A{i-1} <= B{j}) and (i == m or j == 0 or A{i} >= B{j-1})
    i is found.
Else If i > 0 and j < n and A{i-1} > B{j}
    i should decrease.
Else If j > 0 and i < m and A{i} < B{j-1}
    i should increase.
```

### Algorithm

如果采用上面的算法，由于if条件语句里面的条件太多了，找到$i$之后，我们还必须讨论其属于哪种情况，从而计算中位数。所以通常情况下，我们将找到$i$的情况放在else语句块中逐一判断。

```go
func findMedianSortedArrays(nums1 []int, nums2 []int) float64 {
	m, n := len(nums1), len(nums2)
	if m > n {
		m, n, nums1, nums2 = n, m, nums2, nums1
	}
	iMin, iMax := 0, m
	for iMin <= iMax {
		i := (iMin + iMax) / 2
		j := (m+n+1)/2 - i
		if i > 0 && nums1[i-1] > nums2[j] {
			iMax = i - 1
		} else if i < m && nums1[i] < nums2[j-1] {
			iMin = i + 1
		} else {
			var leftMax, rightMin int
			if i == 0 {
				leftMax = nums2[j-1]
			} else if j == 0 {
				leftMax = nums1[i-1]
			} else {
				leftMax = max(nums1[i-1], nums2[j-1])
			}
			if (m+n)%2 != 0 {
				return float64(leftMax)
			}
			if i == m {
				rightMin = nums2[j]
			} else if j == n {
				rightMin = nums1[i]
			} else {
				rightMin = min(nums1[i], nums2[j])
			}
			return float64(leftMax+rightMin) / 2
		}
	}
	return 0
}

func max(a, b int) int {
	if a > b {
		return a
	}
	return b
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
```

### Complexity Analysis

- 时间复杂度：$O(log (min(m, n)))$.
- 空间复杂度：$O(1)$.

## Finally

求解两个有序数组的中位数并不复杂，其难度在于采用二分法将时间复杂度降低至$O(log(m+n))$。并且，时间复杂度为$O(log(min(m,n)))$更加高效的方法也是一大难点，其思想较为复杂，对算法中特殊情况的处理也较为麻烦。

