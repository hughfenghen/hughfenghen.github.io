# 随意笔记，累积后有需要再汇总

## 设计模式
- 闭包就近管理状态
- 强制清理
- 通用 class 插件？

## Linux下批量Kill多个进程的方法
`ps -ef | grep LOCAL=NO | grep -v grep | cut -c 9-15 | xargs kill -9`  
`ps -ef | grep Symantec | grep -v grep | cut -c 6-11 | xargs sudo kill -9`
