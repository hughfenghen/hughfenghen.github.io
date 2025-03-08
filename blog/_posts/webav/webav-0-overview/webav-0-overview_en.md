---
tags:
  - WebAV_EN
  - Audio & Video
  - WebCodecs
date: 2023-07-16
---

# Web Audio & Video (0) Overview

> [**Web Audio & Video Series Table of Contents**](/tag/WebAV_EN)

The WebCodecs API has been released for some time (since Chrome 94), making it feasible to process audio and video files or real-time video streams in browsers.  
I plan to start a series introducing Web audio and video basics, and how to process video files (or video streams) in browsers.

_As the author is also new to the audio and video field, this series serves as a personal learning summary. If you find any errors, please leave a comment_  
_This series is suitable for frontend developers with some experience to enter the audio and video field. It won't delve deep into audio and video knowledge but will provide reference links when possible_

## Historical Stages of Web Audio & Video

0. The Barren Era  
   Web didn't support streaming media, PCs came with CD-ROM drives, and local media players were standard software  
   Users: Download movies for offline viewing
1. The Flash Era  
   Flash plugin was a browser standard, capable of playing FLV videos and RTMP streaming. Though Flash is dead, these two protocols are still alive, showing their far-reaching influence  
   Users: Online video viewing gradually became popular
1. The HTML5 Era  
   Video tags can directly play MP4 videos. For existing FLV video files, JS can be used in browsers to repackage them as fMP4 and play using MSE API; FLV.js became a star project  
   Users: Online video viewing became the preferred method, local players fell out of favor
1. The WebCodecs Era  
   Completing Web's missing audio and video **production and editing** capabilities. The capabilities are ready, but the ecosystem is not yet mature  
   Users: Expected to see online editing, AI-assisted video generation, video conferencing, live streaming tools gradually becoming web-based

## Current State of Web Audio & Video

**Audio & Video Workflow**  
![Media Workflow](./media-workflow.png)

Encoding and decoding consume the most computing resources in the entire chain. Before WebCodecs, the Web technology stack lacked controllable codec capabilities.

The demuxing, decoding, and playback capabilities were unified and encapsulated in APIs like HTMLMediaElement and MSE, so playing audio and video on web pages is generally not a problem;  
However, due to the lack of low-level data control or operation capabilities, features like video frame processing and playback buffer control are difficult or impossible to implement.

The lack of encoding capabilities has led to few video production tools on the Web; existing online editing tools heavily rely on server-side capabilities.

Without native codec capabilities, people sought various WASM versions of codecs or ffmpeg.wasm to meet basic needs;  
However, they are still constrained by performance and functionality limitations, greatly restricting application scenarios.

<strong>
WebCodecs is here to change this situation;<br>  
WebCodecs is the foundation for audio and video processing on the Web platform;<br>    
WebCodecs will, like HTML5, promote the application and development of audio and video on the Web platform.<br>  
</strong>

_This is the motivation for writing this series of articles._

If you haven't worked with WebCodecs before, it's recommended to read [WebCodecs Explainer][1] first to quickly understand the motivation and goals of the WebCodecs API

## Series Preview

- Series Overview
- [Web Audio & Video Basics](/posts/2023/07/19/webav-1-basic/)
  - Introduction to commonly used WebCodecs APIs
  - Audio & video encoding, packaging, and common formats
- [Parsing Video in Browsers](/posts/2023/07/23/webav-2-parse-video/)
  - Video parsing, frame-by-frame processing...
  - WebCodecs decoding-related API applications
- [Creating Video in Browsers](/posts/2023/07/31/webav-3-create-video/)
  - Creating and exporting video files from Canvas, camera, microphone, etc.
  - WebCodecs encoding-related API applications
- [Processing Audio in Browsers](/posts/2023/08/05/webav-4-process-audio/)
  - Complete process of **capturing, processing, encoding, and packaging** audio data in browsers
  - Basic audio data processing: volume adjustment, mixing, fade in/out, resampling
- [Compositing Video in Browsers](/posts/2023/08/12/webav-5-combine/)
  - Adding media (video, audio, images, text) to video
  - Compositing and concatenating multiple videos
- [Image Asset Processing](/posts/2023/08/19/webav-6-process-image/)
  - Image processing
  - Controlling asset layers, adding animations to assets, exporting video
  - Asset animations: translation, rotation, opacity...
- [Mid-term Review](/posts/2023/08/19/webav-7-mid-review/)
  - Personal review
  - WebCodecs value, application scenarios, case analysis

Click [WebAV Tag](/tag/WebAV_EN/) to view the series table of contents

The materials and examples in this series come from the [WebAV Project](https://github.com/WebAV-Tech/WebAV);  
WebAV attempts to provide simple and easy-to-use APIs for processing audio and video data in browsers.

You can scan the QR code to donate and provide motivation (pressure :) for the author  
<img src="../../assets/alipay-qcode.png" width="200" alt="Alipay" />
<img src="../../assets/wechatpay-qcode.png" width="200" alt="WeChat Pay" />

Star or Watch the [WebAV Project](https://github.com/WebAV-Tech/WebAV) to follow project progress, experience demos, and review example code;  
You can subscribe to this blog site through [Official Account or RSS](https://hughfenghen.github.io/subscribe.html) to receive updates on this series.

## Web Audio & Video Related APIs

- [WebCodecs API](https://developer.mozilla.org/en-US/docs/Web/API/WebCodecs_API)
  - VideoEncoder, VideoDecoder
  - AudioEncoder, AudioDecoder
  - ImageDecoder
  - MediaStreamTrackProcessor
- [Web Audio](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
  - AudioContext, OfflineAudioContext
  - AudioWorkletNode
- [MSE API](https://developer.mozilla.org/en-US/docs/Web/API/Media_Source_Extensions_API)
  - MediaSource, SourceBuffer
- [HTMLMediaElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement)
  - HTMLVideoElement, HTMLAudioElement
- Others
  - [MediaRecorder](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder)
  - [WebRTC API](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)
  - [MediaStream](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream)

## Appendix

- [WebAV](https://github.com/WebAV-Tech/WebAV) Audio & video processing SDK built on WebCodecs
- [WebCodecs Explainer](https://github.com/w3c/webcodecs/blob/main/explainer.md)
- [Video processing with WebCodecs](https://developer.chrome.com/articles/webcodecs/)
- [WebCodecs Explainer][1]

[1]: /posts/2023/10/02/webcodecs-explainer/
