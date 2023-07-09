---
tags:
  - 前端基础
date: 2023-03-27
---

# 系统化学习 TS 类型系统
目的：快速、系统性的入门 TS 类型系统

[[toc]]

## 前言
TS 是什么？  
TS 是 JS 的超集，  
TS = JS + 类型系统

为了描述如此复杂（由于 JS 语言的灵活性/复杂性）的类型信息，类型系统表现出非常明显的编程语言特性。  
**以学习编程语言的方式，来学习 TS 类型系统**  

## 关键字/符号
- 类型: boolean, number, string, null, undefined, unknow, any, never
- 运算符: &, |, ...
- 声明: type, interface, declare
- 其他: readonly, keyof, extends, infer, ?, -?

## 语法

**声明、条件分支、函数、循环/递归 是绝大部分语言的基础语法。**  

### 声明类型

`type N = 1 | 2 | 3`

### 声明类型结构

```ts
interface Point {
  x: number
  y: number
}

type Point3 = Point & { z: number } // 计算确切的结果

type Intersect<P, Q> = Pick<P, keyof P & keyof Q> // 描述计算过程，类似“函数”
```

*一般我用 interface 描述静态类型（数据）结构，用 type 描述类型之间的计算关系*  

### 条件分支

```ts
declare function distance<P extends Point>(p1: P, p2: P): number
distance(0, 1) // Error

declare function promisify<T>(p: T): T extends Promise<any> ? T : Promise<T>
```

### 递归
*循环不是编程语言的必要语法，循环的应用场景可被递归替代*  

```ts
type GenArr<
  N extends number, 
  Arr extends any[] = []
> = Arr["length"] extends N ? Arr : GenArr<N, [...Arr, 1]>;

type ThreeItemArr = GenArr<3>

N, Arr
3, []
3, [1]
3, [1, 1]
3, [1, 1, 1] // Arr["length"] => 3
```


## 标准库

**标准库是以语言自身基础能力实现的通用工具函数**  

**深入了解一门语言的最佳方式之一是阅读标准库源码**
可以学习如何灵活应用该语言基础特性、推荐风格、常用工具函数等等  

以下是高频使用的标准库工具函数，其实现涵盖大部分 TS 类型系统的特性。  
```ts
type Partial<T> = {
    [P in keyof T]?: T[P];
};
// Partial<{ x: string }> 
// { x?: string }

type Required<T> = {
    [P in keyof T]-?: T[P];
};
// Required<{ x?: string }> 
//  { x: string }

type Readonly<T> = {
    readonly [P in keyof T]: T[P];
};
// Readonly<{ x: string }> 
// { readonly x: string }

type Exclude<T, U> = T extends U ? never : T;
// Exclude<"a" | "b" | "c", "a">
// "b" | "c"

type Extract<T, U> = T extends U ? T : never;
// Extract<"a" | "b" | "c", "a">
// "a"

type Pick<T, K extends keyof T> = {
    [P in K]: T[P];
};
// Pick<{ x: string, y: number }, 'x'> 
// { x: string }

type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;
// Omit<{ x: string, y: number }, 'x'> 
// { y: number }

type Record<K extends keyof any, T> = {
    [P in K]: T;
};
// Record<string, string>
// { [k: string]: string }

type NonNullable<T> = T extends null | undefined ? never : T;
// NonNullable<null | 1 | 2> 
// 1 | 2

type Parameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? P : never;
// Parameters<(a: string, b: number) => Promise<string>>
// [string, number]

type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any;
// ReturnType<(a: string, b: number) => Promise<string>>
// Promise<string>
```

## 练习

### 柯里化函数类型描述
```ts
type Curr<Args, R> = Args extends [infer First, ... infer Rest]
  ? (arg: First) => Curr<Rest, R>
  : R

declare function curry<Fn extends (...args: any[]) => any> (fn: Fn):
Fn extends (...args: infer Args) => infer R ? Curr<Args, R> : never

function add (a: number, b: number): number {
  return a + b
}

const currAdd = curry(1)

currAdd(1)(2) // 3
```

### 获取 readonly 字段
```ts
type Equal<First, Second> = (<T>() => T extends First ? true : false) extends 
  (<T>() => T extends Second ? true : false) 
    ? true : false 

type GetReadonlyKeys<T> = {
  [P in keyof T]-?: Equal<
    { [O in P]: T[P] },
    { -readonly [O in P]: T[P] }
  > extends true
    ? never
    : P
}[keyof T]

GetReadonlyKeys<{ readonly x?: string, y: string, readonly z: number }>
// { readonly x: "x", y: never, readonly z: "z" }["x" | "y" | "z"]
// "x" | "z"
```

## 资源
[utility-types](https://github.com/piotrwitek/utility-types)  
[type-challenges](https://github.com/type-challenges/type-challenges)  