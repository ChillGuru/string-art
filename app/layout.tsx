import Header from '@/components/header'
import '/styles/globals.scss'
import Footer from '@/components/footer'

export const metadata = {
  title: 'Web-generator',
  description: 'String art application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body>
        <Header />
        <main>{children}</main> 
        <Footer />
      </body>
    </html>
  )
}
