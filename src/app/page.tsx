import { EditorialArt, FocusCards, TextLink } from '@/ui/Editorial';
import { introduction, mission, quotes } from '@/content/site';
export default function Home() {
  return <>
    <section className="home-hero"><div className="wrap hero-grid"><div className="hero-copy"><p className="eyebrow">A NOT-FOR-PROFIT CHARITY</p><h1>Intergenerational<br /><span>Justice Fund<span className="gold">.</span></span></h1><div className="hero-rule" /><p className="lead">{mission}</p></div><EditorialArt /></div><div className="wrap hero-foot"><span>LAW · RESEARCH · ADVOCACY</span><span>PUBLIC BENEFIT. LONG-TERM IMPACT.</span></div></section>
    <section className="section wrap story-grid"><div><p className="eyebrow">ABOUT US</p><h2>Standing between short-term decisions and <span className="muted">long-term harm.</span></h2></div><div className="story-copy"><p className="lead">{introduction}</p><TextLink href="/about">About IEJF</TextLink></div></section>
    <section className="paper section"><div className="wrap"><div className="section-heading"><p className="eyebrow">OUR FOCUS</p><h2>Our work is anchored in three complementary focus areas</h2></div><FocusCards /></div></section>
    <section className="section wrap news-section"><div className="section-heading news-heading"><p className="eyebrow">IN THE NEWS</p><h2>In the news<span className="gold">.</span></h2><span className="placeholder-badge">Placeholder quotes</span></div><div className="quote-grid">{quotes.map(quote => <figure className="quote-card" key={quote.attribution}><span className="quote-symbol" aria-hidden="true">“</span><blockquote>{quote.text}</blockquote><figcaption>{quote.attribution}<span>PLACEHOLDER · NOT VERIFIED COVERAGE</span></figcaption></figure>)}</div></section>
    <section className="home-cta"><div className="wrap cta-grid"><div><p className="eyebrow">INTERGENERATIONAL JUSTICE</p><h2>Help us act for the generations who aren’t in the room yet.</h2></div><div><p>Your support funds the legal work, research and advocacy that protects the environment for the long term.</p><button className="button button-gold" disabled aria-describedby="donation-note">Donate now</button><p id="donation-note" className="cta-note">Donations are not available in this preview.</p></div></div></section>
    <p className="identity-line wrap">Intergenerational Environment Justice Fund (ABN 51 656 623 719)</p>
  </>;
}
