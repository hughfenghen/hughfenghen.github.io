#!/usr/bin/env sh

# 确保脚本抛出遇到的错误
set -e

# 进入生成的文件夹
cd docs/.vuepress/dist
rm -rf .git think

# 如果是发布到自定义域名
# echo 'fenghen.xyz' > CNAME

git init
git config user.name hughfenghen
git config user.email hughfenghen@gmail.com
git add -A
git commit -m 'deploy'

# 如果发布到 https://<USERNAME>.github.io
git push -f git@gitee.com:hughfenghen/hughfenghen.github.io.git master

# 如果发布到 https://<USERNAME>.github.io/<REPO>
# git push -f git@github.com:<USERNAME>/<REPO>.git master:gh-pages

cd -
