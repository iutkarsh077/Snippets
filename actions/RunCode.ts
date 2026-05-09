"use server";

import { JUDGE0_LANGUAGE_IDS, LANGUAGE_VERSIONS } from "@/lib/constants";
import axios, { isAxiosError } from "axios";
import { revalidatePath } from "next/cache";

const judge0 = axios.create({
  baseURL: process.env.JUDGE0_API_URL ?? "https://ce.judge0.com",
});

type ExecLanguage = keyof typeof LANGUAGE_VERSIONS;

function normalizeJudge0Output(data: {
  status?: { id?: number; description?: string };
  message?: string | null;
  compile_output?: string | null;
  stderr?: string | null;
  stdout?: string | null;
}) {
  const accepted = data.status?.id === 3;

  if (!accepted) {
    const combined = [
      data.status?.description,
      data.message,
      data.compile_output,
      data.stderr,
      data.stdout,
    ]
      .filter((x) => x != null && String(x).trim() !== "")
      .join("\n");
    return { run: { output: combined || "Execution failed" } };
  }

  const combined = [data.stderr, data.stdout]
    .filter((x) => x != null && String(x).trim() !== "")
    .join("\n");

  return { run: { output: combined || "(no output)" } };
}

export const executeCode = async ({
  language,
  sourceCode,
}: {
  language: ExecLanguage;
  sourceCode: string;
}) => {
  try {
    revalidatePath("/explore/code-editor");

    const languageId = JUDGE0_LANGUAGE_IDS[language];
    if (languageId == null) {
      throw new Error(`Unsupported language: ${String(language)}`);
    }

    const response = await judge0.post(
      "/submissions?base64_encoded=false&wait=true",
      {
        source_code: sourceCode,
        language_id: languageId,
      },
      {
        headers: { "Content-Type": "application/json" },
        validateStatus: (status) => status >= 200 && status < 300,
      }
    );

    return normalizeJudge0Output(response.data);
  } catch (error) {
    console.error("Error executing code:", error);
    if (isAxiosError(error)) {
      const msg = error.response?.data?.message;
      if (typeof msg === "string" && msg.trim()) {
        throw new Error(msg);
      }
    }
    throw new Error("Failed to execute code. Please try again.");
  }
};
