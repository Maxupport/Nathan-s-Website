"use client";

import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { ChevronRight, Star, Quote, UserCircle } from 'lucide-react';

interface Review {
  id: string | number;
  name: string;
  tag: string;
  stars: number;
  comment: string;
  date: string;
}

const initialReviews: Review[] = [
  { id: 1, name: "陳小姐", tag: "28歲 / 行銷企劃", stars: 5, comment: "原本對職涯方向很模糊，跟 Max 聊完 30 分鐘後，他幫我把雜亂的選項拆解得很清楚，終於知道下一步該往哪裡走。推薦給同樣卡住的人！", date: "2024-05-15" },
  { id: 2, name: "林先生", tag: "32歲 / 工程師", stars: 5, comment: "服務雖然理性，但能感受到 Max 的溫暖。履歷優化服務非常專業，把我的經驗翻譯成企業聽得懂的語言，面試機會明顯變多了。", date: "2024-05-10" },
  { id: 3, name: "張先生", tag: "25歲 / 社會新鮮人", stars: 4, comment: "$99 的 Email 診斷雖然短，但一針見血地指出我情緒卡住的原因。是一個性價比極高的心靈修復入門票。", date: "2024-05-01" },
];

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);

  const GOOGLE_SHEETS_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ07qkSZZf7assEOvLdlzkmM8ylFmaFP38jnqaNjajvFH4vr-5b2GwJY1XmoUwMcuIq6ak5PU3XavqZ/pub?output=csv";

  useEffect(() => {
    if (!GOOGLE_SHEETS_CSV_URL) {
      setIsLoadingReviews(false);
      return;
    }
    fetch(GOOGLE_SHEETS_CSV_URL)
      .then(res => res.text())
      .then(csvText => {
        const parsed = Papa.parse<{ [key: string]: string }>(csvText, { header: true, skipEmptyLines: true });
        const approvedReviews = parsed.data
          .filter(row => {
            const appKey = Object.keys(row).find(k => k.toLowerCase().includes('approved') || k.includes('核准')) || 'Approved';
            const val = String(row[appKey] || '').trim().toLowerCase();
            return val === 'true' || val === 'yes' || val === '是' || val === 'v' || val === 'y';
          })
          .map((row, index) => {
            const keys = Object.keys(row);
            const nameKey = keys.find(k => k.toLowerCase().includes('name') || k.includes('名稱')) || keys[1];
            const tagKey = keys.find(k => k.toLowerCase().includes('tag') || k.includes('標籤')) || keys[2];
            const commentKey = keys.find(k => k.toLowerCase().includes('comment') || k.includes('評價')) || keys[3];
            const starsKey = keys.find(k => k.toLowerCase().includes('star') || k.includes('星')) || keys[4];

            return {
              id: `gs-${index}`,
              name: row[nameKey] || '匿名訪客',
              tag: row[tagKey] || '使用者',
              stars: parseInt(row[starsKey]) || 5,
              comment: row[commentKey] || '',
              date: row['時間戳記'] || row['Date'] || new Date().toISOString().split('T')[0]
            };
          })
          .reverse();
        if (approvedReviews.length > 0) {
          setReviews(approvedReviews);
        }
        setIsLoadingReviews(false);
      })
      .catch(err => {
        console.error("載入評論失敗:", err);
        setIsLoadingReviews(false);
      });
  }, []);

  const renderStars = (count: number) => (
    <div className="flex space-x-1 text-orange-400 drop-shadow-[0_0_5px_rgba(249,115,22,0.5)]">
      {[...Array(5)].map((_, i) => <Star key={i} size={16} fill={i < count ? "currentColor" : "none"} className={i < count ? "" : "text-slate-700"} />)}
    </div>
  );

  return (
    <div className="py-24 px-6 max-w-6xl mx-auto animate-in fade-in zoom-in-95 duration-700 pb-32">
      <div className="text-center mb-20 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[100px] bg-blue-500/10 blur-[80px] rounded-full point-events-none"></div>
        <h2 className="text-4xl font-extrabold text-white mb-6 relative z-10 tracking-tight">真實反饋，理性見證</h2>
        <p className="text-slate-400 max-w-xl mx-auto font-light leading-relaxed text-lg relative z-10 mb-8">聽聽那些曾經卡住迷惘的朋友，在經過拆解與擺渡後，獲得什麼樣的清醒與改變。</p>

        <div className="relative z-10 mt-8">
          <a href="https://docs.google.com/forms/d/e/1FAIpQLSfRVbwj7eGSvieK4X3t1X8feP9hr2FQQTUydL3P9JSZ6P9vvA/viewform?usp=header" target="_blank" rel="noopener noreferrer" className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-8 py-3.5 rounded-full font-semibold transition-all duration-300 backdrop-blur-md inline-flex items-center shadow-lg hover:shadow-xl">
            撰寫你的真實評價 <ChevronRight className="ml-2" size={18} />
          </a>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24 relative z-10">
        {isLoadingReviews ? (
          <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-12 text-slate-400">正在載入最新評價...</div>
        ) : reviews.map(review => (
          <div key={review.id} className="bg-slate-900/60 p-8 rounded-[2rem] border border-white/5 backdrop-blur-sm shadow-xl relative hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] hover:-translate-y-1 transition-all duration-500 group overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10 transition-all duration-500 group-hover:bg-orange-500/10"></div>
            <Quote className="absolute top-8 right-8 text-white/5 group-hover:text-orange-500/10 transition-colors duration-500" size={40} strokeWidth={1} />
            <div className="flex items-center space-x-4 mb-6 relative z-10">
              <div className="p-2 bg-slate-800 rounded-full border border-white/10">
                <UserCircle className="text-slate-400" size={32} strokeWidth={1.5} />
              </div>
              <div>
                <p className="font-semibold text-slate-100 text-base">{review.name}</p>
                <p className="text-xs text-slate-500 font-light tracking-wide mt-0.5">{review.tag}</p>
              </div>
            </div>
            <div className="mb-4 relative z-10">{renderStars(review.stars)}</div>
            <p className="text-slate-300 text-sm leading-loose font-light min-h-[120px] relative z-10">{review.comment}</p>
            <p className="text-xs text-slate-600 mt-6 pt-5 border-t border-white/10 font-mono tracking-wider relative z-10">{review.date}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
