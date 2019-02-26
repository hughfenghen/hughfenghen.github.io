# 同构项目(Vue) Service Worker 离线化实践

## 背景

团队计划在产品中尝试离线化某些功能，在这之前项目已经简单引入了(workbox)[https://github.com/GoogleChrome/workbox]来管理静态资源。因为没有缓存动态接口数据，所有页面并不支持离线访问。    
<!-- 动机：在移动端离线化方面做一些技术探索， -->
目标：使高流量页面支持离线访问，让用户意识到网页（非APP）也能在无网络场景下使用。  

<!-- 因为网站本身已经配置了比较完善的“长缓存”策略，workbox使用Servic Worker（后称SW）预缓存静态资源，只能带来很少的收益。   -->

## 方案

** 开始之前强烈建议仔细阅读并理解这篇文章： [Service Worker 生命周期](https://developers.google.com/web/fundamentals/primers/service-workers/lifecycle?hl=zh-cn) **

### 调研

在对SW工作原理有初步了解之后，分析总结我们面临的主要问题分两类。  
* 如何管理缓存资源（静态资源、接口数据）？  
	- 如何缓存静态资源（js, css...）  
	- 如何缓存后台接口数据  
	- 如何缓存动态获取的资源（如从接口获取的页面头图）  
	- 如何清除失效缓存  
* 如何解决同构项目特有问题？  
  - 缓存功能如何兼容首次访问和站内跳转的场景（*同构项目渲染方式有差异，首次访问Server端渲染、页面跳转client端渲染*）  
  - 如何缓存Server请求的页面初始化接口  
	<!-- 离线访问未缓存页面错误处理
		首次：空白首页
		二次：404 -->

### 设计
针对缓存管理的问题，决定以workbox为基础来实现。  
使用的workbox提供的 [workbox-webpack-plugin](https://developers.google.com/web/tools/workbox/guides/generate-service-worker/webpack)、[Precache Files](https://developers.google.com/web/tools/workbox/guides/precache-files/)、[Route Requests](https://developers.google.com/web/tools/workbox/guides/route-requests) 功能，然后再在其上编写动态资源、缓存清除逻辑，缓存关的问题基本上都解决了。  
大致流程如下：   
1. 集成workbox-webpack-plugin插件到构建流程，`workboxPlugin.GenerateSW`生成precache-manifest文件(包含所有静态资源的路径)  
1. 避免占用太多空间、节省流量等原因，只预缓存项目公共资源 `workbox.precaching.precacheAndRoute(self.__precacheManifest.filter(/* 自定义规则 */))`，SW每次install会增量获取有更新的资源  
1. `workbox.routing.registerRoute`拦截并缓存需离线访问页面的动态请求  
1. 非公共资源，按页面缓存到Cache Storage对应的key（根据页面生成）下，当页面达到一定数量则清除最老的页面缓存  
    * 如何获取到最旧的页面缓存？可以在每个页面创建一个时间戳缓存项，页面每次访问时都更新时间戳  

【图】


## 注意事项
sw提供的接口，页面在发起时最好添加域名（api域名可能跟页面域名不一致，sw无法响应）

SW兼容性（sw bridge）

ga 打点

## 意外问题

灰度方案

主文档
入口js
服务端接口缓存
自定义缓存规则（头图）  

状态检测

### bug
update to reload 不生效
	  因websocket 卡住
多tabs 切换状态干扰
chrome dev tool  timestamp显示错误
sw热更新文件 几率性失效
	workbox需要传绝对路径
* 不要拦截所有fetch请求

性能影响
https://developers.google.com/web/fundamentals/primers/service-workers/high-performance-loading#first_what_are_navigation_requests
Performance gotchas
【无网络场景 真机环境需要长时间确认】

https://developers.google.com/web/tools/workbox/modules/workbox-background-sync
⚠️ DO NOT USE CHROME DEVTOOLS OFFLINE ⚠️ The offline checkbox in DevTools only affects requests from the page. Service Worker requests will continue to go through.

bcSync 可能失效，clear data 或开启新窗口尝试

vue 离线访问为缓存的的路由，（onReady失败）会自动跳转到首页
