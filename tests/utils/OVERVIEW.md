# Utils 测试模块

`src/utils/` 模块的单元测试。

## 测试文件

| 文件 | 测试目标 |
|------|----------|
| `serialize-feature.test.ts` | `serializeFeature` 函数 |

## serialize-feature.test.ts

测试 Feature 序列化功能：

- ✅ 保留原始值属性
- ✅ 剔除函数属性
- ✅ 处理嵌套对象
- ✅ 处理数组
- ✅ 处理 null/undefined
