// 배포 후 바뀐 페이지를 IndexNow(네이버 서치어드바이저, Bing 등)로 알립니다.
// 목록은 빌드 시 생성되는 .indexnow.json을 사용합니다. 전송 실패는 배포를 막지 않습니다.
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const host = "studywin.kr";
const key = "44f7dcb633519bf74212d31ce7b9a03c";
const endpoints = ["https://searchadvisor.naver.com/indexnow", "https://api.indexnow.org/indexnow"];

const urlList = JSON.parse(await readFile(path.join(root, ".indexnow.json"), "utf8").catch(() => "[]"));
if (!urlList.length) {
  console.log("IndexNow: 바뀐 페이지가 없어 전송하지 않습니다.");
  process.exit(0);
}

const body = JSON.stringify({ host, key, keyLocation: `https://${host}/${key}.txt`, urlList });
for (const endpoint of endpoints) {
  try {
    const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json; charset=utf-8" }, body });
    console.log(`IndexNow ${endpoint}: ${response.status} (${urlList.length}개 URL)`);
  } catch (error) {
    console.log(`IndexNow ${endpoint}: 실패 ${error.message}`);
  }
}
