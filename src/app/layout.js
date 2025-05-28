// src/app/layout.js
import 'bootstrap/dist/css/bootstrap.min.css'; // Make sure this is imported
import './globals.css';
import 'bootstrap-icons/font/bootstrap-icons.css'; 

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}