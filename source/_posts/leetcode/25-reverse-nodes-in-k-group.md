---
title: LeetCode | 25 Reverse Nodes in k-Group
date: 2018-9-26
categories: LeetCode
---

## Description

[LeetCode 25 Reverse Nodes in k-Group](https://leetcode.com/problems/reverse-nodes-in-k-group/description/)

Given a linked list, reverse the nodes of a linked list *k* at a time and return its modified list.

*k* is a positive integer and is less than or equal to the length of the linked list. If the number of nodes is not a multiple of *k* then left-out nodes in the end should remain as it is.

<!-- more -->

**Example:**

Given this linked list: `1->2->3->4->5`

For *k* = 2, you should return: `2->1->4->3->5`

For *k* = 3, you should return: `3->2->1->4->5`

**Note:**

- Only constant extra memory is allowed.
- You may not alter the values in the list's nodes, only nodes itself may be changed.

## Approach #1 Brute Force

### Intuition

每k个数反转一次结点，最直接的方法是创建一个n大小的数组，然后遍历链表，将每个节点的值存储在反转后的位置，最后再生成一个新的链表。

但是这种直接的方法需要使用2n大小的空间，与题目要求的常数空间要求相违背。题目中的空间复杂度的限制，导致本题只能操作已存在的链表所存储的空间。并且，题目要求不能改变节点的值。

总的来说，本题实际上是对节点指针的操作，达到反转的目的。

让我们来看一下该如何操作节点指针，首先我们观察一下在组内的反转，假设`k = 5`，组内的元素值依次为1、2、3、4、5。我们知道，在整个链表中必然有一个节点指针记录当前操作的节点，该指针从链表的头出发遍历，每经过一个节点就处理该节点。令该节点指针为`p`，有

```
1->2->3->4->5->?
p
```

声明一个叫`first`的节点指针，用于记录这个组的第一个节点。因为反转操作，这个指针必然随着`p`的遍历而改变，最终为原组的最后一个节点。

```
1  2->3->4->5->?
   p
f
```

当`p`处理完2号节点之后，有

```
2->1  3->4->5->?
      p
f
```

每次处理节点的时候，都会将`p`所在节点的下一个节点置为`first`所在的节点，然后更新`p`、`first`的值。

```
3->2->1  4->5->?
         p
f


4->3->2->1  5->?
            p
f


5->4->3->2->1  ?
               p
f
```

组内的反转实现之后，要做的是将组与组之间头尾相连。每次处理完组内节点，都需要记录组的最后一个节点，然后再和下一个组的`first`相连。

因为链表无法直接获取长度，如果出现最后一个组没有k个数的时候，我们不能提前判断这种情况发生。因此在最后一个组处理完之后，应该判断该组是否需要反转。如果不需要反转，可以选择再反转一次来抵消之前的反转操作。

### Algorithm

因为每个组的第一个节点最终必然成为最后一个节点，而处理完组之后需要记录当前组的最后一个节点。我们可以选择在处理组之前就记录节点，记录第一个节点即满足目的。`pprev`即为记录的节点。

```
func reverseKGroup(head *ListNode, k int) *ListNode {
	var p, prev *ListNode = head, nil
	for p != nil {
		var first, next, pprev *ListNode = nil, nil, p
		var i int
		for i = 0; p != nil && i < k; i++ {
			next, p.Next = p.Next, first
			first, p = p, next
		}
		if p == nil && i != k {
			p, first = first, nil
			for ; i > 0; i-- {
				next, p.Next = p.Next, first
				first, p = p, next
			}
			p = nil
		}
		if prev == nil {
			head = first
		} else {
			prev.Next = first
		}
		prev = pprev
 	}
	return head
}
```

### Complexity Analysis

* 时间复杂度：$O(n+k)$，n为链表长度。
* 空间复杂度：$O(1)$。

## Approach #2 Recursion

### Intuition

因为每次都是k个数一组的处理，我们可以采用递归的方式分组递进处理。组内的处理与方法一是一致的，不过我们不采用方法一关于最后一组的处理方法。

我们选择在组内处理之前，先遍历一遍组，判断该组元素数量是否为k。如果不为k，即该组为最后一组，那么将不需要处理该组，并且中止递归。

方法二也是一种暴力求解的方法，甚至比方法一效率更差。

### Algorithm

```go
func reverseKGroup(head *ListNode, k int) *ListNode {
	if head == nil {
		return nil
	}
	newHead := head
	var i int
	for i = 0; i < k - 1 && newHead.Next != nil; i++ {
		newHead = newHead.Next
	}
	if  i != k - 1 {
		return head
	}
	var first, next, p *ListNode = reverseKGroup(newHead.Next, k), nil, head
	for i = 0; i < k; i++ {
		next, p.Next = p.Next, first
		first, p = p, next
	}
	return newHead
}
```

### Complexity Analysis

- 时间复杂度：$O(n)$，n为链表长度。该复杂度实际上是高于方法一的，因为$k<n$，而方法二的常数$c=2$。
- 空间复杂度：$O(1)$。

## Finally

这也是一道不应该被标记为`Hard`的题目。

