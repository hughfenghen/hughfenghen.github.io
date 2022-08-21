# shadow-cljs项目 在 proto repl 切换namespace

*按官方文档中的说明已经能正常连接proto-repl，但是repl中不能切换到源码所在的namespace，不能在开发期间执行业务代码*

查看官方文档操作，下面列出简单步骤，加粗为注意事项  
https://shadow-cljs.github.io/docs/UsersGuide.html#_proto_repl_atom

添加 proto-repl 依赖

watch启动，**并在浏览器打开页面**（如果不打开页面，在repl中执行代码会报错：“No application has connected to the REPL server. Make sure your JS environment has loaded your compiled ClojureScript code.”）  

atom 中 proto-repl connect nrepl

proto-repl 中执行`(shadow.cljs.devtools.api/nrepl-select :your-build)`

输入 1， shift-enter （检查namespace）

**如果namespace是cljs.user的话**

执行文件头部的 `ns` 代码块 (右键 -> proto-repl -> Execute Block)
```clj
; 本来我以为是用 `use` 来切换命名空间，实际上是用 `ns`
(ns 想进入的namespace
  (:require 引用的包))
```
输入 1， shift-enter (此时ns 已切换，可以执行文件中的任意代码，也可以访问的namespace中的状态、函数)
