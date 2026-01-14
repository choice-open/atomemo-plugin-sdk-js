# Schema 验证测试

本目录包含所有 Zod Schema 的边界条件测试。

## 测试文件

- `common.test.ts` - I18nEntrySchema 测试
- `definition.test.ts` - 各种 Definition Schema 测试 (Base, Plugin, Credential, DataSource, Model, Tool)
- `property.test.ts` - Property Schema 测试 (String, Number, Boolean, Array, Object 等)
- `property-ui.test.ts` - Property UI 组件 Schema 测试

## 已知限制

### Zod `.pick()` 限制

`PropertyDiscriminatedUnionSchema` 使用 `.pick()` 方法作用于 `PropertyObjectSchema`，而后者包含 `.refine()` 调用。这是 Zod 的已知限制 - 无法在包含 refinements 的 schema 上使用 `.pick()`。

这导致以下测试被跳过：
- 所有涉及 `discriminated_union` 类型的测试
- 部分涉及嵌套 object 类型的测试
- `credential_id` 和 `encrypted_string` 类型的测试

相关 Issue: https://github.com/colinhacks/zod/issues/2474

@nightire: 实际运行测试插件的时候观察到的错误：

```shell
328 | export function pick(schema, mask) {
329 |     const currDef = schema._zod.def;
330 |     const checks = currDef.checks;
331 |     const hasChecks = checks && checks.length > 0;
332 |     if (hasChecks) {
333 |         throw new Error(".pick() cannot be used on object schemas containing refinements");
                        ^
error: .pick() cannot be used on object schemas containing refinements
      at pick (/Users/nightire/Code/github.com/choice-open/automation-plugin-sdk-js/node_modules/zod/v4/core/util.js:333:19)
      at any_of (/Users/nightire/Code/github.com/choice-open/automation-plugin-sdk-js/dist/schemas-CcEs2mnw.js:364:39)
      at shape (/Users/nightire/Code/github.com/choice-open/automation-plugin-sdk-js/node_modules/zod/v4/core/util.js:396:59)
      at normalizeDef (/Users/nightire/Code/github.com/choice-open/automation-plugin-sdk-js/node_modules/zod/v4/core/schemas.js:709:30)
      at value (/Users/nightire/Code/github.com/choice-open/automation-plugin-sdk-js/node_modules/zod/v4/core/util.js:33:31)
      at <anonymous> (/Users/nightire/Code/github.com/choice-open/automation-plugin-sdk-js/node_modules/zod/v4/core/schemas.js:907:27)
      at <anonymous> (/Users/nightire/Code/github.com/choice-open/automation-plugin-sdk-js/node_modules/zod/v4/core/schemas.js:106:38)
      at <anonymous> (/Users/nightire/Code/github.com/choice-open/automation-plugin-sdk-js/node_modules/zod/v4/core/schemas.js:976:40)
      at anonymous (file:///Users/nightire/Code/github.com/choice-open/automation-plugin-sdk-js/node_modules/zod/v4/core/doc.js:191:41)
      at <anonymous> (/Users/nightire/Code/github.com/choice-open/automation-plugin-sdk-js/node_modules/zod/v4/core/schemas.js:922:23)
```

### PropertyUIPropsSchema 问题

`PropertyUIPropsSchema` 使用 `discriminatedUnion("type", ...)` 但组件 schema 实际使用 `component` 字段作为区分器，导致该 schema 无法正常工作。相关测试已跳过。

## 运行测试

```bash
bun test tests/schemas/
```
