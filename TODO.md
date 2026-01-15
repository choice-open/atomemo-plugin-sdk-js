# 待办事项

## 需要修复的问题

- [ ] **资源泄露问题** (`src/core/transporter.ts`:57)
  - `dispose` 函数在离开频道并断开连接后调用了 `process.exit(0)`
  - 这可能会阻止其他资源的正常清理
  - 考虑移除 `process.exit(0)` 或使其可选

- [ ] **错误序列化问题** (`src/plugin.ts`:89)
  - 推送错误响应时使用了展开语法：`{...error}`
  - JavaScript 错误对象使用展开语法无法正确序列化
  - 应该显式使用 `message`、`stack` 等属性：`{ message: error.message, stack: error.stack }`

- [ ] **缺少频道清理** (`src/core/transporter.ts`:73)
  - 超时处理器拒绝了承诺但没有清理频道
  - 应该调用 dispose 函数来正确清理频道

## 改进建议

- [ ] **添加适当的错误序列化** 到 `plugin.ts`
- [ ] **考虑使 process.exit 可配置** 到 transporter
- [ ] **在超时处理器中添加清理** 到 transporter.ts
- [ ] **考虑添加重试逻辑** 用于频道连接