import './globals.css';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS

export const metadata = {
  title: 'Gemini Assistant',
  description: 'Your AI powered assistant',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* TEMPORARY: Bootstrap Icons CDN for testing */}
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />
      </head>
      {/* Apply Bootstrap's dark background and light text classes to the body */}
      <body className="bg-dark text-light"> 
        {children}
      </body>
    </html>
  );
}