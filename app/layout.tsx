import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StoryArchive - 트위터 창작물 아카이브",
  description: "트위터 연재물을, 웹소설처럼 읽는다",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
