# Utils 模块

工具函数集合，提供序列化等辅助功能。

## 模块列表

| 文件 | 说明 |
|------|------|
| `serialize-feature.ts` | Feature 对象序列化工具 |

## serialize-feature.ts

将 Feature 对象序列化为 JSON 兼容格式，**剔除所有函数类型的属性**。

```typescript
serializeFeature(feature: Feature) => Record<string, JsonValue>
```

### 用途

- 在通过 WebSocket 传输 Feature 定义时，需要将其序列化为纯数据对象
- 函数（如 `invoke`）无法通过网络传输，因此在序列化时被排除

### 依赖关系

- 被 `core/registry.ts` 的 `serialize()` 方法调用
- 依赖 `types/definition.ts` 中的 `Feature` 类型
