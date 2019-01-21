---
title: Algorithm | Capacitated Facility Location Problem
categories: Algorithm
date: 2018-12-23
tags:
  - NP
---

本文为《算法》课程上的作业，研究和实现容量设备选址问题求解的几个解决方案。本文涉及到了贪心法、局部搜索、模拟退火。

<!-- more -->

[[GitHub](https://github.com/MegaShow/college-programming/tree/master/Homework/Design%20and%20Analysis%20of%20Algorithms/CFLP)]  \[[测试样例](https://github.com/MegaShow/college-programming/tree/master/Homework/Design%20and%20Analysis%20of%20Algorithms/CFLP/testcases)]  [[测试结果](https://github.com/MegaShow/college-programming/tree/master/Homework/Design%20and%20Analysis%20of%20Algorithms/CFLP/best)]

## Description

带容量的设备选址问题(CFLP)是一个求解最优解问题，属于NP类问题。由于解的可能非常多，不可能一一枚举，在给定的有限时间内，只能求出接近最优解的解。

带容量的设备选址问题给定了数量$n$个设备和$m​$个人，其中每个设备都有开设的费用和容纳容量两个属性，而每个人有需求、到每一个设备的费用两个属性。设备可以选择开或者不开，但是每个人必须都有所对应的设备，并且设备要满足人的需求。

假设有10个设备和50个人，那么就一共有$50^{10}$种解，每个人都可以选择其中一个设备。除去大部分非法的解(即不满足容量限制)，剩下的解的数量也是非常庞大的。CFLP问题就是在这些合法的解中找到最优解，但是所需要的时间是非常长的。因此我们退而求其次，找到一个看起来比较接近最优解的解即可。

求解设备选址问题，通常采用启发式搜索，即我们选择一个初始解，按一定的策略进行启发式搜索，让我们所搜索到的解越来越接近最优解。启发式搜索的关键在于，如何定义搜索的策略。启发式搜索最终求得的解一定程度受初始解和搜索的策略的影响。当然，贪心法也可以求解CFLP问题，但是贪心法的关键在于如何定义贪心的策略。贪心法的解受贪心策略的影响，因此在策略固定的时候，贪心法的解是固定不变的。

接下来，我们首先设计好程序的数据结构、输入处理、输出处理。

## Structure

### Types

按照CFLP的内容，我们需要定义设备类型、消费者类型、解类型。

```cpp
struct Facility {
    int capacity;
    int openingCost;
};

struct Customer {
    int demand;
    std::vector<int> assignmentCost;
};

struct Result {
    int cost;
    std::vector<bool> status;
    std::vector<size_t> assignment;
};
```

其中，解类型包含了一切我们需要输出的数据。不过，为了防止数据错误，我们应该编写一个验证解类型的正确性的函数。

```cpp
bool check(const std::vector<Facility> &f, const std::vector<Customer> &c, const Result res) {
    int cost = 0, capacity[f.size()] = {0};
    for (size_t i = 0; i < f.size(); i++) {
        if (res.status[i]) {
            cost += f[i].openingCost;
        }
    }
    for (size_t i = 0; i < c.size(); i++) {
        capacity[res.assignment[i]] += c[i].demand;
        if (capacity[res.assignment[i]] > f[res.assignment[i]].capacity) {
            return false;
        }
        cost += c[i].assignmentCost[res.assignment[i]];
    }
    return cost == res.cost;
}
```

在任意一种方法求解到解之后，都可以使用`check`函数来验证解的合法性。

### Input

在CFLP中，我们需要处理的输入有两类：一个是CFLP的数据输入，一个是CFLP的当前最优解输入。

前者是CFLP的数据来源，而后者是CFLP的解。每次求得CFLP的解，都与当前最优解对比，如果CFLP的解比当前最优解更加好，那么就将我们求得的解存储到本地中，以提供给下一次求CFLP解进行对比。因为设备选址问题的启发式策略可能是随机的，将当前最优解存储下来有利于数据的对比。

```cpp
std::pair<Result, std::pair<std::vector<Facility>, std::vector<Customer>>> input(int testcase) {
    size_t facilityNum, customerNum;
    std::vector<Facility> facilities;
    std::vector<Customer> customers;
    Result result;
    // 数据输入
    std::ifstream in("testcases/p" + std::to_string(testcase));
    in >> facilityNum >> customerNum;
    for (size_t i = 0; i < facilityNum; i++) {
        Facility facility;
        in >> facility.capacity >> facility.openingCost;
        facilities.push_back(facility);
    }
    for (size_t i = 0; i < customerNum; i++) {
        Customer customer;
        double val;
        in >> val;
        customer.demand = (int) val;
        customers.push_back(customer);
    }
    for (size_t i = 0; i < facilityNum; i++) {
        for (size_t j = 0; j < customerNum; j++) {
            double val;
            in >> val;
            customers[j].assignmentCost.push_back((int) val);
        }
    }
    in.close();
    // 当前最优解输入
    std::ifstream rin("best/p" + std::to_string(testcase));
    if (rin.is_open()) {
        rin >> result.cost;
        for (size_t i = 0; i < facilityNum; i++) {
            bool val;
            rin >> val;
            result.status.push_back(val);
        }
        for (size_t i = 0; i < customerNum; i++) {
            size_t val;
            rin >> val;
            result.assignment.push_back(val);
        }
    } else {
        result.cost = 0;
    }
    rin.close();
    return std::make_pair(result, std::make_pair(facilities, customers));
}
```

### Output

与输入一样，输出也需要处理两类数据，一个是将求得的解输出到控制台中，另一个是将求得的解和当前最优解对比，如果当前最优解不够好，那么就更新本地存储的当前最优解。

```cpp
void output(int testcase, Result best, Result res) {
    // 解输出
    std::cout << res.cost << std::endl;
    if (res.status.size() != 0) {
        std::cout << res.status[0];
        for (size_t i = 1; i < res.status.size(); i++) {
            std::cout << ' ' << res.status[i];
        }
        std::cout << std::endl;
    }
    if (res.assignment.size() != 0) {
        std::cout << res.assignment[0];
        for (size_t i = 1; i < res.assignment.size(); i++) {
            std::cout << ' ' << res.assignment[i];
        }
        std::cout << std::endl;
    }
    // 对比、存储当前最优解
    if (best.cost < res.cost && best.cost != 0) {
        std::cout << "Compare with best cost " << best.cost << ", percentage " << (float)(res.cost - best.cost) / best.cost * 100 << '%' << std::endl; 
    } else {
        std::cout << "Get the best cost" << std::endl;
        std::ofstream out("best/p" + std::to_string(testcase));
        out << res.cost << std::endl;
        if (res.status.size() != 0) {
            out << res.status[0];
            for (size_t i = 1; i < res.status.size(); i++) {
                out << ' ' << res.status[i];
            }
            out << std::endl;
        }
        if (res.assignment.size() != 0) {
            out << res.assignment[0];
            for (size_t i = 1; i < res.assignment.size(); i++) {
                out << ' ' << res.assignment[i];
            }
            out << std::endl;
        }
        out.close();
    }
}
```

当然，我们还需要记录一下程序执行的时间，以完成我们的数据记录表。

```cpp
void test(int testcase, std::function<Result(std::vector<Facility>, std::vector<Customer>)> fn) {
    std::cout << "Test " << testcase << ":" << std::endl;
    std::pair<Result, std::pair<std::vector<Facility>, std::vector<Customer>>> data = input(testcase);
    auto start = std::chrono::system_clock::now();
    Result res = fn(data.second.first, data.second.second);
    auto stop = std::chrono::system_clock::now();
    output(testcase, data.first, res);
    std::ofstream out("best/markdown", std::ios_base::app);
    out << "| p" << testcase << " | " << res.cost << " | " << (double) std::chrono::duration_cast<std::chrono::milliseconds>(stop - start).count() / 1000 << " |" << std::endl;
    out.close();
    std::cout << std::endl;
}
```

## Approach #1 Greedy

### Intuition

贪心法是解决设备选址问题的其中一种方法，应该也算是最简单的方法了(除了随机法)。但是贪心法求得的解很大程度取决于贪心策略，通常和最优解有蛮大程度的差距。

贪心法的核心在于如何制定贪心策略，一个贪心策略的好坏决定了解的好坏。而且，贪心法通常只能考虑到一般情况，如果有特殊测试样例，可能贪心法还不如随机法。

我们知道，设备可以选择开与不开，而人必须要选择一个设备。因此，最简单的贪心策略就是让人去选择最优的设备。为了让程序更简单，我们可以按输入数据的人的顺序来选择设备。

$Solution = \Sigma Facility.openingCost + \Sigma Min(Customer.assignmentCost)$

当然，我们要加一下限制，必须让解合法，也就是将人的安排费用从小到大排序，优先选择费用小的并且容量足够的设备。

不过，如果你实现了这种策略之后，就会发现，基本所有设备都被开启了。这样会产生大量的费用，因为某些人即使选择比最小费用差一点的设备，而使得设备空闲下来，可能总费用比选择最小费用的设备还要低。为了减弱这种情况对解的影响，我们将设备所使用的容量排序，每次删去已使用容量最少的设备，然后再重新按之前的策略进行设备分配。

如果删去了某个设备，所求得的解比之前的解更加好，那么就保持这种设备开启情况，并且继续删去下一个设备。如果所求得的解比之前的更坏，那么我们可以恢复之前删去的设备，并去删去下一个设备。这样，就可以将大部分设备关闭。

以上的贪心策略总结起来就是两条规则：

* 策略1：将每个人分配到费用最低且容量足够的设备上。
* 策略2：尝试删去容量分配最少的设备，重新执行策略1。

虽然删去设备、恢复设备这些操作看起来比较像是启发式搜索，不过由于策略是固定的，每次所得到的解也是固定的。

### Algorithm

首先实现一个带设备过滤限制的贪心函数，该函数可以将部分设备过滤掉，从剩下的设备种执行策略1。

```cpp
Result greedyWithFilter(const std::vector<Facility> &f, const std::vector<Customer> &c, std::vector<std::pair<int, size_t>> &capacity, const std::vector<bool> &filter) {
    Result res;
    res.cost = 0;
    res.status = std::vector<bool>(f.size());
    res.assignment = std::vector<size_t>(c.size());
    std::vector<std::vector<std::pair<int, size_t>>> cost(c.size());
    for (size_t i = 0; i < c.size(); i++) {
        for (size_t j = 0; j < c[i].assignmentCost.size(); j++) {
            cost[i].push_back(std::make_pair(c[i].assignmentCost[j], j));
        }
        std::sort(cost[i].begin(), cost[i].end(), [](std::pair<int, size_t> a, std::pair<int, size_t> b) -> bool {
            return a.first < b.first;
        });
    }
    for (size_t i = 0; i < f.size(); i++) {
        capacity.push_back(std::make_pair(0, i));
    }
    for (size_t i = 0; i < c.size(); i++) {
        size_t index = 0;
        while (index < cost[i].size() && (filter[cost[i][index].second] == false ||
            capacity[cost[i][index].second].first + c[i].demand > f[cost[i][index].second].capacity)) {
            index++;
        }
        if (index == cost[i].size()) {
            res.cost = 0;
            break;
        }
        if (res.status[cost[i][index].second] == false) {
            res.status[cost[i][index].second] = true;
            res.cost += f[cost[i][index].second].openingCost;
        }
        res.assignment[i] = cost[i][index].second;
        res.cost += cost[i][index].first;
        capacity[cost[i][index].second].first += c[i].demand;
    }
    return res;
}
```

接下来，实现贪心函数，负责实现设备删去、设备恢复等逻辑。

```cpp
Result Greedy(const std::vector<Facility> &f, const std::vector<Customer> &c) {
    std::vector<bool> filter(f.size());
    for (size_t i = 0; i < f.size(); i++) {
        filter[i] = true;
    }
    std::set<size_t> s;
    Result best;
    best.cost = 0;
    size_t last = (size_t) -1;
    while (s.size() != f.size()) {
        std::vector<std::pair<int, size_t>> capacity;
        Result res = greedyWithFilter(f, c, capacity, filter);
        if ((res.cost != 0 && res.cost <= best.cost) || best.cost == 0) {
            best = res;
        } else if (last != (size_t)-1 || res.cost == 0) {
            filter[last] = true;
        }
        std::sort(capacity.begin(), capacity.end(), [](std::pair<int, size_t> a, std::pair<int, size_t> b) -> bool {
            return a.first < b.first;
        });
        size_t index = 0;
        while (index < capacity.size() && (filter[capacity[index].second] == false || s.count(capacity[index].second))) {
            index++;
        }
        if (index == capacity.size()) {
            break;
        }
        last = capacity[index].second;
        filter[last] = false;
        s.insert(last);
    }
    if (check(f, c, best) == false) {
        std::cout << "Error Result" << std::endl;
        std::exit(-1);
    }
    return best;
}
```

### Result

| Test Case | Result | Time(s) |
| :-------: | :----: | :-----: |
| p1 | 9142 | 0.001 |
| p2 | 8104 | 0.001 |
| p3 | 9824 | 0.001 |
| p4 | 11261 | 0.002 |
| p5 | 9348 | 0.001 |
| p6 | 8061 | 0.001 |
| p7 | 9990 | 0.001 |
| p8 | 11790 | 0.003 |
| p9 | 8598 | 0.002 |
| p10 | 7617 | 0.002 |
| p11 | 9064 | 0.001 |
| p12 | 10301 | 0.001 |
| p13 | 8544 | 0.007 |
| p14 | 7307 | 0.007 |
| p15 | 9276 | 0.007 |
| p16 | 11076 | 0.008 |
| p17 | 8579 | 0.007 |
| p18 | 7342 | 0.008 |
| p19 | 9174 | 0.008 |
| p20 | 10774 | 0.007 |
| p21 | 8397 | 0.008 |
| p22 | 7330 | 0.007 |
| p23 | 8943 | 0.009 |
| p24 | 10543 | 0.008 |
| p25 | 12167 | 0.044 |
| p26 | 11086 | 0.045 |
| p27 | 12886 | 0.046 |
| p28 | 14686 | 0.047 |
| p29 | 14307 | 0.047 |
| p30 | 12852 | 0.046 |
| p31 | 15252 | 0.045 |
| p32 | 17439 | 0.045 |
| p33 | 12224 | 0.045 |
| p34 | 11232 | 0.047 |
| p35 | 12883 | 0.046 |
| p36 | 14483 | 0.048 |
| p37 | 11521 | 0.055 |
| p38 | 10594 | 0.046 |
| p39 | 12067 | 0.045 |
| p40 | 13273 | 0.046 |
| p41 | 6847 | 0.003 |
| p42 | 5843 | 0.013 |
| p43 | 5401 | 0.021 |
| p44 | 7585 | 0.003 |
| p45 | 6523 | 0.012 |
| p46 | 6123 | 0.022 |
| p47 | 6634 | 0.003 |
| p48 | 5615 | 0.013 |
| p49 | 5567 | 0.022 |
| p50 | 9454 | 0.004 |
| p51 | 7576 | 0.017 |
| p52 | 9588 | 0.003 |
| p53 | 8795 | 0.013 |
| p54 | 9702 | 0.003 |
| p55 | 8159 | 0.014 |
| p56 | 22166 | 0.06 |
| p57 | 27266 | 0.061 |
| p58 | 39554 | 0.064 |
| p59 | 30232 | 0.064 |
| p60 | 20974 | 0.071 |
| p61 | 25172 | 0.065 |
| p62 | 33549 | 0.062 |
| p63 | 27319 | 0.065 |
| p64 | 20840 | 0.064 |
| p65 | 24994 | 0.063 |
| p66 | 32442 | 0.067 |
| p67 | 27048 | 0.069 |
| p68 | 20840 | 0.063 |
| p69 | 25005 | 0.065 |
| p70 | 33829 | 0.061 |
| p71 | 27022 | 0.061 |

## Approach #2 Local Search(Hill Climbing)

### Intuition

设备选址问题可以用启发式搜索求解，其中局部搜索是一种方法。在这里我采用爬山法来求解CFLP，爬山法属于局部搜索中的一种。

所谓的爬山法，就是从一个初始解出发，从当前解的邻域中找到比该解更好的解，然后将这个更好的解视为当前解。这样一直循环迭代下去，最终会趋于稳定，得到一个局部最优解。因为当前解是一直朝着更低的费用前进，只有向上的行为，所以叫爬山法。

不过局部搜索有一个缺点，就是最终解是一个局部最优解，可能不是整个问题的最优解。

局部搜索的关键在于初始解的生成和搜索策略的实现。通常情况下，初始解是可以随机生成的，但是，局部搜索的收敛速度是很慢的，我们可以基于一个比较好的解出发，而不是随机生成初始解。这里我们采用方法一贪心法所生成的解作为初始解，这样就能保证局部搜索的解一定比贪心法的解要好。

搜索策略的实现就是如何找邻域的问题，在TSP问题中我们可以简单的通过K-opt法来找邻域，但是在CFLP问题中，由于限制比较多，邻域的定义也不那么直观。

我们定义一下的策略来随机生成某个解的邻域：

* 策略1：将1个人从某个设备移动到另一个设备。
* 策略2：将不同设备的2个人相互交换。
* 策略3：将2个设备安排的所有人相互交换。

以上3种策略所生成的解，我们都认为它是当前解的邻解。在局部搜索的每一次迭代中，寻找当前解的邻域中的某个解，通过对比这两个解的费用，来决定当前解是否修改。

### Algorithm

这里，我们不再采用前面贪心法修改解的方法，虽然它依靠`check`来检测错误可以很好找到打码时留下的BUG。我们实现一个`setNewCost`函数，根据解的消费者安排情况和设备开启情况，来计算新的总费用，并返回该解是否合法。

```cpp
bool setNewCost(const std::vector<Facility> &f, const std::vector<Customer> &c, Result &res) {
    int cost = 0, capacity[f.size()] = {0};
    for (size_t i = 0; i < f.size(); i++) {
        if (res.status[i]) {
            cost += f[i].openingCost;
        }
    }
    for (size_t i = 0; i < c.size(); i++) {
        capacity[res.assignment[i]] += c[i].demand;
        if (capacity[res.assignment[i]] > f[res.assignment[i]].capacity) {
            return false;
        }
        cost += c[i].assignmentCost[res.assignment[i]];
    }
    res.cost = cost;
    return true;
}
```

然后根据上述所提及的3个搜索策略，编写生成邻域的解的代码。生成邻域需要用上随机数生成函数，并使用当前时间作为随机种子。

```cpp
Result generateNeighborSolution(const std::vector<Facility> &f, const std::vector<Customer> &c, Result best) {
    std::default_random_engine random(std::chrono::system_clock::now().time_since_epoch().count());
    unsigned type = random() % 3;
    Result res;
    size_t count = 0;
    bool flag = false;
    switch (type + 1) {
    case 1: // 移动1个人
        do {
            // i - 人, j - 设备
            size_t i = random() % c.size(), j = random() % f.size();
            if (best.assignment[i] == j) {
                flag = true;
                continue;
            } else {
                flag = false;
            }
            res = best;
            size_t last = res.assignment[i];
            res.assignment[i] = j;
            bool empty = true;
            for (size_t k = 0; k < c.size(); k++) {
                if (res.assignment[k] == last) {
                    empty = false;
                    break;
                }
            }
            if (empty) {
                res.status[last] = false;
            }
            count++;
        } while (count < 100 && (flag || setNewCost(f, c, res) == false));
        break;
    case 2: // 交换2个人
        do {
            // i - 人A, j - 人B
            size_t i = random() % c.size(), j = random() % c.size();
            if (i == j || best.assignment[i] == best.assignment[j]) {
                flag = true;
                continue;
            } else {
                flag = false;
            }
            res = best;
            size_t tmp = res.assignment[i];
            res.assignment[i] = res.assignment[j];
            res.assignment[j] = tmp;
            count++;
        } while (count < 100 && (flag || setNewCost(f, c, res) == false));
        break;
    case 3: // 交换2个设备
        do {
            // i - 设备A, j - 设备B
            size_t i = random() % f.size(), j = random() % f.size();
            if (i == j) {
                flag = true;
                continue;
            } else {
                flag = false;
            }
            res = best;
            for (size_t k = 0; k < c.size(); k++) {
                if (res.assignment[k] == i) {
                    res.assignment[k] = j;
                } else if (res.assignment[k] == j) {
                    res.assignment[k] = i;
                }
            }
            count++;
        } while (count < 100 && (flag || setNewCost(f, c, res) == false));
        break;
    }
    return res;
}
```

接下来实现局部搜索的迭代部分，循环次数我们可以设置为$30*(|Facility|+|Customer|)$，这样可以保证不同大小的数据都能得到适合的迭代次数。

```cpp
Result LocalSearch(const std::vector<Facility> &f, const std::vector<Customer> &c) {
    Result best = Greedy(f, c);
    for (size_t i = 0; i < 30 * (f.size() + c.size()); i++) {
        Result res = generateNeighborSolution(f, c, best);
        if (best.cost > res.cost) {
            best = res;
        }
    }
    return best;
}
```

### Result

| Test Case | Result | Time(s) |
| :-------: | :----: | :-----: |
| p1 | 9055 | 0.017 |
| p2 | 8017 | 0.02 |
| p3 | 9550 | 0.021 |
| p4 | 10778 | 0.02 |
| p5 | 9213 | 0.016 |
| p6 | 7995 | 0.017 |
| p7 | 9913 | 0.018 |
| p8 | 11655 | 0.016 |
| p9 | 8598 | 0.016 |
| p10 | 7617 | 0.017 |
| p11 | 9064 | 0.016 |
| p12 | 10138 | 0.017 |
| p13 | 8544 | 0.027 |
| p14 | 7200 | 0.026 |
| p15 | 9249 | 0.026 |
| p16 | 11049 | 0.026 |
| p17 | 8459 | 0.027 |
| p18 | 7246 | 0.026 |
| p19 | 9058 | 0.029 |
| p20 | 10712 | 0.028 |
| p21 | 8173 | 0.025 |
| p22 | 7330 | 0.025 |
| p23 | 8943 | 0.024 |
| p24 | 10543 | 0.024 |
| p25 | 12036 | 0.129 |
| p26 | 10951 | 0.13 |
| p27 | 12662 | 0.146 |
| p28 | 14541 | 0.129 |
| p29 | 13343 | 0.13 |
| p30 | 12001 | 0.137 |
| p31 | 14296 | 0.133 |
| p32 | 16108 | 0.137 |
| p33 | 11849 | 0.134 |
| p34 | 11011 | 0.132 |
| p35 | 12474 | 0.132 |
| p36 | 14079 | 0.133 |
| p37 | 11329 | 0.131 |
| p38 | 10594 | 0.124 |
| p39 | 12067 | 0.126 |
| p40 | 13070 | 0.125 |
| p41 | 6847 | 0.038 |
| p42 | 5772 | 0.046 |
| p43 | 5373 | 0.055 |
| p44 | 7485 | 0.042 |
| p45 | 6515 | 0.045 |
| p46 | 6016 | 0.055 |
| p47 | 6482 | 0.04 |
| p48 | 5613 | 0.045 |
| p49 | 5369 | 0.056 |
| p50 | 8911 | 0.048 |
| p51 | 7545 | 0.063 |
| p52 | 9588 | 0.05 |
| p53 | 8795 | 0.06 |
| p54 | 9296 | 0.052 |
| p55 | 8158 | 0.058 |
| p56 | 21848 | 0.216 |
| p57 | 27189 | 0.199 |
| p58 | 39046 | 0.231 |
| p59 | 29222 | 0.222 |
| p60 | 20934 | 0.182 |
| p61 | 25036 | 0.186 |
| p62 | 33358 | 0.201 |
| p63 | 27241 | 0.183 |
| p64 | 20620 | 0.185 |
| p65 | 24888 | 0.181 |
| p66 | 32155 | 0.203 |
| p67 | 26234 | 0.196 |
| p68 | 20720 | 0.193 |
| p69 | 24899 | 0.201 |
| p70 | 33514 | 0.211 |
| p71 | 26933 | 0.204 |

## Approach #3 Simulated Annealing

### Intuition

通过上面两种方法，可以发现爬山法的费用跟贪心的费用相比有10%~15%的提升。不过，爬山法这类局部搜索方案很容易达到局部最优解，而没有办法求解更加好的解。

模拟退火是在局部搜索的基础上进行优化的启发式搜索方法，能够使得当前解有一定概率恶化，从而避免局部最优解。

我们可以设置一个初始温度，每次求邻域的解之后，对比当前解和邻域中的解的能量差。如果能量差为负，那就允许当前解变化。如果能量差为正，根据当前温度计算出一个概率值，有一定概率允许当前解变化。此时，当前解的费用是低于邻域解的，因此这种解的变化实际上是一种恶化。

我们取$R$为$[0,1]$中的任意一个实数，即随机值，取$P=e^{- \frac{\Delta E}{T} }$。如果$R<P$，那么我们就认为当前解可以恶化。

每次处理完解之后，当前温度将按降温系数的限制来降温，当温度降低到一定程度之后，即达到了终止温度之后，迭代结束。

模拟退火比较繁琐的一步是选取初始温度和降温系数，这里采用的初始温度为500，降温系数为0.96。

### Algorithm

模拟退火是在局部搜索的基础上优化的，实际上，生成邻域的代码可以完全照搬局部搜索的，我们只需要修改迭代一部分的代码。

首先定义初始温度、终止温度、降温系数。

```cpp
namespace simulated_annealing {
    const double T_START = 500;  // 初始温度
    const double T_END = 0.000001; // 终止温度
    const double Q = 0.9; // 降温系数
}
```

接下来实现降温操作、解恶化等。

```cpp
Result SimulatedAnnealing(const std::vector<Facility> &f, const std::vector<Customer> &c) {
    Result best = Greedy(f, c);
    double t = T_START;
    while (t > T_END) {
        for (size_t i = 0; i < 10 * (f.size() + c.size()); i++) {
            Result res = generateNeighborSolution(f, c, best);
            if (best.cost > res.cost) {
                best = res;
            } else {
                std::default_random_engine random(std::chrono::system_clock::now().time_since_epoch().count());
                std::uniform_real_distribution<> dist(0, 1);
                double r = dist(random);
                double p = std::exp((double)(best.cost - res.cost) / t);
                if (r < p) {
                    best = res;
                }
            }
        }
        t *= Q;
    }
    return best;
}
```

### Result

| Test Case | Result | Time(s) |
| :-------: | :----: | :-----: |
| p1 | 8985 | 1.379 |
| p2 | 7926 | 1.372 |
| p3 | 9513 | 1.363 |
| p4 | 11121 | 1.528 |
| p5 | 9198 | 1.249 |
| p6 | 7887 | 1.376 |
| p7 | 9887 | 1.235 |
| p8 | 11522 | 1.285 |
| p9 | 8477 | 1.15 |
| p10 | 7648 | 1.092 |
| p11 | 9361 | 1.145 |
| p12 | 10826 | 1.149 |
| p13 | 8842 | 1.591 |
| p14 | 7520 | 1.559 |
| p15 | 9288 | 1.596 |
| p16 | 11091 | 1.814 |
| p17 | 8452 | 1.614 |
| p18 | 7279 | 1.572 |
| p19 | 9113 | 1.529 |
| p20 | 11298 | 1.579 |
| p21 | 8144 | 1.5 |
| p22 | 7316 | 1.497 |
| p23 | 9182 | 1.476 |
| p24 | 11274 | 1.497 |
| p25 | 12689 | 6.996 |
| p26 | 11603 | 6.664 |
| p27 | 14009 | 6.644 |
| p28 | 16423 | 6.698 |
| p29 | 12651 | 7.061 |
| p30 | 11896 | 6.813 |
| p31 | 14598 | 6.842 |
| p32 | 17774 | 6.755 |
| p33 | 12028 | 6.887 |
| p34 | 11581 | 6.441 |
| p35 | 14468 | 6.808 |
| p36 | 16381 | 6.492 |
| p37 | 12200 | 6.428 |
| p38 | 11282 | 6.353 |
| p39 | 13978 | 6.334 |
| p40 | 15680 | 6.694 |
| p41 | 6945 | 2.669 |
| p42 | 7334 | 2.696 |
| p43 | 6655 | 2.806 |
| p44 | 7159 | 3.063 |
| p45 | 6679 | 2.708 |
| p46 | 7002 | 3.161 |
| p47 | 6316 | 3.158 |
| p48 | 6238 | 2.821 |
| p49 | 5825 | 2.871 |
| p50 | 9275 | 3.472 |
| p51 | 8132 | 3.91 |
| p52 | 9449 | 3.545 |
| p53 | 9628 | 3.369 |
| p54 | 9273 | 3.783 |
| p55 | 8157 | 3.552 |
| p56 | 23056 | 9.787 |
| p57 | 30896 | 10.34 |
| p58 | 46768 | 9.59 |
| p59 | 36127 | 9.55 |
| p60 | 22741 | 9.691 |
| p61 | 30648 | 9.682 |
| p62 | 46425 | 9.557 |
| p63 | 31937 | 9.388 |
| p64 | 23346 | 9.413 |
| p65 | 30361 | 9.376 |
| p66 | 45389 | 9.597 |
| p67 | 34301 | 9.263 |
| p68 | 22609 | 9.889 |
| p69 | 29729 | 11.412 |
| p70 | 47755 | 10.906 |
| p71 | 31295 | 13.429 |

## Solution Result

![1545496983687](cfl-problem/1545496983687.png)

以上是局部搜索的样例1-5的输出，其中每个样例的前三行为当前解，而最后一行为与本程序执行的最优解做比较。

如果需要查看其他样例的最优解，可以前往[GitHub](https://github.com/MegaShow/college-programming/tree/master/Homework/Design%20and%20Analysis%20of%20Algorithms/CFLP/best)查看。

可执行脚本编译运行程序。

```sh
$ ./build.sh
$ ./cflp
```

## Conclusion

本次用了贪心法、爬山法、模拟退火三种方法来解决CFLP问题，其中，基于贪心法的解作为初始解的爬山法的解是最优的，并且相比贪心法，费用降低了10%~15%左右。

~~而基于爬山法的模拟退火，可能是因为初始温度和温度系数的把控不当，模拟退火的解实际比爬山法还要差，并且及其不稳定。有时候模拟退火的解非常接近爬山法的解，而有时候解比贪心法还要差。~~

在经过多次修改之后，部分样例的模拟退火法可以求得更好的解，但是接近一半的样例还是比爬山法要差。不过相比贪心法已经有了一定提升。



