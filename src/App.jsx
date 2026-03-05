import React, { useState, useMemo, useEffect } from 'react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import {
  Upload, CheckCircle, Target, Percent, TrendingUp, Building2, Calendar, FileSpreadsheet, Download, BarChart2
} from 'lucide-react';

// --- 初始演示数据（基于用户提供的片段） ---
const defaultPlanData = [
  { '机构名称': '乳山', '应上报授信户数': '11' },
  { '机构名称': '经开', '应上报授信户数': '19' },
  { '机构名称': '文登', '应上报授信户数': '22' },
  { '机构名称': '环翠', '应上报授信户数': '32' },
  { '机构名称': '营业部', '应上报授信户数': '30' },
  { '机构名称': '荣成', '应上报授信户数': '42' },
];

const defaultDateData = [
  { '机构名称': '乳山', '客户名称': 'OMEXELL(济南)传热技术有限公司', '上报日期': '2026-09-06' },
  { '机构名称': '荣成', '客户名称': '一百分信息技术有限公司', '上报日期': '2026-06-12' },
  { '机构名称': '文登', '客户名称': '万旭宏业集团有限公司', '上报日期': '2026-07-11' },
  { '机构名称': '荣成', '客户名称': '万服技术服务(山东)有限公司', '上报日期': '2026-06-03' },
  { '机构名称': '环翠', '客户名称': '万纳联数字科技(山东)有限公司', '上报日期': '2026-03-03' },
  { '机构名称': '乳山', '客户名称': '三千国信(山东)智能科技有限公司', '上报日期': '2026-09-01' },
  { '机构名称': '营业部', '客户名称': '三土电子(山东)有限公司', '上报日期': '2026-07-28' },
  { '机构名称': '荣成', '客户名称': '三智胜祥集团有限公司', '上报日期': '2026-05-07' },
  { '机构名称': '经开', '客户名称': '三株福尔制药有限公司', '上报日期': '2026-04-10' },
  { '机构名称': '经开', '客户名称': '三泽(山东)电气技术有限公司', '上报日期': '2026-08-19' },
  { '机构名称': '荣成', '客户名称': '三科智能(山东)集团有限公司', '上报日期': '2026-08-30' },
  { '机构名称': '经开', '客户名称': '三维医疗科技有限公司', '上报日期': '2026-06-15' },
  { '机构名称': '荣成', '客户名称': '世方信息技术集团有限公司', '上报日期': '2026-05-13' },
  { '机构名称': '乳山', '客户名称': '世纪开元智印互联科技集团股份有限公司', '上报日期': '2026-04-08' },
  { '机构名称': '营业部', '客户名称': '中科振知医疗器械(济南)有限公司', '上报日期': '2026-03-27' },
  { '机构名称': '营业部', '客户名称': '中科政通(山东)科技有限公司', '上报日期': '2026-05-15' },
  { '机构名称': '营业部', '客户名称': '中科晟通(山东)信息技术有限公司', '上报日期': '2026-03-02' },
  { '机构名称': '环翠', '客户名称': '中科智能机器人(山东)有限公司', '上报日期': '2026-07-10' },
  { '机构名称': '营业部', '客户名称': '中科检测技术(山东)有限公司', '上报日期': '2026-05-16' },
  { '机构名称': '乳山', '客户名称': '中科正源(山东)光电科技有限公司', '上报日期': '2026-06-29' },
  { '机构名称': '荣成', '客户名称': '中科泰医(山东)医疗科技有限公司', '上报日期': '2026-05-28' },
  { '机构名称': '乳山', '客户名称': '中科爱建(山东)科技有限公司', '上报日期': '2026-04-02' },
  { '机构名称': '经开', '客户名称': '中科特肯(山东)智能科技有限公司', '上报日期': '2026-03-27' },
  { '机构名称': '经开', '客户名称': '中科瑞城(济南)信息技术有限公司', '上报日期': '2026-05-01' },
  { '机构名称': '经开', '客户名称': '中科瑞能(山东)科技有限公司', '上报日期': '2026-03-02' },
  { '机构名称': '文登', '客户名称': '中科软(山东)软件技术有限公司', '上报日期': '2026-08-06' },
  { '机构名称': '文登', '客户名称': '中科金勃信(山东)科技有限公司', '上报日期': '2026-07-05' },
  { '机构名称': '文登', '客户名称': '中科锐达(山东)信息技术有限公司', '上报日期': '2026-06-13' },
  { '机构名称': '营业部', '客户名称': '中科长洋(山东)科技有限公司', '上报日期': '2026-04-20' },
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316'];
const STORAGE_KEYS = {
  planData: 'weihai-dashboard.planData',
  dateData: 'weihai-dashboard.dateData'
};

const loadPersistedArray = (key, fallback) => {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
};

// 升级版 CSV 解析器：完美处理带引号和内部标点的复杂字段
const parseCSV = (csvText) => {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
  if (lines.length === 0) return [];

  // 解析单行 CSV 的辅助函数，处理引号内的逗号
  const parseLine = (line) => {
    const values = [];
    let inQuotes = false;
    let currentValue = '';
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(currentValue);
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    values.push(currentValue);
    return values;
  };

  const headers = parseLine(lines[0]).map(h => h.trim().replace(/^"|"$/g, ''));

  return lines.slice(1).map(line => {
    const values = parseLine(line);
    let obj = {};
    headers.forEach((header, index) => {
      let val = values[index] ? values[index].trim() : '';
      // 去除字段首尾的引号
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.substring(1, val.length - 1);
      }
      obj[header] = val;
    });
    return obj;
  });
};

export default function App() {
  const [planData, setPlanData] = useState(() => loadPersistedArray(STORAGE_KEYS.planData, defaultPlanData));
  const [dateData, setDateData] = useState(() => loadPersistedArray(STORAGE_KEYS.dateData, defaultDateData));
  const [isUploading, setIsUploading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.planData, JSON.stringify(planData));
  }, [planData]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.dateData, JSON.stringify(dateData));
  }, [dateData]);

  // 动态加载外部脚本用于导出
  const loadScript = (src) => {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = src;
      script.crossOrigin = 'anonymous';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  // 导出为 PNG
  const exportToPNG = async () => {
    try {
      setIsExporting(true);
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');

      const element = document.getElementById('dashboard-export-area');
      const canvas = await window.html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#f8fafc', // 对应背景色 bg-slate-50
        ignoreElements: (el) => el.classList.contains('no-export') // 忽略操作按钮
      });

      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `威海分行授信上报仪表盘_${new Date().toISOString().slice(0,10)}.png`;
      link.href = imgData;
      link.click();
    } catch (error) {
      console.error('导出PNG失败:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // 导出为 PDF
  const exportToPDF = async () => {
    try {
      setIsExporting(true);
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');

      const element = document.getElementById('dashboard-export-area');
      const canvas = await window.html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#f8fafc',
        ignoreElements: (el) => el.classList.contains('no-export')
      });

      const imgData = canvas.toDataURL('image/png');
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF('p', 'mm', 'a4');

      // 按照A4纸比例缩放图片
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`威海分行授信上报仪表盘_${new Date().toISOString().slice(0,10)}.pdf`);
    } catch (error) {
      console.error('导出PDF失败:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // 处理文件上传
  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const parsed = parseCSV(text);
      if (type === 'plan') {
        setPlanData(parsed);
      } else {
        setDateData(parsed);
      }
      setIsUploading(false);
    };
    reader.readAsText(file);
  };

  // 数据计算逻辑
  const dashboardData = useMemo(() => {
    // 1. 基础统计
    let totalPlanned = 0;
    const branchStatsMap = {};

    planData.forEach(row => {
      const branch = row['机构名称'];
      const planned = parseInt(row['应上报授信户数'] || 0, 10);
      if (branch) {
        totalPlanned += planned;
        branchStatsMap[branch] = { branch, planned, actual: 0, rate: 0 };
      }
    });

    // 2. 实际上报统计
    let totalActual = 0;
    const monthlyTrendMap = {};

    // 过滤掉没有日期的脏数据
    const validDateData = dateData.filter(d => d['上报日期'] && d['上报日期'].trim() !== '');

    // 按日期排序用于明细表
    const sortedDateData = [...validDateData].sort((a, b) => new Date(b['上报日期']) - new Date(a['上报日期']));

    validDateData.forEach(row => {
      const branch = row['机构名称'];
      const dateStr = row['上报日期'];

      if (branch && branchStatsMap[branch]) {
        branchStatsMap[branch].actual += 1;
        totalActual += 1;
      }

      // 月度趋势（只统计存在的月份）
      if (dateStr) {
        let monthStr = null;
        // 提取月份，兼容 YYYY-MM-DD 或 YYYY/M/D 等各种带或不带0的格式
        const match = dateStr.match(/\d{4}[-/年](\d{1,2})/);
        if (match) {
          monthStr = match[1].padStart(2, '0'); // 统一补齐为两位数确保排序正确
        } else {
          // 兜底方案：使用原生 Date 解析（处理 MM/DD/YYYY 等其他异常格式）
          const d = new Date(dateStr);
          if (!isNaN(d.getTime())) {
            monthStr = String(d.getMonth() + 1).padStart(2, '0');
          }
        }

        if (monthStr) {
          monthlyTrendMap[monthStr] = (monthlyTrendMap[monthStr] || 0) + 1;
        }
      }
    });

    // 计算各机构完成率
    const branchStats = Object.values(branchStatsMap).map(stat => {
      const rateValue = stat.planned > 0 ? (stat.actual / stat.planned) * 100 : 0;
      return {
        ...stat,
        rate: Number(rateValue.toFixed(1))
      };
    }).sort((a, b) => b.rate - a.rate);

    // 月度趋势数据转换为数组并排序，格式化为 "X月"
    const monthlyTrend = Object.keys(monthlyTrendMap)
      .sort()
      .map(month => ({
        month: `${parseInt(month, 10)}月`,
        count: monthlyTrendMap[month]
      }));

    // 计算整体完成率
    const totalRate = totalPlanned > 0 ? ((totalActual / totalPlanned) * 100).toFixed(1) : 0;

    return {
      totalPlanned,
      totalActual,
      totalRate,
      branchStats,
      monthlyTrend,
      recentReports: sortedDateData
    };
  }, [planData, dateData]);

  const { totalPlanned, totalActual, totalRate, branchStats, monthlyTrend, recentReports } = dashboardData;

  // 渲染自定义 Tooltip 以显示百分比
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-lg">
          <p className="font-semibold text-slate-800 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value} {entry.name.includes('比例') || entry.name.includes('率') ? '%' : '户'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div id="dashboard-export-area" className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-800">

      {/* 头部区域 */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="text-blue-600 h-8 w-8" />
            威海分行法人客户2026年授信上报情况
          </h1>
          <p className="text-slate-500 mt-1">数据基于各支行授信上报流程统计</p>
        </div>

        {/* 操作面板区 (添加 no-export 类使其在导出时隐藏) */}
        <div className="flex flex-col sm:flex-row gap-3 no-export">

          {/* 下载控件 */}
          <div className="flex bg-white p-1.5 rounded-xl shadow-sm border border-slate-200">
            <button
              onClick={exportToPNG}
              disabled={isExporting}
              className="flex items-center justify-center gap-1.5 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              title="下载为 PNG 图片"
            >
              <Download size={16} />
              {isExporting ? '处理中' : 'PNG'}
            </button>
            <div className="w-px bg-slate-200 my-1 mx-1"></div>
            <button
              onClick={exportToPDF}
              disabled={isExporting}
              className="flex items-center justify-center gap-1.5 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              title="下载为 PDF 文档"
            >
              <Download size={16} />
              {isExporting ? '处理中' : 'PDF'}
            </button>
          </div>

          {/* 数据上传控件 */}
          <div className="flex gap-2 bg-white p-1.5 rounded-xl shadow-sm border border-slate-200">
            <div className="relative">
              <input
                type="file"
                accept=".csv"
                onChange={(e) => handleFileUpload(e, 'plan')}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <button className="flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors w-full">
                <Upload size={16} />
                Plan.csv
              </button>
            </div>
            <div className="relative">
              <input
                type="file"
                accept=".csv"
                onChange={(e) => handleFileUpload(e, 'date')}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <button className="flex items-center justify-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors w-full">
                <Upload size={16} />
                Date.csv
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">

        {/* KPI 卡片组 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <Target size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">全年应上报总户数</p>
              <h3 className="text-3xl font-bold text-slate-900">{totalPlanned}</h3>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">已实际上报户数</p>
              <h3 className="text-3xl font-bold text-slate-900">{totalActual}</h3>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
              <Percent size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">整体完成进度</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-bold text-slate-900">{totalRate}%</h3>
              </div>
            </div>
          </div>
        </div>

        {/* 主要图表区 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* 机构完成情况 - 柱状图 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <BarChart2 className="text-blue-500" size={20} />
                各机构完成情况对比
              </h3>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={branchStats} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="branch" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} tickFormatter={(val) => `${val}%`} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9' }} />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar yAxisId="left" dataKey="planned" name="应上报任务" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={32} />
                  <Bar yAxisId="left" dataKey="actual" name="实际上报数" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={32} />
                  <Line yAxisId="right" type="monotone" dataKey="rate" name="完成比例" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 机构占比 - 环形图 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-2">
              <Percent className="text-blue-500" size={20} />
              已上报机构分布占比
            </h3>
            {/* 增加 text-xs 类，将标签字号略微调小以适应边界 */}
            <div className="h-80 w-full mt-4 text-xs font-medium">
              <ResponsiveContainer width="100%" height="100%">
                {/* 加大左右侧的 margin 预留空间 */}
                <PieChart margin={{ top: 20, right: 40, bottom: 20, left: 40 }}>
                  <Pie
                    data={branchStats.filter(s => s.actual > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={78}
                    paddingAngle={3}
                    dataKey="actual"
                    nameKey="branch"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={true}
                  >
                    {branchStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 底部区：趋势与明细 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* 上报趋势 - 面积折线图 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
              <TrendingUp className="text-blue-500" size={20} />
              2026年上报数量趋势
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="count"
                    name="上报户数"
                    stroke="#10b981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorCount)"
                    dot={{ r: 4, fill: '#fff', stroke: '#10b981', strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 最新上报明细表 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col h-[350px]">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4 shrink-0">
              <FileSpreadsheet className="text-blue-500" size={20} />
              近期客户上报明细
            </h3>
            <div className="overflow-auto flex-1 rounded-lg border border-slate-200">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 bg-slate-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 font-medium">上报日期</th>
                    <th className="px-4 py-3 font-medium">机构名称</th>
                    <th className="px-4 py-3 font-medium">客户名称</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentReports.slice(0, 50).map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-slate-600 font-medium">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-slate-400"/>
                          {row['上报日期']}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-xs font-medium">
                          {row['机构名称']}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-800 truncate max-w-[150px]" title={row['客户名称']}>
                        {row['客户名称']}
                      </td>
                    </tr>
                  ))}
                  {recentReports.length === 0 && (
                    <tr>
                      <td colSpan="3" className="px-4 py-8 text-center text-slate-400">
                        暂无数据，请上传 date.csv
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
