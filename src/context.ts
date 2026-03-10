import { FileRefSchema } from "@choiceopen/atomemo-plugin-schema/schemas"
import type { PluginContext } from "@choiceopen/atomemo-plugin-schema/types"
import type { HubCaller } from "./hub"

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

  return {
    files: {
      parseFileRef(input) {
        return FileRefSchema.parse(input)
      },
      attachRemoteUrl,
      download,

      async upload(_input) {
        throw new Error("upload is not implemented yet")
      },
    },
  }
}
