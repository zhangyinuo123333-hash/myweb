import React from 'react';
import { createRoot } from 'react-dom/client';
import { usePageContext } from './useAppSession';

console.log('App session initialized.');

// 创建一个无UI的组件，专门用来运行页面上下文的 Hook
function PageSetupApp() {
  usePageContext();
  return null;
}

// 在页面 body 注入挂载点
const pageRoot = document.createElement('div');
pageRoot.id = 'react-page-setup-root';
pageRoot.style.display = 'none';
document.body.appendChild(pageRoot);

createRoot(pageRoot).render(<PageSetupApp />);
