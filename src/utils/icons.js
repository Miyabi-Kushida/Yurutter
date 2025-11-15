export const ICONS = Array.from({ length: 63 }, (_, i) => {
  const index = i + 1;
  const webpPath = `/icons/icon${index}.webp`;

  return {
    value: webpPath,
    label: `アイコン${index}`,
  };
});