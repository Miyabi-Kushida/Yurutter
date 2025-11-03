// src/utils/icons.js
export const ICONS = Array.from({ length: 35 }, (_, i) => {
  const index = i + 1;
  const jpgPath = `/icons/icon${index}.jpg`;
  const pngPath = `/icons/icon${index}.png`;
  return {
    value: pngPath, // デフォルトで .png
    label: `アイコン${index}`,
    // フォールバック: もし .png が存在しなければ .jpg に自動切替
    fallback: jpgPath,
  };
});