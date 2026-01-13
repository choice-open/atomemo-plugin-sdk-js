# Tests 模块

项目单元测试，使用 [Bun Test](https://bun.sh/docs/cli/test) 运行。

## 目录结构

| 目录/文件 | 说明 |
|-----------|------|
| [`core/`](./core/OVERVIEW.md) | 核心模块测试 |
| [`utils/`](./utils/OVERVIEW.md) | 工具函数测试 |
| `env.test.ts` | 环境变量模块测试 |

## 运行测试

```bash
bun test --dots
```

## env.test.ts

测试环境变量验证逻辑：

### EnvSchema 验证

- ✅ 有效的 `ws://` / `wss://` URL
- ✅ 拒绝非 WebSocket URL
- ✅ 拒绝无效 URL
- ✅ 必填字段验证

### DEBUG 字段

- ✅ 未设置时根据 NODE_ENV 推断
- ✅ `"true"` 大小写不敏感
- ✅ 其他值视为 false

### getEnv() 函数

- ✅ 返回解析后的环境变量
- ✅ 结果缓存
- ✅ 验证失败时调用 `process.exit(1)`

## 测试健康状况

| 状态 | 测试 |
|------|------|
| ✅ 正常 | `env.test.ts` |
| ✅ 正常 | `utils/serialize-feature.test.ts` |
| ✅ 正常 | `core/transporter.test.ts` |
| ✅ 正常 | `core/registry.test.ts` |

所有测试文件均已更新并正常工作。
