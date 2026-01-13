# Schemas 模块

基于 Zod 的运行时校验 Schema，与 `types/` 模块一一对应。

## 模块列表

| 文件 | 说明 |
|------|------|
| `common.ts` | I18n 词条校验 |
| `definition.ts` | 插件与功能定义校验 |
| `node-property.ts` | 节点属性校验 |
| `node-property-ui.ts` | UI 组件属性校验 |

## 设计原则

每个 Schema 都使用 `IsEqual` 类型断言确保与对应 TypeScript 类型保持同步：

```typescript
{
  const _: IsEqual<z.infer<typeof SomeSchema>, SomeType> = true
}
```

## common.ts

### I18nEntrySchema

自定义校验器，验证 I18n 文本对象：
- 必须是普通对象
- 必须包含 `en_US` 键
- 语言代码格式：`<语言>_<地区/脚本>`

## definition.ts

### BaseDefinitionSchema

功能定义的基础校验：
- `name`: 4-64 字符，字母开头，支持字母/数字/`_`/`-`

### PluginDefinitionSchema

插件专属字段：`author`, `email`, `repo`, `version`, `locales`

### CredentialDefinitionSchema / DataSourceDefinitionSchema

继承基础定义，无额外字段

### ModelDefinitionSchema

AI 模型定义：
- `name`: 格式为 `provider/model_name`
- `model_type`: 目前仅支持 `"llm"`
- `input_modalities` / `output_modalities`: 支持的输入输出类型
- `pricing`: 定价信息
- `override_parameters`: 参数默认值覆盖
- `unsupported_parameters`: 不支持的参数声明

### ToolDefinitionSchema

工具定义：包含 `invoke` 异步函数

## node-property.ts

### NodePropertiesSchema

属性数组校验，自动检测重复的 `name`。

### NodePropertySchema

联合类型校验，根据 `type` 字段判断类型：
- `string` / `number` / `integer` / `boolean`
- `array` / `object`
- `credential_id` / `encrypted_string`

### DiscriminatedUnionSchema

鉴别联合类型校验：
- `any_of` 至少包含 2 个对象类型
- 每个对象必须包含 `discriminator` 字段
- 鉴别值必须唯一

## node-property-ui.ts

### UI 组件 Schema

使用 `z.discriminatedUnion` 根据 `component` 字段区分：

```typescript
NodePropertyUIPropsSchema = z.discriminatedUnion("component", [
  NodePropertyUIInputPropsSchema,
  NodePropertyUITextareaPropsSchema,
  // ...更多组件
])
```

### 按类型分组的 Schema

| Schema | 适用类型 |
|--------|----------|
| `NodePropertyUIBooleanSchema` | boolean |
| `NodePropertyUINumberSchema` | number/integer |
| `NodePropertyUIStringSchema` | string |
| `NodePropertyUIArraySchema` | array |
| `NodePropertyUIObjectSchema` | object |
| `NodePropertyUICredentialIdSchema` | credential_id |

## 依赖关系

```
common.ts (I18nEntrySchema)
    ↓
node-property-ui.ts
    ↓
node-property.ts
    ↓
definition.ts
```

- `schemas.ts`（根目录）统一导出所有 Schema
- 被 `plugin.ts` 用于验证功能定义
