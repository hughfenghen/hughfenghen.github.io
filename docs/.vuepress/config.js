module.exports = {
  title: '风痕的博客',
  description: '...',
  theme: '@vuepress/theme-blog',
  plugins: [['@vuepress/blog'], ['@vuepress/google-analytics', { ga: 'UA-118782515-1' }]],
  // 启用了fenghen.xyz域名, coding.net 不需要发布到子目录
  base: process.env.VP_DEPLOY_ENV === 'gitee'
    ? '/hughfenghen.github.io/'
    : '/',
  themeConfig: {
    nav: [{
      text: '博客首页',
      link: '/',
      target: '_self',
      rel: '',
    }, {
      text: '经验随记',
      link: 'https://github.com/hughfenghen/hughfenghen.github.io/issues?q=-label%3AGitalk%2C%E5%BF%83%E6%83%85%2C%E8%AF%97%E8%AF%8D',
      target: '_self',
      rel: '',
    }, {
      text: '风痕的GitHub',
      link: 'https://github.com/hughfenghen',
      target: '_self',
      rel: '',
    }],
    sidebar: {
      '/': [{
        title: '前端基础课程',
        collapsable: false,
        children: [
          '/fe-basic-course/js-lang-history-and-basic',
          '/fe-basic-course/js-data-process/',
          '/fe-basic-course/ts-types-system',
          '/fe-basic-course/js-concurrent',
          '/fe-basic-course/https-brief/https-brief',
          '/fe-basic-course/options-request',
          '/fe-basic-course/timer-delay',
          '/fe-basic-course/js-regex-basic/',
          '/fe-basic-course/unit-test/',
        ]
      }, {
        title: '前端杂货',
        collapsable: false,
        children: [
          '/fe/vuepress-gitment',
          '/fe/canvas-lib/',
          '/fe/body-mask-danmaku/',
          '/fe/webgl-chromakey/',
          '/fe/js-perf-detect',
          '/fe/webcontainer/',
          '/fe/react-hooks/',
          '/fe/thinking-miniprogram',
          '/fe/modularization/',
          '/fe/vue-directive-track',
          '/fe/bug1-safari10',
          '/fe/sw-ssr/',
          '/fe/run-web-project-in-termux',
          '/fe/debug-hover-element/',
          '/fe/vscode-shortcut',
        ]
      }, {
        title: '其他',
        collapsable: false,
        children: [
          'other/diy-handheld-game/'
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
        title: '随想',
        collapsable: false,
        children: [
          '/think/dao',
          '/think/biosphere/',
          '/think/book-review',
          '/think/qin/',
        ]
      }],
    }
  }
}
