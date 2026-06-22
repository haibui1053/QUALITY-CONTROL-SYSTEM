/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type RoleType = "Director" | "Manager" | "QC Leader" | "QC Inline";

export type DepartmentType = "Kho" | "Sơ chế" | "Tinh chế" | "Lắp ráp" | "Sơn" | "Đóng gói" | "Lên Cont";

export interface Staff {
  id: string;
  name: string;
  role: RoleType;
  department: DepartmentType;
  reportsTo?: string; // Reports to staff ID
}

export interface DefectType {
  id: string;
  name: string;
  department: DepartmentType | "Tất cả";
  description: string;
}

export type SeverityType = "Nặng" | "Vừa" | "Nhẹ" | "Chấp nhận";

export interface QualityReport {
  id: string;
  date: string; // YYYY-MM-DD
  qcId: string; // Staff id of QC Inline (or QC Leader)
  department: DepartmentType;
  defectId: string; // Defect Type ID
  severity: SeverityType;
  inspectedQty: number;
  defectQty: number;
  description: string;
  images: string[]; // Base64 image strings
  createdAt: string; // ISO string
}

export interface UserSession {
  username: string;
  role: "admin" | "admin2"; // admin: Full access, admin2: QC Leader/QC Inline access
  displayName: string;
}
