---
tags:
  - 音视频
  - Web
date: 2023-07-10
---

# JS 解析 SRT 字幕

[SRT字幕格式介绍](https://www.cnblogs.com/tocy/p/subtitle-format-srt.html)  

*copy 以下代码可在控制台测试效果*  
```js
function srtTimeToSeconds (time) {
  const match = time.match(/(\d{2}):(\d{2}):(\d{2}),(\d{3})/)
  if (match == null) throw Error(`time format error: ${time}`)

  const hours = Number(match[1])
  const minutes = Number(match[2])
  const seconds = Number(match[3])
  const milliseconds = Number(match[4])

  return hours * 60 * 60 + minutes * 60 + seconds + milliseconds / 1000
}

function parseSrt (srt) {
  return (
    srt
      .split(/\r|\n/)
      .map(s => s.trim())
      .filter(str => str.length > 0)
      // 匹配时间戳标记行，匹配失败的为字幕内容
      .map(s => ({
        lineStr: s,
        match: s.match(
          /(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/
        )
      }))
      // 过滤掉时间上一行的数字标记
      .filter(
        ({ lineStr }, idx, source) =>
          !(/^\d+$/.test(lineStr) && source[idx + 1]?.match != null)
      )
      // 按时间标记行聚合，拼接字幕内容到 text 字段
      .reduce(
        (acc, { lineStr, match }) => {
          if (match == null) {
            const last = acc.at(-1)
            if (last == null) return acc

            last.text += last.text.length === 0 ? lineStr : `\n${lineStr}`
          } else {
            acc.push({
              start: srtTimeToSeconds(match[1]),
              end: srtTimeToSeconds(match[2]),
              text: ''
            })
          }

          return acc
        },
        []
      )
  )
}

// --------------- 测试 --------------- 
parseSrt(`

1
00:00:00,341 --> 00:00:03,218
测试样本1-3s

2
00:00:04,386 --> 00:00:07,555
超长的测试样本1，超长的测试样本1，超长的测试样本1，超长的测试样本1，超长的测试样本1，超长的测试样本1
超长的测试样本2，超长的测试样本2，超长的测试样本2，超长的测试样本2，超长的测试样本2，超长的测试样本2

3
00:00:07,265 --> 00:00:10,766
测试样本3-3s

4
00:00:10,850 --> 00:00:15,143
测试样本4-5s

5
00:00:16,685 --> 00:00:26,186
测试样本5-10s

6
00:00:17,270 --> 00:00:37,604
测试样本6-10s

7
00:00:38,688 --> 00:00:48,606
测试样本7-10

8
00:00:49,690 --> 00:01:10,691
测试样本8-10s

9
00:01:11,774 --> 00:01:30,026
测试样本9-20s
`)
```