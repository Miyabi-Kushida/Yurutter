// src/utils/date.js

// 日付を「2023年5月」形式にフォーマット
export function formatAccountDate(createdAt) {
    if (!createdAt) return "不明";
    const date = new Date(createdAt);
    return `${date.getFullYear()}年${date.getMonth() + 1}月`;
  }
  
  // アカウント年齢を「1年4ヶ月目」形式で計算
  export function calcAccountAge(createdAt) {
    if (!createdAt) return "不明";
    const created = new Date(createdAt);
    const now = new Date();
  
    let years = now.getFullYear() - created.getFullYear();
    let months = now.getMonth() - created.getMonth();
  
    if (months < 0) {
      years--;
      months += 12;
    }
  
    return `${years}年${months}ヶ月目`;
  }