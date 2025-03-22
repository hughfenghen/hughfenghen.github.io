---
tags:
  - WebAV
  - 音视频
  - WebCodecs
  - Web
date: 2023-08-12
---

# Web 音视频（五）在浏览器中合成视频

> [**Web 音视频目录**](/tag/WebAV)

经过前序章节的介绍，读者能大致了解如何在播放器中解析、创建视频；  
本章介绍何在浏览器中合成视频，这是视频编辑中最基础的功能。

_你可以跳过原理介绍，直接查看 [WebAV 合成视频示例](#webav-合成视频示例)_

## 在视频上叠加素材

常见的素材有：视频、音频、图片、文字

[在浏览器中创建视频](/posts/2023/07/31/webav-3-create-video/)章节介绍了，视频编码器只接受 VideoFrame 对象，而 canvas 可以构造 VideoFrame；

在视频上叠加素材的实现原理：`视频 + 素材 -> canvas -> VideoFrame -> VideoEncoder`

1. 先绘制视频到 canvas，再绘制其他素材
2. 使用 canvas 元素构造 VideoFrame 对象
3. 使用编码器编码 VideoFrame
4. 处理下一帧

_音频则是将各个素材的音频数据（如果有）相加即可，详情可查看上一章[在浏览器中处理音频](/posts/2023/08/05/webav-4-process-audio/)_

视频是由一帧帧图像在时间轴上排列而成，原视频也视为一个普通素材；  
所以问题可以简化为：决定某一**时刻**分别需要绘制**哪些素材**的**第几帧**，时间轴从 0 开始，重复以上步骤就能得到一个新视频。

### 实现步骤总结

1. 将素材抽象为 `Clip` 接口，不同素材有不同实现，如 `MP4Clip`、`ImgClip`
2. 创建一个 `Combinator` 对象控制时间轴，向各个素材（Clip）发送时间信号，首次为 0
   时间不断增加，增加的步长取决于最终需要合成视频 FPS，`step = 1000 / FPS` ms
3. 素材由接收到的时间值，决定当前时刻需要提供的数据：自身的第几帧图像、音频片段（`Float32Array`）
4. `Combinator` 收集并合成各个素材的图像（绘制到 canvas）、音频（`Float32Array`相加）数据
5. `Combinator` 将合成的数据转换成 VideoFrame、AudioData 传递给编码器，编码（压缩）后封装到对应格式的视频容器格式
6. `Combinator` 增加时间信号的值，重复步骤 2~5

### 素材抽象设计（Clip）

素材分为动态（视频、音频、动图）与静态（图片、文字）两种，静态素材不受时间影响比较简单，接下来以视频素材举例。

`Clip` 接口简化实现

```ts
export interface IClip {
  /**
   * 当前瞬间，需要的数据
   * @param time 时间，单位 微秒
   */
  tick: (time: number) => Promise<{
    video?: VideoFrame | ImageBitmap;
    audio?: Float32Array[];
    state: 'done' | 'success';
  }>;

  ready: Promise<{ width: number; height: number; duration: number }>;
}
```

[MP4Clip][2] 实际源码有两百多行，限于篇幅，这里只介绍原理

1. 使用 mp4box.js 解封装、WebCodecs 解码视频，得到 VideoFrame、AudioData
2. 从 AudioData 提取 PCM 数据（Float32Array）
3. MP4Clip 内部使用数组管理图像（VideoFrame）与音频数据（Float32Array）
4. 当 `Combinator` 调用 `MP4Clip.tick` 时，根据事件参数找到对应的图像帧与音频切片并返回

[WebAV 提供的其他 Clip][1]

::: tip
[文字可转换成图片][8]复用 ImgClip
:::

### Combinator 设计

提前介绍一下 `OffscreenSprite`，将 `Clip` 使用 `OffscreenSprite` 包装起来，记录坐标、宽高、旋转等属性，用于控制素材在 `canvas` 的位置、实现动画等；在下一篇文章介绍，本章略过。

`Combinator` 的核心逻辑

```js
class Combinator {
  add(sprite: OffscreenSprite) {
    // 把 sprite 管理起来
  }

  output() {
    let time = 0;
    while (true) {
      let mixedAudio;
      for (const spr of this.sprites) {
        const { video, audio, state } = spr.tick(time);
        // 伪代码，实际是对 Float32Array 的元素循环相加，详情查看【编码封装音频数据】章节
        mixedAudio += audio;
        ctx.draw(video);
      }
      // 伪代码，具体构造 VideoFrame AudioData 方法查看前序章节
      // 将 VideoFrame AudioData 传给编码器，查看前序章节
      new VideoFrame(canvas);
      new AudioData(mixedAudio);
      // 输出的目标视频 30 FPS，因为单位是微秒，所以乘以 1000
      time += (1000 / 30) * 1000;
    }
  }
}
```

[完整源码][3]

## 拼接视频

前后拼接视频有两种方式

1. 重编码拼接，特征是输出视频速度慢、兼容性好  
   原理跟上一步合成视频是一样的，两个素材的结束、开始时间正好衔接，重新绘制 canvas 再编码
2. 快速拼接（非重编码），特征是速度快、可能出现兼容性问题  
   原理是拆开视频容器，复制其中的编码数据到新的容器中，仅修改其时间偏移

这里讲解快速拼接的核心代码

```ts
// SampleTransform 将 mp4 文件流转换为 MP4Sample 流
// 由 autoReadStream 读取流，给回调函数 MP4Sample
autoReadStream(stream.pipeThrough(new SampleTransform()), {
  onChunk: async ({ chunkType, data }) => {
    const { id: curId, type, samples } = data;
    const trackId = type === 'video' ? vTrackId : aTrackId;

    samples.forEach((s) => {
      outfile.addSample(trackId, s.data, {
        duration: s.duration,
        // offsetDTS offsetCTS 是上一个片段的结束时间
        // 此处复用 data，仅修改时间偏移 所以速度很快
        dts: s.dts + offsetDTS,
        cts: s.cts + offsetCTS,
        is_sync: s.is_sync,
      });
    });
  },
});
```

[完整源码][4]

## WebAV 合成视频示例

_DEMO 链接在附录，可在线立即体验_

**在视频上叠加图片**

```ts
const resList = ['./public/video/webav1.mp4', './public/img/bunny.png'];

const spr1 = new OffscreenSprite(
  'spr1',
  new MP4Clip((await fetch(resList[0])).body!)
);
const spr2 = new OffscreenSprite(
  'spr2',
  new ImgClip(await createImageBitmap(await(await fetch(resList[1])).blob()))
);
const com = new Combinator({
  width: 1280,
  height: 720,
  bgColor: 'white',
});

await com.add(spr1, { main: true });
await com.add(spr2);
// 返回新的 MP4 文件流
com.output();
```

**快速合并 MP4 文件**

```ts
const resList = ['./public/video/webav1.mp4', './public/video/webav2.mp4'];
// 新的 MP4 文件流
const stream = fastConcatMP4(
  await Promise.all(resList.map(async (url) => (await fetch(url)).body!))
);
```

## 附录

- [WebAV][5] 基于 WebCodecs 构建的音视频处理 SDK
- [WebAV 合成素材 DEMO][6]
- [WebAV 快速拼接 DEMO][7]
- [WebAV Combinator 源码][3]
- [WebAV 快速拼接 MP4 源码][4]

[1]: https://github.com/hughfenghen/WebAV/tree/49bed37798412d29a1ec51ef5f7d45cd7682b218/packages/av-cliper/src/clips
[2]: https://github.com/hughfenghen/WebAV/blob/49bed37798412d29a1ec51ef5f7d45cd7682b218/packages/av-cliper/src/clips/mp4-clip.ts#L13
[3]: https://github.com/hughfenghen/WebAV/blob/49bed37798412d29a1ec51ef5f7d45cd7682b218/packages/av-cliper/src/combinator.ts#L151
[4]: https://github.com/hughfenghen/WebAV/blob/49bed37798412d29a1ec51ef5f7d45cd7682b218/packages/av-cliper/src/mp4-utils.ts#L646
[5]: https://github.com/hughfenghen/WebAV
[6]: https://fenghen.me/WebAV/demo/2_1-concat-video
[7]: https://fenghen.me/WebAV/demo/2_5-video-compsite-and-concat
[8]: https://github.com/hughfenghen/WebAV/blob/49bed37798412d29a1ec51ef5f7d45cd7682b218/packages/av-cliper/src/dom-utils.ts#L36
