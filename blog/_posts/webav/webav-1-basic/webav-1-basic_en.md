---
tags:
  - WebAV_EN
  - Audio & Video
  - WebCodecs
date: 2023-07-19
---

# Web Audio & Video (1) Fundamentals

> [**Web Audio & Video Series Table of Contents**](/tag/WebAV_EN)

Before diving into the subsequent articles or starting to use WebAV for audio and video processing, it's essential to understand some background knowledge.

This article provides a brief introduction to the fundamental concepts of audio and video, as well as the core APIs of WebCodecs.

## Video Structure

A video file can be thought of as a container that holds metadata and encoded data (compressed audio or video);  
Different container formats have various distinctions in how they organize and manage metadata and encoded data.  
![Video Structure](./video-struct.png)

### Codec Formats

The primary **purpose** of **encoding** is **compression**. Different codec formats represent different compression algorithms;  
This is necessary because raw sampled data (images, audio) is too large to store or transmit without compression.

Different codec formats vary in their **compression ratio, compatibility, and complexity**;  
Generally, newer formats offer higher compression rates but come with lower compatibility and higher complexity;  
Different business scenarios (VOD, live streaming, video conferencing) require different trade-offs between these three factors.

**Common Video Codecs**

- H264 (AVC), 2003
- H265 (HEVC), 2013
- AV1, 2015

**Common Audio Codecs**

- MP3, 1991
- AAC, 2000
- Opus, 2012

### Container (Muxing) Formats

Encoded data is compressed raw data that requires metadata for proper parsing and playback;  
Common metadata includes: timing information, codec format, resolution, bitrate, and more.

MP4 is the most common and best-supported video format on the Web platform, which is why our subsequent example programs will work with MP4 files.

_MP4 containing AVC (video codec) and AAC (audio codec) offers the best compatibility_

**Other Common Formats**

- FLV: flv.js primarily works by remuxing FLV to [fMP4][10], enabling browsers to play FLV format videos
- WebM: free format, output by [MediaRecorder][9]

## WebCodecs Core APIs

![Audio & Video Workflow](./media-workflow.png)  
As shown above, WebCodecs operates at the encoding/decoding stage, not involving muxing or demuxing

The relationship between diagram nodes and APIs:  
**Video**

- Raw image data: [VideoFrame][1]
- Image encoder: [VideoEncoder][3]
- Compressed image data: [EncodedVideoChunk][5]
- Image decoder: [VideoDecoder][4]

Data transformation flow:  
`VideoFrame -> VideoEncoder => EncodedVideoChunk -> VideoDecoder => VideoFrame`
<img src="./video-encodeing.png" width="50%" /><img src="./video-decoding.png" width="50%" />

**Audio**

- Raw audio data: [AudioData][2]
- Audio encoder: [AudioEncoder][6]
- Compressed audio data: [EncodedAudioChunk][7]
- Audio decoder: [AudioDecoder][8]

\*Audio data transformation is **symmetrical** to video\*

This symmetry between encoding/decoding and audio/video makes WebCodecs easier to understand and master, which is one of its design goals.

> Symmetry: have similar patterns for encoding and decoding

### WebCodecs API Considerations

Here are some common pitfalls that newcomers should be aware of:

- VideoFrames can consume significant GPU memory; close them promptly to avoid performance impact
- VideoDecoder maintains a queue; its output VideoFrames must be closed timely, or it will pause outputting new VideoFrames
- Regularly check [encodeQueueSize](https://developer.mozilla.org/en-US/docs/Web/API/VideoEncoder/encodeQueueSize); if the encoder can't keep up, pause producing new VideoFrames
- Encoders and decoders need to be explicitly closed (e.g., [VideoEncoder.close](https://developer.mozilla.org/en-US/docs/Web/API/VideoEncoder/close)) after use, or they might block other codec operations

## Appendix

- [WebAV](https://github.com/bilibili/WebAV) Audio & video processing SDK built on WebCodecs
- [VideoFrame][1], [AudioData][2]
- [VideoEncoder][3], [VideoDecoder][4]
- [AudioEncoder][6], [AudioDecoder][8]
- [EncodedVideoChunk][5], [EncodedAudioChunk][7]

[1]: https://developer.mozilla.org/en-US/docs/Web/API/VideoFrame
[2]: https://developer.mozilla.org/en-US/docs/Web/API/AudioData
[3]: https://developer.mozilla.org/en-US/docs/Web/API/VideoEncoder
[4]: https://developer.mozilla.org/en-US/docs/Web/API/VideoDecoder
[5]: https://developer.mozilla.org/en-US/docs/Web/API/EncodedVideoChunk
[6]: https://developer.mozilla.org/en-US/docs/Web/API/AudioEncoder
[7]: https://developer.mozilla.org/en-US/docs/Web/API/EncodedAudioChunk
[8]: https://developer.mozilla.org/en-US/docs/Web/API/AudioDecoder
[9]: https://developer.mozilla.org/zh-CN/docs/Web/API/MediaRecorder
[10]: https://github.com/CharonChui/AndroidNote/blob/master/VideoDevelopment/%E8%A7%86%E9%A2%91%E5%B0%81%E8%A3%85%E6%A0%BC%E5%BC%8F/fMP4%E6%A0%BC%E5%BC%8F%E8%AF%A6%E8%A7%A3.md
