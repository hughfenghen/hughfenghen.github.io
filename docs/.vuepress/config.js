module.exports = {
  title: '风痕的博客',
  description: '...',
  themeConfig: {
    sidebar: {
      '/': [{
        title: '前端',
        collapsable: false,
        children: [
          '/fe/vue-directive-track',
          '/fe/cljs-node-hotreload',
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
        ]
      }],
    }
  }
}
