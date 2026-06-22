/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from "react";
import { QualityReport, Staff, DefectType, SeverityType } from "../types";
import { Printer, X, FileText, CheckCircle2 } from "lucide-react";
import { TRANSLATIONS, LanguageType, TranslationDictionary } from "../translations";

interface PrintTemplatesProps {
  job: {
    type: "single" | "composite-summary" | "composite-by-person" | "org-chart";
    reportId?: string; // For single report
    date: string;
  } | null;
  onClose: () => void;
  reports: QualityReport[];
  staffList: Staff[];
  defectTypes: DefectType[];
}

export default function PrintTemplates({ job, onClose, reports, staffList, defectTypes }: PrintTemplatesProps) {
  useEffect(() => {
    if (job) {
      // Small timeout to let DOM render fully, then open browser print window
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [job]);

  if (!job) return null;

  // Language & Translation on-the-fly - COMBINED FOR PRINTING ALL THREE LANGUAGES
  const t = React.useMemo(() => {
    const combined: Record<string, string> = {};
    const keys = Object.keys(TRANSLATIONS.vi) as (keyof TranslationDictionary & string)[];
    for (const key of keys) {
      const vi = TRANSLATIONS.vi[key] || "";
      const zh = TRANSLATIONS.zh[key] || "";
      const en = TRANSLATIONS.en[key] || "";
      
      if (vi === zh && zh === en) {
        combined[key] = vi;
      } else {
        const uniq = Array.from(new Set([vi, zh, en].map(s => s.trim()).filter(Boolean)));
        combined[key] = uniq.join(" / ");
      }
    }
    return combined as unknown as TranslationDictionary;
  }, []);

  const getDeptTranslation = (deptKey: string) => {
    switch (deptKey) {
      case "Kho": return "Kho / 原材料仓 / Warehouse";
      case "Sơ chế": return "Sơ chế / 一次粗加工 / Preparation";
      case "Tinh chế": return "Tinh chế / 精细深加工 / Refining";
      case "Lắp ráp": return "Lắp ráp / 组装总装 / Assembly";
      case "Sơn": return "Sơn / 喷涂喷漆 / Painting";
      case "Đóng gói": return "Đóng gói / 成品包装 / Packaging";
      case "Lên Cont": return "Lên Cont / 集装箱出装 / Container Loading";
      default: return deptKey;
    }
  };

  const getRoleTranslation = (roleKey: string) => {
    switch (roleKey) {
      case "Director": return "Giám Đốc / 总监 / Director";
      case "Manager": return "Quản Lý / 经理 / Manager";
      case "QC Leader": return "Trưởng Ca / 组长 / QC Leader";
      case "QC Inline": return "Kiểm Trực / 巡检 / QC Inline";
      default: return roleKey;
    }
  };

  const getSeverityTranslation = (severityKey: string) => {
    switch (severityKey) {
      case "Nặng": return "Nặng / 严重 / Major";
      case "Vừa": return "Vừa / 中度 / Medium";
      case "Nhẹ": return "Nhẹ / 轻微 / Minor";
      case "Chấp nhận": return "Chấp nhận / 容许 / Acceptable";
      default: return severityKey;
    }
  };

  const getQCName = (id: string) => staffList.find((s) => s.id === id)?.name || "Unknown QC";
  const getQCDetails = (id: string) => staffList.find((s) => s.id === id);
  const getDefectName = (id: string) => defectTypes.find((d) => d.id === id)?.name || "Lỗi chưa phân loại";
  const getDefectDesc = (id: string) => defectTypes.find((d) => d.id === id)?.description || "";

  // Helper to format severity color
  const getSeverityBadge = (sev: SeverityType) => {
    switch (sev) {
      case "Nặng": return "border-red-600 text-red-600 bg-red-50";
      case "Vừa": return "border-orange-500 text-orange-500 bg-orange-50";
      case "Nhẹ": return "border-yellow-500 text-yellow-600 bg-yellow-50";
      case "Chấp nhận": return "border-green-600 text-green-600 bg-green-50";
    }
  };

  // Filter reports of active print day
  const dailyReports = reports.filter((r) => r.date === job.date);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/90 flex flex-col print:bg-white print:relative print:inset-auto">
      {/* Print Controls Topbar (Hidden during real print) */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-800 border-b border-slate-700 text-white print:hidden">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-400" />
          <span className="font-semibold text-sm">
            {job.type === "single" && t.printPreviewSingle}
            {job.type === "composite-summary" && t.printPreviewCompositeSummary}
            {job.type === "composite-by-person" && t.printPreviewCompositeByPerson}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-xs font-bold transition shadow-lg shadow-blue-950/20"
          >
            <Printer className="w-4 h-4" /> {t.printBtnExecute}
          </button>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded-lg text-xs transition"
          >
            <X className="w-4 h-4" /> {t.actionClose}
          </button>
        </div>
      </div>

      {/* Sheet Scroller */}
      <div className="flex-1 overflow-y-auto bg-slate-700/50 p-8 print:p-0 print:bg-white print:overflow-visible">
        {/* Printable Sheet Frame (A4 Aspect/Style) */}
        <div className="mx-auto w-[210mm] min-h-[297mm] bg-white text-slate-800 p-[20mm] shadow-2xl border border-slate-200 print:shadow-none print:border-none print:p-0">
          
          {/* Header Block */}
          <div className="border-b-2 border-slate-300 pb-5 mb-8 flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-blue-800">
                <CheckCircle2 className="w-6 h-6 fill-blue-800 text-white" />
                <span className="font-extrabold text-xl tracking-tight">iQC PRODUCTION</span>
              </div>
              <p className="text-[9px] text-slate-500 font-medium">HỆ THỐNG QUẢN LÝ CHẤT LƯỢNG SẢN XUẤT / 智能质量控制系统 / MANUFACTURING QA/QC PLATFORM</p>
            </div>
            <div className="text-right text-xs">
              <p className="font-bold text-slate-700">MÃ SỐ / 单据编号 / CODE: QC-DOC-{job.date.replace(/-/g, "")}</p>
              <p className="text-slate-500">NGÀY IN / 打印日期 / DATE: {job.date}</p>
              <p className="text-[10px] text-slate-500">NGƯỜI LẬP / 建立人 / BY: Quản Trị Viên / 系统管理员 / Admin</p>
            </div>
          </div>

          {/* Render Job A: Single defect details report */}
          {job.type === "single" && (
            (() => {
              const report = reports.find((r) => r.id === job.reportId);
              if (!report) return <div className="text-center py-12 text-rose-500 font-bold">Lỗi: Không tìm thấy phiếu chất lượng phù hợp / 错误：未找到异常报告 / Error: Conformance report not found</div>;
              const inspector = getQCDetails(report.qcId);

              return (
                <div className="space-y-6">
                  {/* Title */}
                  <div className="text-center py-3 bg-slate-100 rounded-lg">
                    <h2 className="text-sm font-black uppercase text-slate-800 tracking-wide leading-tight">
                      PHIẾU BÁO CÁO BẤT THƯỜNG CHẤT LƯỢNG / 异常质量通报单 / QUALITY EXCEPTION REPORT
                    </h2>
                    <p className="text-[10px] text-slate-500 mt-1">LƯU TRỮ NỘI BỘ NHÀ MÁY / 厂内流转闭环单据 / INTERNAL PRODUCTION CONFORMANCE STANDARD</p>
                  </div>

                  {/* Inspector and general info */}
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3 bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Thực Hiện Kiểm Tra / 执行质检 / QC Inspector</span>
                      <strong className="text-sm text-slate-700">{getQCName(report.qcId)}</strong>
                      <p className="text-xs text-slate-500 mt-1">
                        Chức danh / 岗位 / Role: {getRoleTranslation(inspector?.role || "")} | Bộ phận / 部门 / Dept: {getDeptTranslation(inspector?.department || "")}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Khu Vực Ghi Nhận / 记录区域 / Detection Zone</span>
                      <strong className="text-sm text-slate-705">{getDeptTranslation(report.department)}</strong>
                      <p className="text-xs text-slate-500 mt-1">
                        Mốc thời gian / 时间戳 / Timestamp: {new Date(report.createdAt).toLocaleTimeString("vi-VN")}
                      </p>
                    </div>
                  </div>

                  {/* Core Metrics Tables */}
                  <div className="space-y-2">
                    <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-500 border-b pb-1">1. Chỉ số kiểm nghiệm / 检测指标明细 / Core Metrics</h3>
                    <table className="w-full border-collapse border border-slate-200 text-xs">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700">
                          <th className="border border-slate-200 px-3 py-2 text-left font-bold">Tên Lỗi / 缺陷项目 / Type of Defect</th>
                          <th className="border border-slate-200 px-3 py-2 text-center font-bold">Mức độ / 严重度 / Severity</th>
                          <th className="border border-slate-200 px-3 py-2 text-right font-bold">Số kiểm / 抽样数 / Inspected</th>
                          <th className="border border-slate-200 px-3 py-2 text-right font-bold">Số lỗi / 瑕疵数 / Defects</th>
                          <th className="border border-slate-200 px-3 py-2 text-right font-bold">Tỷ lệ / 比例 / Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-slate-200 px-3 py-2.5">
                            <span className="font-bold text-slate-800">{getDefectName(report.defectId)}</span>
                            <p className="text-[10px] text-slate-500 mt-0.5">{getDefectDesc(report.defectId)}</p>
                          </td>
                          <td className="border border-slate-200 px-3 py-2.5 text-center">
                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${getSeverityBadge(report.severity)}`}>
                              {getSeverityTranslation(report.severity)}
                            </span>
                          </td>
                          <td className="border border-slate-200 px-3 py-2.5 text-right font-mono text-slate-700">{report.inspectedQty}</td>
                          <td className="border border-slate-200 px-3 py-2.5 text-right font-mono font-bold text-rose-600">{report.defectQty}</td>
                          <td className="border border-slate-200 px-3 py-2.5 text-right font-mono font-bold text-indigo-700">
                            {((report.defectQty / report.inspectedQty) * 100).toFixed(2)}%
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Detailed Description */}
                  <div className="space-y-2">
                    <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-500 border-b pb-1">2. Ý kiến chỉ đạo & Khắc phục / 异常纠编意见 / Action Guidelines</h3>
                    <div className="border border-slate-200 p-4 rounded-lg bg-slate-50/50 text-xs leading-relaxed text-slate-700 min-h-[80px]">
                      {report.description || "Không có thêm mô tả bổ sung / 没有附加描述 / No supplementary description provided."}
                    </div>
                  </div>

                  {/* Visual Evidence Photos */}
                  <div className="space-y-2">
                    <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-500 border-b pb-1">3. Hình ảnh lỗi thực tế / 现场制造缺陷照片 / Dynamic Evidence Photos</h3>
                    {report.images && report.images.length > 0 ? (
                      <div className="grid grid-cols-3 gap-4">
                        {report.images.map((img, idx) => (
                          <div key={idx} className="border border-slate-200 rounded-lg p-1.5 bg-white shadow-sm flex flex-col">
                            <div className="aspect-square bg-slate-50 rounded overflow-hidden flex items-center justify-center">
                              <img src={img} alt={`Evidence ${idx + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                            <span className="text-[10px] text-slate-400 text-center mt-1.5 font-medium">Bằng chứng / 证据 / Evidence #{idx + 1}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="border border-dashed border-slate-200 rounded-lg p-6 text-center text-xs text-slate-400">
                        {t.modalLogNoEvidence}
                      </div>
                    )}
                  </div>

                  {/* Signature block */}
                  <div className="pt-12 grid grid-cols-2 gap-12 text-center text-xs">
                    <div>
                      <p className="text-slate-400 mb-12 uppercase">DUYỆT BAN GIÁM ĐỐC / 经理审批 / APPROVED BY DIRECTOR</p>
                      <strong className="text-slate-600 block border-t border-slate-200 pt-2 w-48 mx-auto">Chữ ký lãnh đạo / 授权签字 / Authorized Sign</strong>
                    </div>
                    <div>
                      <p className="text-slate-400 mb-12 uppercase">KIỂM TRỰC QC / 现场质检签字 / QC INSPECTOR SIGNATURE</p>
                      <strong className="text-slate-800 block border-t border-slate-200 pt-2 w-48 mx-auto">{getQCName(report.qcId)}</strong>
                    </div>
                  </div>

                </div>
              );
            })()
          )}

          {/* Render Job B: Composite summary daily report */}
          {job.type === "composite-summary" && (
            <div className="space-y-6">
              {/* Title */}
              <div className="text-center py-3 bg-slate-100 rounded-lg">
                <h2 className="text-sm font-black uppercase text-slate-800 tracking-wide leading-tight">
                  SỔ TỔNG HỢP KIỂM ĐỊNH CHẤT LƯỢNG HẰNG NGÀY / 质量合格监督汇总日报 / COMPOSITE DAILY QUALITY EXCEPTION LOG
                </h2>
                <p className="text-[10px] text-slate-500 mt-1">Chứng từ tổng hợp tự động hệ thống iQC / iQC 智能系统检测自动生成 / Automated Composite Quality Report</p>
              </div>

              {/* Aggregation summary metrics table */}
              {(() => {
                const totalInsp = dailyReports.reduce((s, r) => s + r.inspectedQty, 0);
                const totalDefect = dailyReports.reduce((s, r) => s + r.defectQty, 0);
                const rate = totalInsp > 0 ? (totalDefect / totalInsp) * 100 : 0;

                return (
                  <div className="grid grid-cols-3 gap-4 border border-blue-100 rounded-lg bg-blue-50/30 p-4 text-center">
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold block uppercase">TỔNG MẪU KIỂM / 抽检样本总数 / TOTAL SAMPLES</span>
                      <strong className="text-xl text-blue-900 font-bold">{totalInsp.toLocaleString("vi-VN")}</strong>
                    </div>
                    <div className="border-x border-slate-200">
                      <span className="text-[9px] text-slate-400 font-bold block uppercase">TỔNG LỖI PHÁT HIỆN / 检测缺陷总数 / TOTAL DEFECTS</span>
                      <strong className="text-xl text-rose-600 font-bold">{totalDefect.toLocaleString("vi-VN")}</strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold block uppercase">TỶ LỆ LỖI BÌNH QUÂN / 平均缺陷比例 / DEFECT RATE</span>
                      <strong className="text-xl text-emerald-600 font-bold">{rate.toFixed(2)}%</strong>
                    </div>
                  </div>
                );
              })()}

              {/* Daily list */}
              <div className="space-y-2">
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-500 border-b pb-1">1. Danh sách chi tiết lỗi ghi nhận / 已记录制造缺陷的详细列表 / Recorded Defects</h3>
                <table className="w-full border-collapse border border-slate-200 text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700">
                      <th className="border border-slate-200 px-2 py-1.5 text-center font-bold w-8">STT</th>
                      <th className="border border-slate-200 px-2.5 py-1.5 text-left font-bold">Nhân Viên / 质检员 / Inspector</th>
                      <th className="border border-slate-200 px-2.5 py-1.5 text-left font-bold">Bộ phận / 部门 / Dept</th>
                      <th className="border border-slate-200 px-2.5 py-1.5 text-left font-bold">Tên Lỗi / 缺陷项目 / Type of Defect</th>
                      <th className="border border-slate-200 px-1.5 py-1.5 text-center font-bold w-16">Mức độ / 严重度</th>
                      <th className="border border-slate-200 px-1.5 py-1.5 text-right font-bold">Số kiểm</th>
                      <th className="border border-slate-200 px-1.5 py-1.5 text-right font-bold">Số lỗi</th>
                      <th className="border border-slate-200 px-2 py-1.5 text-right font-bold">Tỷ lệ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailyReports.length > 0 ? (
                      dailyReports.map((r, index) => (
                        <tr key={r.id}>
                          <td className="border border-slate-200 px-2 py-2 text-center font-mono">{index + 1}</td>
                          <td className="border border-slate-200 p-2.5 font-medium">{getQCName(r.qcId)}</td>
                          <td className="border border-slate-200 p-2.5">{getDeptTranslation(r.department)}</td>
                          <td className="border border-slate-200 p-2.5 font-bold text-slate-700">{getDefectName(r.defectId)}</td>
                          <td className="border border-slate-200 px-1.5 py-2 text-center">
                            <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded-full border ${getSeverityBadge(r.severity)}`}>
                              {getSeverityTranslation(r.severity)}
                            </span>
                          </td>
                          <td className="border border-slate-200 px-1.5 py-2 text-right font-mono">{r.inspectedQty}</td>
                          <td className="border border-slate-200 px-1.5 py-2 text-right font-mono text-rose-500 font-bold">{r.defectQty}</td>
                          <td className="border border-slate-200 px-2 py-2 text-right font-mono text-indigo-600 font-bold">
                            {((r.defectQty / r.inspectedQty) * 100).toFixed(2)}%
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="border border-slate-200 p-8 text-center text-slate-400">
                          Chưa có báo cáo nào trong ngày / 今日无异常统计汇报 / No quality reports recorded for this date.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Department level breakdown chart */}
              <div className="space-y-2">
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-500 border-b pb-1">2. Biểu đồ hao hụt theo bộ phận / 各制造车间损耗占比分析 / Defect Severity Analysis by Section</h3>
                <div className="border border-slate-200 p-4 rounded-lg bg-slate-50/30 space-y-3">
                  {["Kho", "Sơ chế", "Tinh chế", "Lắp ráp", "Sơn", "Đóng gói", "Lên Cont"].map((deptName) => {
                    const rps = dailyReports.filter((r) => r.department === deptName);
                    const qty = rps.reduce((sum, r) => sum + r.defectQty, 0);
                    const totalInsp = rps.reduce((sum, r) => sum + r.inspectedQty, 0);
                    const percent = totalInsp > 0 ? (qty / totalInsp) * 100 : 0;

                    return (
                      <div key={deptName} className="flex items-center gap-3 text-xs">
                        <strong className="w-16 text-slate-600 truncate">{getDeptTranslation(deptName)}</strong>
                        <div className="flex-1 h-3 bg-slate-150 rounded-full bg-slate-100 overflow-hidden relative">
                          <div
                            className="bg-indigo-600 h-full rounded-full transition-all"
                            style={{ width: `${Math.min(qty * 3, 100)}%` }}
                          ></div>
                        </div>
                        <span className="w-40 text-right font-mono text-[10px] text-slate-500">
                          {qty} lỗi/缺陷/def ({percent.toFixed(1)}% tỷ lệ/比例/rate)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Final sign off */}
              <div className="pt-20 text-center text-xs text-slate-400 grid grid-cols-2 gap-24">
                <div>
                  <p className="mb-12 uppercase tracking-wide font-medium">DUYỆT BAN GIÁM ĐỐC / 经理审批 / APPROVED BY DIRECTOR</p>
                  <strong className="text-slate-600 border-t border-slate-250 pt-2 block w-48 mx-auto">Ban Điều Hành / 董事会 / Board of Directors</strong>
                </div>
                <div>
                  <p className="mb-12 uppercase tracking-wide font-medium">XÁC NHẬN TRƯỞNG PHÒNG / 主管确认 / HEAD OF QA/QC APPROVED</p>
                  <strong className="text-slate-600 border-t border-slate-250 pt-2 block w-48 mx-auto">Trưởng phòng QA/QC / QA/QC主管 / Head of QA/QC</strong>
                </div>
              </div>
            </div>
          )}

          {/* Render Job C: Split individual reports page sequence */}
          {job.type === "composite-by-person" && (
            <div className="space-y-12">
              <div className="text-center py-2.5 bg-slate-100 rounded-lg mb-4">
                <h2 className="text-sm font-black uppercase text-slate-800 tracking-wide leading-tight">
                  TỔNG HỢP VÀ PHÂN KHAI BÁO CÁO LẺ TỪNG QC INLINE / 按质检员分别汇出细化报告 / DISPATCH PER QC INSPECTOR
                </h2>
                <p className="text-[10px] text-slate-500 mt-1">Mỗi QC sẽ được in ra riêng biệt làm căn cứ bàn giao ca kíp / 每位质检员专属报表将拆分打印 / Shift Handover Duty Logs</p>
              </div>

              {dailyReports.length > 0 ? (
                // Group by QC inline
                Object.values(
                  dailyReports.reduce((groups, report) => {
                    if (!groups[report.qcId]) {
                      groups[report.qcId] = [];
                    }
                    groups[report.qcId].push(report);
                    return groups;
                  }, {} as Record<string, QualityReport[]>)
                ).map((qcReports, personIdx) => {
                  const qcId = qcReports[0].qcId;
                  const qcName = getQCName(qcId);
                  const qcStaff = getQCDetails(qcId);

                  const personTotalInsp = qcReports.reduce((s, r) => s + r.inspectedQty, 0);
                  const personTotalDefect = qcReports.reduce((s, r) => s + r.defectQty, 0);
                  const personRate = personTotalInsp > 0 ? (personTotalDefect / personTotalInsp) * 100 : 0;

                  return (
                    <div
                       key={qcId}
                       className="border border-slate-200 rounded-xl p-6 bg-slate-50/40 relative space-y-4 print:border-none print:break-before-page print:p-0"
                    >
                      {/* Sub-header per QC */}
                      <div className="border-b border-dashed border-slate-300 pb-3 flex justify-between items-end">
                        <div>
                          <span className="text-[10px] text-indigo-500 font-extrabold uppercase bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">
                            BÁO CÁO CA NHÂN SỰ / 个人质检报告 / INSPECTION LOGSHEET {personIdx + 1}/{Object.keys(dailyReports.reduce((a,c)=>({...a,[c.qcId]:1}),{})).length}
                          </span>
                          <h3 className="text-base font-bold text-slate-800 mt-1">{qcName}</h3>
                          <p className="text-xs text-slate-500">
                            Chức danh/岗位/Role: {getRoleTranslation(qcStaff?.role || "")} | Bộ phận trực/部门/Permanent Dept: {getDeptTranslation(qcStaff?.department || "")}
                          </p>
                        </div>
                        <div className="text-right text-xs">
                          <p className="text-slate-500">Ngày / 打印日期 / Date: {job.date}</p>
                          <p className="font-mono text-[10px] text-slate-400">KPI Code: QC-RE-{qcId.replace("staff-", "")}</p>
                        </div>
                      </div>

                      {/* QC Summary KPIs */}
                      <div className="grid grid-cols-3 gap-2 bg-white/70 rounded-lg p-2.5 text-center text-xs border border-slate-100">
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold block uppercase">ĐÃ KIỂM TRA / 已检件数 / INSPECTED</span>
                          <strong className="text-sm font-black text-slate-700">{personTotalInsp}</strong>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold block uppercase">SỐ SẢN PHẨM LỖI / 缺陷件数 / TOTAL DEFECTS</span>
                          <strong className="text-sm font-black text-rose-500">{personTotalDefect}</strong>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold block uppercase">TỶ LỆ THỰC TẾ / 实际比例 / INCIDENT RATE</span>
                          <strong className="text-sm font-black text-emerald-600">{personRate.toFixed(2)}%</strong>
                        </div>
                      </div>

                      {/* Reports Log Table */}
                      <table className="w-full border-collapse border border-slate-200 text-xs">
                        <thead>
                          <tr className="bg-slate-100">
                            <th className="border border-slate-200 p-2 text-left font-bold text-slate-600">Bộ phận / 部门 / Dept</th>
                            <th className="border border-slate-200 p-2 text-left font-bold text-slate-600">Kiểm Mục / 缺陷项目 / Type of Defect</th>
                            <th className="border border-slate-200 p-2 text-center font-bold text-slate-600">Mức độ / 严重度 / Severity</th>
                            <th className="border border-slate-200 p-2 text-right font-bold text-slate-600">Số kiểm / 抽样 / Insp</th>
                            <th className="border border-slate-200 p-2 text-right font-bold text-slate-600">Số lỗi / 缺陷 / Def</th>
                            <th className="border border-slate-200 p-2 text-left font-bold text-slate-600">Ghi chú / 备注 / Explanations</th>
                          </tr>
                        </thead>
                        <tbody>
                          {qcReports.map((r) => (
                            <tr key={r.id}>
                              <td className="border border-slate-200 p-2 font-medium">{getDeptTranslation(r.department)}</td>
                              <td className="border border-slate-200 p-2 font-bold text-slate-700">{getDefectName(r.defectId)}</td>
                              <td className="border border-slate-200 p-2 text-center text-[9px]">
                                <span className={`px-1.5 py-0.2 font-bold border rounded-full ${getSeverityBadge(r.severity)}`}>
                                  {getSeverityTranslation(r.severity)}
                                </span>
                              </td>
                              <td className="border border-slate-200 p-2 text-right font-mono">{r.inspectedQty}</td>
                              <td className="border border-slate-200 p-2 text-right font-mono text-rose-500 font-medium">{r.defectQty}</td>
                              <td className="border border-slate-200 p-2 text-[11px] text-slate-500 leading-snug">{r.description || "-"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {/* Display small previews inside the list of individual logs */}
                      <div className="flex flex-wrap gap-2 pt-2">
                        {qcReports.flatMap(r => r.images || []).map((imgUrl, keyImg) => (
                          <div key={keyImg} className="border border-slate-200 p-1 bg-white rounded shadow-xs">
                            <img src={imgUrl} className="w-16 h-16 object-cover rounded" alt="Evidence small thumbnail" referrerPolicy="no-referrer" />
                          </div>
                        ))}
                      </div>

                      {/* Signatures */}
                      <div className="pt-6 grid grid-cols-2 text-center text-[10px] text-slate-400">
                        <div>
                          <p className="mb-6 uppercase">Ý KIẾN QUẢN ĐỐC SẢN XUẤT / 车间制造主管确认处 / SUPERVISOR FEEDBACK</p>
                          <span className="w-32 border-t border-slate-200 block mx-auto pt-1">Kỳ xác nhận nhượng ca / 签字确认交班 / Sign transfer</span>
                        </div>
                        <div>
                          <p className="mb-6 uppercase">KÝ TÊN QC TRÌNH DUYỆT / 质检员本人签字 / QC INSPECTOR SIGNATURE</p>
                          <strong className="text-slate-600 w-32 border-t border-slate-200 block mx-auto pt-1">{qcName}</strong>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="border border-slate-200 p-12 text-center text-slate-400">
                  Không ghi nhận dữ liệu hôm nay để tách rời in ấn / 今日没有任何独立的抽检单据 / No records today for separate printing
                </div>
              )}
            </div>
          )}

          {/* Render Job D: Organization Chart & Personnel Registry */}
          {job.type === "org-chart" && (
            <div className="space-y-8 print:break-inside-avoid">
              <div className="text-center py-3.5 bg-slate-900 text-white rounded-lg mb-6">
                <h2 className="text-base font-black uppercase tracking-wider text-white">
                  SƠ ĐỒ TỔ CHỨC & BỘ MÁY NHÂN SỰ QC / 质量控制（QC）部门组织架构图 / QC ORGANIZATIONAL STRUCTURE
                </h2>
                <p className="text-[10px] text-zinc-300 mt-1">
                  Sơ đồ trực kíp trực hành chính và danh bạ nhân sự / 班组架构 & 通讯录 / Permanent shift organization chart & workforce roster
                </p>
              </div>

              {/* Graphical Visual Org Chart block - optimized for print flow */}
              <div className="space-y-4">
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-500 border-b pb-1">
                  1. Sơ đồ phân cấp nhân sự trực quan / 组织架构图 / Visual Hierarchy Map
                </h3>

                {/* Visual Corporate Org Chart Block */}
                <div className="border border-slate-250 bg-white dark:bg-zinc-950 rounded-2xl p-6 shadow-sm">
                  {(() => {
                    const directors = staffList.filter((s) => s.role === "Director");
                    const managers = staffList.filter((s) => s.role === "Manager");
                    const leaders = staffList.filter((s) => s.role === "QC Leader");
                    
                    // Direct inlines are QC Inlines who do not report to any QC Leaders
                    const directInlines = staffList.filter(
                      (s) => s.role === "QC Inline" && (!s.reportsTo || !leaders.some((l) => l.id === s.reportsTo))
                    );

                    return (
                      <div className="flex flex-col items-center w-full space-y-6">
                        {/* 1. TOP SUPREME LEVEL (Directors) */}
                        {directors.length > 0 && (
                          <div className="flex flex-col items-center">
                            <div className="flex flex-wrap justify-center gap-4">
                              {directors.map((dir) => (
                                <div
                                  key={dir.id}
                                  className="bg-indigo-950 dark:bg-zinc-900 border border-indigo-900 dark:border-zinc-800 rounded-xl shadow-md p-4 w-72 text-center text-white"
                                >
                                  <div className="text-[10px] font-mono tracking-widest font-extrabold uppercase text-indigo-300">
                                    {getRoleTranslation ? getRoleTranslation(dir.role) : dir.role}
                                  </div>
                                  <div className="text-base font-black mt-1 leading-tight">{dir.name}</div>
                                  <div className="text-[10px] text-indigo-200 mt-1 uppercase tracking-wide font-mono">
                                    GIÁM ĐỐC ĐIỀU HÀNH / 董事会 / BOARD OF DIRECTORS
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            {/* Connect line down */}
                            {(managers.length > 0 || leaders.length > 0) && (
                              <div className="w-0.5 h-6 bg-slate-300 dark:bg-zinc-800 mt-2"></div>
                            )}
                          </div>
                        )}

                        {/* 2. MANAGEMENT LEVEL (Managers / QC Trưởng Nhóm) */}
                        {managers.length > 0 && (
                          <div className="flex flex-col items-center w-full">
                            <div className="flex flex-wrap justify-center gap-4">
                              {managers.map((m) => (
                                <div
                                  key={m.id}
                                  className="bg-sky-900 dark:bg-zinc-850 border border-sky-800 dark:border-zinc-800 rounded-xl shadow-md p-3 w-64 text-center text-white"
                                >
                                  <div className="text-[9px] font-mono tracking-widest font-extrabold uppercase text-sky-200">
                                    {getRoleTranslation ? getRoleTranslation(m.role) : m.role}
                                  </div>
                                  <div className="text-sm font-extrabold mt-1 leading-tight">{m.name}</div>
                                  <div className="text-[9px] text-sky-200/90 mt-0.5 uppercase tracking-wide font-mono">
                                    ĐIỀU PHỐI CHẤT LƯỢNG / 质量管理 / QUALITY MANAGER
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Connect line down */}
                            {(leaders.length > 0 || directInlines.length > 0) && (
                              <div className="w-0.5 h-6 bg-slate-300 dark:bg-zinc-800 mt-2"></div>
                            )}
                          </div>
                        )}

                        {/* 3. COLUMNEO-BRANCHES (QC Leaders/Columns & Sub-Departments) */}
                        {(leaders.length > 0 || directInlines.length > 0) && (
                          <div className="w-full flex flex-col items-center">
                            {/* Horizontal Line Bridge linking columns */}
                            {(leaders.length > 1 || (leaders.length === 1 && directInlines.length > 0)) && (
                              <div className="relative w-full h-4 mb-4 select-none">
                                <div className="absolute top-0 left-[15%] right-[15%] h-[2.5px] bg-sky-200 dark:bg-zinc-800 rounded"></div>
                              </div>
                            )}

                            {/* The Grid displaying columns side-by-side */}
                            <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                              {/* Display each leader as a Department Column */}
                              {leaders.map((leader) => {
                                const myInlines = staffList.filter(
                                  (s) => s.reportsTo === leader.id && s.role === "QC Inline"
                                );
                                return (
                                  <div
                                    key={leader.id}
                                    className="bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-850 rounded-xl p-4 flex flex-col hover:border-sky-300 dark:hover:border-zinc-700 transition"
                                  >
                                    {/* Department Column Header */}
                                    <div className="bg-sky-800 dark:bg-zinc-800 text-white rounded-lg p-2.5 text-center shadow-sm mb-3">
                                      <div className="text-[9px] font-mono tracking-wider text-sky-200 uppercase font-bold">
                                        {getRoleTranslation ? getRoleTranslation(leader.role) : leader.role}
                                      </div>
                                      <div className="text-xs font-bold leading-tight mt-0.5">{leader.name}</div>
                                      {leader.department && (
                                        <div className="text-[10px] mt-1 text-slate-200 font-medium border-t border-sky-800/50 pt-1 tracking-tight">
                                          {getDeptTranslation ? getDeptTranslation(leader.department) : leader.department}
                                        </div>
                                      )}
                                    </div>

                                    {/* Vertical Left Connector Line with branch items */}
                                    <div className="relative flex-1 pl-4 ml-3 border-l-2 border-slate-250 dark:border-zinc-800 space-y-3 py-1">
                                      {myInlines.length > 0 ? (
                                        myInlines.map((inline) => (
                                          <div key={inline.id} className="relative flex items-center">
                                            {/* Horizontal peg linking to the vertical left border */}
                                            <div className="absolute -left-4 w-4 h-0.5 bg-slate-250 dark:bg-zinc-800"></div>
                                            <div className="flex-1 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-lg p-2 shadow-sm text-left">
                                              <div className="text-[11px] font-bold text-slate-800 dark:text-zinc-200">
                                                {inline.name}
                                              </div>
                                              <div className="text-[9px] text-slate-500 dark:text-zinc-400 font-mono">
                                                {getRoleTranslation ? getRoleTranslation(inline.role) : inline.role}
                                              </div>
                                            </div>
                                          </div>
                                        ))
                                      ) : (
                                        <div className="text-[10px] text-slate-400 italic font-mono pt-1 text-center">
                                          (Trống / 未分配 / No Inline)
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}

                              {/* Special direct reports column (if any exists) */}
                              {directInlines.length > 0 && (
                                <div className="bg-slate-50 dark:bg-zinc-900/60 border border-dashed border-slate-250 dark:border-zinc-850 rounded-xl p-4 flex flex-col">
                                  {/* Section Header */}
                                  <div className="bg-slate-700 text-white rounded-lg p-2.5 text-center shadow-sm mb-3">
                                    <div className="text-[9px] font-mono tracking-wider text-slate-300 uppercase font-black">
                                      NHÂN SỰ TRỰC THUỘC / 直属人员 / FLOATING REPORTS
                                    </div>
                                    <div className="text-xs font-bold leading-tight mt-0.5">
                                      Tự Do / Hỗ Trợ / 支援人员 / Support Pool
                                    </div>
                                    <div className="text-[9px] mt-1 text-slate-300/80 font-medium border-t border-slate-600 pt-1">
                                      Báo cáo Ban Giám Đốc / 汇报给董事会 / Direct Admin Reports
                                    </div>
                                  </div>

                                  {/* Vertical Left Line */}
                                  <div className="relative pl-4 ml-3 border-l-2 border-slate-250 dark:border-zinc-800 space-y-3 py-1">
                                    {directInlines.map((inline) => (
                                      <div key={inline.id} className="relative flex items-center">
                                        {/* Horizontal peg */}
                                        <div className="absolute -left-4 w-4 h-0.5 bg-slate-250 dark:bg-zinc-800"></div>
                                        <div className="flex-1 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 rounded-lg p-2 shadow-sm text-left">
                                          <div className="text-[11px] font-bold text-slate-800 dark:text-zinc-200">
                                            {inline.name}
                                          </div>
                                          <div className="text-[9px] text-slate-500 dark:text-zinc-400 font-mono">
                                            {inline.department ? (getDeptTranslation ? getDeptTranslation(inline.department) : inline.department) : "Liên Bộ Phận / 跨部门 / Cross-Dept"}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Full Profiles Roster Table */}
              <div className="space-y-4 pt-4">
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-500 border-b pb-1">
                  2. Danh sách hồ sơ nhân viên / 人员档案 / Personnel Registers
                </h3>
                <table className="w-full border-collapse border border-slate-200 text-xs text-left">
                  <thead>
                    <tr className="bg-slate-100 font-bold text-slate-600">
                      <th className="border border-slate-200 p-2.5 text-center w-12">STT / 序号 / No.</th>
                      <th className="border border-slate-200 p-2.5">Họ và Tên / 姓名 / Staff Name</th>
                      <th className="border border-slate-200 p-2.5">Chức vụ / 岗位 / Role</th>
                      <th className="border border-slate-200 p-2.5">Bộ phận / 部门 / Dept</th>
                      <th className="border border-slate-200 p-2.5">Người Quản Lý / 直属主管 / Reports To</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffList.map((s, idx) => (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="border border-slate-200 p-2.5 text-center font-mono">{idx + 1}</td>
                        <td className="border border-slate-200 p-2.5 font-bold text-slate-800">{s.name}</td>
                        <td className="border border-slate-200 p-2.5">
                          <span className="font-semibold">{getRoleTranslation(s.role)}</span>
                        </td>
                        <td className="border border-slate-200 p-2.5">
                          {s.role === 'Director' || s.role === 'Manager' ? '-' : getDeptTranslation(s.department)}
                        </td>
                        <td className="border border-slate-200 p-2.5 text-slate-500">
                          {s.reportsTo ? (staffList.find((p) => p.id === s.reportsTo)?.name || "-") : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Signatures block for accountability */}
              <div className="pt-24 text-center text-[10px] text-slate-400 grid grid-cols-2 gap-24">
                <div>
                  <p className="mb-12 uppercase tracking-wide font-medium">DUYỆT BAN GIÁM ĐỐC / 经理审批 / APPROVED BY DIRECTOR</p>
                  <strong className="text-slate-600 border-t border-slate-200 pt-2 block w-48 mx-auto">Ban Điều Hành / 董事会 / Board of Directors</strong>
                </div>
                <div>
                  <p className="mb-12 uppercase tracking-wide font-medium">XÁC NHẬN TRƯỞNG PHÒNG / 主管确认 / HEAD OF QA/QC APPROVED</p>
                  <strong className="text-slate-600 border-t border-slate-200 pt-2 block w-48 mx-auto">Trưởng phòng QA/QC / QA/QC主管 / Head of QA/QC</strong>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
