# Privacy Policy (개인정보처리방침)

> **최종 수정일 (Last Updated): August 23, 2026**  
> 본 개인정보처리방침은 Chrome 확장 프로그램 **WithAvis**(이하 "본 확장 프로그램") 및 관련 랜딩 웹사이트에 적용됩니다.  
> This Privacy Policy applies to the **WithAvis** browser extension and related landing websites.

---

## 🇰🇷 국문 (Korean)

### 1. 개요 및 Zero-Trust 프라이버시 원칙
**WithAvis**는 사용자의 프라이버시와 데이터 주권을 최우선 가치로 삼습니다. 본 확장 프로그램은 **100% 서버리스(Serverless Direct Streaming) 아키텍처**로 설계되어 별도의 중간 중계 서버나 백엔드 DB를 일체 운영하지 않으며, 모든 인증 정보와 대화 데이터는 사용자의 로컬 브라우저에만 안전하게 보관됩니다.

### 2. 수집 및 처리하는 데이터 항목
본 확장 프로그램은 이름, 주민등록번호, 연락처 등 개인 식별 정보(PII)를 수집하거나 요구하지 않습니다. 기능 제공을 위해 처리되는 데이터는 다음과 같습니다:

1. **웹페이지 문맥 및 컨텐츠 (Page Context)**:
   - 사용자가 AI 분석 및 질의응답을 요청할 때, 현재 활성 탭의 텍스트 본문, YouTube 동영상 자막, 또는 사용자 첨부 파일(이미지/PDF)을 읽어 AI 프롬프트 문맥을 구성합니다.
   - 이 데이터는 답변 생성을 위한 일회성 휘발성 데이터로만 사용되며, 전송 즉시 메모리에서 소멸합니다.
2. **사용자 API Key 및 환경설정**:
   - 사용자가 직접 입력한 AI 제공자(Google Gemini, Anthropic Claude, Groq, Cerebras, OpenRouter, 사내 Atlas 등)의 API Key 및 사용자 UI 설정(위젯 크기, 테마, 광고 차단 모드 등)은 브라우저 로컬 암호화 저장소(`chrome.storage.local`)에만 저장됩니다.
3. **대화 내역 (Chat History)**:
   - 사용자가 나눈 대화 기록과 핀(Pin) 고정 메시지는 오직 사용자의 로컬 브라우저에만 저장되며 외부로 자동 동기화되지 않습니다.
4. **음성 데이터 (Voice STT)**:
   - 음성 질문(`Alt+V`) 기능 이용 시 마이크를 통해 입력된 음성은 브라우저 내장 Web Speech API 또는 로컬 STT 모듈을 통해 텍스트로 변환된 후 즉시 파기됩니다.

### 3. 제3자 데이터 전송 및 AI 제공자 (Third-Party AI Providers)
사용자가 AI에 질문을 전송할 때, 해당 질의와 필요한 웹 문맥 데이터는 **사용자가 설정한 AI 제공자의 공식 API 서버**로 브라우저에서 직접(Direct HTTPS) 전송됩니다.

| AI 제공자 | 전송되는 데이터 | 보안 및 데이터 처리 |
| :--- | :--- | :--- |
| **Google Gemini API** | 질문 텍스트, 페이지 문맥, 첨부 이미지/문서 | TLS 1.3 암호화 전송, Google Cloud API 정책 준수 |
| **Anthropic Claude API** | 질문 텍스트, 페이지 문맥, 첨부 이미지 | TLS 1.3 암호화 전송, Anthropic Commercial Terms 준수 |
| **Groq / Cerebras API** | 질문 텍스트, 페이지 문맥 | 초고속 추론 Direct HTTPS 전송 |
| **OpenRouter / Atlas Enterprise** | 질문 텍스트, 페이지 문맥, 인증 토큰 | 사용자 지정 엔드포인트 Direct 전송 |

* **개발자 중계 서버 없음 (Zero Intermediary)**: 개발자 또는 서비스 운영자는 사용자가 전송한 질의 내용이나 API Key에 일체 접근할 수 없습니다.
* **학습 미사용**: API를 통해 전송되는 상업용 API 호출 데이터는 기본적으로 AI 모델의 학습 데이터로 사용되지 않습니다(각 제공자 약관 기준).

### 4. 확장 프로그램 권한 (Permissions) 및 사용 목적
본 확장 프로그램은 Manifest V3 가이드라인을 준수하며 필수적인 권한만을 최소한으로 요청합니다:
* `storage` / `unlimitedStorage`: 사용자 설정, API 키, 로컬 대화 내역 저장
* `activeTab`: 현재 보고 있는 탭의 본문 텍스트 요약 및 자막 분석
* `contextMenus`: 웹페이지 텍스트/이미지 우클릭 질의 및 복사 제한 해제 기능 지원
* `clipboardWrite`: AI 답변 및 Mermaid 차트 코드 원클릭 복사
* `offscreen`: 백그라운드 음성 인식(STT) 스트림 처리
* `declarativeNetRequest`: 클린 뷰(Ad Cleaner) 광고 제거 및 페이지 최적화

### 5. 사용자의 통제권 및 데이터 삭제
* **대화 내역 즉시 삭제**: 위젯 상단의 대화 지우기(휴지통) 버튼을 통해 저장된 대화 기록을 언제든 즉시 영구 삭제할 수 있습니다.
* **API Key 삭제 및 변경**: 팝업 설정 창에서 저장된 API Key를 언제든 수정하거나 삭제할 수 있습니다.
* **완전 삭제**: 확장 프로그램을 브라우저에서 삭제(제거)하면 `chrome.storage.local`에 저장된 모든 데이터가 즉각 영구 삭제됩니다.

### 6. 정책 준수 및 문의
본 확장 프로그램은 **Google Chrome 개발자 프로그램 정책(Developer Program Policy)** 및 **제한적 사용 요건(Limited Use Requirements)** 을 철저히 준수합니다.
* **문의 이메일**: [leejhn@gmail.com]
* **프로젝트 저장소**: [https://github.com/leejhn/withAvis](https://github.com/leejhn/withAvis)

---

## 🇺🇸 영문 (English)

### 1. Overview & Zero-Trust Privacy Principle
**WithAvis** (the "Extension") is committed to protecting your privacy and data sovereignty. Designed with a **100% Serverless Direct Streaming Architecture**, the Extension operates without intermediate backend servers or databases. All credentials, API keys, and conversation history remain exclusively inside your local browser.

### 2. Data Collection and Usage
The Extension does not collect or solicit Personally Identifiable Information (PII) such as names, email addresses, or phone numbers. The following data is processed strictly for functional purposes:

1. **Web Content & Page Context**:
   - When requested by the user, the Extension reads active tab text, YouTube transcripts, or uploaded attachments (images/PDFs) to build context for AI analysis.
   - This data is volatile and processed in memory only for response generation, disappearing immediately after the session.
2. **User API Keys & Preferences**:
   - User-provided API keys (Google Gemini, Anthropic Claude, Groq, Cerebras, OpenRouter, Atlas, etc.) and configuration settings are stored solely in the browser's encrypted local storage (`chrome.storage.local`).
3. **Chat History & Pinned Items**:
   - Conversation logs and pinned notes are saved strictly on the user's local device and are never automatically synchronized to external servers.
4. **Voice Input (STT)**:
   - Voice audio captured during speech-to-text (`Alt+V`) is processed through browser APIs or local speech components and converted to text immediately without audio file retention.

### 3. Third-Party AI Data Transmission
When a user submits a query, the prompt and associated page context are transmitted **directly from the client browser to the user-selected AI provider's official API endpoint** over encrypted HTTPS.

| AI Provider | Transmitted Data | Privacy & Security |
| :--- | :--- | :--- |
| **Google Gemini API** | Query text, page context, attachments | TLS 1.3 encryption, Google Cloud API Terms |
| **Anthropic Claude API** | Query text, page context, image inputs | TLS 1.3 encryption, Anthropic Commercial Terms |
| **Groq / Cerebras API** | Query text, page context | Low-latency Direct HTTPS inference |
| **OpenRouter / Atlas Enterprise** | Query text, page context, auth token | Direct transmission to custom endpoints |

* **Zero Intermediary**: Neither the developer nor any intermediate proxy server intercepts, reads, or stores your API keys or queries.
* **No AI Training**: Standard commercial API requests are not used to train public AI models under standard provider terms.

### 4. Chrome Extension Permissions
The Extension adheres strictly to Chrome Manifest V3 policies, utilizing only essential permissions:
* `storage` / `unlimitedStorage`: Storing preferences, API keys, and local chat history.
* `activeTab`: Extracting content and transcripts from the currently active tab.
* `contextMenus`: Providing right-click context actions and context menu tools.
* `clipboardWrite`: One-click copy functionality for AI responses and Mermaid code.
* `offscreen`: Managing background audio pipelines for voice recognition.
* `declarativeNetRequest`: Enabling built-in Ad Cleaner and content sanitization.

### 5. User Control & Data Retention
* **Instant Deletion**: Users can purge local conversation history at any time via the widget's clear button.
* **API Key Management**: API keys can be modified or erased at will through the extension popup settings.
* **Complete Removal**: Uninstalling the Extension instantly purges all associated data from `chrome.storage.local`.

### 6. Compliance & Contact
We certify that our data handling adheres to the **Google Developer Program Policy**, including its **Limited Use requirements**.

* **Contact Email**: [leejhn@gmail.com]
* **Project Repository**: [https://github.com/leejhn/withAvis](https://github.com/leejhn/withAvis)
