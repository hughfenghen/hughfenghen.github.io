// .vuepress/plugins/vuepress-filter-posts.js
module.exports = (options = {}, ctx) => {
  console.log(555555, options);

  return {
    name: 'vuepress-filter-posts',

    // 扩展页面数据
    extendPageData() {
      const idx = ctx.pages.findIndex((p) => {
        if (p.relativePath && p.id in options) {
          // 返回 false 表示要丢弃的的页面
          console.log(
            44444,
            p.id,
            p.relativePath,
            !options[p.id](p.relativePath)
          );
          return !options[p.id](p.relativePath);
        }
        return false;
      });

      if (idx > -1) {
        ctx.pages.splice(idx, 1);
      }
    },
  };
};
