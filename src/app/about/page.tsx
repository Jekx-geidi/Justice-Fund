import { EditorialArt, FocusCards, PageIntro } from '@/ui/Editorial';
import { collaboration, introduction, mission } from '@/content/site';
export const metadata = { title: 'About' };
export default function About() {
  return <><section className="wrap section"><PageIntro eyebrow="ABOUT US" title="Standing between short-term decisions and long-term harm." /><div className="about-grid"><div><p className="lead">{introduction}</p><div className="about-art"><EditorialArt compact /></div></div><div className="about-body"><span className="small-rule" /><p>{mission} {collaboration}</p></div></div></section><section className="section paper"><div className="wrap"><div className="section-heading"><p className="eyebrow">OUR FOCUS</p><h2>Our work is anchored in three complementary focus areas</h2></div><FocusCards /></div></section></>;
}
