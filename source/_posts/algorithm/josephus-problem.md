---
title: Algorithm | Josephus Problem
date: 2018-1-18
categories: Algorithm
tags: Circular Linked List
---

Josephus problem, sometimes called Josephus permutation, is an interesting counting-out game. Also, this kind of problem is called Josephus circle.

<!-- more -->

## Description

People stand in a circle waiting to be executed. Counting begins at a specified position and proceeds around the circle in a specified direction. Set a positive number as a dead number. While a person counts this number, he will be killed and counting will begin at the next person. When there is one person remaining, the game will end.

If we sign every person as a number from `0` to `n - 1`, and counting begins at `0` and end at `k - 1`, how can we get the number of dead person one by one? And how can we get the number of final person?

## Approach #1 Simulation

### Intuition

The easiest solution is that we can simulate the whole process of counting. And then we could find the person who will be killed one by one. This solution doesn't need any algorithm knowledge, just implementing a simulation. You can achieve it by an array to record who is dead. You can also achieve it by a circular linked list. These implementation are both easy.

### Algorithm

The following use an array to record who is dead.

```c++
#include <iostream>
using namespace std;

int main() {
  int n, k;
  cin >> n >> k;
  bool isDead[n] = {0};
  int remain = n, index = 0, count = 0;
  while (remain != 1) {
    if (isDead[index] == false) count++;
    if (count == k) {
      cout << "Kill person " << index << endl;
      isDead[index] = true;
      remain--;
      count = 0;
    }
    index++;
    if (index == n) index = 0;
  }
  while (isDead[index]) {
    index++;
    if (index == n) index = 0;
  }
  cout << "Finally person " << index << " alive" << endl;
}
```

The following use an array to simulate circular linked list.

```c++
#include <iostream>
using namespace std;

int main() {
  int n, k;
  cin >> n >> k;
  int next[n];
  for (int i = 0; i < n - 1; i++) {
    next[i] = i + 1;
  }
  next[n - 1] = 0;
  int index = 0, prev_index = n - 1;
  while (next[index] != index) {
    for (int i = 1; i < k; i++) {
      prev_index = index;
      index = next[index];
    }
    cout << "Kill person " << index << endl;
    index = next[prev_index] = next[index];
  }
  cout << "Finally person " << index << " alive" << endl;
}
```

### Complexity Analysis

* Time Complexity: $O(kn)$.
* Space Complexity: $O(n)$.

Although those two solution have the same complexity, the second runs faster without judging that somebody is dead or not while counting.

## Approach #2 Dynamic Programming

### Intuition

We know that, if we count from number `0`, then the number of person killed must be `k - 1`. So if we kill a person and after that we renumber, the person we killed is always `k - 1`.

We kill two persons, and show the numbers in these two round.

```
first:  0,        1,  ...,  k-2,  k-1,  k,  k+1,  ...,    n-3,    n-2,    n-1
killed: 0,        1,  ...,  k-2,  [ ],  k,  k+1,  ...,    n-3,    n-2,    n-1
renum:  n-k,  n+1-k,  ...,  n-2,  [ ],  0,    1,  ...,  n-3-k,  n-2-k,  n-1-k

second: 0,        1,  ...,  k-2,  k-1,  k,  k+1,  ...,    n-3,    n-2,    [ ]
killed: 0,        1,  ...,  k-2,  [ ],  k,  k+1,  ...,    n-3,    n-2,    [ ]
renum:  n-k,  n+1-k,  ...,  n-2,  [ ],  0,    1,  ...,  n-3-k,  n-2-k,    [ ]
```

Firstly, the problem is killing `n - 1` persons with `n` and `k`. If we kill one person, the problem will be killing `n - 2` persons with `n - 1` and `k`.

In view of the above-mentioned data, we can find that `F(n) = (F(n-1) + k) % n`, if we assume that `F(n)` is the number of final person when there are still `n` persons.

We can get that `F(1) = 0`. With the formula of the relation between `F(n)` and `F(n-1)`,  we can calculate the real number of final person.

Also, not only can it get information about final person, but also the formula can be used for each person.

### Algorithm

To complement `F(n)`, we can use recursion or loop.

**Recursion version:**

```c++
int Josephus(int n, int k) {
  if (n == 1) return 0;
  return (Josephus(n - 1, k) + k) % n;
}
```

**Loop version:**

```c++
int Josephus(int n, int k) {
  int result = 0;
  for (int i = 1; i <= n; i++) {
    result = (result + k) % i;
  }
  return result;
}
```

If we want to get each number of person killed, we can run `n - 1` times `Josephus()`. In addition, the function needs to change a lot.

```c++
#include <iostream>
using namespace std;

int Josephus(int n, int k, int alive) {
  int result = alive - 1;
  for (int i = alive; i <= n; i++) {
    result = (result + k) % i;
  }
  return result;
}

int main() {
  int n, k;
  cin >> n >> k;
  for (int i = n; i > 1; i--) {
    cout << "Kill person " << Josephus(n, k, i) << endl;
  }
  cout << "Finally person " << Josephus(n, k, 1) << " alive" << endl;
}
```

### Complexity Analysis

* Time Complexity: $O(kn)$, if sequence needed. $O(n)$, if only the number of final person needed.
* Space Complexity: $O(1)$.
