// app/page.tsx - Server Component

import Link from 'next/link';
// 导入 Client Component
import VideoFilterList from './VideoFilterList'; 

// === 【请用您的 Google App Script URL 替换此行】 ===
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzngmCLQCvJFb-jle7fytMWewoCwN8-2I6-ZCixgtiPZsXU-quUX6QKGLUexlo7UKc1/exec';

// 定义视频数据类型 (推荐使用 TypeScript 接口)
interface VideoData {
  video_id: string;
  published_at: string;
  video_title: string;
  localized_title: string;
  video_url: string;
  video_view_count: number;
  video_comment_count: number;
  video_language: string;
  // 修正后的封面图片字段
  video_thumbnail_url: string; 
  tag: string;
  channel_id: string;
  scrape_timestamp: string;
  region_name: string;
  video_rank: number;
  project_code: string;
  matched_type: string;
  scrape_month?: string; // 预处理后新增的字段
}

// Next.js Server Component - 数据获取函数 (包含去重和预处理逻辑)
async function getVideos(): Promise<VideoData[]> {
  try {
    const response = await fetch(SCRIPT_URL, {
      next: { revalidate: 3600 } 
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }

    const rawData: VideoData[] = await response.json();
    
    // --- 核心逻辑：去重和排名优化 ---
    const bestRankMap = new Map<string, VideoData>();

    rawData.forEach(video => {
      if (!video.video_id || !video.region_name) return;

      const key = `${video.video_id}_${video.region_name}`;
      // 将 null/undefined 排名视为 Infinity
      const currentRank = video.video_rank || Infinity; 
      
      const existingVideo = bestRankMap.get(key);
      
      // 只有当前排名更好 (数值更小) 时才替换
      if (!existingVideo || currentRank < existingVideo.video_rank) {
        // 预处理时间戳，提取 'YYYY-MM' 格式
        video.scrape_month = video.scrape_timestamp 
                               ? video.scrape_timestamp.substring(0, 7)
                               : 'N/A';
        bestRankMap.set(key, video);
      }
    });

    // 返回去重后的视频列表
    return Array.from(bestRankMap.values());

  } catch (error) {
    console.error("Error fetching video data:", error);
    return [];
  }
}

// 主页组件 - 负责获取数据和提取筛选器选项
export default async function HomePage() {
  const videos = await getVideos();

  // 处理数据加载失败的情况 (必须在逻辑的顶层返回)
  if (videos.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="w-full max-w-7xl">
          <header className="py-4 mb-6 md:py-6 md:mb-8 flex justify-center">
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-gray-100">
              GI YouTube Trending Dashboard
            </h1>
          </header>
          <div className="bg-white dark:bg-gray-800 shadow-xl rounded-xl p-6 lg:p-10 mt-10">
            <p className="text-center text-xl text-red-500 dark:text-red-400">
              无法加载数据。请检查 App Script URL 或 JSON 格式。
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 提取唯一的筛选选项供下拉菜单使用 (这部分代码只有在数据加载成功时才执行)
  const uniqueMonths = [...new Set(videos.map(v => v.scrape_month))].sort().filter(m => m !== 'N/A');
  const uniqueRegions = [...new Set(videos.map(v => v.region_name))].sort().filter(r => r);
  const uniqueMatchTypes = [...new Set(videos.map(v => v.matched_type || ''))].sort().filter(t => t !== null);

  const filterOptions = {
    months: uniqueMonths,
    regions: uniqueRegions,
    matchTypes: uniqueMatchTypes
  };

  // 最终成功渲染的组件结构 (你的错误就是在前一个 if return 语句正确闭合后，才允许执行这个 return)
  return (
    // 整体页面样式优化
    <div className="min-h-screen flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="w-full max-w-7xl">
        
        {/* 标题 - 保持不变，已在上面的 header 中实现 */}
        <header className="py-4 mb-6 md:py-6 md:mb-8 flex justify-center">
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-gray-100 transition-colors duration-300">
                GI YouTube Trending Dashboard
            </h1>
        </header>
        
        {/* 将数据和筛选选项传递给 Client Component */}
        <VideoFilterList videos={videos} filterOptions={filterOptions} />
      </div>
    </div>
  );
}