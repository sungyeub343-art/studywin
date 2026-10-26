import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
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
  ["예비고2", "공통수학의 빈틈을 보완하면서 학교 선택 과목과 진로에 맞춰 대수·미적분Ⅰ·확률과 통계 학습 순서를 설계합니다."],
  ["예비고3", "수능 출제 단원별 개념과 기출을 연결하고, 제한 시간 안에 점수를 만드는 실전 루틴을 완성합니다."]
];

const phone = "010-2928-3614";

// 출처: 전국초중등학교위치표준데이터(한국교육시설안전원, 2026-10-01 기준)에서 강원 시군별 운영 중인 학교를 추출
const schools = JSON.parse(await readFile(path.join(root, "data", "schools-gangwon.json"), "utf8"));
const schoolSource = "전국초중등학교위치표준데이터(2026년 10월 기준)";
const schoolWords = { elementary: "초등학교", middle: "중학교", high: "고등학교" };
const buildDate = new Date();

// 학교급별 키워드 페이지: "지역명 + 초등/중등/고등 + 수학/수학수업/수학공부/기초수학/수학내신/수능대비/수능수학"
const levels = [
  {
    slug: "elementary", label: "초등", student: "초등학생", eyebrow: "ELEMENTARY MATH",
    titleTail: "초등 수학수업·기초수학 1:1 맞춤",
    summary: "연산 실수와 문장제 이해를 바로잡고 중학 수학까지 이어지는 기초를 만드는 초등 1:1 수학수업",
    card: "연산·도형·문장제 등 기초수학을 진단하고 학년 진도에 맞춰 바른 수학공부 습관을 만듭니다.",
    topics: [
      ["수학수업", "교과서 단원 순서에 맞춰 개념을 그림과 구체물로 먼저 이해하고, 같은 원리의 문제를 학생이 직접 설명하며 마무리합니다. 문장제를 읽고 식으로 바꾸는 과정을 매 수업 연습합니다."],
      ["수학공부", "수업이 없는 날에도 수학공부가 이어지도록 하루 15~30분 분량의 연산·복습 과제를 정하고, 다음 수업에서 틀린 이유를 함께 확인합니다. 빨리 푸는 것보다 정확하게 푸는 습관을 먼저 만듭니다."],
      ["기초수학", "곱셈·나눗셈, 분수·소수의 계산, 도형과 측정처럼 이후 학년의 바탕이 되는 기초수학의 빈틈을 진단하고, 필요하면 이전 학년 내용까지 거슬러 올라가 다시 채웁니다."]
    ],
    grades: [
      ["초1", "수 세기, 덧셈·뺄셈, 여러 가지 모양으로 수 감각을 익히고 숫자를 바르게 쓰는 습관을 기릅니다."],
      ["초2", "세 자리 수, 받아올림·받아내림, 곱셈구구를 익히며 계산 원리를 말로 설명하는 연습을 합니다."],
      ["초3", "곱셈·나눗셈과 분수·소수의 첫 개념을 다루는 시기로, 계산 속도보다 원리 이해에 집중합니다."],
      ["초4", "큰 수, 분수의 덧셈·뺄셈, 각도와 삼각형을 다루며 문장제 해석을 본격적으로 연습합니다."],
      ["초5", "약수와 배수, 약분과 통분, 분수의 곱셈 등 중학 수학의 바탕이 되는 단원을 꼼꼼히 다집니다."],
      ["초6", "분수·소수의 나눗셈, 비와 비율, 입체도형을 정리하고 예비중1 과정으로 자연스럽게 연결합니다."]
    ],
    faq: [
      ["{name} 초등 수학과외는 몇 학년부터 시작하면 좋나요?", "연산 실수가 반복되거나 문장제를 어려워하기 시작하는 초3~초4에 많이 시작합니다. 다만 학년보다 현재 상태가 중요하므로, 첫 상담에서 기초수학 진단 후 수업 시작 시점과 진도를 함께 정합니다."],
      ["기초수학이 부족한데 학년 진도를 따라갈 수 있을까요?", "학교 진도는 유지하되 매 수업 일부를 이전 학년 기초 보충에 배정합니다. 빈틈이 메워지면 보충 비중을 줄이고 현재 학년 심화로 넘어갑니다."],
      ["초등 수학공부, 집에서는 어떻게 도와주면 되나요?", "매 수업 후 학생이 해야 할 과제와 확인 포인트를 학부모님께 공유합니다. 집에서는 정해진 분량을 꾸준히 했는지만 확인해 주시면 됩니다."]
    ]
  },
  {
    slug: "middle", label: "중등", student: "중학생", eyebrow: "MIDDLE SCHOOL MATH",
    titleTail: "중등 수학내신·수학공부 1:1 맞춤",
    summary: "학교별 시험 범위에 맞춘 중등 수학내신 대비와 고등 수학으로 이어지는 개념 완성 1:1 수업",
    card: "중1~중3 학교별 수학내신과 서술형, 기초수학 보충과 선행을 한 흐름으로 관리합니다.",
    topics: [
      ["수학수업", "개념 설명 → 예제 → 학생 설명 → 유사 문제 적용 순서로 진행합니다. 풀이 과정을 직접 써 보게 해 서술형 감점 요인을 수업 안에서 바로 고칩니다."],
      ["수학공부", "개념 정리 노트와 오답 노트를 함께 만들고, 주간 과제 분량을 학생 일정에 맞게 조절합니다. 시험 4주 전부터는 학교 진도에 맞춘 내신 공부 계획으로 전환합니다."],
      ["기초수학", "정수와 유리수 계산, 문자와 식, 일차방정식처럼 중등 수학 전체의 바탕이 되는 단원에서 막히는 지점을 찾아 다시 연결합니다. 초등 분수 연산이 약하면 그 부분부터 보충합니다."],
      ["수학내신", "학교별 교과서와 기출 유형, 서술형 비중을 분석해 중간고사·기말고사 범위에 맞춘 문제를 준비합니다. 시험 직전에는 실전 시간 배분과 검산 습관까지 점검합니다."]
    ],
    grades: [
      ["예비중1", "초등 분수·소수 계산을 점검하고 정수와 유리수, 문자와 식으로 중학 수학의 첫 틀을 만듭니다."],
      ["중1", "소인수분해, 정수와 유리수, 일차방정식, 좌표평면과 그래프, 기본 도형과 통계를 다룹니다."],
      ["중2", "유리수와 순환소수, 식의 계산, 연립방정식, 일차함수, 도형의 성질과 확률을 안정적으로 익힙니다."],
      ["중3", "제곱근과 실수, 인수분해, 이차방정식, 이차함수, 삼각비와 원의 성질로 고등 수학을 준비합니다."]
    ],
    faq: [
      ["{name} 중등 수학내신 대비는 언제부터 하나요?", "평소에는 학교 진도에 맞춰 개념과 유형을 다지고, 시험 4주 전부터 학교별 기출과 서술형 중심의 내신 대비로 전환합니다."],
      ["중학교 수학 선행은 얼마나 하는 것이 좋나요?", "현재 학년 내용을 스스로 풀 수 있을 때 선행을 권합니다. 무리한 선행보다 현재 학년의 빈틈을 먼저 메우는 것이 고등 수학에서 더 큰 차이를 만듭니다."],
      ["수학학원과 1:1 수학과외는 무엇이 다른가요?", "1:1 과외는 학생 한 명의 진도와 약점에 맞춰 수업 내용을 매번 조정할 수 있습니다. 질문이 많거나 학원 진도를 따라가기 어려운 학생에게 특히 효과적입니다."]
    ]
  },
  {
    slug: "high", label: "고등", student: "고등학생", eyebrow: "HIGH SCHOOL MATH",
    titleTail: "수능수학·수능대비·내신 1:1 맞춤",
    summary: "고등 수학내신과 수능수학을 함께 설계하는 1:1 수능대비 수업",
    card: "고등 수학내신, 수능수학 기출 분석, 모의고사 실전 연습까지 목표 등급에 맞춰 관리합니다.",
    topics: [
      ["수학수업", "공통수학부터 대수, 미적분Ⅰ, 확률과 통계까지 학생이 배우는 과목 순서에 맞춰 개념과 문제 해결 전략을 연결합니다. 풀이를 외우지 않고 조건을 해석하는 방법을 훈련합니다."],
      ["수학공부", "주간 학습량, 오답 관리, 복습 주기를 정해 혼자 하는 수학공부 시간이 실제 점수로 이어지도록 관리합니다. 내신 기간과 모의고사 기간의 공부 비중을 다르게 설계합니다."],
      ["기초수학", "고등 수학이 갑자기 어려워졌다면 대부분 중학 수학의 인수분해, 이차함수, 방정식에서 시작된 빈틈입니다. 필요한 중등 단원만 골라 짧게 복습하고 고등 개념으로 바로 연결합니다."],
      ["수학내신", "학교별 기출과 부교재, 수행평가 일정을 반영해 내신 대비 자료를 준비합니다. 고난도 문항과 서술형에서 점수를 지킬 수 있도록 시험 직전 실전 연습을 진행합니다."],
      ["수능대비", "현재 모의고사 등급과 목표 등급을 기준으로 단원별 우선순위를 정합니다. 기본 개념 → 기출 분석 → 실전 모의고사 순서로 남은 기간에 맞춘 수능대비 계획을 세웁니다."],
      ["수능수학", "평가원·교육청 기출을 단원별로 분석해 자주 출제되는 유형과 사고 과정을 익힙니다. 시험 시간 안에 풀 문제와 넘길 문제를 고르는 실전 감각까지 함께 다룹니다."]
    ],
    grades: [
      ["예비고1", "중학 전 범위의 취약점을 진단하고 공통수학의 다항식, 방정식과 부등식, 경우의 수를 체계적으로 시작합니다."],
      ["고1", "공통수학1·2 내신을 중심으로 첫 모의고사에 대비하며 고등 수학 공부 방법을 자리 잡습니다."],
      ["고2", "대수, 미적분Ⅰ, 확률과 통계 등 선택 과목 내신과 수능 범위를 함께 고려해 학습 순서를 설계합니다."],
      ["고3", "수능 출제 범위 기출 분석, 실전 모의고사, 취약 단원 집중 보완으로 목표 등급을 만듭니다."]
    ],
    faq: [
      ["{name} 고등 수능대비는 언제부터 시작해야 하나요?", "고1부터 모의고사 결과로 취약 단원을 확인하고, 고2 겨울방학부터 본격적인 수능수학 기출 분석에 들어가는 흐름을 권합니다. 시작이 늦었다면 출제 비중이 높은 단원부터 우선 정리합니다."],
      ["내신과 수능 중 무엇에 집중해야 하나요?", "목표 대학과 전형에 따라 다릅니다. 첫 상담에서 현재 내신·모의고사 성적과 목표를 확인한 뒤, 시험 기간에는 내신, 그 외 기간에는 수능수학 비중을 높이는 방식으로 균형을 잡습니다."],
      ["고등 수학 기초가 부족해도 따라갈 수 있나요?", "필요한 중등 단원만 골라 짧게 복습한 뒤 고등 개념으로 바로 연결합니다. 기초수학 보충과 학교 진도를 병행하므로 내신 일정에 뒤처지지 않습니다."]
    ]
  }
];

// 주제형 키워드 가이드 페이지 (/guide/{slug}/)
const guides = [
  {
    slug: "online-math", keyword: "강원 화상 수학과외", short: "화상 수학과외",
    title: "강원 화상 수학과외 | 온라인 1:1 수학수업 진행 방식",
    eyebrow: "ONLINE MATH CLASS",
    lead: "평창, 정선, 인제처럼 이동 거리가 긴 지역에서도 매주 같은 선생님과 1:1로 수업합니다. 필기 화면으로 풀이 과정을 실시간으로 함께 확인하는 온라인 수학과외입니다.",
    card: "읍·면 지역, 바쁜 일정에도 이동 없이 받는 1:1 온라인 수학수업 진행 방식과 준비물을 안내합니다.",
    sections: [
      { h: "화상 수학과외가 필요한 경우", p: ["강원도는 같은 시군 안에서도 읍·면 사이 거리가 멀어 방문 수업 시간을 맞추기 어려운 경우가 많습니다. 통학 시간이 길거나 가까운 곳에 학원이 없는 학생, 방과후 일정이 촘촘한 학생에게 화상 수업은 이동 시간 없이 수업 시간을 온전히 확보하는 방법입니다."], list: ["읍·면 지역 거주로 방문 수업 일정을 맞추기 어려운 경우", "운동부·기숙사 생활 등으로 고정 일정이 어려운 경우", "방문 수업과 병행해 시험 기간 보강이 필요한 경우"] },
      { h: "온라인 수학수업은 이렇게 진행합니다", p: ["수업 전에 교재와 학교 프린트를 사진으로 공유받아 준비합니다. 수업 중에는 필기 화면으로 풀이를 함께 쓰고, 학생도 자신의 풀이를 카메라나 필기 화면으로 보여 주며 직접 설명합니다."], list: ["수업 전: 교재·학교 프린트·과제 확인", "수업 중: 실시간 필기 화면으로 개념 설명과 풀이 확인", "수업 후: 오답과 과제를 정리해 학부모님께 공유"] },
      { h: "화면 너머에서도 집중력을 유지하는 방법", p: ["화상 수업에서 가장 중요한 것은 학생이 듣기만 하지 않게 하는 것입니다. 10~15분마다 학생이 직접 푸는 시간을 두고, 풀이 과정을 말로 설명하게 해 이해 여부를 바로 확인합니다. 초등 저학년은 수업 시간을 짧게 나누어 진행합니다."] },
      { h: "준비물", p: ["특별한 장비 없이도 시작할 수 있습니다. 첫 수업 전에 연결 상태를 함께 점검합니다."], list: ["카메라가 있는 노트북 또는 태블릿", "풀이를 비출 수 있는 휴대폰 거치대 또는 필기용 태블릿", "조용한 공부 공간과 안정적인 인터넷"] }
    ],
    faq: [
      ["화상 수업도 방문 수업만큼 효과가 있나요?", "학생이 직접 풀고 설명하는 시간을 충분히 두면 이해도 확인은 방문 수업과 크게 다르지 않습니다. 초등 저학년이나 집중 시간이 짧은 학생은 첫 상담에서 방문 수업과 비교해 결정합니다."],
      ["방문 수업과 화상 수업을 섞을 수 있나요?", "가능합니다. 평소에는 방문 수업, 시험 기간 보강이나 일정이 어려운 주에는 화상 수업으로 진행하는 방식이 많이 쓰입니다."]
    ]
  },
  {
    slug: "winter-math", keyword: "겨울방학 수학 선행", short: "겨울방학 수학 선행",
    title: "겨울방학 수학 선행 계획 | 예비중1·예비고1 강원 수학과외",
    eyebrow: "WINTER BREAK PLAN",
    lead: "겨울방학은 한 학년의 빈틈을 메우고 다음 학년 첫 단원을 준비하는 가장 긴 시간입니다. 예비 학년별로 복습과 선행의 비율을 다르게 잡아야 3월 첫 시험이 달라집니다.",
    card: "예비중1부터 예비고3까지, 복습과 선행 비율을 학년별로 나눈 겨울방학 수학 계획을 정리했습니다.",
    sections: [
      { h: "선행보다 먼저 확인할 것", p: ["겨울방학 수학 선행을 시작하기 전에 지난 1년의 시험지와 오답을 먼저 봅니다. 현재 학년 핵심 단원에 빈틈이 있다면, 선행 진도를 나가도 다음 학년에서 같은 지점에서 다시 막히기 때문입니다."] },
      { h: "예비 학년별 겨울방학 수학 계획", p: ["학년마다 방학에 가장 먼저 챙겨야 할 단원이 다릅니다."], list: ["예비중1: 분수·소수 연산 점검 → 정수와 유리수, 문자와 식 선행", "예비중2·예비중3: 현재 학년 함수·방정식 복습 → 다음 학년 1학기 범위 선행", "예비고1: 중학 전 범위 진단 → 공통수학 다항식, 방정식과 부등식 시작", "예비고2·예비고3: 공통수학 빈틈 보완 → 대수·미적분Ⅰ 개념과 모의고사 대비"] },
      { h: "방학 한 주의 학습 구조", p: ["방학에는 주 2~3회 수업과 매일 1~2시간 과제를 기본으로 잡습니다. 한 주의 앞부분에는 새 개념을, 뒷부분에는 그 주 개념의 문제 적용과 복습을 배치해 개학 전까지 배운 내용이 남도록 합니다."] },
      { h: "언제 상담하면 좋을까요", p: ["기말고사가 끝난 직후, 방학 시작 3~4주 전이 가장 좋습니다. 기말고사 시험지로 진단을 마치고 방학 첫 주부터 계획대로 수업을 시작할 수 있습니다."] }
    ],
    faq: [
      ["겨울방학 선행은 한 학기 이상 나가야 하나요?", "학생마다 다릅니다. 현재 학년 내용이 안정적이면 한 학기 이상도 가능하지만, 빈틈이 있다면 복습과 다음 학년 첫 단원까지 탄탄하게 준비하는 편이 3월 성적에 더 도움이 됩니다."],
      ["방학 중에만 수업할 수도 있나요?", "가능합니다. 방학 집중 수업 후 학기 중에는 횟수를 줄여 관리하는 방식도 상담에서 안내해 드립니다."]
    ]
  },
  {
    slug: "exam-prep", keyword: "수학 내신 대비", short: "중간고사·기말고사 수학",
    title: "중간고사·기말고사 수학 내신 대비 | 강원 중등·고등 수학과외",
    eyebrow: "SCHOOL EXAM PREP",
    lead: "수학 내신은 학교마다 교과서, 부교재, 서술형 비중이 다릅니다. 시험 4주 전부터 학교별 범위와 기출 경향에 맞춰 준비하는 중등·고등 수학 내신 대비 방법입니다.",
    card: "시험 4주 전 계획, 학교별 기출 분석, 서술형 감점 줄이기까지 수학 내신 대비 순서를 안내합니다.",
    sections: [
      { h: "시험 4주 전부터의 수학 내신 계획", p: ["시험 범위가 나오면 남은 기간을 4단계로 나누어 준비합니다."], list: ["4주 전: 시험 범위 확정, 교과서·부교재 개념 정리", "3주 전: 단원별 유형 문제와 학교 기출 풀이", "2주 전: 서술형 대비와 오답 재풀이", "1주 전: 실전 시간에 맞춘 예상 문제, 검산 습관 점검"] },
      { h: "학교별 기출 분석", p: ["같은 단원이라도 학교마다 자주 나오는 유형과 고난도 문항의 위치가 다릅니다. 이전 시험지를 바탕으로 객관식·서술형 배점과 부교재 반영 비율을 확인하고, 우리 학교 시험에 맞춘 문제를 준비합니다."] },
      { h: "서술형 감점 줄이기", p: ["서술형은 답이 맞아도 풀이 과정이 빠지면 감점됩니다. 평소 수업에서 조건 정리 → 식 세우기 → 결론 쓰기 순서로 풀이를 쓰는 연습을 해 시험장에서 자연스럽게 나오도록 합니다."] },
      { h: "시험이 끝난 뒤가 더 중요합니다", p: ["시험이 끝나면 틀린 문제를 실수, 개념 부족, 시간 부족으로 나누어 기록합니다. 다음 시험 계획은 이 기록에서 출발합니다."] }
    ],
    faq: [
      ["시험 기간에만 수업을 받을 수 있나요?", "시험 대비 단기 수업도 상담 가능합니다. 다만 평소 개념이 쌓여 있어야 4주 대비의 효과가 크기 때문에 학기 중 꾸준한 수업을 권해 드립니다."],
      ["수학 수행평가도 도와주나요?", "수학 수행평가 일정과 과제 형식을 확인해 관련 개념과 풀이 정리를 함께 준비합니다."]
    ]
  },
  {
    slug: "basic-math", keyword: "수포자 탈출 기초수학", short: "수포자 탈출",
    title: "수포자 탈출, 수학 기초 다시 잡기 | 강원 기초수학 1:1 과외",
    eyebrow: "BACK TO BASICS",
    lead: "수학을 포기하게 되는 시점은 대부분 특정 단원 하나에서 시작됩니다. 막힌 지점을 정확히 찾아 거슬러 올라가 채우는 기초수학 1:1 수업 방식입니다.",
    card: "수학을 놓친 지점을 진단하고 필요한 이전 학년 단원만 골라 다시 연결하는 기초수학 수업입니다.",
    sections: [
      { h: "수학을 놓치게 되는 지점", p: ["학교급마다 많은 학생이 막히는 단원이 있습니다."], list: ["초등: 분수의 계산, 나눗셈, 문장제 해석", "중등: 정수와 유리수 계산, 문자와 식, 일차함수", "고등: 인수분해·이차함수 기초 부족에서 시작되는 공통수학 전반"] },
      { h: "진단 → 역추적 → 연결", p: ["첫 수업에서 현재 학년 문제를 풀게 한 뒤, 틀린 문제가 어느 이전 단원과 연결되는지 거슬러 올라갑니다. 필요한 이전 학년 단원만 짧게 복습하고 바로 현재 학년 문제로 돌아와 연결합니다. 처음부터 전부 다시 배우는 방식보다 시간이 훨씬 적게 듭니다."] },
      { h: "자신감을 먼저 회복합니다", p: ["오래 수학을 놓친 학생은 문제를 끝까지 읽기도 전에 포기하는 습관이 있습니다. 처음에는 풀 수 있는 난도의 문제로 성공 경험을 쌓고, 학생이 풀이를 직접 설명하는 비중을 점점 늘립니다."] },
      { h: "학교 진도와 함께 갑니다", p: ["기초 보충만 하다 보면 학교 시험에서 다시 뒤처집니다. 매 수업을 기초 보충과 학교 진도로 나누어 진행하고, 시험 기간에는 학교 범위 비중을 높입니다."] }
    ],
    faq: [
      ["고등학생인데 중학교 수학부터 다시 해야 하나요?", "전부 다시 할 필요는 없습니다. 진단으로 고등 수학에 직접 필요한 중학 단원만 골라 짧게 복습하고 고등 개념으로 바로 연결합니다."],
      ["얼마나 해야 효과가 보이나요?", "학생마다 다릅니다. 막힌 단원을 정확히 찾으면 학교 수업을 따라가는 느낌부터 달라지는 경우가 많고, 상담에서 현재 상태를 보고 현실적인 기간을 안내합니다."]
    ]
  },
  {
    slug: "csat-math", keyword: "수능수학 공부법", short: "수능수학 공부법",
    title: "수능수학 공부법 | 모의고사 등급 올리는 강원 고등 수학과외",
    eyebrow: "CSAT MATH STRATEGY",
    lead: "수능수학 점수는 개념, 기출, 실전 감각이 차례로 쌓여야 오릅니다. 현재 모의고사 등급에 따라 무엇부터 해야 하는지 정리한 고등 수능대비 학습 방법입니다.",
    card: "모의고사 등급대별 우선순위, 기출 분석법, 실전 모의고사 루틴까지 수능대비 순서를 정리했습니다.",
    sections: [
      { h: "모의고사 등급대별 우선순위", p: ["같은 수능대비라도 현재 등급에 따라 먼저 해야 할 일이 다릅니다."], list: ["5등급 이하: 교과서 수준 개념과 기본 계산의 정확도부터 회복", "3~4등급: 단원별 기출 유형 정리, 중간 난도 문항 안정화", "1~2등급: 고난도 기출 분석, 시간 배분과 실수 관리"] },
      { h: "기출 문제는 이렇게 봅니다", p: ["기출은 많이 푸는 것보다 한 문제에서 출제 의도와 조건 해석 방식을 뽑아내는 것이 중요합니다. 평가원·교육청 기출을 단원별로 묶어 반복되는 사고 과정을 정리합니다."] },
      { h: "실전 모의고사 루틴", p: ["수능이 가까워질수록 실제 시험 시간에 맞춘 모의고사를 정기적으로 풀고, 시간이 부족했던 문항과 실수를 따로 기록합니다. 풀 문제와 넘길 문제를 고르는 기준도 이 과정에서 만들어집니다."] },
      { h: "내신과 수능을 함께 가져가는 법", p: ["고1·고2는 내신 비중이 크기 때문에 시험 기간에는 내신, 그 외 기간에는 수능형 문제 비중을 높이는 방식으로 균형을 잡습니다. 수능 범위 과목의 내신 공부가 곧 수능 기초가 되도록 연결합니다."] }
    ],
    faq: [
      ["모의고사 등급이 낮은데 수능까지 올릴 수 있나요?", "남은 기간과 현재 상태에 따라 다릅니다. 출제 비중이 높은 단원부터 정리하면 짧은 기간에도 안정적으로 맞히는 문제를 늘릴 수 있습니다."],
      ["N수생도 수업이 가능한가요?", "가능합니다. 지난 수능과 모의고사 성적표를 바탕으로 취약 단원을 진단해 계획을 세웁니다."]
    ]
  },
  {
    slug: "academy-vs-tutoring", keyword: "수학학원 vs 수학과외", short: "수학학원 vs 과외",
    title: "수학학원 vs 수학과외 | 비용·효과 비교와 선택 기준",
    eyebrow: "HOW TO CHOOSE",
    lead: "수학학원과 1:1 수학과외는 장단점이 분명합니다. 학생의 성향과 현재 실력에 따라 어떤 수업이 맞는지, 수학과외 비용은 무엇으로 정해지는지 정리했습니다.",
    card: "어떤 학생에게 학원이, 어떤 학생에게 1:1 과외가 맞는지와 수학과외 비용이 정해지는 기준을 비교합니다.",
    sections: [
      { h: "수학학원이 잘 맞는 학생", p: ["학원은 정해진 커리큘럼과 또래 학습 분위기가 장점입니다."], list: ["현재 학년 진도를 무리 없이 따라가는 학생", "또래와 함께할 때 동기부여가 되는 학생", "정해진 커리큘럼과 일정이 편한 학생"] },
      { h: "1:1 수학과외가 잘 맞는 학생", p: ["과외는 한 학생의 진도와 약점에 맞춰 수업 내용을 매번 바꿀 수 있다는 점이 가장 큰 차이입니다."], list: ["특정 단원에서 막혀 학원 진도를 따라가기 어려운 학생", "질문을 많이 해야 이해되는 학생", "학교별 내신이나 목표 등급에 맞춘 개별 계획이 필요한 학생", "학원이 멀거나 일정이 맞지 않는 읍·면 지역 학생"] },
      { h: "수학과외 비용은 이렇게 정해집니다", p: ["수학과외 비용은 학년, 주당 수업 횟수, 1회 수업 시간, 방문·화상 여부에 따라 달라집니다. 같은 예산이라도 수업 횟수를 줄이고 과제 관리를 늘리는 등 학생 상황에 맞게 조정할 수 있으니, 상담에서 구체적으로 안내받으시는 것이 가장 정확합니다."] },
      { h: "학원과 과외를 함께 하는 경우", p: ["학원에서 진도를 나가고 과외로 빈틈과 내신을 보완하는 학생도 많습니다. 이 경우 학원 진도와 겹치지 않게 오답 보완, 서술형, 학교 기출 중심으로 수업을 구성합니다."] }
    ],
    faq: [
      ["상담만 받아 봐도 되나요?", "네. 상담에서 학생의 현재 상태를 보고 학원과 과외 중 어느 쪽이 맞는지 솔직하게 안내해 드립니다."],
      ["학원을 다니면서 과외를 같이 해도 되나요?", "가능합니다. 학원 진도와 겹치지 않도록 오답 보완과 학교 내신 중심으로 과외 수업을 구성합니다."]
    ]
  }
];

const commonFaq = [
  ["{full} 수학과외는 방문 수업인가요, 온라인 수업인가요?", "{areas} 등 {full} 생활권은 거리와 일정에 따라 방문 1:1 수업 또는 화상(온라인) 수업 중 선택할 수 있고, 두 방식을 섞어 진행할 수도 있습니다."],
  ["수학과외 비용(수업료)은 어떻게 정해지나요?", "학년, 주당 수업 횟수, 1회 수업 시간에 따라 달라집니다. 무료 상담에서 학생 상황을 확인한 뒤 수업 방식과 비용을 투명하게 안내해 드립니다."],
  ["상담은 어떻게 신청하나요?", "{phone}로 전화 주시거나 문자로 지역·학년·현재 고민을 남겨 주시면 연락드립니다. 최근 시험지나 사용 중인 교재를 보여 주시면 더 정확한 진단이 가능합니다."]
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
}
.topics{background:#fff}.topic-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}.topic{padding:28px;border:1px solid var(--line);border-radius:var(--radius);background:var(--paper)}.topic small{color:var(--leaf);font-weight:800;font-size:13px}.topic h3{font-size:21px;margin:8px 0 10px}.topic p{color:var(--muted);font-size:15px;margin:0}
.level-section{background:#fff}.level-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}.level-card{display:flex;flex-direction:column;padding:30px;background:var(--paper);border:1px solid var(--line);border-radius:var(--radius);transition:.2s}.level-card:hover{border-color:var(--leaf);transform:translateY(-2px)}.level-card small{color:var(--leaf);font-weight:800;font-size:13px}.level-card h3{font-size:23px;margin:8px 0 10px}.level-card p{color:var(--muted);font-size:15px;margin:0 0 14px}.level-card .topic-line{color:var(--forest);font-weight:700;font-size:14px}.level-card .more{margin-top:auto;color:var(--leaf);font-weight:800;font-size:14px}
.chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px}.chip{padding:8px 14px;border:1px solid var(--line);border-radius:999px;background:#fff;font-size:14px;font-weight:600;transition:.2s}.chip:hover{border-color:var(--leaf);color:var(--forest)}
.faq{background:var(--paper)}.faq-list{border-top:1px solid var(--ink)}.faq-item{border-bottom:1px solid var(--line)}.faq-item summary{cursor:pointer;padding:20px 0;font-weight:700;font-size:17px;list-style:none}.faq-item summary::-webkit-details-marker{display:none}.faq-item summary:before{content:"Q.";color:var(--leaf);margin-right:10px}.faq-item p{color:var(--muted);margin:0 0 20px;padding-left:30px}
.related{background:#eef0e9;padding:72px 0}.related h2{font-family:"Gowun Batang",serif;font-size:clamp(26px,3vw,34px);margin-bottom:0}.related h3{font-size:16px;margin:30px 0 0}
.article{background:#fff}.article-body{max-width:780px}.article-body h2{font-family:"Gowun Batang",serif;font-size:clamp(26px,3vw,34px);line-height:1.3;margin:56px 0 16px}.article-body h2:first-child{margin-top:0}.article-body p{color:var(--muted);font-size:17px}.article-body .check-list{margin:0 0 8px}
.school-list{list-style:none;padding:0;margin:16px 0 0}.school-list .chip:hover{border-color:var(--line);color:inherit}#schools h3 a:hover{color:var(--forest)}.school-source{margin:28px 0 0;font-size:13px;color:var(--muted)}
.footer-links{display:flex;flex-wrap:wrap;gap:6px 16px;margin-bottom:26px;padding-bottom:26px;border-bottom:1px solid rgba(255,255,255,.12);font-size:13px}.footer-links a:hover{color:#fff}
@media(max-width:900px){.topic-grid,.level-grid{grid-template-columns:1fr 1fr}}
@media(max-width:600px){.topic-grid,.level-grid{grid-template-columns:1fr}.faq-item summary{font-size:16px}.faq-item p{padding-left:0}footer{padding-bottom:90px}}`;

const nav = `<nav class="nav"><div class="wrap nav-inner"><a class="brand" href="/"><img src="/assets/logo.svg" alt="">강원 수학과외</a><div class="nav-links"><a href="/elementary/">초등 수학</a><a href="/middle/">중등 수학</a><a href="/high/">고등 수학</a><a href="/guide/">학습 가이드</a><a href="#region" onclick="window.openRegionModal && (event.preventDefault(), window.openRegionModal())">지역 찾기</a><a class="nav-cta" href="#contact">상담 신청</a></div></div></nav>`;
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

  // 같은 방문(세션) 안에서는 처음 들어온 페이지에서만 자동으로 띄웁니다.
  var seen = false;
  try { seen = sessionStorage.getItem('regionModalSeen') === '1'; sessionStorage.setItem('regionModalSeen', '1'); } catch (e) {}
  ${autoOpen ? `if (!seen) setTimeout(openModal, 120);` : ``}

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

// 받침 여부에 따라 "으로/로"를 붙입니다. (예: 준비로, 관리로, 수업으로)
function withRo(word) {
  const code = word.charCodeAt(word.length - 1) - 0xac00;
  const jong = code >= 0 && code <= 11171 ? code % 28 : 0;
  return word + (jong === 0 || jong === 8 ? "로" : "으로");
}
function withEul(word) {
  const code = word.charCodeAt(word.length - 1) - 0xac00;
  return word + (code >= 0 && code <= 11171 && code % 28 !== 0 ? "을" : "를");
}

const gangwon = { name: "강원", full: "강원특별자치도", areas: "춘천, 원주, 강릉 등 18개 시군", focus: "학생별 진도와 목표에 맞춘 1:1 관리" };
const regionContext = region => ({ ...region, full: `${region.name}${region.type}`, path: `/regions/${region.slug}/` });
const levelPath = (level, ctx) => (ctx.slug ? `/regions/${ctx.slug}/${level.slug}/` : `/${level.slug}/`);
const fill = (text, ctx) => text.replaceAll("{name}", ctx.name).replaceAll("{full}", ctx.full).replaceAll("{areas}", ctx.areas).replaceAll("{phone}", phone);
const faqItems = (items, ctx) => items.map(([q, a]) => [fill(q, ctx), fill(a, ctx)]);
const escapeXml = text => text.replace(/[<>&"']/g, ch => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" })[ch]);

function layout({ title, description, body, canonical = siteUrl, crumbs = [], faq = [] }) {
  const graph = [
    { "@type": "EducationalOrganization", "@id": `${siteUrl}/#org`, name: "강원 수학과외", url: siteUrl, logo: `${siteUrl}/assets/logo.svg`, telephone: phone, description: "강원특별자치도 18개 시군 초등·중등·고등 1:1 수학과외", areaServed: regions.map(region => ({ "@type": "City", name: `강원특별자치도 ${region.name}${region.type}` })) },
    { "@type": "WebSite", "@id": `${siteUrl}/#website`, name: "강원 수학과외", url: siteUrl, inLanguage: "ko-KR", publisher: { "@id": `${siteUrl}/#org` } },
    { "@type": "WebPage", "@id": canonical, url: canonical, name: title, description, inLanguage: "ko-KR", isPartOf: { "@id": `${siteUrl}/#website` }, dateModified: buildDate.toISOString() }
  ];
  if (crumbs.length) graph.push({ "@type": "BreadcrumbList", itemListElement: crumbs.map(([name, url], index) => ({ "@type": "ListItem", position: index + 1, name, item: `${siteUrl}${url}` })) });
  if (faq.length) graph.push({ "@type": "FAQPage", mainEntity: faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) });
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="naver-site-verification" content="8d466503f61c14573b40c21964c1dece8020e823"><meta name="google-site-verification" content="xwZjq-emucjWhascjT0SQmVrFQ6zTWwD7_Ybaq-vXGA"><title>${title}</title><meta name="description" content="${description}"><meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="${canonical}"><link rel="icon" href="/assets/logo.svg" type="image/svg+xml"><link rel="alternate" type="application/rss+xml" title="강원 수학과외" href="${siteUrl}/rss.xml"><meta property="og:type" content="website"><meta property="og:site_name" content="강원 수학과외"><meta property="og:locale" content="ko_KR"><meta property="og:title" content="${title}"><meta property="og:description" content="${description}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80"><meta name="twitter:card" content="summary_large_image"><link rel="stylesheet" href="/assets/style.css"><script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": graph })}</script></head><body>${nav}${body}<div class="mobile-cta"><a href="tel:${phone}">전화 상담</a><a href="#contact">상담 신청</a></div></body></html>`;
}

function hero(title, copy, eyebrow = "Gangwon Private Math Coaching", crumbs = []) {
  const breadcrumb = crumbs.length ? `<nav class="breadcrumb" aria-label="현재 위치">${crumbs.map(([name, url], index) => (index < crumbs.length - 1 ? `<a href="${url}">${name}</a>` : `<span>${name}</span>`)).join(" › ")}</nav>` : "";
  return `<header class="hero"><div class="wrap hero-content">${breadcrumb}<p class="eyebrow">${eyebrow}</p><h1>${title}</h1><p class="hero-copy">${copy}</p><div class="hero-actions"><button type="button" class="button" onclick="window.openRegionModal && window.openRegionModal()">📍 지역 바로 선택</button><a class="button outline" href="#contact">무료 학습 상담</a><a class="button outline" href="tel:${phone}">${phone} 통화</a></div></div></header>`;
}

const proof = `<div class="proof"><div class="wrap proof-grid"><div class="proof-item"><strong>1:1 맞춤 설계</strong><span>현재 실력부터 목표까지 개인별 진도</span></div><div class="proof-item"><strong>18개 시군 수업</strong><span>강원 전 지역 방문·화상 수업 상담</span></div><div class="proof-item"><strong>초·중·고 전 학년</strong><span>기초수학, 내신, 수능을 한 흐름으로 관리</span></div></div></div>`;
const process = `<section class="process" id="program"><div class="wrap"><div class="section-head"><h2>점수가 달라지는<br>수업의 순서</h2><p>문제를 더 많이 푸는 것보다 먼저 해야 할 일이 있습니다. 학생의 현재 위치를 정확히 확인하고, 이해와 반복이 필요한 지점을 찾아 수업을 설계합니다.</p></div><div class="steps"><article class="step"><span class="step-num">01 · 진단</span><h3>학습 상태 확인</h3><p>최근 시험지와 학습 이력을 바탕으로 개념, 연산, 문제 해석의 약점을 구분합니다.</p></article><article class="step"><span class="step-num">02 · 설계</span><h3>개인 커리큘럼</h3><p>학교 진도와 목표 성적, 가능한 학습 시간을 반영해 현실적인 계획을 세웁니다.</p></article><article class="step"><span class="step-num">03 · 수업</span><h3>개념과 적용 연결</h3><p>학생이 풀이 이유를 직접 설명하고 유사 문제에 적용할 수 있을 때까지 확인합니다.</p></article><article class="step"><span class="step-num">04 · 피드백</span><h3>학습 과정 관리</h3><p>오답과 과제 결과를 기록해 다음 수업에 반영하고 학부모님께 변화를 공유합니다.</p></article></div></div></section>`;
const gradeSection = `<section class="grades" id="grade"><div class="wrap"><div class="section-head"><h2>학년이 바뀌기 전,<br>준비는 달라야 합니다</h2><p>예비 학년은 무조건 빠른 선행보다 이전 학년의 구멍을 찾아 다음 과정과 자연스럽게 연결하는 시기입니다.</p></div><div class="grade-grid">${gradeCards}</div></div></section>`;
const regionsSection = `<section class="regions" id="region"><div class="wrap"><div class="section-head"><div><h2>우리 지역<br>수학과외 찾기</h2><p>강원특별자치도 18개 시군의 지역별 수업 안내를 확인하세요. 거주지와 일정에 따라 방문 또는 화상 수업을 상담합니다.</p></div><button type="button" class="button outline" style="color:var(--forest);border-color:var(--forest);" onclick="window.openRegionModal && window.openRegionModal()">시·군 선택 팝업 열기</button></div><div class="region-grid">${regionLinks}</div></div></section>`;
const split = `<section class="split"><div class="split-image" role="img" aria-label="학생의 학습을 지도하는 수업 공간"></div><div class="split-copy"><p class="eyebrow">Study with direction</p><h2>혼자 공부하는 힘까지<br>함께 기릅니다</h2><p>과외 시간에만 풀 수 있는 문제는 오래 남지 않습니다. 문제를 읽고, 조건을 표시하고, 풀이를 검토하는 과정을 반복해 스스로 공부할 수 있는 기준을 만듭니다.</p><ul class="check-list"><li>학교별 시험 범위와 일정 반영</li><li>매 수업 오답 원인 기록</li><li>학생·학부모 정기 학습 피드백</li></ul></div></section>`;
const guideSection = `<section class="level-section" id="guide"><div class="wrap"><div class="section-head"><h2>수학 공부 고민,<br>학습 가이드</h2><p>내신, 수능, 방학 선행, 기초 보충처럼 상담에서 가장 많이 받는 질문을 주제별로 정리했습니다.</p></div><div class="level-grid">${guides.map(guide => `<a class="level-card" href="/guide/${guide.slug}/"><small>${guide.eyebrow}</small><h3>${guide.keyword}</h3><p>${guide.card}</p><span class="more">가이드 읽기 →</span></a>`).join("")}</div></div></section>`;
const footerLinks =`<nav class="footer-links" aria-label="사이트 링크">${levels.map(level => `<a href="/${level.slug}/">강원 ${level.label} 수학과외</a>`).join("")}${guides.map(guide => `<a href="/guide/${guide.slug}/">${guide.short}</a>`).join("")}${regions.map(region => `<a href="/regions/${region.slug}/">${region.name} 수학과외</a>`).join("")}</nav>`;
const contact = (label = "강원") => `<section class="contact" id="contact"><div class="wrap contact-inner"><div><h2>${label} 수학과외,<br>현재 고민부터 들려주세요</h2><p>학년, 지역, 원하는 수업 목표를 전화나 문자로 남겨주시면 무료 학습 상담을 도와드립니다.</p></div><a class="button" href="tel:${phone}">${phone}</a></div></section><footer><div class="wrap">${footerLinks}<div class="footer-inner"><div><div class="footer-brand">강원 수학과외</div><span>강원특별자치도 초등·중등·고등 1:1 맞춤 수학 지도</span></div><div>상담 전화 <a href="tel:${phone}">${phone}</a><br>© ${buildDate.getFullYear()} 강원 수학과외. All rights reserved.</div></div></div></footer>`;

function faqSection(items, heading) {
  return `<section class="faq" id="faq"><div class="wrap"><div class="section-head"><h2>${heading}</h2><p>상담 전에 학부모님과 학생들이 가장 많이 묻는 질문을 정리했습니다.</p></div><div class="faq-list">${items.map(([q, a], index) => `<details class="faq-item"${index === 0 ? " open" : ""}><summary>${q}</summary><p>${a}</p></details>`).join("")}</div></div></section>`;
}

function levelCards(ctx) {
  return levels.map(level => `<a class="level-card" href="${levelPath(level, ctx)}"><small>${level.eyebrow}</small><h3>${ctx.name} ${level.label} 수학과외</h3><p>${level.card}</p><p class="topic-line">${level.topics.map(([topic]) => topic).join(" · ")}</p><span class="more">${ctx.name} ${level.label} 수학 자세히 보기 →</span></a>`).join("");
}

function levelSection(ctx) {
  const gradeChips = levels.flatMap(level => level.grades.map(([grade]) => `<a class="chip" href="${levelPath(level, ctx)}#grade">${ctx.name} ${grade} 수학과외</a>`)).join("");
  return `<section class="level-section" id="levels"><div class="wrap"><div class="section-head"><h2>${ctx.name} 초등·중등·고등<br>수학과외</h2><p>학교급마다 필요한 공부가 다릅니다. 초등은 기초수학과 연산 습관, 중등은 수학내신과 서술형, 고등은 내신과 수능수학을 함께 설계합니다.</p></div><div class="level-grid">${levelCards(ctx)}</div><h3 style="margin:40px 0 0;font-size:18px">학년별 ${ctx.name} 수학과외</h3><div class="chips">${gradeChips}</div></div></section>`;
}

function homePage() {
  const title = "강원 수학과외 | 초등·중등·고등 1:1 맞춤 수학수업";
  const description = `강원 수학과외 - 춘천·원주·강릉 등 18개 시군 초등 기초수학, 중등 수학내신, 고등 수능수학까지 1:1 맞춤 수업. 예비중1~예비고3 학년별 관리, 무료 상담 ☎ ${phone}`;
  const faq = faqItems([...commonFaq, ...levels.map(level => level.faq[0])], gangwon);
  const body = `${hero("강원 수학과외", "춘천부터 고성까지, 학생의 현재 실력과 학교 진도에 맞춘 초등·중등·고등 1:1 수학수업. 기초수학부터 수학내신, 수능수학까지 이해에서 성적으로 이어지는 공부의 기준을 함께 만듭니다.")}${proof}${levelSection(gangwon)}${process}${gradeSection}${guideSection}${regionsSection}${split}${faqSection(faq, "강원 수학과외<br>자주 묻는 질문")}${contact()}${renderRegionModal(true)}`;
  return layout({ title, description, body, faq });
}

function regionPage(region) {
  const ctx = regionContext(region);
  const crumbs = [["홈", "/"], [`${region.name} 수학과외`, ctx.path]];
  const title = `${region.name} 수학과외 | 초등·중등·고등 1:1 맞춤 수학수업`;
  const description = `${region.name} 수학과외 - ${region.areas} 초등 기초수학, 중등 수학내신, 고등 수능수학까지 학년별 1:1 맞춤 수업. 방문·화상 수업 무료 상담 ☎ ${phone}`;
  const faq = faqItems([...commonFaq, ...levels.map(level => level.faq[0])], ctx);
  const local = `<section class="local-intro"><div class="wrap local-copy"><div><p class="eyebrow">${ctx.full} LOCAL CLASS</p><h2>${region.name} 학생에게 맞는<br>현실적인 학습 계획</h2></div><div><p>${ctx.full} ${region.areas} 인근 학생을 대상으로 ${region.name} 수학과외를 상담합니다. 지역과 학교에 따라 시험 일정과 학습 환경이 다른 만큼, 정해진 교재를 일률적으로 따라가기보다 최근 시험 결과와 목표를 먼저 확인합니다.</p><p>${withEul(region.focus)} 중심으로 수업하며, 방문 수업이 어려운 거리나 일정에는 화상 수업을 함께 안내합니다. ${region.name} 초등 수학은 기초수학과 연산 습관, ${region.name} 중등 수학은 학교별 수학내신, ${region.name} 고등 수학은 내신과 수능대비를 개인 진도에 맞춰 연결합니다.</p></div></div></section>`;
  const body = `${hero(`${region.name}<br>수학과외`, `${region.areas}에서 만나는 초등·중등·고등 1:1 맞춤 수학수업. ${withRo(region.focus)} 공부의 방향을 분명하게 잡습니다.`, "GANGWON LOCAL MATH TUTORING", crumbs)}${proof}${local}${levelSection(ctx)}${schoolSection(ctx, levels)}${process}${faqSection(faq, `${region.name} 수학과외<br>자주 묻는 질문`)}${regionsSection}${contact(region.name)}${renderRegionModal(false)}`;
  return layout({ title, description, body, canonical: `${siteUrl}${ctx.path}`, crumbs, faq });
}

function schoolSummary(list, ctx, level) {
  const word = schoolWords[level.slug];
  return list.length === 1 ? `${ctx.full} ${list[0]}` : `${list.slice(0, 3).join(", ")} 등 ${ctx.full} ${list.length}개 ${word}`;
}

function schoolSection(ctx, levelList) {
  const groups = levelList.filter(level => schools[ctx.slug]?.[level.slug]?.length);
  if (!groups.length) return "";
  const single = groups.length === 1 ? groups[0] : null;
  const heading = single ? `${ctx.name} ${schoolWords[single.slug]}<br>수학과외` : `${ctx.name} 학교별<br>수학과외`;
  const lead = single
    ? `${schoolSummary(schools[ctx.slug][single.slug], ctx, single)} 학생을 대상으로 수업합니다. 학교마다 교과서와 ${single.slug === "elementary" ? "단원평가 방식" : "시험 출제 경향"}이 다르므로 다니는 학교의 최근 시험지와 진도를 바탕으로 수업을 설계합니다.`
    : `${ctx.full}의 초등학교, 중학교, 고등학교 학생을 대상으로 수업합니다. 학교마다 교과서와 시험 범위가 다르므로 다니는 학교의 최근 시험지와 진도를 먼저 확인합니다.`;
  const lists = groups.map(level => {
    const list = schools[ctx.slug][level.slug];
    const title = single ? "" : `<h3><a href="${levelPath(level, ctx)}">${ctx.name} ${schoolWords[level.slug]} 수학과외</a> <small style="color:var(--muted);font-weight:600">${list.length}개교</small></h3>`;
    return `${title}<ul class="chips school-list">${list.map(school => `<li class="chip">${school}</li>`).join("")}</ul>`;
  }).join("");
  return `<section class="related" id="schools"><div class="wrap"><div class="section-head"><h2>${heading}</h2><p>${lead}</p></div>${lists}<p class="school-source">학교 목록 출처: ${schoolSource}</p></div></section>`;
}

function levelPage(level, ctx) {
  const name = ctx.name;
  const path = levelPath(level, ctx);
  const keyword = `${name} ${level.label} 수학과외`;
  const crumbs = ctx.slug ? [["홈", "/"], [`${name} 수학과외`, ctx.path], [keyword, path]] : [["홈", "/"], [keyword, path]];
  const title = `${keyword} | ${level.titleTail}`;
  const description = `${keyword} - ${level.topics.map(([topic]) => `${level.label} ${topic}`).join("·")}. ${ctx.areas} ${level.student} 1:1 맞춤 수업, 무료 학습 상담 ☎ ${phone}`;
  const schoolList = ctx.slug ? schools[ctx.slug]?.[level.slug] ?? [] : [];
  const schoolFaq = schoolList.length ? [[`${name} ${schoolWords[level.slug]} 학교별 ${level.slug === "elementary" ? "진도" : "시험 범위"}에 맞춰 수업하나요?`, `네. ${schoolSummary(schoolList, ctx, level)} 학생의 교과서와 ${level.slug === "elementary" ? "단원평가 일정" : "시험 범위, 기출 경향"}을 확인해 학교별로 수업을 준비합니다.`]] : [];
  const faq = faqItems([...level.faq, ...schoolFaq, ...commonFaq], ctx);
  const intro =`<section class="local-intro"><div class="wrap local-copy"><div><p class="eyebrow">${level.eyebrow}</p><h2>${name} ${level.label} 수학,<br>지금 필요한 것부터</h2></div><div><p>${ctx.full} ${ctx.areas} 인근 ${level.student}을 위한 ${keyword}입니다. ${withRo(level.summary)}, 첫 상담에서 최근 시험지와 교재를 함께 보며 현재 위치를 확인합니다.</p><p>${withEul(ctx.focus)} 중심으로 ${name} ${level.label} ${withEul(level.topics.map(([topic]) => topic).join(", "))} 한 흐름으로 연결합니다. 방문 수업이 어려운 거리나 일정에는 화상 수업을 함께 안내합니다.</p></div></div></section>`;
  const topics = `<section class="topics" id="topics"><div class="wrap"><div class="section-head"><h2>${name} ${level.label} 수학,<br>이렇게 수업합니다</h2><p>같은 수학과외라도 학생에게 필요한 것은 다릅니다. 수업, 공부 습관, 기초 보충${level.topics.length > 3 ? ", 시험 대비" : ""}를 나눠 설계합니다.</p></div><div class="topic-grid">${level.topics.map(([topic, text], index) => `<article class="topic"><small>${String(index + 1).padStart(2, "0")}</small><h3>${name} ${level.label} ${topic}</h3><p>${text}</p></article>`).join("")}</div></div></section>`;
  const gradeBlock = `<section class="grades" id="grade"><div class="wrap"><div class="section-head"><h2>${name} 학년별<br>${level.label} 수학과외</h2><p>학년마다 배우는 단원과 시험의 성격이 다릅니다. 현재 학년의 핵심 단원을 기준으로 복습과 선행의 비중을 정합니다.</p></div><div class="grade-grid">${level.grades.map(([grade, text]) => `<article class="grade"><small>GRADE</small><h3>${name} ${grade} 수학과외</h3><p>${text}</p></article>`).join("")}</div></div></section>`;
  const sameRegion = [
    ...(ctx.slug ? [`<a class="chip" href="${ctx.path}">${name} 수학과외</a>`] : []),
    ...levels.filter(other => other !== level).map(other => `<a class="chip" href="${levelPath(other, ctx)}">${name} ${other.label} 수학과외</a>`),
    ...(ctx.slug ? [`<a class="chip" href="/${level.slug}/">강원 ${level.label} 수학과외</a>`] : [])
  ].join("");
  const otherRegions = regions.filter(region => region.slug !== ctx.slug).map(region => `<a class="chip" href="/regions/${region.slug}/${level.slug}/">${region.name} ${level.label} 수학</a>`).join("");
  const related = `<section class="related"><div class="wrap"><h2>함께 찾는 ${name} 수학과외 정보</h2><div class="chips">${sameRegion}</div><h3>${ctx.slug ? "다른 지역" : "지역별"} ${level.label} 수학과외</h3><div class="chips">${otherRegions}</div><h3>수학 학습 가이드</h3><div class="chips">${guideChips()}</div></div></section>`;
  const body = `${hero(`${name} ${level.label}<br>수학과외`, `${level.summary}. ${ctx.areas}에서 방문·화상으로 만나는 ${keyword}입니다.`, level.eyebrow, crumbs)}${proof}${intro}${ctx.slug ? schoolSection(ctx, [level]) : ""}${topics}${gradeBlock}${process}${faqSection(faq, `${keyword}<br>자주 묻는 질문`)}${related}${contact(`${name} ${level.label}`)}${renderRegionModal(false)}`;
  return layout({ title, description, body, canonical: `${siteUrl}${path}`, crumbs, faq });
}

function guideChips(except) {
  return guides.filter(guide => guide !== except).map(guide => `<a class="chip" href="/guide/${guide.slug}/">${guide.keyword}</a>`).join("");
}

function guidePage(guide) {
  const path = `/guide/${guide.slug}/`;
  const crumbs = [["홈", "/"], ["학습 가이드", "/guide/"], [guide.keyword, path]];
  const description = `${guide.lead.split(". ")[0]}. ${guide.keyword} 무료 상담 ☎ ${phone}`;
  const faq = faqItems([...guide.faq, commonFaq[2]], gangwon);
  const article = `<section class="article"><div class="wrap"><div class="article-body">${guide.sections.map(section => `<h2>${section.h}</h2>${section.p.map(text => `<p>${text}</p>`).join("")}${section.list ? `<ul class="check-list">${section.list.map(item => `<li>${item}</li>`).join("")}</ul>` : ""}`).join("")}</div></div></section>`;
  const related = `<section class="related"><div class="wrap"><h2>함께 보면 좋은 정보</h2><div class="chips">${guideChips(guide)}${levels.map(level => `<a class="chip" href="/${level.slug}/">강원 ${level.label} 수학과외</a>`).join("")}</div><h3>지역별 수학과외</h3><div class="chips">${regions.map(region => `<a class="chip" href="/regions/${region.slug}/">${region.name} 수학과외</a>`).join("")}</div></div></section>`;
  const body = `${hero(guide.keyword, guide.lead, guide.eyebrow, crumbs)}${proof}${article}${faqSection(faq, `${guide.short}<br>자주 묻는 질문`)}${related}${contact()}${renderRegionModal(false)}`;
  return layout({ title: guide.title, description, body, canonical: `${siteUrl}${path}`, crumbs, faq });
}

function guideIndexPage() {
  const crumbs = [["홈", "/"], ["학습 가이드", "/guide/"]];
  const body = `${hero("강원 수학과외<br>학습 가이드", "내신 대비, 수능수학, 겨울방학 선행, 기초수학까지 학부모님과 학생들이 가장 많이 묻는 수학 공부 고민을 정리했습니다.", "MATH STUDY GUIDE", crumbs)}${proof}${guideSection}${contact()}${renderRegionModal(false)}`;
  return layout({ title: "강원 수학과외 학습 가이드 | 내신·수능·선행·기초수학", description: `수학 내신 대비, 수능수학 공부법, 겨울방학 수학 선행, 수포자 탈출, 화상 수학과외, 학원 vs 과외 비교까지 강원 수학과외 학습 가이드. 무료 상담 ☎ ${phone}`, body, canonical: `${siteUrl}/guide/`, crumbs });
}

const pages = [{ path: "/", priority: "1.0", html: homePage() }];
pages.push({ path: "/guide/", priority: "0.8", html: guideIndexPage() });
for (const guide of guides) pages.push({ path: `/guide/${guide.slug}/`, priority: "0.8", html: guidePage(guide) });
for (const level of levels) pages.push({ path: `/${level.slug}/`, priority: "0.9", html: levelPage(level, gangwon) });
for (const region of regions) {
  pages.push({ path: `/regions/${region.slug}/`, priority: "0.8", html: regionPage(region) });
  for (const level of levels) pages.push({ path: `/regions/${region.slug}/${level.slug}/`, priority: "0.7", html: levelPage(level, regionContext(region)) });
}

await rm(dist, { recursive: true, force: true });
await mkdir(path.join(dist, "assets"), { recursive: true });
await writeFile(path.join(dist, "assets", "logo.svg"), logo);
await writeFile(path.join(dist, "assets", "style.css"), css);
for (const page of pages) {
  const directory = path.join(dist, ...page.path.split("/").filter(Boolean));
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, "index.html"), page.html);
}
const meta = (html, name) => html.match(new RegExp(`<meta name="${name}" content="([^"]*)"`))[1];
const pageTitle = html => html.match(/<title>([^<]*)<\/title>/)[1];
const lastmod = buildDate.toISOString().slice(0, 10);
await writeFile(path.join(dist, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.map(page => `\n  <url><loc>${siteUrl}${page.path === "/" ? "" : page.path}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>${page.priority}</priority></url>`).join("")}\n</urlset>\n`);
await writeFile(path.join(dist, "rss.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>강원 수학과외</title><link>${siteUrl}</link><description>강원특별자치도 18개 시군 초등·중등·고등 1:1 수학과외</description><language>ko</language><lastBuildDate>${buildDate.toUTCString()}</lastBuildDate>${pages.map(page => `\n<item><title>${escapeXml(pageTitle(page.html))}</title><link>${siteUrl}${page.path}</link><guid>${siteUrl}${page.path}</guid><description>${escapeXml(meta(page.html, "description"))}</description><pubDate>${buildDate.toUTCString()}</pubDate></item>`).join("")}\n</channel></rss>\n`);
await writeFile(path.join(dist, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`);
await writeFile(path.join(dist, "CNAME"), "studywin.kr\n");
await writeFile(path.join(dist, ".nojekyll"), "");
await writeFile(path.join(dist, "404.html"), layout({ title: "페이지를 찾을 수 없습니다 | 강원 수학과외", description: "요청하신 페이지를 찾을 수 없습니다.", body: `<main class="not-found"><div><p class="eyebrow">404 ERROR</p><h1>페이지를 찾을 수 없습니다</h1><p>주소가 변경되었거나 존재하지 않는 페이지입니다.</p><a class="button" href="/">홈으로 돌아가기</a></div></main>` }).replace('content="index,follow,max-image-preview:large"', 'content="noindex"'));
console.log(`Built ${pages.length} pages in ${dist}`);
