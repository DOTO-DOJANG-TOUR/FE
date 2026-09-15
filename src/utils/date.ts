export type DDayResult = {
  days: number;
  text: string;
};

export const getDDay = (startDate: string): DDayResult => {
  // 지원 형식
  // 2026.09.18
  // 2026-09-18
  // 2026/09/18
  // 2026-09-18T00:00:00
  // 2026-09-18T00:00:00Z
  // 2026-09-18T00:00:00+09:00

  const match = startDate.match(
    /^(\d{4})[./-](\d{1,2})[./-](\d{1,2})/
  );

  if (!match) {
    throw new Error(`지원하지 않는 날짜 형식입니다: ${startDate}`);
  }

  const [, yearString, monthString, dayString] = match;

  const year = Number(yearString);
  const month = Number(monthString);
  const day = Number(dayString);

  const validDate = new Date(year, month - 1, day);

  if (
    validDate.getFullYear() !== year ||
    validDate.getMonth() !== month - 1 ||
    validDate.getDate() !== day
  ) {
    throw new Error(`유효하지 않은 날짜입니다: ${startDate}`);
  }

  // 오늘 날짜
  const today = new Date();

  const todayTime = Date.UTC(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const startTime = Date.UTC(
    year,
    month - 1,
    day
  );

  const millisecondsPerDay = 1000 * 60 * 60 * 24;

  const days = Math.round(
    (startTime - todayTime) / millisecondsPerDay
  );

  const text =
    days > 0
      ? `D-${days}`
      : days === 0
        ? 'D-DAY'
        : `D+${Math.abs(days)}`;

  return {
    days,
    text,
  };
};

export const formatCompletedAt = (completedAt: string) => {
  const date = new Date(completedAt);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');

  return `${year}.${month}.${day} ${hour}:${minute}`;
};