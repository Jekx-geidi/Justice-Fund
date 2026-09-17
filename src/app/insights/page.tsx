import { PageIntro } from '@/ui/Editorial';
import Image from 'next/image';
export const metadata = { title: 'Insights' };
export default function Insights() {
  return <section className="wrap section insights-page"><PageIntro eyebrow="INSIGHTS" title="Case updates and our environmental focus, in one place." /><div className="notice"><span className="placeholder-badge">Placeholder page</span><p>IEJF has asked to leave this blank for now.</p></div><article className="insight-feature"><div className="insight-visual"><Image src="/images/insights.webp" alt="Two lawyers and a client reviewing legal documents at a desk; temporary stock photograph." fill sizes="(max-width: 699px) 90vw, 40vw" /></div><div className="insight-copy"><p className="eyebrow">EXAMPLE ENTRY</p><h2>Insights entry title goes here</h2><p>A short summary of a case update, research brief or advocacy item — added and edited by IEJF&apos;s own team once the CMS is live.</p><span className="insight-status">Illustrative entry · Publication pending</span></div></article></section>;
}
