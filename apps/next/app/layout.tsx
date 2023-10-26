import Header from '../components/Header';
import '../styles/globals.scss';
import Footer from '../components/Footer';

export const metadata = {
  title: 'Web-generator',
  description: 'String art application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>
        <div className="container">
          <Header />
          {children}
          <Footer />
        </div>
      </body>
    </html>
  );
}
