import Header from '@/ui/Header';
import { Footer } from '@/ui/Editorial';
import { getPublicNavigation } from '@/lib/content/content';

export default async function PublicLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const navigation = await getPublicNavigation();

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header navigation={navigation} />
      <main id="main" tabIndex={-1}>
        {children}
      </main>
      <Footer />
    </>
  );
}
