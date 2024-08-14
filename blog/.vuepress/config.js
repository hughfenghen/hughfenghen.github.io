
module.exports = {
  title: '风痕 · 術&思',
  description: '个人思考、Web技术',
  theme: '@vuepress/blog',
  head: [['script', {}, `
  (function(c,l,a,r,i,t,y){
      c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
      t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
      y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
  })(window, document, "clarity", "script", "kudfzh7lis");
  `]],
  plugins: [
    ['copy-code1', {
      showInMobile: true,
      selector: 'div[class*="language-"] pre',
      pure: true
    }],
    // ['@vuepress/google-analytics', { ga: 'UA-118782515-1' }],
    ['google-analytics-4', { gtag: 'G-MC335K4KV6' }],
    ['feed', {
      canonical_base: 'https://hughfenghen.github.io',
      count: 5000,
    }],
    ['container', {
      type: 'tip',
      defaultTitle: {
        '/': 'TIP',
        '/zh/': '提示'
      }
    }],
    ['container', {
      type: 'warning',
      defaultTitle: {
        '/': 'WARNING',
        '/zh/': '注意'
      }
    }],
    ['container', {
      type: 'danger',
      defaultTitle: {
        '/': 'DANGER',
        '/zh/': '警告'
      }
    }],
    ['container', {
      type: 'details',
      before: info => `<details class="custom-block details">${info ? `<summary>${info}</summary>` : ''}\n`,
      after: () => '</details>\n'
    }],
  ],
  base: '/',
  markdown: {
    lineNumbers: false
  },
  themeConfig: {
    globalPagination: {
      lengthPerPage: 10
    },
    directories: [
      {
        id: "posts",
        dirname: "_posts",
        title: "Blog List",
        path: "/posts/",
        itemPermalink: "/posts/:year/:month/:day/:slug",
        pagination: {
          lengthPerPage: 10,
        },
      },
    ],
    nav: [
      {
        text: "文章",
        link: "/posts/"
      },
      {
        text: "标签",
        link: "/tag/"
      },
      {
        text: "随记",
        link: "https://github.com/hughfenghen/hughfenghen.github.io/issues?q=-label%3AGitalk%2C%E5%BF%83%E6%83%85%2C%E8%AF%97%E8%AF%8D%2CVssue+is%3Aopen+"
      },
      {
        text: "Github",
        link: "https://github.com/hughfenghen"
      }, {
        text: "订阅/赞助",
        link: "/subscribe.html"
      }
    ],
    // feed: {
    //   canonical_base: 'https://hughfenghen.github.io/',
    // },
    comment: process.env.NODE_ENV === 'development' ? null : {
      service: "vssue",
      autoCreateIssue: true,
      prefix: "[Post]",
      owner: "hughfenghen",
      repo: "hughfenghen.github.io",
      clientId: "8a03da926cf95085e3cc",
      clientSecret: "1b9a0256e3ac0a88ff287df6582d06c7806d017a"
    },
    sitemap: {
      hostname: "https://hughfenghen.github.io/"
    },
  }
}
