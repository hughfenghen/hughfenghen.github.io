const fs = require('fs')
const path = require('path')
const vpCfg = require('../.vuepress/config')
const { tap, pipe, flatten, values, map, get, add } = require('lodash/fp')

const siteMap = pipe(
  get('themeConfig.sidebar'),
  values,
  flatten,
  map(get('children')),
  flatten,
  // 单独 md 没有 .html 结尾，vuepress 会有一次重定向，导致 Google 拒绝收录
  map(v => v.endsWith('/') ? v : v + '.html'),
  map(add('https://hughfenghen.github.io')),
)(vpCfg)

console.log('--------siteMap-------------')
console.log(siteMap)
console.log('--------siteMap-------------')

fs.writeFileSync(path.resolve(__dirname, '../.vuepress/public/site-map.txt'), siteMap.join('\n'))
