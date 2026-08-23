document.addEventListener('DOMContentLoaded', () => {
    // ── 현재 시간 포맷 함수 (YYYY-MM-DD HH:mm) ──
    const getFormattedTime = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}`;
    };

    // 초기 타임스탬프 설정
    const initialTs = document.getElementById('demoInitialTs');
    if (initialTs) {
        initialTs.textContent = getFormattedTime();
    }

    // ── 데모 시나리오 데이터 ──
    const scenarios = {
        summary: {
            model: 'Gemini 3.5 Flash Lite',
            icon: 'assets/gemini.png',
            prompt: '현재 웹페이지의 핵심 내용을 3줄로 요약해줘.',
            response: `📑 <strong>웹페이지 핵심 3줄 요약</strong><br><br>
            1. <strong>핵심 기능</strong>: 100% 서버리스 Direct Streaming 아키텍처로 중계 지연 없이 브라우저 내 즉시 요약·분석 제공.<br>
            2. <strong>멀티 LLM</strong>: Gemini 3.5, Claude 3.7, Cerebras Llama 등 다양한 모델을 손쉽게 전환·커스텀 관리.<br>
            3. <strong>Zero-Trust 보안</strong>: API Key와 대화 내역은 브라우저 로컬(<code>chrome.storage</code>)에만 안전하게 보관됨.`
        },
        youtube: {
            model: 'Claude 3.7 Sonnet',
            icon: 'assets/claude.png',
            prompt: '이 YouTube 영상의 자막을 분석해서 핵심 주제와 타임라인을 정리해줘.',
            response: `🎥 <strong>YouTube 자막 자동 분석 (3초 요약)</strong><br><br>
            • <strong>영상 주제</strong>: 2026 차세대 브라우저 AI 익스텐션 아키텍처 트렌드<br>
            • <strong>[01:15]</strong> MV3 Service Worker와 Port 기반 SSE 스트리밍 최적화<br>
            • <strong>[08:40]</strong> Shadow DOM을 통한 호스트 웹페이지 CSS 오염 방지 기법<br>
            • <strong>[14:20]</strong> 클라이언트 측 방어적 마크다운 및 Mermaid 실시간 시각화 파이프라인`
        },
        diagram: {
            model: 'Gemini 3.5 Flash Lite',
            icon: 'assets/gemini.png',
            prompt: '시스템 데이터 흐름을 Mermaid 다이어그램으로 시각화해줘.',
            response: `📊 <strong>Mermaid 다이어그램 자동 시각화</strong><br><br>
            <div class="demo-chart-box">
                flowchart LR<br>
                &nbsp;&nbsp;User[사용자 입력] --&gt; Widget[Shadow DOM 위젯]<br>
                &nbsp;&nbsp;Widget --&gt; Port[chat-stream Port]<br>
                &nbsp;&nbsp;Port --&gt; Worker[Service Worker]<br>
                &nbsp;&nbsp;Worker --&gt; MultiAI[Gemini / Claude / Cerebras]<br>
                &nbsp;&nbsp;MultiAI --&gt; Stream[실시간 스트리밍 & 시각화]
            </div>
            <span style="font-size:0.75rem; color:#64748b; margin-top: 4px; display: inline-block;">✨ [클릭 시 Zoom/Pan 모달 확대 & PNG 내보내기 지원]</span>`
        },
        voice: {
            model: 'Cerebras Llama 3.1 8B',
            icon: 'assets/cerebras.png',
            prompt: '🎙️ "WithAvis의 주요 보안 특징이 무엇인지 음성으로 알려줘."',
            response: `🎙️ <strong>STT 음성 인식 완료 ➔ TTS 음성 답변 생성 중</strong><br><br>
            "WithAvis는 Zero-Trust 보안 모델을 기반으로 설계되었습니다. 사용자의 모든 API 인증 키와 대화 기록은 외부 서버로 전송되지 않으며, 사용자 기기 로컬 스토리지에만 저장됩니다." 🔊`
        },
        adcleaner: {
            model: 'Gemini 3.5 Flash Lite',
            icon: 'assets/gemini.png',
            prompt: '이 페이지의 지저분한 배너 광고를 깔끔하게 제거해줘.',
            response: `🧹 <strong>Ad Cleaner 작동 완료!</strong><br><br>
            • 상단 플로팅 배너 2개 및 측면 스폰서 광고 4개 필터링 완료.<br>
            • 웹페이지 본문 가독성 <strong>+45% 향상</strong> 및 DOM 로딩 속도 최적화 완료.`
        }
    };

    const tabButtons = document.querySelectorAll('.demo-tab-btn');
    const demoInput = document.getElementById('demoInput');
    const currentModelEl = document.getElementById('currentModel');
    const demoHeaderIcon = document.getElementById('demoHeaderIcon');
    const chatContainer = document.getElementById('chatContainer');
    const demoOpacitySlider = document.getElementById('demoOpacitySlider');
    const acwMockupPanel = document.getElementById('acwMockupPanel');
    const demoResetBtn = document.getElementById('demoResetBtn');
    const demoSendBtn = document.getElementById('demoSendBtn');

    // 투명도 슬라이더 실시간 인터랙션
    if (demoOpacitySlider && acwMockupPanel) {
        demoOpacitySlider.addEventListener('input', (e) => {
            const alpha = Math.max(0.15, e.target.value / 100);
            acwMockupPanel.style.background = `rgba(255, 255, 255, ${alpha})`;
        });
    }

    // 초기화(휴지통) 버튼
    if (demoResetBtn && chatContainer) {
        demoResetBtn.addEventListener('click', () => {
            chatContainer.innerHTML = `
                <div class="acw-mockup-msg ai">
                    <div class="acw-mockup-bubble">
                        안녕~ 뭘 도와드릴까요?
                    </div>
                    <div class="acw-mockup-ts">${getFormattedTime()}</div>
                </div>
            `;
            if (demoInput) demoInput.value = '';
            tabButtons.forEach(b => b.classList.remove('active'));
        });
    }

    // 시나리오 클릭 이벤트 핸들러
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const scenarioKey = btn.getAttribute('data-scenario');
            const data = scenarios[scenarioKey];
            if (!data) return;

            // 모델명 및 헤더 아이콘 업데이트
            if (currentModelEl) {
                currentModelEl.textContent = data.model;
            }
            if (demoHeaderIcon && data.icon) {
                demoHeaderIcon.src = data.icon;
            }

            // 인풋 텍스트 변경
            if (demoInput) {
                demoInput.value = data.prompt;
            }

            const timeStr = getFormattedTime();

            // 대화창 렌더링 (사용자 질문 -> AI 답변)
            if (chatContainer) {
                chatContainer.innerHTML = `
                    <div class="acw-mockup-msg user">
                        <div class="acw-mockup-bubble">${data.prompt}</div>
                        <div class="acw-mockup-ts">${timeStr}</div>
                    </div>
                    <div class="acw-mockup-msg ai">
                        <div class="acw-mockup-bubble" id="demoAiBubble">
                            <span style="color: #64748b; font-style: italic;">생각하는 중…</span>
                        </div>
                        <div class="acw-mockup-ts">${timeStr}</div>
                    </div>
                `;
                chatContainer.scrollTop = chatContainer.scrollHeight;

                // 250ms 후 실제 답변 렌더링
                setTimeout(() => {
                    const bubble = document.getElementById('demoAiBubble');
                    if (bubble) {
                        bubble.innerHTML = data.response;
                        chatContainer.scrollTop = chatContainer.scrollHeight;
                    }
                }, 280);
            }
        });
    });

    // 전송 버튼 클릭 시뮬레이션
    if (demoSendBtn && demoInput) {
        demoSendBtn.addEventListener('click', () => {
            const text = demoInput.value.trim();
            if (!text) return;
            const timeStr = getFormattedTime();

            if (chatContainer) {
                const userMsg = document.createElement('div');
                userMsg.className = 'acw-mockup-msg user';
                userMsg.innerHTML = `
                    <div class="acw-mockup-bubble">${text}</div>
                    <div class="acw-mockup-ts">${timeStr}</div>
                `;
                chatContainer.appendChild(userMsg);
                chatContainer.scrollTop = chatContainer.scrollHeight;
            }
        });
    }

    // ── ✨ 마우스 부드러운 파스텔 오로라 커서 글로우 & 패럴랙스 인터랙션 ──
    const cursorGlow = document.getElementById('cursorGlow');
    const glow1 = document.querySelector('.bg-glow-1');
    const glow2 = document.querySelector('.bg-glow-2');
    const glow3 = document.querySelector('.bg-glow-3');

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let currentX = mouseX;
    let currentY = mouseY;
    let hasMoved = false;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        if (!hasMoved && cursorGlow) {
            cursorGlow.style.opacity = '1';
            hasMoved = true;
        }

        // 배경 파스텔 오브 잔잔한 시차 패럴랙스
        const xFactor = (mouseX / window.innerWidth - 0.5) * 24;
        const yFactor = (mouseY / window.innerHeight - 0.5) * 24;

        if (glow1) glow1.style.transform = `translate(${xFactor * 0.9}px, ${yFactor * 0.9}px)`;
        if (glow2) glow2.style.transform = `translate(${-xFactor * 0.7}px, ${-yFactor * 0.7}px)`;
        if (glow3) glow3.style.transform = `translate(${xFactor * 0.5}px, ${-yFactor * 0.5}px)`;
    });

    // 60FPS 부드러운 선형 보간(Lerp) 애니메이션 루프
    function animateCursorGlow() {
        // 0.075 계수로 부드럽고 잔잔한 관성 추적
        currentX += (mouseX - currentX) * 0.075;
        currentY += (mouseY - currentY) * 0.075;

        if (cursorGlow) {
            cursorGlow.style.transform = `translate(${currentX}px, ${currentY}px) translate(-50%, -50%)`;
        }

        requestAnimationFrame(animateCursorGlow);
    }
    animateCursorGlow();

    // 글래스 카드 마우스 스팟라이트 좌표 갱신
    const spotlightCards = document.querySelectorAll('.glass-card, .feature-card, .comp-card, .demo-wrapper');
    spotlightCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });

    // 부드러운 스크롤
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});
