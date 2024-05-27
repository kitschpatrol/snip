import { z } from 'zod'

// A simple regex to test for valid file paths (not perfect, but demonstrates the concept)

export const filePath = z.string().min(1).url()

export const snipSchema = z.object({
	all: z.boolean(), // Flag special case for all extensions
	body: z.string().min(1),
	description: z.string().optional(),
	extensions: z.array(z.string().min(1)).optional(),
	prefix: z.optional(z.string().min(1)), // Note that this is optional! TODO is a filename just a description, or a prefix?
})

export const snipsSchema = z.array(snipSchema)

export const editors = z.enum(['vscode', 'xcode', 'shell', 'sublime'])
