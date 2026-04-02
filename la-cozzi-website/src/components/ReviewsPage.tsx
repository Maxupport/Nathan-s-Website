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
  { id: 1, name: "匿名客戶", tag: "婚禮晚宴", stars: 5, comment: "謝謝 La Cozzi 帶給我們這麼完美的夜晚，音樂的挑選跟主唱的嗓音都讓人感到非常溫暖。親友們都給了很高的評價！", date: "2026-05-20" },
  { id: 2, name: "匿名品牌", tag: "品牌發表會", stars: 5, comment: "合作過程溝通十分順暢，樂團非常能理解我們品牌想傳遞的氛圍，音樂的鋪陳恰到好處。", date: "2026-06-15" },
];

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);

  // Google Sheets CSV URL
  const GOOGLE_SHEETS_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRWTU_Hds5s1QcYG_UWtWiPfjZn2h1IWBWMb1N96Lpfq_X99lYDuXhYVS1-g-d0xsPiU-fZ-xB7sWFw/pub?output=csv"; 

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
            const ObjectKeys = Object.keys(row);
            const nameKey = ObjectKeys.find(k => k.toLowerCase().includes('name') || k.includes('名稱') || k.includes('稱呼')) || ObjectKeys[1];
            const tagKey = ObjectKeys.find(k => k.toLowerCase().includes('tag') || k.includes('標籤') || k.includes('場合') || k.includes('活動')) || ObjectKeys[2];
            const commentKey = ObjectKeys.find(k => k.toLowerCase().includes('comment') || k.includes('評價') || k.includes('說的話') || k.includes('回饋')) || ObjectKeys[3];
            const starsKey = ObjectKeys.find(k => k.toLowerCase().includes('star') || k.includes('星') || k.includes('滿意')) || ObjectKeys[4];

            return {
              id: `gs-${index}`,
              name: row[nameKey] || '匿名客戶',
              tag: row[tagKey] || '活動參與者',
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
    <div className="flex space-x-1 text-amber-500 drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]">
      {[...Array(5)].map((_, i) => <Star key={i} size={16} fill={i < count ? "currentColor" : "none"} className={i < count ? "" : "text-stone-700"} />)}
    </div>
  );

  return (
    <div className="py-24 px-6 max-w-6xl mx-auto animate-in fade-in zoom-in-95 duration-700 pb-32">
      <div className="text-center mb-20 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[100px] bg-rose-500/10 blur-[80px] rounded-full point-events-none"></div>
        <h2 className="text-4xl font-black font-serif text-stone-100 mb-6 relative z-10 tracking-tight">
          聽見感動的迴響
        </h2>
        <p className="text-stone-300 max-w-xl mx-auto font-light leading-relaxed text-lg relative z-10 mb-8">
          每一次演出後收到最真實的回饋，都是我們繼續用音樂創造溫度的最強動力。
        </p>

        <div className="relative z-10 mt-8">
          <a href="https://docs.google.com/forms/d/e/1FAIpQLSerGqoYFd-FAbMJgOSn6j43VyCGGEoV7mqj4sng2G6coxfTdA/viewform" target="_blank" rel="noopener noreferrer" className="bg-stone-800 hover:bg-amber-600 border-2 border-stone-600 hover:border-amber-400 text-stone-100 px-8 py-3.5 rounded-organic font-black font-serif transition-all duration-300 backdrop-blur-md inline-flex items-center shadow-lg hover:shadow-[0_10px_20px_rgba(217,119,6,0.3)] group">
            分享您的美好體驗 <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
          </a>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24 relative z-10">
        {isLoadingReviews ? (
          [...Array(6)].map((_, idx) => (
            <div key={`skeleton-${idx}`} className="bg-stone-900/60 p-8 rounded-organic border-2 border-stone-800/50 backdrop-blur-sm animate-pulse min-h-[300px] flex flex-col">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-stone-800 rounded-organic-2 border-2 border-stone-700/50"></div>
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-stone-800 rounded"></div>
                  <div className="h-3 w-16 bg-stone-800/50 rounded"></div>
                </div>
              </div>
              <div className="h-4 w-24 bg-stone-800/50 rounded mb-4"></div>
              <div className="space-y-3 grow">
                <div className="h-3 w-full bg-stone-800/30 rounded"></div>
                <div className="h-3 w-full bg-stone-800/30 rounded"></div>
                <div className="h-3 w-3/4 bg-stone-800/30 rounded"></div>
              </div>
            </div>
          ))
        ) : reviews.map(review => (
          <div key={review.id} className="bg-stone-900/60 p-8 rounded-organic border-2 border-stone-800 backdrop-blur-sm shadow-[0_15px_40px_-15px_rgba(0,0,0,0.5)] relative hover:shadow-[0_20px_50px_-15px_rgba(245,158,11,0.15)] hover:border-amber-500/40 hover:-translate-y-1 transition-all duration-500 group overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl -mr-10 -mt-10 transition-all duration-500 group-hover:bg-amber-500/10"></div>
            <Quote className="absolute top-8 right-8 text-stone-100/5 group-hover:text-amber-500/15 transition-colors duration-500" size={40} strokeWidth={1} />
            <div className="flex items-center space-x-4 mb-6 relative z-10">
              <div className="p-2 bg-stone-800 rounded-organic-2 border-2 border-stone-700/50">
                <UserCircle className="text-stone-400" size={32} strokeWidth={1.5} />
              </div>
              <div>
                <p className="font-semibold text-stone-100 text-base">{review.name}</p>
                <p className="text-xs text-stone-400 font-light tracking-wide mt-0.5">{review.tag}</p>
              </div>
            </div>
            <div className="mb-4 relative z-10">{renderStars(review.stars)}</div>
            <p className="text-stone-300 text-sm leading-loose font-light min-h-[120px] relative z-10">{review.comment}</p>
            <p className="text-xs text-stone-500 mt-6 pt-5 border-t border-stone-800 font-mono tracking-wider relative z-10">{review.date}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
