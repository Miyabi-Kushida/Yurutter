// utils/name.js

const suffixes = [
    "☆プリンセス",
    "♪エンジェル",
    "⚡ドラゴン",
    "✿にゃんこ",
    "★無双",
    "♡マスター",
    "★ギャラクシー",
    "♬フェアリー",
    "☠パイレーツ",
    "🌙ムーンライト",
    "🔥ファイヤーソウル",
  ];
  
  const prefixes = [
    "煌めきの",
    "漆黒の",
    "永遠の",
    "勇者",
    "超絶",
    "幻影の",
    "疾風の",
    "伝説の",
    "乙女座の",
    "狂気の",
    "神々の",
  ];
  
  export function generateMoeName(input) {
    if (!input) return "";
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    return `${randomPrefix}${input}${randomSuffix}`;
  }  