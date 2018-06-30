# 随意笔记，累积后有需要再汇总

## Safari placeholder 不垂直居中的问题
```css
input::placeholder {
  /* 调整 x 的值 */
  padding: xpx 0;
}
```

## 激活input时，修改 手机键盘 【确认】按钮文案为【搜索】
```html
<!-- 避免点击【搜索】后页面刷新，target设置为一个不显示的iframe -->
<form submit="" target="noop">
  <input type="search" >
  <iframe name='noop' style="display: none;"></iframe>
</form>
```

## iphone X 媒体查询

```css
@media only screen and (device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) {}
```

## 页面三行（header、main、footer）布局
flex overflow：auto
fixed

## 非定位元素z-index无效
https://www.w3cplus.com/css/what-no-one-told-you-about-z-index.html

## Linux下批量Kill多个进程的方法
`ps -ef | grep LOCAL=NO | grep -v grep | cut -c 9-15 | xargs kill -9`  
`ps -ef | grep Symantec | grep -v grep | cut -c 6-11 | xargs sudo kill -9`

## ios10 flex布局 高度设置100%时 实际为0
https://bugs.webkit.org/show_bug.cgi?id=137730
