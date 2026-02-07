---
name: brand-guidelines
description: Brilliant.org의 공식 브랜드 색상, 타이포그래피 및 디자인 언어를 적용하여 프리미엄 교육 인터랙티브 스타일을 구현합니다. 모든 시각화 결과물에 이 가이드라인이 표준으로 적용됩니다.
license: Complete terms in LICENSE.txt
---

# Brilliant-Style Brand Styling (Math & Code Visualization)

## Overview

브릴리언트(Brilliant.org)의 고급스럽고 인터랙티브한 브랜드 정체성을 이 프로젝트의 기본 스타일로 정의합니다. "코딩 수학 시각화"라는 주제에 걸맞게 프리미엄 교육용 SaaS 느낌을 주며, 사용자에게 신뢰감과 재미를 동시에 전달합니다.

**Keywords**: branding, interactive math, educational design, premium UI, tactile design, Brilliant style, math visualization

## Brand Guidelines

### 1. Colors

**Main Palette:**

- **Primary Action (Brilliant Green)**: `#29CC57` - 주요 버튼 및 핵심 성공 메시지
- **Tactile Shadow (Dark Green)**: `#009B2B` - 버튼 하단 3D 효과용 그림자 (4px)
- **Background (Soft Blue/Lavender)**: `#EEF4FF` - 장시간 학습에도 눈이 편안한 밝은 배경
- **Pure White**: `#FFFFFF` - 카드 및 주요 콘텐츠 배경
- **Solid Black**: `#000000` - 기본 텍스트 및 푸터 배경

**Accent & Neutral Colors:**

- **Brand Accent (Deep Blue)**: `#27455C` - 보조 브랜드 요소 및 섹션 구분
- **Muted Text (Gray)**: `#999999` - 부가 설명 및 미활용 텍스트
- **Border Neutral**: `#E2E8F0` - 카드 테두리 및 구분선

### 2. Typography

- **Headings (제목)**: `Georgia`, `Times New Roman`, `serif`
  - **특징**: 우아하고 학구적인 Serif 폰트 사용. 신뢰감과 전문성을 전달함.
- **Body Text (본문)**: `Inter`, `Arial`, `sans-serif`
  - **특징**: 깨끗하고 하이테크한 Sans-serif 폰트. 가독성과 현대적인 느낌 유지.

### 3. Signature UI Components

- **The Tactile Button (3D 버튼)**:
  - Background: `#29CC57`
  - Border-Radius: `48px` (Pill shape)
  - Box-Shadow: `0px 4px 0px 0px #009B2B`
  - _Interaction_: 마우스 호버 시 약간의 Y축 이동을 통해 실제로 눌리는 듯한 느낌 전달.

- **Interactive Cards (인터랙티브 카드)**:
  - Radius: `16px`
  - Shadow: `0px 8px 16px rgba(0, 0, 0, 0.05)` (매우 부드러운 그림자)
  - Border: `1px solid #E2E8F0`

## Technical Application

### CSS Tokens (Reference)

```css
:root {
  --brilliant-green: #29cc57;
  --brilliant-green-dark: #009b2b;
  --brilliant-bg-soft: #eef4ff;
  --brilliant-text-primary: #000000;
  --brilliant-text-muted: #999999;
  --font-heading: "Georgia", serif;
  --font-body: "Inter", sans-serif;
  --border-radius-pill: 48px;
  --border-radius-card: 16px;
}
```

### Visual Principles

1. **Generous White Space**: 요소를 빽빽하게 배치하지 않고, 충분한 여백(60px 이상)을 두어 정보의 집중도를 높입니다.
2. **Clarity over Clutter**: 교육용 시각화이므로 불필요한 장식보다는 핵심 수학적 의미를 전달하는 데 집중합니다.
3. **Responsive Consistency**: 375px 모바일 환경부터 1440px 데스크탑까지 동일한 브랜드 경험을 제공합니다.
