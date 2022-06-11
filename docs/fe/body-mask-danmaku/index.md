# Web 端基于机器学习实现防档（不挡脸）弹幕

## 前言
**防档弹幕**，即大量弹幕飘过，但不会遮挡视频画面中的人物，看起来像是从人物背后飘过去的。  
<img src="./bili-mask-danmaku.jpeg" width="400">  

### 主流实现原理
#### 点播
1. up 上传视频后，服务器后台计算提取视频画面中的人体区域，转换成 svg 存储  
2. 客户端播放视频的同时，从服务器下载 svg 与弹幕合成，人体区域不显示弹幕  

#### 直播
1. 主播推流时，实时（主播设备）从画面提取人体区域，转换成 svg  
2. 将 svg 数据合并到视频流中（SEI），上传到服务器  
3. 客户端播放视频同时，从视频流中（SEI）解码出 svg  
4. 将 svg 与弹幕合成，人体区域不显示弹幕  

### 本文实现方案
1. 客户端播放视频同时，实时从画面提取人体区域，转换成 svg
2. 将 svg 与弹幕合成，人体区域不显示弹幕  

#### 实现原理
1. 采用机器学习开源库从视频画面实时提取人体轮廓，如[Body Segmentation](https://github.com/tensorflow/tfjs-models/blob/master/body-segmentation/README.md)  
2. 将人体轮廓转导出为图片，设置弹幕层的 [mask-image](https://developer.mozilla.org/zh-CN/docs/Web/CSS/mask-image)  

#### 面临的问题
众所周知“*JS 性能太辣鸡*”，不适合执行 CPU 密集型任务。  

一开始我也不敢相信实时计算，能将 **CPU 占用优化到 5%** 左右（2020 M1 Macbook）  
甚至低于主流实现中，单在客户端上的性能损耗（解析 svg，与弹幕合成）  

---

------------------------------ 废话结束，以下是调优过程 ------------------------------  

---

## 选择机器学习模型
<details>
<summary><span style="color: #1989fa; cursor: pointer;">可展开</span>

[BodyPix](https://github.com/tensorflow/tfjs-models/blob/master/body-segmentation/src/body_pix/README.md) **X**  
精确度太差，有很明显的弹幕与面部重合现象  

</summary>

<img src="./bodypix-mask.png">  

</details>


<details>
<summary><span style="color: #1989fa; cursor: pointer;">可展开</span>

[BlazePose](https://github.com/tensorflow/tfjs-models/blob/master/pose-detection/src/blazepose_mediapipe/README.md)**X**  
精确度跟后面的MediaPipe SelfieSegmentation差不多，因为提供了肢体点位信息，**CPU 占用相对高出 15% 左右**  

</summary>

<img src="./blacepose-mask.png">  

```js
[
  {
    score: 0.8,
    keypoints: [
      {x: 230, y: 220, score: 0.9, score: 0.99, name: "nose"},
      {x: 212, y: 190, score: 0.8, score: 0.91, name: "left_eye"},
      ...
    ],
    keypoints3D: [
      {x: 0.65, y: 0.11, z: 0.05, score: 0.99, name: "nose"},
      ...
    ],
    segmentation: {
      maskValueToLabel: (maskValue: number) => { return 'person' },
      mask: {
        toCanvasImageSource(): ...
        toImageData(): ...
        toTensor(): ...
        getUnderlyingType(): ...
      }
    }
  }
]
```
</details>

---

<details>
<summary><span style="color: #1989fa; cursor: pointer;">可展开</span>  

[MediaPipe SelfieSegmentation](https://github.com/tensorflow/tfjs-models/blob/master/body-segmentation/src/selfie_segmentation_mediapipe/README.md) **√**  
精确度优秀，只提供了人体区域信息，性能取胜  

</summary>

<img src="./bodysegment-mask.png">  

```js
{
  maskValueToLabel: (maskValue: number) => { return 'person' },
  mask: {
    toCanvasImageSource(): ...
    toImageData(): ...
    toTensor(): ...
    getUnderlyingType(): ...
  }
}
``` 
</details>

参考[官方实现](https://github.com/tensorflow/tfjs-models/blob/master/body-segmentation/README.md#bodysegmentationdrawmask)，未做优化的情况下
**<span style="color: red;">CPU 占用 70%左右</span>**  
```ts
const canvas = document.createElement('canvas')
canvas.width = videoEl.videoWidth
canvas.height = videoEl.videoHeight
async function detect (): Promise<void> {
 const segmentation = await segmenter.segmentPeople(videoEl)
 const foregroundColor = { r: 0, g: 0, b: 0, a: 0 }
 const backgroundColor = { r: 0, g: 0, b: 0, a: 255 }

 const mask = await toBinaryMask(segmentation, foregroundColor, backgroundColor)

 await drawMask(canvas, canvas, mask, 1, 9)
 handler(canvas.toDataURL('image/png', 0.1))

 window.setTimeout(detect, 33)
}

detect().catch(console.error)
```

## 降低提取频率，平衡 性能-体验
一般视频 30FPS，尝试弹幕遮罩（后称 Mask）更新频率降为 15FPS，体验上还能接受（再低就不行了）  
```ts
window.setTimeout(detect, 66) // 33 => 66
```
此时，**<span style="color: red;">CPU 占用 50%左右</span>**  

## 分析性能瓶颈
<img src="./flame-graph.png">  

分析火焰图可发现，性能瓶颈在 `toBinaryMask` 和 `toDataURL`

### 重写toBinaryMask
分析源码结合打印segmentation信息，发现`segmentation.mask.toCanvasImageSource`可获取原始`ImageBitmap`对象，即是模型提取出来的信息。  
尝试自己实现将`ImageBitmap`转换成 Mask 的能力，替换掉开源库提供的默认实现。  

**实现原理如下：**  
1. 将`ImageBitmap`绘制到 Canvas 上
2. 设置CanvasRenderingContext2D混合模式 `ctx.globalCompositeOperation = source-out`
3. 填充整个Canvas `cctx.fillRect(0, 0, width, height)`
4. toDataURL导出 Mask

第 2、3 步相当于给人体区域外的内容填充颜色（反向填充`ImageBitmap`），是为了配合css（mask-image），
不做这两步的话，只有当弹幕飘到人体区域才可见（与目标效果正好相反）。  

此时，**<span style="color: red;">CPU 占用 33%左右</span>**  

### 多线程优化

## 分辨率优化
720p, 100kb 左右
300x168 20kb？

## 启动条件优化
判定有人、判定弹幕量

## 发布构建优化

## 总结

module.exports = {
  markdown: {
    lineNumbers: true
  }
}

