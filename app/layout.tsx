// app/layout.tsx

import './globals.css';
import type { Metadata } from 'next'; 
import React from 'react'; // 导入 React 以使用其类型定义

const inter = {
    className: 'font-sans', // 使用 Tailwind CSS 的默认字体类
};

export const metadata: Metadata = {
  title: 'YouTube Trending Dashboard',
  description: 'Data visualization for YouTube trending data',
};

// === 核心修改: 定义 RootLayoutProps 接口 ===
interface RootLayoutProps {
    children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
    return (
        // 移除了之前的 dark mode setup (如 suppressHydrationWarning)，确保简洁。
        <html lang="en"> 
            <body className={inter.className}>
                {children}
            </body>
        </html>
    );
}