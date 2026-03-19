import { useEffect, useMemo, useState } from 'react';
import { Building2, CheckCircle, Download, Percent, Target, Upload } from 'lucide-react';
import BranchDistributionChart from './components/charts/BranchDistributionChart';
import BranchPerformanceChart from './components/charts/BranchPerformanceChart';
import ProgressTimelineChart from './components/charts/ProgressTimelineChart';
import WeeklyTrendChart from './components/charts/WeeklyTrendChart';
import StatCard from './components/StatCard';
import StatusNotice from './components/StatusNotice';
import {
  buildDashboardTitle,
  buildTrendTitle,
  DASHBOARD_SUBTITLE,
  DATA_SOURCES,
  EXPORT_ROOT_ID,
  PLAN_PROGRESS_MILESTONES,
  STORAGE_KEYS,
} from './config/dashboard';
import { defaultDateData, defaultPlanData } from './data/defaultData';
import { parseDateCsvText, parsePlanCsvText } from './utils/csv';
import { resolveDashboardYear } from './utils/date';
import { buildDashboardData } from './utils/dashboardData';
import { downloadElementAsPng, downloadElementAsSvg, waitForNextPaint } from './utils/export';
import { loadStoredArray, persistArray } from './utils/storage';

const FILE_LABELS = {
  plan: 'Plan.csv',
  date: 'Date.csv',
};

const PARSERS = {
  plan: parsePlanCsvText,
  date: parseDateCsvText,
};

const SOURCE_LABELS = {
  [DATA_SOURCES.DEMO]: '演示数据',
  [DATA_SOURCES.STORED]: '浏览器已保存',
  [DATA_SOURCES.UPLOADED]: '本次导入',
};

const buildSourceHint = (planSource, dateSource) => {
  if (planSource === DATA_SOURCES.DEMO || dateSource === DATA_SOURCES.DEMO) {
    return '未导入的部分仍显示演示数据；只有导入后的数据才会写入当前浏览器。';
  }

  if (planSource === DATA_SOURCES.STORED || dateSource === DATA_SOURCES.STORED) {
    return '当前展示的是浏览器中恢复的上次导入数据。';
  }

  return '当前展示的是本次导入的数据。';
};

export default function App() {
  const [planState, setPlanState] = useState(() => loadStoredArray(STORAGE_KEYS.planData, defaultPlanData));
  const [dateState, setDateState] = useState(() => loadStoredArray(STORAGE_KEYS.dateData, defaultDateData));
  const [uploadingType, setUploadingType] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    if (planState.source === DATA_SOURCES.DEMO) return;
    persistArray(STORAGE_KEYS.planData, planState.data);
  }, [planState.data, planState.source]);

  useEffect(() => {
    if (dateState.source === DATA_SOURCES.DEMO) return;
    persistArray(STORAGE_KEYS.dateData, dateState.data);
  }, [dateState.data, dateState.source]);

  const dashboardYear = useMemo(() => resolveDashboardYear(dateState.data), [dateState.data]);

  const dashboardData = useMemo(
    () => buildDashboardData({
      planData: planState.data,
      dateData: dateState.data,
      dashboardYear,
      planProgressMilestones: PLAN_PROGRESS_MILESTONES,
    }),
    [dateState.data, dashboardYear, planState.data],
  );

  const {
    totalPlanned,
    totalActual,
    totalRate,
    branchStats,
    weeklyTrend,
    monthTicks,
    progressTimeline,
    progressTicks,
    progressAsOf,
    isOnSchedule,
    unmatchedActualCount,
    unmatchedBranches,
  } = dashboardData;

  const totalRateColorClass = isOnSchedule ? 'text-emerald-600' : 'text-rose-600';
  const shouldAnimateCharts = !isExporting;
  const isBusy = isExporting || uploadingType !== null;

  const handleExport = async (format) => {
    const exporters = {
      png: downloadElementAsPng,
      svg: downloadElementAsSvg,
    };

    try {
      setNotice(null);
      setIsExporting(true);
      await waitForNextPaint();

      const element = document.getElementById(EXPORT_ROOT_ID);
      if (!element) {
        throw new Error('未找到可导出的仪表盘区域。');
      }

      const stamp = new Date().toISOString().slice(0, 10);
      await exporters[format]({
        element,
        fileName: `威海分行授信上报仪表盘_${stamp}.${format}`,
      });
    } catch (error) {
      console.error(`${format.toUpperCase()} 导出失败:`, error);
      setNotice({
        tone: 'error',
        title: `${format.toUpperCase()} 导出失败`,
        message: error?.message ?? '导出时出现异常，请稍后重试。',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileUpload = (event, type) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;

    input.value = '';
    setUploadingType(type);
    setNotice(null);

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const text = typeof loadEvent.target?.result === 'string' ? loadEvent.target.result : '';
      const result = PARSERS[type](text);

      if (!result.ok) {
        setNotice({
          tone: 'error',
          title: `${FILE_LABELS[type]} 导入失败`,
          message: result.message,
        });
        setUploadingType(null);
        return;
      }

      const nextState = {
        data: result.data,
        source: DATA_SOURCES.UPLOADED,
      };

      if (type === 'plan') {
        setPlanState(nextState);
      } else {
        setDateState(nextState);
      }

      const hasWarnings = result.summary.invalidRows > 0 || result.summary.ignoredRows > 0;
      setNotice({
        tone: hasWarnings ? 'warning' : 'success',
        title: `${FILE_LABELS[type]} 导入成功`,
        message: result.message,
      });
      setUploadingType(null);
    };

    reader.onerror = () => {
      setNotice({
        tone: 'error',
        title: `${FILE_LABELS[type]} 导入失败`,
        message: '文件读取失败，请确认文件未被占用后重试。',
      });
      setUploadingType(null);
    };

    reader.readAsText(file, 'utf-8');
  };

  const sourceHint = buildSourceHint(planState.source, dateState.source);

  return (
    <div id={EXPORT_ROOT_ID} className="min-h-screen bg-slate-50 p-4 font-sans text-slate-800 md:p-8">
      <div className="mx-auto mb-8 flex max-w-7xl flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 md:text-3xl">
            <Building2 className="h-8 w-8 text-blue-600" />
            {buildDashboardTitle(dashboardYear)}
          </h1>
          <p className="mt-1 text-slate-500">{DASHBOARD_SUBTITLE}</p>
          <div className="no-export mt-3 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-600">
            <span className="rounded-full bg-white px-3 py-1 shadow-sm ring-1 ring-slate-200">
              计划数据：{SOURCE_LABELS[planState.source]}
            </span>
            <span className="rounded-full bg-white px-3 py-1 shadow-sm ring-1 ring-slate-200">
              上报数据：{SOURCE_LABELS[dateState.source]}
            </span>
            <span className="text-slate-500">{sourceHint}</span>
          </div>
        </div>

        <div className="no-export flex flex-col gap-3 sm:flex-row">
          <div className="flex rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm">
            <button
              type="button"
              onClick={() => handleExport('png')}
              disabled={isBusy}
              className="flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              title="下载为 PNG 图片"
            >
              <Download size={16} />
              {isExporting ? '处理中' : 'PNG'}
            </button>
            <div className="mx-1 my-1 w-px bg-slate-200" />
            <button
              type="button"
              onClick={() => handleExport('svg')}
              disabled={isBusy}
              className="flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              title="下载为 SVG 文件"
            >
              <Download size={16} />
              {isExporting ? '处理中' : 'SVG'}
            </button>
          </div>

          <div className="flex gap-2 rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm">
            {['plan', 'date'].map((type) => {
              const isUploadingCurrent = uploadingType === type;
              const isPlan = type === 'plan';

              return (
                <div key={type} className="relative">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(event) => handleFileUpload(event, type)}
                    disabled={isBusy}
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    disabled={isBusy}
                    className={`flex w-full items-center justify-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                      isPlan
                        ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                        : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                    }`}
                  >
                    <Upload size={16} />
                    {isUploadingCurrent ? '导入中' : FILE_LABELS[type]}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-6">
        {notice ? (
          <StatusNotice
            tone={notice.tone}
            title={notice.title}
            message={notice.message}
            className="no-export"
          />
        ) : null}

        {unmatchedActualCount > 0 ? (
          <StatusNotice
            tone="warning"
            title="存在未匹配的机构名称"
            message={`有 ${unmatchedActualCount} 条上报记录未计入机构完成统计：${unmatchedBranches.join('、')}。请检查 Plan.csv 与 Date.csv 中的机构名称是否一致。`}
            className="no-export"
          />
        ) : null}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <StatCard
            icon={Target}
            iconContainerClassName="bg-blue-100"
            iconClassName="text-blue-600"
            label="全年应上报总户数"
            value={totalPlanned}
          />
          <StatCard
            icon={CheckCircle}
            iconContainerClassName="bg-emerald-100"
            iconClassName="text-emerald-600"
            label="已实际上报户数"
            value={totalActual}
          />
          <StatCard
            icon={Percent}
            iconContainerClassName="bg-amber-100"
            iconClassName="text-amber-600"
            label="整体完成进度"
            value={`${totalRate}%`}
            valueClassName={totalRateColorClass}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <BranchPerformanceChart branchStats={branchStats} shouldAnimateCharts={shouldAnimateCharts} />
          <BranchDistributionChart branchStats={branchStats} shouldAnimateCharts={shouldAnimateCharts} />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <WeeklyTrendChart
            monthTicks={monthTicks}
            shouldAnimateCharts={shouldAnimateCharts}
            title={buildTrendTitle(dashboardYear)}
            weeklyTrend={weeklyTrend}
          />
          <ProgressTimelineChart
            progressAsOf={progressAsOf}
            progressTicks={progressTicks}
            progressTimeline={progressTimeline}
            shouldAnimateCharts={shouldAnimateCharts}
          />
        </div>
      </div>
    </div>
  );
}
