import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const siteUrl = "https://studywin.kr";
const logo = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#164b35"/><path d="M12 45 27 22l8 12 6-9 11 20H12Z" fill="#fff"/><path d="m18 45 10-15 7 11 6-9 7 13H18Z" fill="#c8e56f"/><circle cx="47" cy="17" r="5" fill="#f2b84b"/></svg>`;

const regions = [
  { slug: "chuncheon", name: "춘천", type: "시", areas: "퇴계동, 석사동, 온의동, 후평동, 우두동", focus: "학교별 내신 흐름과 고등 진학 준비" },
  { slug: "wonju", name: "원주", type: "시", areas: "무실동, 반곡동, 단계동, 단구동, 기업도시", focus: "혁신도시·기업도시 생활권에 맞춘 내신 관리" },
  { slug: "gangneung", name: "강릉", type: "시", areas: "교동, 유천동, 포남동, 입암동, 주문진", focus: "개념과 서술형을 함께 잡는 학교별 대비" },
  { slug: "donghae", name: "동해", type: "시", areas: "천곡동, 북삼동, 쇄운동, 발한동, 묵호", focus: "학습 공백을 줄이는 단계별 개념 완성" },
  { slug: "taebaek", name: "태백", type: "시", areas: "황지동, 장성동, 문곡소도동, 철암동", focus: "학생 일정에 맞춘 밀도 높은 일대일 수업" },
  { slug: "sokcho", name: "속초", type: "시", areas: "조양동, 교동, 노학동, 청호동, 영랑동", focus: "취약 단원 진단과 시험 범위 집중 관리" },
  { slug: "samcheok", name: "삼척", type: "시", areas: "교동, 남양동, 정상동, 도계읍, 원덕읍", focus: "지역과 학교 일정에 맞춘 꾸준한 진도 관리" },
  { slug: "hongcheon", name: "홍천", type: "군", areas: "홍천읍, 북방면, 남면, 서면, 내면", focus: "통학과 생활 패턴을 고려한 유연한 수업" },
  { slug: "hoengseong", name: "횡성", type: "군", areas: "횡성읍, 둔내면, 우천면, 안흥면, 공근면", focus: "기초 연산부터 내신 응용까지 빈틈없는 연결" },
  { slug: "yeongwol", name: "영월", type: "군", areas: "영월읍, 주천면, 한반도면, 상동읍", focus: "개인별 진도와 반복 학습을 통한 자신감 회복" },
  { slug: "pyeongchang", name: "평창", type: "군", areas: "평창읍, 대관령면, 진부면, 봉평면, 대화면", focus: "거리와 일정을 고려한 대면·온라인 맞춤 수업" },
  { slug: "jeongseon", name: "정선", type: "군", areas: "정선읍, 사북읍, 고한읍, 신동읍, 임계면", focus: "핵심 개념 반복과 자기주도 학습 습관 형성" },
  { slug: "cheorwon", name: "철원", type: "군", areas: "동송읍, 갈말읍, 철원읍, 김화읍, 서면", focus: "학년 전환기에 필요한 선행과 복습의 균형" },
  { slug: "hwacheon", name: "화천", type: "군", areas: "화천읍, 사내면, 간동면, 상서면", focus: "학생별 취약점을 놓치지 않는 밀착 피드백" },
  { slug: "yanggu", name: "양구", type: "군", areas: "양구읍, 국토정중앙면, 동면, 방산면", focus: "개념 설명과 풀이 과정을 연결하는 수업" },
  { slug: "inje", name: "인제", type: "군", areas: "인제읍, 북면, 기린면, 남면, 서화면", focus: "긴 이동 없이 이어가는 안정적인 학습 관리" },
  { slug: "goseong", name: "고성", type: "군", areas: "간성읍, 거진읍, 토성면, 현내면, 죽왕면", focus: "진도 격차를 줄이는 개인별 맞춤 커리큘럼" },
  { slug: "yangyang", name: "양양", type: "군", areas: "양양읍, 강현면, 현남면, 현북면, 손양면", focus: "학교 진도와 목표에 맞춘 실전 문제 해결" }
];

const grades = [
  ["예비중1", "초등 계산 습관을 점검하고 문자와 식, 기본 도형으로 이어지는 중학 수학의 첫 틀을 만듭니다."],
  ["예비중2", "일차방정식과 함수의 기초를 다시 확인한 뒤 식의 계산과 연립방정식을 안정적으로 연결합니다."],
  ["예비중3", "고등 수학과 바로 이어지는 함수·방정식·도형의 핵심 개념을 복습하고 내신 난도를 높입니다."],
  ["예비고1", "중학 전 범위의 취약점을 진단하고 공통수학의 다항식, 방정식, 경우의 수를 체계적으로 시작합니다."],
  ["예비고2", "공통수학의 빈틈을 보완하면서 학교 선택 과목과 진로에 맞춰 수학Ⅰ·수학Ⅱ 학습 순서를 설계합니다."],
  ["예비고3", "수능 출제 단원별 개념과 기출을 연결하고, 제한 시간 안에 점수를 만드는 실전 루틴을 완성합니다."]
];

const css = `@import url('https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@700&family=Pretendard:wght@400;500;600;700;800&display=swap');
:root{--ink:#14231c;--forest:#164b35;--leaf:#2c7451;--lime:#c8e56f;--paper:#f5f2e9;--white:#fff;--line:#d9ddd3;--muted:#647068;--sun:#f2b84b;--radius:8px;--shadow:0 18px 50px rgba(20,35,28,.12)}
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;color:var(--ink);background:var(--paper);font-family:Pretendard,"Noto Sans KR",sans-serif;line-height:1.65;word-break:keep-all}a{color:inherit;text-decoration:none}img{display:block;max-width:100%}.wrap{width:min(1120px,calc(100% - 40px));margin:auto}.nav{position:absolute;z-index:10;top:0;left:0;width:100%;color:#fff;border-bottom:1px solid rgba(255,255,255,.25)}.nav-inner{height:76px;display:flex;align-items:center;justify-content:space-between}.brand{display:inline-flex;align-items:center;gap:10px;font-family:"Gowun Batang",serif;font-size:22px;font-weight:700}.brand img{width:34px;height:34px}.nav-links{display:flex;gap:26px;align-items:center;font-size:14px}.nav-cta,.button{display:inline-flex;align-items:center;justify-content:center;min-height:46px;padding:0 20px;background:var(--lime);color:var(--ink);border:0;border-radius:4px;font-weight:800}.hero{position:relative;min-height:720px;display:flex;align-items:center;color:#fff;overflow:hidden;background:#173f30}.hero:before{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(10,38,27,.91) 0%,rgba(10,38,27,.7) 48%,rgba(10,38,27,.16) 100%),url('https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=2000&q=85') center/cover}.hero-content{position:relative;padding:135px 0 78px;max-width:720px}.eyebrow{display:flex;align-items:center;gap:10px;margin:0 0 18px;text-transform:uppercase;font-size:13px;font-weight:700;letter-spacing:.08em}.eyebrow:before{content:"";width:34px;height:2px;background:var(--lime)}h1,h2,h3,p{margin-top:0}h1{font-family:"Gowun Batang",serif;font-size:clamp(46px,7vw,82px);line-height:1.14;margin-bottom:24px;letter-spacing:0}.hero-copy{max-width:610px;font-size:19px;color:rgba(255,255,255,.84);margin-bottom:34px}.hero-actions{display:flex;gap:12px;flex-wrap:wrap}.button.outline{background:transparent;color:#fff;border:1px solid rgba(255,255,255,.55)}.proof{position:relative;margin-top:-52px;z-index:2}.proof-grid{display:grid;grid-template-columns:repeat(3,1fr);background:#fff;box-shadow:var(--shadow)}.proof-item{padding:26px 30px;border-right:1px solid var(--line)}.proof-item:last-child{border:0}.proof-item strong{display:block;font-size:19px}.proof-item span{font-size:14px;color:var(--muted)}section{padding:100px 0}.section-head{display:flex;justify-content:space-between;align-items:end;gap:40px;margin-bottom:42px}.section-head h2,.split h2,.contact h2{font-family:"Gowun Batang",serif;font-size:clamp(32px,4vw,48px);line-height:1.25;margin-bottom:0}.section-head p{max-width:480px;color:var(--muted);margin-bottom:4px}.process{background:#fff}.steps{display:grid;grid-template-columns:repeat(4,1fr);border-top:1px solid var(--ink)}.step{padding:28px 24px 12px 0}.step-num{display:block;color:var(--leaf);font-size:13px;font-weight:800;margin-bottom:24px}.step h3{font-size:20px;margin-bottom:10px}.step p{font-size:15px;color:var(--muted)}.grades{background:var(--forest);color:#fff}.grades .section-head p{color:rgba(255,255,255,.68)}.grade-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:rgba(255,255,255,.2)}.grade{background:var(--forest);padding:30px;min-height:210px}.grade small{color:var(--lime);font-weight:700}.grade h3{margin:10px 0;font-size:22px}.grade p{font-size:15px;color:rgba(255,255,255,.7);margin:0}.regions{background:#eef0e9}.region-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:10px}.region-link{min-height:82px;padding:16px;display:flex;align-items:end;justify-content:space-between;background:#fff;border:1px solid transparent;font-weight:700;transition:.2s}.region-link:hover{border-color:var(--leaf);color:var(--forest);transform:translateY(-2px)}.region-link span{color:var(--leaf)}.split{display:grid;grid-template-columns:1fr 1fr;min-height:560px;background:#fff}.split-image{background:url('https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1400&q=85') center/cover}.split-copy{padding:80px max(40px,calc((100vw - 1120px)/2));padding-right:40px;display:flex;flex-direction:column;justify-content:center}.split-copy p{color:var(--muted)}.check-list{list-style:none;padding:0;margin:25px 0 0}.check-list li{padding:12px 0;border-bottom:1px solid var(--line);font-weight:600}.check-list li:before{content:"✓";color:var(--leaf);margin-right:12px}.local-intro{background:#fff}.local-copy{display:grid;grid-template-columns:.8fr 1.2fr;gap:80px}.local-copy p{color:var(--muted)}.contact{background:var(--sun);padding:80px 0}.contact-inner{display:flex;align-items:center;justify-content:space-between;gap:40px}.contact p{margin:12px 0 0}.contact .button{background:var(--ink);color:#fff;min-width:180px}footer{background:var(--ink);color:rgba(255,255,255,.65);padding:42px 0}.footer-inner{display:flex;justify-content:space-between;gap:30px;font-size:13px}.footer-brand{color:#fff;font-family:"Gowun Batang",serif;font-size:18px}.mobile-cta{display:none}.breadcrumb{font-size:13px;color:rgba(255,255,255,.65);margin-bottom:20px}.not-found{min-height:100vh;display:grid;place-items:center;text-align:center;padding:30px}.not-found h1{color:var(--forest)}
/* Region Popup Modal */
.region-modal-overlay{position:fixed;inset:0;z-index:9999;background:rgba(18,30,23,.58);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:16px;opacity:0;visibility:hidden;transition:opacity .24s ease,visibility .24s ease}
.region-modal-overlay.is-open{opacity:1;visibility:visible}
.region-modal-card{position:relative;background:#fff;border-radius:24px;width:100%;max-width:580px;max-height:min(92vh,700px);overflow-y:auto;padding:28px 24px 24px;box-shadow:0 24px 60px -12px rgba(10,30,20,.38);transform:translateY(16px) scale(.98);transition:transform .25s cubic-bezier(.16,1,.3,1)}
.region-modal-overlay.is-open .region-modal-card{transform:translateY(0) scale(1)}
.region-modal-card::-webkit-scrollbar{width:5px}
.region-modal-card::-webkit-scrollbar-thumb{background:rgba(22,75,53,.2);border-radius:10px}
.region-modal-close{position:absolute;top:20px;right:20px;width:38px;height:38px;border-radius:50%;border:0;background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#647068;transition:background .18s,color .18s}
.region-modal-close:hover{background:#f0f4f1;color:#14231c}
.region-modal-title{font-size:23px;font-weight:700;color:#14231c;margin:0 0 6px;letter-spacing:-.02em}
.region-modal-subtitle{font-size:14px;color:#647068;margin:0 0 20px;font-weight:500}
.region-modal-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:9px}
.region-modal-btn{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;background:#edf7f0;border:1px solid #dfede3;border-radius:14px;padding:10px 4px 9px;min-height:72px;color:#14231c;text-decoration:none;font-weight:700;font-size:14.5px;transition:transform .18s ease,background .18s ease,box-shadow .18s ease,border-color .18s ease}
.region-modal-btn:hover{background:#e1f2e6;border-color:#bde0cb;transform:translateY(-2px);box-shadow:0 6px 16px rgba(22,75,53,.1);color:var(--forest)}
.region-modal-icon{display:flex;align-items:center;justify-content:center;width:28px;height:28px;margin-bottom:5px;flex-shrink:0}
.region-modal-icon svg{width:28px;height:28px;display:block}
.region-modal-name{font-size:14.5px;line-height:1.2;letter-spacing:-.01em}
@media(max-width:900px){.nav-links a:not(.nav-cta){display:none}.hero{min-height:680px}.proof-grid{grid-template-columns:1fr}.proof-item{border-right:0;border-bottom:1px solid var(--line)}.steps{grid-template-columns:1fr 1fr}.grade-grid{grid-template-columns:1fr 1fr}.region-grid{grid-template-columns:repeat(3,1fr)}.split{grid-template-columns:1fr}.split-image{min-height:390px}.local-copy{grid-template-columns:1fr;gap:20px}}
@media(max-width:600px){.wrap{width:min(100% - 28px,1120px)}.nav-inner{height:64px}.brand{font-size:19px}.nav-cta{padding:0 13px;min-height:40px}.hero{min-height:640px}.hero:before{background:linear-gradient(180deg,rgba(10,38,27,.72),rgba(10,38,27,.94)),url('https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1000&q=80') 62% center/cover}.hero-content{padding-top:112px}.hero-copy{font-size:17px}.proof{margin-top:0}.proof-item{padding:20px}section{padding:72px 0}.section-head{display:block;margin-bottom:30px}.section-head h2{margin-bottom:14px}.steps,.grade-grid{grid-template-columns:1fr}.step{border-bottom:1px solid var(--line)}.grade{min-height:auto}.region-grid{grid-template-columns:1fr 1fr}.region-link{min-height:68px}.split-image{min-height:300px}.split-copy{padding:60px 24px}.contact{padding:58px 0 100px}.contact-inner{display:block}.contact .button{margin-top:24px;width:100%}.footer-inner{display:block}.footer-brand{margin-bottom:14px}.mobile-cta{display:flex;position:fixed;z-index:20;bottom:0;left:0;width:100%;height:62px}.mobile-cta a{flex:1;display:grid;place-items:center;background:var(--ink);color:#fff;font-weight:800}.mobile-cta a:last-child{background:var(--lime);color:var(--ink)}
.region-modal-card{padding:22px 14px 18px;border-radius:20px;max-height:86vh}
.region-modal-close{top:16px;right:14px;width:34px;height:34px}
.region-modal-title{font-size:19px;padding-right:32px;margin-bottom:4px}
.region-modal-subtitle{font-size:12.5px;margin-bottom:14px}
.region-modal-grid{gap:8px}
.region-modal-btn{padding:10px 4px 8px;min-height:70px;border-radius:12px}
.region-modal-icon{width:26px;height:26px;margin-bottom:4px}
.region-modal-icon svg{width:26px;height:26px}
.region-modal-name{font-size:13.5px}
}`;

const nav = `<nav class="nav"><div class="wrap nav-inner"><a class="brand" href="/"><img src="/assets/logo.svg" alt="">강원 수학과외</a><div class="nav-links"><a href="/#program">수업 안내</a><a href="/#grade">학년별 준비</a><a href="#region" onclick="window.openRegionModal && (event.preventDefault(), window.openRegionModal())">지역 찾기</a><a class="nav-cta" href="#contact">상담 신청</a></div></div></nav>`;
const regionLinks = regions.map(region => `<a class="region-link" href="/regions/${region.slug}/">${region.name}${region.type}<span>↗</span></a>`).join("");
const gradeCards = grades.map(([name, text]) => `<article class="grade"><small>PREPARATION</small><h3>${name} 수학과외</h3><p>${text}</p></article>`).join("");

const closeIcon = `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;

const regionIcons = {
  chuncheon: `<svg viewBox="0 0 32 32" width="32" height="32" fill="none" aria-hidden="true"><path d="M4 7a3 3 0 0 1 3-3h8v21H7a3 3 0 0 0-3 3V7Z" fill="#3b82f6" stroke="#1d4ed8" stroke-width="1.5"/><path d="M28 7a3 3 0 0 0-3-3h-8v21h8a3 3 0 0 1 3 3V7Z" fill="#60a5fa" stroke="#1d4ed8" stroke-width="1.5"/><path d="M15 4v21M7 9h5M7 13h5M20 9h5M20 13h5" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  wonju: `<svg viewBox="0 0 32 32" width="32" height="32" fill="none" aria-hidden="true"><circle cx="16" cy="16" r="13" fill="#fef3c7" stroke="#d97706" stroke-width="1.5"/><polygon points="16,6 20,16 16,14 12,16" fill="#ef4444"/><polygon points="16,26 20,16 16,18 12,16" fill="#9ca3af"/><circle cx="16" cy="16" r="2.5" fill="#1e293b"/></svg>`,
  gangneung: `<svg viewBox="0 0 32 32" width="32" height="32" fill="none" aria-hidden="true"><path d="M6 26L26 26L6 6Z" fill="#fde047" stroke="#ca8a04" stroke-width="1.5" stroke-linejoin="round"/><path d="M9 23L19 23L9 13Z" fill="#fff" stroke="#ca8a04" stroke-width="1.2"/><line x1="6" y1="20" x2="10" y2="20" stroke="#ca8a04" stroke-width="1.2"/><line x1="6" y1="16" x2="9" y2="16" stroke="#ca8a04" stroke-width="1.2"/><line x1="13" y1="26" x2="13" y2="23" stroke="#ca8a04" stroke-width="1.2"/><line x1="17" y1="26" x2="17" y2="23" stroke="#ca8a04" stroke-width="1.2"/></svg>`,
  donghae: `<svg viewBox="0 0 32 32" width="32" height="32" fill="none" aria-hidden="true"><path d="M16 5a9 9 0 0 0-6 15.7V23a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-2.3A9 9 0 0 0 16 5Z" fill="#fef08a" stroke="#eab308" stroke-width="1.5"/><path d="M12 28h8M14 25v3M18 25v3" stroke="#71717a" stroke-width="1.5" stroke-linecap="round"/><circle cx="16" cy="13" r="2" fill="#eab308"/></svg>`,
  taebaek: `<svg viewBox="0 0 32 32" width="32" height="32" fill="none" aria-hidden="true"><path d="M4 27l9-15 5 7 3-4 7 12H4Z" fill="#bbf7d0" stroke="#16a34a" stroke-width="1.5" stroke-linejoin="round"/><path d="M13 12l3 5 3-4" fill="#22c55e"/><path d="M13 12V4l7 3.5L13 11" fill="#ef4444" stroke="#dc2626" stroke-width="1.2" stroke-linejoin="round"/></svg>`,
  sokcho: `<svg viewBox="0 0 32 32" width="32" height="32" fill="none" aria-hidden="true"><polygon points="16,3 19.8,11.5 29,12.5 22.2,18.7 24,28 16,23.3 8,28 9.8,18.7 3,12.5 12.2,11.5" fill="#fcd34d" stroke="#f59e0b" stroke-width="1.5" stroke-linejoin="round"/><polygon points="16,6.5 18.5,12 25,12.7 20,17 21.5,23.5 16,20 10.5,23.5 12,17 7,12.7 13.5,12" fill="#fef3c7"/></svg>`,
  samcheok: `<svg viewBox="0 0 32 32" width="32" height="32" fill="none" aria-hidden="true"><rect x="6" y="4" width="20" height="24" rx="4" fill="#cffafe" stroke="#0891b2" stroke-width="1.5"/><rect x="9" y="7" width="14" height="6" rx="2" fill="#fff" stroke="#0891b2" stroke-width="1.2"/><circle cx="11" cy="17" r="1.5" fill="#0891b2"/><circle cx="16" cy="17" r="1.5" fill="#0891b2"/><circle cx="21" cy="17" r="1.5" fill="#0891b2"/><circle cx="11" cy="22" r="1.5" fill="#0891b2"/><circle cx="16" cy="22" r="1.5" fill="#0891b2"/><rect x="19.5" y="20.5" width="3" height="3" rx="1" fill="#0891b2"/></svg>`,
  hongcheon: `<svg viewBox="0 0 32 32" width="32" height="32" fill="none" aria-hidden="true"><rect x="6" y="4" width="18" height="24" rx="3" fill="#e0e7ff" stroke="#4f46e5" stroke-width="1.5"/><line x1="10" y1="10" x2="18" y2="10" stroke="#6366f1" stroke-width="1.5" stroke-linecap="round"/><line x1="10" y1="15" x2="20" y2="15" stroke="#6366f1" stroke-width="1.5" stroke-linecap="round"/><line x1="10" y1="20" x2="16" y2="20" stroke="#6366f1" stroke-width="1.5" stroke-linecap="round"/><path d="M22 18l4-4 2 2-4 4-2.5.5.5-2.5Z" fill="#f43f5e" stroke="#be123c" stroke-width="1.2"/></svg>`,
  hoengseong: `<svg viewBox="0 0 32 32" width="32" height="32" fill="none" aria-hidden="true"><polygon points="16,6 29,12 16,18 3,12" fill="#312e81" stroke="#1e1b4b" stroke-width="1.5" stroke-linejoin="round"/><path d="M8 15v7c0 3 4 5 8 5s8-2 8-5v-7" fill="#4338ca" stroke="#1e1b4b" stroke-width="1.5"/><path d="M26 14v9" stroke="#f59e0b" stroke-width="1.5" stroke-linecap="round"/><circle cx="26" cy="24" r="1.5" fill="#f59e0b"/></svg>`,
  yeongwol: `<svg viewBox="0 0 32 32" width="32" height="32" fill="none" aria-hidden="true"><circle cx="16" cy="16" r="12" fill="#fee2e2" stroke="#dc2626" stroke-width="1.5"/><circle cx="16" cy="16" r="8" fill="#fff" stroke="#dc2626" stroke-width="1.5"/><circle cx="16" cy="16" r="4" fill="#dc2626"/><line x1="16" y1="2" x2="16" y2="6" stroke="#dc2626" stroke-width="1.5" stroke-linecap="round"/><line x1="16" y1="26" x2="16" y2="30" stroke="#dc2626" stroke-width="1.5" stroke-linecap="round"/><line x1="2" y1="16" x2="6" y2="16" stroke="#dc2626" stroke-width="1.5" stroke-linecap="round"/><line x1="26" y1="16" x2="30" y2="16" stroke="#dc2626" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  pyeongchang: `<svg viewBox="0 0 32 32" width="32" height="32" fill="none" aria-hidden="true"><path d="M9 7h14v8a7 7 0 0 1-14 0V7Z" fill="#fde047" stroke="#ca8a04" stroke-width="1.5"/><path d="M9 9H5a3 3 0 0 0 0 6h4M23 9h4a3 3 0 0 1 0 6h-4" stroke="#ca8a04" stroke-width="1.5"/><path d="M16 22v4M11 26h10" stroke="#ca8a04" stroke-width="2" stroke-linecap="round"/><circle cx="16" cy="14" r="2.5" fill="#ca8a04"/></svg>`,
  jeongseon: `<svg viewBox="0 0 32 32" width="32" height="32" fill="none" aria-hidden="true"><rect x="4" y="4" width="24" height="24" rx="4" fill="#ecfdf5" stroke="#059669" stroke-width="1.5"/><path d="M8 22l5-6 4 3 7-9" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><polyline points="20,10 24,10 24,14" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="8" cy="22" r="1.5" fill="#059669"/><circle cx="13" cy="16" r="1.5" fill="#059669"/><circle cx="17" cy="19" r="1.5" fill="#059669"/><circle cx="24" cy="10" r="1.5" fill="#059669"/></svg>`,
  cheorwon: `<svg viewBox="0 0 32 32" width="32" height="32" fill="none" aria-hidden="true"><circle cx="16" cy="17" r="11" fill="#f3e8ff" stroke="#7e22ce" stroke-width="1.5"/><path d="M16 11v6l4 3" stroke="#7e22ce" stroke-width="1.8" stroke-linecap="round"/><path d="M14 3h4M16 3v3" stroke="#7e22ce" stroke-width="1.5" stroke-linecap="round"/><circle cx="16" cy="17" r="2" fill="#7e22ce"/></svg>`,
  hwacheon: `<svg viewBox="0 0 32 32" width="32" height="32" fill="none" aria-hidden="true"><circle cx="14" cy="14" r="8.5" fill="#dbeafe" stroke="#2563eb" stroke-width="1.8"/><path d="M20.5 20.5L28 28" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><circle cx="12" cy="12" r="3" fill="#fff" opacity="0.6"/></svg>`,
  yanggu: `<svg viewBox="0 0 32 32" width="32" height="32" fill="none" aria-hidden="true"><path d="M16 4a8 8 0 0 0-8 8c0 6 8 16 8 16s8-10 8-16a8 8 0 0 0-8-8Z" fill="#fed7aa" stroke="#ea580c" stroke-width="1.5"/><circle cx="16" cy="12" r="3.5" fill="#fff" stroke="#ea580c" stroke-width="1.2"/></svg>`,
  inje: `<svg viewBox="0 0 32 32" width="32" height="32" fill="none" aria-hidden="true"><rect x="7" y="5" width="18" height="23" rx="3" fill="#fef9c3" stroke="#ca8a04" stroke-width="1.5"/><path d="M12 4h8a1 1 0 0 1 1 1v2H11V5a1 1 0 0 1 1-1Z" fill="#a16207"/><path d="M11 12l2 2 4-4M11 18l2 2 4-4M11 24l2 2 4-4" stroke="#15803d" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  goseong: `<svg viewBox="0 0 32 32" width="32" height="32" fill="none" aria-hidden="true"><polygon points="16,5 4,11 28,11" fill="#cbd5e1" stroke="#475569" stroke-width="1.5" stroke-linejoin="round"/><rect x="6" y="11" width="20" height="2.5" fill="#94a3b8"/><line x1="8" y1="13.5" x2="8" y2="23" stroke="#475569" stroke-width="1.8"/><line x1="13.3" y1="13.5" x2="13.3" y2="23" stroke="#475569" stroke-width="1.8"/><line x1="18.7" y1="13.5" x2="18.7" y2="23" stroke="#475569" stroke-width="1.8"/><line x1="24" y1="13.5" x2="24" y2="23" stroke="#475569" stroke-width="1.8"/><rect x="4" y="23" width="24" height="4" rx="1" fill="#cbd5e1" stroke="#475569" stroke-width="1.5"/></svg>`,
  yangyang: `<svg viewBox="0 0 32 32" width="32" height="32" fill="none" aria-hidden="true"><path d="M6 8a4 4 0 0 1 4-4h12a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4h-4l-5 4v-4h-3a4 4 0 0 1-4-4V8Z" fill="#e0f2fe" stroke="#0284c7" stroke-width="1.5" stroke-linejoin="round"/><circle cx="11" cy="13" r="1.5" fill="#0284c7"/><circle cx="16" cy="13" r="1.5" fill="#0284c7"/><circle cx="21" cy="13" r="1.5" fill="#0284c7"/></svg>`
};

function renderRegionModal(autoOpen = true) {
  const buttons = regions.map(region => {
    const icon = regionIcons[region.slug] || "";
    return `<a class="region-modal-btn" href="/regions/${region.slug}/"><div class="region-modal-icon">${icon}</div><span class="region-modal-name">${region.name}${region.type}</span></a>`;
  }).join("");

  return `<div class="region-modal-overlay" id="regionModal" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
  <div class="region-modal-card">
    <button type="button" class="region-modal-close" id="modalCloseBtn" aria-label="닫기">${closeIcon}</button>
    <h2 class="region-modal-title" id="modalTitle">어느 지역의 수학과외를 찾으시나요?</h2>
    <p class="region-modal-subtitle">지역만 고르시면 맞는 선생님을 찾아 연락드립니다</p>
    <div class="region-modal-grid">
      ${buttons}
    </div>
  </div>
</div>
<script>
(function() {
  var modal = document.getElementById('regionModal');
  var closeBtn = document.getElementById('modalCloseBtn');
  if (!modal) return;

  function openModal() {
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  ${autoOpen ? `setTimeout(openModal, 120);` : ``}

  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) {
      closeModal();
    }
  });

  window.openRegionModal = openModal;
  window.closeRegionModal = closeModal;

  document.querySelectorAll('a[href="#region"], a[href="/#region"]').forEach(function(link) {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      openModal();
    });
  });
})();
</script>`;
}

function layout({ title, description, body, canonical = siteUrl }) {
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="naver-site-verification" content="8d466503f61c14573b40c21964c1dece8020e823"><meta name="google-site-verification" content="xwZjq-emucjWhascjT0SQmVrFQ6zTWwD7_Ybaq-vXGA"><title>${title}</title><meta name="description" content="${description}"><link rel="canonical" href="${canonical}"><link rel="icon" href="/assets/logo.svg" type="image/svg+xml"><meta property="og:type" content="website"><meta property="og:title" content="${title}"><meta property="og:description" content="${description}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80"><link rel="stylesheet" href="/assets/style.css"><script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "EducationalOrganization", name: "강원 수학과외", url: siteUrl, areaServed: "강원특별자치도", description })}</script></head><body>${nav}${body}<div class="mobile-cta"><a href="tel:010-0000-0000">전화 상담</a><a href="#contact">상담 신청</a></div></body></html>`;
}

function hero(title, copy, eyebrow = "Gangwon Private Math Coaching", breadcrumb = "") {
  return `<header class="hero"><div class="wrap hero-content">${breadcrumb ? `<div class="breadcrumb"><a href="/">홈</a> · ${breadcrumb}</div>` : ""}<p class="eyebrow">${eyebrow}</p><h1>${title}</h1><p class="hero-copy">${copy}</p><div class="hero-actions"><button type="button" class="button" onclick="window.openRegionModal && window.openRegionModal()">📍 지역 바로 선택</button><a class="button outline" href="#contact">무료 학습 상담</a><a class="button outline" href="tel:010-2928-3614">010-2928-3614 통화</a></div></div></header>`;
}

const proof = `<div class="proof"><div class="wrap proof-grid"><div class="proof-item"><strong>1:1 맞춤 설계</strong><span>현재 실력부터 목표까지 개인별 진도</span></div><div class="proof-item"><strong>18개 시군 수업</strong><span>강원 전 지역 대면·온라인 상담</span></div><div class="proof-item"><strong>중등·고등 전문</strong><span>내신, 선행, 수능을 한 흐름으로 관리</span></div></div></div>`;
const process = `<section class="process" id="program"><div class="wrap"><div class="section-head"><h2>점수가 달라지는<br>수업의 순서</h2><p>문제를 더 많이 푸는 것보다 먼저 해야 할 일이 있습니다. 학생의 현재 위치를 정확히 확인하고, 이해와 반복이 필요한 지점을 찾아 수업을 설계합니다.</p></div><div class="steps"><article class="step"><span class="step-num">01 · 진단</span><h3>학습 상태 확인</h3><p>최근 시험지와 학습 이력을 바탕으로 개념, 연산, 문제 해석의 약점을 구분합니다.</p></article><article class="step"><span class="step-num">02 · 설계</span><h3>개인 커리큘럼</h3><p>학교 진도와 목표 성적, 가능한 학습 시간을 반영해 현실적인 계획을 세웁니다.</p></article><article class="step"><span class="step-num">03 · 수업</span><h3>개념과 적용 연결</h3><p>학생이 풀이 이유를 직접 설명하고 유사 문제에 적용할 수 있을 때까지 확인합니다.</p></article><article class="step"><span class="step-num">04 · 피드백</span><h3>학습 과정 관리</h3><p>오답과 과제 결과를 기록해 다음 수업에 반영하고 학부모님께 변화를 공유합니다.</p></article></div></div></section>`;
const gradeSection = `<section class="grades" id="grade"><div class="wrap"><div class="section-head"><h2>학년이 바뀌기 전,<br>준비는 달라야 합니다</h2><p>예비 학년은 무조건 빠른 선행보다 이전 학년의 구멍을 찾아 다음 과정과 자연스럽게 연결하는 시기입니다.</p></div><div class="grade-grid">${gradeCards}</div></div></section>`;
const regionsSection = `<section class="regions" id="region"><div class="wrap"><div class="section-head"><div><h2>우리 지역<br>수학과외 찾기</h2><p>강원특별자치도 18개 시군의 지역별 수업 안내를 확인하세요. 거주지와 일정에 따라 대면 또는 온라인 수업을 상담합니다.</p></div><button type="button" class="button outline" style="color:var(--forest);border-color:var(--forest);" onclick="window.openRegionModal && window.openRegionModal()">시·군·구 선택 팝업 열기</button></div><div class="region-grid">${regionLinks}</div></div></section>`;
const split = `<section class="split"><div class="split-image" role="img" aria-label="학생의 학습을 지도하는 수업 공간"></div><div class="split-copy"><p class="eyebrow">Study with direction</p><h2>혼자 공부하는 힘까지<br>함께 기릅니다</h2><p>과외 시간에만 풀 수 있는 문제는 오래 남지 않습니다. 문제를 읽고, 조건을 표시하고, 풀이를 검토하는 과정을 반복해 스스로 공부할 수 있는 기준을 만듭니다.</p><ul class="check-list"><li>학교별 시험 범위와 일정 반영</li><li>매 수업 오답 원인 기록</li><li>학생·학부모 정기 학습 피드백</li></ul></div></section>`;
const contact = (region = "강원") => `<section class="contact" id="contact"><div class="wrap contact-inner"><div><h2>${region} 수학과외,<br>현재 고민부터 들려주세요</h2><p>학년, 지역, 원하는 수업 목표를 남겨주시면 상담을 도와드립니다.</p></div><a class="button" href="tel:010-0000-0000">전화 상담하기</a></div></section><footer><div class="wrap footer-inner"><div><div class="footer-brand">강원 수학과외</div><span>강원특별자치도 중·고등 맞춤 수학 지도</span></div><div>상호 및 연락처는 운영 정보 확정 후 표시됩니다.<br>© 2026 강원 수학과외. All rights reserved.</div></div></footer>`;

function homePage() {
  const description = "강원특별자치도 18개 시군 중등·고등 1:1 수학과외. 예비중1, 예비중2, 예비중3, 예비고1, 예비고2, 예비고3 맞춤 수업과 내신·선행·수능 관리.";
  return layout({ title: "강원 수학과외 | 중등·고등 1:1 맞춤 수업", description, body: `${hero("강원 수학과외", "춘천부터 고성까지, 학생의 현재 실력과 학교 진도에 맞춘 중등·고등 1:1 수업. 이해에서 성적까지 이어지는 공부의 기준을 함께 만듭니다.")}${proof}${process}${gradeSection}${regionsSection}${split}${contact()}${renderRegionModal(true)}` });
}

function regionPage(region) {
  const fullName = `${region.name}${region.type}`;
  const description = `${fullName} 수학과외. ${region.areas} 중등·고등 1:1 맞춤 수업. 예비중1·예비중2·예비중3·예비고1·예비고2·예비고3 내신, 선행, 수능 준비.`;
  const local = `<section class="local-intro"><div class="wrap local-copy"><div><p class="eyebrow">${fullName} LOCAL CLASS</p><h2>${fullName} 학생에게 맞는<br>현실적인 학습 계획</h2></div><div><p>${fullName} ${region.areas} 인근 학생을 대상으로 상담합니다. 지역과 학교에 따라 시험 일정과 학습 환경이 다른 만큼, 정해진 교재를 일률적으로 따라가기보다 최근 시험 결과와 목표를 먼저 확인합니다.</p><p>${region.focus}을 중심으로 수업하며, 대면 수업이 어려운 거리나 일정에는 온라인 수업을 함께 안내합니다. 예비중1부터 예비고3까지 학년 전환기의 복습과 선행, 재학생의 내신 대비, 고등학생의 수능 준비를 개인 진도에 맞춰 연결합니다.</p></div></div></section>`;
  const body = `${hero(`${fullName}<br>수학과외`, `${region.areas}에서 만나는 중등·고등 1:1 맞춤 수업. ${region.focus}으로 공부의 방향을 분명하게 잡습니다.`, "GANGWON LOCAL MATH TUTORING", `${fullName} 수학과외`)}${proof}${local}${process}${gradeSection}${regionsSection}${contact(fullName)}${renderRegionModal(false)}`;
  return layout({ title: `${fullName} 수학과외 | 예비중·예비고 1:1 맞춤 수업`, description, body, canonical: `${siteUrl}/regions/${region.slug}/` });
}

await rm(dist, { recursive: true, force: true });
await mkdir(path.join(dist, "assets"), { recursive: true });
await writeFile(path.join(dist, "assets", "logo.svg"), logo);
await writeFile(path.join(dist, "assets", "style.css"), css);
await writeFile(path.join(dist, "index.html"), homePage());
for (const region of regions) {
  const directory = path.join(dist, "regions", region.slug);
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, "index.html"), regionPage(region));
}
const urls = [siteUrl, ...regions.map(region => `${siteUrl}/regions/${region.slug}/`)];
await writeFile(path.join(dist, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(url => `\n  <url><loc>${url}</loc><changefreq>weekly</changefreq><priority>${url === siteUrl ? "1.0" : "0.8"}</priority></url>`).join("")}\n</urlset>\n`);
await writeFile(path.join(dist, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`);
await writeFile(path.join(dist, "CNAME"), "studywin.kr\n");
await writeFile(path.join(dist, ".nojekyll"), "");
await writeFile(path.join(dist, "404.html"), layout({ title: "페이지를 찾을 수 없습니다 | 강원 수학과외", description: "요청하신 페이지를 찾을 수 없습니다.", body: `<main class="not-found"><div><p class="eyebrow">404 ERROR</p><h1>페이지를 찾을 수 없습니다</h1><p>주소가 변경되었거나 존재하지 않는 페이지입니다.</p><a class="button" href="/">홈으로 돌아가기</a></div></main>` }));
console.log(`Built ${regions.length + 1} pages in ${dist}`);
