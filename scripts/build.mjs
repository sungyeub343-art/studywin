import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const siteUrl = "https://studywin.kr";

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
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;color:var(--ink);background:var(--paper);font-family:Pretendard,"Noto Sans KR",sans-serif;line-height:1.65;word-break:keep-all}a{color:inherit;text-decoration:none}img{display:block;max-width:100%}.wrap{width:min(1120px,calc(100% - 40px));margin:auto}.nav{position:absolute;z-index:10;top:0;left:0;width:100%;color:#fff;border-bottom:1px solid rgba(255,255,255,.25)}.nav-inner{height:76px;display:flex;align-items:center;justify-content:space-between}.brand{font-family:"Gowun Batang",serif;font-size:22px;font-weight:700}.nav-links{display:flex;gap:26px;align-items:center;font-size:14px}.nav-cta,.button{display:inline-flex;align-items:center;justify-content:center;min-height:46px;padding:0 20px;background:var(--lime);color:var(--ink);border:0;border-radius:4px;font-weight:800}.hero{position:relative;min-height:720px;display:flex;align-items:center;color:#fff;overflow:hidden;background:#173f30}.hero:before{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(10,38,27,.91) 0%,rgba(10,38,27,.7) 48%,rgba(10,38,27,.16) 100%),url('https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=2000&q=85') center/cover}.hero-content{position:relative;padding:135px 0 78px;max-width:720px}.eyebrow{display:flex;align-items:center;gap:10px;margin:0 0 18px;text-transform:uppercase;font-size:13px;font-weight:700;letter-spacing:.08em}.eyebrow:before{content:"";width:34px;height:2px;background:var(--lime)}h1,h2,h3,p{margin-top:0}h1{font-family:"Gowun Batang",serif;font-size:clamp(46px,7vw,82px);line-height:1.14;margin-bottom:24px;letter-spacing:0}.hero-copy{max-width:610px;font-size:19px;color:rgba(255,255,255,.84);margin-bottom:34px}.hero-actions{display:flex;gap:12px;flex-wrap:wrap}.button.outline{background:transparent;color:#fff;border:1px solid rgba(255,255,255,.55)}.proof{position:relative;margin-top:-52px;z-index:2}.proof-grid{display:grid;grid-template-columns:repeat(3,1fr);background:#fff;box-shadow:var(--shadow)}.proof-item{padding:26px 30px;border-right:1px solid var(--line)}.proof-item:last-child{border:0}.proof-item strong{display:block;font-size:19px}.proof-item span{font-size:14px;color:var(--muted)}section{padding:100px 0}.section-head{display:flex;justify-content:space-between;align-items:end;gap:40px;margin-bottom:42px}.section-head h2,.split h2,.contact h2{font-family:"Gowun Batang",serif;font-size:clamp(32px,4vw,48px);line-height:1.25;margin-bottom:0}.section-head p{max-width:480px;color:var(--muted);margin-bottom:4px}.process{background:#fff}.steps{display:grid;grid-template-columns:repeat(4,1fr);border-top:1px solid var(--ink)}.step{padding:28px 24px 12px 0}.step-num{display:block;color:var(--leaf);font-size:13px;font-weight:800;margin-bottom:24px}.step h3{font-size:20px;margin-bottom:10px}.step p{font-size:15px;color:var(--muted)}.grades{background:var(--forest);color:#fff}.grades .section-head p{color:rgba(255,255,255,.68)}.grade-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:rgba(255,255,255,.2)}.grade{background:var(--forest);padding:30px;min-height:210px}.grade small{color:var(--lime);font-weight:700}.grade h3{margin:10px 0;font-size:22px}.grade p{font-size:15px;color:rgba(255,255,255,.7);margin:0}.regions{background:#eef0e9}.region-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:10px}.region-link{min-height:82px;padding:16px;display:flex;align-items:end;justify-content:space-between;background:#fff;border:1px solid transparent;font-weight:700;transition:.2s}.region-link:hover{border-color:var(--leaf);color:var(--forest);transform:translateY(-2px)}.region-link span{color:var(--leaf)}.split{display:grid;grid-template-columns:1fr 1fr;min-height:560px;background:#fff}.split-image{background:url('https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1400&q=85') center/cover}.split-copy{padding:80px max(40px,calc((100vw - 1120px)/2));padding-right:40px;display:flex;flex-direction:column;justify-content:center}.split-copy p{color:var(--muted)}.check-list{list-style:none;padding:0;margin:25px 0 0}.check-list li{padding:12px 0;border-bottom:1px solid var(--line);font-weight:600}.check-list li:before{content:"✓";color:var(--leaf);margin-right:12px}.local-intro{background:#fff}.local-copy{display:grid;grid-template-columns:.8fr 1.2fr;gap:80px}.local-copy p{color:var(--muted)}.contact{background:var(--sun);padding:80px 0}.contact-inner{display:flex;align-items:center;justify-content:space-between;gap:40px}.contact p{margin:12px 0 0}.contact .button{background:var(--ink);color:#fff;min-width:180px}footer{background:var(--ink);color:rgba(255,255,255,.65);padding:42px 0}.footer-inner{display:flex;justify-content:space-between;gap:30px;font-size:13px}.footer-brand{color:#fff;font-family:"Gowun Batang",serif;font-size:18px}.mobile-cta{display:none}.breadcrumb{font-size:13px;color:rgba(255,255,255,.65);margin-bottom:20px}.not-found{min-height:100vh;display:grid;place-items:center;text-align:center;padding:30px}.not-found h1{color:var(--forest)}
@media(max-width:900px){.nav-links a:not(.nav-cta){display:none}.hero{min-height:680px}.proof-grid{grid-template-columns:1fr}.proof-item{border-right:0;border-bottom:1px solid var(--line)}.steps{grid-template-columns:1fr 1fr}.grade-grid{grid-template-columns:1fr 1fr}.region-grid{grid-template-columns:repeat(3,1fr)}.split{grid-template-columns:1fr}.split-image{min-height:390px}.local-copy{grid-template-columns:1fr;gap:20px}}
@media(max-width:600px){.wrap{width:min(100% - 28px,1120px)}.nav-inner{height:64px}.brand{font-size:19px}.nav-cta{padding:0 13px;min-height:40px}.hero{min-height:640px}.hero:before{background:linear-gradient(180deg,rgba(10,38,27,.72),rgba(10,38,27,.94)),url('https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1000&q=80') 62% center/cover}.hero-content{padding-top:112px}.hero-copy{font-size:17px}.proof{margin-top:0}.proof-item{padding:20px}section{padding:72px 0}.section-head{display:block;margin-bottom:30px}.section-head h2{margin-bottom:14px}.steps,.grade-grid{grid-template-columns:1fr}.step{border-bottom:1px solid var(--line)}.grade{min-height:auto}.region-grid{grid-template-columns:1fr 1fr}.region-link{min-height:68px}.split-image{min-height:300px}.split-copy{padding:60px 24px}.contact{padding:58px 0 100px}.contact-inner{display:block}.contact .button{margin-top:24px;width:100%}.footer-inner{display:block}.footer-brand{margin-bottom:14px}.mobile-cta{display:flex;position:fixed;z-index:20;bottom:0;left:0;width:100%;height:62px}.mobile-cta a{flex:1;display:grid;place-items:center;background:var(--ink);color:#fff;font-weight:800}.mobile-cta a:last-child{background:var(--lime);color:var(--ink)}}`;

const nav = `<nav class="nav"><div class="wrap nav-inner"><a class="brand" href="/">강원 수학과외</a><div class="nav-links"><a href="/#program">수업 안내</a><a href="/#grade">학년별 준비</a><a href="/#region">지역 찾기</a><a class="nav-cta" href="#contact">상담 신청</a></div></div></nav>`;
const regionLinks = regions.map(region => `<a class="region-link" href="/regions/${region.slug}/">${region.name}${region.type}<span>↗</span></a>`).join("");
const gradeCards = grades.map(([name, text]) => `<article class="grade"><small>PREPARATION</small><h3>${name} 수학과외</h3><p>${text}</p></article>`).join("");

function layout({ title, description, body, canonical = siteUrl }) {
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="naver-site-verification" content="8d466503f61c14573b40c21964c1dece8020e823"><meta name="google-site-verification" content="xwZjq-emucjWhascjT0SQmVrFQ6zTWwD7_Ybaq-vXGA"><title>${title}</title><meta name="description" content="${description}"><link rel="canonical" href="${canonical}"><meta property="og:type" content="website"><meta property="og:title" content="${title}"><meta property="og:description" content="${description}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80"><link rel="stylesheet" href="/assets/style.css"><script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "EducationalOrganization", name: "강원 수학과외", url: siteUrl, areaServed: "강원특별자치도", description })}</script></head><body>${nav}${body}<div class="mobile-cta"><a href="tel:010-0000-0000">전화 상담</a><a href="#contact">상담 신청</a></div></body></html>`;
}

function hero(title, copy, eyebrow = "Gangwon Private Math Coaching", breadcrumb = "") {
  return `<header class="hero"><div class="wrap hero-content">${breadcrumb ? `<div class="breadcrumb"><a href="/">홈</a> · ${breadcrumb}</div>` : ""}<p class="eyebrow">${eyebrow}</p><h1>${title}</h1><p class="hero-copy">${copy}</p><div class="hero-actions"><a class="button" href="#contact">무료 학습 상담</a><a class="button outline" href="#grade">학년별 수업 보기</a><a class="button outline" href="tel:010-2928-3614">010-2928-3614 통화</a></div></div></header>`;
}

const proof = `<div class="proof"><div class="wrap proof-grid"><div class="proof-item"><strong>1:1 맞춤 설계</strong><span>현재 실력부터 목표까지 개인별 진도</span></div><div class="proof-item"><strong>18개 시군 수업</strong><span>강원 전 지역 대면·온라인 상담</span></div><div class="proof-item"><strong>중등·고등 전문</strong><span>내신, 선행, 수능을 한 흐름으로 관리</span></div></div></div>`;
const process = `<section class="process" id="program"><div class="wrap"><div class="section-head"><h2>점수가 달라지는<br>수업의 순서</h2><p>문제를 더 많이 푸는 것보다 먼저 해야 할 일이 있습니다. 학생의 현재 위치를 정확히 확인하고, 이해와 반복이 필요한 지점을 찾아 수업을 설계합니다.</p></div><div class="steps"><article class="step"><span class="step-num">01 · 진단</span><h3>학습 상태 확인</h3><p>최근 시험지와 학습 이력을 바탕으로 개념, 연산, 문제 해석의 약점을 구분합니다.</p></article><article class="step"><span class="step-num">02 · 설계</span><h3>개인 커리큘럼</h3><p>학교 진도와 목표 성적, 가능한 학습 시간을 반영해 현실적인 계획을 세웁니다.</p></article><article class="step"><span class="step-num">03 · 수업</span><h3>개념과 적용 연결</h3><p>학생이 풀이 이유를 직접 설명하고 유사 문제에 적용할 수 있을 때까지 확인합니다.</p></article><article class="step"><span class="step-num">04 · 피드백</span><h3>학습 과정 관리</h3><p>오답과 과제 결과를 기록해 다음 수업에 반영하고 학부모님께 변화를 공유합니다.</p></article></div></div></section>`;
const gradeSection = `<section class="grades" id="grade"><div class="wrap"><div class="section-head"><h2>학년이 바뀌기 전,<br>준비는 달라야 합니다</h2><p>예비 학년은 무조건 빠른 선행보다 이전 학년의 구멍을 찾아 다음 과정과 자연스럽게 연결하는 시기입니다.</p></div><div class="grade-grid">${gradeCards}</div></div></section>`;
const regionsSection = `<section class="regions" id="region"><div class="wrap"><div class="section-head"><h2>우리 지역<br>수학과외 찾기</h2><p>강원특별자치도 18개 시군의 지역별 수업 안내를 확인하세요. 거주지와 일정에 따라 대면 또는 온라인 수업을 상담합니다.</p></div><div class="region-grid">${regionLinks}</div></div></section>`;
const split = `<section class="split"><div class="split-image" role="img" aria-label="학생의 학습을 지도하는 수업 공간"></div><div class="split-copy"><p class="eyebrow">Study with direction</p><h2>혼자 공부하는 힘까지<br>함께 기릅니다</h2><p>과외 시간에만 풀 수 있는 문제는 오래 남지 않습니다. 문제를 읽고, 조건을 표시하고, 풀이를 검토하는 과정을 반복해 스스로 공부할 수 있는 기준을 만듭니다.</p><ul class="check-list"><li>학교별 시험 범위와 일정 반영</li><li>매 수업 오답 원인 기록</li><li>학생·학부모 정기 학습 피드백</li></ul></div></section>`;
const contact = (region = "강원") => `<section class="contact" id="contact"><div class="wrap contact-inner"><div><h2>${region} 수학과외,<br>현재 고민부터 들려주세요</h2><p>학년, 지역, 원하는 수업 목표를 남겨주시면 상담을 도와드립니다.</p></div><a class="button" href="tel:010-0000-0000">전화 상담하기</a></div></section><footer><div class="wrap footer-inner"><div><div class="footer-brand">강원 수학과외</div><span>강원특별자치도 중·고등 맞춤 수학 지도</span></div><div>상호 및 연락처는 운영 정보 확정 후 표시됩니다.<br>© 2026 강원 수학과외. All rights reserved.</div></div></footer>`;

function homePage() {
  const description = "강원특별자치도 18개 시군 중등·고등 1:1 수학과외. 예비중1, 예비중2, 예비중3, 예비고1, 예비고2, 예비고3 맞춤 수업과 내신·선행·수능 관리.";
  return layout({ title: "강원 수학과외 | 중등·고등 1:1 맞춤 수업", description, body: `${hero("강원 수학과외", "춘천부터 고성까지, 학생의 현재 실력과 학교 진도에 맞춘 중등·고등 1:1 수업. 이해에서 성적까지 이어지는 공부의 기준을 함께 만듭니다.")}${proof}${process}${gradeSection}${regionsSection}${split}${contact()}` });
}

function regionPage(region) {
  const fullName = `${region.name}${region.type}`;
  const description = `${fullName} 수학과외. ${region.areas} 중등·고등 1:1 맞춤 수업. 예비중1·예비중2·예비중3·예비고1·예비고2·예비고3 내신, 선행, 수능 준비.`;
  const local = `<section class="local-intro"><div class="wrap local-copy"><div><p class="eyebrow">${fullName} LOCAL CLASS</p><h2>${fullName} 학생에게 맞는<br>현실적인 학습 계획</h2></div><div><p>${fullName} ${region.areas} 인근 학생을 대상으로 상담합니다. 지역과 학교에 따라 시험 일정과 학습 환경이 다른 만큼, 정해진 교재를 일률적으로 따라가기보다 최근 시험 결과와 목표를 먼저 확인합니다.</p><p>${region.focus}을 중심으로 수업하며, 대면 수업이 어려운 거리나 일정에는 온라인 수업을 함께 안내합니다. 예비중1부터 예비고3까지 학년 전환기의 복습과 선행, 재학생의 내신 대비, 고등학생의 수능 준비를 개인 진도에 맞춰 연결합니다.</p></div></div></section>`;
  const body = `${hero(`${fullName}<br>수학과외`, `${region.areas}에서 만나는 중등·고등 1:1 맞춤 수업. ${region.focus}으로 공부의 방향을 분명하게 잡습니다.`, "GANGWON LOCAL MATH TUTORING", `${fullName} 수학과외`)}${proof}${local}${process}${gradeSection}${regionsSection}${contact(fullName)}`;
  return layout({ title: `${fullName} 수학과외 | 예비중·예비고 1:1 맞춤 수업`, description, body, canonical: `${siteUrl}/regions/${region.slug}/` });
}

await rm(dist, { recursive: true, force: true });
await mkdir(path.join(dist, "assets"), { recursive: true });
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
