---
title: Algo | LeetCode 99 Recover Binary Search Tree
date: 2018-10-12
categories: Algorithm Analysis and Implementation
tags:
- LeetCode
---

## Description

Two elements of a binary search tree (BST) are swapped by mistake.

Recover the tree without changing its structure.

<!-- more -->

**Example 1:**

```
Input: [1,3,null,null,2]

   1
  /
 3
  \
   2

Output: [3,1,null,null,2]

   3
  /
 1
  \
   2
```

**Example 2:**

```
Input: [3,1,4,null,null,2]

  3
 / \
1   4
   /
  2

Output: [2,1,4,null,null,3]

  2
 / \
1   4
   /
  3
```

**Follow up:**

- A solution using O(*n*) space is pretty straight forward.
- Could you devise a constant space solution?

## Structure

```go
type TreeNode struct {
	Val   int
	Left  *TreeNode
	Right *TreeNode
}
```

## Approach #1 InOrder and Sort

### Intuition

本题目的在于恢复二叉搜索树(二叉查找树)，首先需要知道二叉树的特性。

1. 若任意节点的左子树不空，则左子树上所有节点的值均小于它的根节点的值；
2. 若任意节点的右子树不空，则右子树上所有节点的值均大于它的根节点的值；
3. 任意节点的左、右子树也分别为二叉查找树；
4. 没有键值相等的节点。

二叉搜索树又叫有序二叉树，顾名思义它是有序的，通过中序遍历法所遍历的节点的值将从小到大依次递增。

如果我们将树的所有节点的值记录下来，并且排序好，再通过中序遍历将值一个个赋值回去，那么我们将得到一个符合规则的二叉搜索树。

### Algorithm

记录树的所有节点的值时，可以采用中序遍历，也可以采用先序遍历或者后序遍历。但是，恢复二叉树必须使用中序遍历，因此我们可以实现一个接受函数参数的中序遍历方法，将两个步骤统一起来。

```go
func recoverTree(root *TreeNode) {
	var tree []int
	inOrder(root, func(node *TreeNode) { tree = append(tree, node.Val) })
	sort.Ints(tree)
	inOrder(root, func(node *TreeNode) {
		node.Val = tree[0]
		tree = append(tree[1:])
	})
}

func inOrder(root *TreeNode, fn func(*TreeNode)) {
	if root == nil {
		return
	}
	inOrder(root.Left, fn)
	fn(root)
	inOrder(root.Right, fn)
}
```

### Complexity Analysis

* 时间复杂度：$O(nlogn)$，主要时间在于排序。
* 空间复杂度：$O(n)$。

## Approach #2 InOrder and Find

### Intuition

虽然排序是最简单粗暴的方法，但是排序法也导致整个算法的时间复杂度取决于排序的效率。观察题目，可以发现题意表明二叉树只有两个节点的位置是错的。那么，我们只要找到这两个节点，并交换节点的值即可。

通过方法一可知，二叉树的中序遍历是有序，那么我们假定恢复之后的二叉树中序遍历有下列序：

```
a[1], a[2], a[3], ... , a[i], ... , a[j], ... , a[n]
```

交换`a[i]`和`a[j]`之后：

```
a[1], a[2], a[3], ... , a[j], ... , a[i], ... , a[n]
```

由于恢复的序列是有序的，有$\forall x \in [i,j-1], a[x] < a[j]$。这表明无论$i、j$的值是多少，都将存在一个不等式$a[j] > next(a[j])$。同理，也有$a[i] < last(a[i])$。

当我们找到满足$a[j] > next(a[j])$的节点，即可标记该节点为第一个错误节点。但是由于$a[j] > next(a[j])$，那必将满足$next(a[j]) < last(next(a[j]))$，这时候$a[i]$可能就是$next(a[j])$，也可能不是，因此对于第二个错误节点的查找至少判断能否找到第二个满足条件的第二个错误节点。

### Algorithm

```go
func recoverTree(root *TreeNode) {
	var tree []*TreeNode
	inOrder(root, func(node *TreeNode) { tree = append(tree, node) })
	var firstNode, secondNode *TreeNode
	for i := 0; i < len(tree); i++ {
		if firstNode == nil && tree[i].Val > tree[i+1].Val {
			firstNode = tree[i]
			continue
		}
		if firstNode != nil && tree[i].Val < tree[i-1].Val {
			secondNode = tree[i]
		}
	}
	firstNode.Val, secondNode.Val = secondNode.Val, firstNode.Val
}

func inOrder(root *TreeNode, fn func(*TreeNode)) {
	if root == nil {
		return
	}
	inOrder(root.Left, fn)
	fn(root)
	inOrder(root.Right, fn)
}
```

通过前面的讨论，我们知道第二个错误节点在找到第一个满足条件的节点时，无法判断其即为错误节点。但是找到第二个满足条件的节点时，已经可以直接判断其为错误节点。由此，我们可以优化一下循环，提前跳出循环。

```go
func recoverTree(root *TreeNode) {
	var tree []*TreeNode
	inOrder(root, func(node *TreeNode) { tree = append(tree, node) })
	var firstNode, secondNode *TreeNode
	for i := 0; i < len(tree); i++ {
		if firstNode == nil && tree[i].Val > tree[i+1].Val {
			firstNode = tree[i]
			continue
		}
		if firstNode != nil && tree[i].Val < tree[i-1].Val {
			if secondNode == nil {
				secondNode = tree[i]
			} else {
				secondNode = tree[i]
				break
			}
		}
	}
	firstNode.Val, secondNode.Val = secondNode.Val, firstNode.Val
}
```

### Complexity Analysis

* 时间复杂度：$O(n)$。
* 空间复杂度：$O(n)$。

## Approach #3 InOrder with Find

### Intuition

方法二给了一种在中序遍历之后找两个错误节点的方法，那么是否可以在中序遍历的过程中寻找错误的节点呢？

答案是肯定的。只不过在中序遍历的过程中，一个树中的某一个节点的前一个遍历节点可能是它的左子节点，也可能是它的父节点，也可能是它的左子节点的右子节点等等。一个节点的前一个节点和后一个节点都是无法直接判断出来的，因此我们更倾向于用一个指针来记录上一个遍历的节点。

由于寻找`a[i]`和`a[j]`有一定的共性，我们可以将它们合并在一起，不需要寻找当前节点的后一个节点，只需要查找当前节点的前一个节点。因为查找后一个节点是无法在常数级别中实现的。

### Algorithm

由于LeetCode的评测方式限制，我们所声明的全局变量在不同样例测试中是共同使用的，因此必须在算法开头对全局变量进行初始化。

```go
var firstNode, secondNode, prevNode *TreeNode

func recoverTree(root *TreeNode) {
	firstNode, secondNode, prevNode = nil, nil, nil
	inOrder(root)
	firstNode.Val, secondNode.Val = secondNode.Val, firstNode.Val
}

func inOrder(root *TreeNode) {
	if root == nil {
		return
	}
	inOrder(root.Left)
	if firstNode == nil && prevNode != nil && prevNode.Val > root.Val {
		firstNode = prevNode
	}
	if firstNode != nil && prevNode.Val > root.Val {
		secondNode = root
	}
	prevNode = root
	inOrder(root.Right)
}
```

### Complexity Analysis

* 时间复杂度：$O(n)$。
* 空间复杂度：$O(n)$，消耗在递归生成函数栈上。

## Approach #4 Morris Traversal

### Intuition

Morris Traversal是一种用常数空间来实现二叉树的先序、中序、后序遍历的算法，用上了线索二叉树的概念。

Morris Traversal来实现中序遍历的算法如下：

1. 初始化当前节点`cur`为`root`节点。
2. 如果`cur`没有左子节点，那么输出`cur`并执行`cur = cur.Right`。
3. 如果`cur`有左子节点，在`cur`的左子树上找到`cur`在中序遍历中的前驱节点。
   * 如果前驱节点的右子节点为空，那么将前驱节点的右子节点置为`cur`，当前节点置为`cur`的左子节点。
   * 如果前驱节点的右子节点为当前节点，那么将前驱节点的右子节点置为空，输出`cur`，当前节点置为`cur`的右子节点。
4. 重复执行2、3步骤，直到`cur`为空。

将这种遍历方法结合方法三，即可实现常数空间的解决方案。

### Algorithm

```go
func recoverTree(root *TreeNode) {
	var curNode, prevNode, tmpNode, firstNode, secondNode *TreeNode
	check := func () {
		if firstNode == nil && prevNode != nil && prevNode.Val > curNode.Val {
			firstNode = prevNode
		}
		if firstNode != nil && prevNode.Val > curNode.Val {
			secondNode = curNode
		}
	}
	curNode = root
	for curNode != nil {
		if curNode.Left == nil {
			check()
			prevNode, curNode = curNode, curNode.Right
		} else {
			tmpNode = curNode.Left
			for tmpNode.Right != nil && tmpNode.Right != curNode {
				tmpNode = tmpNode.Right
			}
			if tmpNode.Right == nil {
				tmpNode.Right, curNode = curNode, curNode.Left
			} else {
				check()
				tmpNode.Right, prevNode, curNode = nil, curNode, curNode.Right
			}
		}
	}
	firstNode.Val, secondNode.Val = secondNode.Val, firstNode.Val
}
```

### Complexity Analysis

* 时间复杂度：$O(n)$。
* 空间复杂度：$O(1)$。

## Finally

这是一道二叉树性质的考察题目，考察了二叉树的遍历方法。同时，本人也学到了Morris遍历方法。

