module.exports = {
  title: '风痕的博客',
  description: '...',
  ga: 'UA-118782515-1',
  // 启用了fenghen.xyz域名, coding.net 不需要发布到子目录
  // base: process.env.VP_DEPLOY_ENV === 'coding.net'
  //   ? '/hughfenghen.github.io/'
  //   : '/',
  themeConfig: {
    sidebar: {
      '/': [{
        title: '前端',
        collapsable: false,
        children: [
          '/fe/vue-directive-track',
          '/fe/bug1-safari10',
          '/fe/vuepress-gitment',
          '/fe/thinking-miniprogram',
        ]
      }, {
        title: 'clojure',
        collapsable: false,
        children: [
          '/clojure/cljs-node-hotreload',
          '/clojure/cljs-transient-performance',
          '/clojure/shadow-cljs-proto-repl',
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
