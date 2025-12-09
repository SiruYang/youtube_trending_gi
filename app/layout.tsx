// src/app/layout.js

import './globals.css'; // 确保你的全局样式导入
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'GI YouTube Trending Dashboard',
  description: 'Genshin Impact YouTube Trending Dashboard with Filtering and Search.',
};

export default function RootLayout({ children }) {
  // 核心：添加 data-theme 属性用于管理夜间模式状态
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {/*
          Night mode is managed by adding/removing the 'dark' class on the HTML tag.
          The actual switch button logic is placed in the VideoFilterList component.
        */}
        {children}
      </body>
    </html>
  );
}
