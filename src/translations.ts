/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type LanguageType = "vi" | "en" | "zh";

export interface TranslationDictionary {
  // Navigation & Tabs
  brandName: string;
  brandTagline: string;
  tabDashboard: string;
  tabShiftLogs: string;
  tabStaff: string;
  tabDefects: string;
  tabAnalytics: string;
  tabExport: string;
  tabSettings: string;
  logout: string;
  loggedInAs: string;

  // Login Screen
  loginTitle: string;
  loginSubtitle: string;
  loginUsername: string;
  loginPassword: string;
  loginButton: string;
  fastSignIn: string;
  loginErrorText: string;
  preset1: string;
  preset2: string;

  // Language names
  langVi: string;
  langEn: string;
  langZh: string;

  // Roles & Departments
  roleDirector: string;
  roleManager: string;
  roleQcLeader: string;
  roleQcInline: string;
  deptWarehouse: string;
  deptPrep: string;
  deptRefine: string;
  deptAssembly: string;
  deptPaint: string;
  deptPackaging: string;
  deptLoading: string;
  deptAll: string;

  // Universal Actions
  actionAdd: string;
  actionEdit: string;
  actionDelete: string;
  actionSave: string;
  actionCancel: string;
  actionClose: string;
  actionReset: string;
  actionFilter: string;
  actionSearch: string;
  actionView: string;
  actionPrint: string;
  actionDownload: string;
  actionSelect: string;

  // Dashboard Stats & Overviews
  statInspectedToday: string;
  statInspectedDesc: string;
  statDefectsQty: string;
  statDefectsDesc: string;
  statAvgRate: string;
  statAvgRateDesc: string;
  activeStaff: string;
  activeStaffDesc: string;
  partitionTitle: string;
  partitionDesc: string;
  chartDeptDistribution: string;
  chartSeverityDistribution: string;
  chartTopDefects: string;
  chartTopDefectsDesc: string;
  noData: string;
  totalDefectsShort: string;

  // Shift Logs Tab
  shiftLogsTitle: string;
  shiftLogsSubtitle: string;
  shiftLogsFilterByDate: string;
  shiftLogsFilterByQc: string;
  shiftLogsFilterByDept: string;
  shiftLogsFilterByDefect: string;
  shiftLogsBtnNewReport: string;
  tableQcName: string;
  tableLine: string;
  tableDefect: string;
  tableSeverity: string;
  tableInspectedQty: string;
  tableDefectQty: string;
  tableDefectRate: string;
  tableActions: string;
  tableEmpty: string;

  // Shift Log Modal Form
  formAddReport: string;
  formEditReport: string;
  formQcOnDuty: string;
  formShiftDate: string;
  formInspectedQty: string;
  formDefectQty: string;
  formSeverity: string;
  formDescription: string;
  formDescPlaceholder: string;
  formEvidence: string;
  formEvidencePlaceholder: string;
  formEvidenceDragDrop: string;
  formEvidenceMaxLimit: string;
  formSubmitAdd: string;
  formSubmitSave: string;

  // Severity Terms
  severityMajor: string;
  severityMedium: string;
  severityMinor: string;
  severityAcceptable: string;

  // Staff Tab
  staffTitle: string;
  staffSubtitle: string;
  staffBtnNew: string;
  staffFormAdd: string;
  staffFormEdit: string;
  staffNameLabel: string;
  staffNamePlaceholder: string;
  staffRoleLabel: string;
  staffDeptLabel: string;
  staffReportsToLabel: string;
  staffNoReportsTo: string;
  orgChartTitle: string;
  orgChartSubtitle: string;

  // Defects Tab
  defectsTitle: string;
  defectsSubtitle: string;
  defectsBtnNew: string;
  defectsFormAdd: string;
  defectsFormEdit: string;
  defectsNameLabel: string;
  defectsNamePlaceholder: string;
  defectsDeptLabel: string;
  defectsDescLabel: string;
  defectsDescPlaceholder: string;
  defectTotalFound: string;

  // Technical Analytics Detail Tab
  analyticsTitle: string;
  analyticsSubtitle: string;
  analyticsTopDefects: string;
  analyticsLossByDept: string;
  analyticsInspectedAmount: string;

  // Document Export Tab
  exportTitle: string;
  exportSubtitle: string;
  exportCardDailySummaryTitle: string;
  exportCardDailySummaryDesc: string;
  exportBtnSummaryPdf: string;
  exportBtnPersonPdf: string;
  exportBtnDownloadCsv: string;
  exportCardRecordSplitTitle: string;
  exportNoReportsToday: string;
  exportIndividualReportTitle: string;

  // Settings Tab
  settingsTitle: string;
  settingsSubtitle: string;
  settingsBackupTitle: string;
  settingsBackupDesc: string;
  settingsBackupBtnDownload: string;
  settingsBackupBtnRestore: string;
  settingsEraseTitle: string;
  settingsEraseDesc: string;
  settingsEraseBtnReset: string;

  // Details Modal
  modalQcInspector: string;
  modalProdLine: string;
  modalDefectName: string;
  modalSeverity: string;
  modalInspectedAmount: string;
  modalDefectAmount: string;
  modalLossRate: string;
  modalLogEvidence: string;
  modalLogNoEvidence: string;
  modalLogNarrative: string;

  // Print Templates Title & Preview
  printPreviewSingle: string;
  printPreviewCompositeSummary: string;
  printPreviewCompositeByPerson: string;
  printBtnExecute: string;
  printCertCode: string;
  printRunDate: string;
  printCreatedBy: string;
  printCreatedByAdmin: string;
  printDocTitleSingle: string;
  printDocTitleSummary: string;
  printDocTitleStaff: string;
  printInternalOnly: string;
  printInspectIndex: string;
  printNarrativeGuidelines: string;
  printEvidencePhotos: string;
  printSignatureQcLead: string;
  printSignatureDirector: string;
  printSignatureDate: string;
  printTotalLineCount: string;
  printAvgIncidentRate: string;
  printSummaryEmptyDay: string;
}

export const TRANSLATIONS: Record<LanguageType, TranslationDictionary> = {
  vi: {
    brandName: "iQC PRODUCTION",
    brandTagline: "Hệ thống kiểm sát chất lượng",
    tabDashboard: "Tổng Quan",
    tabShiftLogs: "Khai Báo Ca kíp",
    tabStaff: "Bộ Máy Nhân Sự",
    tabDefects: "Danh Mục Lỗi",
    tabAnalytics: "Tổng Hợp Lỗi",
    tabExport: "Xuất Dữ Liệu",
    tabSettings: "Cài Đặt",
    logout: "Đăng Xuất",
    loggedInAs: "Đăng nhập với tư cách:",

    // Login Screen
    loginTitle: "HỆ THỐNG KIỂM SÁT CHẤT LƯỢNG iQC",
    loginSubtitle: "Bảng vận hành QC giám sát trực tuyến & liên đới nhân sự",
    loginUsername: "Tài khoản",
    loginPassword: "Mật khẩu",
    loginButton: "ĐĂNG NHẬP HỆ THỐNG",
    fastSignIn: "ĐĂNG NHẬP NHANH (MẪU)",
    loginErrorText: "Tên đăng nhập hoặc mật khẩu quản trị không chính xác!",
    preset1: "Giám Đốc",
    preset2: "Trưởng Nhóm QC",

    // Language names
    langVi: "Tiếng Việt",
    langEn: "English",
    langZh: "中文 (Chinese)",

    // Roles & Departments
    roleDirector: "Director / Giám Đốc",
    roleManager: "Manager / Quản Lý",
    roleQcLeader: "QC Leader / Trưởng Ca",
    roleQcInline: "QC Inline / Kiểm Trực",
    deptWarehouse: "Kho",
    deptPrep: "Sơ chế",
    deptRefine: "Tinh chế",
    deptAssembly: "Lắp ráp",
    deptPaint: "Sơn",
    deptPackaging: "Đóng gói",
    deptLoading: "Lên Cont",
    deptAll: "Tất cả bộ phận",

    // Universal Actions
    actionAdd: "Thêm Mới",
    actionEdit: "Chỉnh Sửa",
    actionDelete: "Xóa Bỏ",
    actionSave: "Lưu Lại",
    actionCancel: "Hủy Bỏ",
    actionClose: "Đóng Lại",
    actionReset: "Khôi Phục Ban Đầu",
    actionFilter: "Bộ Lọc",
    actionSearch: "Tìm kiếm...",
    actionView: "Chi Tiết",
    actionPrint: "In Phiếu",
    actionDownload: "Tải xuống",
    actionSelect: "Vui lòng chọn",

    // Dashboard Stats Panel
    statInspectedToday: "Tổng Kiểm Tra Hôm Nay",
    statInspectedDesc: "Sản phẩm mẫu đã kích hoạt",
    statDefectsQty: "Tổng Số Lỗi Ghi Nhận",
    statDefectsDesc: "Sản phẩm phát hiện bất thường",
    statAvgRate: "Tỷ Lệ Lỗi Bình Quân",
    statAvgRateDesc: "Kiểm soát hao hụt & chất lượng",
    activeStaff: "Nhân Sự Trực Ca",
    activeStaffDesc: "Đang tuần tra kiểm tra tuyến",
    partitionTitle: "BẢNG PHÂN VÙNG CHỈ HUY",
    partitionDesc: "Bảng theo dõi trực tuyến QC Inline và các phiếu rủi ro ghi nhận theo thời gian thực.",
    chartDeptDistribution: "Lỗi Phân Phối Theo Bộ Phận",
    chartSeverityDistribution: "Mức Độ Nghiêm Trọng Của Lỗi",
    chartTopDefects: "Bảng Xếp Hạng Loại Lỗi Xuất Hiện Nhiều Nhất",
    chartTopDefectsDesc: "Xếp hạng theo tổng sản lượng lỗi phát hiện",
    noData: "Chưa có dữ liệu lỗi",
    totalDefectsShort: "T.SỐ LỖI",

    // Shift Logs Tab
    shiftLogsTitle: "Hồ Sơ Nhật Ký Kiểm Ca Hằng Ngày",
    shiftLogsSubtitle: "Phân vùng cập nhật nhanh số liệu kiểm định mẫu, sản phẩm lỗi và hình ảnh bằng chứng trực ca của QC.",
    shiftLogsFilterByDate: "Ngày ca trực",
    shiftLogsFilterByQc: "QC giám trực",
    shiftLogsFilterByDept: "Khu vực chuyền",
    shiftLogsFilterByDefect: "Chủng loại lỗi",
    shiftLogsBtnNewReport: "Khai báo sự cố mới",
    tableQcName: "QC Kiểm Trực",
    tableLine: "Dây Chuyền",
    tableDefect: "Chủng Loại Lỗi",
    tableSeverity: "Mức Độ",
    tableInspectedQty: "Lượng Khảo Sát",
    tableDefectQty: "Lỗi Thấy",
    tableDefectRate: "Tỷ Lệ Lỗi",
    tableActions: "Thao Tác",
    tableEmpty: "Không tìm thấy hồ sơ lỗi nào khớp với điều kiện lọc.",

    // Shift Log Modal Form
    formAddReport: "Khai Báo Phiếu Sự Cố Chất Lượng Mới",
    formEditReport: "Hiệu Chỉnh Phiếu Sự Cố Chất Lượng",
    formQcOnDuty: "Nhân viên QC Trực Ca",
    formShiftDate: "Ngày Khảo Sát Thật ca",
    formInspectedQty: "Sản Lượng Kiểm Mẫu (Pcs)",
    formDefectQty: "Số Mẫu Lỗi Ghi Nhận (Pcs)",
    formSeverity: "Mức Độ Cảnh Báo",
    formDescription: "Thuyết Minh Chi Tiết Điểm Lỗi & Biện Pháp Khắc Phục",
    formDescPlaceholder: "Ghi chú rõ rệt hiện trạng vật lý, nguyên nhân sơ bộ, hoặc ý kiến chỉ đạo xử lý nhanh tại chuyền...",
    formEvidence: "Bằng Chứng Hình Ảnh Trực Ca (Tối đa 3)",
    formEvidencePlaceholder: "Dán URL ảnh hoặc tải ảnh lên",
    formEvidenceDragDrop: "Kéo thả hình ảnh hoặc Click để tải lên bằng chứng lỗi",
    formEvidenceMaxLimit: "Đã đạt giới hạn tối đa 3 ảnh bằng chứng.",
    formSubmitAdd: "Phát Hành Phiếu Lỗi",
    formSubmitSave: "Lưu Cập Nhật Phiếu",

    // Severities
    severityMajor: "Nặng",
    severityMedium: "Vừa",
    severityMinor: "Nhẹ",
    severityAcceptable: "Chấp nhận",

    // Staff Tab
    staffTitle: "Quản Lý Bộ Máy Kiểm Soát Chất Lượng",
    staffSubtitle: "Sơ đồ và thông tin chi tiết của hệ thống nhân sự liên đới giám sát từ Ban Giám đốc tới QC Inline trực tuyến.",
    staffBtnNew: "Thêm nhân viên QC mới",
    staffFormAdd: "Thêm Nhân Sự Vào Bộ Máy iQC",
    staffFormEdit: "Biên Tập Thông Tin Nhân Sự iQC",
    staffNameLabel: "Họ Tên Nhân Sự",
    staffNamePlaceholder: "Nhập họ tên đầy đủ...",
    staffRoleLabel: "Chức vụ Vận Hành",
    staffDeptLabel: "Bộ Phận Phụ Trách",
    staffReportsToLabel: "Báo Cáo Trực Tiếp Cho",
    staffNoReportsTo: "Không có quản lý trực tiếp (Đây là Root)",
    orgChartTitle: "SƠ ĐỒ TỔ CHỨC BAN QC",
    orgChartSubtitle: "Sơ đồ quan hệ phân cấp báo cáo từ Ban Giám đốc đến các Team QC Inline.",

    // Defects Tab
    defectsTitle: "Danh Mục Lỗi Kỹ Thuật Đóng Mốc",
    defectsSubtitle: "Sổ tay tra cứu các loại lỗi khuyết tật kỹ thuật tiêu chuẩn được phân nhóm theo từng dây chuyền sản xuất.",
    defectsBtnNew: "Thêm mã lỗi mới",
    defectsFormAdd: "Định Nghĩa Mã Lỗi Mới",
    defectsFormEdit: "Cập nhật định nghĩa mã lỗi",
    defectsNameLabel: "Tên Tiếng Anh Mã Lỗi (Defect Name)",
    defectsNamePlaceholder: "Ví dụ: Color Mismatch, Dent, Scratch...",
    defectsDeptLabel: "Dây chuyền liên đới trực tiếp",
    defectsDescLabel: "Mô Tả Quy Chuẩn Khuyết Tật & Chế Tài",
    defectsDescPlaceholder: "Mô tả chi tiết cách thức nhận biết điểm lỗi và các quy chế khắc phục mẫu...",
    defectTotalFound: "Sự cố trong lịch sử",

    // Technical Analytics Detail Tab
    analyticsTitle: "Khu Vực Phân Tích Kỹ Thuật Tổng Sản",
    analyticsSubtitle: "Bảng kê liên đới sự phân chia rủi ro theo phòng ban và mức độ nghiêm trọng của ca hằng ngày.",
    analyticsTopDefects: "Top các lỗi xuất hiện nhiều nhất hằng ngày",
    analyticsLossByDept: "Hao hụt rủi ro theo phòng kíp dội",
    analyticsInspectedAmount: "Sản lượng kiểm mẫu:",

    // Document Export Tab
    exportTitle: "Khu Kết Xuất Tài Liệu",
    exportSubtitle: "Giúp trích xuất biểu mẫu báo cáo tổng hợp và in ấn tài liệu lưu trữ ca kiểm.",
    exportCardDailySummaryTitle: "Báo cáo Tổng Hợp kíp ca trực",
    exportCardDailySummaryDesc: "Chứa danh sách tất cả biểu lỗi được tập hợp thành một báo cáo hoàn thiện có chữ ký các trưởng phòng ban liên đới.",
    exportBtnSummaryPdf: "In Báo Cáo Tổng Hợp Hôm Nay (PDF)",
    exportBtnPersonPdf: "In Tách Tờ Từng QC Trực Ca (PDF)",
    exportBtnDownloadCsv: "Tải Xuống Bảng Biểu Excel (.csv)",
    exportCardRecordSplitTitle: "Hồ Sơ Tách Từng Người Trình Biệt",
    exportNoReportsToday: "Hôm nay chưa có QC nào khai báo phiếu lỗi để tách in.",
    exportIndividualReportTitle: "Hồ Sơ Tách Tờ:",

    // Settings Tab
    settingsTitle: "Khu Cài Đặt Hệ Thống",
    settingsSubtitle: "Giúp sao lưu bảo mật file dự phòng hoặc khôi phục dữ liệu lại từ đầu.",
    settingsBackupTitle: "Liên Kết Backup File Dự Phòng (.json)",
    settingsBackupDesc: "Xuất toàn bộ hệ thống lưu thành file cứng .json để dự trữ mang sang máy khác dùng offline, hoặc nạp file JSON dự trữ có sẵn lên kíp ca.",
    settingsBackupBtnDownload: "TẢI VỀ FILE (.JSON)",
    settingsBackupBtnRestore: "Nạp File Phục Hồi (.JSON)",
    settingsEraseTitle: "Xóa Sạch Thiết Lập / Reset ban đầu",
    settingsEraseDesc: "Xóa bỏ toàn bộ dữ liệu hiện trực ở localStorage và nạp lại kho 12 nhân sự kíp mẫu, 10 loại lỗi kĩ thuật mẫu cùng 5 biểu báo lỗi chất lượng mẫu.",
    settingsEraseBtnReset: "TIẾN HÀNH RESET XÓA TOÀN BỘ CƠ SỞ DỮ LIỆU",

    // Details Modal
    modalQcInspector: "QC KIỂM TRỰC",
    modalProdLine: "BỘ PHẬN SẢN XUẤT",
    modalDefectName: "HỌ TÊN LỖI RỦI RO",
    modalSeverity: "MỨC ĐỘ RỦI RO",
    modalInspectedAmount: "ĐÃ KHẢO SÁT MẪU",
    modalDefectAmount: "KHUYẾT TẬT MẪU",
    modalLossRate: "TỶ LỆ HAO HỤT",
    modalLogEvidence: "Hình ảnh minh chứng ca kíp đính kèm",
    modalLogNoEvidence: "Phiếu sự cố chất lượng này không đính kèm tệp bằng chứng.",
    modalLogNarrative: "Mô Tả Khảo Sát Kĩ Lưỡng & Chỉ Đạo Vận Hàng:",

    // Print Templates Title & Preview
    printPreviewSingle: "XEM TRƯỚC BẢN IN: BÁO CÁO LỖI CHI TIẾT",
    printPreviewCompositeSummary: "XEM TRƯỚC BẢN IN: BÁO CÁO TỔNG HỢP HÀNG NGÀY",
    printPreviewCompositeByPerson: "XEM TRƯỚC BẢN IN: PHÁT HÀNH BÁO CÁO LẺ TỪNG QC",
    printBtnExecute: "IN BÁO CÁO (XUẤT PDF)",
    printCertCode: "Mã Chứng Từ:",
    printRunDate: "Ngày chạy báo cáo:",
    printCreatedBy: "Tạo bởi:",
    printCreatedByAdmin: "Quản trị Hệ thống",
    printDocTitleSingle: "PHIẾU GHI NHẬN LỖI CHẤT LƯỢNG CHI TIẾT",
    printDocTitleSummary: "BÁO CÁO CHẤT LƯỢNG CA TRỰC HẰNG NGÀY - TỔNG HỢP",
    printDocTitleStaff: "PHIẾU TỔNG HỢP CHI TIẾT THEO CÁ NHÂN",
    printInternalOnly: "Lưu hành nội bộ - Ban Quản lý Chất lượng",
    printInspectIndex: "Chỉ số kiểm định mẫu",
    printNarrativeGuidelines: "Ghi chú & Thuyết minh hướng xử lý",
    printEvidencePhotos: "Ảnh minh chứng hiện trường khảo sát",
    printSignatureQcLead: "Trưởng Ca Kỹ Thuật (Ký tên)",
    printSignatureDirector: "Ban Giám Đốc (Ký, đóng dấu)",
    printSignatureDate: "Ngày ký chứng từ:",
    printTotalLineCount: "Tổng Số Phiếu Ghi Nhận:",
    printAvgIncidentRate: "Tỉ Lệ Sự Cố Bình Quân:",
    printSummaryEmptyDay: "Ngày hôm nay chưa ghi nhận bất kỳ dữ liệu khuyết tật mẫu nào."
  },
  en: {
    brandName: "iQC PRODUCTION",
    brandTagline: "Quality Control System",
    tabDashboard: "Dashboard",
    tabShiftLogs: "Shift Logs",
    tabStaff: "Staff Directory",
    tabDefects: "Defects Catalog",
    tabAnalytics: "Defects Summary",
    tabExport: "Export Data",
    tabSettings: "Settings",
    logout: "Sign Out",
    loggedInAs: "Logged in as:",

    // Login Screen
    loginTitle: "iQC QUALITY CONTROL SYSTEM",
    loginSubtitle: "QC Online Command Board & Multi-national Staff Hierarchy Dashboard",
    loginUsername: "Username",
    loginPassword: "Password",
    loginButton: "SYSTEM SIGN-IN",
    fastSignIn: "FAST SIGN-IN PRESETS",
    loginErrorText: "Incorrect administrator username or password!",
    preset1: "Director",
    preset2: "QC Leader",

    // Language names
    langVi: "Tiếng Việt",
    langEn: "English",
    langZh: "中文 (Chinese)",

    // Roles & Departments
    roleDirector: "Director",
    roleManager: "Manager",
    roleQcLeader: "QC Leader",
    roleQcInline: "QC Inline",
    deptWarehouse: "Warehouse",
    deptPrep: "Preparation",
    deptRefine: "Refining",
    deptAssembly: "Assembly",
    deptPaint: "Painting",
    deptPackaging: "Packaging",
    deptLoading: "Container Loading",
    deptAll: "All Bộ Phận",

    // Universal Actions
    actionAdd: "Add New",
    actionEdit: "Edit",
    actionDelete: "Delete",
    actionSave: "Save Draft",
    actionCancel: "Cancel",
    actionClose: "Close",
    actionReset: "Restore Default DB",
    actionFilter: "Filters",
    actionSearch: "Search...",
    actionView: "Details",
    actionPrint: "Print Sheet",
    actionDownload: "Download",
    actionSelect: "Please select",

    // Dashboard Stats Panel
    statInspectedToday: "Inspected Today",
    statInspectedDesc: "Active samples cataloged",
    statDefectsQty: "Defective Products Found",
    statDefectsDesc: "Total abnormalities logged",
    statAvgRate: "Avg Defect Rate",
    statAvgRateDesc: "Scrap and loss quality control limit",
    activeStaff: "Active Shift Staff",
    activeStaffDesc: "Patrolling lines currently",
    partitionTitle: "CENTRAL COMMAND PARTITION",
    partitionDesc: "Real-time feed showing active QC Inline staff and incoming high-risk defect files.",
    chartDeptDistribution: "Defects Distribution by Departments",
    chartSeverityDistribution: "Defects Severity Breakdown",
    chartTopDefects: "Standard Top Frequency Errors Today",
    chartTopDefectsDesc: "Ranked by cumulative defect metric counts",
    noData: "No quality defects logged yet",
    totalDefectsShort: "TOT. DEFECTS",

    // Shift Logs Tab
    shiftLogsTitle: "Daily Quality Shift Log Journal",
    shiftLogsSubtitle: "Fast ingestion partition for sampling quantities, defect counts, and photo proof submitted by patrol inspectors.",
    shiftLogsFilterByDate: "Shift Date",
    shiftLogsFilterByQc: "Patrol QC",
    shiftLogsFilterByDept: "Line Area",
    shiftLogsFilterByDefect: "Defect Type",
    shiftLogsBtnNewReport: "Log Custom Defect",
    tableQcName: "QC Inspector",
    tableLine: "Production Line",
    tableDefect: "Defect Definition",
    tableSeverity: "Severity",
    tableInspectedQty: "Inspected Pcs",
    tableDefectQty: "Defective Pcs",
    tableDefectRate: "Defect %",
    tableActions: "Actions",
    tableEmpty: "No quality logs matching current filter parameters exist.",

    // Shift Log Modal Form
    formAddReport: "Issue New Quality Incident Sheet",
    formEditReport: "Configure Quality Defect Parameters",
    formQcOnDuty: "Assigned Inspector (QC)",
    formShiftDate: "Shift Ingestion Date",
    formInspectedQty: "Sampling Inspection Quantity (Pcs)",
    formDefectQty: "Defect Product Amount (Pcs)",
    formSeverity: "Critical Severity Code",
    formDescription: "Structural Root Cause Narrative & Directives",
    formDescPlaceholder: "Write specific notes regarding visual physical state, preliminary core cause, or immediate line isolation directives...",
    formEvidence: "On-site Proof Evidence Photos (Max 3)",
    formEvidencePlaceholder: "Paste image URL or upload image",
    formEvidenceDragDrop: "Drag and drop or Click to attach visual evidence",
    formEvidenceMaxLimit: "Reached maximum visual evidence capacity of 3 photos.",
    formSubmitAdd: "Publish Incident File",
    formSubmitSave: "Modify Record File",

    // Severities
    severityMajor: "Major",
    severityMedium: "Moderate",
    severityMinor: "Minor",
    severityAcceptable: "Acceptable",

    // Staff Tab
    staffTitle: "Quality Organization Directory",
    staffSubtitle: "Hierarchical reporting mapping and directories connecting operations from Board of Directors to active Inline QCs.",
    staffBtnNew: "Admit New Inspector",
    staffFormAdd: "Register Staff to iQC Hierarchy",
    staffFormEdit: "Configure Personnel Master Credentials",
    staffNameLabel: "Official Staff Name",
    staffNamePlaceholder: "Enter full legal name...",
    staffRoleLabel: "Designated Role Grade",
    staffDeptLabel: "Primary Bộ Phận",
    staffReportsToLabel: "Reports directly to (Supervisor)",
    staffNoReportsTo: "No direct supervisor (Top Level / Root)",
    orgChartTitle: "QC CONTROL ORGANIZATIONAL CHART",
    orgChartSubtitle: "Visual structural chart depicting standard report routing boundaries to QC Inline.",

    // Defects Tab
    defectsTitle: "Classified Technical Defects Catalog",
    defectsSubtitle: "Definitive handbook of manufacturing defects cataloged by production lines for uniform tolerances.",
    defectsBtnNew: "Add Defect Standard",
    defectsFormAdd: "Define Custom Defect Protocol",
    defectsFormEdit: "Modify Standard Defect Guidelines",
    defectsNameLabel: "English Defect Code/Name",
    defectsNamePlaceholder: "e.g., Color Mismatch, Dent, Scratch...",
    defectsDeptLabel: "Associated Production Line",
    defectsDescLabel: "Defect Definition & Tolerance Regimes",
    defectsDescPlaceholder: "Outline exactly how to identify the defect and specific corrective regimes...",
    defectTotalFound: "Incidents in record history",

    // Technical Analytics Detail Tab
    analyticsTitle: "Detailed Engineering Statistics Tab",
    analyticsSubtitle: "Co-occurring daily risks formatted by Bộ Phận, lines, and critical severity markers.",
    analyticsTopDefects: "Today's Top High-Frequency Technical Failures",
    analyticsLossByDept: "Incident Rate Breakdown by Bộ Phận",
    analyticsInspectedAmount: "Inspected Volume:",

    // Document Export Tab
    exportTitle: "Structured Report Export Bureau",
    exportSubtitle: "Generate composite shift manifests, split inspector books, and print official archives.",
    exportCardDailySummaryTitle: "Composite Shift Quality Report",
    exportCardDailySummaryDesc: "Master audit summary capturing all registered line exceptions, authenticated via director stamp.",
    exportBtnSummaryPdf: "Print Shift Quality Summary (PDF)",
    exportBtnPersonPdf: "Export Individual Split Sheets (PDF)",
    exportBtnDownloadCsv: "Download Tabular Excel Database (.csv)",
    exportCardRecordSplitTitle: "Individual Personnel Exceptions Sheet",
    exportNoReportsToday: "No inspectors have filed exception records during this shift.",
    exportIndividualReportTitle: "Split Sheet Summary:",

    // Settings Tab
    settingsTitle: "Technical System Adjustments",
    settingsSubtitle: "Execute local offline database backups or deploy reset scripts.",
    settingsBackupTitle: "Local Configuration & Backups (.json)",
    settingsBackupDesc: "Export current work databases as client-side backup files or import clean snapshot templates safely.",
    settingsBackupBtnDownload: "DOWNLOAD BACKUP FILE (.JSON)",
    settingsBackupBtnRestore: "Upload Database Restorations (.JSON)",
    settingsEraseTitle: "Purge Database Memory",
    settingsEraseDesc: "Irreversibly delete current localStorage cache and register standard seeds (12 staff, 10 defect types, 5 reports).",
    settingsEraseBtnReset: "PURGE DATABASE NOW & RESTORE SEED VALUES",

    // Details Modal
    modalQcInspector: "ACTIVE INSPECTOR",
    modalProdLine: "MANUFACTURING LINE",
    modalDefectName: "REGISTERED DISCREPANCY",
    modalSeverity: "SEVERITY LEVEL",
    modalInspectedAmount: "TOTAL INSPECTED SAMPLE SIZE",
    modalDefectAmount: "DEFECTS RECORDED QUANTITY",
    modalLossRate: "CALCULATED INCIDENT PERCENTAGE",
    modalLogEvidence: "On-site Evidence Photographic Log",
    modalLogNoEvidence: "This quality incident sheet was filed without supplementary media attachments.",
    modalLogNarrative: "Technical Audit Narrative & Response Guidelines:",

    // Print Templates Title & Preview
    printPreviewSingle: "PRINT PREVIEW: DETAILED EXCEPTION LOG SHEET",
    printPreviewCompositeSummary: "PRINT PREVIEW: COMPOSITE DAILY QUALITY REPORT",
    printPreviewCompositeByPerson: "PRINT PREVIEW: SPLIT INSPECTOR INDIVIDUAL DECREES",
    printBtnExecute: "PRINT DOCUMENT (EXPORT TO PDF / CELL)",
    printCertCode: "Document Code Reference:",
    printRunDate: "Report Generation Date:",
    printCreatedBy: "Issued By Auth:",
    printCreatedByAdmin: "Automated System Administrator",
    printDocTitleSingle: "DETAILED EXCEPTION & QUALITY VARIANCE LOG",
    printDocTitleSummary: "COMPOSITE SHIFT PERFORMANCE QUALITY REPORT",
    printDocTitleStaff: "PERSONNEL EXCEPTION SUMMARY SHEET",
    printInternalOnly: "Internal Use Only - Quality Control Administration Department",
    printInspectIndex: "Sample Size Audit Matrix",
    printNarrativeGuidelines: "Audit Comments & Directive Work Instructions",
    printEvidencePhotos: "Logged Photographic Evidence Exhibits",
    printSignatureQcLead: "Lead Shift Engineer (Signature)",
    printSignatureDirector: "Director / Vice President (Stamp & Approve)",
    printSignatureDate: "Certificate Finalization Date:",
    printTotalLineCount: "Total Logged Incidents:",
    printAvgIncidentRate: "Composite Defect Proportion:",
    printSummaryEmptyDay: "No quality variance entries or defects were recorded during this shift date."
  },
  zh: {
    brandName: "iQC 生产质控",
    brandTagline: "高阶品质监测管理系统",
    tabDashboard: "数据总览",
    tabShiftLogs: "轮班报表",
    tabStaff: "人事架构",
    tabDefects: "缺陷目录",
    tabAnalytics: "缺陷分析",
    tabExport: "数据导出",
    tabSettings: "系统设置",
    logout: "安全退出",
    loggedInAs: "当前登录用户:",

    // Login Screen
    loginTitle: "iQC 生产现场品质控制系统",
    loginSubtitle: "跨国现场QC监测中心 & 现场人员责任追踪看板",
    loginUsername: "账号",
    loginPassword: "密码",
    loginButton: "系统登录",
    fastSignIn: "快速辅助登录 (示例账户)",
    loginErrorText: "管理员账号或密码匹配错误，请重新输入！",
    preset1: "总监管理端",
    preset2: "现场QC主管",

    // Language names
    langVi: "Tiếng Việt (越南语)",
    langEn: "English (英语)",
    langZh: "中文 (Chinese)",

    // Roles & Departments
    roleDirector: "Director / 总监",
    roleManager: "Manager / 经理",
    roleQcLeader: "QC Leader / 组长",
    roleQcInline: "QC Inline / 巡检",
    deptWarehouse: "原材料仓",
    deptPrep: "一次粗加工",
    deptRefine: "精细深加工",
    deptAssembly: "组装总装",
    deptPaint: "喷涂喷漆",
    deptPackaging: "成品包装",
    deptLoading: "集装箱出装",
    deptAll: "所有生产部门",

    // Universal Actions
    actionAdd: "新增数据",
    actionEdit: "编辑条目",
    actionDelete: "删除条目",
    actionSave: "保存草稿",
    actionCancel: "取消操作",
    actionClose: "关闭窗口",
    actionReset: "重置数据",
    actionFilter: "数据过滤器",
    actionSearch: "搜索特定值...",
    actionView: "详细档案",
    actionPrint: "打印表单",
    actionDownload: "立即下载",
    actionSelect: "请做出选择",

    // Dashboard Stats Panel
    statInspectedToday: "今日检测样件数",
    statInspectedDesc: "已质检并载入的样件总数",
    statDefectsQty: "异常缺陷产品数",
    statDefectsDesc: "巡检已查获并记录的次品数",
    statAvgRate: "综合平均缺陷率",
    statAvgRateDesc: "缺陷控制上限与报废预警限额",
    activeStaff: "在岗质检人数",
    activeStaffDesc: "正在车间对应流水线实时巡检",
    partitionTitle: "中央实况控制分区",
    partitionDesc: "实时监控面板，显示在线 QC 执行人员的状态以及最新异常缺陷反馈记录。",
    chartDeptDistribution: "各制造车间缺陷分布百分比",
    chartSeverityDistribution: "缺陷严重程度比重划分",
    chartTopDefects: "今日高频技术性工艺缺陷排名",
    chartTopDefectsDesc: "按检测出的累积缺陷数量排序",
    noData: "当前未发现任何质量异常记录",
    totalDefectsShort: "缺陷总数",

    // Shift Logs Tab
    shiftLogsTitle: "车间每日现场品质日志档案",
    shiftLogsSubtitle: "支持快速录入抽检样件数量、异常缺陷类别以及巡检随手拍取的客观视频图象凭证。",
    shiftLogsFilterByDate: "值班日期",
    shiftLogsFilterByQc: "车间巡检",
    shiftLogsFilterByDept: "作业区域",
    shiftLogsFilterByDefect: "缺陷定义",
    shiftLogsBtnNewReport: "填报异常缺陷单",
    tableQcName: "质检人员",
    tableLine: "制造车间",
    tableDefect: "缺陷定位与名称",
    tableSeverity: "严重级别",
    tableInspectedQty: "抽样样本数",
    tableDefectQty: "检测残次品",
    tableDefectRate: "不良率",
    tableActions: "可执行操作",
    tableEmpty: "未能查找到符合特定检索与过滤条件的品质异常记录。",

    // Shift Log Modal Form
    formAddReport: "签发新车间异常品质报告单",
    formEditReport: "调整异常品质单参考指标",
    formQcOnDuty: "现场值班主要质检员 (QC)",
    formShiftDate: "实际质量监测执行时间",
    formInspectedQty: "单次抽样检验样本总量 (Pcs)",
    formDefectQty: "检出次品、瑕疵品数量 (Pcs)",
    formSeverity: "限制性防错警报级别",
    formDescription: "工艺原因详细推演与纠正隔离措施",
    formDescPlaceholder: "请详细注解所检实物物理状态、初步根源推导或车间立即采取的隔离分选和停线指令...",
    formEvidence: "现场实物瑕疵实拍展示 (最大3张限制)",
    formEvidencePlaceholder: "粘贴外部图片链接或选择文件上传",
    formEvidenceDragDrop: "将工艺缺陷图片拖拽至此或点击上传实据",
    formEvidenceMaxLimit: "图片实据已到达3张的储存极限制。",
    formSubmitAdd: "立即发布异常品质单",
    formSubmitSave: "保存已修改报告单",

    // Severities
    severityMajor: "严重 (Major)",
    severityMedium: "中度 (Moderate)",
    severityMinor: "轻微 (Minor)",
    severityAcceptable: "带病接受 (Acceptable)",

    // Staff Tab
    staffTitle: "国际化质量资源名录",
    staffSubtitle: "纵向直管和沟通联络树状图，穿透联接董事到各厂区第一线 QC 移动操作组。",
    staffBtnNew: "吸纳新巡检人员",
    staffFormAdd: "向 iQC 班团队注册新员工",
    staffFormEdit: "管理员工基础卡档案",
    staffNameLabel: "员工法定姓名",
    staffNamePlaceholder: "请输入员工全名...",
    staffRoleLabel: "业务运作岗位等级",
    staffDeptLabel: "所指派主管制造部",
    staffReportsToLabel: "业务层面顶头上司",
    staffNoReportsTo: "无直接主管主管 (属于组织顶层 / Root)",
    orgChartTitle: "质控部门组织架构逻辑树",
    orgChartSubtitle: "清晰展示自董事至各工厂前端 Inline QC 团队的责任隶属和上报链条。",

    // Defects Tab
    defectsTitle: "标准量化制程缺陷规约书",
    defectsSubtitle: "面向多国工厂的标准化制造缺陷判定手册，按产线汇编，建立均一品质公差标准。",
    defectsBtnNew: "编制新增异常缺陷代码",
    defectsFormAdd: "建档新型异常缺陷判定指标",
    defectsFormEdit: "重设标准异常工艺判定参数",
    defectsNameLabel: "缺陷英文对照码/首选名 (Defect Name)",
    defectsNamePlaceholder: "例: Color Mismatch, Dent, Scratch...",
    defectsDeptLabel: "关联的加工制造工艺线",
    defectsDescLabel: "缺陷规范判定界限与管控细则",
    defectsDescPlaceholder: "简述如何通过感官或卡尺判明此缺陷，以及对应的追回惩治举措...",
    defectTotalFound: "本缺陷在历史中累计检出",

    // Technical Analytics Detail Tab
    analyticsTitle: "车间生产精密分析统计",
    analyticsSubtitle: "按工厂部门、加工线和事故警报权级进行的高维风险共现联合分析。",
    analyticsTopDefects: "今日高频次品加工工艺缺陷类型分布",
    analyticsLossByDept: "各制造车间、工序事故占比对比",
    analyticsInspectedAmount: "已被质检样本总量:",

    // Document Export Tab
    exportTitle: "质检文件数据生成与导出中心",
    exportSubtitle: "处理本层检测结果的汇总输出工作，可以生成合并的轮班报告、个人的检出清单并支持现场打印存档。",
    exportCardDailySummaryTitle: "制造车间综合轮班异常日志",
    exportCardDailySummaryDesc: "集成各生产车间提交的异常，汇编后由各车间、主管、董事代表共同审批签字的核心凭据。",
    exportBtnSummaryPdf: "生成每日汇总报告表 (PDF / 打印)",
    exportBtnPersonPdf: "生成分立个人次品报告 sheet (PDF)",
    exportBtnDownloadCsv: "下载本工厂表格数据库CSV (.csv)",
    exportCardRecordSplitTitle: "特定人员制程次品豁免与扣分书",
    exportNoReportsToday: "本班次暂无任何 QC 报告可执行分立打印与分离操作。",
    exportIndividualReportTitle: "单张表单详情:",

    // Settings Tab
    settingsTitle: "系统运行维护设定",
    settingsSubtitle: "执行本地数据的保密备份，或应用初始化覆盖恢复脚本。",
    settingsBackupTitle: "本地备份文件配置项 (.json)",
    settingsBackupDesc: "将当前工作内存中的完整质检数据库下载到本地，也可以无缝重新加载预存的数据库资产快照。",
    settingsBackupBtnDownload: "立即导出完整备份数据 (.JSON)",
    settingsBackupBtnRestore: "上传导入已备份资产 (.JSON)",
    settingsEraseTitle: "工厂主数据库系统初始化",
    settingsEraseDesc: "强行清空本地一切缓存，重新填入标准演示数据 (包含12位演示人员、10组预制工艺缺陷与5篇检验示例)。",
    settingsEraseBtnReset: "确认执行数据库强制复位并刷新演示数据",

    // Details Modal
    modalQcInspector: "现场检测执行QC",
    modalProdLine: "关联制造工艺线",
    modalDefectName: "触发的品质偏离项",
    modalSeverity: "质量严重程度评判",
    modalInspectedAmount: "现场抽样检测样本总量",
    modalDefectAmount: "现场记录残次品数量",
    modalLossRate: "经折算的瑕疵损伤比例",
    modalLogEvidence: "随单拍摄留存的实物实据影像",
    modalLogNoEvidence: "此次品质异常是在无附加摄像及视频凭证的情况下填报提交的。",
    modalLogNarrative: "工艺技术诊断结论与追究改进对策:",

    // Print Templates Title & Preview
    printPreviewSingle: "打印预览: 单张品质异常追踪判定单",
    printPreviewCompositeSummary: "打印预览: 轮班综合异常质控分析日报表",
    printPreviewCompositeByPerson: "打印预览: 拆分按个人维度的质检履职底卡",
    printBtnExecute: "执行物理打印 (另存为 PDF 文件)",
    printCertCode: "单据索引授权码:",
    printRunDate: "报告汇总输出时间:",
    printCreatedBy: "报告授权签发代表:",
    printCreatedByAdmin: "系统自控程序管理员",
    printDocTitleSingle: "制造实物异常检出与限制偏离单",
    printDocTitleSummary: "车间每日轮班运行质量汇总评估单",
    printDocTitleStaff: "QC 现场个人履职与事故分析底表",
    printInternalOnly: "受控受限内部传阅文件 - 集团质量管理最高行政和监控部",
    printInspectIndex: "抽样调查与质控关键指标矩阵",
    printNarrativeGuidelines: "制程事故工艺分析注解与现场纠正指令",
    printEvidencePhotos: "系统记录的现场瑕疵证据图像",
    printSignatureQcLead: "车间工艺轮班班长 (签字确认)",
    printSignatureDirector: "集团质量控制行政官 (审批盖章生效)",
    printSignatureDate: "报告最终签发签署日期:",
    printTotalLineCount: "已报缺陷记录条数:",
    printAvgIncidentRate: "工厂综合检出残次概率:",
    printSummaryEmptyDay: "在选择的值班日期内，本班次没有记录到任何质量偏差或工艺技术缺陷项。"
  }
};
