import Footer from '../Footer';
import Header from '../Header';

import '@/styles/globals.scss';

interface Props {
    children: React.ReactNode;
}

const Layout: React.FunctionComponent<Props> = (props: Props) => {
    const { children } = props;
    return (
      <html lang='ru'>
        <body>
          <div className='container'>
            <Header />
            { children }
            <Footer />
          </div>
        </body>
      </html>
    );

};

export default Layout;
