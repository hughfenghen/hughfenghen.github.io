module.exports = {
  title: '风痕的博客',
  description: '...',
  ga: 'UA-118782515-1',
  themeConfig: {
    sidebar: {
      '/': [{
        title: '前端',
        collapsable: false,
        children: [
          '/fe/vue-directive-track',
          '/fe/cljs-node-hotreload',
          '/fe/bug1-safari10',
        ]
      }, {
        title: '笔记',
        collapsable: false,
        children: [
          '/think/dao',
        ]
      }, {
        title: '随想',
        collapsable: false,
        children: [
        ]
      }],
    }
  }
}
