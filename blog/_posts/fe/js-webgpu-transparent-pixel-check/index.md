# JS / WebGPU 透明像素点检测对比

使用 WebGPU 可以实现更高效的透明像素点检测，特别是在处理大型图像时。

以下是 WebGPU 实现的透明像素点检测示例代码

```js
// GPU 检测函数
async function hasTransparentPixels(device, imageBitmap) {
  const startTime = performance.now();

  const resultBuffer = device.createBuffer({
    size: 4, // 单个uint32值
    usage:
      GPUBufferUsage.STORAGE |
      GPUBufferUsage.COPY_SRC |
      GPUBufferUsage.COPY_DST, // 添加 COPY_DST
  });

  const clearBuffer = device.createBuffer({
    size: 4,
    usage: GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
    mappedAtCreation: true,
  });
  // 初始状态 0，没有透明像素
  new Uint32Array(clearBuffer.getMappedRange())[0] = 0;
  clearBuffer.unmap();

  // 创建一个零初始化的暂存缓冲区
  const stagingBuffer = device.createBuffer({
    size: 4,
    usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
  });

  const texture = device.createTexture({
    size: [imageBitmap.width, imageBitmap.height],
    format: 'rgba8unorm',
    usage:
      GPUTextureUsage.TEXTURE_BINDING |
      GPUTextureUsage.COPY_DST |
      GPUTextureUsage.STORAGE_BINDING |
      GPUTextureUsage.RENDER_ATTACHMENT, // 添加 RENDER_ATTACHMENT
  });

  device.queue.copyExternalImageToTexture(
    { source: imageBitmap },
    { texture },
    [imageBitmap.width, imageBitmap.height]
  );

  const commandEncoder = device.createCommandEncoder();
  commandEncoder.copyBufferToBuffer(clearBuffer, 0, resultBuffer, 0, 4);

  // 创建计算管线
  // 在 shader 代码中添加边界检查
  const computePipeline = device.createComputePipeline({
    layout: 'auto',
    compute: {
      module: device.createShaderModule({
        code: `
          @group(0) @binding(0) var texture: texture_2d<f32>;
          @group(0) @binding(1) var<storage, read_write> result: atomic<u32>;

          @compute @workgroup_size(16, 16)
          fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
            let dimensions = textureDimensions(texture);
            let coord = vec2<u32>(global_id.xy);

            // 确保在纹理范围内
            if (coord.x < dimensions.x && coord.y < dimensions.y) {
              let pixel = textureLoad(texture, vec2<i32>(coord), 0);
              if (pixel.a == 0.0) {
                atomicAdd(&result, 1u);
              }
            }
          }
        `,
      }),
      entryPoint: 'main',
    },
  });

  // 创建绑定组
  const bindGroup = device.createBindGroup({
    layout: computePipeline.getBindGroupLayout(0),
    entries: [
      {
        binding: 0,
        resource: texture.createView(),
      },
      {
        binding: 1,
        resource: { buffer: resultBuffer },
      },
    ],
  });

  // 调度计算着色器
  const computePass = commandEncoder.beginComputePass();
  computePass.setPipeline(computePipeline);
  computePass.setBindGroup(0, bindGroup);

  // 计算工作组尺寸
  const workgroupWidth = Math.ceil(imageBitmap.width / 16);
  const workgroupHeight = Math.ceil(imageBitmap.height / 16);
  // 添加调试信息
  console.log(
    `图像尺寸: ${imageBitmap.width}x${imageBitmap.height} = ${
      imageBitmap.width * imageBitmap.height
    }`
  );
  console.log(`工作组数量: ${workgroupWidth}x${workgroupHeight}`);
  console.log(`总处理像素数: ${workgroupWidth * 16 * workgroupHeight * 16}`);

  computePass.dispatchWorkgroups(workgroupWidth, workgroupHeight);
  computePass.end();

  // 复制结果到可读取的缓冲区
  commandEncoder.copyBufferToBuffer(resultBuffer, 0, stagingBuffer, 0, 4);

  // 提交命令
  device.queue.submit([commandEncoder.finish()]);

  // 读取结果
  await stagingBuffer.mapAsync(GPUMapMode.READ);
  const resultData = new Uint32Array(stagingBuffer.getMappedRange());
  const transparentCount = resultData[0];
  const hasTransparentPixel = transparentCount > 0;
  stagingBuffer.unmap();

  // 清理资源
  texture.destroy();

  const timeSpent = (performance.now() - startTime).toFixed(2);
  return { transparentCount, timeSpent };
}
```

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>JS / WebGPU 透明像素点统计对比</title>
    <style>
      body {
        font-family: 'Arial', sans-serif;
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
        line-height: 1.6;
        background-color: antiquewhite;
      }

      h1 {
        color: #333;
        text-align: center;
      }

      .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;
      }

      #fileInput {
        display: none;
      }

      .upload-btn {
        padding: 10px 20px;
        background-color: #4caf50;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 16px;
      }

      .upload-btn:hover {
        background-color: #45a049;
      }

      #imagePreview {
        max-width: 100%;
        max-height: 400px;
        border: 1px solid #ddd;
        border-radius: 4px;
        display: none;
      }

      .result {
        font-size: 18px;
        font-weight: bold;
        min-height: 24px;
        padding: 10px;
        border-radius: 4px;
        text-align: center;
      }

      .loader {
        border: 4px solid #f3f3f3;
        border-top: 4px solid #3498db;
        border-radius: 50%;
        width: 20px;
        height: 20px;
        animation: spin 1s linear infinite;
        display: none;
      }

      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }

        100% {
          transform: rotate(360deg);
        }
      }

      .error {
        color: #ff0000;
        text-align: center;
        display: none;
      }

      .canvas-container {
        margin-top: 20px;
        display: none;
      }

      #pixelCanvas {
        border: 1px solid #ddd;
        max-width: 100%;
      }
    </style>
  </head>

  <body>
    <div class="container">
      <h1>JS / WebGPU 透明像素点统计对比</h1>

      <p>
        使用传统 JS 和 WebGPU
        检测图像中透明像素点的数量。选择一张图片上传，系统会自动分析并显示结果。
      </p>

      <div id="webgpuError" class="error">
        您的浏览器不支持 WebGPU。请使用支持 WebGPU 的最新版 Chrome、Edge
        或其他浏览器。
      </div>

      <label for="fileInput" class="upload-btn">选择图片</label>
      <input type="file" id="fileInput" accept="image/*" />

      <img id="imagePreview" alt="图像预览" />

      <div class="loader" id="loader"></div>

      <div id="gpu-result" class="result"></div>
      <div id="cpu-result" class="result"></div>
    </div>
    <div class="canvas-container" id="canvasContainer">
      <h3>像素分析可视化 (CPU)</h3>
      <canvas id="pixelCanvas"></canvas>
    </div>

    <script>
      // 检查 WebGPU 支持
      document.addEventListener('DOMContentLoaded', async () => {
        if (!navigator.gpu) {
          document.getElementById('webgpuError').style.display = 'block';
          document.querySelector('.upload-btn').disabled = true;
          document.querySelector('.upload-btn').style.backgroundColor = '#ccc';
          return;
        }

        const adapter = await navigator.gpu.requestAdapter();
        if (!adapter) {
          document.getElementById('webgpuError').textContent =
            '无法获取 GPU 适配器，请检查您的硬件和浏览器设置。';
          document.getElementById('webgpuError').style.display = 'block';
          document.querySelector('.upload-btn').disabled = true;
          document.querySelector('.upload-btn').style.backgroundColor = '#ccc';
          return;
        }

        // WebGPU 可用，初始化设备
        const device = await adapter.requestDevice();
        initFileUpload(device);
      });

      // 初始化文件上传处理
      async function initFileUpload(device) {
        const fileInput = document.getElementById('fileInput');
        const imagePreview = document.getElementById('imagePreview');
        const gpuCheckResult = document.getElementById('gpu-result');
        const cpuCheckResult = document.getElementById('cpu-result');
        const loader = document.getElementById('loader');

        fileInput.addEventListener('change', async (e) => {
          const file = e.target.files[0];
          if (!file) return;

          loader.style.display = 'block';
          gpuCheckResult.textContent = '';
          cpuCheckResult.textContent = '';

          try {
            const imageUrl = URL.createObjectURL(file);
            imagePreview.src = imageUrl;
            imagePreview.style.display = 'block';
            await new Promise((resolve) => (imagePreview.onload = resolve));

            const imageBitmap = await createImageBitmap(file);

            // CPU 检测
            const { transparentCount: cpuCount, timeSpent: cpuTime } =
              await checkImageTransparencyWithCPU(file);
            updateResult(cpuCheckResult, cpuCount, cpuTime, 'CPU');

            // GPU 检测
            const { transparentCount: gpuCount, timeSpent: gpuTime } =
              await hasTransparentPixels(device, imageBitmap);
            updateResult(gpuCheckResult, gpuCount, gpuTime, 'GPU');
          } catch (error) {
            console.error(error);
            showError(gpuCheckResult, error.message);
          } finally {
            loader.style.display = 'none';
          }
        });
      }

      // 更新结果显示
      function updateResult(element, count, time, type) {
        element.textContent =
          count > 0
            ? `✅ ${type} 检测到 ${count} 个透明像素！(耗时: ${time}ms)`
            : `❌ ${type} 未检测到透明像素，图像是完全不透明的。(耗时: ${time}ms)`;
        element.style.backgroundColor = count > 0 ? '#e6f7e6' : '#ffe6e6';
        element.style.color = count > 0 ? '#2e7d32' : '#c62828';
        element.style.border = `1px solid ${count > 0 ? '#a5d6a7' : '#ef9a9a'}`;
      }

      // 显示错误信息
      function showError(element, message) {
        element.textContent = `错误: ${message}`;
        element.style.backgroundColor = '#ffe6e6';
        element.style.color = '#c62828';
        element.style.border = '1px solid #ef9a9a';
      }

      // CPU 检测函数
      async function checkImageTransparencyWithCPU(file) {
        const startTime = performance.now();

        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        await new Promise((resolve) => (img.onload = resolve));

        const canvas = document.getElementById('pixelCanvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const transparentCount = countTransparentPixels(data);
        const timeSpent = (performance.now() - startTime).toFixed(2);

        return { transparentCount, timeSpent };
      }

      // 计算透明像素数量
      function countTransparentPixels(data) {
        let count = 0;
        for (let i = 3; i < data.length; i += 4) {
          if (data[i] === 0) count++;
        }
        return count;
      }

      // GPU 检测函数
      async function hasTransparentPixels(device, imageBitmap) {
        const startTime = performance.now();

        const resultBuffer = device.createBuffer({
          size: 4, // 单个uint32值
          usage:
            GPUBufferUsage.STORAGE |
            GPUBufferUsage.COPY_SRC |
            GPUBufferUsage.COPY_DST, // 添加 COPY_DST
        });

        const clearBuffer = device.createBuffer({
          size: 4,
          usage: GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
          mappedAtCreation: true,
        });
        // 初始状态 0，没有透明像素
        new Uint32Array(clearBuffer.getMappedRange())[0] = 0;
        clearBuffer.unmap();

        // 创建一个零初始化的暂存缓冲区
        const stagingBuffer = device.createBuffer({
          size: 4,
          usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
        });

        const texture = device.createTexture({
          size: [imageBitmap.width, imageBitmap.height],
          format: 'rgba8unorm',
          usage:
            GPUTextureUsage.TEXTURE_BINDING |
            GPUTextureUsage.COPY_DST |
            GPUTextureUsage.STORAGE_BINDING |
            GPUTextureUsage.RENDER_ATTACHMENT, // 添加 RENDER_ATTACHMENT
        });

        device.queue.copyExternalImageToTexture(
          { source: imageBitmap },
          { texture },
          [imageBitmap.width, imageBitmap.height]
        );

        const commandEncoder = device.createCommandEncoder();
        commandEncoder.copyBufferToBuffer(clearBuffer, 0, resultBuffer, 0, 4);

        // 创建计算管线
        // 在 shader 代码中添加边界检查
        const computePipeline = device.createComputePipeline({
          layout: 'auto',
          compute: {
            module: device.createShaderModule({
              code: `
              @group(0) @binding(0) var texture: texture_2d<f32>;
              @group(0) @binding(1) var<storage, read_write> result: atomic<u32>;

              @compute @workgroup_size(16, 16)
              fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
                let dimensions = textureDimensions(texture);
                let coord = vec2<u32>(global_id.xy);

                // 确保在纹理范围内
                if (coord.x < dimensions.x && coord.y < dimensions.y) {
                  let pixel = textureLoad(texture, vec2<i32>(coord), 0);
                  if (pixel.a == 0.0) {
                    atomicAdd(&result, 1u);
                  }
                }
              }
            `,
            }),
            entryPoint: 'main',
          },
        });

        // 创建绑定组
        const bindGroup = device.createBindGroup({
          layout: computePipeline.getBindGroupLayout(0),
          entries: [
            {
              binding: 0,
              resource: texture.createView(),
            },
            {
              binding: 1,
              resource: { buffer: resultBuffer },
            },
          ],
        });

        // 调度计算着色器
        const computePass = commandEncoder.beginComputePass();
        computePass.setPipeline(computePipeline);
        computePass.setBindGroup(0, bindGroup);

        // 计算工作组尺寸
        const workgroupWidth = Math.ceil(imageBitmap.width / 16);
        const workgroupHeight = Math.ceil(imageBitmap.height / 16);
        // 添加调试信息
        console.log(
          `图像尺寸: ${imageBitmap.width}x${imageBitmap.height} = ${
            imageBitmap.width * imageBitmap.height
          }`
        );
        console.log(`工作组数量: ${workgroupWidth}x${workgroupHeight}`);
        console.log(
          `总处理像素数: ${workgroupWidth * 16 * workgroupHeight * 16}`
        );

        computePass.dispatchWorkgroups(workgroupWidth, workgroupHeight);
        computePass.end();

        // 复制结果到可读取的缓冲区
        commandEncoder.copyBufferToBuffer(resultBuffer, 0, stagingBuffer, 0, 4);

        // 提交命令
        device.queue.submit([commandEncoder.finish()]);

        // 读取结果
        await stagingBuffer.mapAsync(GPUMapMode.READ);
        const resultData = new Uint32Array(stagingBuffer.getMappedRange());
        const transparentCount = resultData[0];
        const hasTransparentPixel = transparentCount > 0;
        stagingBuffer.unmap();

        // 清理资源
        texture.destroy();

        const timeSpent = (performance.now() - startTime).toFixed(2);
        return { transparentCount, timeSpent };
      }
    </script>
  </body>
</html>
```
