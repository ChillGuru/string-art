import Footer from '@/components/Footer';

import '@/styles/globals.scss';
import { MainHeader } from 'ui';

export const metadata = {
  title: 'String Art',
  description: '',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='ru'>
      <body>
        <div className='container'>
          <MainHeader />
          {children}
          <Footer />
        </div>
      </body>
    </html>
  );
}
