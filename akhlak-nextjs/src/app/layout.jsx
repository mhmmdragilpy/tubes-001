import "./globals.css";

export const metadata = {
  title: "Akhlak 360° | Sistem Penilaian",
  description: "Sistem Penilaian 360° Core Values AKHLAK",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
