const z = require('zod')

// Single snippet>
export const snippetSchemaVsCode = z.object({
  scope: z.string().optional(), // if missing, snippet applies to all language modes
  prefix: z.string(),
  body: z.array(z.string()).min(1),
  description: z.string().optional(),
})

// Full .code-snippets file
export const snippetsShemaVsCode = z.record(snippetSchemaVsCode)
