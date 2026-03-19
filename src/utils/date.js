export const toDateKey = (dateObj) => {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getWeekStartDate = (dateObj) => {
  const start = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
  const day = start.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + diffToMonday);
  return start;
};

export const getWeekEndDate = (weekStartDate) => {
  const end = new Date(weekStartDate.getFullYear(), weekStartDate.getMonth(), weekStartDate.getDate());
  end.setDate(end.getDate() + 6);
  return end;
};

export const getMonthEndDate = (year, monthIndex) => new Date(year, monthIndex + 1, 0);

export const isSameDate = (leftDate, rightDate) => (
  leftDate.getFullYear() === rightDate.getFullYear() &&
  leftDate.getMonth() === rightDate.getMonth() &&
  leftDate.getDate() === rightDate.getDate()
);

export const getInterpolatedPlanRate = (targetDate, planAnchors) => {
  const targetTimestamp = targetDate.getTime();

  if (targetTimestamp <= planAnchors[0].timestamp) {
    return planAnchors[0].rate;
  }

  for (let index = 1; index < planAnchors.length; index += 1) {
    const previousAnchor = planAnchors[index - 1];
    const currentAnchor = planAnchors[index];

    if (targetTimestamp <= currentAnchor.timestamp) {
      const span = currentAnchor.timestamp - previousAnchor.timestamp;
      const progress = span === 0 ? 0 : (targetTimestamp - previousAnchor.timestamp) / span;
      const rateValue = previousAnchor.rate + (currentAnchor.rate - previousAnchor.rate) * progress;
      return Number(rateValue.toFixed(1));
    }
  }

  return planAnchors[planAnchors.length - 1].rate;
};

export const parseReportDate = (dateStr) => {
  if (!dateStr) return null;

  const raw = String(dateStr).trim();
  if (!raw) return null;

  const normalized = raw
    .replace(/年/g, '-')
    .replace(/月/g, '-')
    .replace(/日/g, '')
    .replace(/\//g, '-')
    .replace(/\./g, '-');

  const ymdMatch = normalized.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (ymdMatch) {
    const year = Number(ymdMatch[1]);
    const month = Number(ymdMatch[2]);
    const day = Number(ymdMatch[3]);
    const dateObj = new Date(year, month - 1, day);

    if (
      dateObj.getFullYear() === year &&
      dateObj.getMonth() === month - 1 &&
      dateObj.getDate() === day
    ) {
      return dateObj;
    }

    return null;
  }

  const fallback = new Date(raw);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
};

export const resolveDashboardYear = (dateRows) => {
  const years = dateRows
    .map((row) => parseReportDate(row['上报日期']))
    .filter(Boolean)
    .map((dateObj) => dateObj.getFullYear())
    .sort((left, right) => right - left);

  return years[0] ?? new Date().getFullYear();
};
