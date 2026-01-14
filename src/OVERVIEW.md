# Source 模块

插件 SDK 的源代码根目录。

## 目录结构

| 目录/文件 | 说明 |
|-----------|------|
| [`core/`](./core/OVERVIEW.md) | 核心运行时（注册表、传输层、日志） |
| [`schemas/`](./schemas/OVERVIEW.md) | Zod 运行时校验 Schema |
| [`types/`](./types/OVERVIEW.md) | TypeScript 类型定义 |
| [`utils/`](./utils/OVERVIEW.md) | 工具函数 |
| `env.ts` | 环境变量配置 |
| `index.ts` | 主入口 |
| `plugin.ts` | 插件工厂函数 |
| `schemas.ts` | Schema 统一导出 |
| `types.ts` | 类型统一导出 |

## 入口文件

### index.ts

SDK 主入口，导出 `createPlugin` 函数：

```typescript
import "dotenv/config"
export { createPlugin } from "./plugin"
```

### schemas.ts / types.ts

分别统一导出 `schemas/` 和 `types/` 目录下的所有模块。

## env.ts

环境变量管理，使用 Zod 验证：

| 变量 | 类型 | 说明 |
|------|------|------|
| `HUB_SERVER_WS_URL` | `ws://` 或 `wss://` URL | Hub Server 地址 |
| `DEBUG` | boolean | 调试模式（非生产环境默认开启） |
| `NODE_ENV` | `development` / `production` / `test` | 运行环境 |

### getEnv()

单例模式获取已验证的环境变量，验证失败时直接终止进程。

## plugin.ts

插件工厂函数，SDK 的核心 API。

### createPlugin(options)

创建插件实例，返回：

```typescript
{
  addCredential(credential: CredentialDefinition): void
  addTool(tool: ToolDefinition): void
  addModel(model: ModelDefinition): void
  run(): void
}
```

### 工作流程

1. 创建 Registry 注册表
2. 创建 Transporter 传输层
3. 提供 `add*` 方法注册功能
4. `run()` 启动插件：
   - 连接到 Hub Server
   - 发送序列化的注册表
   - 监听并响应工具调用请求
   - 处理进程信号（SIGINT/SIGTERM）
