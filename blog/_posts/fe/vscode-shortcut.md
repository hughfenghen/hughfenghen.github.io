---
tags:
  - 工具
date: 2023-03-29
---

# 个人 VSCode 高频快捷键总结

## vscode 默认快捷键

|按键|描述|提示|
|---|---|---|
|cmd+shift+p|命令搜索|**一切命令、指令的入口**，不常用或没有快捷键的指令，可以搜索名称然后触发，尝试搜索 `open` |
|**tab控制**|
|cmd+n|新建tab页|常用于记录临时信息|
|cmd+w|关闭tab页|关闭临时tab会有是否保存确认，Mac下cmd+d不保存（**d**iscard）|
|cmd+p|搜索、打开文件|免去鼠标寻找、点击|
|ctrl+tab|快速切换tab页|免去鼠标寻找、点击|
|**代码编辑**|
|cmd+d|选中单词|选中单词后再按下cmd+d可以批量选择、编辑|
|cmd+[, cmd+]|往前,后缩进||
||*安利vim插件*|*代码编辑基本使用vim方案，查看下文*|
|**代码查找**|
|cmd+f|当前页面查找关键字||
|cmd+shift+f|全局查找关键字|全局搜索结果一般比较多，可以考虑自定义快捷键切换上下结果|
|cmd+shift+o|当前文件搜索关键符号|能快捷找到函数、class、变量名等|
|cmd+t|全局搜索关键符号|能快捷找到函数、class、变量名等|
|ctrl+ -|光标位置回退||
|ctrl+shift+ -|光标位置前进||
|**Panel控制**|
|cmd+b|开关文件列表侧栏（side bar）||
|cmd+shift+\||在文件列表侧栏定位当前文件|自定义快捷键，看下文|

## 命令示例
先 cmd+shift+p 打开命令输入框  
**所有命令都支持模糊匹配**输入关键字符（如首字母）更快捷
```
rename symbol; 重命名变量名
reload window; 重新加载vscode当前窗口
open recent; 切换到最近打开过的项目
markdown: open preview to the side; 
```

## 自定义快捷键示例
cmd+shift+p，输入`open user setting（json）`添加以下配置  
```json5
[{
  "key": "shift+alt+n",
  // 全局搜索，定位到下一个结果
  "command": "search.action.focusNextSearchResult",
  "when": "hasSearchResult"
}, {
  "key": "shift+cmd+\\",
  "command": "workbench.files.action.showActiveFileInExplorer"
}]
```

## Vim 插件常用快捷键 
*略过常用单按键控制，如上下左右（hjkl）*

|按键|描述|提示|
|---|---|---|
|**代码编辑**|
|yy|复制行|重复按键，即是操作当前行|
|yw|复制单词||
|dd|删除行||
|dw|删除单词|第二个键表示操作范围，w：单词|
|da{|删除最近一层{}的内容，包含括号|**a**round是通用控制符|
|di[|删除最近一层{}的内容，不包含括号|**i**nside是通用控制符|
|cc|删除行，并进入编辑状态||
|cw|删除单词，并进入编辑状态||
|cat|删除html标签，进入编辑状态|**t**ag对应标签，通用|
|ci\`|删除``号的内容，进入编辑状态||
|ya'|复制光标所在的字符串，包含'||
|yit|复制html标签内容，不包含标签本身||
|cs'"|将光标所在的'替换成"|后两位('")可以是其他标记符号'"`{[<|
|cs\[{|将最近一层\[]替换成{}||
|**光标移动**|
|gd|跳转变量定义||
|sx|高亮显示可视区域内所有x字符的位置|x可以是任意字符，看下文EasyMotion配置|
|zz|光标滚动到屏幕中间||
|gg|光标移动到文件顶部||
|ctrl+o, ctrl+i|光标后退，前进||
|*|定位到光标所在单词，下一次出现位置||
|n|查找下一个||
|N|查找上一个||
|%|在最近一层括号开始闭合位置跳转|括号：()[]{}|

**EasyMotion配置**  
*[EasyMotion](https://github.com/easymotion/vim-easymotion) 目的是将光标快捷移动到可视区域内的任何位置*  
使用非常高频，但默认情况下，需要按两次 `\` + `s` + `目标字符`，  
所以做以下配置后，只需要按 `s` + `目标字符`  

1. Vim 插件中勾选开启 EasyMotion 
2. open user setting（json）配置快捷键 s 替换 \\\s 配置
```json5
"vim.normalModeKeyBindingsNonRecursive": [{
  "before": [ "s" ],
  "after": [ "<leader>", "<leader>", "s" ]
}],
"vim.visualModeKeyBindingsNonRecursive": [{
  "before": [ "s" ],
  "after": [ "<leader>", "<leader>", "s" ]
}]
```