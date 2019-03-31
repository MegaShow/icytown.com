---
title: Algo | LeetCode 23 Merge k Sorted Lists
date: 2018-9-21
categories: Algorithm Analysis and Implementation
tags:
- LeetCode
---

## Description

[LeetCode 23 Merge k Sorted Lists](https://leetcode.com/problems/merge-k-sorted-lists/description/)

Merge *k* sorted linked lists and return it as one sorted list. Analyze and describe its complexity.

<!-- more -->

**Example:**

```
Input:
[
  1->4->5,
  1->3->4,
  2->6
]
Output: 1->1->2->3->4->4->5->6
```

## Structure

```go
type ListNode struct {
	Val  int
	Next *ListNode
}
```

## Approach #1 Brute Force

### Intuition

本题可以使用暴力求解，可以将所有元素都放到一个数组里面，直接用`sort`函数来对数组排序，然后再生成链表即可。

### Algorithm

```go
func mergeKLists(lists []*ListNode) *ListNode {
	var arr []int
	for _, l := range lists {
		for l != nil {
			arr = append(arr, l.Val)
			l = l.Next
		}
	}
	sort.Ints(arr)
	res := new(ListNode)
	n := res
	for _, v := range arr {
		n.Next = &ListNode{Val: v}
		n = n.Next
	}
	return res.Next
}
```

### Complexity Analysis

* 时间复杂度：$O(nlogn)$，$n$为元素总数量。
* 空间复杂度：$O(n)$，$n$为元素总数量。

## Approach #2 Priority Queue

### Intuition

方法二沿用了方法一的暴力求解的思路，但是方法二不同的是，将所有元素放在优先队列而不是数组中。这样，就不需要对数组进行排序。因为优先队列的性质，依次出队列的元素已经是有序的。

### Algorithm

看起来方法二与方法一一样简单，因为在大多数语言中优先队列和排序函数一样，是标准库所实现好的。但是在GoLang里面并没有实现优先队列，因此会比较麻烦。

在GoLang中，通常采用`container/heap`包中的堆来实现优先队列。在GoLang官网该包的[文档](https://golang.org/pkg/container/heap/)中，详细介绍了用堆来实现优先队列的例子。

我们改造了一下官方给的代码，让其满足小数先出队列的要求。同时因为队列优先级即数据本身，我们省去了该属性。

```go
// Item 是优先队列中包含的元素。
type Item struct {
	value    int
	// 元素的索引可以用于更新操作，它由 heap.Interface 定义的方法维护。
	index int // 元素在堆中的索引。
}

// 一个实现了 heap.Interface 接口的优先队列，队列中包含任意多个 Item 结构。
type PriorityQueue []*Item

func (pq PriorityQueue) Len() int { return len(pq) }

func (pq PriorityQueue) Less(i, j int) bool {
	return pq[i].value < pq[j].value
}

func (pq PriorityQueue) Swap(i, j int) {
	pq[i], pq[j] = pq[j], pq[i]
	pq[i].index = i
	pq[j].index = j
}

func (pq *PriorityQueue) Push(x interface{}) {
	n := len(*pq)
	item := x.(*Item)
	item.index = n
	*pq = append(*pq, item)
}

func (pq *PriorityQueue) Pop() interface{} {
	old := *pq
	n := len(old)
	item := old[n-1]
	item.index = -1 // 为了安全性考虑而做的设置
	*pq = old[0 : n-1]
	return item
}

// 更新函数会修改队列中指定元素的优先级以及值。
func (pq *PriorityQueue) update(item *Item, value int) {
	item.value = value
	heap.Fix(pq, item.index)
}
```

接下来优先队列的所有操作，都交给`heap`负责。

```go
func mergeKLists(lists []*ListNode) *ListNode {
	var arr []int
	for _, l := range lists {
		for l != nil {
			arr = append(arr, l.Val)
			l = l.Next
		}
	}
	pq := make(PriorityQueue, len(arr))
	for i, v := range arr {
		pq[i] = &Item{
			value:    v,
			index:    i,
		}
	}
	heap.Init(&pq)
	res := new(ListNode)
	n := res
	for pq.Len() > 0 {
		n.Next = &ListNode{Val: heap.Pop(&pq).(*Item).value}
		n = n.Next
	}
	return res.Next
}
```

### Complexity Analysis

* 时间复杂度：$O(n logk)$，$n$为元素总数量。
* 空间复杂度：$O(n)$，$n$为元素总数量。

## Approach #3 Merge with Recursion

### Intuition

看到这道题，或许大家已经想到了一个算法——归并排序。题目所给定的数据，本身就很像是一个归并过程中的中间产物，分而治之。我们只需要两两合并，最终合并到只剩下一个链表的时候，即为所求了。

我们可以采用递归的思想去归并，算法可以划分为以下几种情况：

* 链表数量为0：返回`nil`。
* 链表数量为1：返回该链表。
* 链表数量为2及更多：将链表划分为两部分，各部分分别递归调用得到一个链表。此时可得到两个链表，可以进行归并操作。

归并操作是一个简单的链表插入操作，因为给定的数据是有序的，那么我们只需要简单的判断即可完成归并的排序。

### Algorithm

```go
func mergeKLists(lists []*ListNode) *ListNode {
	l := len(lists)
	if l == 0 {
		return nil
	} else if l == 1 {
		return lists[0]
	}
	a, b := mergeKLists(lists[:l/2]), mergeKLists(lists[l/2:])
	res := new(ListNode)
	n := res
	for a != nil && b != nil {
		if a.Val <= b.Val {
			n.Next = &ListNode{Val: a.Val}
			n = n.Next
			a = a.Next
		} else {
			n.Next = &ListNode{Val: b.Val}
			n = n.Next
			b = b.Next
		}
	}
	for a != nil {
		n.Next = &ListNode{Val: a.Val}
		n = n.Next
		a = a.Next
	}
	for b != nil {
		n.Next = &ListNode{Val: b.Val}
		n = n.Next
		b = b.Next
	}
	return res.Next
}
```

当然，递归也可以采用将递归调用放在尾部的方法，不过那样子会略复杂一点。因为这个算法函数的返回值和参数类型并不一致。

### Complexity Analysis

- 时间复杂度：$O(n logk)$，$n$为元素总数量。
- 空间复杂度：$O(n)$，$n$为元素总数量。

## Approach #4 Merge with Loop

### Intuition

因为每次递归都会需要分配函数栈空间，这样会消耗很多资源。我们可以将递归改成用循环实现。

归并处理类似于一个堆，我们两个两个链表处理，最终会只剩下一个链表。

```
1' time: lists[0], lists[1], lists[2], lists[3], ... , lists[k]

2' time: lists[0], lists[2], lists[4], ... , lists[k/2*2]

3' time: lists[0], lists[4], lists[8], ... , lists[k/4*4]

...

log2(k)' time: lists[0]
```

### Algorithm

需要注意，必须对链表集合为空的情况讨论。

```go
func mergeKLists(lists []*ListNode) *ListNode {
	l := len(lists)
	if l == 0 {
		return nil
	}
	for step := 1; step < l; step *= 2 {
		for i := 0; i < l && i+step < l; i += 2 * step {
			res := new(ListNode)
			n, a, b := res, lists[i], lists[i+step]
			for a != nil && b != nil {
				if a.Val <= b.Val {
					n.Next = &ListNode{Val: a.Val}
					n = n.Next
					a = a.Next
				} else {
					n.Next = &ListNode{Val: b.Val}
					n = n.Next
					b = b.Next
				}
			}
			for a != nil {
				n.Next = &ListNode{Val: a.Val}
				n = n.Next
				a = a.Next
			}
			for b != nil {
				n.Next = &ListNode{Val: b.Val}
				n = n.Next
				b = b.Next
			}
			lists[i] = res.Next
		}
	}
	return lists[0]
}
```

### Complexity Analysis

- 时间复杂度：$O(n logk)$，$n$为元素总数量。
- 空间复杂度：$O(n)$，$n$为元素总数量。

## Finally

这是一道不应该被标记为`Hard`的题目，即使是最复杂的解决方法，也不过是归并思想的实现。

不过在采用优先队列解决问题时，也算学习了一下GoLang的堆。

