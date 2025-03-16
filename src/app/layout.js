import Header from "@/components/common/Header";
import "./globals.css";

export const metadata = {
  title: "Momentum - Task Management",
  description: "A task management application for Redberry",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ka">
      <head>
        <link 
          rel="stylesheet" 
          href="https://free.bboxtype.com/embedfonts/?family=FiraGO:400,500,600,700" 
        />
      </head>
      <body>
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}