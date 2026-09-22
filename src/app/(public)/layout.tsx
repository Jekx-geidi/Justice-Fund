import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import Header from '@/ui/Header';
import { Footer } from '@/ui/Editorial';
import { getPublicNavigation, getSiteContent } from '@/lib/content/content';

export default async function PublicLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [navigation, live] = await Promise.all([getPublicNavigation(), getSiteContent('live')]);
  const contactPage = live.pages.find((page) => page.coreKey === 'contact');

  return (
    <div className="site-public">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header navigation={navigation} />
      <main id="main" tabIndex={-1}>
        {children}
      </main>
      <Footer
        navigation={navigation}
        email={contactPage?.contact?.email ?? 'hello@justicefund.org.au'}
        location={contactPage?.contact?.location ?? 'Perth, WA'}
      />
    </div>
  );
}
