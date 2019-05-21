# VuePress 集成第三方评论模块

[VuePress](https://vuepress.vuejs.org/) 是一个 Vue 驱动的静态网站生成器，用来写文档的体验很好，本站就是基于VuePress的。

VuePress官方正在开发针对博客的优化功能[Blog Support roadmap](https://github.com/vuejs/vuepress/issues/36)，已经有人在喊建议集成disqus（ps：disqus已经被墙）了，有兴趣的同学可以去投个票。  

在官方之前，大家也可以参考本文为自己的博客/文档添加评论模块。

本文采用**Gitmen**作为示例，效果看文章底部。如果想集成其它第三方模块，本文代码也有一定参考性。
**注意：Gitmen要求用户登录github才能评论**

## 注册 OAuth application
参考[Gitmen官方文档](https://github.com/imsun/gitment)（[中文文档](https://imsun.net/posts/gitment-introduction/)），先[Register a new OAuth application](https://github.com/settings/applications/new)。  

> ...其他内容可以随意填写，但要确保填入正确的 callback URL（一般是评论页面对应的域名，如 https://imsun.net）。  
你会得到一个 client ID 和一个 client secret，这个将被用于之后的用户登录。

## 创建或准备一个github仓库存储评论
Gitmen将评论都存储在仓库issue中，同时要求用户登录github才能评论，所以需要先准备一个仓库。
本博客托管在Github Pages上，所以直接使用[hughfenghen.github.io仓库](https://github.com/hughfenghen/hughfenghen.github.io)来存储评论了。

## 创建一个`enhanceApp.js`文件
在`./vuepress`目录下创建`enhanceApp.js`文件，
copy以下代码到文件中，填写代码中的`xxx`部分。
*如果已存在`enhanceApp`文件，则copy `try...catch`代码块和`integrateGitment`函数*

```js
function integrateGitment(router) {
  const linkGitment = document.createElement('link')
  linkGitment.href = 'https://imsun.github.io/gitment/style/default.css'
  linkGitment.rel = 'stylesheet'
  const scriptGitment = document.createElement('script')
  document.body.appendChild(linkGitment)
  scriptGitment.src = 'https://imsun.github.io/gitment/dist/gitment.browser.js'
  document.body.appendChild(scriptGitment)

  router.afterEach((to) => {
    // 页面滚动，hash值变化，也会触发afterEach钩子，避免重新渲染
    if (to.path === from.path) return
    // 已被初始化则根据页面重新渲染 评论区
    if (scriptGitment.onload) {
      renderGitment()
    } else {
      scriptGitment.onload = () => {
        const commentsContainer = document.createElement('div')
        commentsContainer.id = 'comments-container'
        commentsContainer.classList.add('content')
        const $page = document.querySelector('.page')
        if ($page) {
          $page.appendChild(commentsContainer)
          renderGitment()
        }
      }
    }
  })

  function renderGitment() {
    const gitment = new Gitment({
      // ！！！ID最好不要使用默认值（location.href），因为href会携带hash，可能导致一个页面对应像个评论issue！！！
      // https://github.com/imsun/gitment/issues/55
      id: location.pathname,
      owner: 'xxx', // 必须是你自己的github账号
      repo: 'xxx', // 上一个准备的github仓库
      link: location.origin + location.pathname,
      oauth: {
        client_id: 'xxx', // 第一步注册 OAuth application 后获取到的 Client ID
        client_secret: 'xxx', // 第一步注册 OAuth application 后获取到的 Clien Secret
      },
    })
    gitment.render('comments-container')
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
    document && integrateGitment(router)
  } catch (e) {
    console.error(e.message)
  }
}
```

[enhanceApp 参考文档](https://vuepress.vuejs.org/zh/guide/basic-config.html#%E4%B8%BB%E9%A2%98%E9%85%8D%E7%BD%AE)

## VuePress deploy
部署项目，如果还未部署[参考文档](https://vuepress.vuejs.org/zh/guide/deploy.html#github-pages)

## 初始化页面评论区
部署之后，每一个页面的评论区需要管理员（new Giement 时填写的owner）进行初始化。  

## 需要注意的事项
* VuePress构建的时候，在node中执行代码生成各个页面的时候，**此时document为undefined，所以写在try...catch块中**，构建时必然会执行到catch块代码。目前没找到环境检测方法。
* `document.querySelector('.page')`，page、content是VuePress现在默认的class，后续升级可能会报错，届时需要同步改一下。
* 如果需要对本文提供的代码进行改造，`renderGitment`在每次路由切换后都必须执行，Gitment的ID是页面的fullPath，如果未执行会导致页面间评论混乱。
* 评论之后刷新页面，如果发现评论不见了，是因为页面缓存，不用担心，可以点击Issue Page（♡ Like 右侧）检查。
