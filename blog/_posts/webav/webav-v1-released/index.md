---
tags:
  - WebAV
  - 音视频
  - WebCodecs
date: 2024-10-31
---

# WebAV SDK（Web 视频编辑）V1 发布

## 前言

[WebAV][1] 是基于 WebCodecs 构建的 SDK，用于在 Web 平台上创建/编辑视频文件。

V1 对项目来说是里程碑版本，意味着 API 已经稳定，且功能的稳定性也经过了长时间的考验，可用于生产环境。

我在 20 年加入 B 站，开始接触 Web 音视频相关的知识（Web 播放器）， WebCodecs API 在 21 年发布；  
我预期 WebCodecs 开放的编解码能力会给 Web 平台在视频生产端（播放器是消费端）带来一些改变，但直到 23 年初仍没有看到成熟的开源项目，于是 WebAV 项目启动。

WebAV 最开始是因个人兴趣而启动，能走到现在离不开 B 站和社区的支持与贡献。

## WebAV SDK 能做什么

建议通过官方 [DEMO][2] 在线体验 SDK 的能力，包含视频截帧、切片、水印、字幕、合成等基础能力。

Web 平台的视频消费已经非常成熟了，Web 技术构建的视频生产工具则非常匮乏，最典型的就是视频剪辑场景；  
虽然现在的 Web 技术足以构建通用的视频剪辑产品，但 PC 端的视频剪辑软件已经非常专业、成熟，在该领竞争会相对困难。

Web 平台最大的优势在于用户视角的**便捷性**，所以可考虑使用 WebAV 构建以下领域的产品功能

- AI 技术如日中天，会给许多领域的生产力带来质的提升  
  AI 跟 Web 平台结合紧密，所以 WebAV 可以参与 AI 在视频领域的革新，如数字人或对 AI 生成的视频片段进行处理
- 批量视频处理；除了专业、精细的视频剪辑场景，现实中还有许多**简单、粗犷、生产效率最优先的视频简单诉求**  
  如批量生成营销视频、视频相册、视频模板等场景
- 视频处理小工具；现在有许多功能单一的在线视频处理小工具，如加水印、截取片段、消音、封面截帧等  
  使用 WebAV 可以节省服务器成本，而不失去其便捷性，甚至还能提升用户体验

以上是个人在推广 WebAV 过程中了解到用户的使用场景，更多的场景可以结合 Web 在**便捷性、跨平台、迭代效率**方面的明显优势去挖掘。

## V1 的重要内容

### 功能稳定

从项目启动到 V1 发布，WebAV 已经经历了长时间面向真实用户的生产环境验证，现在发布 V1 表示对外 API 也进入稳定状态。

### 大幅简化 API

目的是降低 V1 之后出现破坏性变更的几率，也能让 [API 文档][3]更简洁，降低学习成本；
目前官方站点中的所有 DEMO 都是基于十几个公开 API 实现的，因此安装依赖后，复制 DEMO 源码到你的项目几乎就能运行。

被回收的 API 基本是在 `@webav/*` 包内部使用，预计不会对开发者造成太大影响。

详情请看 [迁移至 v1 版本][7]

### 性能优化

WebCodecs 能利用硬件加速进行编解码，WebAV 经过一系列性能优化之后性能表现有明显进步；  
跟 Native 方案在部分设备上还有一些差距，虽然还有优化空间，但个人感觉性能不再是方案选择的主要考量因素了。

详情请看 [WebCodecs 性能表现及优化思路][4]

## 接下来做什么

- 优化单测
  - 提高覆盖率
  - 使用 Mock 接口或极小的视频数据代替视频文件，提升单测性能
- 优化工作流
  - Commit 时自动格式化代码，统一风格，方便更多的贡献者参与
  - Push 前自动运行单测，提升项目质量
- 文档/文章
  - 撰写更多的入门文章，介绍 WebAV 实现原理，帮助前端开发者入门
  - 提供英文版 API 文档
  - 提供 Issue 模板，改进 Issue 质量
- 支持更多视频格式（mkv、webm）

期望更多的贡献者参与进来，鼓励大家反馈问题（_记得提供必要信息_），发起 PR 修复小 Bug、实现小功能；

对前端开发者来说，参与门槛真的不高，大概看一下[本系列的入门文章][5]、[贡献指南][6]，再加上一点点阅读源码的耐心就行。

## 最后

感谢已参与到 WebAV 的勇士 <a href="https://github.com/WebAV-Tech/WebAV/graphs/contributors"><img src="https://img.shields.io/github/contributors/WebAV-Tech/WebAV
"/></a>，及请我喝奶茶的小伙伴。

也欢迎大家将 WebAV 项目分享给关注、从事 Web 音视频领域的小伙伴，给项目提供向前的动力  
**曝光（用户）量 x 贡献者 = 驱动力**

## 附录

- [WebAV github][1]
- [WebAV DEMO][2]
- [WebAV API][3]
- [WebAV 系列文章][5]
- [WebCodecs 性能表现及优化思路][4]
- [贡献指南][6]
- [迁移至 v1 版本][7]

[1]: https://github.com/WebAV-Tech/WebAV
[2]: https://webav-tech.github.io/WebAV/demo
[3]: https://webav-tech.github.io/WebAV/api
[4]: https://hughfenghen.github.io/posts/2024/07/27/webcodecs-performance-benchmark/
[5]: https://hughfenghen.github.io/tag/WebAV/
[6]: http://localhost:8000/guide/contribution
[7]: http://localhost:8000/guide/migrate-to-v1
