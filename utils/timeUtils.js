// 時間ユーティリティ関数

/**
 * 日付を日本時間の文字列として表示する
 * @param {Date} date - 変換する日付
 * @returns {string} - 日本時間の文字列
 */
function toJapanTimeString(date) {
  if (!date) return '';
  
  // Dateオブジェクトでない場合は変換
  if (!(date instanceof Date)) {
    date = new Date(date);
  }
  
  // 日本時間（UTC+9）で表示
  return date.toLocaleString('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * 現在の日本時間を取得
 * @returns {Date} - 日本時間のDateオブジェクト
 */
function nowInJapan() {
  return new Date();
}

module.exports = {
  toJapanTimeString,
  nowInJapan
};
