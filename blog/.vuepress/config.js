module.exports = {
  title: '风痕 · 術&思',
  description: '...',
  theme: '@vuepress/blog',
  plugins: [['@vuepress/google-analytics', { ga: 'UA-118782515-1' }]],
  base: '/',
  themeConfig: {
    directories: [
      {
        id: "posts",
        dirname: "_posts",
        title: "Blog List",
        path: "/posts/",
        itemPermalink: "/posts/:year/:month/:day/:slug"
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
        link: "https://github.com/hughfenghen/hughfenghen.github.io/issues?q=-label%3AGitalk%2C%E5%BF%83%E6%83%85%2C%E8%AF%97%E8%AF%8D"
      },
      {
        text: "Github",
        link: "https://github.com/hughfenghen"
      }
    ],
    sitemap: {
      hostname: "https://hughfenghen.github.io/"
    },
  }
}
