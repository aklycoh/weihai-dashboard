import { formatBranchName, normalizeBranchName } from './branch';
import {
  getInterpolatedPlanRate,
  getMonthEndDate,
  getWeekEndDate,
  getWeekStartDate,
  isSameDate,
  parseReportDate,
  toDateKey,
} from './date';

export const buildDashboardData = ({
  planData,
  dateData,
  dashboardYear,
  planProgressMilestones,
}) => {
  const planProgressAnchors = [
    {
      dateObj: new Date(dashboardYear, 2, 1),
      timestamp: new Date(dashboardYear, 2, 1).getTime(),
      rate: 0,
    },
    ...planProgressMilestones.map(({ monthIndex, rate }) => {
      const dateObj = getMonthEndDate(dashboardYear, monthIndex);
      return {
        dateObj,
        timestamp: dateObj.getTime(),
        rate,
      };
    }),
  ];

  let totalPlanned = 0;
  const branchStatsMap = {};

  planData.forEach((row) => {
    const branch = formatBranchName(row['机构名称']);
    const branchKey = normalizeBranchName(branch);
    const planned = Number.parseInt(row['应上报授信户数'] || 0, 10);

    if (!branchKey || Number.isNaN(planned) || planned < 0) {
      return;
    }

    totalPlanned += planned;

    if (!branchStatsMap[branchKey]) {
      branchStatsMap[branchKey] = { branch, planned: 0, actual: 0, rate: 0 };
    }

    branchStatsMap[branchKey].planned += planned;
  });

  let totalActual = 0;
  let unmatchedActualCount = 0;
  const unmatchedBranches = new Set();
  const weeklyTrendMap = {};

  const validDatedRows = dateData
    .map((row) => {
      const branch = formatBranchName(row['机构名称']);
      const branchKey = normalizeBranchName(branch);
      const reportDate = parseReportDate(row['上报日期']);

      return branchKey && reportDate
        ? {
            ...row,
            branch,
            branchKey,
            reportDate,
          }
        : null;
    })
    .filter(Boolean)
    .sort((left, right) => left.reportDate.getTime() - right.reportDate.getTime());

  validDatedRows.forEach(({ branch, branchKey, reportDate }) => {
    if (branchStatsMap[branchKey]) {
      branchStatsMap[branchKey].actual += 1;
      totalActual += 1;
    } else {
      unmatchedActualCount += 1;
      unmatchedBranches.add(branch);
    }

    const weekStart = getWeekStartDate(reportDate);
    const weekKey = toDateKey(weekStart);
    weeklyTrendMap[weekKey] = (weeklyTrendMap[weekKey] || 0) + 1;
  });

  const branchStats = Object.values(branchStatsMap)
    .map((stat) => {
      const rateValue = stat.planned > 0 ? (stat.actual / stat.planned) * 100 : 0;
      return {
        ...stat,
        rate: Number(rateValue.toFixed(1)),
      };
    })
    .sort((left, right) => right.rate - left.rate);

  const weeklyTrend = Object.keys(weeklyTrendMap)
    .sort()
    .map((weekKey) => {
      const [year, month, day] = weekKey.split('-').map(Number);
      const weekStartDate = new Date(year, month - 1, day);
      const weekEndDate = getWeekEndDate(weekStartDate);

      return {
        weekStart: weekKey,
        weekLabel: `${weekKey} ~ ${toDateKey(weekEndDate)}`,
        timestamp: weekStartDate.getTime(),
        count: weeklyTrendMap[weekKey],
      };
    });

  const monthTicks = Array.from(new Set(weeklyTrend.map((item) => item.weekStart.slice(0, 7))))
    .map((monthKey) => {
      const [year, month] = monthKey.split('-').map(Number);
      return new Date(year, month - 1, 1).getTime();
    })
    .sort((left, right) => left - right);

  const totalRate = totalPlanned > 0 ? Number(((totalActual / totalPlanned) * 100).toFixed(1)) : 0;
  const latestReportDate = validDatedRows.length > 0
    ? validDatedRows[validDatedRows.length - 1].reportDate
    : null;
  const currentPlanRate = latestReportDate
    ? getInterpolatedPlanRate(latestReportDate, planProgressAnchors)
    : 0;
  const isOnSchedule = totalRate >= currentPlanRate;

  const timelineDates = [
    planProgressAnchors[0].dateObj,
    ...planProgressAnchors.slice(1).map((anchor) => anchor.dateObj),
  ];

  if (latestReportDate && !timelineDates.some((dateObj) => isSameDate(dateObj, latestReportDate))) {
    timelineDates.push(latestReportDate);
  }

  timelineDates.sort((left, right) => left.getTime() - right.getTime());

  let cumulativeActualCount = 0;
  let actualIndex = 0;

  const progressTimeline = timelineDates.map((dateObj) => {
    const checkpointTime = dateObj.getTime();

    while (
      actualIndex < validDatedRows.length &&
      validDatedRows[actualIndex].reportDate.getTime() <= checkpointTime
    ) {
      cumulativeActualCount += 1;
      actualIndex += 1;
    }

    const actualRateValue = totalPlanned > 0 ? (cumulativeActualCount / totalPlanned) * 100 : 0;
    const shouldShowActualRate = !latestReportDate || checkpointTime <= latestReportDate.getTime();

    return {
      date: toDateKey(dateObj),
      timestamp: checkpointTime,
      planRate: getInterpolatedPlanRate(dateObj, planProgressAnchors),
      actualRate: shouldShowActualRate ? Number(actualRateValue.toFixed(1)) : null,
    };
  });

  const progressTicks = progressTimeline
    .filter((item) => item.planRate > 0 || item.actualRate > 0 || item.timestamp === latestReportDate?.getTime())
    .map((item) => item.timestamp);

  return {
    totalPlanned,
    totalActual,
    totalRate,
    branchStats,
    weeklyTrend,
    monthTicks,
    progressTimeline,
    progressTicks,
    progressAsOf: latestReportDate ? toDateKey(latestReportDate) : '暂无有效上报日期',
    isOnSchedule,
    unmatchedActualCount,
    unmatchedBranches: Array.from(unmatchedBranches).sort(),
  };
};
