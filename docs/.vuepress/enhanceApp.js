function integrateGitment(router) {
  const linkGitment = document.createElement('link')
  linkGitment.href = 'https://imsun.github.io/gitment/style/default.css'
  linkGitment.rel = 'stylesheet'
  const scriptGitment = document.createElement('script')
  document.body.appendChild(linkGitment)
  scriptGitment.src = 'https://imsun.github.io/gitment/dist/gitment.browser.js'
  document.body.appendChild(scriptGitment)

  router.afterEach((to) => {
    // 已被初始化则根据页面重新渲染 评论区
    if (scriptGitment.onload) {
      renderGitment(to.fullPath)
    } else {
      scriptGitment.onload = () => {
        const commentsContainer = document.createElement('div')
        commentsContainer.id = 'comments-container'
        commentsContainer.classList.add('content')
        const $page = document.querySelector('.page')
        if ($page) {
          $page.appendChild(commentsContainer)
          renderGitment(to.fullPath)
        }
      }
    }
  })

  function renderGitment(fullPath) {
    const gitment = new Gitment({
      id: location.pathname,
      owner: 'hughfenghen',
      repo: 'hughfenghen.github.io',
      link: location.origin + location.pathname,
      oauth: {
        client_id: 'e157002b5da973611b6c',
        client_secret: 'c8659321b3c44cf1cc4f429a067d99d681bdb9e1',
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

    addSiteMap(siteData, router)
  } catch (e) {
    console.error(e.message)
  }
}

function addSiteMap(siteData, router) {
  const links = siteData.pages.filter(({path}) => /\.html$/.test(path))
    .map(({path, title}) => ['a', { attrs: { href: path } }, title])
  router.addRoutes(
    [{
      path: '/site-map/',
      component: {
        render(h) {
          return h('div', null, links.map(link => h(...link)))
        }
      }
    }]);
}
