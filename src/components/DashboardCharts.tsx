/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { QualityReport, DefectType, SeverityType } from "../types";
import { AlertCircle, PieChart, BarChart2, TrendingUp } from "lucide-react";
import { TRANSLATIONS, LanguageType } from "../translations";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";

interface DashboardChartsProps {
  reports: QualityReport[];
  defectTypes: DefectType[];
  allReports?: QualityReport[];
  selectedDate?: string;
}

export default function DashboardCharts({ reports, defectTypes, allReports, selectedDate }: DashboardChartsProps) {
  // Read current language setting on-the-fly
  const currentLang = (localStorage.getItem("iqc_lang") || "vi") as LanguageType;
  const t = TRANSLATIONS[currentLang];

  // Aggregate data helpers
  const totalInspected = reports.reduce((sum, r) => sum + r.inspectedQty, 0);
  const totalDefects = reports.reduce((sum, r) => sum + r.defectQty, 0);
  const averageRate = totalInspected > 0 ? (totalDefects / totalInspected) * 100 : 0;

  // Helper translations for structural categories
  const getDeptTranslation = (deptKey: string) => {
    switch (deptKey) {
      case "Kho": return t.deptWarehouse;
      case "Sơ chế": return t.deptPrep;
      case "Tinh chế": return t.deptRefine;
      case "Lắp ráp": return t.deptAssembly;
      case "Sơn": return t.deptPaint;
      case "Đóng gói": return t.deptPackaging;
      case "Lên Cont": return t.deptLoading;
      default: return deptKey;
    }
  };

  const getSeverityTranslation = (severityKey: string) => {
    switch (severityKey) {
      case "Nặng": return t.severityMajor;
      case "Vừa": return t.severityMedium;
      case "Nhẹ": return t.severityMinor;
      case "Chấp nhận": return t.severityAcceptable;
      default: return severityKey;
    }
  };

  // 1. Defect counts by Department
  const depts: Record<string, { defects: number; inspected: number }> = {
    "Kho": { defects: 0, inspected: 0 },
    "Sơ chế": { defects: 0, inspected: 0 },
    "Tinh chế": { defects: 0, inspected: 0 },
    "Lắp ráp": { defects: 0, inspected: 0 },
    "Sơn": { defects: 0, inspected: 0 },
    "Đóng gói": { defects: 0, inspected: 0 },
    "Lên Cont": { defects: 0, inspected: 0 },
  };

  reports.forEach((r) => {
    if (r.department && depts[r.department] !== undefined) {
      depts[r.department].defects += r.defectQty;
      depts[r.department].inspected += r.inspectedQty;
    }
  });

  const deptData = Object.entries(depts).map(([name, data]) => ({
    name,
    translatedName: getDeptTranslation(name),
    defects: data.defects,
    inspected: data.inspected,
    rate: data.inspected > 0 ? (data.defects / data.inspected) * 100 : 0,
  }));

  const maxDeptDefects = Math.max(...deptData.map((d) => d.defects), 1);

  // 2. Lỗi phổ biến nhất theo loại lỗi
  const errorTypeMap: Record<string, number> = {};
  reports.forEach((r) => {
    errorTypeMap[r.defectId] = (errorTypeMap[r.defectId] || 0) + r.defectQty;
  });

  const defectTypeData = defectTypes.map((dt) => {
    const qty = errorTypeMap[dt.id] || 0;
    return {
      name: dt.name,
      description: dt.description,
      qty,
    };
  }).sort((a, b) => b.qty - a.qty);

  const maxDefectTypeQty = Math.max(...defectTypeData.map((d) => d.qty), 1);

  // 3. Phân bố lỗi theo mức độ
  const severityCounts: Record<SeverityType, number> = {
    "Nặng": 0,
    "Vừa": 0,
    "Nhẹ": 0,
    "Chấp nhận": 0,
  };

  reports.forEach((r) => {
    if (r.severity in severityCounts) {
      severityCounts[r.severity] += r.defectQty;
    }
  });

  const severityData = Object.entries(severityCounts).map(([label, qty]) => {
    let color = "#3b82f6"; // default blue
    let bg = "bg-blue-500";
    if (label === "Nặng") {
      color = "#ef4444";
      bg = "bg-red-500";
    } else if (label === "Vừa") {
      color = "#f97316";
      bg = "bg-orange-500";
    } else if (label === "Nhẹ") {
      color = "#eab308";
      bg = "bg-yellow-500";
    } else if (label === "Chấp nhận") {
      color = "#22c55e";
      bg = "bg-green-500";
    }
    return {
      label,
      translatedLabel: getSeverityTranslation(label),
      qty,
      color,
      bg,
    };
  });

  const totalSeverityQty = Object.values(severityCounts).reduce((sum, q) => sum + q, 0);

  // Compute donut parts
  let accumulatedPercent = 0;
  const donutPaths = severityData.map((item) => {
    const rawPct = totalSeverityQty > 0 ? item.qty / totalSeverityQty : 0;
    const startPercent = accumulatedPercent;
    accumulatedPercent += rawPct;
    const endPercent = accumulatedPercent;

    if (rawPct === 0) return null;

    // Convert percent to coordinates
    const getCoordinatesForPercent = (percent: number) => {
      const x = Math.cos(2 * Math.PI * percent - Math.PI / 2);
      const y = Math.sin(2 * Math.PI * percent - Math.PI / 2);
      return [x, y];
    };

    const [startX, startY] = getCoordinatesForPercent(startPercent);
    const [endX, endY] = getCoordinatesForPercent(endPercent);

    const largeArcFlag = rawPct > 0.5 ? 1 : 0;

    // Radius which fits nicely in 100x100
    const r = 36;
    const d = [
      `M ${50 + r * startX} ${50 + r * startY}`,
      `A ${r} ${r} 0 ${largeArcFlag} 1 ${50 + r * endX} ${50 + r * endY}`,
    ].join(" ");

    return {
      d,
      color: item.color,
      label: item.label,
      translatedLabel: item.translatedLabel,
      percentage: (rawPct * 100).toFixed(1) + "%",
      qty: item.qty,
    };
  }).filter(Boolean);

  // 4. Trend lines - Last 7 Days
  const getLast7Days = (endDateStr: string) => {
    const dates = [];
    const parts = (endDateStr || "").split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      
      for (let i = 6; i >= 0; i--) {
        const d = new Date(year, month, day);
        d.setDate(d.getDate() - i);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        dates.push(`${yyyy}-${mm}-${dd}`);
      }
    } else {
      const endDate = new Date();
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(endDate.getDate() - i);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        dates.push(`${yyyy}-${mm}-${dd}`);
      }
    }
    return dates;
  };

  // Resolve base date or use fallback
  const baseDate = selectedDate || (reports.length > 0 ? reports[0].date : new Date().toISOString().split("T")[0]);
  const daysRange = getLast7Days(baseDate);

  // Fallback to reports if allReports is not provided
  const sourceReports = allReports || reports;

  const trendData = daysRange.map((dayStr) => {
    const dayReports = sourceReports.filter((r) => r.date === dayStr);
    const totalDefectsOnDay = dayReports.reduce((sum, r) => sum + r.defectQty, 0);
    const totalInspectedOnDay = dayReports.reduce((sum, r) => sum + r.inspectedQty, 0);
    const rateOnDay = totalInspectedOnDay > 0 ? (totalDefectsOnDay / totalInspectedOnDay) * 100 : 0;

    let displayLabel = dayStr;
    const match = dayStr.match(/\d{4}-(\d{2})-(\d{2})/);
    if (match) {
      displayLabel = `${match[2]}/${match[1]}`;
    }

    return {
      date: dayStr,
      label: displayLabel,
      defects: totalDefectsOnDay,
      rate: parseFloat(rateOnDay.toFixed(2)),
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      let formattedLabel = label;
      try {
        const parts = label.split("/");
        if (parts.length === 2) {
          formattedLabel = currentLang === "vi" 
            ? `Ngày ${parts[0]} Thg ${parts[1]}` 
            : currentLang === "en" 
              ? `Date: ${parts[0]}/${parts[1]}` 
              : `${parts[1]}月${parts[0]}日`;
        }
      } catch (_) {}

      return (
        <div className="bg-white dark:bg-slate-900 px-3 py-2 border border-slate-150 dark:border-slate-800 rounded-xl shadow-lg font-sans text-xs">
          <p className="font-mono font-bold text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-850 pb-1 mb-1.5">
            {formattedLabel}
          </p>
          <p className="font-semibold text-rose-500 dark:text-rose-400 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
            <span>
              {currentLang === "vi" ? "Sản lượng lỗi" : currentLang === "en" ? "Total Defects" : "缺陷件数"}:{" "}
              <strong className="font-mono text-slate-800 dark:text-slate-100 text-[13px] ml-1">{payload[0].value}</strong>
            </span>
          </p>
          {payload[1] && (
            <p className="font-semibold text-indigo-500 dark:text-indigo-400 flex items-center gap-1.5 mt-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block"></span>
              <span>
                {currentLang === "vi" ? "Tỷ lệ lỗi" : currentLang === "en" ? "Defect Rate" : "不良率"}:{" "}
                <strong className="font-mono text-slate-800 dark:text-slate-100 text-[13px] ml-1">{payload[1].value}%</strong>
              </span>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div id="analytics-section" className="space-y-6">
      {/* Overview stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t.statInspectedToday}</span>
            <h2 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
              {totalInspected.toLocaleString("vi-VN")}
            </h2>
            <p className="text-xs text-slate-500">{t.statInspectedDesc}</p>
          </div>
          <div className="p-3 bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl">
            <BarChart2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">{t.statDefectsQty}</span>
            <h2 className="text-3xl font-extrabold text-rose-600 dark:text-rose-400 tracking-tight">
              {totalDefects.toLocaleString("vi-VN")}
            </h2>
            <p className="text-xs text-rose-500/80">{t.statDefectsDesc}</p>
          </div>
          <div className="p-3 bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">{t.statAvgRate}</span>
            <h2 className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
              {averageRate.toFixed(2)}%
            </h2>
            <p className="text-xs text-emerald-500/80">{t.statAvgRateDesc}</p>
          </div>
          <div className="p-3 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Grid of charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart A: Lỗi theo Bộ Phận */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 p-2 rounded-lg">
              <BarChart2 className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm tracking-tight">
              {t.chartDeptDistribution}
            </h3>
          </div>

          <div className="space-y-4">
            {deptData.map((d) => {
              const pctOfMax = (d.defects / maxDeptDefects) * 100;
              return (
                <div key={d.name} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-300">
                    <span>{d.translatedName}</span>
                    <span className="space-x-1">
                      <strong className="text-slate-800 dark:text-slate-100">{d.defects} {currentLang === "vi" ? "lỗi" : currentLang === "en" ? "defects" : "缺陷/故障"}</strong>
                      <span className="text-slate-400">({d.rate.toFixed(1)}% {currentLang === "vi" ? "tỉ lệ lỗi" : currentLang === "en" ? "defect rate" : "不良率"})</span>
                    </span>
                  </div>
                  {/* Bar */}
                  <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                    <div
                      className="bg-indigo-500 transition-all duration-500 rounded-full"
                      style={{ width: `${Math.max(pctOfMax, d.defects > 0 ? 3 : 0)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart B: Phân phối theo Mức Độ Lỗi */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4 flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 p-2 rounded-lg">
                <PieChart className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm tracking-tight">
                {t.chartSeverityDistribution}
              </h3>
            </div>

            <div className="space-y-2">
              {severityData.map((s) => {
                const percentage = totalSeverityQty > 0 ? (s.qty / totalSeverityQty) * 100 : 0;
                return (
                  <div key={s.label} className="flex items-center gap-3">
                    <span className={`w-3 h-3 rounded-full ${s.bg}`}></span>
                    <div className="flex-1 flex justify-between text-xs text-slate-600 dark:text-slate-300">
                      <span className="font-semibold">{s.translatedLabel}</span>
                      <span className="font-mono text-slate-500">
                        {s.qty} {currentLang === "vi" ? "lỗi" : currentLang === "en" ? "defects" : "缺陷/故障"} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Render circular donut SVG directly */}
          <div className="flex justify-center items-center p-3 relative w-36 h-36 mx-auto">
            {totalSeverityQty > 0 ? (
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {donutPaths.map((path, idx) => (
                  path && (
                    <path
                      key={idx}
                      d={path.d}
                      fill="transparent"
                      stroke={path.color}
                      strokeWidth="15"
                      strokeLinecap="round"
                    />
                  )
                ))}
              </svg>
            ) : (
              <div className="w-28 h-28 border border-dashed border-slate-200 dark:border-slate-800 rounded-full flex flex-col items-center justify-center text-[10px] text-slate-400 text-center">
                <span>{t.noData}</span>
              </div>
            )}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-xl font-black text-slate-800 dark:text-slate-100">
                {totalSeverityQty}
              </span>
              <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none font-bold">
                {t.totalDefectsShort}
              </span>
            </div>
          </div>
        </div>

        {/* Chart C: Xu hướng lỗi 7 ngày */}
        <div id="chart-defect-trend-7d" className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 p-2 rounded-lg">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm tracking-tight">
                {currentLang === "vi" 
                  ? "Xu Hướng Lỗi Trong 7 Ngày Gần Nhất" 
                  : currentLang === "en" 
                    ? "7-Day Defect Trend Analysis" 
                    : "过去7天缺陷趋势追踪图"}
              </h3>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-6">
              {currentLang === "vi"
                ? `Theo dõi tổng số lượng mẫu khuyết tật và tỷ lệ lỗi từ ${daysRange[0]} đến ${daysRange[6]}`
                : currentLang === "en"
                  ? `Track cumulative defects & incident rate from ${daysRange[0]} to ${daysRange[6]}`
                  : `监测自 ${daysRange[0]} 至 ${daysRange[6]} 的缺陷件数与不良率变动趋势`}
            </p>
          </div>

          <div className="h-60 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                <XAxis 
                  dataKey="label" 
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  stroke="#94a3b8"
                  strokeOpacity={0.2}
                />
                <YAxis 
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  stroke="#94a3b8"
                  strokeOpacity={0.2}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="defects" 
                  name={currentLang === "vi" ? "Số lượng lỗi" : currentLang === "en" ? "Total Defects" : "缺陷件数"}
                  stroke="#f43f5e" 
                  strokeWidth={3} 
                  dot={{ r: 4, strokeWidth: 1, fill: "#f43f5e" }} 
                  activeDot={{ r: 6, strokeWidth: 2 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="rate" 
                  name={currentLang === "vi" ? "Tỷ lệ lỗi (%)" : currentLang === "en" ? "Defect Rate (%)" : "不良率 (%)"}
                  stroke="#6366f1" 
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={{ r: 3, strokeWidth: 1, fill: "#6366f1" }} 
                  activeDot={{ r: 5, strokeWidth: 1 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart D: Bảng Lỗi Phổ Biến Nhất */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 p-2 rounded-lg">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm tracking-tight">
                  {t.chartTopDefects}
                </h3>
                <p className="text-xs text-slate-400">{t.chartTopDefectsDesc}</p>
              </div>
            </div>

            <div className="space-y-4">
              {defectTypeData.slice(0, 5).map((d, index) => {
                const pct = d.qty > 0 ? (d.qty / maxDefectTypeQty) * 100 : 0;
                return (
                  <div key={d.name} className="flex items-center gap-4">
                    <span className="w-6 text-sm font-extrabold text-slate-400 text-center">#{index + 1}</span>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-700 dark:text-slate-200 text-left">{d.name}</span>
                        <span className="font-bold text-rose-500">{d.qty} {currentLang === "vi" ? "lỗi" : currentLang === "en" ? "defects" : "缺陷/故障"}</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="bg-rose-500 transition-all duration-500 rounded-full"
                          style={{ width: `${Math.max(pct, d.qty > 0 ? 2 : 0)}%` }}
                        ></div>
                      </div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-snug">{d.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
