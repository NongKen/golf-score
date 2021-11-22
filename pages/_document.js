import Document, { Head, Main, NextScript } from 'next/document'

export default class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx)
    return { ...initialProps }
  }

  render() {
    const { NEXT_PUBLIC_LEAGUE } = process.env
    return (
      <html>
        <Head>
          <title>Golf Scores</title>
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
          <style>{`body { margin: 0 }`}</style>
          <script
            dangerouslySetInnerHTML={{
              __html: `window.NEXT_PUBLIC_LEAGUE = ${JSON.stringify(NEXT_PUBLIC_LEAGUE)}`
            }}
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </html>
    )
  }
}
