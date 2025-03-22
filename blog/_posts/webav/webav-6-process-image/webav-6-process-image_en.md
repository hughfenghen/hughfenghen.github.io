---
tags:
  - WebAV_EN
  - Audio & Video
  - WebCodecs
  - Web
date: 2023-08-19
---

# Web Audio & Video (6) Processing Image Assets

> [**Web Audio & Video Series Table of Contents**](/tag/WebAV_EN)

Previous chapters covered how to parse and create videos in the browser, as well as add custom assets (images, audio, text...).  
This chapter explores how to add effects and animations to image assets, implementing transitions, moving watermarks, image filters, and other enhancements.

_You can skip the technical principles and jump directly to [WebAV Examples](#webav-examples)_

## Asset Animation

Implementing animations in video production differs from other scenarios because video is a combination of image frames. Therefore, video animation requires calculating the **property values** (coordinates, size, angle, opacity...) for **each frame** of the asset.

Asset animations are commonly used to implement video watermarks, transitions, and other effects.

### Defining Animations

_We reference CSS animation syntax to reduce the learning curve_

For example, moving an asset 100px along the x-axis and back to origin over 3 seconds:

```js
{
  '0%': { x: 0, y: 0 },
  '50%': { x: 100, y: 0 },
  '100%': { x: 0, y: 0 }
}
duration = 3s
```

### Implementing Animations

Assuming we're outputting 30FPS video, here's an example calculating the x-value for the second frame:

```js
// Count starts from 0
const frameCount = 1;
// Time offset for second frame, VideoFrame timestamp in microseconds
const timestamp = (1 / 30) * 1e6 * frameCount;
// First phase duration, 1.5 * 1e6 us
const step0Duration = 3 * 1e6 * 0.5;
// Progress, linear
const progress = timestamp / step0Duration;
// X-value change in first phase
const step0DeltaX = 100 - 0;
// X-value for first frame
const newX = step0DeltaX * progress; // => 2.2222222222222223
```

By repeating this process (incrementing frameCount each time) and setting asset properties for each frame, we can see the animation effect in the output video.

## Image Processing

_"Image processing" is a vast and deep topic. While the author acknowledges lacking sufficient expertise to cover it comprehensively, video processing inevitably involves image processing knowledge, such as beauty filters, effects, etc. Therefore, we'll provide some general directions and insights._

In the Web, image processing starts with HTMLCanvasElement. Canvas provides several APIs for processing image effects:

- CanvasRenderingContext2D.globalAlpha  
  Opacity control; fade-in/fade-out is the simplest and most common "effect"
- CanvasRenderingContext2D.globalCompositeOperation  
  Controls how two images blend, creating [interesting effects][1] with well-designed assets
- WebGL, WebGPU (separate from canvas)  
  Enables advanced, complex effects like chroma keying (green screen), beauty filters, quality enhancement, etc.

_For chroma keying implementation, refer to this blog's [article][2]. WebAV's chroma key integration example is also shown below._

## Web Audio & Video Examples

**DEMO links provided in appendix**

### Watermark Animation

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
// Convert text to image for easier handling
const spr2 = new OffscreenSprite(
  'spr2',
  new ImgClip(
    await renderTxt2ImgBitmap(
      'Watermark',
      `font-size:40px; color: white; text-shadow: 2px 2px 6px red;`
    )
  )
);
// Set animation, automatically calculate coordinates for each frame during video composition
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

// 'main' indicates video composition ends when this asset ends
await com.add(spr1, { main: true });
await com.add(spr2, { offset: 0, duration: 5 });
// Output video stream
com.ouput();
```

### Chroma Key (Green Screen)

```ts
import { createChromakey, Combinator, MP4Clip, OffscreenSprite, createImageBitmap } from '@webav/av-cliper'

// Create chroma key utility function
const chromakey = createChromakey({
  similarity: 0.4,
  smoothness: 0.05,
  spill: 0.05,
})
// Test video with green screen background
const clip = new MP4Clip((await fetch('./public/video/chromakey-test.mp4')).body!)
// Each MP4 frame passes through tickInterceptor
clip.tickInterceptor = async (_, tickRet) => {
  if (tickRet.video == null) return tickRet
  return {
    ...tickRet,
    // Return after chroma key processing
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
// Output video stream
com.ouput()
```

## Appendix

- [WebAV][3] Audio & video processing SDK built on WebCodecs
- [WebGL Chromakey Real-time Green Screen][2]
- [Video Watermark DEMO][4], click button【mp4 + img】
- [Video Chroma Key DEMO][4], click button【mp4(chromaky)】

[1]: https://juejin.cn/post/6844903667435307021
[2]: https://fenghen.me/posts/2023/07/07/webgl-chromakey/
[3]: https://github.com/WebAV-Tech/WebAV
[4]: https://webav-tech.github.io/WebAV/demo/2_1-concat-video
