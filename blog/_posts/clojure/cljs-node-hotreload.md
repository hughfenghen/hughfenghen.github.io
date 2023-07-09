# ClojureScript + node + hotreload

*假设你已经创建了项目，并安装了shadow-cljs相关依赖，若未完成请参考文档创建项目：https://shadow-cljs.github.io/docs/UsersGuide.html*

*本文示例采用shadow-cljs打包构建，详细资料参考[官方文档](https://shadow-cljs.github.io/docs/UsersGuide.html#target-node-script)*

**文件目录结构**
```
|-src
|  |-demo
|    |-script.cljs
|
|-shadow-cljs.edn
```

**在项目根目录配置文件`shadow-cljs.edn`**
```clojure
{:source-paths ["src"]
 :builds {:script
            {:id        :script
             :target    :node-script
             :main      demo.script/main
             :output-to "target/script.js"
             ;必须配置devtools，才能开启热替换
              :devtools {:before-load-async demo.script/stop
                                :after-load demo.script/start}}}}
```

**src/demo/script.cljs代码**
```clojure
(ns demo.script)

(defn main []
  (prn "hello world"))

; 如果是web服务应用，参考官方例子，应该在stop中关闭服务
(defn stop [done]
  (done))

(defn start []
  (main))
```

* **确保代码stop函数能执行done**
* cd 到项目目录，执行`shadow-cljs watch script`，然后等待安装依赖、编译完成
* 新开terminal，执行`node target/script.js`，可以看到控制台输出“hello world”
* 修改`src/demo/script.cljs`保存，可以看到terminal有输出“stop”、“hello word”，说明重新执行了`stop、start函数`
