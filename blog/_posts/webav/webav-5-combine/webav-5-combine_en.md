---
tags:
  - WebAV_EN
  - Audio & Video
  - WebCodecs
  - Web
date: 2023-08-12
---

# Web Audio & Video (5) Compositing Videos in the Browser

> [**Web Audio & Video Series Table of Contents**](/tag/WebAV_EN)

After reading the previous chapters, readers should have a basic understanding of how to parse and create videos in the browser.
This chapter covers video compositing in the browser, which is a fundamental feature in video editing.

_You can skip the technical principles and jump directly to [WebAV Video Compositing Example](#webav-video-compositing-example)_

## Adding Assets to Video

Common assets include: videos, audio, images, and text

As discussed in [Creating Videos in the Browser](/posts/2023/07/31/webav-3-create-video/), video encoders only accept VideoFrame objects, while canvas can be used to construct VideoFrame.

The principle of overlaying assets on video follows this flow: `video + assets -> canvas -> VideoFrame -> VideoEncoder`

1. First draw the video to canvas, then draw other assets
2. Create VideoFrame objects from the canvas element
3. Use the encoder to encode VideoFrame
4. Process the next frame

_For audio, simply add the audio data (if any) from each asset together. See the previous chapter [Processing Audio in the Browser](/posts/2023/08/05/webav-4-process-audio/) for details_

Video consists of frames arranged on a timeline, with the original video treated as a regular asset.
Therefore, the problem can be simplified to: determining **which frame** of **which assets** to draw at a given **moment**, starting from time 0 and repeating these steps to create a new video.

### Implementation Steps Summary

1. Abstract assets into a `Clip` interface, with different implementations for different assets, such as `MP4Clip`, `ImgClip`
2. Create a `Combinator` object to control the timeline, sending time signals to each asset (Clip), starting from 0
   Time increases in steps determined by the target video's FPS, `step = 1000 / FPS` ms
3. Assets determine what data to provide based on the received time value: which frame of their image, audio segment (`Float32Array`)
4. `Combinator` collects and composites image (drawn to canvas) and audio (`Float32Array` addition) data from all assets
5. `Combinator` converts composited data to VideoFrame and AudioData for the encoder, which then encodes (compresses) and packages into the appropriate video container format
6. `Combinator` increases the time signal value and repeats steps 2-5

### Asset Abstraction Design (Clip)

Assets are divided into dynamic (video, audio, animated GIF) and static (images, text) types. Static assets are simpler as they're not affected by time. Let's use video assets as an example.

Simplified `Clip` interface implementation:

```ts
export interface IClip {
  /**
   * Data needed at the current moment
   * @param time Time in microseconds
   */
  tick: (time: number) => Promise<{
    video?: VideoFrame | ImageBitmap;
    audio?: Float32Array[];
    state: 'done' | 'success';
  }>;

  ready: Promise<{ width: number; height: number; duration: number }>;
}
```

[MP4Clip][2] actual source code is over 200 lines, but here's the basic principle:

1. Use mp4box.js for demuxing and WebCodecs for decoding to get VideoFrame and AudioData
2. Extract PCM data (Float32Array) from AudioData
3. MP4Clip internally manages image (VideoFrame) and audio data (Float32Array) arrays
4. When `Combinator` calls `MP4Clip.tick`, return the corresponding frame and audio segment based on the time parameter

[Other Clips provided by WebAV][1]

::: tip
[Text can be converted to images][8] reusing ImgClip
:::

### Combinator Design

First, a brief introduction to `OffscreenSprite`: it wraps `Clip` to record coordinates, dimensions, rotation, and other properties, controlling asset position on the `canvas` and enabling animations. We'll cover this in the next article.

Core logic of `Combinator`:

```js
class Combinator {
  add(sprite: OffscreenSprite) {
    // Manage sprite
  }

  output() {
    let time = 0;
    while (true) {
      let mixedAudio;
      for (const spr of this.sprites) {
        const { video, audio, state } = spr.tick(time);
        // Pseudo-code, actually adds Float32Array elements in a loop
        // See Audio Encoding and Muxing chapter for details
        mixedAudio += audio;
        ctx.draw(video);
      }
      // Pseudo-code, see previous chapters for VideoFrame AudioData construction
      // and passing to encoder
      new VideoFrame(canvas);
      new AudioData(mixedAudio);
      // Target output video at 30 FPS, multiply by 1000 for microseconds
      time += (1000 / 30) * 1000;
    }
  }
}
```

[Complete source code][3]

## Concatenating Videos

There are two ways to concatenate videos:

1. Re-encode concatenation: slower output but better compatibility  
   Uses the same principle as compositing above, with assets' end and start times aligned, re-drawing to canvas and encoding
2. Fast concatenation (without re-encoding): faster but potential compatibility issues  
   Works by extracting the video container, copying encoded data to a new container, only modifying time offsets

Here's the core code for fast concatenation:

```ts
// SampleTransform converts mp4 file stream to MP4Sample stream
// autoReadStream reads the stream and provides MP4Sample to callback
autoReadStream(stream.pipeThrough(new SampleTransform()), {
  onChunk: async ({ chunkType, data }) => {
    const { id: curId, type, samples } = data;
    const trackId = type === 'video' ? vTrackId : aTrackId;

    samples.forEach((s) => {
      outfile.addSample(trackId, s.data, {
        duration: s.duration,
        // offsetDTS offsetCTS is the end time of previous segment
        // Reusing data, only modifying time offset for speed
        dts: s.dts + offsetDTS,
        cts: s.cts + offsetCTS,
        is_sync: s.is_sync,
      });
    });
  },
});
```

[Complete source code][4]

## Web Audio & Video Video Compositing Example

_DEMO links in appendix, try them online immediately_

**Overlaying Image on Video**

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
// Returns new MP4 file stream
com.output();
```

**Fast MP4 Concatenation**

```ts
const resList = ['./public/video/webav1.mp4', './public/video/webav2.mp4'];
// New MP4 file stream
const stream = fastConcatMP4(
  await Promise.all(resList.map(async (url) => (await fetch(url)).body!))
);
```

## Appendix

- [WebAV][5] Audio & video processing SDK built on WebCodecs
- [WebAV Asset Compositing DEMO][6]
- [WebAV Fast Concatenation DEMO][7]
- [WebAV Combinator Source Code][3]
- [WebAV Fast MP4 Concatenation Source Code][4]

[1]: https://github.com/hughfenghen/WebAV/tree/49bed37798412d29a1ec51ef5f7d45cd7682b218/packages/av-cliper/src/clips
[2]: https://github.com/hughfenghen/WebAV/blob/49bed37798412d29a1ec51ef5f7d45cd7682b218/packages/av-cliper/src/clips/mp4-clip.ts#L13
[3]: https://github.com/hughfenghen/WebAV/blob/49bed37798412d29a1ec51ef5f7d45cd7682b218/packages/av-cliper/src/combinator.ts#L151
[4]: https://github.com/hughfenghen/WebAV/blob/49bed37798412d29a1ec51ef5f7d45cd7682b218/packages/av-cliper/src/mp4-utils.ts#L646
[5]: https://github.com/hughfenghen/WebAV
[6]: https://fenghen.me/WebAV/demo/2_1-concat-video
[7]: https://fenghen.me/WebAV/demo/2_5-video-compsite-and-concat
[8]: https://github.com/hughfenghen/WebAV/blob/49bed37798412d29a1ec51ef5f7d45cd7682b218/packages/av-cliper/src/dom-utils.ts#L36
