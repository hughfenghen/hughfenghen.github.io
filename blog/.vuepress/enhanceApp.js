export default ({
  Vue, // VuePress 正在使用的 Vue 构造函数
  options, // 附加到根实例的一些选项
  router, // 当前应用的路由实例
  siteData // 站点元数据
}) => {
  // 博客改版，高访问量页面 重定向
  router.beforeEach((to, from, next) => {
    let path = null

    if (to.path.includes('/fe/body-mask-danmaku')) {
      path = '/posts/2023/06/21/body-mask-danmaku/' 
    } else if (to.path.includes('/fe-basic-course/js-lang-history-and-basic')) {
      path = '/posts/2020/07/29/js-lang-history-and-basic/' 
    } else if (to.path.includes('/fe-basic-course/js-concurrent')) {
      path = '/posts/2023/03/27/js-concurrent/' 
    } else if (to.path.includes('/other/diy-handheld-game')) {
      path = '/posts/2023/06/21/diy-handheld-game/' 
    } else if (to.path.includes('/fe-basic-course/options-request')) {
      path = '/posts/2023/03/22/options-request/' 
    } else if (to.path.includes('/think/qin')) {
      path = '/posts/2020/10/07/qin/' 
    } else if (to.path.includes('/fe-basic-course/js-data-process')) {
      path = '/posts/2020/07/29/js-data-process/' 
    } else if (to.path.includes('/fe/js-perf-detect')) {
      path = '/posts/2023/04/03/js-perf-detect/' 
    } else if (to.path.includes('/fe-basic-course/ts-types-system')) {
      path = '/posts/2023/03/27/ts-types-system/' 
    } else if (to.path.includes('/think/dao')) {
      path = '/posts/2020/07/13/dao/' 
    } else if (to.path.includes('/think/biosphere')) {
      path = '/posts/2020/10/07/biosphere/' 
    } else if (to.path.includes('/fe/vscode-shortcut')) {
      path = '/posts/2023/03/29/vscode-shortcut/' 
    }

    if (path != null) { next({ path }) }
    else { next() } 
  })
}
