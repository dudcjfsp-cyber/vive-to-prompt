# Render -> Vercel 전환 계획서

> Historical migration plan.
> This file records the transition design, not the current deployment truth.
> Prefer docs/handoff/latest.md, docs/managed-deploy.md, and README.md for current state.

## 목적
- 현재 `GitHub Pages + Render`로 나뉜 배포 구조에서 Render에 올라간 managed API를 Vercel로 전환한다.
- 프런트엔드 배포는 우선 그대로 유지해서 변경 범위를 줄이고, 필요하면 2차로 Vercel 통합 여부를 판단한다.

## 현재 배포 상태 분석

### 1. 프런트엔드
- GitHub Actions 워크플로 [`/.github/workflows/deploy-pages.yml`](/C:/Users/dudcj/OneDrive/바탕%20화면/바이브투스펙V2/.github/workflows/deploy-pages.yml)이 `main` 푸시 시 `npm ci -> npm run build -> dist 업로드` 흐름으로 GitHub Pages에 배포한다.
- [`/vite.config.js`](/C:/Users/dudcj/OneDrive/바탕%20화면/바이브투스펙V2/vite.config.js)는 `base: '/vive-to-spec-V2/'`로 고정되어 있어, 현재 프런트는 GitHub Pages 하위 경로 배포를 전제로 한다.

### 2. 백엔드
- [`/render.yaml`](/C:/Users/dudcj/OneDrive/바탕%20화면/바이브투스펙V2/render.yaml)은 Node Web Service를 생성하고 `npm run serve:managed-api`로 [`/server/managedApiServer.js`](/C:/Users/dudcj/OneDrive/바탕%20화면/바이브투스펙V2/server/managedApiServer.js)를 실행한다.
- 헬스체크는 `/api/health`이고, CORS 허용 오리진은 `MANAGED_API_ALLOWED_ORIGIN` 환경 변수로 제어한다.
- 프런트 managed 모드는 [`/ui/app/config/runtime.js`](/C:/Users/dudcj/OneDrive/바탕%20화면/바이브투스펙V2/ui/app/config/runtime.js)의 `VITE_MANAGED_API_BASE_URL`을 기준으로 백엔드에 요청한다.

### 3. 구조적 특징
- 현재 Render 배포는 `server.listen()` 기반의 장시간 실행 서버다.
- Vercel은 이 구조를 그대로 실행하는 방식보다 `api/` 디렉터리의 함수 단위 배포에 더 맞는다.
- 따라서 이번 전환의 핵심은 "호스팅 변경"보다 "서버 엔트리포인트를 함수형 라우트로 재구성"하는 작업이다.

## 권장 전환 방향

### 1차 권장안
- GitHub Pages 프런트는 유지한다.
- Render managed API만 Vercel Functions로 이전한다.
- 프런트의 `VITE_MANAGED_API_BASE_URL`만 새 Vercel API 주소로 교체한다.

이 안을 권장하는 이유:
- 프런트 URL, 정적 자산 경로, GitHub Actions 배포 흐름을 동시에 바꾸지 않아도 된다.
- 현재 레포에서 가장 큰 변경점은 백엔드 서버 엔트리포인트뿐이라서 리스크가 작다.
- 문제 발생 시 Render -> Vercel 전환만 롤백하면 된다.

### 2차 선택안
- 추후 프런트까지 Vercel로 통합한다.
- 이 경우 [`/vite.config.js`](/C:/Users/dudcj/OneDrive/바탕%20화면/바이브투스펙V2/vite.config.js)의 GitHub Pages 전용 `base` 설정을 분기 처리하거나 제거해야 한다.

## 실행 계획

### Phase 0. 사전 결정
- Vercel을 `백엔드 전용 프로젝트`로 쓸지, `프런트 + API 통합 프로젝트`로 쓸지 결정한다.
- 이번 요구사항 기준으로는 `백엔드 전용 프로젝트`가 가장 안전하다.

### Phase 1. 서버 로직 분리
- [`/server/managedApiServer.js`](/C:/Users/dudcj/OneDrive/바탕%20화면/바이브투스펙V2/server/managedApiServer.js)에서 HTTP 서버 생성 코드와 비즈니스 로직을 분리한다.
- 아래 항목을 공용 모듈로 추출한다.
- 요청 본문 파싱
- provider/API key 해석
- CORS 헤더 생성
- `health`, `models`, `transmute`, `hybrid-stacks` 처리 함수

권장 결과물 예시:
- `server/managedApi/shared.js`
- `server/managedApi/routes.js`
- `server/managedApiServer.js`는 로컬 개발용 어댑터 역할만 유지

### Phase 2. Vercel Functions 추가
- 루트에 `api/` 디렉터리를 만든다.
- 다음 함수를 만든다.
- `api/health.js`
- `api/models.js`
- `api/transmute.js`
- `api/hybrid-stacks.js`
- 각 함수는 공용 로직을 호출하고 `Request/Response` 또는 Node handler 형식으로 응답한다.

핵심 원칙:
- 기존 Render 서버와 동일한 JSON 계약을 유지한다.
- 프런트가 기대하는 경로를 그대로 유지한다: `/api/health`, `/api/models`, `/api/transmute`, `/api/hybrid-stacks`

### Phase 3. Vercel 설정 추가
- 루트에 `vercel.json`을 추가한다.
- 함수 duration은 기본값에 기대지 말고 명시적으로 설정한다.
- 필요하면 region도 지정한다.
- 백엔드를 별도 프로젝트로 운용하면 프런트 산출물은 Vercel에서 사용하지 않도록 설정을 단순화한다.

권장 환경 변수:
- `GEMINI_API_KEY`
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `MANAGED_API_ALLOWED_ORIGIN`
- 필요 시 `MANAGED_API_PREFIX=/api`

### Phase 4. 프런트 연결 전환
- GitHub Pages 빌드 환경에서 `VITE_APP_MODE=managed` 유지
- `VITE_MANAGED_API_BASE_URL=https://<vercel-project>.vercel.app/api` 로 교체
- 새 빌드를 GitHub Pages로 배포한다.

### Phase 5. 검증
- `GET /api/health` 확인
- `GET /api/models?provider=<provider>` 확인
- `POST /api/transmute` 실호출 확인
- GitHub Pages 프런트에서 managed 모드 전체 플로우 확인
- CORS, 4xx/5xx 응답 포맷, provider key 누락 시 오류 메시지 확인

### Phase 6. 컷오버 및 정리
- Vercel production URL로 프런트 연결을 고정한다.
- Render 서비스는 최소 1회 이상 정상 동작을 재검증한 뒤 중지한다.
- [`/docs/managed-deploy.md`](/C:/Users/dudcj/OneDrive/바탕%20화면/바이브투스펙V2/docs/managed-deploy.md)와 [`/env.managed.example`](/C:/Users/dudcj/OneDrive/바탕%20화면/바이브투스펙V2/env.managed.example)를 Vercel 기준으로 갱신한다.

## 발생 가능한 오류 및 리스크

### High
- 현재 [`/server/managedApiServer.js`](/C:/Users/dudcj/OneDrive/바탕%20화면/바이브투스펙V2/server/managedApiServer.js)는 `createServer(...); server.listen(...)` 형태의 장시간 실행 서버이므로 Vercel에 그대로 옮기면 배포 대상과 런타임 모델이 맞지 않는다.
- 이 부분을 함수형 엔드포인트로 바꾸지 않으면 배포는 되더라도 실제 요청 처리가 실패하거나 기대한 경로로 노출되지 않을 가능성이 높다.

### Medium
- `MANAGED_API_ALLOWED_ORIGIN`이 단일 오리진 문자열에 의존하고 있어, GitHub Pages 주소 변경, Vercel preview URL 테스트, 추후 커스텀 도메인 도입 시 CORS 오류가 발생할 수 있다.

### Medium
- LLM 호출은 응답 시간이 길 수 있는데 현재 레포에는 Vercel 함수 duration을 고정하는 설정이 없다.
- 기본 duration이나 플랜 설정에 따라 `transmute` 요청이 timeout으로 실패할 수 있으므로 `vercel.json`에서 명시 설정이 필요하다.

### Low, 조건부
- 추후 프런트까지 Vercel로 옮길 경우 [`/vite.config.js`](/C:/Users/dudcj/OneDrive/바탕%20화면/바이브투스펙V2/vite.config.js)의 `base: '/vive-to-spec-V2/'` 때문에 정적 자산 경로가 깨질 수 있다.
- 이번 범위가 "Render -> Vercel 백엔드 전환만"이라면 즉시 문제는 아니다.

## 완료 기준
- Render 없이 Vercel에서 `/api/*` 엔드포인트가 정상 응답한다.
- GitHub Pages 프런트 managed 모드가 Vercel API를 통해 정상 동작한다.
- 기존 API 응답 포맷과 프런트 소비 계약이 유지된다.
- 운영 문서가 Render 기준 표현 없이 Vercel 기준으로 갱신된다.

## 참고 자료
- Vercel Vite 문서: https://vercel.com/docs/frameworks/frontend/vite
- Vercel Node.js Functions 문서: https://vercel.com/docs/functions/runtimes/node-js
- Vercel Functions duration 문서: https://vercel.com/docs/functions/configuring-functions/duration
- Vercel project configuration 문서: https://vercel.com/docs/project-configuration

