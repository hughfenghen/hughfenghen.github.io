const fs = require('fs')
const path = require('path')
const vpCfg = require('../.vuepress/config')
const { __, pipe, flatten, values, map, get, add, join } = require('lodash/fp')

const siteMap = pipe(
  get('themeConfig.sidebar'),
  values,
  flatten,
  map(get('children')),
  flatten,
  map(add('http://fenghen.xyz')),
  map(add(__, '.html')),
)(vpCfg)

console.log('--------siteMap-------------')
console.log(siteMap)
console.log('--------siteMap-------------')

fs.writeFileSync(path.resolve(__dirname, '../.vuepress/public/site-map.txt'), siteMap.join('\n'))
