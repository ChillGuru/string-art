import '@/styles/globals.scss';
import { Footer } from './Footer';
import { Header } from './Header';

interface Props {
  children: React.ReactNode;
}

export function Layout(props: Props) {
  const { children } = props;
  return (
    <div className='container'>
      <Header />
      {children}
      <Footer />
    </div>
  );
}
