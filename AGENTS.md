# Agent 开发指南

本指南帮助 AI 编程代理在此代码库中高效工作。

## 基本命令

```bash
# 构建项目（输出到 dist/）
bun run build

# 开发模式（监听文件变化）
bun run dev

# 代码检查和自动修复
bun run check

# 类型检查
bun run typecheck

# 运行所有测试
bun run test

# 运行单个测试文件
bun test path/to/test.test.ts

# 运行匹配模式的测试
bun test -t "test name"
```

**提交更改前**：运行 `bun run check`、`bun run typecheck` 和 `bun run build` 以确保代码质量。

## 代码风格指南

### 格式化（Biome + EditorConfig）
- **缩进**：2 个空格
- **行宽**：100 个字符
- **分号**：按需使用（仅在需要时）
- **行尾符**：LF
- **字符集**：UTF-8
- **尾随空格**：保留（EditorConfig 设置）
- **末尾换行**：保留（EditorConfig 设置）

### 导入
- 使用 ES6 模块导入（除 chalk、z 外不使用默认导出/导入）
- 分组导入：先依赖项，后本地模块
- 使用 `export * from` 导出桶文件（如 types.ts、schemas.ts）
- 始终使用命名导出/导入

```typescript
import chalk from "chalk"
import z from "zod"
import { getEnv } from "./env"
import type { PluginDefinition } from "./types"
```

### TypeScript
- **严格模式**已启用
- **模块系统**：ESM（package.json 中 `"type": "module"`）
- **目标**：ESNext 配合 ES2023 库
- 使用 **Zod** 进行运行时验证和模式定义
- 使用 **z.infer<typeof Schema>** 从模式派生类型
- 使用 **type-fest** 获取高级工具类型（Simplify、IsEqual）
- 使用 **es-toolkit** 获取工具函数（isNil、assert 等）
- 使用 **Pino** 进行结构化日志记录

### 命名约定
- **变量/函数**：camelCase（`createPlugin`、`registry`）
- **类型/接口**：PascalCase（`PluginDefinition`、`CredentialDefinition`）
- **常量**：环境变量使用 SCREAMING_SNAKE_CASE（`HUB_SERVER_WS_URL`）
- **复合属性**：领域概念使用 snake_case（`display_name`、`data_source`）
- **模式**：PascalCase 以 `Schema` 结尾（`BaseDefinitionSchema`）

### 错误处理
- 使用 **Zod 模式验证**配合 `.parse()` 进行运行时验证
- 使用 es-toolkit 的 **assert()** 检查预期条件
- 使用 **process.exit(1)** 处理致命错误（如环境变量验证失败）
- 使用 **try-finally** 进行清理操作
- 在测试中，测试致命错误时 mock `process.exit`

```typescript
// 模式验证
const definition = ToolDefinitionSchema.parse(tool)

// 预期条件断言
assert(feature, `Feature "${featureName}" not registered`)

// 致命错误处理
if (!result.success) {
  console.error(z.prettifyError(result.error))
  process.exit(1)
}
```

### 日志
- 使用 `./core/logger` 中的 **Pino** logger
- 创建带上下文的子 logger：`const log = logger.child({ name: "Phoenix" })`
- 日志级别：调试模式下为 trace，生产环境为 error
- 需要时使用 `chalk` 为控制台输出着色

### 测试
- 使用 **Bun 测试运行器**配合 `--dots` 标志
- 测试文件位于 `tests/` 目录，镜像 `src/` 结构
- 使用 **describe/test** 模式和 **expect** 断言
- 使用 **beforeEach** 进行设置和清理
- Mock 外部依赖（process.exit、console.error）
- 当函数调用 `process.exit()` 时，直接测试模式

```typescript
import { beforeEach, describe, expect, test } from "bun:test"

describe("registry", () => {
  let registry: ReturnType<typeof createRegistry>

  beforeEach(() => {
    registry = createRegistry(mockPlugin)
  })

  test("should register a tool successfully", () => {
    expect(() => registry.register("tool", tool)).not.toThrow()
  })
})
```

### 文档
- 为所有公共函数和接口使用 **JSDoc** 注释
- 包含 `@param`、`@returns` 和 `@throws` 文档
- 仅对复杂逻辑添加描述性注释

### 模式和类型
- 在 `src/schemas/` 中定义 **Zod 模式**，与 TypeScript 类型并排
- 使用 `IsEqual` 进行类型断言，确保模式与类型匹配
- 使用 `...BaseDefinitionSchema.shape` 进行组合
- 使用 `z.literal`、`z.enum`、`z.object` 进行精确验证
- 为模式字段添加 `meta()` 描述

### 项目结构
- `src/core/`：核心功能（logger、registry、transporter）
- `src/types/`：TypeScript 类型定义
- `src/schemas/`：Zod 模式定义
- `src/utils/`：工具函数
- `tests/`：镜像 src 结构的测试文件

### 最佳实践
- 使用 **函数重载**实现类型安全的字符串鉴别器 API
- 使用 **Map** 进行基于名称查找的注册表
- 使用 **Object.assign()** 进行对象组合
- 避免使用 `any`；优先使用 `unknown` 或具体类型
- 谨慎添加 biome 忽略注释并指定具体规则：`// biome-ignore lint/suspicious/noExplicitAny: reason`
- 使用**描述性错误消息**以更好地调试
