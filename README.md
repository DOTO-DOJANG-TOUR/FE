<div align="center">

# DOTO

</div>

<br/>

## 🙋🏻‍♀️ DOJANG-TOUR의 FE Developer를 소개합니다!

| <a href="https://github.com/p1001q"><img src="https://avatars.githubusercontent.com/u/201849046?v=4" width="120px;" alt=""/></a> | <a href="https://github.com/BB545"><img src="https://avatars.githubusercontent.com/u/148606294?s=400&u=520b8793def7e2f6e7e9718aa0e31de8b8fbfe00&v=4" width="120px;" alt=""/></a> |
| :-: | :-: |
| 박수연 | 노현희 |

<br>

## 📚 서비스 소개

**DOTO**는 지역 축제 방문객을 위한 스탬프 투어 앱입니다. 지역 축제를 찾는 방문객은 꾸준히 늘고 있지만, 대부분 축제 현장에만 머무르며 주변의 매력적인 관광지를 놓치는 경우가 많아 지역 경제로의 유입이 제한적이라는 문제가 있습니다. 기존 스탬프 투어 앱들이 범용적인 관광 코스에 머무는 것과 달리, DOTO는 **특정 지역 축제에 초점을 맞춰 방문객의 축제 경험을 확장**하는 데 집중합니다.

DOTO는 **위치 기반 추천과 게이미피케이션**을 결합해, 사용자 위치를 기반으로 축제와 연계된 인근 관광지를 추천하고 GPS를 통해 방문 여부를 자동으로 인식하는 구조화된 탐험 시스템을 제공합니다. 사용자는 참여하고 싶은 축제를 선택하고, 지도에서 추천 관광지를 확인한 뒤 실제로 이동해 방문하면 반경 50m 이내 진입 시 자동으로 스탬프를 획득합니다. 일정 개수 이상의 스탬프를 모으면 축제 현장에서 인증을 거쳐 기념품이나 할인 혜택 등의 리워드를 받을 수 있습니다.

DOTO는 단순한 스탬프 투어 앱을 넘어, 방문객에게는 축제와 연계된 새로운 즐거움을 선사하고 지역에는 관광 활성화와 상권 유입이라는 실질적인 효과를 가져다주는 것을 목표로 합니다.

---

<br>

## 💻 기술 스택

| **역할** | **종류** | **선정 이유** |
| --- | --- | --- |
| Library | <img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Native"> | Expo 기반으로 하나의 코드베이스에서 Android 앱 개발 및 원스토어 배포가 가능하고, 컴포넌트 기반 구조로 재사용성이 높음 |
| Programming Language | <img src="https://img.shields.io/badge/typescript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/> | 정적 타입을 제공하여 코드의 안정성과 가독성을 높이고, 개발 중 오류를 사전에 방지할 수 있어 유지보수에 유리 |
| Routing | expo-router | Metro 기반 파일 라우팅으로 네이티브·웹을 함께 지원, 별도 웹 전용 라우터(react-router) 불필요 |
| Bundler | Metro (Expo 내장) | React Native 표준 번들러. Vite 등 웹 전용 번들러는 네이티브 빌드를 지원하지 않아 사용 불가 |
| Package Manager | <img src="https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white" alt="npm"> | `package-lock.json` 기준, 별도 패키지 매니저(pnpm 등) 미사용 |
| Data Fetching | Fetch API (RN 내장) | 별도 라이브러리 없이 내장 `fetch`로 API 클라이언트(`src/apis/client.ts`) 구성 |
| Auth | expo-auth-session, expo-crypto, expo-secure-store | 구글 로그인을 Authorization Code + PKCE(브라우저) 방식으로 처리, 원스토어 배포 시에도 Google Play Services 비의존. 발급받은 토큰은 SecureStore에 안전하게 저장 |
| Styling | <img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Native StyleSheet"> | RN 내장 `StyleSheet` 사용, 별도 라이브러리 없이 표준 방식으로 통일 |
| State management | <img src="https://img.shields.io/badge/zustand-orange?style=for-the-badge&logo=zustand&logoColor=white" alt="Zustand"> | 가볍고 보일러플레이트가 적어, 로그인 상태 같은 소규모 전역 상태 관리에 적합 |
| Formatting | <img src="https://img.shields.io/badge/eslint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white" alt="ESLint"> | `eslint-config-expo` 기반, 코드 스타일 통일 및 잠재 오류 사전 방지 |

> ⚠️ SecureStore는 iOS/Android 네이티브에서만 안전하게 암호화 저장됩니다. 웹 빌드(`expo start --web`)에서는 별도 검토 없이 localStorage 등에 토큰을 그대로 저장하면 안전하지 않으니, 웹을 실제로 지원하게 되면 서버 세션(Secure, HttpOnly, SameSite 쿠키) 등 별도 방식을 검토해야 합니다.

<br>

## 🧩 Package Manager

- **npm 명령어 예시**

```bash
npm install # 전체 설치
npm install 라이브러리 # 라이브러리 설치
npm start # Expo 개발 서버 실행
npm run android # 안드로이드 실행
npm run ios # iOS 실행
npm run lint # 린트 검사
```

<br>

## ⌨️ Code Styling

- **camelCase**
  - 변수명, 함수명에 적용
  - 첫글자는 소문자로 시작, 띄어쓰기는 붙이고 뒷 단어의 시작을 대문자로
    - ex- handleDelete
  - 언더바 사용 X (클래스명은 허용)

<br>

## 🎉Git Convention

### 📌 Git Flow

```
develop ← 작업 브랜치
```

- `main branch` : 배포 브랜치
- `develop branch` : 개발 브랜치, feature 브랜치가 merge됨
- `feature branch` : 페이지/기능 브랜치

  <br>

### ✨ Flow

- `develop 브랜치`에서 새로운 브랜치를 생성.
- 작업을 완료하고 커밋 메시지에 맞게 커밋.
- Pull Request 생성
- `develop` 브랜치로 병합.

<br>

### 🔥 Commit Message Convention

- **커밋 유형**
  - 🎉 Init: 프로젝트 세팅
  - ✨ Feat: 새로운 기능 추가
  - 🐛 Fix : 버그 수정
  - 💄 Design : UI(CSS) 수정
  - ✏️ Typing Error : 오타 수정
  - 📝 Docs : 문서 수정
  - 🚚 Mod : 폴더 구조 이동 및 파일 이름 수정
  - 💡 Add : 파일 추가 (ex- 이미지 추가)
  - 🔥 Del : 파일 삭제
  - ♻️ Refactor : 코드 리펙토링
  - 🚧 Chore : 배포, 빌드 등 기타 작업
  - 🔀 Merge : 브랜치 병합

- **형식**: `커밋유형: 상세설명 (#이슈번호)`
- **예시**:
  - 🎉 Init: 프로젝트 초기 세팅 (#1)
  - ✨ Feat: 메인페이지 개발 (#2)

<br>

### 🌿 Branch Convention

**Branch Naming 규칙**

- **브랜치 종류**
  - `init`: 프로젝트 세팅
  - `feat`: 새로운 기능 추가
  - `fix` : 버그 수정
  - `refactor` : 코드 리펙토링

- **형식**: `브랜치종류/#이슈번호/상세기능`
- **예시**:
  - init/#1/init
  - fix/#2/splash

<br>

### 📋 Issue Convention

**Issue Title 규칙**

- **태그 목록**:
  - `Init`: 프로젝트 세팅
  - `Feat`: 새로운 기능 추가
  - `Fix` : 버그 수정
  - `Refactor` : 코드 리펙토링

- **형식**: [태그] 작업 요약
- **예시**:
  - [Init] 프로젝트 초기 세팅
  - [Feat] Header 컴포넌트 구현

<br>

## 📂 프로젝트 구조

```
📦DOTO
 ┣ 📂.github
 ┃ ┣ 📂ISSUE_TEMPLATE
 ┃ ┗ 📜pull_request_template.md
 ┣ 📂assets
 ┃ ┣ 📂images
 ┃ ┗ 📂expo.icon
 ┣ 📂scripts
 ┃ ┗ 📜reset-project.js
 ┣ 📂src
 ┃ ┣ 📂apis
 ┃ ┣ 📂app
 ┃ ┃ ┣ 📜_layout.tsx
 ┃ ┃ ┗ 📜index.tsx
 ┃ ┣ 📂assets
 ┃ ┣ 📂components
 ┃ ┃ ┗ 📂common
 ┃ ┣ 📂constants
 ┃ ┣ 📂hooks
 ┃ ┣ 📂layouts
 ┃ ┣ 📂pages
 ┃ ┣ 📂routes
 ┃ ┣ 📂stores
 ┃ ┣ 📂types
 ┃ ┣ 📂utils
 ┃ ┗ 📜global.css
 ┣ 📜.gitignore
 ┣ 📜app.json
 ┣ 📜package.json
 ┣ 📜README.md
 ┗ 📜tsconfig.json
```

- assets - 이미지, 아이콘 등 정적 리소스
- scripts - 프로젝트 유틸 스크립트 (reset-project 등)
- src
  - apis - 서버와 통신하는 API 함수 모음
  - app - expo-router 기반 파일 라우팅 진입점 (화면 및 레이아웃)
  - assets - 앱 내에서 사용되는 에셋
  - components - 공용 컴포넌트 (common 등)
  - constants - 프로젝트 전역에서 사용되는 상수값 및 설정 모음
  - hooks - 전역으로 사용되는 훅
  - layouts - 화면의 공통 레이아웃 컴포넌트
  - pages - 화면 단위 컴포넌트
  - routes - 도메인 별 라우팅 관련 컴포넌트 및 로직
  - stores - Zustand 전역 상태 스토어 모음
  - types - TypeScript 타입 정의 모음
  - utils - 전역으로 사용되는 함수
