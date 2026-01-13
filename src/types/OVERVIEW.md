# Types 模块

TypeScript 类型定义，描述插件系统的核心数据结构。

## 模块列表

| 文件 | 说明 |
|------|------|
| `common.ts` | 通用类型（I18n 国际化文本） |
| `definition.ts` | 插件与功能定义类型 |
| `node-property.ts` | 节点属性类型（参数配置） |
| `node-property-ui.ts` | 节点属性 UI 组件类型 |

## common.ts

定义 `I18nText` 接口，用于支持多语言文本。

```typescript
interface I18nText {
  en_US: string  // 必须包含英文
  [locale: `${string}_${string}`]: string | undefined
}
```

## definition.ts

定义插件和功能的核心类型：

| 类型 | 说明 |
|------|------|
| `BaseDefinition` | 所有功能定义的基类 |
| `PluginDefinition` | 插件定义 |
| `CredentialDefinition` | 凭证定义 |
| `DataSourceDefinition` | 数据源定义 |
| `ModelDefinition` | AI 模型定义 |
| `ToolDefinition` | 工具定义（含 invoke 函数） |
| `Feature` | 所有功能类型的联合类型 |

### BaseDefinition 属性

- `name`: 功能名称（符合命名规范）
- `display_name`: 显示名称（I18n）
- `description`: 描述（I18n）
- `icon`: 图标（Emoji 或 URL）
- `parameters`: 参数列表
- `settings`: 可选设置列表

## node-property.ts

定义参数属性的类型系统，支持多种数据类型：

| 类型 | 说明 |
|------|------|
| `NodePropertyString` | 字符串类型 |
| `NodePropertyNumber` | 数字/整数类型 |
| `NodePropertyBoolean` | 布尔类型 |
| `NodePropertyArray` | 数组类型 |
| `NodePropertyObject` | 对象类型（嵌套属性） |
| `NodePropertyCredentialId` | 凭证 ID 引用类型 |
| `NodePropertyEncryptedString` | 加密字符串类型 |
| `DiscriminatedUnion` | 鉴别联合类型（多态数组） |

### 核心概念

- **DisplayCondition**: 基于 MongoDB 查询语法的条件显示控制
- **FilterOperators**: 支持 `$eq`, `$in`, `$gt`, `$regex` 等操作符

## node-property-ui.ts

定义 UI 组件类型，用于渲染参数编辑界面：

| 组件类型 | 适用场景 |
|----------|----------|
| `input` / `textarea` | 文本输入 |
| `number-input` / `slider` | 数值输入 |
| `switch` / `checkbox` | 布尔切换 |
| `select` / `radio-group` / `multi-select` | 选择器 |
| `code-editor` | 代码编辑 |
| `key-value-editor` | 键值对编辑 |
| `credential-select` | 凭证选择 |
| `array-section` / `collapsible-panel` | 容器组件 |

## 依赖关系

```
common.ts
    ↓
definition.ts ← node-property.ts ← node-property-ui.ts
```

- `types.ts`（根目录）统一导出所有类型
- 被 `schemas/` 模块用于类型推断验证
