# cljs中普通与瞬态数据结构性能对比

chrome 67； 
CPU：2.2 GHz Intel Core i7
内存：16 GB 1600 MHz DDR3

官方的例子:

```clj
(defn vrange [n]
  (loop [i 0 v []]
    (if (< i n)
      (recur (inc i) (conj v i))
      v)))

(defn vrange2 [n]
  (loop [i 0 v (transient [])]
    (if (< i n)
      (recur (inc i) (conj! v i))
      (persistent! v))))

(def v (vrange 1000000))    ;; 409 ms
(def v2 (vrange2 1000000))  ;; 115 ms
```

```js
// 纯js 28.4ms
console.time('abc');
for (let i = 0; i <= 1000000; i++) a.push(i);
console.timeEnd('abc');
```
