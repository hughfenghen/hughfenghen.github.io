---
tags:
  - WebAV_EN
  - think
  - Audio & Video
  - WebCodecs
  - Web
date: 2023-08-19
---

# Web Audio & Video (7) Mid-Series Review

> [**Web Audio & Video Series Table of Contents**](/tag/WebAV_EN)

## Personal Reflection

Over the past month since this series began, we've covered the **parsing, processing, and composition** of audio and video data. We've implemented the main aspects of video editing in the browser at a high level, essentially explaining the principles behind the [WebAV project][1].

The knowledge shared has been introductory, targeting newcomers to audio and video development on the Web platform.  
This is my first attempt at high-frequency technical writing, and making complex concepts easily understandable has proven quite challenging - a skill that requires continued practice.

The title "Mid-Series Review" suggests hope for future discussions on deeper and broader Web audio/video topics, such as streaming, filters, transitions, and more.

## The Value of WebCodecs

As mentioned in the first chapter, WebCodecs fills the gap in encoding and decoding capabilities for the Web.  
On the **consumption side**, this enables finer control over media, allowing frame-by-frame playback, reverse playback, thumbnail generation, video clip sharing, and more.  
However, WebCodecs truly shines on the **production side**, making previously impossible or difficult Web platform features now achievable.

Discussing WebCodecs' value naturally involves the Web platform itself, whose appeal lies in its **connectivity, cross-platform nature, and low barrier to entry**.

Figma serves as a perfect example: designers collaboratively (connectivity) create designs online (cross-platform), delivering just a URL to frontend developers (low barrier).  
Five years ago, designers would send me HTML zip files; three years ago, they asked me to download Zeplin; now, receiving a Figma URL feels remarkably streamlined.

Imagining a video creation tool following Figma's template would mean collaborative video editing in the browser - and such [products][2] already exist.  
Combined with trending AI technology and decreasing barriers to video creation, we'll likely see many non-professional users, making the Web the ideal platform for such products.

In the live streaming space, many platforms lack Mac versions for their streaming clients. While cross-platform web streaming exists (via WebSocket or WebRTC), limited codec control makes it difficult to meet diverse product requirements.  
Using Electron + WebCodecs to build a comprehensive cross-platform streaming client, with technology reuse for web streaming, could be an excellent technical solution.

## Challenges for WebCodecs

- Immature Ecosystem
  - Lack of diverse, mature demuxing libraries
- Compatibility Issues
  - Currently only Chrome offers good support
  - Optimistic future with Firefox and Safari pledging support
- No Custom Codec Support
  - Currently no solution available

For products with large user bases, client-cloud integration will be a long-term process.  
This involves shifting some computational load to clients to reduce costs while providing cloud support for users with incompatible systems.

## Appendix

- [WebAV][1] Audio & video processing SDK built on WebCodecs
- [scenery.video][2] Collaborative web-based video editing product
- My maintained [Bilibili Live Web Streaming Application][3]

[1]: https://github.com/bilibili/WebAV
[2]: https://scenery.video/hello
[3]: https://live.bilibili.com/p/html/web-hime/index.html
