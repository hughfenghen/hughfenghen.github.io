---
tags:
  - WebAV_EN
  - Audio & Video
  - WebCodecs
date: 2024-10-31
---

# WebAV SDK (Web Video Editing) V1 Release

## Introduction

[WebAV][1] is a WebCodecs-based SDK for creating and editing video files on the Web platform.

Version 1 marks a milestone for the project, signifying stable APIs and thoroughly tested functionality ready for production use.

I joined Bilibili in 2020 and began working with Web audio/video technologies (Web player). WebCodecs API was released in 2021.  
I anticipated that WebCodecs' encoding/decoding capabilities would transform video production (as opposed to consumption) on the Web platform. However, with no mature open-source projects available by early 2023, I initiated the WebAV project.

While WebAV started as a personal interest project, its current success owes much to support and contributions from Bilibili and the community.

## What Can WebAV SDK Do?

We recommend experiencing the SDK's capabilities through the official [DEMO][2], which showcases basic features like video frame capture, trimming, watermarking, subtitles, and composition.

While video consumption on the Web platform is mature, video production tools built with Web technologies are scarce, particularly in video editing.  
Although current Web technology can support general video editing products, competing with professional, mature PC video editing software would be challenging.

The Web platform's greatest advantage is **user convenience**. Consider building products with WebAV in these areas:

- AI technology is advancing rapidly, promising significant productivity improvements across sectors  
  Given AI's tight integration with Web platforms, WebAV can participate in video innovation, such as digital avatars or processing AI-generated video segments
- Batch video processing; Beyond professional, precise video editing, many real-world scenarios need **simple, robust, efficiency-first video solutions**  
  Examples include bulk marketing video generation, video albums, and video templates
- Video processing utilities; Many single-purpose online video tools exist for watermarking, trimming, audio removal, thumbnail generation, etc.  
  WebAV can reduce server costs while maintaining convenience and potentially improving user experience

These use cases emerged during WebAV promotion. More opportunities exist leveraging Web's advantages in **convenience, cross-platform support, and iteration speed**.

## V1 Key Features

### Functional Stability

From launch to V1 release, WebAV has undergone extensive real-world production testing. V1 release indicates API stability.

### Simplified API

We aimed to reduce breaking changes post-V1 and simplify the [API documentation][3], lowering the learning curve.  
All official site demos use just a dozen public APIs, so they'll work in your project after installing dependencies and copying the demo code.

Retired APIs are mostly internal to `@webav/*` packages, minimizing developer impact.

See [Migrating to v1][7] for details.

### Performance Optimization

WebCodecs leverages hardware acceleration for encoding/decoding. After several optimization rounds, WebAV shows significant performance improvements.  
While some performance gaps remain compared to Native solutions on certain devices, I believe performance is no longer a primary consideration in solution selection.

See [WebCodecs Performance and Optimization Insights][4] for details.

## Next Steps

- Test Optimization
  - Increase coverage
  - Use Mock interfaces or minimal video data instead of video files to improve test performance
- Workflow Optimization
  - Automatic code formatting on commit for consistent style and easier contribution
  - Automatic testing before push to maintain project quality
- Documentation/Articles
  - More introductory articles explaining WebAV implementation principles for frontend developers
  - English API documentation
  - Issue templates for better issue quality
- Support for more video formats (mkv, webm)

We welcome more contributors and encourage problem reporting (_with necessary information_), PRs for bug fixes, and small feature implementations.

The entry barrier for frontend developers is low - just review our [introductory articles][5], [contribution guidelines][6], and have some patience for reading source code.

## Final Words

Thanks to all WebAV contributors <a href="https://github.com/bilibili/WebAV/graphs/contributors"><img src="https://img.shields.io/github/contributors/bilibili/WebAV
"/></a> and supporters.

Please share WebAV with others interested in Web audio/video development to help drive the project forward.  
**Exposure (Users) × Contributors = Momentum**

## Appendix

- [WebAV GitHub][1]
- [WebAV DEMO][2]
- [WebAV API][3]
- [WebAV Article Series][5]
- [WebCodecs Performance and Optimization Insights][4]
- [Contribution Guidelines][6]
- [Migrating to v1][7]

[1]: https://github.com/bilibili/WebAV
[2]: https://bilibili.github.io/WebAV/demo
[3]: https://bilibili.github.io/WebAV/api
[4]: https://hughfenghen.github.io/posts/2024/07/27/webcodecs-performance-benchmark/
[5]: https://hughfenghen.github.io/tag/WebAV_EN/
[6]: http://localhost:8000/guide/contribution
[7]: http://localhost:8000/guide/migrate-to-v1
