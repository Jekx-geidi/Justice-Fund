import { PageIntro } from '@/ui/Editorial';
import ContactForm from '@/ui/ContactForm';
import { ArrowUpRight } from 'lucide-react';
export const metadata = { title: 'Contact' };
export default function Contact() {
  return <section className="wrap section contact-page"><PageIntro eyebrow="CONTACT" title="Contact" /><div className="contact-grid"><ContactForm /><aside className="contact-details"><p className="eyebrow">CONTACT DETAILS</p><h2>Intergenerational<br />Justice Fund<span className="gold">.</span></h2><div className="contact-location"><span>LOCATION</span><p>Perth, WA</p></div><div className="contact-email"><span>EMAIL</span><a href="mailto:hello@justicefund.org.au">hello@justicefund.org.au<ArrowUpRight size={18} aria-hidden="true" /></a></div><div className="contact-decoration" aria-hidden="true"><span /><span /><span /></div></aside></div></section>;
}
