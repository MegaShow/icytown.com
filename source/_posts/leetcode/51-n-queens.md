---
title: LeetCode | 51 N-Queens
date: 2018-10-22
categories: LeetCode
---

## Description

The *n*-queens puzzle is the problem of placing *n* queens on an *n*×*n* chessboard such that no two queens attack each other.

Given an integer *n*, return all distinct solutions to the *n*-queens puzzle.

Each solution contains a distinct board configuration of the *n*-queens' placement, where `'Q'` and `'.'` both indicate a queen and an empty space respectively.

<!-- more -->

**Example:**

```
Input: 4
Output: [
 [".Q..",  // Solution 1
  "...Q",
  "Q...",
  "..Q."],

 ["..Q.",  // Solution 2
  "Q...",
  "...Q",
  ".Q.."]
]
Explanation: There exist two distinct solutions to the 4-queens puzzle as shown above.
```

## Approach #1 Backtracking

### Intuition

这周比较懒，所以找了一道N皇后问题来做。N皇后问题通常都是使用回溯的DFS来解决。

如果是简单的DFS，有如下的算法：

```
FUNC dfs(depth, maxDepth, chessboard, res)
    IF depth == maxDepth
        IF chessboard is valid
            push chessboard into res
        END
        return
    END
    FOR i IN 0...n
        put a queen into chessboard[depth][i]
        dfs(depth + 1, maxDepth, chessboard, res)
        put the queeen out of chessboard[depth][i]
    END
END
```

实际上我们可以提前判断棋盘是否合法。

```
FUNC dfs(depth, maxDepth, chessboard, res)
    IF depth == maxDepth
        push chessboard into res
        return
    END
    FOR i IN 0...n
        put a queen into chessboard[depth][i]
        IF chessboard is valid
            dfs(depth + 1, maxDepth, chessboard, res)
        END
        put the queeen out of chessboard[depth][i]
    END
END
```

由于提前判断了棋盘的合法性，那么关于判断棋盘的方法也可以做修改。我们只需要根据深度与最新的皇后的位置，判断可能出现皇后的位置。比如一个8*8的棋盘，深度为4，最新皇后位置为3，那么我们只需检查为X的位置。

```
  0 1 2 3 4 5 6 7
0 . . . X . . . X
1 X . . X . . X .
2 . X . X . X . .
3 . . X X X . . .
4 . . . Q . . . .
5 . . . . . . . .
6 . . . . . . . .
7 . . . . . . . .
```

两次优化可以减少部分不必要的耗时。

### Algorithm

```go
import "strings"

func solveNQueens(n int) (res [][]string) {
	chessboard := make([]string, n)
	for i := 0; i < n; i++ {
		chessboard[i] = strings.Repeat(".", n)
	}
	dfs(0, n, chessboard, &res)
	return
}

func dfs(depth, n int, chessboard []string, res *[][]string) {
	if depth == n {
		dst := make([]string, n)
		copy(dst, chessboard)
		*res = append(*res, dst)
		return
	}
	for j := 0; j < n; j++ {
		if isValid(depth, n, j, chessboard) {
			str := []rune(chessboard[depth])
			str[j] = 'Q'
			chessboard[depth] = string(str)
			dfs(depth+1, n, chessboard, res)
			str[j] = '.'
			chessboard[depth] = string(str)
		}
	}
}

func isValid(depth, n, j int, chessboard []string) bool {
	for i := 1; i <= depth; i++ {
		if chessboard[depth-i][j] == 'Q' {
			return false
		} else if j-i >= 0 && chessboard[depth-i][j-i] == 'Q' {
			return false
		} else if j+i < n && chessboard[depth-i][j+i] == 'Q' {
			return false
		}
	}
	return true
}
```

由于Golang无法直接对`string`内部修改，我们需要将其转换为`[]rune`，然后再修改。

为了保证result能记录多个棋盘信息，每次深搜结束之后，都要拷贝原有的棋盘。

```go
dst := make([]string, n)
copy(dst, chessboard)
*res = append(*res, dst)
```

### Complexity Analysis

* 时间复杂度：$O(n!)$。
* 空间复杂度：$O(n^2)$。

## Approach #2 Backtracking 2

### Intuition

既然是一道简单的题目，那么我就接着探讨还有没有可以优化的地方。

我们知道，判断棋盘合法性是判断需要放皇后的位置的那一竖列、左斜列、右斜列有没有其他皇后。由于是按深度放置皇后，因此行不需要检查。那么，我们能不能记录某一列有没有皇后呢？这样，我们就不需要判断列中的每一个位置。

竖列的记录很简单，因为每次放皇后都需要知道新皇后的位置，那么我们可以在新皇后放置的时候记录某一列已存在皇后了。

对于左斜列、右斜列，我们可以将棋盘展开，这样就构成了`2 * n - 1`列，这样，就可以根据皇后的位置以及深度来判断当前处于哪一斜列。

这样，判断棋盘合法性的复杂度就被压缩成了常数级别。

### Algorithm

```go
import "strings"

func solveNQueens(n int) (res [][]string) {
	chessboard := make([]string, n)
	visit := make([][]bool, 3)
	visit[0] = make([]bool, n)
	visit[1] = make([]bool, 2*n-1)
	visit[2] = make([]bool, 2*n-1)
	for i := 0; i < n; i++ {
		chessboard[i] = strings.Repeat(".", n)
	}
	dfs(0, n, visit, chessboard, &res)
	return
}

func dfs(depth, n int, visit [][]bool, chessboard []string, res *[][]string) {
	if depth == n {
		dst := make([]string, n)
		copy(dst, chessboard)
		*res = append(*res, dst)
		return
	}
	for j := 0; j < n; j++ {
		if !visit[0][j] && !visit[1][n-1-depth+j] && !visit[2][depth+j] {
			str := []rune(chessboard[depth])
			str[j] = 'Q'
			chessboard[depth] = string(str)
			visit[0][j], visit[1][n-1-depth+j], visit[2][depth+j] = true, true, true
			dfs(depth+1, n, visit, chessboard, res)
			str[j] = '.'
			chessboard[depth] = string(str)
			visit[0][j], visit[1][n-1-depth+j], visit[2][depth+j] = false, false, false
		}
	}
}
```

### Complexity Analysis

* 时间复杂度：$O(n!)$。
* 空间复杂度：$O(n^2)$。

## Finally

这道题是一道非常简单的水题，不过挂了个`Hard`标签，有点不可思议。

