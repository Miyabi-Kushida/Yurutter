// src/utils/time.js
import { formatDistanceToNow, parseISO } from "date-fns";
import { ja } from "date-fns/locale";

// createdAt を相対表示に変換する関数
export function formatRelativeTime(isoString) {
  if (!isoString) return "";
  const date = typeof isoString === "string" ? parseISO(isoString) : isoString;
  return formatDistanceToNow(date, { addSuffix: true, locale: ja });
}