---
tags:
  - WebAV
  - 音视频
  - WebCodecs
  - Web
date: 2023-08-19
---

# Web 音视频（六）图像素材处理

> [**Web 音视频目录**](/tag/WebAV)

前序章节介绍了如何在浏览器中解析、创建视频，以及给视频添加一些自定义素材（图片、音频、文字...）；  
本章介绍如何给图像素材加特效、加动画，实现转场、移动水印、图像滤镜美化等功能。

_你可以跳过原理介绍，直接查看 [WebAV 示例](#webav-示例)_

## 素材动画

在视频制作中实现动画跟其他场景略有不同，因为视频是一系列图像帧的组合，因此视频动画就需要计算出**每一帧**素材的**属性值**（坐标、大小、角度、不透明度...）。

素材动画动画经常用来实现视频水印、转场等功能。

### 定义动画

_我们参考 css animation 的使用方式，降低理解成本_

素材沿 x 轴平移 100px 然后返回原点，动画持续 3s

```js
{
  '0%': { x: 0, y: 0 },
  '50%': { x: 100, y: 0 },
  '100%': { x: 0, y: 0 }
}
duration = 3s
```

### 实现动画

假设输出的视频是 30FPS，写个示例来计算出素材在第二帧的 x 属性值。

```js
// 从 0 开始计数
const frameCount = 1;
// 第二帧的时间偏移，VideoFrame timestamp 单位是微秒
const timestamp = (1 / 30) * 1e6 * frameCount;
// 第一阶段持续时长，1.5 * 1e6 us
const step0Duration = 3 * 1e6 * 0.5;
// 进度，线性
const progress = timestamp / step0Duration;
// 第一阶段 x 属性的变化差值
const step0DeltaX = 100 - 0;
// 第一帧 x 属性值
const newX = step0DeltaX * progress; // => 2.2222222222222223
```

循环以上过程（每次 frameCount 加 1），计算并设置每一帧中素材的属性值，在输出的视频中就能看到素材的动画效果。

## 图像处理

_“图像处理”话题又大又深，作者自知没足够的专业知识讲好，但音视频处理又不可避免会涉及到图像处理的知识，比如美颜、滤镜、特效等等；所以这里只能给读者提供一些方向和思路。_

在 Web 中图像处理都是从 HTMLCanvasElement 开始的，canvas 提供了一些 API 可以加工处理图像效果

- CanvasRenderingContext2D.globalAlpha  
  不透明度，渐隐渐现是最简单常见的“特效”
- CanvasRenderingContext2D.globalCompositeOperation  
  控制两个图像的合成模式，使用设计好的素材可以做出比较[有意思的效果][1]
- WebGL、WebGPU（独立 canvas 之外）  
  可以实现高级、复杂的特效，如 绿幕抠图、美颜滤镜、画质增强 等等

_关于绿幕抠图的实现，可参考本博客的另一篇[文章][2]，下文也有 WebAV 集成绿幕抠图的示例。_

## WebAV 示例

**文末附有 DEMO 体验链接**

### 水印动画

```ts
import {
  Combinator,
  MP4Clip,
  OffscreenSprite,
  ImgClip,
  renderTxt2ImgBitmap,
} from '@webav/av-cliper';
const spr1 = new OffscreenSprite(
  'spr1',
  new MP4Clip((await fetch(resList[0])).body!)
);
// 文字转换成图片，更易处理
const spr2 = new OffscreenSprite(
  'spr2',
  new ImgClip(
    await renderTxt2ImgBitmap(
      '水印',
      `font-size:40px; color: white; text-shadow: 2px 2px 6px red;`
    )
  )
);
// 设置动画，在合成视频的时候，自动计算每帧该素材的坐标，实现水印移动动画
spr2.setAnimation(
  {
    '0%': { x: 0, y: 0 },
    '25%': { x: 1200, y: 680 },
    '50%': { x: 1200, y: 0 },
    '75%': { x: 0, y: 680 },
    '100%': { x: 0, y: 0 },
  },
  { duration: 4, iterCount: 1 }
);
spr2.zIndex = 10;
spr2.opacity = 0.5;

// main 表示当前资源结束时，结束视频合成
await com.add(spr1, { main: true });
await com.add(spr2, { offset: 0, duration: 5 });
// 输出视频流
com.ouput();
```

### 绿幕抠图

```ts
import { createChromakey, Combinator, MP4Clip, OffscreenSprite, createImageBitmap } from '@webav/av-cliper'

// 创建抠图工具函数
const chromakey = createChromakey({
  similarity: 0.4,
  smoothness: 0.05,
  spill: 0.05,
})
// 背景绿幕的测试视频
const clip = new MP4Clip((await fetch('./public/video/chromakey-test.mp4')).body!)
// MP4 的每一帧 都会经过 tickInterceptor
clip.tickInterceptor = async (_, tickRet) => {
  if (tickRet.video == null) return tickRet
  return {
    ...tickRet,
    // 抠图之后再返回
    video: await chromakey(tickRet.video)
  }
}

const spr1 = new OffscreenSprite('spr1', clip)
await spr1.ready

const com = new Combinator({
  1280,
  720,
  bgColor: 'white'
})

await com.add(spr1, { main: true })
await com.add(spr2)
// 输出视频流
com.ouput()
```

## 附录

- [WebAV][3] 基于 WebCodecs 构建的音视频处理 SDK
- [WebGL Chromakey 实时绿幕抠图][2]
- [视频添加水印 DEMO][4]，点击按钮【mp4 + img】
- [视频绿幕抠图 DEMO][4]，点击按钮【mp4(chromaky)】
  demo 地址

[1]: https://juejin.cn/post/6844903667435307021
[2]: https://hughfenghen.github.io/posts/2023/07/07/webgl-chromakey/
[3]: https://github.com/hughfenghen/WebAV
[4]: https://hughfenghen.github.io/WebAV/demo/2_1-concat-video
