/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Staff, DefectType, QualityReport } from "./types";

export const INITIAL_STAFF: Staff[] = [
  {
    id: "staff-1",
    name: "Phạm Minh Trí",
    role: "Director",
    department: "Tinh chế",
  },
  {
    id: "staff-2",
    name: "Nguyễn Văn Hùng",
    role: "Manager",
    department: "Lắp ráp",
    reportsTo: "staff-1",
  },
  {
    id: "staff-3",
    name: "Nguyễn Thị Kim",
    role: "QC Leader",
    department: "Kho",
    reportsTo: "staff-2",
  },
  {
    id: "staff-4",
    name: "Lê Thị Mai",
    role: "QC Leader",
    department: "Tinh chế",
    reportsTo: "staff-2",
  },
  {
    id: "staff-5",
    name: "Trần Thế Anh",
    role: "QC Leader",
    department: "Sơn",
    reportsTo: "staff-2",
  },
  {
    id: "staff-6",
    name: "Hoàng Đức Toàn",
    role: "QC Inline",
    department: "Kho",
    reportsTo: "staff-3",
  },
  {
    id: "staff-7",
    name: "Phan Văn Nam",
    role: "QC Inline",
    department: "Sơ chế",
    reportsTo: "staff-3",
  },
  {
    id: "staff-8",
    name: "Đỗ Thu Trang",
    role: "QC Inline",
    department: "Tinh chế",
    reportsTo: "staff-4",
  },
  {
    id: "staff-9",
    name: "Bùi Hoàng Lâm",
    role: "QC Inline",
    department: "Lắp ráp",
    reportsTo: "staff-2",
  },
  {
    id: "staff-10",
    name: "Lý Thanh Hải",
    role: "QC Inline",
    department: "Sơn",
    reportsTo: "staff-5",
  },
  {
    id: "staff-11",
    name: "Phạm Hải Yến",
    role: "QC Inline",
    department: "Đóng gói",
    reportsTo: "staff-5",
  },
  {
    id: "staff-12",
    name: "Vũ Quốc Việt",
    role: "QC Inline",
    department: "Lên Cont",
    reportsTo: "staff-2",
  },
];

export const INITIAL_DEFECT_TYPES: DefectType[] = [
  {
    id: "defect-1",
    name: "Seam Defect",
    department: "Lắp ráp",
    description: "Hở đường keo dán, tuột mũi may, lệch mối ráp sản phẩm.",
  },
  {
    id: "defect-2",
    name: "Color Mismatch",
    department: "Sơn",
    description: "Lệch tông màu, loang lổ màng sơn, độ bóng không đồng đều.",
  },
  {
    id: "defect-3",
    name: "Dimension Error",
    department: "Sơ chế",
    description: "Kích thước phôi đục lỗ/cắt lượn ra ngoài biên độ dung sai.",
  },
  {
    id: "defect-4",
    name: "Stain/Scratch",
    department: "Sơn",
    description: "Vết xước bề mặt bám dính màng phủ, ố mốc do môi trường.",
  },
  {
    id: "defect-5",
    name: "Fabric Defect",
    department: "Kho",
    description: "Chất liệu nứt nẻ, gãy nếp, sùi sợi hoặc lỗi dệt từ NCC.",
  },
  {
    id: "defect-6",
    name: "Packaging Issue",
    department: "Đóng gói",
    description: "Lệch khay chèn xốp, rách màng co, thiếu phụ kiện đi kèm.",
  },
  {
    id: "defect-7",
    name: "Deformation",
    department: "Lắp ráp",
    description: "Cong vênh khung sườn gỗ/kim loại, lồi lõm bề mặt chịu lực.",
  },
  {
    id: "defect-8",
    name: "Impurities/Dust",
    department: "Sơn",
    description: "Hạt bụi nổi cộm dưới lớp sơn bóng, gai bám bặm dính sơn.",
  },
  {
    id: "defect-9",
    name: "Label Mismatch",
    department: "Đóng gói",
    description: "Dán nhầm barcode, sai quy cách cân Cont, thiếu mác phụ.",
  },
  {
    id: "defect-10",
    name: "Moisture/Dampness",
    department: "Kho",
    description: "Độ ẩm vật tư gỗ vượt ngưỡng 12%, xốp ẩm ướt rủi ro mốc.",
  },
];

// Helper to get today's date formatted as YYYY-MM-DD in the local timezone
export const getFormattedToday = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const INITIAL_REPORTS = (): QualityReport[] => {
  const today = getFormattedToday();
  return [
    {
      id: "report-1",
      date: today,
      qcId: "staff-6", // Hoàng Đức Toàn - Kho
      department: "Kho",
      defectId: "defect-5", // Fabric Defect
      severity: "Nặng",
      inspectedQty: 500,
      defectQty: 18,
      description: "Phát hiện lô vải bọc sofa nhập chiều nay bị loang nếp nhăn và nứt nhẹ dọc biên.",
      images: [],
      createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    },
    {
      id: "report-2",
      date: today,
      qcId: "staff-8", // Đỗ Thu Trang - Tinh chế
      department: "Tinh chế",
      defectId: "defect-1", // Seam Defect (or fit Tinh che)
      severity: "Vừa",
      inspectedQty: 250,
      defectQty: 10,
      description: "Mũi may một vài đệm bị chồng chỉ và lỏng đầu gút gây rủi ro tuột keo.",
      images: [],
      createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    },
    {
      id: "report-3",
      date: today,
      qcId: "staff-10", // Lý Thanh Hải - Sơn
      department: "Sơn",
      defectId: "defect-2", // Color Mismatch
      severity: "Nặng",
      inspectedQty: 120,
      defectQty: 15,
      description: "Thành phẩm sơn bóng đợt 1 lệch sắc độ cam so với bảng màu chuẩn khoảng 15%.",
      images: [],
      createdAt: new Date(Date.now() - 1.5 * 3600 * 1000).toISOString(),
    },
    {
      id: "report-4",
      date: today,
      qcId: "staff-11", // Pham Hai Yen - Đóng gói
      department: "Đóng gói",
      defectId: "defect-6", // Packaging Issue
      severity: "Nhẹ",
      inspectedQty: 400,
      defectQty: 8,
      description: "Vỏ hộp carton mỏng dập nếp xếp nhăn nheo nhưng không xước foam đệm lót.",
      images: [],
      createdAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    },
    {
      id: "report-5",
      date: today,
      qcId: "staff-7", // Phan Van Nam - So che
      department: "Sơ chế",
      defectId: "defect-3", // Dimension Error
      severity: "Chấp nhận",
      inspectedQty: 300,
      defectQty: 4,
      description: "Đường kính cắt lượn lệch +0.5mm, trong ngưỡng sai lệch tối đa được duyệt.",
      images: [],
      createdAt: new Date(Date.now() - 0.5 * 3600 * 1000).toISOString(),
    }
  ];
};
