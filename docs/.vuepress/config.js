module.exports = {
  title: '风痕的博客',
  description: '...',
  ga: 'UA-118782515-1',
  base: process.env.VP_DEPLOY_ENV === 'coding.net'
    ? '/hughfenghen.github.io/'
    : '/',
  themeConfig: {
    sidebar: {
      '/': [{
        title: '前端',
        collapsable: false,
        children: [
          '/fe/vue-directive-track',
          '/fe/cljs-node-hotreload',
          '/fe/bug1-safari10',
          '/fe/vuepress-gitment',
        ]
      }, {
        title: '笔记',
        collapsable: false,
        children: [
        ]
      }, {
        title: '随想',
        collapsable: false,
        children: [
          '/think/dao',
        ]
      }],
    }
  }
}
