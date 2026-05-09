import { useEffect, useRef } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase, ref, push, update } from 'firebase/database';
import firebaseConfig from '../firebase-applet-config.json';

// 初始化 Firebase 实例（确保不重复初始化）
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const database = getDatabase(app);

interface ClickRecord {
  tag: string;
  id: string;
  className: string;
  text: string;
  timestamp: string;
}

export function usePageContext() {
  const recordIdRef = useRef<string | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const maxScrollRef = useRef<number>(0);
  const clicksRef = useRef<ClickRecord[]>([]);

  useEffect(() => {
    // 1. 初始化收集基础设备信息，并获取唯一 Key
    const initPageSession = async () => {
      // 避免重复记录（根据会话）
      if (sessionStorage.getItem('pageInitRecord')) return;
      sessionStorage.setItem('pageInitRecord', 'true');

      const ua = navigator.userAgent;
      let os = "Unknown OS";
      if (ua.includes("Win")) os = "Windows";
      else if (ua.includes("Mac")) os = "MacOS";
      else if (ua.includes("Android")) os = "Android";
      else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";
      else if (ua.includes("Linux")) os = "Linux";

      let browser = "Unknown Browser";
      if (ua.includes("Edg")) browser = "Edge";
      else if (ua.includes("Chrome")) browser = "Chrome";
      else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
      else if (ua.includes("Firefox")) browser = "Firefox";

      const language = navigator.language || "Unknown";
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Unknown";
      const resolution = `${window.screen.width}x${window.screen.height}`;
      const referrer = document.referrer || '直接访问';

      let geo = { country: "Unknown", region: "Unknown", city: "Unknown", ip: "Unknown" };
      
      // 第一步：立刻建档 (Push)
      try {
        const newRecordRef = push(ref(database, 'visits'), {
          os_browser: `${os} - ${browser}`,
          os: os,
          browser: browser,
          language: language,
          timezone: timezone,
          resolution: resolution,
          referrer: referrer,
          geo: geo,
          timestamp: new Date().toLocaleString()
        });
        recordIdRef.current = newRecordRef.key;
        console.log("基础数据已立即发送");
      } catch (e) {
        console.error("记录访客基础数据失败：", e);
        return; // 如果新建记录失败，后续也无法更新
      }

      // 第二步补充：异步获取地理位置信息并 Update
      try {
        const fetchPromise = fetch('https://ipinfo.io/json');
        const timeoutPromise = new Promise<Response>((_, reject) => 
          setTimeout(() => reject(new Error('IP API request timeout (> 3s)')), 3000)
        );
        
        const res = await Promise.race([fetchPromise, timeoutPromise]);
        if (res.ok) {
          const data = await res.json();
          geo.country = data.country || "Unknown";
          geo.region = data.region || "Unknown";
          geo.city = data.city || "Unknown";
          geo.ip = data.ip || "Unknown";
          
          if (recordIdRef.current) {
            const updates: Record<string, any> = {};
            updates['/visits/' + recordIdRef.current + '/geo'] = geo;
            update(ref(database), updates).catch(e => console.warn("地理位置更新失败", e));
          }
        } else {
          console.warn("地理位置解析失败，状态码:", res.status);
        }
      } catch (err) {
        console.warn("地理位置获取失败 (容错处理继续执行):", err);
      }
    };

    // 暴露给全局进行测试
    (window as any).forceSendRecord = () => {
      sessionStorage.removeItem('pageInitRecord'); // 清除标记以强制发送
      initPageSession();
    };

    initPageSession();

    // 2. 监听最大滚动深度（使用定时器节流防止性能问题）
    let scrollTimeout: ReturnType<typeof setTimeout> | null = null;
    const handleScroll = () => {
      if (scrollTimeout) return;
      scrollTimeout = setTimeout(() => {
        const scrollY = window.scrollY || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        
        let depth = 0;
        if (documentHeight > windowHeight) {
          depth = Math.floor(((scrollY + windowHeight) / documentHeight) * 100);
          depth = Math.min(100, depth);
        } else {
          depth = 100; // 页面不能滚动时，默认100%
        }

        if (depth > maxScrollRef.current) {
          maxScrollRef.current = depth;
        }
        scrollTimeout = null;
      }, 500); // 节流 500ms
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // 3. 监听全局点击事件（限制前 10 次）
    const handleClick = (e: MouseEvent) => {
      if (clicksRef.current.length >= 10) return;
      const target = e.target as HTMLElement;
      
      let textContent = target.innerText?.trim() || '';
      if (!textContent && target.tagName.toLowerCase() === 'img') {
        textContent = (target as HTMLImageElement).alt || 'image';
      }
      
      clicksRef.current.push({
        tag: target.tagName.toLowerCase(),
        id: target.id || '',
        className: typeof target.className === 'string' ? target.className : '',
        text: textContent.substring(0, 30), // 截取前 30 个字符防止上传过大
        timestamp: new Date().toLocaleTimeString()
      });
    };
    document.addEventListener('click', handleClick);

    // 4. 用户离开页面时更新行为数据
    const handleLeave = () => {
      if (!recordIdRef.current) return;
      
      const timeOnPage = Math.floor((Date.now() - startTimeRef.current) / 1000); // 转换为秒
      
      const updates: Record<string, any> = {};
      updates['/visits/' + recordIdRef.current + '/behavior'] = {
        timeOnPage,
        maxScrollDepth: maxScrollRef.current,
        clicks: clicksRef.current
      };
      
      update(ref(database), updates).catch(e => console.error("行为更新失败", e));
    };

    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        handleLeave();
      }
    });

    window.addEventListener('beforeunload', handleLeave);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleClick);
      window.removeEventListener('visibilitychange', handleLeave);
      window.removeEventListener('beforeunload', handleLeave);
    };
  }, []);
}
