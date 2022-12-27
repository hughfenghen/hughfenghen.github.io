# 单测（Unit Test）提效技巧

## 单测意义
本质：将测试行为及结果固化下来，后续自动化运行  

### 单测的价值
- 单测是一种调试工具；在开发阶段验证代码是否符合期望，比浏览器中调试更有效率  
- 单测是一种项目文档；帮助了解SDK的API及如何使用  
- 单测能降低项目维护成本；拥有完整的单测用例后，单测执行结果会告诉你代码变更的影响范围  
- 单测能帮助你编写更加优秀的代码  

## 开发技巧
### 单测的边界
单元测试的目标是你写的代码，测试你写的代码符合期望（白盒测试），边界之外代码若有意外尽量 Mock。  
如何确定边界？  
1. import 的第三方包（无IO操作可以不Mock）  
2. 系统(Node.js, 浏览器)提供的部分 API，主要包括 fetch、document、fs

*Mock的方法、技巧参考后文。*

### 编写易于测试的代码  
*优秀的代码有很多要素，优秀的代码肯定是易于测试的。*  

#### 隔离副作用代码
*函数副作用是指函数在正常工作任务之外对外部环境所施加的影响*  
对js来说，最常见的副作用是 网络请求、增删DOM节点、读写文件。  
副作用不可避免但可以隔离，只测试相对比较纯的函数。  

```js
// 错误示例
function createList(arr) {
  const ulEl = document.createElement('ul')
  arr.forEach((it) => {
    const li = document.createElement('li')
    li.textContent = it
    ulEl.appendChild(li)
  })
  // 其他逻辑。。。
  document.querySelector('container').appendChild(ulEl)
}

// 正确示例；修改建议
function createList(arr) {
  const ulEl = document.createElement('ul')
  arr.forEach((it) => {
    const li = document.createElement('li')
    li.textContent = it
    ulEl.appendChild(li)
  })
  // 其他逻辑。。。
  return ulEl
}
// 测试示例
test('创建列表', () => {
  const arr = [1, 2]
  const ulEl = createList(arr)
  expect(ulEl.childNodes.length).toBe(arr.length)
  expect(ulEl).toBeInstanceOf(HTMLUListElement)
  expect(
    [...ulEl.childNodes].every(it => it instanceof HTMLLIElement)
  ).toBe(true)
})

// 对于汇总了副作用的函数，可以使用 Mock 方法进行测试
// 也可以考虑略过，不编写测试代码，权衡成本即可
function insertList() {
  const arr = [1, 2]
  document.querySelector('container').appendChild(createList(arr))
}
```

#### 使用返回值而不是修改参数

#### 控制圈复杂度

自身代码设计，隔离纯计算、副作用
降低圈复杂度
纯函数（利用返回值


编辑器单测结合

## Jest 技巧
Mock、结果比较（snapshot expect.any）、fakeTimer


https://info.bilibili.co/pages/viewpage.action?pageId=105002726