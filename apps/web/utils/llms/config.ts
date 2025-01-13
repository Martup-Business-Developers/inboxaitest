// First, define the supportsOllama constant
const supportsOllama =
  process.env.NEXT_PUBLIC_OLLAMA_MODEL &&
  (typeof window === "undefined" || // Server-side
    window.location.protocol === "http:" || // HTTP
    window.location.hostname === "localhost" || // Localhost
    window.location.hostname === "127.0.0.1"); // Local IP

export const Provider = {
  OPEN_AI: "openai",
  ANTHROPIC: "anthropic",
  GOOGLE: "google",
  GROQ: "groq",
  ...(supportsOllama ? { OLLAMA: "ollama" } : {}),
};

export const Model = {
  GPT_4O: "gpt-4o",
  GPT_4O_MINI: "gpt-4o-mini",
  CLAUDE_3_5_SONNET_BEDROCK: "anthropic.claude-3-5-sonnet-20241022-v2:0",
  CLAUDE_3_5_SONNET_ANTHROPIC: "claude-3-5-sonnet-20241022",
  GEMINI_1_5_PRO: "gemini-1.5-pro-latest",
  GEMINI_1_5_FLASH: "gemini-1.5-flash-latest",
  GROQ_LLAMA_3_3_70B: "llama-3.3-70b-versatile",
  ...(supportsOllama ? { OLLAMA: process.env.NEXT_PUBLIC_OLLAMA_MODEL || "ollama" } : {}),
};

export const providerOptions: { label: string; value: string }[] = [
  { label: "Anthropic", value: Provider.ANTHROPIC },
  { label: "OpenAI", value: Provider.OPEN_AI },
  { label: "Google", value: Provider.GOOGLE },
  { label: "Groq", value: Provider.GROQ },
  ...(supportsOllama && Provider.OLLAMA
    ? [{ label: "Ollama", value: Provider.OLLAMA }]
    : []),
];

export const modelOptions: Record<string, { label: string; value: string }[]> =
  {
    [Provider.OPEN_AI]: [
      { label: "GPT-4o", value: Model.GPT_4O },
      { label: "GPT-4o Mini", value: Model.GPT_4O_MINI },
    ],
    [Provider.ANTHROPIC]: [
      {
        label: "Claude 3.5 Sonnet",
        value: "claude-3-5-sonnet",
      },
    ],
    [Provider.GOOGLE]: [
      {
        label: "Gemini 1.5 Pro",
        value: Model.GEMINI_1_5_PRO,
      },
      {
        label: "Gemini 1.5 Flash",
        value: Model.GEMINI_1_5_FLASH,
      },
    ],
    [Provider.GROQ]: [
      {
        label: "Groq Llama 3.3 70B",
        value: Model.GROQ_LLAMA_3_3_70B,
      },
    ],
    ...(Provider.OLLAMA && Model.OLLAMA
      ? {
          [Provider.OLLAMA]: [
            {
              label: "Ollama",
              value: Model.OLLAMA,
            },
          ],
        }
      : {}),
  };
