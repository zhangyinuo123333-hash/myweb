import React from 'react';
import { createRoot } from 'react-dom/client';
import { useBehaviorTracker } from './useBehaviorTracker';

console.log('Static clone mode active');

// 创建一个无UI的组件，专门用来运行行为追踪的 Hook
function TrackerApp() {
  useBehaviorTracker();
  return null;
}

// 在页面 body 注入挂载点
const trackerRoot = document.createElement('div');
trackerRoot.id = 'react-behavior-tracker-root';
trackerRoot.style.display = 'none';
document.body.appendChild(trackerRoot);

createRoot(trackerRoot).render(<TrackerApp />);
