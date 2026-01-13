# Core 测试模块

`src/core/` 模块的单元测试。

## 测试文件

| 文件 | 测试目标 |
|------|----------|
| `registry.test.ts` | Registry 注册表 |
| `transporter.test.ts` | Transporter 传输层 |

## transporter.test.ts

使用 Bun 的 mock 系统模拟 Phoenix Socket：

### 测试覆盖

- ✅ Socket 创建与配置
- ✅ 自定义 heartbeatIntervalMs
- ✅ 事件处理器（onOpen/onClose/onError/onMessage）
- ✅ 频道连接（join/leave）
- ✅ 资源释放（dispose）

### Mock 策略

```typescript
mock.module("phoenix", () => ({
  Socket: MockSocket,
  Channel: class {},
  Push: class {},
}))
```

## registry.test.ts

测试 Registry 注册表的核心功能：

### 测试覆盖

- ✅ `register()` - 注册各种类型的 feature（credential, tool, model, data_source）
- ✅ `resolve()` - 解析已注册的 feature
- ✅ `serialize()` - 序列化注册表为 JSON 格式
- ✅ 错误处理 - 未注册 feature 的解析错误
- ✅ 功能覆盖 - 同名 feature 覆盖、不同类型同名 feature 共存
