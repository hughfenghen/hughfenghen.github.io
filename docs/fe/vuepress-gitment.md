# VuePress 集成第三方评论模块

[VuePress](https://vuepress.vuejs.org/) 是一个 Vue 驱动的静态网站生成器，用来写文档的体验很好，本站就是基于VuePress的。

VuePress官方正在开发针对博客的优化功能[Blog Support roadmap](https://github.com/vuejs/vuepress/issues/36)，已经有人在喊建议集成disqus（ps：disqus已经被墙）了，有兴趣的同学可以去投个票。  

在官方之前，大家也可以参考本文为自己的博客/文档添加评论模块。

本文采用**Gitalk**作为示例，效果看文章底部。如果想集成其它第三方模块，本文代码也有一定参考性。  
**注意：Gitalk要求用户登录github才能评论**

## 注册 OAuth application
参考[gitalk](https://github.com/gitalk/gitalk/blob/master/readme-cn.md)，本博客下的评论区即是 gitalk  

你会得到一个 client ID 和一个 client secret，这个将被用于之后的用户登录。

## 创建或准备一个github仓库存储评论
Gitalk将评论都存储在仓库issue中，同时要求用户登录github才能评论，所以需要先准备一个仓库。
本博客托管在Github Pages上，所以直接使用[hughfenghen.github.io仓库](https://github.com/hughfenghen/hughfenghen.github.io)来存储评论了。

## 创建一个`enhanceApp.js`文件
在`./vuepress`目录下创建`enhanceApp.js`文件，
copy以下代码到文件中，填写代码中的`xxx`部分。
*如果已存在`enhanceApp`文件，则copy `try...catch`代码块和`integrateGitalk`函数*

```js
// 重试
function tryRun (fn, times = 3) {
  let execCount = 1
  
  fn(next)

  function next(delay) {
    if (execCount >= times) return
    setTimeout(() => {
      execCount += 1
      fn(next)
    }, delay);
  }
}

function integrateGitalk(router) {
  const linkGitalk = document.createElement('link')
  linkGitalk.href = 'https://unpkg.com/gitalk@1/dist/gitalk.css'
  linkGitalk.rel = 'stylesheet'
  const scriptGitalk = document.createElement('script')
  scriptGitalk.src = 'https://unpkg.com/gitalk@1/dist/gitalk.min.js'

  document.body.appendChild(linkGitalk)
  document.body.appendChild(scriptGitalk)

  router.afterEach((to, from) => {
    // 页面滚动，hash值变化，也会触发afterEach钩子，避免重新渲染
    if (to.path === from.path) return
    
    // 已被初始化则根据页面重新渲染 评论区
    tryRun((next) => {
      const $page = document.querySelector('.page')
      if ($page && window.Gitalk) {
        // 如果不setTimeout取到是上一篇文档的标题
        setTimeout(() => {
          renderGitalk($page, to.path)
        }, 1);
      } else {
        next(500)
      }
    }, 10)
  })

  function renderGitalk(parentEl, path) {
    // 移除旧节点，避免页面切换 评论区内容串掉
    const oldEl = document.getElementById('comments-container');
    oldEl && oldEl.parentNode.removeChild(oldEl);

    const commentsContainer = document.createElement('div')
    commentsContainer.id = 'comments-container'
    commentsContainer.classList.add('content')
    commentsContainer.style = 'padding: 0 30px;'
    parentEl.appendChild(commentsContainer)

    const gitalk = new Gitalk({
      clientID: 'xxx', // 第一步注册 OAuth application 后获取到的 Client ID
      clientSecret: 'xxx', // 第一步注册 OAuth application 后获取到的 Clien Secret
      repo: 'hughfenghen.github.io',
      owner: 'hughfenghen',
      admin: ['hughfenghen'],
      id: location.pathname,      // Ensure uniqueness and length less than 50
      distractionFreeMode: false  // Facebook-like distraction free mode
    })
    gitalk.render('comments-container')
  }
}

export default ({
  Vue, // VuePress 正在使用的 Vue 构造函数
  options, // 附加到根实例的一些选项
  router, // 当前应用的路由实例
  siteData // 站点元数据
}) => {
  try {
    // 生成静态页时在node中执行，没有document对象
    document && integrateGitalk(router)
  } catch (e) {
    console.error(e.message)
  }
}
```

[enhanceApp 参考文档](https://vuepress.vuejs.org/zh/guide/basic-config.html#%E4%B8%BB%E9%A2%98%E9%85%8D%E7%BD%AE)

## VuePress deploy
部署项目，如果还未部署，请参考[部署文档](https://vuepress.vuejs.org/zh/guide/deploy.html#github-pages)

## 注意事项
* VuePress构建的时候，在node中执行代码生成各个页面的时候，**此时document为undefined，所以写在try...catch块中**，构建时必然会执行到catch块代码。目前没找到环境检测方法。
* `document.querySelector('.page')`，page、content是VuePress现在默认的class，后续升级可能会报错，届时需要同步改一下。
* 如果需要对本文提供的代码进行改造，`renderGitalk`在每次路由切换后都必须执行，Gitalk的ID是页面的fullPath，如果未执行会导致页面间评论混乱。
* 评论之后刷新页面，如果发现评论不见了，是因为页面缓存，不用担心，可以点击Issue Page（♡ Like 右侧）检查。
