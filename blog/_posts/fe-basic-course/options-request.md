---
tags:
  - 前端基础
  - 网络
date: 2023-03-22
---

# 跨域（Options）请求介绍及解决方法

## 介绍
`OPTIONS请求`指method为`OPTIONS`的http请求。  
通俗来说：它的作用是用于WEB服务器是否支持某些 header，也可以叫做`预检请求`(顾名思义：预先检测)。  
```js
程序员：跨域发送 http get { headers { xxx: abc } }
浏览器：等等，你这个请求有点奇怪，我去跟服务器确认下
浏览器：发送 http options { Access-Control-Allow-Headers: xxx }
       （你能接受 xxx header 吗？）
服务器：响应 http 200 ok { Access-Control-Allow-Headers: xxx}
       （可以的，来吧）
浏览器：发送 http get { headers { xxx: abc } }
```
*通俗说法为了快速理解，并不十分精准*   
 
[MDN定义](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Methods/OPTIONS)：  
> HTTP 的 OPTIONS 方法 用于获取目的资源所支持的通信选项。  

## `OPTIONS请求`负面影响
1. 请求数据会多一次往返的时间消耗，具体消耗多长时间，取决与用户到服务器（端到端）的网络延迟，及服务的响应时长。  
通常在50ms~500ms之间。  
2. 后端程序员或一些nginx规则经常不处理`OPTIONS请求`，导致请求返回404，后续请求失败。  


## 浏览器发起`OPTIONS请求`的条件
1. **请求跨域，且2、3满足一个**   
2. 请求方法**不是**：HEAD、GET、POST    
3. HTTP的头信息**超出以下**几种字段：  
```java
  Accept  
  Accept-Language  
  Content-Language  
  Last-Event-ID  
  Content-Type：仅限以下三个值
    application/x-www-form-urlencoded、multipart/form-data、text/plain
    （比如常见的 application/json 不在此列，所以会发送 options 请求）
```

*参考： [阮一峰：跨域资源共享 CORS 详解](http://www.ruanyifeng.com/blog/2016/04/cors.html)*  


我们遇到的`OPTIONS请求`几乎都是浏览器自行发起的。    
为什么只有跨域请求浏览器才会自动发起`OPTIONS请求`？    
可以理解为，浏览器默认不同域名的服务器不是由你维护的，**保险起见需要预先检查**一下目标域名的服务器是否支持你自定义的 header 或 method  

## 如何避免Options
方法一：配置网关转发规则，让前后端资源在同一域名下，通过 path 隔离前后端，从而避免跨域  
方法二：将请求转换[简单请求](http://www.ruanyifeng.com/blog/2016/04/cors.html)，比如自定义的 header 通过 query 参数传递  

如果`OPTIONS请求`无法避免，设置缓存可尽量降低其负面影响，比如缓存一年：`Access-Control-Max-Age: 31536000`，这样后续相同URL的请求就不会发起`OPTIONS请求`了。  
注意：缓存是针对URL的，**URL一旦变化缓存会失效**（比如URL中时间戳每次都变），会重新发起`OPTIONS请求`  
