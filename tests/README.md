# tests

测试目录，包含所有单元测试和集成测试。

## 测试结构

### `core/`
核心模块的测试，参见 [core/README.md](./core/README.md)。

当前重点覆盖：
- `registry.test.ts` - 注册表注册、解析、序列化
- `transporter.test.ts` - Phoenix 连接与清理逻辑
- `hub.test.ts` - Hub call RPC、超时、push error、dispose
- `context.test.ts` - `PluginContext.files` 的解析、下载、上传、`prefixKey`

### `utils/`
工具函数的测试，参见 [utils/README.md](./utils/README.md)。

当前重点覆盖：
- `serialize-feature.test.ts` - 功能定义序列化
- `serialize-error.test.ts` - 错误对象序列化
- `parse-file-refs.test.ts` - 参数中的 `file_ref` 递归解析

### `env.test.ts`
环境变量模块的测试：

- `HUB_WS_URL` 验证（ws:// 和 wss://）
- `HUB_MODE` / `DEBUG` 的解析和转换
- 环境变量缓存机制
- 错误处理和进程退出

## 测试框架

项目使用 **Bun** 作为测试运行器和运行时环境。

**运行测试：**
```bash
bun test
```

## 测试覆盖

- ✅ 注册表功能（注册、解析、序列化）
- ✅ 传输器功能（连接、事件处理、清理）
- ✅ Hub call RPC（response / error / timeout / dispose）
- ✅ PluginContext 文件能力（parse / attach / download / upload）
- ✅ 环境变量管理
- ✅ 功能序列化工具
- ✅ 错误序列化与 `file_ref` 递归解析
