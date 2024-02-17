---
tags:
  - 前端基础
date: 2024-02-17
---

# 一句话总结：TS 何时选择 interface 或 type

---

<span style="font-size: 24px">用 `interface` 描述类型的**结构**，用 `type` 描述类型**关系**。</span>  

---

*有点编程基础中**数据结构**与**算法**的味道。*

**结构**即是类型的**属性集合**
```ts
// 如 `Point3D` 的属性集合： `x, y, z`。
interface Point3D {
  x: number;
  y: number;
  z: number;
}
```

**关系**可以是类型结构（属性集合）计算的算法（子集、并集、交集...），或是类型计算后的结果

```ts
// 求子集算法
type Pick<T, K extends keyof T> = {
    [P in K]: T[P];
};

// type 描述关系：Point2D 是 Point3D 的子集
type Point2D = Pick<Point3D, 'x' | 'y'>
```

interface、type 两者能描述很多相同的场景，所以有时会陷入选择困难；  
大部分场景需要一个定性思维，快速选择不犹豫，即上文总结；

了解两者的细节区别也**是有必要的**，若有兴趣可继续阅读 [interface 与 type 区别介绍][2]

> interface 和 type 很像，很多场景两者都能使用，但也有细微的差别
> - 类型：对象、函数两者都适用，但是 type 可以用于基础类型、联合类型、元组。
> - 同名合并：interface 支持，type 不支持。
> - 计算属性：type 支持, interface 不支持。


以**编程语言模型**来理解 TS，可以阅读作者的另一篇文章[系统化学习 TS 类型系统][1]

---

特殊的**继承关系**

由于面向对象思想已成为编程常识，TS 语言提供了 `extends` 关键字来描述继承关系（特殊的并集关系），所以许多人认为类型继承场景应该使用 `interface ... extends ...`。

```ts
interface Point2D {
  x: number;
  y: number;
}

// 继承
interface Point3D extends Point2D {
  z: number;
}

// 并集
type Point3D = Point2D & { z: number }
```

[1]: https://hughfenghen.github.io/posts/2023/03/27/ts-types-system/
[2]: https://juejin.cn/post/6844904114925600776