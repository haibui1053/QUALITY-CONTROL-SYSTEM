/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  Staff,
  DefectType,
  QualityReport,
  UserSession,
  RoleType,
  DepartmentType,
  SeverityType,
} from "./types";
import { LanguageType, TRANSLATIONS, TranslationDictionary } from "./translations";
import {
  INITIAL_STAFF,
  INITIAL_DEFECT_TYPES,
  INITIAL_REPORTS,
  getFormattedToday,
} from "./initialData";
import {
  LayoutDashboard,
  Users,
  Settings2,
  Edit3,
  FileSpreadsheet,
  TrendingUp,
  Download,
  Settings,
  LogOut,
  Plus,
  Trash2,
  Printer,
  Eye,
  CheckCircle2,
  Image as ImageIcon,
  Moon,
  Sun,
  AlertTriangle,
  X,
  FileText,
  Camera,
  Activity,
  Filter,
} from "lucide-react";
import OrgChart from "./components/OrgChart";
import Modal from "./components/Modal";
import DashboardCharts from "./components/DashboardCharts";
import PrintTemplates from "./components/PrintTemplates";
import { exportToSingleHTML } from "./components/StandaloneExporter";

export default function App() {
  // 1. Core Databases (LocalStorage backed)
  const [staffList, setStaffList] = useState<Staff[]>(() => {
    const local = localStorage.getItem("iqc_staff");
    return local ? JSON.parse(local) : INITIAL_STAFF;
  });

  const [defectTypes, setDefectTypes] = useState<DefectType[]>(() => {
    const local = localStorage.getItem("iqc_defects");
    return local ? JSON.parse(local) : INITIAL_DEFECT_TYPES;
  });

  const [reports, setReports] = useState<QualityReport[]>(() => {
    const local = localStorage.getItem("iqc_reports");
    return local ? JSON.parse(local) : INITIAL_REPORTS();
  });

  const [session, setSession] = useState<UserSession | null>(() => {
    const local = localStorage.getItem("iqc_session");
    return local ? JSON.parse(local) : null;
  });

  // 2. Local State Management
  const [lang, setLang] = useState<LanguageType>(() => {
    return (localStorage.getItem("iqc_lang") as LanguageType) || "vi";
  });
  
  // Combine all three languages into a single string for each key in translations to show all 3 languages on the same page
  const t = React.useMemo(() => {
    const combined: Record<string, string> = {};
    const keys = Object.keys(TRANSLATIONS.vi) as (keyof TranslationDictionary & string)[];
    for (const key of keys) {
      const vi = TRANSLATIONS.vi[key] || "";
      const zh = TRANSLATIONS.zh[key] || "";
      const en = TRANSLATIONS.en[key] || "";
      
      if (key === "langVi" || key === "langEn" || key === "langZh") {
        combined[key] = TRANSLATIONS[lang][key]; // keep separate for language selector labels
        continue;
      }

      if (vi === zh && zh === en) {
        combined[key] = vi;
      } else {
        const uniq = Array.from(new Set([vi, zh, en].map(s => s.trim()).filter(Boolean)));
        combined[key] = uniq.join(" / ");
      }
    }
    return combined as unknown as TranslationDictionary;
  }, [lang]);

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

  const getRoleTranslation = (roleKey: string) => {
    switch (roleKey) {
      case "Director": return t.roleDirector;
      case "Manager": return t.roleManager;
      case "QC Leader": return t.roleQcLeader;
      case "QC Inline": return t.roleQcInline;
      default: return roleKey;
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

  const mt = (vi: string, zh: string, en: string) => {
    const parts = [vi.trim(), zh.trim(), en.trim()].filter(Boolean);
    const uniqueParts = parts.filter((v, i, self) => self.indexOf(v) === i);
    return uniqueParts.join(" / ");
  };

  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem("iqc_dark_mode") === "true";
  });

  // Dialogs / Form Triggers
  const [viewingReport, setViewingReport] = useState<QualityReport | null>(null);
  const [activePrintJob, setActivePrintJob] = useState<{
    type: "single" | "composite-summary" | "composite-by-person" | "org-chart";
    reportId?: string;
    date: string;
  } | null>(null);

  // Filter conditions for Daily Records
  const [filterDate, setFilterDate] = useState<string>(getFormattedToday());
  const [filterQC, setFilterQC] = useState<string>("all");
  const [filterDept, setFilterDept] = useState<string>("all");
  const [filterDefect, setFilterDefect] = useState<string>("all");

  // Authentication Fields
  const [usernameInput, setUsernameInput] = useState<string>("");
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [loginError, setLoginError] = useState<string>("");

  // Staff Form
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [staffName, setStaffName] = useState<string>("");
  const [staffRole, setStaffRole] = useState<RoleType>("QC Inline");
  const [staffDept, setStaffDept] = useState<DepartmentType>("Kho");
  const [staffReportsTo, setStaffReportsTo] = useState<string>("");

  // Defect Form
  const [editingDefectId, setEditingDefectId] = useState<string | null>(null);
  const [defectName, setDefectName] = useState<string>("");
  const [defectDept, setDefectDept] = useState<DepartmentType | "Tất cả">("Tất cả");
  const [defectDesc, setDefectDesc] = useState<string>("");

  // Reporting Logs Form
  const [repDate, setRepDate] = useState<string>(getFormattedToday());
  const [repQCId, setRepQCId] = useState<string>("");
  const [repDept, setRepDept] = useState<DepartmentType>("Kho");
  const [repDefectId, setRepDefectId] = useState<string>("");
  const [repSeverity, setRepSeverity] = useState<SeverityType>("Nặng");
  const [repInspectedQty, setRepInspectedQty] = useState<number>(100);
  const [repDefectQty, setRepDefectQty] = useState<number>(0);
  const [repDesc, setRepDesc] = useState<string>("");
  const [repImages, setRepImages] = useState<string[]>([]); // Base64 strings

  // 3. LocalStorage Side-Effects
  useEffect(() => {
    localStorage.setItem("iqc_staff", JSON.stringify(staffList));
  }, [staffList]);

  useEffect(() => {
    localStorage.setItem("iqc_defects", JSON.stringify(defectTypes));
  }, [defectTypes]);

  useEffect(() => {
    localStorage.setItem("iqc_reports", JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    if (session) {
      localStorage.setItem("iqc_session", JSON.stringify(session));
    } else {
      localStorage.removeItem("iqc_session");
    }
  }, [session]);

  // Darkmode Class Integration
  useEffect(() => {
    localStorage.setItem("iqc_dark_mode", String(darkMode));
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("iqc_lang", lang);
  }, [lang]);

  // Sync Form QC Cascades
  useEffect(() => {
    const qcs = staffList.filter((s) => s.role === "QC Inline" || s.role === "QC Leader");
    if (qcs.length > 0 && !repQCId) {
      setRepQCId(qcs[0].id);
      setRepDept(qcs[0].department);
    }
  }, [staffList]);

  // Handle Form QC change
  const handleQCSelectChange = (qcId: string) => {
    setRepQCId(qcId);
    const selectedQC = staffList.find((s) => s.id === qcId);
    if (selectedQC) {
      setRepDept(selectedQC.department);
      // Automatically pull first valid defect for this department
      const matchingDefects = defectTypes.filter(
        (dt) => dt.department === selectedQC.department || dt.department === "Tất cả"
      );
      if (matchingDefects.length > 0) {
        setRepDefectId(matchingDefects[0].id);
      } else {
        setRepDefectId("");
      }
    }
  };

  useEffect(() => {
    // If repDept of defectTypes updates, set defectId fallback
    const matchingDefects = defectTypes.filter(
      (dt) => dt.department === repDept || dt.department === "Tất cả"
    );
    if (matchingDefects.length > 0) {
      setRepDefectId(matchingDefects[0].id);
    } else {
      setRepDefectId("");
    }
  }, [repDept, defectTypes]);

  // 4. Authenticate Process
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedUsername = usernameInput.trim().toLowerCase();
    const normalizedPassword = passwordInput.trim();

    if (normalizedUsername === "admin" && normalizedPassword === "admin") {
      setSession({
        username: "admin",
        role: "admin",
        displayName: "Giám Đốc (Full Admin)",
      });
      setLoginError("");
      setActiveTab("dashboard");
    } else if (normalizedUsername === "admin2" && normalizedPassword === "admin2") {
      setSession({
        username: "admin2",
        role: "admin2",
        displayName: "Trưởng Nhóm QC",
      });
      setLoginError("");
      setActiveTab("dashboard");
    } else {
      setLoginError(t.loginErrorText);
    }
  };

  const handleLogout = () => {
    setSession(null);
    setUsernameInput("");
    setPasswordInput("");
  };

  // 5. Staff CRUD Handlers
  const handleSaveStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName.trim()) return;

    const staffObj: Staff = {
      id: editingStaffId || `staff-${Date.now()}`,
      name: staffName.trim(),
      role: staffRole,
      department: staffDept,
      reportsTo: staffReportsTo || undefined,
    };

    if (editingStaffId) {
      setStaffList((prev) => prev.map((s) => (s.id === editingStaffId ? staffObj : s)));
      setEditingStaffId(null);
    } else {
      setStaffList((prev) => [...prev, staffObj]);
    }

    // Reset Form
    setStaffName("");
    setStaffRole("QC Inline");
    setStaffDept("Kho");
    setStaffReportsTo("");
  };

  const handleEditStaff = (s: Staff) => {
    setEditingStaffId(s.id);
    setStaffName(s.name);
    setStaffRole(s.role);
    setStaffDept(s.department);
    setStaffReportsTo(s.reportsTo || "");
  };

  const handleDeleteStaff = (id: string) => {
    if (window.confirm("Bạn có tin chắc muốn xóa nhân viên này khỏi sơ đồ tổ chức?")) {
      setStaffList((prev) => prev.filter((s) => s.id !== id));
      // Reset reports to mapping if parent deleted
      setStaffList((prev) =>
        prev.map((s) => (s.reportsTo === id ? { ...s, reportsTo: undefined } : s))
      );
    }
  };

  // 6. Defect CRUD Handlers
  const handleSaveDefect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!defectName.trim()) return;

    const defectObj: DefectType = {
      id: editingDefectId || `defect-${Date.now()}`,
      name: defectName.trim(),
      department: defectDept,
      description: defectDesc.trim(),
    };

    if (editingDefectId) {
      setDefectTypes((prev) => prev.map((d) => (d.id === editingDefectId ? defectObj : d)));
      setEditingDefectId(null);
    } else {
      setDefectTypes((prev) => [...prev, defectObj]);
    }

    // Reset Form
    setDefectName("");
    setDefectDept("Tất cả");
    setDefectDesc("");
  };

  const handleEditDefect = (dt: DefectType) => {
    setEditingDefectId(dt.id);
    setDefectName(dt.name);
    setDefectDept(dt.department);
    setDefectDesc(dt.description);
  };

  const handleDeleteDefect = (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa đi danh mục khuyết tật rủi ro này?")) {
      setDefectTypes((prev) => prev.filter((d) => d.id !== id));
    }
  };

  // 7. Daily Quality Report Submission Form
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const maxFiles = Math.min(files.length, 3 - repImages.length);
    for (let i = 0; i < maxFiles; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setRepImages((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = (idx: number) => {
    setRepImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSaveReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repQCId || !repDefectId) {
      alert("Vui lòng bổ sung đầy đủ thông tin QC trực và Loại Lỗi!");
      return;
    }

    if (repDefectQty > repInspectedQty) {
      alert("Sản lượng lỗi phát hiện không thể lớn hơn sản lượng chạy mẫu kiểm tra!");
      return;
    }

    const reportObj: QualityReport = {
      id: `report-${Date.now()}`,
      date: repDate,
      qcId: repQCId,
      department: repDept,
      defectId: repDefectId,
      severity: repSeverity,
      inspectedQty: repInspectedQty,
      defectQty: repDefectQty,
      description: repDesc,
      images: repImages,
      createdAt: new Date().toISOString(),
    };

    setReports((prev) => [reportObj, ...prev]);
    alert("Kê khai lỗi chất lượng hoàn tất thành công!");

    // Reset form states
    setRepInspectedQty(100);
    setRepDefectQty(0);
    setRepDesc("");
    setRepImages([]);

    // Go directly to records to inspect additions
    setActiveTab("records");
  };

  const handleDeleteReport = (id: string) => {
    if (window.confirm("Bạn có chắc muốn xóa hẳn chứng từ kiểm duyệt lỗi sản phẩm này?")) {
      setReports((prev) => prev.filter((r) => r.id !== id));
    }
  };

  // 8. Excel & Backup Sync Tools
  const getQCName = (id: string) => staffList.find((s) => s.id === id)?.name || "Unknown QC";
  const getDefectName = (id: string) => defectTypes.find((d) => d.id === id)?.name || "Lỗi chưa phân mục";

  const handleExportExcel = () => {
    const todayReports = reports.filter((r) => r.date === filterDate);
    if (todayReports.length === 0) {
      alert(`Không phát hiện dữ liệu lỗi vào ngày ${filterDate} để kết xuất bảng biểu!`);
      return;
    }

    const csvHeader = "\uFEFF" + [
      "Ngày",
      "QC Ghi nhận",
      "Bộ phận sản xuất",
      "Mã/Loại lỗi",
      "Mức độ rủi ro",
      "Tổng sản lượng kiểm tra",
      "Sản lượng khuyết tật",
      "Tỉ lệ sai mục (%)",
      "Ghi chú chi tiết",
    ].join(",");

    const csvRows = todayReports.map((r) =>
      [
        r.date,
        getQCName(r.qcId),
        r.department,
        getDefectName(r.defectId),
        r.severity,
        r.inspectedQty,
        r.defectQty,
        ((r.defectQty / r.inspectedQty) * 100).toFixed(2) + "%",
        `"${r.description.replace(/"/g, '""')}"`,
      ].join(",")
    );

    const blob = new Blob([[csvHeader, ...csvRows].join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `iQC_Bao_Cao_Tong_Hop_${filterDate}.csv`;
    link.click();
  };

  const handleBackupExport = () => {
    const dataObj = { staffList, defectTypes, reports };
    const blob = new Blob([JSON.stringify(dataObj, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `iQC_Backup_System_${getFormattedToday()}.json`;
    link.click();
  };

  const handleBackupImportSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.staffList && parsed.defectTypes && parsed.reports) {
          setStaffList(parsed.staffList);
          setDefectTypes(parsed.defectTypes);
          setReports(parsed.reports);
          alert("Nạp và đồng bộ dữ liệu dự phòng hệ thống thành công!");
        } else {
          alert("Cấu trúc file JSON tải lên không hợp lệ, không đúng thiết kế iQC!");
        }
      } catch (err: any) {
        alert(`Lỗi phân tích cú pháp tệp: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  const handleResetSystem = () => {
    if (
      window.confirm(
        "CẢNH BÁO: Thao tác này sẽ xóa sạch toàn bộ localStorage và nạp lại 12 nhân sự kíp mẫu, 10 loại lỗi sản xuất và 5 báo cáo QC hôm nay ban đầu. Bạn có tin chắc muốn reset?"
      )
    ) {
      localStorage.clear();
      window.location.reload();
    }
  };

  // Exporters single file download trigger
  const handleDownloadStandaloneHTML = () => {
    const htmlText = exportToSingleHTML(staffList, defectTypes, reports);
    const blob = new Blob([htmlText], { type: "text/html;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `iQC_Application_Offline_Portal.html`;
    link.click();
  };

  // Filter logic for table display
  const activeReportsFiltered = reports.filter((r) => {
    if (r.date !== filterDate) return false;
    if (filterQC !== "all" && r.qcId !== filterQC) return false;
    if (filterDept !== "all" && r.department !== filterDept) return false;
    if (filterDefect !== "all" && r.defectId !== filterDefect) return false;
    return true;
  });

  const getSeverityBadgeClass = (sev: SeverityType) => {
    switch (sev) {
      case "Nặng":
        return "bg-red-50 text-red-600 border border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800/30";
      case "Vừa":
        return "bg-orange-50 text-orange-600 border border-orange-200 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-850/30";
      case "Nhẹ":
        return "bg-yellow-50 text-yellow-600 border border-yellow-250 dark:bg-yellow-950/20 dark:text-yellow-400 dark:border-yellow-800/30";
      case "Chấp nhận":
        return "bg-green-50 text-green-600 border border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800/30";
    }
  };

  // 9. Login Screen Render
  if (!session) {
    return (
      <div id="login-screen" className="min-h-screen bg-neutral-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-6 font-sans">
        
        {/* Main Card */}
        <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-lg shadow-sm p-8 space-y-6 animate-in fade-in duration-300">
          
          {/* Multi-national Segmented Language Flags / Text Selector */}
          <div className="flex justify-between items-center bg-neutral-50 dark:bg-zinc-950/50 p-2 rounded-lg border border-neutral-100 dark:border-zinc-850">
            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-extrabold flex items-center gap-1.5">
              🌎 NATIONS / LANGUAGES
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setLang("vi")}
                className={`px-2 py-1 text-[11px] font-bold font-mono rounded transition duration-150 ${
                  lang === "vi"
                    ? "bg-neutral-900 text-white dark:bg-zinc-100 dark:text-zinc-950"
                    : "text-neutral-550 dark:text-zinc-400 hover:bg-neutral-100 dark:hover:bg-zinc-800"
                }`}
                title="Vietnam / Tiếng Việt"
              >
                🇻🇳 VI
              </button>
              <button
                type="button"
                onClick={() => setLang("en")}
                className={`px-2 py-1 text-[11px] font-bold font-mono rounded transition duration-150 ${
                  lang === "en"
                    ? "bg-neutral-900 text-white dark:bg-zinc-100 dark:text-zinc-950"
                    : "text-neutral-550 dark:text-zinc-400 hover:bg-neutral-100 dark:hover:bg-zinc-800"
                }`}
                title="United States / English"
              >
                🇺🇸 EN
              </button>
              <button
                type="button"
                onClick={() => setLang("zh")}
                className={`px-2 py-1 text-[11px] font-bold font-mono rounded transition duration-150 ${
                  lang === "zh"
                    ? "bg-neutral-900 text-white dark:bg-zinc-100 dark:text-zinc-950"
                    : "text-neutral-550 dark:text-zinc-400 hover:bg-neutral-100 dark:hover:bg-zinc-800"
                }`}
                title="China / 中文"
              >
                🇨🇳 中
              </button>
            </div>
          </div>

          <div className="space-y-2 text-center">
            <div className="inline-flex p-2.5 bg-neutral-900 dark:bg-zinc-850 text-white rounded-md mb-2 border border-neutral-800/20">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-lg font-extrabold text-neutral-955 dark:text-zinc-50 tracking-tight leading-snug">
              {t.loginTitle}
            </h1>
            <p className="text-xs text-neutral-505 dark:text-zinc-400 font-semibold leading-relaxed max-w-sm mx-auto">
              {t.loginSubtitle}
            </p>
          </div>

          {loginError && (
            <div className="p-3 bg-red-50 dark:bg-red-950/25 border border-red-200 dark:border-red-900/30 rounded-md flex items-center gap-2 text-xs text-red-700 dark:text-red-400 animate-shake">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
              <span className="font-semibold">{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-800 dark:text-zinc-200 font-bold block">
                  {t.loginUsername}
                </label>
                <input
                  id="login-username"
                  type="text"
                  required
                  placeholder="admin / admin2"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="w-full text-xs text-neutral-950 dark:text-zinc-100 font-mono px-3.5 py-2.5 border border-neutral-300 dark:border-zinc-750 bg-white dark:bg-zinc-950 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-zinc-400 focus:border-transparent transition"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-800 dark:text-zinc-200 font-bold block">
                  {t.loginPassword}
                </label>
                <input
                  id="login-password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full text-xs text-neutral-950 dark:text-zinc-100 font-mono px-3.5 py-2.5 border border-neutral-300 dark:border-zinc-750 bg-white dark:bg-zinc-950 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-zinc-400 focus:border-transparent transition"
                />
              </div>
            </div>

            <button
              id="login-btn"
              type="submit"
              className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-bold text-xs rounded-md tracking-wider transition duration-150 uppercase shadow-sm mt-2"
            >
              {t.loginButton}
            </button>
          </form>

          {/* Interactive Fast Sign-In Presets */}
          <div className="space-y-3 pt-4 border-t border-neutral-200 dark:border-zinc-800">
            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-800 dark:text-zinc-200 font-bold block text-center">
              {t.fastSignIn}
            </span>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setUsernameInput("admin");
                  setPasswordInput("admin");
                  setSession({
                    username: "admin",
                    role: "admin",
                    displayName: lang === "vi" ? "Giám Đốc (Full Admin)" : lang === "en" ? "Director (Full Admin)" : "总监 (系统管理员)",
                  });
                  setLoginError("");
                  setActiveTab("dashboard");
                }}
                className="p-3 text-left border border-neutral-200 dark:border-zinc-800 hover:border-neutral-900 dark:hover:border-zinc-100 bg-neutral-50 hover:bg-neutral-100 dark:bg-zinc-950/50 dark:hover:bg-zinc-900 rounded transition duration-150 group"
              >
                <div className="text-[9px] font-mono text-neutral-500 dark:text-zinc-400 font-bold uppercase">{t.preset1}</div>
                <div className="text-xs font-bold text-neutral-900 dark:text-zinc-100 mt-0.5 group-hover:underline">admin</div>
                <div className="text-[10px] font-mono text-neutral-600 dark:text-zinc-300 mt-1 bg-neutral-200/50 dark:bg-zinc-800 px-1.5 py-0.5 rounded inline-block">
                  admin / admin
                </div>
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setUsernameInput("admin2");
                  setPasswordInput("admin2");
                  setSession({
                    username: "admin2",
                    role: "admin2",
                    displayName: lang === "vi" ? "Trưởng Nhóm QC" : lang === "en" ? "QC Lead Auditor" : "质量主管人员",
                  });
                  setLoginError("");
                  setActiveTab("dashboard");
                }}
                className="p-3 text-left border border-neutral-200 dark:border-zinc-800 hover:border-neutral-900 dark:hover:border-zinc-100 bg-neutral-50 hover:bg-neutral-100 dark:bg-zinc-950/50 dark:hover:bg-zinc-900 rounded transition duration-150 group"
              >
                <div className="text-[9px] font-mono text-neutral-500 dark:text-zinc-400 font-bold uppercase">{t.preset2}</div>
                <div className="text-xs font-bold text-neutral-900 dark:text-zinc-100 mt-0.5 group-hover:underline">admin2</div>
                <div className="text-[10px] font-mono text-neutral-600 dark:text-zinc-300 mt-1 bg-neutral-200/50 dark:bg-zinc-800 px-1.5 py-0.5 rounded inline-block">
                  admin2 / admin2
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Common today stats for workspace header
  const todayReports = reports.filter((r) => r.date === filterDate);
  const totalReportsInspected = todayReports.reduce((s, r) => s + r.inspectedQty, 0);
  const totalReportsDefected = todayReports.reduce((s, r) => s + r.defectQty, 0);
  const averageQualityRate = totalReportsInspected > 0 ? (totalReportsDefected / totalReportsInspected) * 100 : 0;

  // 10. Main Panel App Canvas
  return (
    <div id="iqc-app-root" className="min-h-screen flex flex-col md:flex-row bg-neutral-50 text-neutral-950 dark:bg-zinc-950 dark:text-zinc-100 transition-colors duration-150">
      
      {/* LEFT SIDEBAR (No-print wrapper) */}
      <aside className="w-full md:w-64 bg-neutral-950 border-r border-neutral-900 text-neutral-400 flex flex-col shrink-0 no-print font-sans">
        
        {/* Brand details */}
        <div className="p-5 border-b border-neutral-900 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-neutral-900 text-white rounded border border-neutral-800 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-450" />
              </div>
              <div>
                <h2 className="text-xs font-mono font-bold tracking-wider text-white">{t.brandName}</h2>
                <span className="text-[9px] text-neutral-500 font-mono tracking-widest block font-bold">{t.brandTagline}</span>
              </div>
            </div>

            {/* Elegant Dark mode toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-1.5 rounded text-neutral-500 hover:text-white hover:bg-neutral-900 transition border border-transparent hover:border-neutral-800"
              title="Toggle contrast style"
            >
              {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Quick flags row in sidebar */}
          <div className="flex items-center justify-between bg-neutral-900/60 p-1.5 rounded border border-neutral-900 select-none">
            <span className="text-[8px] font-mono font-bold tracking-wider text-neutral-500 uppercase">LANG:</span>
            <div className="flex gap-1">
              <button
                onClick={() => setLang("vi")}
                className={`px-1.5 py-0.5 text-[9px] font-bold font-mono rounded transition-colors ${lang === "vi" ? "bg-white text-neutral-950" : "text-neutral-400 hover:text-white"}`}
              >
                🇻🇳 VI
              </button>
              <button
                onClick={() => setLang("en")}
                className={`px-1.5 py-0.5 text-[9px] font-bold font-mono rounded transition-colors ${lang === "en" ? "bg-white text-neutral-950" : "text-neutral-400 hover:text-white"}`}
              >
                🇺🇸 EN
              </button>
              <button
                onClick={() => setLang("zh")}
                className={`px-1.5 py-0.5 text-[9px] font-bold font-mono rounded transition-colors ${lang === "zh" ? "bg-white text-neutral-950" : "text-neutral-400 hover:text-white"}`}
              >
                🇨🇳 中
              </button>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="p-4 bg-neutral-900/30 border-b border-neutral-900/60 flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-neutral-900 border border-neutral-800 flex items-center justify-center text-xs text-neutral-200 font-mono font-bold uppercase shrink-0">
            {session.username.slice(0, 2)}
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-semibold text-neutral-200 truncate leading-none mb-1 font-sans">
              {session.displayName}
            </h4>
            <span className="text-[9px] text-neutral-500 font-mono tracking-wider uppercase bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800/40">
              {session.role === "admin" ? "SUPER USER" : "INLINE OPERATOR"}
            </span>
          </div>
        </div>

        {/* Sidebar Nav buttons */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-left text-xs font-mono tracking-tight transition ${
              activeTab === "dashboard"
                ? "bg-neutral-900 text-white border border-neutral-800"
                : "border border-transparent hover:border-neutral-900 hover:text-white"
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5 shrink-0" /> {t.tabDashboard.toUpperCase()}
          </button>

          <button
            onClick={() => setActiveTab("staff")}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-left text-xs font-mono tracking-tight transition ${
              activeTab === "staff"
                ? "bg-neutral-900 text-white border border-neutral-800"
                : "border border-transparent hover:border-neutral-900 hover:text-white"
            }`}
          >
            <Users className="w-3.5 h-3.5 shrink-0" /> {t.tabStaff.toUpperCase()}
          </button>

          <button
            onClick={() => setActiveTab("defects")}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-left text-xs font-mono tracking-tight transition ${
              activeTab === "defects"
                ? "bg-neutral-900 text-white border border-neutral-800"
                : "border border-transparent hover:border-neutral-900 hover:text-white"
            }`}
          >
            <Settings2 className="w-3.5 h-3.5 shrink-0" /> {t.tabDefects.toUpperCase()}
          </button>

          <button
            onClick={() => setActiveTab("reporting")}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-left text-xs font-mono tracking-tight transition ${
              activeTab === "reporting"
                ? "bg-neutral-900 text-white border border-neutral-800"
                : "border border-transparent hover:border-neutral-900 hover:text-white"
            }`}
          >
            <Edit3 className="w-3.5 h-3.5 shrink-0" /> {lang === "vi" ? "FORM GHI SỰ CỐ" : lang === "en" ? "INCIDENT FORM" : "故障填报表单"}
          </button>

          <button
            onClick={() => setActiveTab("records")}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-left text-xs font-mono tracking-tight transition ${
              activeTab === "records"
                ? "bg-neutral-900 text-white border border-neutral-800"
                : "border border-transparent hover:border-neutral-900 hover:text-white"
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 shrink-0" /> {lang === "vi" ? "NHẬT KÝ SỰ CỐ CA" : lang === "en" ? "DAILY SHIFT LOGS" : "值班故障日志"}
          </button>

          <button
            onClick={() => setActiveTab("analytics")}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-left text-xs font-mono tracking-tight transition ${
              activeTab === "analytics"
                ? "bg-neutral-900 text-white border border-neutral-800"
                : "border border-transparent hover:border-neutral-900 hover:text-white"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 shrink-0" /> {t.tabAnalytics.toUpperCase()}
          </button>

          <button
            onClick={() => setActiveTab("export")}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-left text-xs font-mono tracking-tight transition ${
              activeTab === "export"
                ? "bg-neutral-900 text-white border border-neutral-800"
                : "border border-transparent hover:border-neutral-900 hover:text-white"
            }`}
          >
            <Download className="w-3.5 h-3.5 shrink-0" /> {t.tabExport.toUpperCase()}
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-left text-xs font-mono tracking-tight transition ${
              activeTab === "settings"
                ? "bg-neutral-900 text-white border border-neutral-800"
                : "border border-transparent hover:border-neutral-900 hover:text-white"
            }`}
          >
            <Settings className="w-3.5 h-3.5 shrink-0" /> {t.tabSettings.toUpperCase()}
          </button>
        </nav>

        {/* Exporter shortcut widget */}
        <div className="p-3 mx-3 mb-3 bg-neutral-900/40 rounded border border-neutral-800 flex flex-col gap-2">
          <span className="text-[9px] text-neutral-450 font-mono block text-center uppercase tracking-widest">PORTABLE DEPLOY</span>
          <button
            onClick={handleDownloadStandaloneHTML}
            className="w-full py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded text-xs font-mono font-semibold transition flex items-center justify-center gap-1.5 border border-neutral-700 hover:border-neutral-600"
          >
            <FileText className="w-3 h-3" /> Standalone HTML
          </button>
        </div>

        {/* Sign Out block */}
        <div className="p-3 border-t border-neutral-900">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded text-left text-xs font-mono text-red-400 hover:bg-red-950/20 hover:text-red-300 transition"
          >
            <LogOut className="w-3.5 h-3.5" /> {t.logout.toUpperCase()}
          </button>
        </div>
      </aside>

      {/* CORE CANVAS COMPARTMENT */}
      <main className="flex-1 p-6 md:p-8 max-h-screen overflow-y-auto no-print space-y-6">

        {/* Global Tab Content display condition */}
        {activeTab === "dashboard" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Header Title with quick metrics */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-neutral-200 dark:border-zinc-800 pb-5 gap-3">
              <div>
                <h1 className="text-lg font-bold text-neutral-900 dark:text-zinc-50 tracking-tight">{t.dashTitle}</h1>
                <p className="text-xs text-neutral-500 dark:text-zinc-400 font-sans mt-0.5">{t.dashSubtitle}</p>
              </div>

              {/* Date controller tool */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-500 font-mono whitespace-nowrap">{t.dashSelectDate}:</span>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="px-3 py-1.5 border border-neutral-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-900 dark:text-zinc-100 text-xs font-mono font-medium focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Render direct dynamic graphics view */}
            <DashboardCharts
              reports={reports.filter((r) => r.date === filterDate)}
              defectTypes={defectTypes}
              allReports={reports}
              selectedDate={filterDate}
            />

            {/* Actions Panel */}
            <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-lg p-5">
              <h3 className="font-mono text-[10px] font-bold uppercase text-neutral-400 tracking-wider mb-4">{t.quickActions}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                  onClick={() => setActiveTab("reporting")}
                  className="p-4 bg-neutral-50 hover:bg-neutral-100 dark:bg-zinc-950/40 dark:hover:bg-zinc-900 rounded border border-neutral-200 dark:border-zinc-800 transition flex flex-col items-center justify-center gap-2 text-center"
                >
                  <Edit3 className="w-4 h-4 text-neutral-700 dark:text-zinc-300" />
                  <span className="text-xs font-mono font-medium">{t.recordIncident}</span>
                </button>
                <button
                  onClick={() => setActiveTab("export")}
                  className="p-4 bg-neutral-50 hover:bg-neutral-100 dark:bg-zinc-950/40 dark:hover:bg-zinc-900 rounded border border-neutral-200 dark:border-zinc-800 transition flex flex-col items-center justify-center gap-2 text-center"
                >
                  <Printer className="w-4 h-4 text-neutral-700 dark:text-zinc-300" />
                  <span className="text-xs font-mono font-medium">{t.printIncident}</span>
                </button>
                <button
                  onClick={handleExportExcel}
                  className="p-4 bg-neutral-50 hover:bg-neutral-100 dark:bg-zinc-950/40 dark:hover:bg-zinc-900 rounded border border-neutral-200 dark:border-zinc-800 transition flex flex-col items-center justify-center gap-2 text-center"
                >
                  <FileSpreadsheet className="w-4 h-4 text-neutral-700 dark:text-zinc-300" />
                  <span className="text-xs font-mono font-medium">{t.downloadLogs}</span>
                </button>
                <button
                  onClick={() => setActiveTab("staff")}
                  className="p-4 bg-neutral-50 hover:bg-neutral-100 dark:bg-zinc-950/40 dark:hover:bg-zinc-900 rounded border border-neutral-200 dark:border-zinc-800 transition flex flex-col items-center justify-center gap-2 text-center"
                >
                  <Activity className="w-4 h-4 text-neutral-700 dark:text-zinc-300" />
                  <span className="text-xs font-mono font-medium">{t.orgStaff}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STAFF SECTION */}
        {activeTab === "staff" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-200 dark:border-zinc-800 pb-4">
              <div>
                <h1 className="text-lg font-bold tracking-tight uppercase">{t.staffTitle}</h1>
                <p className="text-xs text-neutral-500 dark:text-zinc-400 font-sans mt-0.5">{t.staffSubtitle}</p>
              </div>
              <button
                onClick={() => setActivePrintJob({ type: "org-chart", date: filterDate })}
                className="flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-mono text-xs font-bold shadow-sm transition self-start sm:self-auto uppercase tracking-wide cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{lang === "vi" ? "In Sơ Đồ & Nhân Sự (PDF)" : lang === "en" ? "Print Chart & Staff (PDF)" : "打印架构与人员 (PDF)"}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              
              {/* Personnel table */}
              <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-lg p-5 xl:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-mono text-[10px] font-bold uppercase text-neutral-400 tracking-wider">
                    {lang === "vi" ? "Hồ sơ nhân sự" : lang === "en" ? "Personnel Profiles" : "质检团队档案"} ({staffList.length})
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-neutral-50 dark:bg-zinc-950/40 text-neutral-400 border-b border-neutral-200 dark:border-zinc-850 font-mono text-[10px] uppercase">
                        <th className="p-3 text-center w-8">{lang === "vi" ? "STT" : lang === "en" ? "Index" : "序号"}</th>
                        <th className="p-3">{t.staffNameLabel}</th>
                        <th className="p-3">{lang === "vi" ? "Chức Vụ" : lang === "en" ? "Position" : "职务"}</th>
                        <th className="p-3">{t.staffDeptLabel}</th>
                        <th className="p-3">{t.staffReportsToLabel}</th>
                        {session?.role === "admin" && (
                          <th className="p-3 text-center">{lang === "vi" ? "Tùy Sửa" : lang === "en" ? "Actions" : "业务操作"}</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {staffList.map((s, idx) => (
                        <tr key={s.id} className="hover:bg-neutral-50/50 dark:hover:bg-zinc-950/40 border-b border-neutral-100 dark:border-zinc-850">
                          <td className="p-3 text-center text-neutral-400 font-mono">{idx + 1}</td>
                          <td className="p-3 font-semibold text-neutral-900 dark:text-zinc-150">{s.name}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-semibold uppercase border ${
                              s.role === 'Director' ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-955/20 dark:text-amber-400 dark:border-amber-800/30' :
                              s.role === 'Manager' ? 'bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-955/20 dark:text-indigo-400 dark:border-indigo-800/30' :
                              s.role === 'QC Leader' ? 'bg-teal-50 text-teal-800 border-teal-200 dark:bg-teal-955/20 dark:text-teal-400 dark:border-teal-800/30' :
                              'bg-neutral-100 text-neutral-700 border-neutral-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700'
                            }`}>{getRoleTranslation(s.role)}</span>
                          </td>
                          <td className="p-3 text-neutral-600 dark:text-zinc-400 font-mono text-[11px]">{s.role === 'Director' || s.role === 'Manager' ? '-' : getDeptTranslation(s.department)}</td>
                          <td className="p-3 text-neutral-450 font-mono text-[11px]">
                            {s.reportsTo ? getQCName(s.reportsTo) : "-"}
                          </td>
                          {session?.role === "admin" && (
                            <td className="p-3 text-center space-x-2 font-mono text-[11px]">
                              <button
                                onClick={() => handleEditStaff(s)}
                                className="text-neutral-900 dark:text-zinc-100 hover:underline font-medium select-none"
                              >
                                {mt("Sửa", "编辑", "Edit")}
                              </button>
                              <button
                                onClick={() => handleDeleteStaff(s.id)}
                                className="text-red-650 hover:text-red-500 hover:underline font-medium select-none"
                              >
                                {mt("Xóa", "删除", "Delete")}
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Form staff edit */}
              <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-lg p-5 h-fit space-y-4">
                {session?.role !== "admin" ? (
                  <div className="space-y-4 font-sans text-xs">
                    <h4 className="font-mono text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400 tracking-wider">
                      {mt("Chế Độ Chỉ Xem", "只读模式", "Read-Only Mode")}
                    </h4>
                    <p className="text-stone-500 dark:text-zinc-450 leading-relaxed">
                      {mt(
                        "Tài khoản admin2 (QC Trưởng nhóm) không có quyền cập nhật hồ sơ, chỉnh sửa sơ đồ nhân sự hoặc thay đổi luồng công trình.",
                        "您的（admin2）管理员账户无权对组织架构、员工数据库以及质检规则进行写入或修缮更改。",
                        "The admin2 (QC Lead) profile does not have administrative rights to modify the personnel structure, staff cards or system parameters."
                      )}
                    </p>
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded border border-amber-250 dark:border-amber-900/30 text-amber-800 dark:text-amber-400 font-mono text-[11px] leading-relaxed">
                      {mt(
                        "🔐 Vui lòng đăng nhập bằng tài khoản admin (Cấp Tối Cao) để chỉnh sửa.",
                        "🔐 请以 admin 身份登录以进行配置性操作。",
                        "🔐 Please log in as 'admin' (Supreme Authority) to apply administrative changes."
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <h3 className="font-mono text-[10px] font-bold uppercase text-neutral-400 tracking-wider">
                        {editingStaffId ? t.staffFormEdit : t.staffFormAdd}
                      </h3>
                  {editingStaffId && (
                    <button
                      onClick={() => {
                        setEditingStaffId(null);
                        setStaffName("");
                        setStaffRole("QC Inline");
                        setStaffDept("Kho");
                        setStaffReportsTo("");
                      }}
                      className="text-[10px] font-mono text-red-500 font-bold hover:underline"
                    >
                      {t.actionCancel.toUpperCase()}
                    </button>
                  )}
                </div>

                <form onSubmit={handleSaveStaff} className="space-y-4 text-xs font-sans">
                  <div className="space-y-1">
                    <label className="font-mono uppercase text-[9px] text-neutral-400 tracking-wider block">{t.staffNameLabel}</label>
                    <input
                      type="text"
                      required
                      placeholder={t.staffNamePlaceholder}
                      value={staffName}
                      onChange={(e) => setStaffName(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono border border-neutral-250 dark:border-zinc-850 rounded bg-white dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-zinc-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-mono uppercase text-[9px] text-neutral-400 tracking-wider block">{t.staffRoleLabel}</label>
                    <select
                      value={staffRole}
                      onChange={(e) => setStaffRole(e.target.value as RoleType)}
                      className="w-full px-3 py-2 text-xs font-mono border border-neutral-250 dark:border-zinc-850 rounded bg-white dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-zinc-400"
                    >
                      <option value="QC Inline">{t.roleQcInline}</option>
                      <option value="QC Leader">{t.roleQcLeader}</option>
                      <option value="Manager">{t.roleManager}</option>
                      <option value="Director">{t.roleDirector}</option>
                    </select>
                  </div>

                  {staffRole !== "Director" && staffRole !== "Manager" ? (
                    <div className="space-y-1">
                      <label className="font-mono uppercase text-[9px] text-neutral-400 tracking-wider block">{t.staffDeptLabel}</label>
                      <select
                        value={staffDept}
                        onChange={(e) => setStaffDept(e.target.value as DepartmentType)}
                        className="w-full px-3 py-2 text-xs font-mono border border-neutral-250 dark:border-zinc-850 rounded bg-white dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-zinc-400"
                      >
                        <option value="Kho">{t.deptWarehouse}</option>
                        <option value="Sơ chế">{t.deptPrep}</option>
                        <option value="Tinh chế">{t.deptRefine}</option>
                        <option value="Lắp ráp">{t.deptAssembly}</option>
                        <option value="Sơn">{t.deptPaint}</option>
                        <option value="Đóng gói">{t.deptPackaging}</option>
                        <option value="Lên Cont">{t.deptLoading}</option>
                      </select>
                    </div>
                  ) : (
                    <div className="space-y-1 opacity-60">
                      <label className="font-mono uppercase text-[9px] text-neutral-400 tracking-wider block">{t.staffDeptLabel}</label>
                      <input
                        type="text"
                        disabled
                        value={mt("Không yêu cầu bộ phận", "无需指定生产部门", "No department needed")}
                        className="w-full px-3 py-2 text-xs font-mono border border-neutral-200 dark:border-zinc-800 rounded bg-stone-50 dark:bg-zinc-900 focus:outline-none text-neutral-500"
                      />
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="font-mono uppercase text-[9px] text-neutral-400 tracking-wider block">{t.staffReportsToLabel}</label>
                    <select
                      value={staffReportsTo}
                      onChange={(e) => setStaffReportsTo(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono border border-neutral-250 dark:border-zinc-850 rounded bg-white dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-zinc-400"
                    >
                      <option value="">{t.staffNoReportsTo}</option>
                      {staffList
                        .filter((s) => s.id !== editingStaffId)
                        .map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({getRoleTranslation(s.role)})
                          </option>
                        ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-neutral-900 hover:bg-neutral-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-semibold text-xs rounded uppercase tracking-wider transition"
                  >
                    {editingStaffId ? t.actionSave.toUpperCase() : t.actionAdd.toUpperCase()}
                  </button>
                </form>
                </>
                )}
              </div>
            </div>

            {/* Tree Org CHART render */}
            <OrgChart
              staffList={staffList}
              onEdit={session?.role === "admin" ? handleEditStaff : undefined}
              lang={lang}
              getDeptTranslation={getDeptTranslation}
              getRoleTranslation={getRoleTranslation}
            />
          </div>
        )}

        {/* DEFECT CONFIG SECTION */}
        {activeTab === "defects" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div>
              <h1 className="text-lg font-bold tracking-tight uppercase">{t.defectsTitle}</h1>
              <p className="text-xs text-neutral-500 dark:text-zinc-400 font-sans mt-0.5">{t.defectsSubtitle}</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              
              <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-lg p-5 xl:col-span-2 space-y-4">
                <h3 className="font-mono text-[10px] font-bold uppercase text-neutral-400 tracking-wider">
                  {mt("Danh mục lỗi hiện hành", "当前有效缺陷库", "Active Defect Codes")} ({defectTypes.length})
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-neutral-50 dark:bg-zinc-950/40 text-neutral-400 border-b border-neutral-200 dark:border-zinc-850 font-mono text-[10px] uppercase">
                        <th className="p-3 text-center w-8">{mt("STT", "序号", "Index")}</th>
                        <th className="p-3">{mt("Tên & Phân Nhóm Lỗi", "缺陷名称与分组", "Defect Name & Group")}</th>
                        <th className="p-3">{mt("Bộ Phận Áp Dụng", "适用部门", "Department")}</th>
                        <th className="p-3">{t.defectsDescLabel}</th>
                        {session?.role === "admin" && (
                          <th className="p-3 text-center">{mt("Tác Vụ", "业务操作", "Actions")}</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {defectTypes.map((df, index) => (
                        <tr key={df.id} className="hover:bg-neutral-50/50 dark:hover:bg-zinc-950/40 border-b border-neutral-100 dark:border-zinc-850">
                          <td className="p-3 text-center font-mono text-neutral-400">{index + 1}</td>
                          <td className="p-3 font-semibold text-neutral-900 dark:text-zinc-150">{df.name}</td>
                          <td className="p-3 text-neutral-600 dark:text-zinc-400">
                            <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-neutral-100 text-neutral-700 border border-neutral-200/50 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700">
                              {getDeptTranslation(df.department)}
                            </span>
                          </td>
                          <td className="p-3 text-neutral-500 dark:text-zinc-455 leading-relaxed truncate max-w-xs">{df.description}</td>
                          {session?.role === "admin" && (
                            <td className="p-3 text-center space-x-2 font-mono text-[11px]">
                              <button
                                onClick={() => handleEditDefect(df)}
                                className="text-neutral-900 dark:text-zinc-100 hover:underline font-medium select-none"
                              >
                                {mt("Sửa", "编辑", "Edit")}
                              </button>
                              <button
                                onClick={() => handleDeleteDefect(df.id)}
                                className="text-red-500 hover:text-red-400 hover:underline font-medium select-none"
                              >
                                {mt("Xóa", "删除", "Delete")}
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Form editing */}
              <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-lg p-5 h-fit space-y-4">
                {session?.role !== "admin" ? (
                  <div className="space-y-4 font-sans text-xs">
                    <h4 className="font-mono text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400 tracking-wider">
                      {mt("Chế Độ Chỉ Xem", "只读模式", "Read-Only Mode")}
                    </h4>
                    <p className="text-stone-500 dark:text-zinc-455 leading-relaxed">
                      {mt(
                        "Tài khoản admin2 (QC Trưởng nhóm) không có quyền cập nhật, sửa đổi danh mục lỗi kỹ thuật hoặc quy chuẩn luồng lỗi. Vui lòng liên hệ Giám đốc (admin) để điều chỉnh.",
                        "您的（admin2）管理员账户无权对生产故障缺陷库以及流程规范进行更改。如需管理，请以超级管理员 (admin) 身份重登。",
                        "The admin2 (QC Lead) profile is not authorized to define, edit, or configure defect categories or process rules. Please contact 'admin' to proceed."
                      )}
                    </p>
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded border border-amber-250 dark:border-amber-900/30 text-amber-800 dark:text-amber-400 font-mono text-[11px] leading-relaxed">
                      {mt(
                        "🔐 Đăng nhập bằng tài khoản admin để sửa đổi danh mục phân lỗi kĩ thuật.",
                        "🔐 请使用 admin 凭证登入以修改缺陷指标。",
                        "🔐 Log in with 'admin' credentials to configure technical parameters."
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <h3 className="font-mono text-[10px] font-bold uppercase text-neutral-400 tracking-wider">
                        {editingDefectId ? t.defectsFormEdit : t.defectsFormAdd}
                      </h3>
                      {editingDefectId && (
                        <button
                          onClick={() => {
                            setEditingDefectId(null);
                            setDefectName("");
                            setDefectDept("Tất cả");
                            setDefectDesc("");
                          }}
                          className="text-[10px] font-mono text-red-500 font-bold hover:underline"
                        >
                          {t.actionCancel.toUpperCase()}
                        </button>
                      )}
                    </div>

                    <form onSubmit={handleSaveDefect} className="space-y-4 text-xs font-sans">
                      <div className="space-y-1">
                        <label className="font-mono uppercase text-[9px] text-neutral-400 tracking-wider block">{t.defectsNameLabel}</label>
                        <input
                          type="text"
                          required
                          placeholder={t.defectsNamePlaceholder}
                          value={defectName}
                          onChange={(e) => setDefectName(e.target.value)}
                          className="w-full px-3 py-2 text-xs font-mono border border-neutral-250 dark:border-zinc-850 rounded bg-white dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-zinc-400"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-mono uppercase text-[9px] text-neutral-400 tracking-wider block">{t.defectsDeptLabel}</label>
                        <select
                          value={defectDept}
                          onChange={(e) => setDefectDept(e.target.value as any)}
                          className="w-full px-3 py-2 text-xs font-mono border border-neutral-250 dark:border-zinc-850 rounded bg-white dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-zinc-400"
                        >
                          <option value="Tất cả">{mt("Áp Dụng Cho Tất Cả Bộ Phận", "适用于所有部门", "Apply to All Departments")}</option>
                          <option value="Kho">{t.deptWarehouse}</option>
                          <option value="Sơ chế">{t.deptPrep}</option>
                          <option value="Tinh chế">{t.deptRefine}</option>
                          <option value="Lắp ráp">{t.deptAssembly}</option>
                          <option value="Sơn">{t.deptPaint}</option>
                          <option value="Đóng gói">{t.deptPackaging}</option>
                          <option value="Lên Cont">{t.deptLoading}</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="font-mono uppercase text-[9px] text-neutral-400 tracking-wider block">{t.defectsDescLabel}</label>
                        <textarea
                          rows={3}
                          placeholder={t.defectsDescPlaceholder}
                          value={defectDesc}
                          onChange={(e) => setDefectDesc(e.target.value)}
                          className="w-full px-3 py-2 text-xs font-mono border border-neutral-250 dark:border-zinc-850 rounded bg-white dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-zinc-400"
                        ></textarea>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 bg-neutral-900 hover:bg-neutral-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-semibold text-xs rounded uppercase tracking-wider transition"
                      >
                        {editingDefectId ? t.actionSave.toUpperCase() : t.actionAdd.toUpperCase()}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
               {/* DAILY REPORTING FORM */}
        {activeTab === "reporting" && (
          <div className="space-y-6 animate-in fade-in duration-150 max-w-3xl mx-auto font-sans">
            <div className="text-center">
              <h1 className="text-lg font-bold uppercase tracking-tight">
                {mt("Khai Báo Sự Cố Phát Hiện Lỗi", "登记缺陷异常事件", "Report Quality Incident")}
              </h1>
              <p className="text-xs text-neutral-500 dark:text-zinc-400 mt-1">
                {mt(
                  "QC Inline thực hiện nhập sản lượng kiểm định của từng line trong ca trực.",
                  "现场质检人员在此输入班次抽检基数、缺陷样品数量和实地实物照片。",
                  "On-duty QC inspectors submit specimen count, defect logs, and evidence photos here."
                )}
              </p>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-lg p-6 sm:p-8">
              <form onSubmit={handleSaveReport} className="space-y-5 text-xs">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <label className="font-mono uppercase text-[9px] text-neutral-450 tracking-wider block">{t.formShiftDate}</label>
                    <input
                      type="date"
                      required
                      value={repDate}
                      onChange={(e) => setRepDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono border border-neutral-250 dark:border-zinc-850 rounded bg-white dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-zinc-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-mono uppercase text-[9px] text-neutral-450 tracking-wider block">{t.formQcOnDuty}</label>
                    <select
                      value={repQCId}
                      onChange={(e) => handleQCSelectChange(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono border border-neutral-250 dark:border-zinc-850 rounded bg-white dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-zinc-400"
                    >
                      {staffList
                        .filter((s) => s.role === "QC Inline" || s.role === "QC Leader")
                        .map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({getRoleTranslation(s.role)} - Dept {getDeptTranslation(s.department)})
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <label className="font-mono uppercase text-[9px] text-neutral-450 tracking-wider block">{t.defectsDeptLabel}</label>
                    <select
                      value={repDept}
                      onChange={(e) => setRepDept(e.target.value as DepartmentType)}
                      className="w-full px-3 py-2 text-xs font-mono border border-neutral-250 dark:border-zinc-850 rounded bg-white dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-zinc-400"
                    >
                      <option value="Kho">{t.deptWarehouse}</option>
                      <option value="Sơ chế">{t.deptPrep}</option>
                      <option value="Tinh chế">{t.deptRefine}</option>
                      <option value="Lắp ráp">{t.deptAssembly}</option>
                      <option value="Sơn">{t.deptPaint}</option>
                      <option value="Đóng gói">{t.deptPackaging}</option>
                      <option value="Lên Cont">{t.deptLoading}</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-mono uppercase text-[9px] text-neutral-450 tracking-wider block">{t.tableDefect}</label>
                    <select
                      value={repDefectId}
                      onChange={(e) => setRepDefectId(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-xs font-mono font-bold border border-neutral-250 dark:border-zinc-850 rounded bg-white dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-zinc-400"
                    >
                      {defectTypes
                        .filter((dt) => dt.department === repDept || dt.department === "Tất cả")
                        .map((dt) => (
                          <option key={dt.id} value={dt.id}>
                            {dt.name}
                          </option>
                        ))}
                      {defectTypes.filter((dt) => dt.department === repDept || dt.department === "Tất cả").length === 0 && (
                        <option value="">{mt("-- Chưa định nghĩa lỗi cho Dept này (Chọn Tất Cả) --", "-- 该生产环节尚无专属缺陷 (请选通用) --", "-- No defect types resolved for this Dept (Choose All) --")}</option>
                      )}
                    </select>
                  </div>
                </div>

                {/* Severity levels radio options */}
                <div className="space-y-2">
                  <label className="font-mono uppercase text-[9px] text-neutral-405 tracking-wider block">{t.formSeverity}</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {(["Nặng", "Vừa", "Nhẹ", "Chấp nhận"] as SeverityType[]).map((label) => {
                      let colorClass = "border-neutral-200 dark:border-zinc-800 text-neutral-600 dark:text-zinc-400 hover:bg-neutral-50 dark:hover:bg-zinc-950/40";
                      if (repSeverity === label) {
                        if (label === "Nặng") {
                          colorClass = "border-red-650 bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/55";
                        } else if (label === "Vừa") {
                          colorClass = "border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-805/55";
                        } else if (label === "Nhẹ") {
                          colorClass = "border-yellow-600 bg-yellow-50 text-yellow-800 dark:bg-yellow-950/20 dark:text-yellow-400 dark:border-yellow-700/55";
                        } else {
                          colorClass = "border-emerald-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800/55";
                        }
                      }
                      return (
                        <label
                          key={label}
                          className={`p-3 border rounded text-center block cursor-pointer transition font-mono font-semibold text-[11px] ${colorClass}`}
                        >
                          <input
                            type="radio"
                            name="severity"
                            checked={repSeverity === label}
                            onChange={() => setRepSeverity(label)}
                            className="hidden"
                          />
                          <span>{getSeverityTranslation(label)}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <label className="font-mono uppercase text-[9px] text-neutral-450 tracking-wider block">{t.formInspectedQty}</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={repInspectedQty}
                      onChange={(e) => setRepInspectedQty(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 text-xs font-mono border border-neutral-250 dark:border-zinc-850 rounded bg-white dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-zinc-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-mono uppercase text-[9px] text-neutral-450 tracking-wider block">{t.formDefectQty}</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={repDefectQty}
                      onChange={(e) => setRepDefectQty(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 text-xs font-mono border border-neutral-250 dark:border-zinc-850 rounded bg-white dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-zinc-400 text-red-600 dark:text-red-400 font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-mono uppercase text-[9px] text-neutral-450 tracking-wider block">{t.formDescription}</label>
                  <textarea
                    rows={3}
                    placeholder={t.formDescPlaceholder}
                    value={repDesc}
                    onChange={(e) => setRepDesc(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono border border-neutral-250 dark:border-zinc-850 rounded bg-white dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-zinc-400"
                  ></textarea>
                </div>

                {/* Evidence attachment drag select */}
                <div className="space-y-2">
                  <label className="font-mono uppercase text-[9px] text-neutral-450 tracking-wider block">{t.formEvidence}</label>
                  <div className="border border-dashed border-neutral-250 dark:border-zinc-850 rounded bg-white dark:bg-zinc-950 p-6 flex flex-col items-center justify-center relative hover:bg-neutral-50 dark:hover:bg-zinc-950/40 transition cursor-pointer">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoSelect}
                      disabled={repImages.length >= 3}
                      className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                    <Camera className="w-6 h-6 text-neutral-400 mb-2" />
                    <span className="text-xs font-mono font-medium text-neutral-500 dark:text-zinc-400">{t.formEvidenceDragDrop}</span>
                    <span className="text-[10px] font-mono text-neutral-400 mt-1">
                      {mt("Dạng JPG/PNG lưu dạng base64 an toàn ở Cache", "支持JPG/PNG格式，作为Base64内嵌安全存储", "Formats: JPG/PNG, safely embedded as Base64")}
                    </span>
                  </div>

                  {/* Attachment Previews */}
                  {repImages.length > 0 ? (
                    <div className="flex gap-4 flex-wrap pt-2">
                      {repImages.map((img, idx) => (
                        <div key={idx} className="relative group w-20 h-20 border border-neutral-200 dark:border-zinc-800 rounded overflow-hidden shadow-sm">
                          <img src={img} alt="Evidence thumbnail" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(idx)}
                            className="absolute top-1 right-1 bg-red-600/80 hover:bg-red-600 text-white rounded-full p-1 transition"
                            title="Remove photo"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] font-mono text-neutral-400">
                      {mt("Chưa đính kèm bất kỳ hình ảnh nào.", "尚未附带任何现场实证图片。", "No evidence photos attached yet.")}
                    </p>
                  )}
                </div>

                <div className="flex gap-3 pt-4 border-t border-neutral-150 dark:border-zinc-850">
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-neutral-900 hover:bg-neutral-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-bold text-xs rounded uppercase tracking-wider transition duration-150"
                  >
                    {t.formSubmitAdd.toUpperCase()}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRepInspectedQty(100);
                      setRepDefectQty(0);
                      setRepDesc("");
                      setRepImages([]);
                    }}
                    className="px-5 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 font-bold text-xs rounded uppercase tracking-wider dark:bg-zinc-800 dark:text-zinc-300 transition duration-150"
                  >
                    {t.actionReset.toUpperCase()}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* RECORDS LOGS DISPLAY */}
        {activeTab === "records" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Header titles */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-4 border-neutral-200 dark:border-zinc-850 gap-3">
              <div>
                <h1 className="text-lg font-bold uppercase tracking-tight">{t.shiftLogsTitle}</h1>
                <p className="text-xs text-neutral-500 dark:text-zinc-400">{t.shiftLogsSubtitle}</p>
              </div>

              <div className="flex items-center gap-2 select-none font-mono">
                <button
                  onClick={handleExportExcel}
                  className="flex items-center gap-2 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 text-[11px] font-bold rounded uppercase tracking-wider transition duration-150"
                  title="Export live logs as CSV for Excel spreadsheets"
                >
                  <FileSpreadsheet className="w-4 h-4" /> {t.exportExcelButton}
                </button>
              </div>
            </div>

            {/* Advanced Multi-filters Area */}
            <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-lg p-5 space-y-4">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-neutral-400 tracking-wider border-b border-neutral-100 dark:border-zinc-850 pb-2">
                <Filter className="w-4 h-4 text-neutral-400" />
                <span>{mt("Bộ lọc phân tích chéo nhanh:", "多维快速交叉筛选:", "Quick Cross Filters:")}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-sans">
                {/* Date */}
                <div className="space-y-1">
                  <span className="font-mono uppercase text-[9px] text-neutral-400 tracking-wider block">{t.shiftLogsFilterByDate}</span>
                  <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono border border-neutral-250 dark:border-zinc-850 rounded bg-white dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-zinc-400"
                  />
                </div>

                {/* QC Inspector */}
                <div className="space-y-1">
                  <span className="font-mono uppercase text-[9px] text-neutral-400 tracking-wider block">{t.shiftLogsFilterByQc}</span>
                  <select
                    value={filterQC}
                    onChange={(e) => setFilterQC(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono border border-neutral-250 dark:border-zinc-850 rounded bg-white dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-zinc-400"
                  >
                    <option value="all">{mt("Tất cả nhân viên QC", "所有质检人员", "All QC Inspectors")}</option>
                    {staffList
                      .filter((s) => s.role === "QC Inline" || s.role === "QC Leader")
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Department */}
                <div className="space-y-1">
                  <span className="font-mono uppercase text-[9px] text-neutral-400 tracking-wider block">{t.shiftLogsFilterByDept}</span>
                  <select
                    value={filterDept}
                    onChange={(e) => setFilterDept(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono border border-neutral-250 dark:border-zinc-850 rounded bg-white dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-zinc-400"
                  >
                    <option value="all">{mt("Tất cả Bộ phận", "所有部门", "All Departments")}</option>
                    <option value="Kho">{t.deptWarehouse}</option>
                    <option value="Sơ chế">{t.deptPrep}</option>
                    <option value="Tinh chế">{t.deptRefine}</option>
                    <option value="Lắp ráp">{t.deptAssembly}</option>
                    <option value="Sơn">{t.deptPaint}</option>
                    <option value="Đóng gói">{t.deptPackaging}</option>
                    <option value="Lên Cont">{t.deptLoading}</option>
                  </select>
                </div>

                {/* Defect Name */}
                <div className="space-y-1">
                  <span className="font-mono uppercase text-[9px] text-neutral-400 tracking-wider block">{t.shiftLogsFilterByDefect}</span>
                  <select
                    value={filterDefect}
                    onChange={(e) => setFilterDefect(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono border border-neutral-250 dark:border-zinc-850 rounded bg-white dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-zinc-400"
                  >
                    <option value="all">{mt("Tất cả Loại Lỗi", "所有缺陷类型", "All Defect Types")}</option>
                    {defectTypes.map((df) => (
                      <option key={df.id} value={df.id}>
                        {df.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Table logs container */}
            <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-lg p-5 space-y-3">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse font-sans">
                  <thead>
                    <tr className="bg-neutral-50 dark:bg-zinc-950/45 text-neutral-400 border-b border-neutral-200 dark:border-zinc-850 font-mono text-[10px] uppercase">
                      <th className="p-3 text-center w-8">{mt("STT", "序号", "Index")}</th>
                      <th className="p-3">{t.tableQcName}</th>
                      <th className="p-3">{t.tableLine}</th>
                      <th className="p-3 font-semibold text-neutral-700 dark:text-slate-200">{t.tableDefect}</th>
                      <th className="p-3 text-center w-16">{t.tableSeverity}</th>
                      <th className="p-3 text-right">{t.tableInspectedQty}</th>
                      <th className="p-3 text-right text-rose-500 font-bold">{t.tableDefectQty}</th>
                      <th className="p-3 text-right">{t.tableDefectRate}</th>
                      <th className="p-3 text-center">{mt("Bằng chứng", "实物存底", "Evidence")}</th>
                      <th className="p-3 text-center w-28">{t.tableActions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeReportsFiltered.map((r, index) => {
                      const pct = r.inspectedQty > 0 ? (r.defectQty / r.inspectedQty) * 100 : 0;
                      const hasAttachments = r.images && r.images.length > 0;

                      return (
                        <tr key={r.id} className="hover:bg-neutral-50/50 dark:hover:bg-zinc-950/40 border-b border-neutral-100 dark:border-zinc-850">
                          <td className="p-3 text-center text-neutral-400 font-mono">{index + 1}</td>
                          <td className="p-3 font-semibold text-neutral-900 dark:text-zinc-150">{getQCName(r.qcId)}</td>
                          <td className="p-3 text-neutral-600 dark:text-zinc-400">{getDeptTranslation(r.department)}</td>
                          <td className="p-3 font-semibold text-neutral-900 dark:text-zinc-150">{getDefectName(r.defectId)}</td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${getSeverityBadgeClass(r.severity)}`}>
                              {getSeverityTranslation(r.severity)}
                            </span>
                          </td>
                          <td className="p-3 text-right font-mono text-neutral-600 dark:text-zinc-400">{r.inspectedQty}</td>
                          <td className="p-3 text-right font-mono font-bold text-red-650 dark:text-red-400">{r.defectQty}</td>
                          <td className="p-3 text-right font-mono font-bold text-neutral-900 dark:text-zinc-100">
                            {pct.toFixed(2)}%
                          </td>
                          <td className="p-3 text-center">
                            {hasAttachments ? (
                              <span className="text-[10px] font-mono font-bold bg-neutral-100 text-neutral-700 dark:bg-zinc-800 dark:text-zinc-300 border border-neutral-200/50 dark:border-zinc-700 px-2 py-0.5 rounded inline-block">
                                {r.images.length} {mt("ẢNH", "张图", "IMG")}
                              </span>
                            ) : (
                              <span className="text-neutral-400 dark:text-zinc-650 font-mono">-</span>
                            )}
                          </td>
                          <td className="p-3 text-center space-x-2 font-mono text-[11px] select-none">
                            <button
                              onClick={() => setViewingReport(r)}
                              className="text-neutral-900 dark:text-zinc-100 hover:underline font-medium select-none"
                            >
                              {mt("Xem", "详情", "View")}
                            </button>
                            <button
                              onClick={() =>
                                setActivePrintJob({
                                  type: "single",
                                  reportId: r.id,
                                  date: r.date,
                                  })
                              }
                              className="text-neutral-500 hover:text-neutral-900 dark:hover:text-zinc-100 hover:underline font-medium select-none"
                            >
                              {t.printSingleReport}
                            </button>
                            <button
                              onClick={() => handleDeleteReport(r.id)}
                              className="text-red-500 hover:text-red-400 hover:underline font-medium select-none"
                            >
                              {mt("Xóa", "删除", "Delete")}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {activeReportsFiltered.length === 0 && (
                      <tr>
                        <td colSpan={10} className="p-12 text-center text-neutral-450 font-mono">
                          {t.tableEmpty}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* DETAILED STATISTICS PAGE */}
        {activeTab === "analytics" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div>
              <h1 className="text-lg font-bold uppercase tracking-tight">Khu Vực Phân Tích Kỹ Thuật Tổng Sản</h1>
              <p className="text-xs text-neutral-500 dark:text-zinc-400">Bảng kê liên đới sự phân chia rủi ro theo phòng dội và mức độ mốc của ca hằng ngày.</p>
            </div>

            {/* Composite Stats detail layouts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
              
              {/* Popular list */}
              <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 p-5 rounded-lg space-y-4">
                <h3 className="font-mono text-[10px] uppercase text-neutral-450 tracking-wider font-bold">Top các lỗi xuất hiện nhiều nhất hằng ngày</h3>
                <div className="space-y-4">
                  {defectTypes
                    .map((d) => {
                      const qty = reports.filter((r) => r.defectId === d.id).reduce((s, r) => s + r.defectQty, 0);
                      return { name: d.name, qty, desc: d.description };
                    })
                    .sort((a, b) => b.qty - a.qty)
                    .slice(0, 5)
                    .map((x, idx) => {
                      const maxQty = Math.max(...defectTypes.map((dt) => reports.filter((r) => r.defectId === dt.id).reduce((s, r) => s + r.defectQty, 0)), 1);
                      const barPct = (x.qty / maxQty) * 100;

                      return (
                        <div key={x.name} className="space-y-1 text-xs">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-neutral-900 dark:text-zinc-200">#{idx + 1} {x.name}</span>
                            <span className="text-neutral-500 font-mono text-[11px] font-bold">{x.qty} lỗi</span>
                          </div>
                          <div className="w-full h-1 bg-neutral-100 dark:bg-zinc-850 rounded-none overflow-hidden">
                            <div className="bg-neutral-900 dark:bg-zinc-100 h-full" style={{ width: `${barPct}%` }}></div>
                          </div>
                          <p className="text-[10px] text-neutral-450 italic leading-snug">{x.desc}</p>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Departments percentage */}
              <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 p-5 rounded-lg space-y-4 col-span-2">
                <h3 className="font-mono text-[10px] uppercase text-neutral-450 tracking-wider font-bold">{t.analyticsLossByDept}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {["Kho", "Sơ chế", "Tinh chế", "Lắp ráp", "Sơn", "Đóng gói", "Lên Cont"].map((deptName) => {
                    const matchedReps = reports.filter((r) => r.department === deptName);
                    const dInsp = matchedReps.reduce((s, r) => s + r.inspectedQty, 0);
                    const dDef = matchedReps.reduce((s, r) => s + r.defectQty, 0);
                    const dRate = dInsp > 0 ? (dDef / dInsp) * 100 : 0;

                    return (
                      <div key={deptName} className="p-3 border border-neutral-200 dark:border-zinc-800 rounded space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-neutral-900 dark:text-zinc-100">
                            {mt("Bộ phận", "部门", "Department")} {getDeptTranslation(deptName)}
                          </span>
                          <span className="text-neutral-900 dark:text-zinc-350 font-mono font-bold">
                            {dDef} {mt("lỗi", "缺陷", "defects")} ({dInsp > 0 ? dRate.toFixed(2) : "0.00"}%)
                          </span>
                        </div>
                        <div className="w-full h-1 bg-neutral-100 dark:bg-zinc-850 rounded-none overflow-hidden">
                          <div className="bg-neutral-900 dark:bg-zinc-100 h-full" style={{ width: `${Math.min(dRate * 10, 100)}%` }}></div>
                        </div>
                        <p className="text-[10px] text-neutral-400 font-mono">
                          {mt("Sản lượng kiểm mẫu: ", "已检测样本量: ", "Inspected quantity: ")}
                          {dInsp} {mt("mẫu", "件", "pcs")}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* PRINT & TRICH XUAT BAO CAO */}
        {activeTab === "export" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div>
              <h1 className="text-lg font-bold uppercase tracking-tight">Khu Kết Xuất Tài Liệu</h1>
              <p className="text-xs text-neutral-500 dark:text-zinc-400">Giúp trích xuất biểu mẫu báo cáo tổng hợp và in ấn tài liệu lưu trữ ca kiểm.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
              
              {/* Composite tools */}
              <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-lg p-6 space-y-4">
                <h3 className="font-mono text-[10px] uppercase text-neutral-450 tracking-wider font-bold">Báo cáo Tổng Hợp kíp ca trực</h3>
                <p className="text-xs text-neutral-500 leading-relaxed">Chứa danh sách tất cả biểu lỗi được tập hợp thành một báo cáo hoàn thiện có chữ ký các trưởng phòng ban liên đới.</p>
                
                <div className="flex flex-col gap-2.5 pt-2 font-mono">
                  <button
                    onClick={() => setActivePrintJob({ type: "composite-summary", date: filterDate })}
                    className="flex items-center justify-center gap-2 p-2.5 bg-neutral-900 text-white hover:bg-neutral-850 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200 uppercase tracking-wider text-[11px] font-bold rounded transition duration-150"
                  >
                    <Printer className="w-4 h-4" /> In Báo Cáo Tổng Hợp Hôm Nay (PDF)
                  </button>

                  <button
                    onClick={() => setActivePrintJob({ type: "composite-by-person", date: filterDate })}
                    className="flex items-center justify-center gap-2 p-2.5 border border-neutral-300 hover:border-neutral-400 text-neutral-800 dark:border-zinc-800 dark:text-zinc-200 dark:hover:border-zinc-700 bg-transparent uppercase tracking-wider text-[11px] font-bold rounded transition duration-150"
                  >
                    <Users className="w-4 h-4" /> In Tách Tờ Từng QC Trực Ca (PDF)
                  </button>

                  <button
                    onClick={handleExportExcel}
                    className="flex items-center justify-center gap-2 p-2.5 bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-800 dark:bg-zinc-950 dark:border-zinc-850 dark:text-zinc-300 dark:hover:bg-zinc-900 uppercase tracking-wider text-[11px] font-bold rounded transition duration-150"
                  >
                    <FileSpreadsheet className="w-4 h-4" /> Tải Xuống Bảng Biểu Excel (.csv)
                  </button>
                </div>
              </div>

              {/* Individual Print Breakout table */}
              <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-lg p-5 space-y-4">
                <h3 className="font-mono text-[10px] uppercase text-neutral-450 tracking-wider font-bold">Hồ Sơ Tách Từng Người Trình Biệt</h3>
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {staffList
                    .filter((s) => reports.some((r) => r.qcId === s.id && r.date === filterDate))
                    .map((inspector) => {
                      const count = reports.filter((r) => r.qcId === inspector.id && r.date === filterDate).length;
                      return (
                        <div key={inspector.id} className="flex items-center justify-between p-3 border border-neutral-200 dark:border-zinc-850 rounded bg-white dark:bg-zinc-950 text-xs">
                          <div>
                            <strong className="text-neutral-900 dark:text-zinc-150 font-semibold block">{inspector.name}</strong>
                            <p className="text-[10px] text-neutral-450 font-mono">
                              {mt(`Ghi nhận: ${count} phiếu mẫu`, `共登记: ${count} 笔异常`, `Logged: ${count} reports`)}
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              setActivePrintJob({
                                type: "composite-by-person",
                                date: filterDate,
                              })
                            }
                            className="bg-neutral-100 hover:bg-neutral-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-neutral-900 dark:text-zinc-100 font-mono font-bold text-[10px] px-2.5 py-1 rounded"
                          >
                            {mt("In Tách Tờ", "单独打印", "Print Separately")}
                          </button>
                        </div>
                      );
                    })}

                  {staffList.filter((s) => reports.some((r) => r.qcId === s.id && r.date === filterDate)).length === 0 && (
                    <p className="text-xs text-neutral-450 font-mono py-8 text-center border border-dashed border-neutral-200 dark:border-dashed border-neutral-200 dark:border-zinc-800 rounded">
                      {mt("Hôm nay chưa có QC nào khai báo phiếu lỗi để tách in.", "今日暂无质检员提交质量缺陷报告单。", "No QC inspectors have filed incident reports today.")}
                    </p>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* SYSTEM SETTINGS & RAW BACKUPS */}
        {activeTab === "settings" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div>
              <h1 className="text-lg font-bold uppercase tracking-tight">{t.settingsTitle}</h1>
              <p className="text-xs text-neutral-500 dark:text-zinc-400">{t.settingsSubtitle}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
              
              {/* Backups card */}
              <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-lg p-6 space-y-4">
                <h3 className="font-mono text-[10px] uppercase text-neutral-450 tracking-wider font-bold">
                  {mt("Liên Kết Backup File Dự Phòng (.json)", "系统数据覆盖存档 (.json)", "System Database Backup (.json)")}
                </h3>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  {mt("Xuất toàn bộ hệ thống lưu thành file cứng .json để dự trữ mang sang máy khác dùng offline, hoặc nạp file JSON dự trữ có sẵn lên kíp ca.", "将整个系统运行状态、质检班组人员和缺陷记录备份导出为标准 .json 文件以防丢失，或通过上传备份文件恢复现场系统。", "Export the entire system state as a static JSON backup to transfer or restore from a previously saved JSON state file.")}
                </p>
                
                <div className="flex flex-col gap-3 pt-2 font-mono">
                  <button
                    onClick={handleBackupExport}
                    className="flex items-center justify-center gap-2 p-2.5 bg-neutral-900 hover:bg-neutral-850 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 text-[11px] font-bold rounded uppercase tracking-wider transition duration-150"
                  >
                    <Download className="w-4 h-4" /> {mt("TẢI VỀ FILE (.JSON)", "打包下载系统数据 (.JSON)", "DOWNLOAD BACKUP FILE (.JSON)")}
                  </button>

                  <div className={`border border-dashed border-neutral-250 dark:border-zinc-800 rounded p-4 flex flex-col items-center justify-center bg-neutral-50/50 hover:bg-neutral-50/80 transition relative dark:bg-zinc-950/40 ${session?.role !== "admin" ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
                    <input
                      type="file"
                      accept=".json"
                      onChange={session?.role === "admin" ? handleBackupImportSelect : undefined}
                      disabled={session?.role !== "admin"}
                      className="absolute inset-0 opacity-0 disabled:cursor-not-allowed"
                    />
                    <FileText className="w-5 h-5 text-neutral-400 mb-1" />
                    <strong className="text-[11px] text-neutral-600 dark:text-zinc-300 block uppercase tracking-wider font-bold text-center">
                      {session?.role !== "admin"
                        ? mt("Yêu cầu quyền Giám Đốc (admin)", "需要最高管理员权限", "Admin Privilege Required")
                        : mt("Nạp File Phục Hồi (.JSON)", "安全上传并导入备份 (.JSON)", "UPLOAD BACKUP FILE (.JSON)")}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Erase layout */}
              <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-lg p-6 space-y-5 h-fit">
                <h3 className="font-mono text-[10px] uppercase text-red-500 tracking-wider font-bold">
                  {mt("Xóa Sạch Thiết Lập / Reset ban đầu", "危险：系统格式化重置", "Factory Reset / Wipe All Data")}
                </h3>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  {mt("Xóa bỏ toàn bộ dữ liệu hiện trực ở localStorage và nạp lại kho 12 nhân sự kíp mẫu, 10 loại lỗi kĩ thuật mẫu cùng 5 biểu báo lỗi chất lượng mẫu.", "清空浏览器 LocalStorage，一键将班组表、缺陷定义表及今日所有检查单清除，重新装填12名默认班组人员、10个经典缺陷和5个默认演示单以供预览。", "Erase all live records, defect rules, and staff list from standard local storage, and repopulate with sample factory defaults (12 staff members, 10 standard defect parameters, and 5 incident logs).")}
                </p>
                <button
                  onClick={session?.role === "admin" ? handleResetSystem : undefined}
                  disabled={session?.role !== "admin"}
                  className="p-2.5 bg-red-50 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed text-red-650 rounded font-mono uppercase tracking-wider text-[11px] font-bold w-full transition border border-red-200 dark:bg-red-950/20 dark:hover:bg-red-950/40 dark:text-red-400 dark:border-red-900/40"
                >
                  {session?.role !== "admin"
                    ? mt("CHỈ GIÁM ĐỐC ĐƯỢC RESET CƠ SỞ DỮ LIỆU", "账号无权执行重置", "ADMIN PRIVILEGE REQUIRED TO RESET")
                    : mt("TIẾN HÀNH RESET XÓA TOÀN BỘ CƠ SỞ DỮ LIỆU", "执行全站格式化恢复初始状态", "EXECUTE COMPLETE FACTORY RESET")}
                </button>
              </div>

            </div>
          </div>
        )}
      </main>

      <Modal
        isOpen={viewingReport !== null}
        onClose={() => setViewingReport(null)}
        title={mt("Chi Tiết Phiếu Ghi Nhận Lỗi", "质量缺陷报告单详情", "Incident Report Details")}
        size="md"
      >
        {viewingReport && (
          <div className="space-y-4 text-xs font-sans">
            {/* Top row details */}
            <div className="grid grid-cols-2 gap-y-3.5 gap-x-4 border-b pb-4 border-neutral-200 dark:border-zinc-800">
              <div>
                <span className="font-mono uppercase text-[9px] text-neutral-400 tracking-wider block">{t.modalQcInspector}</span>
                <strong className="text-neutral-900 dark:text-zinc-100 text-xs font-bold">{getQCName(viewingReport.qcId)}</strong>
              </div>
              <div>
                <span className="font-mono uppercase text-[9px] text-neutral-400 tracking-wider block">{t.modalProdLine}</span>
                <strong className="text-neutral-900 dark:text-zinc-100 text-xs font-bold">{getDeptTranslation(viewingReport.department)}</strong>
              </div>
              <div>
                <span className="font-mono uppercase text-[9px] text-neutral-400 tracking-wider block">{t.modalDefectName}</span>
                <strong className="text-neutral-900 dark:text-zinc-100 text-xs font-bold">{getDefectName(viewingReport.defectId)}</strong>
              </div>
              <div>
                <span className="font-mono uppercase text-[9px] text-neutral-400 tracking-wider block">{t.modalSeverity}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold inline-block mt-0.5 ${getSeverityBadgeClass(viewingReport.severity)}`}>
                  {getSeverityTranslation(viewingReport.severity)}
                </span>
              </div>
            </div>

            {/* Inspect numeric values */}
            <div className="grid grid-cols-3 gap-2 bg-neutral-50 dark:bg-zinc-950/45 p-3 rounded border border-neutral-200 dark:border-zinc-850 text-center font-mono text-[11px]">
              <div>
                <span className="text-neutral-400 uppercase text-[9px] block">{t.modalInspectedAmount}</span>
                <strong className="text-neutral-900 dark:text-zinc-200 font-bold block mt-1">{viewingReport.inspectedQty}</strong>
              </div>
              <div>
                <span className="text-red-500 uppercase text-[9px] block">{t.modalDefectAmount}</span>
                <strong className="text-red-650 dark:text-red-400 font-bold block mt-1">{viewingReport.defectQty}</strong>
              </div>
              <div>
                <span className="text-neutral-900 dark:text-zinc-400 uppercase text-[9px] block">{t.modalLossRate}</span>
                <strong className="text-neutral-900 dark:text-zinc-100 font-bold block mt-1">
                  {((viewingReport.defectQty / viewingReport.inspectedQty) * 100).toFixed(2)}%
                </strong>
              </div>
            </div>

            {/* Description Notes */}
            <div className="space-y-1">
              <span className="font-mono uppercase text-[9px] text-neutral-400 tracking-wider block">{t.modalLogNarrative}</span>
              <div className="p-3 bg-neutral-50 dark:bg-zinc-950/45 border border-neutral-150 dark:border-zinc-850 rounded leading-relaxed text-neutral-700 dark:text-zinc-300 min-h-[60px]">
                {viewingReport.description || mt("Không có thêm thuyết minh cụ thể.", "没有填写具体的异常说明。", "No technical description provided.")}
              </div>
            </div>

            {/* Carousel images preview */}
            <div className="space-y-1.5">
              <span className="font-mono uppercase text-[9px] text-neutral-400 tracking-wider block">{t.modalLogEvidence}  ({viewingReport.images?.length || 0}):</span>
              {viewingReport.images && viewingReport.images.length > 0 ? (
                <div className="grid grid-cols-3 gap-3">
                  {viewingReport.images.map((imgUrl, keyImg) => (
                    <div key={keyImg} className="border border-neutral-200 dark:border-zinc-800 rounded overflow-hidden p-1 bg-white dark:bg-zinc-900">
                      <img src={imgUrl} className="w-full h-20 object-cover rounded" alt="Evidence modal preview" />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-neutral-400 dark:text-zinc-650 font-mono text-[10px] italic py-2">
                  {mt("Phiếu sự cố chất lượng này không đính kèm tệp bằng chứng.", "该报告单未附带任何现场实物图片备查。", "No evidence photos attached to this report.")}
                </p>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* HEAVY PRINT LAYER - ONLY ACTIVATES AND RENDERS DURING PRINT SEQUENCE */}
      <PrintTemplates
        job={activePrintJob}
        onClose={() => setActivePrintJob(null)}
        reports={reports}
        staffList={staffList}
        defectTypes={defectTypes}
      />
    </div>
  );
}
