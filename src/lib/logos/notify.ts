// Enquiry alert email via AgentMail's REST API
// (https://docs.agentmail.to/api-reference/inboxes/messages/send):
//   POST {AGENTMAIL_BASE_URL}/v0/inboxes/{inbox_id}/messages/send
//   Authorization: Bearer {AGENTMAIL_API_KEY}
//   body: { to, subject, text, html }
import type { EnquiryInput } from './enquiry-schema';

const AGENTMAIL_BASE_URL = 'https://api.agentmail.to';

export class NotifyConfigError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'NotifyConfigError';
	}
}

function escapeHtml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

function buildMessage(input: EnquiryInput) {
	const subject = `New ${input.type} enquiry — ${input.name}`;
	const lines = [
		`Name: ${input.name}`,
		`Organisation: ${input.organisation || '(not provided)'}`,
		`Email: ${input.email}`,
		`Type: ${input.type}`,
		'',
		'Message:',
		input.message,
	];
	const text = lines.join('\n');
	const html = `<p><strong>Name:</strong> ${escapeHtml(input.name)}</p>
<p><strong>Organisation:</strong> ${escapeHtml(input.organisation || '(not provided)')}</p>
<p><strong>Email:</strong> ${escapeHtml(input.email)}</p>
<p><strong>Type:</strong> ${escapeHtml(input.type)}</p>
<p><strong>Message:</strong></p>
<p>${escapeHtml(input.message).replace(/\n/g, '<br>')}</p>`;
	return { subject, text, html };
}

/**
 * Sends the enquiry alert email. Throws NotifyConfigError if
 * AGENTMAIL_API_KEY / AGENTMAIL_FROM_INBOX / ENQUIRY_ALERT_TO are unset —
 * unlike Twenty, this is the only notification channel, so callers should
 * treat a missing config as a real problem worth logging loudly.
 */
export async function sendEnquiryAlert(input: EnquiryInput): Promise<void> {
	const apiKey = process.env.AGENTMAIL_API_KEY;
	const fromInbox = process.env.AGENTMAIL_FROM_INBOX;
	const to = process.env.ENQUIRY_ALERT_TO;
	if (!apiKey || !fromInbox || !to) {
		throw new NotifyConfigError(
			'Enquiry alerting is not configured: set AGENTMAIL_API_KEY, AGENTMAIL_FROM_INBOX, and ENQUIRY_ALERT_TO.'
		);
	}

	const { subject, text, html } = buildMessage(input);

	const response = await fetch(`${AGENTMAIL_BASE_URL}/v0/inboxes/${encodeURIComponent(fromInbox)}/messages/send`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${apiKey}`,
		},
		body: JSON.stringify({
			to: [to],
			subject,
			text,
			html,
		}),
	});

	if (!response.ok) {
		let upstreamText = '';
		try {
			upstreamText = await response.text();
		} catch {
			// best-effort logging only
		}
		throw new Error(`AgentMail enquiry alert failed: ${response.status} ${upstreamText}`.slice(0, 2000));
	}
}
