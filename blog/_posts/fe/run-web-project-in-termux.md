---
tags:
  - 前端
  - 工具
date: 2020-07-13
---

# 在Termux中运行web项目

## Termux是什么
[官网](https://termux.com/)
> Termux is an Android terminal emulator and Linux environment app that works directly with no rooting or setup required. A minimal base system is installed automatically - additional packages are available using the APT package manager.

就是在Android上运行一个Linux终端。

## 运行Web项目

是的，我在知道Termux后第一反应是可以用来写代码。

以[Erra项目](https://github.com/hughfenghen/Erra)为例。

1. 打开Termux
1. 安装node。`pkg install nodejs`
1. clone代码。`git clone https://github.com/hughfenghen/Erra.git`
1. `cd Erra`, 执行 `npm i`  

到此为止，应该一切都很顺利。。。

## node-gyp编辑错误

Termux毕竟不是真实的Linux环境，需要node-gyp编译的包容易出问题。

当时执行`npm i`后，以下是我遇到的问题：

- 第一个错误 `python is not command`  
  ok，这个容易理解。执行 `pkg install python`
- 仍然报错 `/data/data/com.termux/files/usr/bin/python -c import sys; print "%s.%s.%s" %`  
  ???, 想到了Python 2.7那个梗  
  执行 `pkg install python2`
- 继续install，继续报错 `gyp ERR! stack Error: not found: make`  
  google 得知 `pkg install build-essential`
- 继续install，继续报错 `make failed；recompile with -fPIC`  
  这个坑了比较久，github搜到几个回答要去改node-gyp下的文件。觉得这个方式不太好，最终根据[这个回答](https://github.com/termux/termux-packages/issues/3266#issuecomment-457255951)尝试 `CPPFLAGS="$CPPFLAGS -fPIC" npm i` 安装成功
  