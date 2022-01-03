module.exports = {
  title: '风痕的博客',
  description: '...',
  plugins: [['@vuepress/google-analytics', { ga: 'UA-118782515-1' }]],
  // 启用了fenghen.xyz域名, coding.net 不需要发布到子目录
  // base: process.env.VP_DEPLOY_ENV === 'coding.net'
  //   ? '/hughfenghen.github.io/'
  //   : '/',
  themeConfig: {
    nav: [{
      text: 'GitHub',
      link: 'https://github.com/hughfenghen',
      target: '_self',
      rel: '',
    }],
    sidebar: {
      '/': [{
        title: '前端',
        collapsable: false,
        children: [
          '/fe/react-hooks/',
          '/fe/modularization/',
          '/fe/vue-directive-track',
          '/fe/bug1-safari10',
          '/fe/vuepress-gitment',
          '/fe/thinking-miniprogram',
          '/fe/sw-ssr/',
          '/fe/run-web-project-in-termux',
          '/fe/debug-hover-element/',
        ]
      }, {
        title: '前端基础课程',
        collapsable: false,
        children: [
          '/fe-basic-course/js-lang-history-and-basic',
          '/fe-basic-course/js-data-process/',
          '/fe-basic-course/ts-types-system',
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
        title: '其他',
        collapsable: false,
        children: [
          '/other/https-brief/https-brief',
          '/other/options-request/'
        ]
      }, {
        title: '随想',
        collapsable: false,
        children: [
          '/think/dao',
          '/think/qin/',
          '/think/biosphere/',
          '/think/interview',
        ]
      }],
    }
  }
}
