// Client for writing enquiry leads into Twenty CRM (https://twenty.com).
// Returns early with no network call when TWENTY_API_URL / TWENTY_API_KEY
// are unset, so local dev and any deploy before the fund's Twenty
// workspace exists run in email-only fallback (see src/lib/notify.ts).
//
// Twenty's REST API is generated dynamically from each workspace's schema:
// requests are `POST {TWENTY_API_URL}/rest/{plural-object-name}` with an
// `Authorization: Bearer {TWENTY_API_KEY}` header, responses wrapped as
// `{ data: { create<Object>: {...} } }`.
import type { EnquiryInput } from './enquiry-schema';

export class TwentyError extends Error {
	constructor(
		message: string,
		readonly cause?: unknown
	) {
		super(message);
		this.name = 'TwentyError';
	}
}

function splitName(fullName: string): { firstName: string; lastName: string } {
	const trimmed = fullName.trim();
	const spaceIndex = trimmed.indexOf(' ');
	if (spaceIndex === -1) {
		return { firstName: trimmed, lastName: '' };
	}
	return {
		firstName: trimmed.slice(0, spaceIndex),
		lastName: trimmed.slice(spaceIndex + 1),
	};
}

async function twentyRequest<T>(apiUrl: string, apiKey: string, path: string, body: unknown): Promise<T> {
	let response: Response;
	try {
		response = await fetch(`${apiUrl}${path}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${apiKey}`,
			},
			body: JSON.stringify(body),
		});
	} catch (cause) {
		throw new TwentyError(`Could not reach Twenty CRM (${path}).`, cause);
	}

	if (!response.ok) {
		let upstreamText = '';
		try {
			upstreamText = await response.text();
		} catch {
			// best-effort logging only
		}
		console.error(`[twenty] ${path} failed: ${response.status} ${upstreamText}`.slice(0, 2000));
		throw new TwentyError(`Twenty CRM write to ${path} failed with status ${response.status}.`);
	}

	return (await response.json()) as T;
}

/**
 * Creates a Person record for the lead, then a Note containing the
 * enquiry message and type, linked to that Person via a NoteTarget. A
 * no-op (no network call at all) when Twenty is not configured.
 */
export async function createLead(input: EnquiryInput): Promise<void> {
	const apiUrl = process.env.TWENTY_API_URL;
	const apiKey = process.env.TWENTY_API_KEY;
	if (!apiUrl || !apiKey) {
		return;
	}
	const base = apiUrl.replace(/\/+$/, '');

	const { firstName, lastName } = splitName(input.name);

	const personBody: Record<string, unknown> = {
		name: { firstName, lastName },
		emails: { primaryEmail: input.email },
	};

	const personResult = await twentyRequest<{ data: { createPerson: { id: string } } }>(
		base,
		apiKey,
		'/rest/people',
		personBody
	);
	const personId = personResult.data.createPerson.id;

	const noteBody = [
		`Enquiry type: ${input.type}`,
		input.organisation ? `Organisation: ${input.organisation}` : undefined,
		'',
		input.message,
	]
		.filter((line) => line !== undefined)
		.join('\n');

	const noteResult = await twentyRequest<{ data: { createNote: { id: string } } }>(base, apiKey, '/rest/notes', {
		title: `Website enquiry — ${input.type}`,
		body: noteBody,
	});
	const noteId = noteResult.data.createNote.id;

	await twentyRequest(base, apiKey, '/rest/noteTargets', { noteId, personId });
}
