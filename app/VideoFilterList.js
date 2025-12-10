// src/app/VideoFilterList.js

'use client'; 

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image'; 
import { Sun, Moon, Search } from 'lucide-react'; 


// 地区列表 (已更新)
const REGION_LIST = [
    { Code: 'US', name: 'United States' }, { Code: 'DE', name: 'Germany' },
    { Code: 'FR', name: 'France' }, { Code: 'MX', name: 'Mexico' }, 
    { Code: 'BR', name: 'Brazil' }, { Code: 'ID', name: 'Indonesia' },
    { Code: 'JP', name: 'Japan' }, { Code: 'KR', name: 'South Korea' }, // 保持 KR
    { Code: 'TW', name: 'Taiwan' }, { Code: 'VN', name: 'Vietnam' },
    { Code: 'GB', name: 'United Kingdom' }, { Code: 'TH', name: 'Thailand' },
    { Code: 'AE', name: 'United Arab Emirates' }, { Code: 'SA', name: 'Saudi Arabia' },
    { Code: 'QA', name: 'Qatar' }, { Code: 'SG', name: 'Singapore' },
    // 新增地区:
    { Code: 'PH', name: 'Philippines' },
    { Code: 'HK', name: 'Hong Kong' },
];

// 映射表 (保持不变，但基于新的 LIST 构建)
const REGION_MAP = REGION_LIST.reduce((acc, region) => {
    acc[region.name] = region.Code;
    return acc;
}, { 'N/A': 'N/A' });

// 更新后的地区颜色映射表 (新增 MO, PH, HK 的颜色)
const REGION_COLORS = {
    // 现有颜色
    US: 'bg-blue-500', JP: 'bg-red-500', KR: 'bg-yellow-500', TW: 'bg-green-500', 
    SG: 'bg-purple-500', TH: 'bg-teal-500', DE: 'bg-pink-500', FR: 'bg-indigo-500', 
    MX: 'bg-orange-500', BR: 'bg-cyan-500', ID: 'bg-lime-500', VN: 'bg-emerald-500', 
    GB: 'bg-sky-500', AE: 'bg-rose-500', SA: 'bg-fuchsia-500', QA: 'bg-amber-500', 
    
    // 新增颜色
    PH: 'bg-blue-700',      // 菲律宾 (较深的蓝色)
    HK: 'bg-yellow-700',    // 香港 (较深的黄色/金色)
    
    // 默认颜色
    '': 'bg-gray-500', 'N/A': 'bg-gray-500',
};

export default function VideoFilterList({ videos, filterOptions }) {
  const [filters, setFilters] = useState({
    month: 'All',
    region: 'All',
    matchType: 'All',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false); 

  // 夜间模式切换逻辑 (只响应手动点击)
  const toggleDarkMode = () => {
    const newState = !isDarkMode;
    setIsDarkMode(newState);
    // 关键：手动在 HTML 根元素上切换 'dark' 类
    document.documentElement.classList.toggle('dark', newState);
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // 核心筛选和搜索逻辑
  const filteredVideos = useMemo(() => {
    let results = videos;

    // 1. 关键词搜索
    if (searchTerm.trim()) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      results = results.filter(video => 
        video.video_title.toLowerCase().includes(lowerCaseSearch) ||
        video.region_name.toLowerCase().includes(lowerCaseSearch) ||
        video.channel_id.toLowerCase().includes(lowerCaseSearch)
      );
    }
    
    // 2. 下拉筛选
    results = results.filter(video => {
      if (filters.month !== 'All' && video.scrape_month !== filters.month) return false;
      if (filters.region !== 'All' && video.region_name !== filters.region) return false;
      const videoMatchType = video.matched_type || '';
      if (filters.matchType !== 'All' && videoMatchType !== filters.matchType) return false;
      return true;
    });

    // 3. 排序逻辑 (新增): 按 published_at 从新到旧排序
    // 注意：使用 slice() 创建数组副本，防止修改原始数组
    results.sort((a, b) => {
        // 将日期字符串转换为 Date 对象进行比较
        const dateA = new Date(a.published_at);
        const dateB = new Date(b.published_at);

        // 从新到旧排序 (降序)：如果 B 比 A 新，则 B 排在前面 (B - A > 0)
        // 额外的逻辑是处理无效日期，确保有日期的排在前面
        if (isNaN(dateA.getTime())) return isNaN(dateB.getTime()) ? 0 : 1;
        if (isNaN(dateB.getTime())) return -1;
        
        return dateB.getTime() - dateA.getTime();
    });

    return results;
  }, [videos, filters, searchTerm]); // 依赖项保持不变

  const currentMonth = filters.month === 'All' ? '当前数据' : filters.month;

  return (
    <div className="w-full">
      {/* 筛选和搜索控制栏 */}
      <div className="sticky top-0 z-20 bg-white dark:bg-gray-800 p-4 border-y border-gray-200 dark:border-gray-700 shadow-md flex flex-wrap items-center justify-between gap-4 transition-colors duration-300">
        
        {/* 搜索栏 */}
        <div className="flex items-center w-full md:w-auto flex-grow max-w-md bg-gray-100 dark:bg-gray-700 rounded-lg shadow-inner px-3 py-2">
            <Search className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
            <input
                type="text"
                placeholder="搜索标题、频道、地区..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="bg-transparent w-full text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none"
            />
        </div>

        {/* 下拉筛选器组 */}
        <div className="flex gap-4 flex-wrap justify-end">
            <select
                value={filters.month}
                onChange={e => handleFilterChange('month', e.target.value)}
                className="pl-3 pr-8 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
                <option value="All">所有月份</option>
                {filterOptions.months.map(m => <option key={m} value={m}>{m}</option>)}
            </select>

            <select
                value={filters.region}
                onChange={e => handleFilterChange('region', e.target.value)}
                className="pl-3 pr-8 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
                <option value="All">所有地区</option>
                {filterOptions.regions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            
            <select
                value={filters.matchType}
                onChange={e => handleFilterChange('matchType', e.target.value)}
                className="pl-3 pr-8 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
                <option value="All">所有类型</option>
                {filterOptions.matchTypes.map(t => <option key={t} value={t}>{t || '无类型'}</option>)}
            </select>
        </div>
        
        {/* 夜间模式切换按钮 */}
        <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition duration-150"
            aria-label="Toggle dark mode"
        >
            {isDarkMode ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
        </button>
      </div>
      
      {/* 月份大标题 */}
      <h2 className="text-2xl md:text-3xl font-bold mt-8 mb-6 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        {currentMonth} 趋势
      </h2>

      {/* 列表渲染：卡片网格布局 */}
      {filteredVideos.length === 0 ? (
        <p className="text-center text-xl text-gray-500 mt-10 p-6 border rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-gray-300 w-full max-w-full">
          未找到匹配筛选条件的视频。请尝试调整筛选器。
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full max-w-full">
          {filteredVideos.map((video, index) => {
            
            const regionAbbreviation = REGION_MAP[video.region_name] || video.region_name;
            const regionColor = REGION_COLORS[regionAbbreviation] || REGION_COLORS[''];

            const publishedDate = video.published_at ? new Date(video.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';

            return (
              <Link 
                key={`${video.video_id}_${video.region_name}`} 
                href={video.video_url}
                target="_blank"
                className="group block bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition duration-300 overflow-hidden transform hover:scale-[1.02] border border-gray-100 dark:border-gray-700"
              >
                {/* 1. 封面图片区域 */}
                <div className="relative w-full aspect-video">
                  {video.video_thumbnail_url && (
                      <Image
                          src={video.video_thumbnail_url} 
                          alt={video.video_title}
                          fill={true}
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="transition-transform duration-300 group-hover:scale-110"
                          style={{ objectFit: 'cover' }}
                          priority={index < 8} 
                      />
                  )}
                  
                  <div className="absolute top-3 left-3 bg-black bg-opacity-50 text-white text-md font-bold px-3 py-1 rounded-lg shadow-lg">
                      #{video.video_rank}
                  </div>
                </div>

                {/* 2. 视频信息区域 */}
                <div className="p-4">
                  <h3 className="text-md font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 line-clamp-2 mb-2 transition-colors duration-300">
                    {video.video_title}
                  </h3>
                  
                  {/* 地区/标签/日期信息 (底部) */}
                  <div className="flex justify-between items-end mt-3 text-xs">
                    <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded-full text-white font-bold ${regionColor}`}>
                            {regionAbbreviation}
                        </span>
                        {video.matched_type && (
                            <span className="px-2 py-0.5 rounded-full text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 font-medium">
                                {video.matched_type}
                            </span>
                        )}
                    </div>

                    <span className="text-gray-500 dark:text-gray-400 font-medium">
                        {publishedDate}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}