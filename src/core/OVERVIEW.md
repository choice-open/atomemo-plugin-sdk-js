# Core 模块

核心运行时组件，处理插件注册和网络通信。

## 模块列表

| 文件 | 说明 |
|------|------|
| `logger.ts` | 日志记录器 |
| `registry.ts` | 功能注册表 |
| `transporter.ts` | 网络传输层 |

## logger.ts

基于 [Pino](https://github.com/pinojs/pino) 的日志记录器。

### 配置

- **日志级别**: DEBUG 模式下为 `trace`，否则为 `error`
- **开发环境**: 使用 `pino-pretty` 美化输出
- **时间戳**: ISO 格式

## registry.ts

插件功能的注册中心，管理所有定义的功能。

### 接口

```typescript
interface Registry {
  register(type: FeatureType, feature: Feature): void
  resolve(type: FeatureType, featureName: string): Feature
  serialize(): SerializedRegistry
}
```

### FeatureType

支持的功能类型：
- `credential` - 凭证
- `data_source` - 数据源
- `model` - AI 模型
- `tool` - 工具

### 存储结构

```typescript
interface RegistryStore {
  plugin: PluginRegistry
  credential: Map<string, CredentialDefinition>
  data_source: Map<string, DataSourceDefinition>
  model: Map<string, ModelDefinition>
  tool: Map<string, ToolDefinition>
}
```

### 序列化

`serialize()` 方法将注册表转换为 JSON 兼容格式：
- 将各功能 Map 转换为数组
- 使用 `serializeFeature` 剔除函数属性

## transporter.ts

基于 [Phoenix Channels](https://hexdocs.pm/phoenix/channels.html) 的 WebSocket 传输层。

### 接口

```typescript
interface TransporterOptions {
  heartbeatIntervalMs?: number
  onOpen?: () => void
  onClose?: (event: unknown) => void
  onError?: (error: unknown, transport?: unknown, connections?: unknown) => void
  onMessage?: (message: unknown) => void
}

function createTransporter(options?: TransporterOptions): {
  connect: () => { channel: Channel; dispose: () => void }
}
```

### 通信流程

1. 创建 Socket 连接到 `HUB_SERVER_WS_URL`
2. 加入 `mirror:lobby` 频道
3. 通过 `channel.push("shout", data)` 发送数据
4. 监听 `channel.on("shout", callback)` 接收消息

### 环境变量

| 变量 | 说明 |
|------|------|
| `HUB_SERVER_WS_URL` | Hub Server WebSocket 地址 |
| `DEBUG` | 启用调试日志 |

## 依赖关系

```
logger.ts ← env.ts
    ↓
transporter.ts ← env.ts
    ↓
registry.ts ← types/, utils/serialize-feature.ts
```

- 被 `plugin.ts` 组合使用
