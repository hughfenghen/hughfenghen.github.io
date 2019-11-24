module.exports = {
  title: '风痕的博客',
  description: '...',
  plugins: [['@vuepress/google-analytics', { ga: 'UA-118782515-1' }]],
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
          '/fe/lodash-fp',
          '/fe/react-hooks/react-hooks',
          '/fe/modularization/modularization',
          '/fe/vue-directive-track',
          '/fe/bug1-safari10',
          '/fe/vuepress-gitment',
          '/fe/thinking-miniprogram',
          '/fe/sw-ssr/sw-ssr',
          '/fe/run-web-project-in-termux',
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
          '/think/qin/qin',
          '/think/interview',
        ]
      }],
    }
  }
}
