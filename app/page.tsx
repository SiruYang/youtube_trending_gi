// app/page.tsx - Server Component

import Link from 'next/link';
import VideoFilterList from './VideoFilterList'; 
import type { Metadata } from 'next';

// === 完整的地区列表 (硬编码) ===
const FULL_REGION_NAMES = [
    'United States', 'Germany', 'France', 'Mexico', 
    'Brazil', 'Indonesia', 'Japan', 'South Korea', 
    'Taiwan', 'Vietnam', 'United Kingdom', 'Thailand', 
    'United Arab Emirates', 'Saudi Arabia', 'Qatar', 'Singapore', 'Philippines', 'Hong Kong' // 新增的地区
].sort(); // 保持排序

// === 请用您的 Google App Script URL 替换此行 ===
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzngmCLQCvJFb-jle7fytMWewoCwN8-2I6-ZCixgtiPZsXU-quUX6QKGLUexlo7UKc1/exec';

// 定义视频数据类型
interface VideoData {
  video_id: string;
  published_at: string;
  video_title: string;
  localized_title: string;
  video_url: string;
  video_view_count: number;
  video_comment_count: number;
  video_language: string;
  video_thumbnail_url: string; 
  tag: string;
  channel_id: string;
  scrape_timestamp: string;
  region_name: string;
  video_rank: number;
  project_code: string;
  matched_type: string;
  scrape_month?: string; 
}

// Next.js Server Component - 数据获取函数 (保持不变)
async function getVideos(): Promise<VideoData[]> {
  try {
    const response = await fetch(SCRIPT_URL, {
      next: { revalidate: 3600 } 
    });
    // ... (数据获取和处理逻辑保持不变)
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }

    const rawData: VideoData[] = await response.json();
    const bestRankMap = new Map<string, VideoData>();

    rawData.forEach(video => {
      if (!video.video_id || !video.region_name) return;

      const key = `${video.video_id}_${video.region_name}`;
      const currentRank = video.video_rank || Infinity; 
      
      const existingVideo = bestRankMap.get(key);
      
      if (!existingVideo || currentRank < existingVideo.video_rank) {
        video.scrape_month = video.scrape_timestamp 
                               ? video.scrape_timestamp.substring(0, 7)
                               : 'N/A';
        bestRankMap.set(key, video);
      }
    });

    return Array.from(bestRankMap.values());

  } catch (error) {
    console.error("Error fetching video data:", error);
    return [];
  }
}

export const metadata: Metadata = {
  title: 'GI YouTube Trending Dashboard',
  description: 'Data visualization for YouTube trending data',
};

// 主页组件 - 负责获取数据和提取筛选器选项
export default async function HomePage() {
  const videos = await getVideos();

  if (videos.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center p-4 bg-gray-50 transition-colors duration-300"> 
        <div className="w-full max-w-7xl">
          <header className="py-4 mb-6 md:py-6 md:mb-8 flex justify-center">
            <h1 className="text-3xl md:text-4xl font-black text-gray-900">
              GI YouTube Trending Dashboard
            </h1>
          </header>
          <div className="bg-white shadow-xl rounded-xl p-6 lg:p-10 mt-10">
            <p className="text-center text-xl text-red-500">
              无法加载数据。请检查 App Script URL 或 JSON 格式。
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 提取月份和类型 (保持动态提取)
  const uniqueMonths = [...new Set(videos.map(v => v.scrape_month))].sort().filter(m => m !== 'N/A');
  const uniqueMatchTypes = [...new Set(videos.map(v => v.matched_type || ''))].sort().filter(t => t !== null);

  // === 核心修改: 使用硬编码的 FULL_REGION_NAMES 作为筛选器 ===
  const filterOptions = {
    months: uniqueMonths,
    regions: FULL_REGION_NAMES, // 使用完整的地区名称列表
    matchTypes: uniqueMatchTypes
  };

  // 最终成功渲染的组件结构
  return (
    <div className="min-h-screen flex flex-col items-center p-4 bg-gray-50 transition-colors duration-300">
      <div className="w-full max-w-7xl">
        
        {/* 标题 */}
        <header className="py-4 mb-6 md:py-6 md:mb-8 flex justify-center">
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 transition-colors duration-300">
                GI YouTube Trending Dashboard
            </h1>
        </header>
        
        {/* 将数据和筛选选项传递给 Client Component */}
        <VideoFilterList videos={videos} filterOptions={filterOptions} />
      </div>
    </div>
  );
}