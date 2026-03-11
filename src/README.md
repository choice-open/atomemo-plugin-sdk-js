# src

源代码目录，包含 SDK 的运行时、类型导出、Hub 通信和文件上下文能力。

## 核心模块

### `index.ts`
SDK 入口文件。

**导出：**
- `createPlugin` - 创建插件实例的工厂函数

### `plugin.ts`
插件运行时主入口，负责把注册表、Hub 连接、上下文能力和消息处理串起来。

**功能：**
- 创建插件实例
- 管理 credential、tool、model 定义
- 在 `run()` 中连接 Hub 并按 topic 启动插件
- 处理 `register_plugin`、`invoke_tool`、`credential_auth_spec`
- 为 tool / credential 调用注入 `context`
- 在 tool 调用前递归解析 `file_ref` 参数

**主要接口：**
- `createPlugin()` - 返回包含 `addCredential`、`addTool`、`addModel`、`run` 的插件实例

### `context.ts`
构建 `PluginContext`，提供插件作者可直接使用的文件能力。

**功能：**
- `parseFileRef()` - 校验并收窄 `file_ref`
- `attachRemoteUrl()` - 为 OSS 文件补齐下载 URL
- `download()` - 下载 OSS 文件到内存，返回带 `content` 的 `FileRef`
- `upload()` - 将内存文件上传到 OSS，支持 `options.prefixKey`

### `hub.ts`
Hub call RPC 封装。

**功能：**
- 发起 `hub_call:{event}` 请求
- 匹配 `hub_call_response` / `hub_call_error`
- 提供超时、错误封装和资源清理

**主要接口：**
- `createHubCaller()`
- `HubCallError`
- `HubCallTimeoutError`

### `registry.ts`
插件注册表，管理所有已注册的功能定义。

**功能：**
- 注册和解析 credential、tool、model
- 序列化注册表为可传输 JSON
- 提供类型安全的功能查找

### `transporter.ts`
WebSocket / Phoenix Channel 传输层。

**功能：**
- 建立和管理 WebSocket 连接
- 创建并加入 Phoenix Channel
- 处理连接生命周期事件
- 提供关闭与清理能力

### `env.ts`
环境变量管理模块，提供类型安全的环境变量访问。

**功能：**
- 验证并解析运行时环境变量
- 缓存解析结果

**环境变量：**
- `HUB_MODE` - Hub 运行模式，`debug` 或 `release`
- `HUB_WS_URL` - Hub WebSocket 地址
- `HUB_DEBUG_API_KEY` - 调试模式 API Key
- `DEBUG` - 是否启用调试输出
- `NODE_ENV` - 运行环境

### `oneauth.ts`
调试模式下的登录态读取与用户信息获取。

### `config.ts`
运行时配置辅助模块。

### `logger.ts`
基于 Pino 的日志封装。

### `types.ts`
类型导出文件，重新导出 `@choiceopen/atomemo-plugin-schema/types`。

## 工具模块

### `utils/`
工具函数目录，参见 [utils/README.md](./utils/README.md)

当前包含的重要工具：
- `serialize-feature.ts` - 序列化功能定义
- `serialize-error.ts` - 把 Error 转成可传输结构
- `parse-file-refs.ts` - 递归解析参数中的 `file_ref`

## 模块关系

```
index.ts
  └─> plugin.ts
        ├─> registry.ts
        │     └─> utils/serialize-feature.ts
        ├─> transporter.ts
        │     └─> env.ts
        ├─> hub.ts
        ├─> context.ts
        └─> utils/parse-file-refs.ts
```
