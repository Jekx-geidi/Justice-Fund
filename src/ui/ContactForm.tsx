'use client';
import { useState } from 'react';
import { ArrowUpRight, Check } from 'lucide-react';
export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  return <form className="contact-form" onSubmit={e => { e.preventDefault(); setSubmitted(true); }}>
    <p id="form-note" className="form-note">This form is a preview. Messages are not sent.</p>
    <div className="field"><label htmlFor="name">Name</label><input id="name" name="name" autoComplete="name" placeholder="Your name" required maxLength={150} aria-describedby="form-note" /></div>
    <div className="field"><label htmlFor="email">Email</label><input id="email" name="email" type="email" autoComplete="email" placeholder="you@email.com" required maxLength={254} /></div>
    <div className="field"><label htmlFor="message">Message</label><textarea id="message" name="message" rows={5} placeholder="How can we help?" required maxLength={5000} /></div>
    <button className="button button-dark" type="submit">Send message<ArrowUpRight size={18} aria-hidden="true" /></button>
    <div role="status" className="form-status">{submitted && <><Check size={18} aria-hidden="true" /><span>Preview complete. Your message has not been sent. To get in touch, email <a href="mailto:hello@justicefund.org.au">hello@justicefund.org.au</a>.</span></>}</div>
  </form>;
}
