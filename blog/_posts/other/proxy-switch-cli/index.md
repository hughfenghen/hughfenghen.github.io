---
tags:
  - 效率
  - 工具
date: 2025-01-22
---

# 在终端（Terminal）中快捷使用代理的方法

## 背景

每次在终端中 打开/关闭 代理都要经历以下几个步骤

1. 在代理软件（如 Clash）中**复制终端代理命令**
2. 粘贴到 终端 中，然后执行
3. 执行需要访问外网的命令（如安装依赖、下载外网镜像）
4. 关闭当前终端，让代理配置失效

假设你的代理工具启用的端口是`2233`，那么从代理工具复制的终端代理命令应该是

```sh
export https_proxy=http://127.0.0.1:2233 http_proxy=http://127.0.0.1:2233 all_proxy=socks5://127.0.0.1:2233
```

以下两个方法可以帮助你在终端中快捷使用代理。

## 高频命令配置别名

```sh
# gitp push; 走代理 push 代码到 github
alias gitp='git -c "http.proxy=socks://127.0.0.1:2233"'

# brewp install xxx; Mac 走代理加速安装
alias brewp='http_proxy=socks5://127.0.0.1:2233 https_proxy=socks5://127.0.0.1:2233 brew'
```

## 命令行快捷开启/关闭代理

创建一个 prx 函数，使用方法

```sh
# 开启
prx on
# 关闭
prx off
```

粘贴以下 prx 函数的实现代码到你的 `~/.zshrc` 或 `~/.bashrc` 中，重新打开终端即可

```sh
# 代理开关函数
function prx() {
  # 你的代理配置
  local PROXY_HTTP="http://127.0.0.1:2233"
  local PROXY_SOCKS="socks5://127.0.0.1:2233"

  case "$1" in
    on)
      export https_proxy=$PROXY_HTTP
      export http_proxy=$PROXY_HTTP
      export all_proxy=$PROXY_SOCKS
      echo "代理已开启: $PROXY_HTTP (HTTP), $PROXY_SOCKS (SOCKS5)"
      ;;
    off)
      unset https_proxy
      unset http_proxy
      unset all_proxy
      echo "代理已关闭"
      ;;
    *)
      echo "用法: prx {on|off}"
      ;;
  esac
}
```
