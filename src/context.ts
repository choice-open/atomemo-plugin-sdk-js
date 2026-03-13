import { FileRefSchema } from "@choiceopen/atomemo-plugin-schema/schemas"
import type { PluginContext } from "@choiceopen/atomemo-plugin-schema/types"
import type { HubCaller } from "./hub"

function inferMimeType(extension: string | null | undefined) {
  const type = Bun.file(`file${extension ?? ""}`).type

  return type.split(";")[0] || "application/octet-stream"
}

export function createPluginContext(hubCaller: HubCaller): PluginContext {
  const attachRemoteUrl: PluginContext["files"]["attachRemoteUrl"] = async (fileRef) => {
    if (fileRef.remote_url) {
      return {
        ...fileRef,
        remote_url: fileRef.remote_url,
      }
    }

    const response = await hubCaller.call<{ url: string }>("get_file_url", {
      res_key: fileRef.res_key,
    })

    return {
      ...fileRef,
      remote_url: response.url,
    }
  }

  const download: PluginContext["files"]["download"] = async (fileRef) => {
    if (fileRef.source === "mem") return fileRef

    const fileRefWithRemoteUrl = await attachRemoteUrl(fileRef)
    const response = await fetch(fileRefWithRemoteUrl.remote_url)
    const content = Buffer.from(await response.arrayBuffer()).toString("base64")

    return {
      ...fileRefWithRemoteUrl,
      content,
    }
  }

  const upload: PluginContext["files"]["upload"] = async (input, options) => {
    const fileRef = FileRefSchema.parse(input)

    if (fileRef.source === "oss") {
      return fileRef
    }

    const content = fileRef.content ?? ""
    const mimeType = fileRef.mime_type || inferMimeType(fileRef.extension)
    const payload = {
      extension: fileRef.extension,
      prefixKey: options?.prefixKey,
    }

    const { presigned_url, res_key } = await hubCaller.call<{
      presigned_url: string
      res_key: string
    }>("get_upload_url", payload)

    const response = await fetch(presigned_url, {
      method: "PUT",
      body: Buffer.from(content, "base64"),
      headers: {
        "content-type": mimeType,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to upload file: ${response.status} ${response.statusText}`.trim())
    }

    return {
      ...fileRef,
      source: "oss",
      content: null,
      size: Buffer.from(content, "base64").byteLength,
      res_key,
      remote_url: null,
    }
  }

  return {
    files: {
      parseFileRef(input) {
        return FileRefSchema.parse(input)
      },
      attachRemoteUrl,
      download,
      upload,
    },
  }
}
