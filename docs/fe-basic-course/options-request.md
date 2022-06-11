# Options请求介绍及应对

## 介绍
`OPTIONS请求`指method为`OPTIONS`的http请求。  
通俗来说：它的作用是用于WEB服务器是否支持某些header，也可以叫做`预检请求`(顾名思义：提前检测)。  
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
```
  Accept  
  Accept-Language  
  Content-Language  
  Last-Event-ID  
  Content-Type：只限于三个值application/x-www-form-urlencoded、multipart/form-data、text/plain
```

*参考： [阮一峰：跨域资源共享 CORS 详解](http://www.ruanyifeng.com/blog/2016/04/cors.html)*  


大部分前后端程序员碰到`OPTIONS请求`是浏览器自动发起的。    
为什么只有跨域请求浏览器才会自动发起`OPTIONS请求`？    
可以理解为，浏览器默认不同域名的服务器不是由你维护的，**保险起见需要预先检查**一下目标域名的服务器是否支持你自定义的header（或其他）  

## 如何避免Options
方法一：配置网关转发规则，避免跨域  
方法二：将请求转换[简单请求](http://www.ruanyifeng.com/blog/2016/04/cors.html)，比如自定义的header通过query参数传递  
方法三：如果你不需要读取该请求的返回内容，可设置`mode: 'no-cors'`，参考[Request.mode](https://developer.mozilla.org/zh-CN/docs/Web/API/Request/mode)     
> no-cors — 保证请求对应的 method 只有 HEAD，GET 或 POST 方法，并且请求的 headers 只能有简单请求头   

*`mode: 'no-cors'`会忽略自定义的header*  

如果`OPTIONS请求`无法避免，设置缓存可尽量降低其负面影响，比如缓存一年：`Access-Control-Max-Age: 31536000`，这样后续相同URL的请求就不会发起`OPTIONS请求`了。  
**注意：缓存是针对URL的，URL一旦变化缓存会失效（比如URL中有时间戳），会重新发起`OPTIONS请求`**  
