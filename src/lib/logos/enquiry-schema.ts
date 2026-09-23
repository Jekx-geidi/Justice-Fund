// Validation schema for enquiry submissions. The TypeScript type is inferred
// from this schema, not hand-maintained separately.
import { z } from 'zod';

export const ENQUIRY_TYPES = ['media', 'partnership', 'legal', 'general'] as const;

export const enquirySchema = z.object({
	name: z
		.string({ error: 'Name is required.' })
		.trim()
		.min(2, 'Name must be at least 2 characters.')
		.max(100, 'Name is too long.'),
	organisation: z.string().trim().max(120, 'Organisation is too long.').optional().or(z.literal('')),
	email: z
		.string({ error: 'Email address is required.' })
		.trim()
		.toLowerCase()
		.pipe(z.email('Enter a valid email address.')),
	type: z.enum(ENQUIRY_TYPES, { error: 'Choose an enquiry type.' }),
	message: z
		.string({ error: 'Message is required.' })
		.trim()
		.min(10, 'Message must be at least 10 characters.')
		.max(4000, 'Message is too long — please keep it under 4000 characters.'),
	// Honeypot: a real visitor never fills this in. The route (not this
	// schema) checks it before validation and returns a bot-invisible 200
	// when it's filled, so this field just needs to type-check here —
	// keeping it a strict-empty literal would 400 (and tip off) a bot
	// instead of silently no-opping.
	website: z.string().optional(),
	// Epoch-ms timestamp of when the form was rendered. The route (not this
	// schema) checks `Date.now() - startedAt >= 3000` against it, because
	// that check needs "now", which a static schema can't evaluate.
	startedAt: z.number({ error: 'Missing form timing data.' }),
});

export type EnquiryInput = z.infer<typeof enquirySchema>;

export type EnquiryFieldErrors = Partial<Record<keyof EnquiryInput, string>>;

export function formatEnquiryErrors(error: z.ZodError<EnquiryInput>): EnquiryFieldErrors {
	const fieldErrors: EnquiryFieldErrors = {};
	for (const issue of error.issues) {
		const field = issue.path[0] as keyof EnquiryInput | undefined;
		if (field && !fieldErrors[field]) {
			fieldErrors[field] = issue.message;
		}
	}
	return fieldErrors;
}

/**
 * Shared validation entry point for the client. The contact page runs this
 * before it posts, so the visitor gets per-field errors without a round
 * trip and the browser can never disagree with the route about what is
 * valid — both sides parse the same schema. The timing and honeypot spam
 * checks stay server-side, where they belong.
 */
export function validateEnquiry(
	input: unknown
): { success: true } | { success: false; fieldErrors: EnquiryFieldErrors } {
	const result = enquirySchema.safeParse(input);
	if (result.success) return { success: true };
	return {
		success: false,
		fieldErrors: formatEnquiryErrors(result.error as z.ZodError<EnquiryInput>),
	};
}
