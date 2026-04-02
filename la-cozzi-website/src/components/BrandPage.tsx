"use client";

import { CheckCircle2, Music, Heart, Mic2, HeartHandshake, Smile, Sparkles } from 'lucide-react';

export default function BrandPage({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  return (
    <div className="animate-in fade-in duration-700 pb-20">
      
      {/* 1. Hero Section */}
      <section className="py-24 px-6 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-rose-500/5 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="flex justify-center mb-8 relative z-10 w-full">
            <img 
              src="/logo.png" 
              alt="La Cozzi 樂團 Logo" 
              className="w-64 md:w-96 max-w-[80vw] h-auto object-contain drop-shadow-[0_10px_30px_rgba(251,191,36,0.2)] hover:scale-105 transition-transform duration-700"
            />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-rose-400 mt-4 tracking-wide font-serif">
            <span className="sr-only">質感婚禮樂團企劃首選 - </span>「全台灣最清新的手作音樂樂團」
          </h1>
          <div className="w-16 h-1 bg-gradient-to-r from-amber-500/50 to-rose-500/50 mx-auto mt-12 mb-10 rounded-full"></div>
          <p className="text-lg md:text-xl text-stone-300 max-w-3xl mx-auto leading-loose font-light">
            婚禮、品牌活動與各種重要時刻裡，真正打動人心的，<br className="hidden md:block"/>從來不只是流程順利，而是那些剛剛好的情緒，被完整接住的瞬間。<br/><br/>
            <strong className="text-amber-100/90 font-medium tracking-wide">La Cozzi 拉釦子樂團</strong>，以全程真實演奏的手作音樂，<br className="hidden md:block"/>
            為現場帶來有質感、有溫度、卻不喧賓奪主的陪伴，<br className="hidden md:block"/>
            讓重要時刻更動人，也讓整體氛圍更自然地被記住。
          </p>
        </div>
      </section>

      {/* 2. 我們的堅持 & 三大特色 */}
      <section className="py-20 px-6 max-w-5xl mx-auto relative z-10">
        <div className="mb-20 text-center max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl font-black font-serif text-stone-100 tracking-tight">我們的堅持</h2>
          <p className="text-stone-300 font-light leading-relaxed text-[17px] text-left md:text-center px-4">
            我們相信，現場音樂從來不只是背景聲，而是整場情緒與質感的重要支撐。<br/><br/>
            無論是婚禮中的進場、交換誓詞、敬酒與送客，或是商業場合中的迎賓、品牌亮相、流程轉場與交流時刻，每一個片段都值得被好好襯托。<br/><br/>
            因此，La Cozzi 堅持以真實手作的現場演奏，讓音樂不只是「有安排到」，而是真正成為現場氛圍的一部分，陪在場的每一個人走進那一天最值得記住的時刻裡。
          </p>
        </div>

        <h2 className="text-2xl md:text-3xl font-black font-serif text-stone-100 text-center mb-12 tracking-tight">我們的三大特色</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { 
              icon: <Mic2 className="text-amber-400" size={32} />, 
              t: "全程真實演奏，不使用預編伴奏", 
              d: "我們堅持演出全程不使用預編伴奏，所有聲音都來自現場即時演奏。這樣的演出方式不只更真實，也更能隨著現場節奏、情緒與流程自然呼應，讓每一段音樂都不是制式播放，而是真正屬於當下場合的版本。" 
            },
            { 
              icon: <HeartHandshake className="text-rose-400" size={32} />, 
              t: "固定班底合作多年，現場穩定度高", 
              d: "La Cozzi 成立至今超過 15 年，核心成員長期固定，每年演出超過 30 場。這代表的不只是經驗累積，更是團員之間成熟穩定的默契，能在婚禮與商業演出這類講究節奏、質感與分寸的場合裡，提供安心而細緻的演出品質。" 
            },
            { 
              icon: <Smile className="text-amber-500" size={32} />, 
              t: "不只會演奏，更懂人際關係與場合的分寸", 
              d: "我們重視的不只是音準與編曲，也在意整體儀態、互動感、語言表達，以及現場氛圍的拿捏。什麼時候該襯托，什麼時候該退後；什麼時候該提升氣氛，什麼時候該保留空間，我們都很清楚。這也是拉釦子和一般表演型樂團最大的不同。" 
            },
          ].map((item, idx) => (
            <div key={idx} className="bg-stone-900/60 p-8 rounded-2xl border-2 border-stone-800 backdrop-blur-md shadow-[0_15px_40px_-15px_rgba(0,0,0,0.5)] hover:-translate-y-1 transition-all duration-300 group">
              <div className="bg-stone-800/80 p-3 rounded-full inline-block mb-6 border border-stone-700/50 group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-stone-100 mb-4 leading-snug">{item.t}</h3>
              <p className="text-stone-400 font-light leading-relaxed text-[15px]">{item.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. 核心價值 */}
      <section className="py-12 px-6 max-w-4xl mx-auto relative z-10 line-clamp-none">
        <div className="bg-gradient-to-br from-stone-800 to-amber-950 border-2 border-amber-500/30 text-stone-100 p-10 md:p-14 rounded-3xl relative overflow-hidden shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)] text-center group">
          <Music className="absolute -bottom-10 -right-10 text-amber-500/5 group-hover:text-amber-500/10 group-hover:scale-110 group-hover:-rotate-12 transition duration-700 pointer-events-none" size={240} strokeWidth={1} />
          <h3 className="text-2xl md:text-3xl font-black font-serif mb-8 relative z-10 text-amber-100 tracking-tight leading-snug">
            讓質感且溫暖的手作音樂，<br className="hidden md:block"/>成為現場氛圍最剛好的支持
          </h3>
          <div className="space-y-6 relative z-10 text-[16px] font-light text-stone-300/90 leading-loose max-w-2xl mx-auto">
            <p>我們不搶舞台，也不刻意讓表演感壓過活動本身。<br/>La Cozzi 更在意的是，讓音樂恰到好處地存在，讓賓客感受到質感，讓委任者感受到被承接，讓整場活動在自然、舒服、有溫度的狀態裡完成。</p>
            <p className="mt-6 mb-2">好的現場音樂不是讓人記得「有一團很厲害的樂團」，<br className="hidden md:block"/>而是讓人回頭想起那一天時會很自然地覺得：</p>
          </div>
          <div className="inline-block bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 relative z-10 backdrop-blur-sm shadow-inner mt-4 mx-auto rotate-1 group-hover:rotate-0 transition-transform duration-500">
            <p className="text-amber-300 font-serif text-xl md:text-2xl font-bold italic tracking-wider">「那個氣氛，真的很好。」</p>
          </div>
        </div>
      </section>

      {/* 4. 我們能為你的現場帶來什麼 */}
      <section className="py-20 px-6 max-w-5xl mx-auto relative z-10">
        <h2 className="text-3xl font-black font-serif text-stone-100 text-center mb-16 tracking-tight">我們能為你的現場帶來什麼</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { t: "讓現場更有質感，而不是更吵雜", d: "我們不追求喧鬧與炫技，而是讓音樂自然融入現場，成為氣氛的一部分。無論是婚禮、品牌活動、開幕、餐敘或商務場合，都能讓整體感受更完整、更細緻，也更耐人回味。" },
            { t: "讓現場有溫度，不只有制式流程", d: "重要場合不是靠節目堆疊就能成立，而是需要被好好照顧的節奏與情緒。我們用真實演奏回應當下的氣氛，讓每一段音樂都不是單純播放出來的背景，而是真正陪著現場一起呼吸、一起流動的存在。" },
            { t: "讓你放心把音樂這件事交出去", d: "活動當天已經有太多事情需要顧，音樂不該再成為額外壓力。La Cozzi 會以前期溝通、曲風安排與現場分寸感，幫你把氣氛穩穩撐住，讓你把心力留給真正重要的人與時刻。" }
          ].map((item, idx) => (
             <div key={idx} className="flex flex-col space-y-3">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-stone-800 text-amber-500 font-bold flex items-center justify-center font-serif text-sm border border-stone-700">{idx + 1}</span>
                  <h3 className="text-lg font-bold text-stone-200 leading-snug">{item.t}</h3>
                </div>
                <p className="text-stone-400 font-light leading-relaxed pl-11 text-[15px]">{item.d}</p>
             </div>
          ))}
        </div>
      </section>

      {/* 5. 為什麼多人選 & 適合這樣的你們 */}
      <section className="py-20 px-6 max-w-5xl mx-auto relative z-10 grid md:grid-cols-2 gap-16">
        {/* Why */}
        <div className="space-y-6 bg-stone-900/40 p-8 rounded-3xl border border-stone-800/60 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl -ml-10 -mt-10 group-hover:bg-amber-500/10 transition-colors"></div>
          <h2 className="text-2xl md:text-3xl font-black font-serif text-stone-100 tracking-tight leading-snug mb-8 relative z-10">為什麼很多人會選<br/><span className="text-amber-400">現場手作音樂？</span></h2>
          <p className="text-stone-300 font-light mb-6 text-[15px] relative z-10">因為現場手作音樂帶來的，不只是「比較好聽」，而是整體感受真的不一樣。</p>
          <ul className="space-y-4 relative z-10">
            {[
              "比播放音檔更有生命感",
              "比制式演出更有呼吸與互動",
              "比過度表演型的節目更適合重要場合的氛圍",
              "能讓現場更自然地顯得有質感、有溫度，也更有記憶點"
            ].map((text, i) => (
              <li key={i} className="flex items-start space-x-3">
                <Sparkles size={18} className="text-amber-500/80 mt-1 shrink-0" />
                <span className="text-stone-300/90 font-light">{text}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 pt-6 border-t border-stone-800/50 relative z-10">
            <p className="text-stone-400 font-light italic text-sm leading-loose">你不一定會記得每一首歌的名字，<br/>但你會記得，那一天空氣裡，有一種剛剛好的溫柔。</p>
          </div>
        </div>

        {/* Target Audience */}
        <div className="space-y-6 relative z-10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
          <h2 className="text-2xl md:text-3xl font-black font-serif text-stone-100 tracking-tight leading-snug mb-8 relative z-10">適合<br/><span className="text-rose-400">這樣的你們</span></h2>
          <p className="text-stone-300 font-light mb-6 text-[15px] relative z-10">你們很適合 La Cozzi，若你期待的現場是這樣的：</p>
          <ul className="space-y-5 relative z-10">
            {[
              "希望活動有質感，但不想太匠氣、太制式",
              "喜歡真實演奏的溫度，不喜歡罐頭式伴奏感",
              "在意現場氣氛，也在意賓客的整體感受",
              "想要音樂幫活動加分，但不想讓表演搶走焦點",
              "希望合作團隊穩定可靠，能理解場合與應對進退的分寸"
            ].map((text, i) => (
              <li key={i} className="flex items-center space-x-3 bg-stone-800/30 p-4 rounded-xl border border-stone-700/30 hover:border-amber-500/30 transition-colors">
                <CheckCircle2 size={20} className="text-emerald-500/80 shrink-0" />
                <span className="text-stone-200 text-sm font-medium">{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 6. Brand Story */}
      <section className="py-20 px-6 max-w-4xl mx-auto relative z-10 text-center">
        <h2 className="text-3xl font-black font-serif text-stone-100 tracking-tight mb-4">品牌故事｜La Cozzi 的誕生</h2>
        <div className="w-12 h-1 bg-gradient-to-r from-amber-500 to-rose-500 rounded-organic mx-auto mb-12"></div>
        
        <div className="text-stone-300 font-light leading-relaxed space-y-6 text-[16px] max-w-2xl mx-auto text-left md:text-center">
          <p>La Cozzi 成立於 2012 年初。</p>
          <p>一群來自不同背景、擁有不同專業的人，因為同樣相信音樂的溫度而聚在一起，希望用真實演奏，為這個世界帶來更多微笑，也為人與人之間的重要時刻，留下更值得記住的陪伴。</p>
          <p className="pt-4 font-medium text-stone-200">我們的團名有兩層意思：</p>
          
          <div className="grid md:grid-cols-2 gap-6 pt-4 text-left">
            <div className="bg-stone-900/50 p-6 rounded-2xl border border-stone-800 relative group overflow-hidden shadow-lg hover:shadow-amber-500/10 transition-shadow">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl transition-all duration-500 group-hover:bg-amber-500/10"></div>
              <h4 className="font-bold text-amber-400 text-xl font-serif tracking-wide mb-2">Cozy</h4>
              <p className="text-sm text-stone-300/80 mb-2 font-medium">代表舒服、溫暖、放鬆。</p>
              <p className="text-[14px]">這是我們希望帶給現場的感受：不壓迫、不匠氣，而是讓每一個人都能自在地沉浸其中。</p>
            </div>
            
            <div className="bg-stone-900/50 p-6 rounded-2xl border border-stone-800 relative group overflow-hidden shadow-lg hover:shadow-rose-500/10 transition-shadow">
              <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl transition-all duration-500 group-hover:bg-rose-500/10"></div>
              <h4 className="font-bold text-rose-400 text-xl font-serif tracking-wide mb-2">Coze</h4>
              <p className="text-sm text-stone-300/80 mb-2 font-medium">代表談心。</p>
              <p className="text-[14px]">我們相信音樂能拉近人與人之間的距離，也能讓那些平常說不出口的情感，在旋律裡被自然理解。</p>
            </div>
          </div>

          <div className="pt-10 mb-4">
             <Heart className="text-rose-400/50 mx-auto mb-4" size={24} />
             <p className="text-stone-200 font-medium text-lg leading-loose">所以對我們來說，演出從來不只是完成一場表演。<br className="hidden md:block"/>而是用手作音樂，陪每一段重要關係、每一個重要場合，<br className="hidden md:block"/>走過值得紀念的一天。</p>
          </div>
        </div>
      </section>

      {/* 7. CTA */}
      <section className="py-24 px-6 text-center max-w-4xl mx-auto border-t border-stone-800/50 mt-10 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[300px] bg-gradient-to-r from-amber-500/5 via-rose-500/5 to-amber-500/5 blur-[80px] rounded-full pointer-events-none"></div>
        <h2 className="text-2xl md:text-3xl font-black font-serif text-amber-100 tracking-tight leading-snug mb-6 relative z-10">
          你的重要時刻，不需要更熱鬧。
        </h2>
        <p className="text-lg text-stone-300 font-light mb-12 relative z-10">
          它需要的是更剛好的音樂，陪你把整個現場撐得更完整。
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 relative z-10">
          <a href="https://ig.me/m/lacozzi_1314" target="_blank" rel="noopener noreferrer" className="inline-block text-center w-full sm:w-auto bg-amber-600 text-stone-50 px-8 py-4 rounded-organic-2 font-black font-serif border-2 border-amber-500 hover:bg-amber-500 transition-all duration-300 shadow-[0_0_30px_rgba(217,119,6,0.3)] hover:shadow-[0_0_40px_rgba(217,119,6,0.5)] hover:-translate-y-1">
            立即洽詢演出檔期
          </a>
          <button onClick={() => setActiveTab('landing')} className="w-full sm:w-auto bg-stone-800 text-stone-200 px-8 py-4 rounded-organic-2 font-black font-serif border-2 border-stone-700 hover:border-amber-500/50 hover:bg-stone-800/80 transition-all duration-300 hover:-translate-y-1 shadow-lg">
            索取演出方案報價
          </button>
        </div>
        <div className="mt-8 relative z-10">
          <a href="https://ig.me/m/lacozzi_1314" target="_blank" rel="noopener noreferrer" className="inline-block text-rose-400 hover:text-rose-300 font-semibold tracking-wide underline underline-offset-8 decoration-rose-500/30 hover:decoration-rose-400 transition-colors">
            和我們聊聊你的活動想像
          </a>
        </div>
      </section>

    </div>
  );
}
