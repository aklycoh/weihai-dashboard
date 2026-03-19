export const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316'];

export const STORAGE_KEYS = {
  planData: 'weihai-dashboard.planData',
  dateData: 'weihai-dashboard.dateData',
};

export const DATA_SOURCES = {
  DEMO: 'demo',
  STORED: 'stored',
  UPLOADED: 'uploaded',
};

export const EXPORT_ROOT_ID = 'dashboard-export-area';

export const REQUIRED_PLAN_COLUMNS = ['机构名称', '应上报授信户数'];
export const REQUIRED_DATE_COLUMNS = ['机构名称', '上报日期'];

// monthIndex 使用 0-11，对应当月月末计划节点。
export const PLAN_PROGRESS_MILESTONES = [
  { monthIndex: 2, rate: 10 },
  { monthIndex: 3, rate: 30 },
  { monthIndex: 4, rate: 50 },
  { monthIndex: 5, rate: 70 },
  { monthIndex: 6, rate: 85 },
  { monthIndex: 7, rate: 100 },
];

export const buildDashboardTitle = (year) => `威海分行法人客户${year}年授信上报情况`;
export const buildTrendTitle = (year) => `${year}年上报数量趋势`;
export const DASHBOARD_SUBTITLE = '数据基于各支行授信上报流程统计';
