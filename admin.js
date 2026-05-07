import { addMessage, getMessages } from './firebase.js';

// admin.js
// 这是一个轻量级的本地存储后台管理模块，专门在提交前替换页面DOM数据

// --- 自定义弹层工具 ---
function customAlert(msg, onConfirm) {
  const overlay = document.createElement("div");
  overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.6);backdrop-filter:blur(5px);z-index:9999999;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 0.2s;padding:20px;";
  ['wheel', 'mousewheel', 'DOMMouseScroll', 'touchmove', 'touchstart', 'touchend', 'keydown'].forEach(evt => overlay.addEventListener(evt, e => e.stopPropagation()));
  overlay.innerHTML = `
    <div style="background:white;padding:30px;border-radius:16px;box-shadow:0 20px 40px rgba(0,0,0,0.2);width:100%;max-width:320px;text-align:center;">
      <h3 style="margin:0 0 16px;font-size:18px;color:#111;">提示</h3>
      <p style="font-size:14px;color:#444;margin:0 0 24px;line-height:1.5;white-space:pre-wrap;">${msg}</p>
      <button id="customAlertBtn" style="width:100%;padding:10px;border:none;background:#111;color:white;border-radius:8px;cursor:pointer;font-weight:500;">确定</button>
    </div>
  `;
  document.body.appendChild(overlay);
  setTimeout(() => overlay.style.opacity = "1", 10);
  
  document.getElementById("customAlertBtn").addEventListener("click", () => {
    overlay.style.opacity = "0";
    setTimeout(() => {
      overlay.remove();
      if (onConfirm) onConfirm();
    }, 200);
  });
}

function customConfirm(msg, onConfirm, onCancel) {
  const overlay = document.createElement("div");
  overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.6);backdrop-filter:blur(5px);z-index:9999999;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 0.2s;padding:20px;";
  ['wheel', 'mousewheel', 'DOMMouseScroll', 'touchmove', 'touchstart', 'touchend', 'keydown'].forEach(evt => overlay.addEventListener(evt, e => e.stopPropagation()));
  overlay.innerHTML = `
    <div style="background:white;padding:30px;border-radius:16px;box-shadow:0 20px 40px rgba(0,0,0,0.2);width:100%;max-width:320px;text-align:center;">
      <h3 style="margin:0 0 16px;font-size:18px;color:#111;">确认</h3>
      <p style="font-size:14px;color:#444;margin:0 0 24px;line-height:1.5;white-space:pre-wrap;">${msg}</p>
      <div style="display:flex;gap:12px;">
        <button id="customConfirmCancel" style="flex:1;padding:10px;border:none;background:#f5f5f5;color:#333;border-radius:8px;cursor:pointer;font-weight:500;">取消</button>
        <button id="customConfirmOk" style="flex:1;padding:10px;border:none;background:#FF4444;color:white;border-radius:8px;cursor:pointer;font-weight:500;">确认</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  setTimeout(() => overlay.style.opacity = "1", 10);
  
  const close = () => {
    overlay.style.opacity = "0";
    setTimeout(() => overlay.remove(), 200);
  };
  
  document.getElementById("customConfirmCancel").addEventListener("click", () => {
    close();
    if (onCancel) onCancel();
  });
  
  document.getElementById("customConfirmOk").addEventListener("click", () => {
    close();
    if (onConfirm) onConfirm();
  });
}
// --------------------

const DEFAULT_DATA = {
  bio: "我是张一诺，一名视觉传达专业的大三学生，在这里记录了我的学习历程、兴趣爱好和生活点滴。",
  contactTitle: "哈喽呀！👋",
  contactDesc: "有什么想跟我分享的，或者最近有什么好玩的事，都可以在这里给我留言哦～",
  favorites: [
    { icon: "🎵", title: "喜欢的音乐创作者", desc: "DECO*27 / 稲葉曇\nピノキオピー / wowaka" },
    { icon: "🎮", title: "Games", desc: "cs / 弹丸论破\n三角洲 / 明日方舟" },
    { icon: "🎬", title: "Movies", desc: "沙丘 / 寻梦环游记 / 遗愿清单" },
    { icon: "📺", title: "Anime", desc: "龙与虎 / 中二病也要谈恋爱\n超时空辉夜姬 / 齐木楠雄的灾难" }
  ],
  works: [
    {
      title: "STYLIZED PROP",
      subtitle: "风格化道具",
      software: "Blender,Substance Painter,Photoshop",
      refImg: "https://images.unsplash.com/photo-1616499370260-485e3e58b10b?w=800&q=80",
      effectImg: "https://images.unsplash.com/photo-1541562232579-512a21360020?w=800&q=80"
    },
    {
      title: "CYBERPUNK 2077",
      subtitle: "2077典式",
      software: "Maya,ZBrush,Unreal Engine 5",
      refImg: "https://images.unsplash.com/photo-1620025776269-14a51e1fa462?w=800&q=80",
      effectImg: "https://images.unsplash.com/photo-1533423996375-f914ab160932?w=800&q=80"
    },
    {
      title: "WORK IN PROGRESS",
      subtitle: "制作中",
      software: "",
      refImg: "",
      effectImg: ""
    },
    { title: "WORK IN PROGRESS", subtitle: "制作中", software: "", refImg: "", effectImg: "" },
    { title: "WORK IN PROGRESS", subtitle: "制作中", software: "", refImg: "", effectImg: "" },
    { title: "WORK IN PROGRESS", subtitle: "制作中", software: "", refImg: "", effectImg: "" },
    { title: "WORK IN PROGRESS", subtitle: "制作中", software: "", refImg: "", effectImg: "" },
    { title: "WORK IN PROGRESS", subtitle: "制作中", software: "", refImg: "", effectImg: "" }
  ]
};

// 1. 初始化 DOM 同步 (Synchronous execution)
async function initDynamicContent() {
  let fallbackData = JSON.parse(JSON.stringify(DEFAULT_DATA));
  try {
    const res = await fetch('./portfolio_data.json');
    if (res.ok) {
      fallbackData = await res.json();
    }
  } catch (e) {
    // Ignore fetch errors
  }

  const dataStr = localStorage.getItem('myPortfolioData');
  let data = dataStr ? JSON.parse(dataStr) : fallbackData;
  
  window._currentSiteData = data; // save for getSiteData to use synchronously
  
  // Migration logic for user who was affected by the initial 3-item overwrite
  if (data && data.works && data.works.length === 3 && data._migratedFolderV2 !== true) {
    data.works.push(
      { title: "WORK IN PROGRESS", subtitle: "制作中", software: "", refImg: "", effectImg: "" },
      { title: "WORK IN PROGRESS", subtitle: "制作中", software: "", refImg: "", effectImg: "" },
      { title: "WORK IN PROGRESS", subtitle: "制作中", software: "", refImg: "", effectImg: "" },
      { title: "WORK IN PROGRESS", subtitle: "制作中", software: "", refImg: "", effectImg: "" },
      { title: "WORK IN PROGRESS", subtitle: "制作中", software: "", refImg: "", effectImg: "" }
    );
    data._migratedFolderV2 = true;
    localStorage.setItem('myPortfolioData', JSON.stringify(data));
  }
  
  // Quick fix for the empty strings we added mistakenly earlier:
  if (data && data.works) {
    let changed = false;
    data.works.forEach(w => {
      if (w.title === "" && w.subtitle === "") {
        w.title = "WORK IN PROGRESS";
        w.subtitle = "制作中";
        changed = true;
      }
    });
    if (changed) {
      localStorage.setItem('myPortfolioData', JSON.stringify(data));
    }
  }

  // If no customized data, just leave original HTML intact.
  if (!data) return;

  // Render Bio
  const bioEl = document.querySelector('.about-bio p');
  if (bioEl && data.bio) {
    bioEl.textContent = data.bio;
  }

  // Render Contact
  const contactHeader = document.getElementById("contactModalHeader");
  if (contactHeader) {
    const title = contactHeader.querySelector('h3');
    const desc = contactHeader.querySelector('p');
    if (title && data.contactTitle) title.textContent = data.contactTitle;
    if (desc && data.contactDesc) desc.textContent = data.contactDesc;
  }

  // Render Favorites
  const favGrid = document.querySelector('.favorites-grid');
  if (favGrid && data.favorites && data.favorites.length > 0) {
    favGrid.innerHTML = data.favorites.map(fav => `
      <div class="fav-item">
        <div class="fav-icon">${fav.icon}</div>
        <div class="fav-text">
          <span>${fav.title}</span>
          <strong>${fav.desc.replace(/\\n/g, '<br />')}</strong>
        </div>
      </div>
    `).join('');
  }

  // Render Works
  const worksContainer = document.querySelector('.works-editorial');
  if (worksContainer && data.works && data.works.length > 0) {
    worksContainer.innerHTML = data.works.map((work, index) => `
      <div class="folder-item" style="z-index: ${index + 1};" data-title="${work.title}" data-subtitle="${work.subtitle}" data-software="${work.software || ''}" data-ref-img="${work.refImg || ''}" data-effect-img="${work.effectImg || ''}">
        <svg class="folder-bg" width="380" height="520" viewBox="0 0 380 520" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M 3 517 V 14 C 3 7.9 7.9 3 14 3 H 170 C 176 3 180 5 184 10 L 204 34 C 206 38 210 40 214 40 H 366 C 372.6 40 377 45.4 377 52 V 517 Z" fill="#FAFAFA" stroke="#E0E0E0" stroke-width="2" stroke-linejoin="round" />
        </svg>
        <div class="folder-content">
          <div class="folder-label-en">${work.title}</div>
          <div class="folder-label-cn">${work.subtitle}</div>
        </div>
        <div class="folder-logo">
          <svg width="40" height="20" viewBox="0 0 40 20" fill="none" stroke="#111" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M 10 15 C 4 15 2 10 5 5 C 9 0 14 5 20 10 C 26 15 31 20 35 15 C 38 10 36 5 30 5" />
          </svg>
        </div>
      </div>
    `).join('');
  }
}

// 执行初始化
initDynamicContent();

// 2. 注入后台管理 UI 和 留言板拦截
document.addEventListener("DOMContentLoaded", () => {
  renderAdminButton();

  // 留言板拦截
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      // 这里的 submit 事件可能会和 index.html 里的有竞争，所以加一点延迟保证自己不破坏原来的 UI 流
      const name = document.getElementById("name")?.value;
      const email = document.getElementById("email")?.value;
      const message = document.getElementById("message")?.value;

      if (name && message) {
        // Save to Firebase
        addMessage(name, email, message).catch(console.error);

        // Also save to localStorage as a fallback
        let messages = JSON.parse(localStorage.getItem('portfolioMessages') || '[]');
        messages.push({
          date: new Date().toLocaleString(),
          name,
          email: email || '未留联系方式',
          message
        });
        localStorage.setItem('portfolioMessages', JSON.stringify(messages));
      }
    });
  }
});

function renderAdminButton() {
  const btn = document.createElement("button");
  btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`;
  btn.style.cssText = "position:fixed;bottom:24px;left:24px;width:48px;height:48px;border-radius:50%;background:#ffffff;color:#111;border:1px solid #eaeaea;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:99999;box-shadow:0 8px 16px rgba(0,0,0,0.06);transition:all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);";
  btn.title = "后台管理 / Admin Panel";
  
  btn.addEventListener("mouseenter", () => { btn.style.transform = "scale(1.05) translateY(-2px)"; btn.style.boxShadow = "0 12px 24px rgba(0,0,0,0.12)"; });
  btn.addEventListener("mouseleave", () => { btn.style.transform = ""; btn.style.boxShadow = "0 8px 16px rgba(0,0,0,0.06)"; });
  
  btn.addEventListener("click", () => {
    if (document.getElementById("adminPwdModal")) return;

    const pwdModal = document.createElement("div");
    pwdModal.id = "adminPwdModal";
    pwdModal.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.6);backdrop-filter:blur(5px);z-index:999999;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 0.2s;padding:20px;";
    
    // Stop scrolling events from propagating
    ['wheel', 'mousewheel', 'DOMMouseScroll', 'touchmove', 'touchstart', 'touchend', 'keydown'].forEach(evt => {
      pwdModal.addEventListener(evt, (e) => e.stopPropagation());
    });

    pwdModal.innerHTML = `
      <div style="background:white;padding:30px;border-radius:16px;box-shadow:0 20px 40px rgba(0,0,0,0.2);width:100%;max-width:320px;text-align:center;">
        <h3 style="margin:0 0 16px;font-size:18px;color:#111;">请输入后台密码</h3>
        <input type="password" id="adminPwdInput" style="width:100%;padding:10px 14px;border:1px solid #ddd;border-radius:8px;font-size:16px;margin-bottom:20px;text-align:center;font-family:monospace;" placeholder="•••••" />
        <div style="display:flex;gap:12px;">
          <button id="adminPwdCancel" style="flex:1;padding:10px;border:none;background:#f5f5f5;color:#333;border-radius:8px;cursor:pointer;font-weight:500;">取消</button>
          <button id="adminPwdConfirm" style="flex:1;padding:10px;border:none;background:#111;color:white;border-radius:8px;cursor:pointer;font-weight:500;">确认</button>
        </div>
      </div>
    `;

    document.body.appendChild(pwdModal);
    
    // Focus and animation
    setTimeout(() => {
      pwdModal.style.opacity = "1";
      document.getElementById("adminPwdInput").focus();
    }, 10);

    const closePwd = () => {
      pwdModal.style.opacity = "0";
      setTimeout(() => pwdModal.remove(), 200);
    };

    document.getElementById("adminPwdCancel").addEventListener("click", closePwd);
    
    const checkPwd = () => {
      const pwd = document.getElementById("adminPwdInput").value;
      if (pwd === "1593574628q") {
        closePwd();
        openAdminPanel();
      } else {
        const input = document.getElementById("adminPwdInput");
        input.style.borderColor = "red";
        input.classList.add("shake-animation");
        setTimeout(() => input.classList.remove("shake-animation"), 400);
      }
    };
    
    document.getElementById("adminPwdConfirm").addEventListener("click", checkPwd);
    document.getElementById("adminPwdInput").addEventListener("keydown", (e) => {
      if (e.key === "Enter") checkPwd();
      if (e.key === "Escape") closePwd();
    });
  });

  document.body.appendChild(btn);
}

function getSiteData() {
  const dataStr = localStorage.getItem('myPortfolioData');
  if (dataStr) return JSON.parse(dataStr);
  if (window._currentSiteData) return JSON.parse(JSON.stringify(window._currentSiteData));
  return JSON.parse(JSON.stringify(DEFAULT_DATA));
}

function saveSiteData(data) {
  localStorage.setItem('myPortfolioData', JSON.stringify(data));
  customAlert('保存成功！页面即将刷新以应用更改。\n注意：因为您目前是部署在静态托管服务上，数据仅保存在您本人的浏览器里。如果您希望公开看到这些更改，请点击后台的“导出 JSON”并在代码库里应用。', () => {
    location.reload();
  });
}

function openAdminPanel() {
  if (document.getElementById("adminPanelModal")) return;
  
  const data = getSiteData();

  const modal = document.createElement("div");
  modal.id = "adminPanelModal";
  modal.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.6);backdrop-filter:blur(10px);z-index:100000;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 0.3s;padding:20px;";
  
  // Stop scrolling events from propagating to the main page smooth scroller
  ['wheel', 'mousewheel', 'DOMMouseScroll', 'touchmove', 'touchstart', 'touchend', 'keydown'].forEach(evt => {
    modal.addEventListener(evt, (e) => e.stopPropagation());
  });

  const content = document.createElement("div");
  content.style.cssText = "background:white;width:100%;max-width:800px;max-height:85vh;border-radius:16px;box-shadow:0 24px 64px rgba(0,0,0,0.3);display:flex;flex-direction:column;overflow:hidden;";
  
  const header = document.createElement("div");
  header.style.cssText = "padding:20px 24px;border-bottom:1px solid #ebebeb;display:flex;justify-content:space-between;align-items:center;";
  header.innerHTML = `<h2 style="margin:0;font-size:20px;font-weight:600;">🛠️ 内容管理后台</h2><button id="adminCloseBtn" style="background:none;border:none;font-size:24px;cursor:pointer;color:#888;">&times;</button>`;

  const body = document.createElement("div");
  body.style.cssText = "padding:24px;flex:1;overflow-y:auto;background:#fafafa;";
  
  body.innerHTML = `
    <style>
      .admin-section { background: white; border: 1px solid #eaeaea; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
      .admin-section h3 { margin: 0 0 16px 0; font-size: 16px; display: flex; align-items: center; justify-content: space-between; }
      .admin-field { margin-bottom: 16px; }
      .admin-field label { display: block; font-size: 13px; color: #555; margin-bottom: 6px; font-weight: 500;}
      .admin-field input, .admin-field textarea { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px; font-family: inherit; font-size: 14px; transition: border-color 0.2s;}
      .admin-field input:focus, .admin-field textarea:focus { outline: none; border-color: #111; }
      .admin-works-list, .admin-favs-list { display: flex; flex-direction: column; gap: 12px; }
      .admin-list-item { border: 1px solid #eaeaea; padding: 16px; border-radius: 8px; background: #fafafa; position: relative; }
      .admin-btn { background: #111; color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 500; transition: opacity 0.2s;}
      .admin-btn:hover { opacity: 0.8; }
      .admin-btn.danger { background: #FF4444; }
      .admin-btn.ghost { background: #eee; color: #333; }
      .remove-btn { position: absolute; top: 16px; right: 16px; background: #FF4444; color: white; border: none; border-radius: 4px; padding: 4px 8px; font-size: 12px; cursor: pointer; }
    </style>
    
    <div class="admin-section">
      <h3>个人简介 / Bio</h3>
      <div class="admin-field">
        <textarea id="adminBio" rows="3"></textarea>
      </div>
    </div>
    
    <div class="admin-section">
      <h3>联系方式弹窗文字 / Contact Text</h3>
      <div class="admin-field">
        <label>联系我标题</label>
        <input type="text" id="adminContactTitle">
      </div>
      <div class="admin-field">
        <label>联系我提示</label>
        <textarea id="adminContactDesc" rows="2"></textarea>
      </div>
    </div>
    
    <div class="admin-section">
      <h3>资讯/喜爱事物 / News & Favorites</h3>
      <div class="admin-favs-list" id="adminFavsList"></div>
      <button class="admin-btn ghost" id="adminAddFavBtn" style="margin-top: 16px; width: 100%;">+ 新增内容</button>
    </div>

    <div class="admin-section">
      <h3>个人作品 / Works</h3>
      <div class="admin-works-list" id="adminWorksList"></div>
      <button class="admin-btn ghost" id="adminAddWorkBtn" style="margin-top: 16px; width: 100%;">+ 新增文件夹 (Add Folder)</button>
    </div>

    <div class="admin-section">
      <h3>留言板 / Messages</h3>
      <div id="adminMessagesList" style="display:flex; flex-direction:column; gap:12px;"></div>
    </div>
  `;

  const footer = document.createElement("div");
  footer.style.cssText = "padding:16px 24px;border-top:1px solid #ebebeb;display:flex;justify-content:space-between;align-items:center;background:white;";
  footer.innerHTML = `
    <div style="display:flex; gap:12px;">
      <button class="admin-btn ghost" id="adminExportBtn" title="可导出 JSON 文件后再放入代码库，实现在静态网站中全网更新">⬇️ 导出数据保存</button>
      <button class="admin-btn ghost" id="adminImportBtn">⬆️ 导入数据修改</button>
      <input type="file" id="adminImportFile" style="display:none" accept=".json" />
    </div>
    <div style="display:flex; gap:12px;">
      <button class="admin-btn danger" id="adminResetBtn">恢复默认内容</button>
      <button class="admin-btn" id="adminSaveBtn">保存更改</button>
    </div>
  `;

  content.appendChild(header);
  content.appendChild(body);
  content.appendChild(footer);
  modal.appendChild(content);
  document.body.appendChild(modal);

  // Populate data
  document.getElementById("adminBio").value = data.bio || '';
  document.getElementById("adminContactTitle").value = data.contactTitle || '';
  document.getElementById("adminContactDesc").value = data.contactDesc || '';
  
  const renderFavs = () => {
    const list = document.getElementById("adminFavsList");
    list.innerHTML = "";
    data.favorites.forEach((fav, i) => {
      const el = document.createElement("div");
      el.className = "admin-list-item";
      el.innerHTML = `
        <button class="remove-btn" data-index="${i}">删除</button>
        <div style="display:flex; gap:12px; margin-bottom: 12px;">
          <div class="admin-field" style="width:80px">
            <label>前置图标</label>
            <input type="text" class="fav-icon-input" value="${fav.icon}">
          </div>
          <div class="admin-field" style="flex:1">
            <label>小标题</label>
            <input type="text" class="fav-title-input" value="${fav.title}">
          </div>
        </div>
        <div class="admin-field">
          <label>正文内容（允许多行展示）</label>
          <textarea class="fav-desc-input" rows="2">${fav.desc}</textarea>
        </div>
      `;
      el.querySelector('.remove-btn').addEventListener("click", () => {
        customConfirm("确定删除此项？", () => { data.favorites.splice(i, 1); renderFavs(); });
      });
      el.querySelector('.fav-icon-input').addEventListener("input", (e) => data.favorites[i].icon = e.target.value);
      el.querySelector('.fav-title-input').addEventListener("input", (e) => data.favorites[i].title = e.target.value);
      el.querySelector('.fav-desc-input').addEventListener("input", (e) => data.favorites[i].desc = e.target.value);
      list.appendChild(el);
    });
  };

  const renderWorks = () => {
    const list = document.getElementById("adminWorksList");
    list.innerHTML = "";
    data.works.forEach((work, i) => {
      const el = document.createElement("div");
      el.className = "admin-list-item";
      el.style.padding = "0"; // removing default padding for accordion style
      
      const header = document.createElement("div");
      header.style.cssText = "padding: 16px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; background: #fafafa; border-radius: 8px;";
      header.innerHTML = `
        <div style="font-weight: 500;">
          <span style="color: #666; margin-right: 8px;">#${i + 1}</span>
          ${work.title || '未命名作品'} <span style="color: #888; font-size: 13px;">(${work.subtitle || '-'})</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <button class="remove-btn" data-index="${i}" style="position: static; padding: 4px 8px; margin: 0;">删除</button>
          <svg class="chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="transition: transform 0.2s; transform: rotate(0deg);"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </div>
      `;

      const content = document.createElement("div");
      content.style.cssText = "padding: 16px; border-top: 1px solid #eaeaea; display: none;";
      
      let isOpen = false;
      header.addEventListener("click", (e) => {
        if (e.target.closest('.remove-btn')) return; // ignore delete btn
        isOpen = !isOpen;
        content.style.display = isOpen ? "block" : "none";
        header.querySelector('.chevron').style.transform = isOpen ? "rotate(180deg)" : "rotate(0deg)";
        header.style.borderBottomLeftRadius = isOpen ? "0" : "8px";
        header.style.borderBottomRightRadius = isOpen ? "0" : "8px";
      });

      content.innerHTML = `
        <div style="display:flex; gap:12px; margin-bottom: 8px;">
          <div class="admin-field" style="flex:1">
            <label>大标题 (如英文项目名)</label>
            <input type="text" class="work-title" value="${work.title}">
          </div>
          <div class="admin-field" style="flex:1">
            <label>副标题 (如中文描述)</label>
            <input type="text" class="work-subtitle" value="${work.subtitle}">
          </div>
        </div>
        <div class="admin-field">
          <label>使用软件 (软件名以逗号分隔，用于生成标签)</label>
          <input type="text" class="work-software" value="${work.software}">
        </div>
        <div class="admin-field">
          <label>展开后：参考图 (多图支持，悬浮可点击删除)</label>
          <div class="work-ref-preview" style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:8px; min-height:40px; border: 1px dashed #ddd; border-radius: 8px; padding: 8px; background: #fafafa;"></div>
          <div style="display:flex; gap:8px;">
            <input type="text" class="work-ref-add" placeholder="输入外部图片链接，按回车键添加" style="flex:1;">
            <label style="cursor:pointer; background:#f0f0f0; border:1px solid #ddd; border-radius:8px; padding:0 12px; display:flex; align-items:center; font-size: 13px; white-space:nowrap;">
              上传图片
              <input type="file" multiple style="display:none;" class="work-ref-file" accept="image/*">
            </label>
          </div>
          <input type="hidden" class="work-ref" value="${work.refImg}">
        </div>
        <div class="admin-field">
          <label>展开后：效果图 (多图支持，悬浮可点击删除)</label>
          <div class="work-effect-preview" style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:8px; min-height:40px; border: 1px dashed #ddd; border-radius: 8px; padding: 8px; background: #fafafa;"></div>
          <div style="display:flex; gap:8px;">
            <input type="text" class="work-effect-add" placeholder="输入外部图片链接，按回车键添加" style="flex:1;">
            <label style="cursor:pointer; background:#f0f0f0; border:1px solid #ddd; border-radius:8px; padding:0 12px; display:flex; align-items:center; font-size: 13px; white-space:nowrap;">
              上传图片
              <input type="file" multiple style="display:none;" class="work-effect-file" accept="image/*">
            </label>
          </div>
          <input type="hidden" class="work-effect" value="${work.effectImg}">
        </div>
      `;

      el.appendChild(header);
      el.appendChild(content);

      el.querySelector('.remove-btn').addEventListener("click", (e) => {
        e.stopPropagation();
        customConfirm("确定删除此作品？", () => { data.works.splice(i, 1); renderWorks(); });
      });
      el.querySelector('.work-title').addEventListener("input", (e) => {
        data.works[i].title = e.target.value;
        header.querySelector('div').innerHTML = `<span style="color: #666; margin-right: 8px;">#${i + 1}</span>${e.target.value || '未命名作品'} <span style="color: #888; font-size: 13px;">(${data.works[i].subtitle || '-'})</span>`;
      });
      el.querySelector('.work-subtitle').addEventListener("input", (e) => {
        data.works[i].subtitle = e.target.value;
        header.querySelector('div').innerHTML = `<span style="color: #666; margin-right: 8px;">#${i + 1}</span>${data.works[i].title || '未命名作品'} <span style="color: #888; font-size: 13px;">(${e.target.value || '-'})</span>`;
      });
      el.querySelector('.work-software').addEventListener("input", (e) => data.works[i].software = e.target.value);
      
      const setupImageManager = (key, hiddenInputCls, previewCls, addInputCls, fileInputCls) => {
        const hiddenInput = el.querySelector(hiddenInputCls);
        const previewEl = el.querySelector(previewCls);
        const addInput = el.querySelector(addInputCls);
        const fileInput = el.querySelector(fileInputCls);

        const renderPreviews = () => {
          previewEl.innerHTML = '';
          const val = data.works[i][key];
          if (!val) {
             previewEl.innerHTML = '<div style="color:#aaa; font-size:12px; width:100%; text-align:center; padding:10px 0;">暂无图片</div>';
             return;
          }
          const urls = val.split('|').filter(u => u.trim());
          urls.forEach((url, idx) => {
            const wrap = document.createElement('div');
            wrap.style.cssText = "position:relative; width:64px; height:64px; border-radius:6px; overflow:hidden; border:1px solid #ccc; background:#fff; flex-shrink:0;";
            
            const img = document.createElement('img');
            img.src = url;
            img.style.cssText = "width:100%; height:100%; object-fit:cover;";
            
            const closeBtn = document.createElement('div');
            closeBtn.innerHTML = "✖";
            closeBtn.style.cssText = "position:absolute; inset:0; background:rgba(0,0,0,0.5); color:white; display:flex; align-items:center; justify-content:center; font-size:20px; cursor:pointer; opacity:0; transition:opacity 0.2s;";
            
            wrap.addEventListener('mouseenter', () => closeBtn.style.opacity = '1');
            wrap.addEventListener('mouseleave', () => closeBtn.style.opacity = '0');
            
            closeBtn.onclick = () => {
               urls.splice(idx, 1);
               data.works[i][key] = urls.join('|');
               hiddenInput.value = data.works[i][key];
               renderPreviews();
            };

            wrap.appendChild(img);
            wrap.appendChild(closeBtn);
            previewEl.appendChild(wrap);
          });
        };

        renderPreviews();

        addInput.addEventListener('keydown', (e) => {
           if (e.key === 'Enter') {
             e.preventDefault();
             const newUrl = addInput.value.trim();
             if (newUrl) {
               const val = data.works[i][key];
               const urls = val ? val.split('|').filter(u => u.trim()) : [];
               urls.push(newUrl);
               data.works[i][key] = urls.join('|');
               hiddenInput.value = data.works[i][key];
               addInput.value = '';
               renderPreviews();
             }
           }
        });

        fileInput.addEventListener('change', (e) => {
          const files = e.target.files;
          if (!files.length) return;
          
          let processedDataUrls = [];
          let processedCount = 0;
          
          Array.from(files).forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = function(event) {
              const img = new Image();
              img.onload = function() {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 1200;
                const MAX_HEIGHT = 1200;
                let width = img.width;
                let height = img.height;
                
                if (width > height) {
                  if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                  }
                } else {
                  if (height > MAX_HEIGHT) {
                    width *= MAX_HEIGHT / height;
                    height = MAX_HEIGHT;
                  }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                
                processedDataUrls[index] = dataUrl;
                processedCount++;
                
                if (processedCount === files.length) {
                  const newUrls = processedDataUrls.filter(u => u).join('|');
                  const existingValue = hiddenInput.value ? hiddenInput.value + '|' : '';
                  hiddenInput.value = existingValue + newUrls;
                  data.works[i][key] = hiddenInput.value;
                  renderPreviews();
                }
              }
              img.src = event.target.result;
            }
            reader.readAsDataURL(file);
          });
        });
      };

      setupImageManager('refImg', '.work-ref', '.work-ref-preview', '.work-ref-add', '.work-ref-file');
      setupImageManager('effectImg', '.work-effect', '.work-effect-preview', '.work-effect-add', '.work-effect-file');

      list.appendChild(el);
    });
  };

  const renderMessages = async () => {
    const list = document.getElementById("adminMessagesList");
    list.innerHTML = `<div style="color: #888; font-size: 14px; text-align: center; padding: 20px;">加载中...</div>`;
    
    let messages = [];
    try {
      const fbMessages = await getMessages();
      messages = fbMessages.map(m => ({
        name: m.name,
        email: m.email,
        message: m.message,
        date: m.createdAt ? m.createdAt.toDate().toLocaleString() : new Date().toLocaleString()
      }));
    } catch(err) {
      console.error("Firebase read err: ", err);
      try {
        messages = JSON.parse(localStorage.getItem('portfolioMessages') || '[]');
        messages = messages.reverse();
      } catch(e) {}
    }
    
    if (messages.length === 0) {
      list.innerHTML = `<div style="color: #888; font-size: 14px; text-align: center; padding: 20px;">暂无留言记录</div>`;
      return;
    }
    
    list.innerHTML = messages.map((m, i) => `
      <div style="background: white; border: 1px solid #eee; border-radius: 8px; padding: 16px;">
        <div style="color: #888; font-size: 12px; margin-bottom: 8px; display: flex; justify-content: space-between;">
          <span>${m.name} (${m.email})</span>
          <span>${m.date}</span>
        </div>
        <div style="font-size: 14px; color: #333; white-space: pre-wrap; line-height: 1.5;">${m.message}</div>
      </div>
    `).join('');
  };

  renderFavs();
  renderWorks();
  renderMessages();

  // Events
  document.getElementById("adminCloseBtn").addEventListener("click", () => {
    modal.style.opacity = "0";
    setTimeout(() => modal.remove(), 300);
  });

  document.getElementById("adminAddFavBtn").addEventListener("click", () => {
    data.favorites.push({ icon: "⭐", title: "New Item", desc: "这里是内容\n可以换行哦" });
    renderFavs();
  });

  document.getElementById("adminAddWorkBtn").addEventListener("click", () => {
    data.works.push({ title: "NEW PROJECT", subtitle: "新项目", software: "Blender", refImg: "", effectImg: "" });
    renderWorks();
  });

  document.getElementById("adminBio").addEventListener("input", (e) => data.bio = e.target.value);
  document.getElementById("adminContactTitle").addEventListener("input", (e) => data.contactTitle = e.target.value);
  document.getElementById("adminContactDesc").addEventListener("input", (e) => data.contactDesc = e.target.value);

  document.getElementById("adminSaveBtn").addEventListener("click", () => {
    saveSiteData(data);
  });

  document.getElementById("adminResetBtn").addEventListener("click", () => {
    customConfirm("确定要放弃所有自定义更改并恢复默认演示数据吗？这段操作不可逆转！", () => {
      localStorage.removeItem('myPortfolioData');
      customAlert("已重置。页面即将刷新。", () => {
        location.reload();
      });
    });
  });

  // Import / Export
  document.getElementById("adminExportBtn").addEventListener("click", () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "portfolio_data.json");
    dlAnchorElem.click();
  });

  const importFile = document.getElementById("adminImportFile");
  document.getElementById("adminImportBtn").addEventListener("click", () => {
    importFile.click();
  });

  importFile.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (imported.bio && imported.works) {
          saveSiteData(imported);
        } else {
          customAlert('数据格式不符，请确保导入的 JSON 是之前导出的那份文件。');
        }
      } catch (err) {
        customAlert("JSON 解析失败: " + err.message);
      }
    };
    reader.readAsText(file);
  });

  setTimeout(() => modal.style.opacity = "1", 10);
}
