# BUG: Safari10 Cannot declare a let variable twice: 'e'.

上线后，吃饭、午休、会议，查看线上错误日志，吓一跳，300+个错误
`SyntaxError: Cannot declare a let variable twice: 'e'.`
于是拉上小伙伴（我刚接手C端业务）退出会议，着手定位问题。

## 解决方法
[bug详情](https://bugs.webkit.org/show_bug.cgi?id=171041)  
```js
// 修改webpack(version: 4.5) 配置文件
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const config = {
// ...
  minimizer: [
      new UglifyJSPlugin({
        cache: true,
        parallel: true,
        sourceMap: true,
        uglifyOptions: {
          safari10: true,
        },
      }),
    ],
// ...
}
```

-------------
答案在上面了，看官如果还有兴趣的话请继续。。。

由于日志中**没有错误的行列信息**，无法使用sourcemap定位到源码位置。
只能看到报错的文件路径：https://xxx/xxx/main.[hash].js。
还好，错误信息非常明确，不就是一个作用域内`let e`两次嘛，没sourcemap我也能找到源码位置😎。

## 第一回合
* 将有文件的线上main.[hash].js文件下载下来。
* 搜索关键字`let e=`。   嗯，只有10个结果，很好
* 查看 同一个函数作用域下出现两次`let e=`的位置
* 嗯，只有一处`getLocationCity{let e='xx',if(...){let e='yy'}} `， 哇抓到bug了，so easy~
* 在源码中找到`getLocationCity`的位置，代码命名没问题，**猜测uglifyJS压缩混淆代码时重命名出的问题**。
* 修改源码，本地编译，检查压缩混淆后`getLocationCity`下的变量命名没问题了。
* 提交代码，beta构建，product构建，准备发布。
* 不对，最近没改这块源码，有问题。。

## 第二回合
* 回头仔细分析日志
* 发现两条线索：  1、错误开始时间与最近一次发布时间吻合；2、所有错误的都是IOS10（userAgent）
* **猜测是最近一次发布导致的兼容性问题**
* 为对比新增的`let e=`，从Jenkins构建记录日志中找到上上次发布的main.[hash].js文件URL，下载、对比
* 发现新增的`let e=`位置，`h(e){for(let e='...'){...}} `并没有。（此时小伙伴用模拟器ios10重现了问题，错误会导致页面卡死，报错达500+次，心里开始慌了）
* 精简找到的h函数，在chrome console中执行无错误，**确认是ios10兼容问题，与uglifyJS无关**（此时回头看前面找到的`getLocationCity{let e='xx',if(...){let e='yy'}} `并无语法问题，因为`let`作用范围是块级作用域，因代码压缩了没仔细分析，**误以为是uglifyJS的bug**）
* 于是只好google `ios 10 SyntaxError: Cannot declare a let variable twice: 'e'.`
* ヾ(｡｀Д´｡)我擦，google结果第一条就是相关内容，于是顺藤摸瓜找到解决方法（不完美）
```js
minimizer: [
      new UglifyJSPlugin({
          uglifyOptions: {
            mangle: {
              safari10: true,
            },
          },
        },
      }),
    ],
```
* 此时解决方法有两个：1、小伙伴的临时方法：将for改成foreach；2、如上修改uglify配置
* 最终决定修改配置，原因：解决根本问题，uglifyJS改动可以验证（大部分生产问题修复都会遇到这样的场景，方法1的风险往往更低）
* 修改配置后，本地构建，对比检查for中的变量e被重命名成a了
* 提交代码、PR、打包构建、发布。
* 观察日志系统，错误数量停止增长。问题解决。继续会议。

## 第三回合
* 会议后，我们leader review PR，提醒“你这样改可能覆盖webpack 4.5 uglifyJS的默认配置，并且[uglifyJS插件官方文档](https://github.com/webpack-contrib/uglifyjs-webpack-plugin)中safari10与mangle是同级的”。
* 对比WebpackOptionsDefaulter文件，发现默认配置中还有sourcemap，cache相关。
* 检查构建文件，确认没有输出sourcemap文件。
* copy默认配置，添加`safari10: true`(如上文答案)
* 本地构建，检查sourcemap、变量命名，正常
* 结束，彻底解决。

## 思考
* 直接google搜索错误信息可以更快地找到解决方法。（这次未及时搜索是因为错误信息实在太清晰，一看就明白，但它是有误导性的）
* 仔细分析日志可以提前预知到是兼容性问题，方便重现问题，搜索也可以提高精准度
* 修改代码/配置应该仔细分析影响范围及验证，这次覆盖配置项是因为项目刚升级到webpack 4.5（leader升级的），我和小伙伴都还不熟悉新的配置。不过还是仔细验证了编译输出的文件，配置不完美但并没有实际损失。
