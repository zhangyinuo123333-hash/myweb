
      const chars = document.querySelectorAll(".hover-char");
      let activeChar = null;
      let startX = 0,
        startY = 0;
      let initialLeft = 0,
        initialTop = 0;

      chars.forEach((char) => {
        char.style.left = "0px";
        char.style.top = "0px";

        char.addEventListener("mousedown", (e) => {
          activeChar = char;
          startX = e.clientX;
          startY = e.clientY;
          initialLeft = parseFloat(char.style.left) || 0;
          initialTop = parseFloat(char.style.top) || 0;
          char.classList.add("dragging");
          e.preventDefault();
        });
      });

      document.addEventListener("mousemove", (e) => {
        if (!activeChar) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        activeChar.style.left = initialLeft + dx + "px";
        activeChar.style.top = initialTop + dy + "px";
      });

      document.addEventListener("mouseup", () => {
        if (activeChar) {
          activeChar.classList.remove("dragging");
          activeChar = null;
        }
      });

      const daisyOval = document.querySelector(".daisy-oval");
      if (daisyOval) {
        daisyOval.addEventListener("click", () => {
          chars.forEach((char) => {
            char.style.left = "0px";
            char.style.top = "0px";
          });
        });
      }

      const emailLink = document.getElementById("email-link");
      const emailText = document.getElementById("email-text");
      const emailToggleBtn = document.getElementById("email-toggle-btn");

      const emails = ["zhangyinuo123333@gmail.com", "3232419389@qq.com"];
      let currentEmailIndex = 0;

      if (emailToggleBtn && emailLink && emailText) {
        emailToggleBtn.addEventListener("click", () => {
          currentEmailIndex = (currentEmailIndex + 1) % emails.length;
          const nextEmail = emails[currentEmailIndex];

          // Animate out
          emailText.style.opacity = "0";
          setTimeout(() => {
            emailText.textContent = nextEmail;
            emailLink.href = "mailto:" + nextEmail;
            // Animate in
            emailText.style.opacity = "1";
          }, 200);
        });

        // Add smooth transition for opacity
        emailText.style.transition = "opacity 0.2s ease";
      }

      const iconRow = document.querySelector(".hero-icons-row");
      if (iconRow) {
        // Clone all icons once to create seamless marquee (total 16 items)
        const icons = Array.from(iconRow.children);
        icons.forEach((icon) => {
          iconRow.appendChild(icon.cloneNode(true));
        });

        // Wrap the row to ensure overflow is hidden on the container
        const wrapper = document.createElement("div");
        wrapper.className = "marquee-container";
        iconRow.parentNode.insertBefore(wrapper, iconRow);
        wrapper.appendChild(iconRow);

        // Click to expand logic
        document.addEventListener("click", (e) => {
          const wrapper = e.target.closest
            ? e.target.closest(".icon-wrapper")
            : null;
          if (wrapper) {
            document
              .querySelectorAll(".icon-wrapper.expanded")
              .forEach((el) => {
                if (el !== wrapper) el.classList.remove("expanded");
              });
            wrapper.classList.toggle("expanded");
          } else {
            // clicking outside collapses all
            document
              .querySelectorAll(".icon-wrapper.expanded")
              .forEach((el) => {
                el.classList.remove("expanded");
              });
          }
        });
      }

      const header = document.querySelector("header");
      if (header) {
        window.addEventListener("scroll", () => {
          if (window.scrollY > 30) {
            header.classList.add("scrolled");
          } else {
            header.classList.remove("scrolled");
          }
        });
      }

      // About Tags Tetris Logic
      (function () {
        const stage = document.getElementById("tetris-stage");
        const overlay = document.getElementById("game-start-overlay");
        const stackCounter = document.getElementById("stack-count");
        const leftBtn = document.getElementById("move-left");
        const rightBtn = document.getElementById("move-right");
        const pauseBtn = document.getElementById("toggle-pause");
        const downBtn = document.getElementById("drop-fast");

        if (!stage) return;

        const skillNames = [
          "PS",
          "Blender",
          "3ds Max",
          "Maya",
          "SP",
          "Marmoset",
          "ZBrush",
          "RizomUV",
          "TopoGun",
          "GPT",
          "Gemini",
          "Claude",
        ];
        const GRID_Y = 36;
        const GRID_X = 80; // 宽度固定为80，移动步长也固定为80

        let stackedElements = [];
        let currentTag = null;
        let gameActive = false;
        let isPaused = false;
        let score = 0;
        let dropCounter = 0;
        let dropInterval = 800; // 下落间隔 (ms)
        let lastTime = 0;

        const konamiCode = [
          "up",
          "down",
          "down",
          "left",
          "right",
          "left",
          "right",
          "b",
          "a",
          "b",
          "a",
        ];
        let konamiIndex = 0;

        function checkKonami(input) {
          if (input === konamiCode[konamiIndex]) {
            konamiIndex++;
            if (konamiIndex === konamiCode.length) {
              activateJackpot();
              konamiIndex = 0;
            }
          } else {
            konamiIndex = 0;
            if (input === konamiCode[0]) {
              konamiIndex = 1;
            }
          }
        }

        let isJackpotMode = false;
        let matterEngine = null;
        let matterRunner = null;
        let matterInterval = null;
        let matterUpdateId = null;
        let matterBodies = [];

        function resetJackpot() {
          isJackpotMode = false;
          isPaused = false;

          if (matterInterval) clearInterval(matterInterval);
          if (matterUpdateId) cancelAnimationFrame(matterUpdateId);
          if (matterRunner) Matter.Runner.stop(matterRunner);
          if (matterEngine) Matter.Engine.clear(matterEngine);

          matterBodies.forEach((b) => {
            if (b.el && b.el.parentNode) {
              b.el.parentNode.removeChild(b.el);
            }
          });
          matterBodies = [];
          matterEngine = null;
          matterRunner = null;

          const sectionAbout = document.getElementById("about");
          sectionAbout.style.position = "";
          sectionAbout.style.overflow = "";

          resetGame();
        }

        function activateJackpot() {
          score = 999;
          stackCounter.textContent = score;
          stackCounter.classList.add("jackpot-effect");
          setTimeout(
            () => stackCounter.classList.remove("jackpot-effect"),
            5000,
          ); // Effect lasts for 5 seconds

          triggerMatterJsRain();

          window.hasTriggeredEasterEgg = true;
          const petMsg = document.querySelector(".pet-message");
          const pet = document.getElementById("desktop-pet");
          if (petMsg && pet) {
            petMsg.textContent = "这是什么!!!Σ(°Д°ノ)ノ";
            pet.classList.add("force-show-msg");
            setTimeout(() => {
              pet.classList.remove("force-show-msg");
            }, 5000);
          }
        }

        function triggerMatterJsRain() {
          if (!window.Matter) {
            console.error("Matter.js is not loaded!");
            return;
          }

          isJackpotMode = true;
          isPaused = true; // freeze normal game
          pauseBtn.innerHTML = ResetIcon; // show reset button

          // hide normal game overlay text if it exists
          overlay.classList.add("hidden");

          const sectionAbout = document.getElementById("about");
          sectionAbout.style.position = "relative";
          sectionAbout.style.overflow = "hidden";

          const stageRect = document
            .getElementById("tetris-stage")
            .getBoundingClientRect();
          const aboutRect = sectionAbout.getBoundingClientRect();

          const Engine = Matter.Engine,
            Runner = Matter.Runner,
            Bodies = Matter.Bodies,
            Composite = Matter.Composite;

          matterEngine = Engine.create();
          const world = matterEngine.world;

          const w = sectionAbout.clientWidth;
          const h = sectionAbout.clientHeight;

          const ground = Bodies.rectangle(w / 2, h + 25, w, 50, {
            isStatic: true,
          });
          const leftWall = Bodies.rectangle(-25, h / 2, 50, h * 2, {
            isStatic: true,
          });
          const rightWall = Bodies.rectangle(w + 25, h / 2, 50, h * 2, {
            isStatic: true,
          });
          Composite.add(world, [ground, leftWall, rightWall]);

          matterRunner = Runner.create();
          Runner.run(matterRunner, matterEngine);

          const Mouse = Matter.Mouse,
            MouseConstraint = Matter.MouseConstraint;

          const mouse = Mouse.create(sectionAbout);
          mouse.element.removeEventListener("wheel", mouse.mousewheel);
          mouse.element.removeEventListener("mousewheel", mouse.mousewheel);
          mouse.element.removeEventListener("DOMMouseScroll", mouse.mousewheel);

          const mouseConstraint = MouseConstraint.create(matterEngine, {
            mouse: mouse,
            constraint: {
              stiffness: 0.2,
              render: {
                visible: false,
              },
            },
          });
          Composite.add(matterEngine.world, mouseConstraint);

          matterBodies = [];

          function addBlock() {
            const name =
              skillNames[Math.floor(Math.random() * skillNames.length)];
            const el = document.createElement("div");
            el.className = "falling-tag";
            el.textContent = name;
            el.style.position = "absolute";
            el.style.left = "0";
            el.style.top = "0";
            el.style.margin = "0";
            el.style.transition = "none";
            el.style.zIndex = "50";
            el.style.opacity = "1";
            el.style.pointerEvents = "auto";
            el.style.cursor = "grab";
            el.style.userSelect = "none";
            el.style.webkitUserSelect = "none";

            // Allow them to look "grabbing" while dragging
            el.addEventListener(
              "mousedown",
              () => (el.style.cursor = "grabbing"),
            );
            el.addEventListener("mouseup", () => (el.style.cursor = "grab"));
            el.addEventListener("mouseleave", () => (el.style.cursor = "grab"));

            const units = Math.random() > 0.7 ? 2 : 1;
            const wUnit = units * 80;
            const hUnit = 36;
            el.style.width = wUnit + "px";
            el.style.height = hUnit + "px";

            sectionAbout.appendChild(el);

            const cx = stageRect.left - aboutRect.left + stageRect.width / 2;
            const cy = stageRect.bottom - aboutRect.top - 20;

            const body = Bodies.rectangle(cx, cy, wUnit, hUnit, {
              restitution: 0.5,
              friction: 0.1,
              density: 0.04,
            });

            Matter.Body.setVelocity(body, {
              x: (Math.random() - 0.5) * 30,
              y: -(Math.random() * 20 + 8),
            });
            Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.5);

            Composite.add(world, body);
            matterBodies.push({ body, el });
          }

          let count = 0;
          matterInterval = setInterval(() => {
            addBlock();
            count++;
            if (count >= 123) clearInterval(matterInterval);
          }, 20);

          function updateDOM() {
            if (!isJackpotMode) return;
            matterBodies.forEach((b) => {
              const x = b.body.position.x - parseInt(b.el.style.width) / 2;
              const y = b.body.position.y - parseInt(b.el.style.height) / 2;
              const angle = b.body.angle;
              b.el.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${angle}rad)`;
            });
            matterUpdateId = requestAnimationFrame(updateDOM);
          }
          updateDOM();
        }

        const btnRotate = document.getElementById("rotate-btn");
        const btnB = document.getElementById("btn-b");
        const btnA = document.getElementById("btn-a");

        if (btnRotate)
          btnRotate.addEventListener("click", () => checkKonami("up"));
        if (downBtn)
          downBtn.addEventListener("click", () => checkKonami("down"));
        if (leftBtn)
          leftBtn.addEventListener("click", () => checkKonami("left"));
        if (rightBtn)
          rightBtn.addEventListener("click", () => checkKonami("right"));
        if (btnB) btnB.addEventListener("click", () => checkKonami("b"));
        if (btnA) btnA.addEventListener("click", () => checkKonami("a"));

        const PauseIcon = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`;
        const PlayIcon = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;
        const ResetIcon = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>`;

        function togglePause() {
          if (isJackpotMode) {
            resetJackpot();
            return;
          }
          if (!gameActive) return;
          isPaused = !isPaused;
          if (pauseBtn) pauseBtn.innerHTML = isPaused ? PlayIcon : PauseIcon;
          if (overlay) {
            overlay.classList.toggle("hidden", !isPaused);
            const overlayText = overlay.querySelector("span:first-child");
            const overlaySubtext = overlay.querySelector("span:last-child");

            if (isPaused) {
              if (overlayText) overlayText.textContent = "PAUSED";
              if (overlaySubtext)
                overlaySubtext.textContent = "CLICK BUTTON TO RESUME";
            } else {
              if (overlayText) overlayText.textContent = "";
              if (overlaySubtext) overlaySubtext.textContent = "";
              lastTime = performance.now(); // Reset lastTime to avoid huge catch-up jump
              gameLoop(lastTime);
            }
          }
        }

        class FallingTag {
          constructor(name) {
            this.element = document.createElement("div");
            this.element.className = "falling-tag";
            this.element.textContent = name;
            stage.appendChild(this.element);

            // 随机选择宽度：1格或2格
            const units = Math.random() > 0.7 ? 2 : 1;
            this.width = units * GRID_X;
            this.height = GRID_Y;
            this.element.style.width = this.width + "px";

            // 对齐到 X 栅格
            const stageWidth = stage.clientWidth;
            const maxCols = Math.floor(stageWidth / GRID_X);
            const span = Math.floor(this.width / GRID_X);
            this.x = Math.floor(Math.random() * (maxCols - span + 1)) * GRID_X;

            this.y = -GRID_Y;

            this.updatePosition();
            requestAnimationFrame(() => (this.element.style.opacity = "1"));
          }

          updatePosition() {
            this.element.style.transform = `translate3d(${this.x}px, ${this.y}px, 0)`;
            applyEdgeStyling(this.element, this.x, this.y, this.width);
          }

          move(dx) {
            if (isPaused) return;
            const nextX = this.x + dx;
            const stageWidth = stage.clientWidth;
            // 边界检查
            if (nextX < 0 || nextX + this.width > stageWidth) return;

            // 碰撞检查
            if (!this.checkCollision(nextX, this.y)) {
              this.x = nextX;
              this.updatePosition();
            }
          }

          checkCollision(nextX, nextY) {
            // 触底
            if (nextY + this.height > stage.offsetHeight) return true;

            // 与已堆叠方块碰撞
            for (let item of stackedElements) {
              if (
                nextX < item.x + item.width &&
                nextX + this.width > item.x &&
                nextY < item.y + item.height &&
                nextY + this.height > item.y
              ) {
                return true;
              }
            }
            return false;
          }

          tick() {
            if (isPaused) return;
            const nextY = this.y + GRID_Y;
            if (this.checkCollision(this.x, nextY)) {
              this.land();
              return false;
            }
            this.y = nextY;
            this.updatePosition();
            return true;
          }

          land() {
            this.element.className = "stacked-tag";
            // 落地后微调 y 坐标，确保完美贴合底部或下方方块
            this.y = Math.floor(this.y / GRID_Y) * GRID_Y;
            this.updatePosition();

            stackedElements.push({
              x: this.x,
              y: this.y,
              width: this.width,
              height: this.height,
              element: this.element,
            });

            // Update styles for all blocks now that a new one is added
            updateStackedBlocksStyling();

            score++;
            if (stackCounter) stackCounter.textContent = score;

            checkAndClearLines();
            spawnTag();
          }
        }

        function applyEdgeStyling(el, x, y, width) {
          const stageHeight = stage.clientHeight;
          const stageWidth = stage.clientWidth;

          // Reset to default
          el.style.borderBottomLeftRadius = "10px";
          el.style.borderBottomRightRadius = "10px";

          // Apply large radius only if at the very bottom and at the edges
          if (y + GRID_Y >= stageHeight - 2) {
            if (x <= 2) {
              el.style.borderBottomLeftRadius = "30px";
            }
            if (x + width >= stageWidth - 2) {
              el.style.borderBottomRightRadius = "30px";
            }
          }
        }

        function updateStackedBlocksStyling() {
          stackedElements.forEach((item) => {
            applyEdgeStyling(item.element, item.x, item.y, item.width);
          });
        }

        function checkAndClearLines() {
          const stageWidth = stage.clientWidth;
          const rowWidthMap = {};

          // 统计每一行已占据的总宽度
          stackedElements.forEach((item) => {
            rowWidthMap[item.y] = (rowWidthMap[item.y] || 0) + item.width;
          });

          // 找出已满的行 (总宽度 >= 舞台宽度)
          const fullRows = Object.keys(rowWidthMap)
            .filter((y) => rowWidthMap[y] >= stageWidth - 2) // 减去一点容差
            .map(Number)
            .sort((a, b) => a - b);

          if (fullRows.length > 0) {
            const fragment = document.createDocumentFragment();
            const particles = [];

            fullRows.forEach((rowY) => {
              const itemsInRow = stackedElements.filter(
                (item) => item.y === rowY,
              );
              itemsInRow.forEach((item) => {
                // 产生粒子消散效果
                const numParticles = Math.max(12, Math.floor(item.width / 5));
                for (let i = 0; i < numParticles; i++) {
                  const p = document.createElement("div");
                  p.className = "tetris-particle";
                  p.style.left = `${item.x + Math.random() * item.width}px`;
                  p.style.top = `${item.y + Math.random() * 30}px`;

                  const angle = Math.random() * Math.PI * 2;
                  const distance = 50 + Math.random() * 80;
                  const tx = Math.cos(angle) * distance;
                  const ty = Math.sin(angle) * distance - 40; // 偏向上方飞散
                  const rot = (Math.random() - 0.5) * 500;

                  p.style.setProperty("--tx", `${tx}px`);
                  p.style.setProperty("--ty", `${ty}px`);
                  p.style.setProperty("--rot", `${rot}deg`);

                  fragment.appendChild(p);
                  particles.push(p);
                }

                // 给被消除的方块本身加个淡出效果后再移除
                item.element.style.transition = "all 0.3s ease";
                item.element.style.opacity = "0";
                item.element.style.transform = `translate3d(${item.x}px, ${item.y}px, 0) scale(0.8)`;
                setTimeout(() => item.element.remove(), 300);
              });

              stackedElements = stackedElements.filter(
                (item) => item.y !== rowY,
              );

              stackedElements.forEach((item) => {
                if (item.y < rowY) {
                  item.y += GRID_Y;
                  item.element.style.transform = `translate3d(${item.x}px, ${item.y}px, 0)`;
                }
              });

              score += 10;
              if (stackCounter) stackCounter.textContent = score;
            });

            if (stage) stage.appendChild(fragment);

            // 批量应用动画，避免在循环中强制重排引发卡顿
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                particles.forEach((p) => p.classList.add("animate"));
              });
            });

            setTimeout(() => {
              particles.forEach((p) => p.remove());
            }, 600);

            updateStackedBlocksStyling();
          }
        }

        function spawnTag() {
          if (!gameActive) return;
          const randomName =
            skillNames[Math.floor(Math.random() * skillNames.length)];
          currentTag = new FallingTag(randomName);

          if (currentTag.checkCollision(currentTag.x, currentTag.y)) {
            gameOver();
          }
        }

        function gameLoop(time = 0) {
          if (!gameActive || isPaused) return;

          const deltaTime = time - lastTime;
          lastTime = time;
          dropCounter += deltaTime;

          if (dropCounter > dropInterval) {
            if (currentTag) currentTag.tick();
            dropCounter = 0;
          }

          requestAnimationFrame(gameLoop);
        }

        function gameOver() {
          gameActive = false;
          isPaused = false;
          if (pauseBtn) pauseBtn.innerHTML = PauseIcon;
          if (overlay) {
            overlay.classList.remove("hidden");
            const title = overlay.querySelector("span:first-child");
            const sub = overlay.querySelector("span:last-child");
            if (title) title.textContent = "GAME OVER";
            if (sub) sub.textContent = "FINAL STACK: " + score;
          }
        }

        function resetGame() {
          if (isPaused) {
            togglePause();
            return;
          }
          if (stage)
            stage
              .querySelectorAll(".stacked-tag, .falling-tag")
              .forEach((el) => el.remove());
          stackedElements = [];
          score = 0;
          if (stackCounter) stackCounter.textContent = score;
          gameActive = true;
          isPaused = false;
          if (pauseBtn) pauseBtn.innerHTML = PauseIcon;
          dropInterval = 800;
          lastTime = performance.now();
          if (overlay) overlay.classList.add("hidden");
          spawnTag();
          gameLoop(lastTime);
        }

        if (overlay) overlay.addEventListener("click", resetGame);
        if (leftBtn)
          leftBtn.addEventListener(
            "click",
            () => currentTag && currentTag.move(-GRID_X),
          );
        if (rightBtn)
          rightBtn.addEventListener(
            "click",
            () => currentTag && currentTag.move(GRID_X),
          );
        if (pauseBtn) pauseBtn.addEventListener("click", togglePause);
        if (downBtn) {
          downBtn.addEventListener(
            "mousedown",
            () => !isPaused && (dropInterval = 50),
          );
          downBtn.addEventListener(
            "mouseup",
            () => !isPaused && (dropInterval = 800),
          );
          downBtn.addEventListener(
            "mouseleave",
            () => !isPaused && (dropInterval = 800),
          );
        }

        document.addEventListener("keydown", (e) => {
          if (!gameActive) return;
          if (e.key.toLowerCase() === "p") {
            togglePause();
            return;
          }
          if (isPaused || !currentTag) return;
          if (e.key === "ArrowLeft") currentTag.move(-GRID_X);
          if (e.key === "ArrowRight") currentTag.move(GRID_X);
          if (e.key === "ArrowDown") dropInterval = 50;
        });
        document.addEventListener("keyup", (e) => {
          if (e.key === "ArrowDown") dropInterval = 800;
        });

        // About Image Glass Intensity Controller
        const glassSlider = document.getElementById("glass-intensity");
        const imageFrame = document.querySelector(".about-image-frame");

        if (glassSlider && imageFrame) {
          glassSlider.addEventListener("input", (e) => {
            const intensity = parseInt(e.target.value);
            // Intensity 0-80
            // Blur: 0 -> intensity
            // Surface Opacity: 0.01 -> 0.3
            // BG Layer Opacity: 0 -> 0.9
            const surfaceOpacity = 0.02 + (intensity / 80) * 0.28;
            const bgOpacity = (intensity / 80) * 0.9;

            imageFrame.style.setProperty("--glass-blur", intensity + "px");
            imageFrame.style.setProperty(
              "--glass-surface-opacity",
              surfaceOpacity,
            );
            imageFrame.style.setProperty("--glass-bg-opacity", bgOpacity);
          });
        }

        // Desktop Pet Mouse Interaction
        window.addEventListener("load", () => {
          const pet = document.getElementById("desktop-pet");
          if (pet) {
            const petMsg = pet.querySelector(".pet-message");
            let hasShownAboutHint = false;

            pet.addEventListener("mousedown", () => {
              let bestSection = null;
              let maxArea = 0;
              // Find the section that occupies the largest portion of the viewport
              document.querySelectorAll("section").forEach((sec) => {
                const rect = sec.getBoundingClientRect();
                const visibleTop = Math.max(0, rect.top);
                const visibleBottom = Math.min(window.innerHeight, rect.bottom);
                const visibleHeight = Math.max(0, visibleBottom - visibleTop);

                if (visibleHeight > maxArea) {
                  maxArea = visibleHeight;
                  bestSection = sec;
                }
              });

              let messages = [
                "你好呀！(ฅ´ω`ฅ)",
                "需要帮忙吗？",
                "在看我的作品集吗？",
                "摸摸头~",
                "今天也要加油哦！",
              ];

              if (bestSection) {
                if (bestSection.classList.contains("hero")) {
                  messages = [
                    "欢迎来到我的主页呀！(ฅ´ω`ฅ)",
                    "很高兴见到你~",
                    "可以往下滑滑看哦！",
                  ];
                } else if (bestSection.id === "about") {
                  if (window.hasTriggeredEasterEgg) {
                    messages = ["这是什么!!!Σ(°Д°ノ)ノ"];
                  } else if (!hasShownAboutHint) {
                    messages = ["为什么俄罗斯方块有A和B键Σ( ° △ °|||)︴？"];
                    hasShownAboutHint = true;
                  } else {
                    messages = [
                      "为什么俄罗斯方块有A和B键Σ( ° △ °|||)︴？",
                      "这是关于我的故事~",
                      "想更了解我吗？",
                    ];
                  }
                } else if (bestSection.id === "doing") {
                  messages = [
                    "这些是我专注的领域！",
                    "创意编程超有趣！",
                    "一直在尝试新东西~",
                  ];
                } else if (bestSection.id === "works") {
                  messages = [
                    "看看我的作品集吧！",
                    "觉得这些设计怎么样？",
                    "花了很多心思做的呢！",
                  ];
                } else if (bestSection.classList.contains("bottom-section")) {
                  messages = [
                    "期待你的来信呀~",
                    "要不要交个朋友？",
                    "随时可以发消息给我！",
                  ];
                } else if (bestSection.querySelector(".services-grid")) {
                  messages = [
                    "想和我合作吗？",
                    "我们一起搞点事情吧！",
                    "期待与你的灵感碰撞！",
                  ];
                }
              }

              let randomMsg;
              if (messages.length > 1) {
                do {
                  randomMsg =
                    messages[Math.floor(Math.random() * messages.length)];
                } while (randomMsg === petMsg.textContent);
              } else {
                randomMsg = messages[0];
              }
              if (petMsg) petMsg.textContent = randomMsg;
            });
          }
        });

        // Stacked Card Toggle Logic
        const toggleCardBtn = document.getElementById("toggle-card-btn");
        const funCard = document.getElementById("fun-card");
        const gameCard = document.getElementById("game-card");

        if (toggleCardBtn && funCard && gameCard) {
          toggleCardBtn.addEventListener("click", () => {
            if (funCard.classList.contains("back")) {
              funCard.classList.remove("back");
              funCard.classList.add("front");
              gameCard.classList.remove("front");
              gameCard.classList.add("back");
            } else {
              funCard.classList.remove("front");
              funCard.classList.add("back");
              gameCard.classList.remove("back");
              gameCard.classList.add("front");
            }
          });
        }
      })();

      // Full-Page Smooth Magnetic Scroll
      (function () {
        const sections = Array.from(document.querySelectorAll("section"));
        if (sections.length === 0) return;

        document.documentElement.style.scrollBehavior = "auto";

        let currentIdx = 0;
        let isScrolling = false;
        let scrollAnimationId = null;
        let lastTriggerTime = 0;

        const updateInitialIndex = () => {
          const initialScroll = window.scrollY;
          let closestDist = Infinity;
          sections.forEach((sec, idx) => {
            const dist = Math.abs(sec.offsetTop - initialScroll);
            if (dist < closestDist) {
              closestDist = dist;
              currentIdx = idx;
            }
          });
        };
        updateInitialIndex();

        // 优化切页动画节奏，加入自然缓动减速效果，自带轻微惯性质感
        function easeOutQuart(t) {
          return 1 - Math.pow(1 - t, 4);
        }

        window.scrollToSection = function(index) {
          if (index < 0 || index >= sections.length) return;
          if (window.innerWidth <= 768) {
            sections[index].scrollIntoView({ behavior: "smooth" });
            return;
          }

          currentIdx = index;
          isScrolling = true;

          if (scrollAnimationId) {
            cancelAnimationFrame(scrollAnimationId);
          }

          const targetY = sections[index].offsetTop;
          const startY = window.scrollY;
          const distance = targetY - startY;

          // 控制动画时长适中，不太快不拖沓
          const duration = 750;
          let startTime = null;

          function step(timestamp) {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            let t = progress / duration;
            if (t > 1) t = 1;

            const easeT = easeOutQuart(t);
            window.scrollTo(0, startY + distance * easeT);

            if (t < 1) {
              scrollAnimationId = requestAnimationFrame(step);
            } else {
              scrollAnimationId = null;
              isScrolling = false;
            }
          }
          scrollAnimationId = requestAnimationFrame(step);
        };
        const scrollToSection = window.scrollToSection;

        let wheelAccumulator = 0;
        let lastWheelTime = 0;

        window.addEventListener(
          "wheel",
          (e) => {
            if (window.innerWidth <= 768) return;
            
            const hasActiveModal = document.querySelector('.folder-modal.is-active, .info-modal.is-active, .contact-modal.is-active, .lightbox-modal.is-active');

            // 放行局部滚动元素
            const isScrollableBlock = e.target.closest(
              ".favorites-grid, .scrollable-element, .folder-modal-content, .info-modal-content, .contact-modal-content",
            );
            
            if (isScrollableBlock) {
              const t = isScrollableBlock;
              const isAtEnd =
                e.deltaY > 0 &&
                t.scrollTop + t.clientHeight >= t.scrollHeight - 1;
              const isAtStart = e.deltaY < 0 && t.scrollTop <= 1;
              if (!isAtEnd && !isAtStart) return;
            }
            
            if (hasActiveModal) {
              e.preventDefault();
              return;
            }

            e.preventDefault();
            const now = Date.now();

            if (now - lastWheelTime > 150) {
              wheelAccumulator = 0;
            }
            lastWheelTime = now;

            // 冷切期，防止一次性滚动导致连续翻好几页错乱，但允许300ms后再次翻页
            if (now - lastTriggerTime < 300) {
              wheelAccumulator = 0;
              return;
            }

            wheelAccumulator += e.deltaY;

            // 一次鼠标滚轮直接跳转下一个整页面
            if (wheelAccumulator > 50) {
              scrollToSection(currentIdx + 1);
              wheelAccumulator = 0;
              lastTriggerTime = now;
            } else if (wheelAccumulator < -50) {
              scrollToSection(currentIdx - 1);
              wheelAccumulator = 0;
              lastTriggerTime = now;
            }
          },
          { passive: false },
        );

        let touchStartY = 0;
        window.addEventListener(
          "touchstart",
          (e) => {
            if (window.innerWidth <= 768) return;
            touchStartY = e.touches[0].clientY;
          },
          { passive: true },
        );

        window.addEventListener(
          "touchmove",
          (e) => {
            if (window.innerWidth <= 768) return;
            const hasActiveModal = document.querySelector('.folder-modal.is-active, .info-modal.is-active, .contact-modal.is-active, .lightbox-modal.is-active');
            const isScrollableBlock = e.target.closest(
              ".favorites-grid, .scrollable-element, .folder-modal-content, .info-modal-content, .contact-modal-content",
            );
            if (isScrollableBlock || hasActiveModal) return;
            e.preventDefault();
          },
          { passive: false },
        );

        window.addEventListener(
          "touchend",
          (e) => {
            if (window.innerWidth <= 768) return;
            const hasActiveModal = document.querySelector('.folder-modal.is-active, .info-modal.is-active, .contact-modal.is-active, .lightbox-modal.is-active');
            const isScrollableBlock = e.target.closest(
              ".favorites-grid, .scrollable-element, .folder-modal-content, .info-modal-content, .contact-modal-content",
            );
            if (isScrollableBlock || hasActiveModal) return;

            const now = Date.now();
            if (now - lastTriggerTime < 300) return;

            const touchEndY = e.changedTouches[0].clientY;
            const deltaY = touchStartY - touchEndY;

            if (deltaY > 50) {
              scrollToSection(currentIdx + 1);
              lastTriggerTime = now;
            } else if (deltaY < -50) {
              scrollToSection(currentIdx - 1);
              lastTriggerTime = now;
            }
          },
          { passive: false },
        );

        window.addEventListener(
          "keydown",
          (e) => {
            if (window.innerWidth <= 768) return;
            const hasActiveModal = document.querySelector('.folder-modal.is-active, .info-modal.is-active, .contact-modal.is-active, .lightbox-modal.is-active');
            if (hasActiveModal) return;

            if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")
              return;

            const now = Date.now();
            if (now - lastTriggerTime < 300) {
              if (
                ["ArrowUp", "ArrowDown", "PageUp", "PageDown", " "].includes(
                  e.key,
                )
              ) {
                e.preventDefault();
              }
              return;
            }

            if (
              e.key === "ArrowDown" ||
              e.key === "PageDown" ||
              e.key === " "
            ) {
              e.preventDefault();
              scrollToSection(currentIdx + 1);
              lastTriggerTime = now;
            } else if (e.key === "ArrowUp" || e.key === "PageUp") {
              e.preventDefault();
              scrollToSection(currentIdx - 1);
              lastTriggerTime = now;
            }
          },
          { passive: false },
        );

        window.addEventListener("load", () => {
          const dots = document.querySelectorAll(".csb-dot");
          dots.forEach((dot, idx) => {
            dot.style.pointerEvents = "auto";
            dot.style.cursor = "pointer";
            dot.addEventListener("click", () => scrollToSection(idx));
          });

          const links = document.querySelectorAll('a[href^="#"]');
          links.forEach((link) => {
            link.addEventListener("click", (e) => {
              const targetId = link.getAttribute("href").substring(1);
              if (!targetId) return;

              const targetSec = document.getElementById(targetId);
              if (targetSec) {
                e.preventDefault();
                const targetIdx = sections.indexOf(targetSec);
                if (targetIdx !== -1) {
                  scrollToSection(targetIdx);
                }
              }
            });
          });
        });
      })();
      // Custom Scroll Bar Indicator
      (function () {
        // Find all sections we want to track
        const sections = Array.from(document.querySelectorAll("section"));
        const track = document.getElementById("csb-track");
        if (!track || sections.length === 0) return;

        // Generate dots based on sections
        sections.forEach((_, index) => {
          const dot = document.createElement("div");
          dot.className = "csb-dot" + (index === 0 ? " active" : "");
          track.appendChild(dot);
        });

        const dots = track.querySelectorAll(".csb-dot");

        window.addEventListener("scroll", () => {
          let currentSelect = 0;
          const scrollPosition = window.scrollY + window.innerHeight / 2;

          sections.forEach((section, idx) => {
            if (scrollPosition >= section.offsetTop) {
              currentSelect = idx;
            }
          });

          dots.forEach((dot, idx) => {
            if (idx === currentSelect) {
              dot.classList.add("active");
            } else {
              dot.classList.remove("active");
            }
          });

          const textContainer = document.querySelector(".csb-text-container");
          if (textContainer) {
            if (currentSelect === sections.length - 1) {
              textContainer.classList.add("is-bottom");
            } else {
              textContainer.classList.remove("is-bottom");
            }
          }
        });
      })();

      // Folder Modal Logic
      const folderModal = document.getElementById("folderModal");
      const folderModalOverlay = document.getElementById("folderModalOverlay");
      const folderModalClose = document.getElementById("folderModalClose");
      const folderModalTitle = document.getElementById("folderModalTitle");
      const folderModalSubtitle = document.getElementById("folderModalSubtitle");
      const folderModalRefImg = document.getElementById("folderModalRefImg");
      const folderModalRefPlaceholder = document.getElementById("folderModalRefPlaceholder");
      const folderModalEffectImg = document.getElementById("folderModalEffectImg");
      const folderModalEffectPlaceholder = document.getElementById("folderModalEffectPlaceholder");
      const folderModalSoftware = document.getElementById("folderModalSoftware");
      const folderModalWipState = document.getElementById("folderModalWipState");
      const refAccordion = document.getElementById("refAccordion");
      const effectAccordion = document.getElementById("effectAccordion");
      const folderItems = document.querySelectorAll(".folder-item");

      if (folderItems && folderModal) {
        let refScale = 1;
        let refPanX = 0;
        let refPanY = 0;
        let isDraggingRef = false;
        let startX, startY;

        const folderModalRefImgContainer = document.getElementById("folderModalRefImgContainer");
        
        const updateRefTransform = () => {
          if (folderModalRefImgContainer) {
            folderModalRefImgContainer.style.transform = `translate(${refPanX}px, ${refPanY}px) scale(${refScale})`;
          }
        };

        const resetRefTransform = () => {
          refScale = 1;
          refPanX = 0;
          refPanY = 0;
          updateRefTransform();
          
          if (folderModalRefImgContainer) {
            const imgs = folderModalRefImgContainer.querySelectorAll('img');
            imgs.forEach(img => {
              img.dataset.tx = 0;
              img.dataset.ty = 0;
              img.style.transform = 'translate(0px, 0px)';
            });
          }
        };

        const resetBtn = document.getElementById("resetRefViewBtn");
        if (resetBtn) {
          resetBtn.addEventListener("click", resetRefTransform);
        }

        folderItems.forEach((folder) => {
          folder.addEventListener("click", () => {
            const title = folder.getAttribute("data-title") || "WORK IN PROGRESS";
            const subtitle = folder.getAttribute("data-subtitle") || "制作中";
            const softwareStr = folder.getAttribute("data-software") || "";
            const refImgSrc = folder.getAttribute("data-ref-img");
            const effectImgSrc = folder.getAttribute("data-effect-img");
            
            const isWip = (!refImgSrc && !effectImgSrc) || title === "WORK IN PROGRESS";
            
            if (typeof resetRefTransform === 'function') resetRefTransform();

            folderModalTitle.textContent = title;
            folderModalSubtitle.textContent = subtitle;

            if (isWip) {
              folderModalWipState.style.display = "flex";
              refAccordion.style.display = "none";
              effectAccordion.style.display = "none";
            } else {
              folderModalWipState.style.display = "none";
              refAccordion.style.display = "block";
              effectAccordion.style.display = "block";

              if (refImgSrc) {
                if (folderModalRefImgContainer) {
                  folderModalRefImgContainer.innerHTML = '';
                  const srcs = refImgSrc.split('|');
                  srcs.forEach((src) => {
                    const img = document.createElement('img');
                    img.src = src;
                    img.alt = "Reference Image";
                    img.style.width = "auto";
                    img.style.height = "300px";
                    img.style.objectFit = "cover";
                    img.style.borderRadius = "8px";
                    img.style.boxShadow = "0 10px 30px rgba(0,0,0,0.5)";
                    img.style.cursor = "grab";
                    img.style.position = "relative";
                    img.style.transform = "translate(0px, 0px)";
                    img.dataset.tx = 0;
                    img.dataset.ty = 0;
                    img.draggable = false;
                    
                    let clickStartX, clickStartY;
                    img.addEventListener('mousedown', (e) => {
                        clickStartX = e.clientX;
                        clickStartY = e.clientY;
                    });
                    img.addEventListener('mouseup', (e) => {
                        if (Math.abs(e.clientX - clickStartX) < 5 && Math.abs(e.clientY - clickStartY) < 5) {
                            if (typeof openLightbox === 'function') openLightbox(img.src);
                        }
                    });

                    folderModalRefImgContainer.appendChild(img);
                  });
                  folderModalRefImgContainer.style.display = "flex";
                  if (resetBtn) resetBtn.style.display = "block";
                }
                folderModalRefPlaceholder.style.display = "none";
              } else {
                if (folderModalRefImgContainer) folderModalRefImgContainer.style.display = "none";
                folderModalRefPlaceholder.style.display = "flex";
                if (resetBtn) resetBtn.style.display = "none";
              }

              if (effectImgSrc) {
                const effectGrid = document.querySelector('.effect-images-grid');
                if (effectGrid) {
                  effectGrid.innerHTML = '';
                  const eSrcs = effectImgSrc.split('|');
                  eSrcs.forEach(src => {
                    const card = document.createElement('div');
                    card.className = 'effect-img-card';
                    const img = document.createElement('img');
                    img.src = src;
                    img.alt = "Effect Image";
                    img.style.width = "100%";
                    img.style.height = "100%";
                    img.style.objectFit = "cover";
                    // If lightbox allows click on these, you can add event listener here
                    img.addEventListener("click", () => {
                      if (typeof openLightbox === 'function') openLightbox(img.src);
                    });
                    card.appendChild(img);
                    effectGrid.appendChild(card);
                  });
                }
              } else {
                const effectGrid = document.querySelector('.effect-images-grid');
                if (effectGrid) {
                  effectGrid.innerHTML = `
                    <div class="effect-img-card">
                      <div class="effect-placeholder">No image</div>
                    </div>
                  `;
                }
              }
            }

            folderModalSoftware.innerHTML = "";
            if (softwareStr) {
              const softwareArray = softwareStr.split(",").map(s => s.trim()).filter(s => s);
              softwareArray.forEach(sw => {
                const badge = document.createElement("div");
                badge.className = "software-badge";
                badge.textContent = sw;
                folderModalSoftware.appendChild(badge);
              });
            } else {
              folderModalSoftware.innerHTML = '<span style="color: var(--text-secondary); font-size: 14px;">No software specified</span>';
            }

            folderModal.classList.add("is-active");
          });
        });

        const closeFolderModal = () => {
          folderModal.classList.remove("is-active");
          setTimeout(() => {
            if (refAccordion) refAccordion.classList.remove("is-open");
            if (effectAccordion) effectAccordion.classList.remove("is-open");
          }, 500); // Wait for modal exit transition
        };

        folderModalClose.addEventListener("click", closeFolderModal);
        folderModalOverlay.addEventListener("click", closeFolderModal);

        // Zooming logic restored for PureRef style canvas
        const refWrapper = document.querySelector(".interactive-ref-wrapper");
        let draggedImg = null;
        let imgStartX = 0;
        let imgStartY = 0;

        if (refWrapper) {
          refWrapper.addEventListener("wheel", (e) => {
            if (!folderModalRefImgContainer || folderModalRefImgContainer.style.display === "none") return;
            e.preventDefault();
            const delta = Math.sign(e.deltaY) * -0.15;
            refScale = Math.min(Math.max(0.2, refScale + delta), 8); // limit scale
            updateRefTransform();
          });

          refWrapper.addEventListener("mousedown", (e) => {
            if (!folderModalRefImgContainer || folderModalRefImgContainer.style.display === "none") return;
            
            // If clicking image, start dragging the image
            if (e.target.tagName.toLowerCase() === 'img') {
                draggedImg = e.target;
                imgStartX = e.clientX;
                imgStartY = e.clientY;
                draggedImg.style.zIndex = "100";
                draggedImg.style.cursor = "grabbing";
                e.preventDefault();
                return;
            }

            isDraggingRef = true;
            startX = e.clientX - refPanX;
            startY = e.clientY - refPanY;
            refWrapper.style.cursor = "grabbing";
          });

          window.addEventListener("mousemove", (e) => {
            // Check for missed mouseup (e.g. if released outside iframe)
            if (e.buttons === 0) {
                if (draggedImg) {
                    const deltaX = (e.clientX - imgStartX) / refScale;
                    const deltaY = (e.clientY - imgStartY) / refScale;
                    draggedImg.dataset.tx = parseFloat(draggedImg.dataset.tx || 0) + deltaX;
                    draggedImg.dataset.ty = parseFloat(draggedImg.dataset.ty || 0) + deltaY;
                    draggedImg.style.zIndex = "1";
                    draggedImg.style.cursor = "grab";
                    draggedImg = null;
                }
                if (isDraggingRef) {
                    isDraggingRef = false;
                    if (refWrapper) refWrapper.style.cursor = "grab";
                }
                return;
            }

            if (draggedImg) {
                e.preventDefault();
                const deltaX = (e.clientX - imgStartX) / refScale;
                const deltaY = (e.clientY - imgStartY) / refScale;
                const currentTx = parseFloat(draggedImg.dataset.tx || 0) + deltaX;
                const currentTy = parseFloat(draggedImg.dataset.ty || 0) + deltaY;
                draggedImg.style.transform = `translate(${currentTx}px, ${currentTy}px)`;
                return;
            }

            if (!isDraggingRef) return;
            e.preventDefault();
            refPanX = e.clientX - startX;
            refPanY = e.clientY - startY;
            updateRefTransform();
          });

          window.addEventListener("mouseup", (e) => {
            if (draggedImg) {
                const deltaX = (e.clientX - imgStartX) / refScale;
                const deltaY = (e.clientY - imgStartY) / refScale;
                draggedImg.dataset.tx = parseFloat(draggedImg.dataset.tx || 0) + deltaX;
                draggedImg.dataset.ty = parseFloat(draggedImg.dataset.ty || 0) + deltaY;
                draggedImg.style.zIndex = "1";
                draggedImg.style.cursor = "grab";
                draggedImg = null;
            }
            if (isDraggingRef) {
                isDraggingRef = false;
                if (refWrapper) refWrapper.style.cursor = "grab";
            }
          });
        }

        // Lightbox Logic
        const lightboxModal = document.getElementById("lightboxModal");
        const lightboxImg = document.getElementById("lightboxImg");
        const lightboxClose = document.getElementById("lightboxClose");

        const openLightbox = (src) => {
          lightboxImg.src = src;
          lightboxModal.classList.add("is-active");
        };

        const closeLightbox = () => {
          lightboxModal.classList.remove("is-active");
        };

        lightboxClose.addEventListener("click", closeLightbox);
        lightboxModal.addEventListener("click", (e) => {
          if (e.target === lightboxModal) {
            closeLightbox();
          }
        });

        document.querySelectorAll(".effect-img-card img").forEach((img) => {
          img.addEventListener("click", () => {
            if (img.src && img.style.display !== "none") {
              openLightbox(img.src);
            }
          });
        });
      }

      function toggleFolderAccordion(id) {
        const accordion = document.getElementById(id);
        if (accordion) {
          accordion.classList.toggle('is-open');
        }
      }

      // Search functionality
      const searchInput = document.getElementById("searchInput");
      const searchResults = document.getElementById("searchResults");
      
      const searchableItems = [
        { title: "关于我 / About", type: "Section", id: "about", index: 1 },
        { title: "正在做 / Doing", type: "Section", id: "doing", index: 2 },
        { title: "作品 / Works", type: "Section", id: "works", index: 3 },
        { title: "我的动态 / Status", type: "Section", id: "status", index: 4 },
        { title: "桌面宠物 / Desktop Pet", type: "Section", id: "desktop-pet", index: 4 },
        { title: "喜爱 / Favorites", type: "Section", id: "favorites", index: 4 },
        { title: "服务 / Services", type: "Section", id: "services", index: 4 },
        { title: "STYLIZED PROP", type: "Folder Item", parentIndex: 3, clickTarget: true },
        { title: "CYBERPUNK 2077", type: "Folder Item", parentIndex: 3, clickTarget: true },
        { title: "WORK IN PROGRESS", type: "Folder Item", parentIndex: 3, clickTarget: true }
      ];

      if (searchInput && searchResults) {
        searchInput.addEventListener("input", (e) => {
          const query = e.target.value.toLowerCase().trim();
          searchResults.innerHTML = "";
          
          if (!query) {
            searchResults.classList.remove("is-active");
            return;
          }

          const matches = searchableItems.filter(item => 
            item.title.toLowerCase().includes(query) || 
            item.type.toLowerCase().includes(query)
          );

          if (matches.length === 0) {
            searchResults.innerHTML = `<div class="search-result-empty">找不到该项 (No results found)</div>`;
          } else {
            matches.forEach(match => {
              const itemEl = document.createElement("div");
              itemEl.className = "search-result-item";
              itemEl.innerHTML = `
                <div class="search-result-title">${match.title}</div>
                <div class="search-result-type">${match.type}</div>
              `;
              
              itemEl.addEventListener("click", () => {
                searchResults.classList.remove("is-active");
                searchInput.value = "";
                searchInput.blur();
                
                if (match.clickTarget) {
                  if (window.scrollToSection) window.scrollToSection(match.parentIndex);
                  // Find and click the folder item (Wait a bit for scroll)
                  setTimeout(() => {
                    const folders = document.querySelectorAll(".folder-item");
                    for (let folder of folders) {
                      if ((folder.getAttribute("data-title") || "WORK IN PROGRESS") === match.title) {
                        folder.click();
                        break;
                      }
                    }
                  }, 800);
                } else if (match.index !== undefined) {
                  if (window.scrollToSection) window.scrollToSection(match.index);
                  if (match.id && match.index === 4) {
                    setTimeout(() => {
                      const el = document.getElementById(match.id);
                      if (el) {
                        const modalContent = el.closest(".favorites-grid, .scrollable-element, .contact-modal-content");
                        if (modalContent) {
                          modalContent.scrollTo({ top: el.offsetTop, behavior: "smooth" });
                        } else {
                          el.scrollIntoView({ behavior: "smooth", block: "start" });
                        }
                      }
                    }, 800);
                  }
                }
              });
              
              searchResults.appendChild(itemEl);
            });
          }
          
          searchResults.classList.add("is-active");
        });

        // Close search results when clicking outside
        document.addEventListener("click", (e) => {
          if (!e.target.closest(".search-container")) {
            searchResults.classList.remove("is-active");
          }
        });
      }

      // Update copyright year dynamically
      document.getElementById("current-year").textContent =
        new Date().getFullYear();

      // Contact Modal Logic
      const contactModal = document.getElementById("contactModal");
      const contactModalOverlay = document.getElementById(
        "contactModalOverlay",
      );
      const contactModalClose = document.getElementById("contactModalClose");
      const sendMeBtn = document.getElementById("sendMeBtn");
      const contactForm = document.getElementById("contactForm");
      const contactSuccess = document.getElementById("contactSuccess");
      const contactModalHeader = document.getElementById("contactModalHeader");

      if (sendMeBtn && contactModal) {
        sendMeBtn.addEventListener("click", (e) => {
          e.preventDefault();
          contactModal.classList.add("is-active");
        });

        contactModalClose.addEventListener("click", () => {
          contactModal.classList.remove("is-active");
          setTimeout(() => {
            contactForm.style.display = "flex";
            contactModalHeader.style.display = "block";
            contactSuccess.style.display = "none";
            contactForm.reset();
          }, 400);
        });

        contactModalOverlay.addEventListener("click", () => {
          contactModal.classList.remove("is-active");
          setTimeout(() => {
            contactForm.style.display = "flex";
            contactModalHeader.style.display = "block";
            contactSuccess.style.display = "none";
            contactForm.reset();
          }, 400);
        });

        contactForm.addEventListener("submit", (e) => {
          e.preventDefault();
          contactForm.style.display = "none";
          contactModalHeader.style.display = "none";
          contactSuccess.style.display = "flex";
        });

        // Info Modal Logic
        const infoModal = document.getElementById("infoModal");
        const infoModalOverlay = document.getElementById("infoModalOverlay");
        const infoModalClose = document.getElementById("infoModalClose");
        const infoModalIcon = document.getElementById("infoModalIcon");
        const infoModalTitle = document.getElementById("infoModalTitle");
        const infoModalValue = document.getElementById("infoModalValue");
        const infoModalCopy = document.getElementById("infoModalCopy");
        const infoTriggers = document.querySelectorAll(".info-trigger");

        infoTriggers.forEach((trigger) => {
          trigger.addEventListener("click", (e) => {
            e.preventDefault();
            const type = trigger.getAttribute("data-type");
            const value = trigger.getAttribute("data-value");

            infoModalTitle.textContent = type;
            infoModalValue.textContent = value;
            infoModalIcon.innerHTML = trigger.outerHTML; // Copy the SVG inside

            // Reset copy button
            infoModalCopy.textContent = "复制";
            infoModalCopy.style.background = "var(--black)";

            infoModal.classList.add("is-active");

            // Re-bind copy action for this value
            infoModalCopy.onclick = () => {
              navigator.clipboard
                .writeText(value)
                .then(() => {
                  infoModalCopy.textContent = "已复制";
                  infoModalCopy.style.background = "#4CAF50";
                  setTimeout(() => {
                    infoModalCopy.textContent = "复制";
                    infoModalCopy.style.background = "var(--black)";
                  }, 2000);
                })
                .catch((err) => {
                  console.error("Copy failed", err);
                });
            };
          });
        });

        const closeInfoModal = () => {
          infoModal.classList.remove("is-active");
        };

        infoModalClose.addEventListener("click", closeInfoModal);
        infoModalOverlay.addEventListener("click", closeInfoModal);
      }

      // WeChat Modal Logic
      const weChatModal = document.getElementById("weChatModal");
      const weChatModalOverlay = document.getElementById("weChatModalOverlay");
      const weChatModalClose = document.getElementById("weChatModalClose");
      const weChatBtn = document.getElementById("weChatBtn");

      if (weChatBtn && weChatModal) {
        weChatBtn.addEventListener("click", (e) => {
          e.preventDefault();
          weChatModal.classList.add("is-active");
        });

        weChatModalClose.addEventListener("click", () => {
          weChatModal.classList.remove("is-active");
        });

        weChatModalOverlay.addEventListener("click", () => {
          weChatModal.classList.remove("is-active");
        });
      }
    