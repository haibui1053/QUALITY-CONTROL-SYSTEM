/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Staff, RoleType } from "../types";
import { Network, ChevronDown, ChevronRight, User, Users, Briefcase, Award, Edit } from "lucide-react";

interface OrgChartProps {
  staffList: Staff[];
  onEdit?: (s: Staff) => void;
  lang?: string;
  getDeptTranslation?: (deptKey: string) => string;
  getRoleTranslation?: (roleKey: string) => string;
}

export default function OrgChart({ staffList, onEdit, lang = "vi", getDeptTranslation, getRoleTranslation }: OrgChartProps) {
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Find root nodes (Director / No reportsTo)
  const roots = staffList.filter((s) => {
    if (!s.reportsTo) return true;
    // If the person they report to does not exist in the list anymore, they become a root
    return !staffList.some((p) => p.id === s.reportsTo);
  });

  const getChildren = (parentId: string) => {
    return staffList.filter((s) => s.reportsTo === parentId);
  };

  const getRoleColor = (role: RoleType) => {
    switch (role) {
      case "Director":
        return "from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white shadow-amber-900/20";
      case "Manager":
        return "from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white shadow-indigo-900/20";
      case "QC Leader":
        return "from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white shadow-teal-900/20";
      case "QC Inline":
        return "from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 text-slate-800 shadow-slate-200/50 dark:from-slate-800 dark:to-slate-700 dark:text-slate-100 dark:border dark:border-slate-700";
    }
  };

  const getRoleIcon = (role: RoleType) => {
    switch (role) {
      case "Director":
        return <Award className="w-4 h-4" />;
      case "Manager":
        return <Briefcase className="w-4 h-4" />;
      case "QC Leader":
        return <Users className="w-4 h-4" />;
      case "QC Inline":
        return <User className="w-4 h-4" />;
    }
  };

  const renderNode = (node: Staff, depth = 0) => {
    const children = getChildren(node.id);
    const hasChildren = children.length > 0;
    const isExpanded = expandedNodes[node.id] !== false; // Default expanded

    return (
      <div key={node.id} className="flex flex-col items-center">
        {/* Connection Line top (except depth 0) */}
        {depth > 0 && (
          <div className="w-0.5 h-6 bg-blue-300 dark:bg-slate-600"></div>
        )}

        {/* Node Card */}
        <div
          id={`org-node-${node.id}`}
          className={`relative p-4 rounded-xl border border-transparent shadow-md bg-gradient-to-r ${getRoleColor(
            node.role
          )} transition-all duration-200 flex flex-col items-center text-center w-64 ${
            node.role === "QC Inline" ? "hover:scale-[1.02]" : "hover:scale-[1.03]"
          }`}
        >
          {/* Edit Button */}
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(node);
                // Scroll to the edit form
                const formEl = document.querySelector("form");
                if (formEl) {
                  formEl.scrollIntoView({ behavior: "smooth", block: "center" });
                }
              }}
              className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 text-current transition-all cursor-pointer"
              title="Sửa nhân sự / 编辑工作组人员 / Edit Personnel"
            >
              <Edit className="w-3 h-3" />
            </button>
          )}

          {/* Badge */}
          <div className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wider uppercase mb-1.5 opacity-90 pr-4">
            {getRoleIcon(node.role)}
            <span>{getRoleTranslation ? getRoleTranslation(node.role) : node.role}</span>
          </div>

          {/* Name */}
          <h4 className="font-bold text-sm tracking-tight">{node.name}</h4>

          {/* Department */}
          {node.role !== "Director" && node.role !== "Manager" && (
            <div className="text-[11px] font-medium mt-1 opacity-80 px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/10">
              Bộ phận / 部门 / Dept: {getDeptTranslation ? getDeptTranslation(node.department) : node.department}
            </div>
          )}

          {/* Toggle Expand Button */}
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(node.id);
              }}
              className="absolute -bottom-3 bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 p-1 rounded-full shadow-md hover:bg-slate-50 dark:hover:bg-slate-700 transition border border-slate-100 dark:border-slate-700"
              title={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>

        {/* Children Rendered Horizontally */}
        {hasChildren && isExpanded && (
          <div className="relative flex flex-col items-center">
            {/* Connection Line down from parent */}
            <div className="w-0.5 h-6 bg-blue-300 dark:bg-slate-600"></div>

            {/* Horizontal rule connecting children */}
            <div className="flex justify-center">
              {children.map((child, idx) => {
                const childChildren = getChildren(child.id);
                const isItemExpanded = expandedNodes[child.id] !== false;

                // Determine border lines mapping
                const isFirst = idx === 0;
                const isLast = idx === children.length - 1;
                const isOnly = children.length === 1;

                return (
                  <div key={child.id} className="relative flex flex-col items-center px-3">
                    {/* Horizontal link line */}
                    {!isOnly && (
                      <div
                        className={`absolute top-0 h-0.5 bg-blue-300 dark:bg-slate-600 ${
                          isFirst
                            ? "left-1/2 right-0"
                            : isLast
                            ? "left-0 right-1/2"
                            : "left-0 right-0"
                        }`}
                      ></div>
                    )}
                    {/* Render current Child Recrusively */}
                    {renderNode(child, depth + 1)}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div id="org-chart-container" className="p-6 bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-x-auto min-w-full">
      <div className="flex items-center gap-2 mb-6">
        <div className="bg-indigo-100 dark:bg-indigo-950/40 p-2 rounded-lg text-indigo-600 dark:text-indigo-400">
          <Network className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800 dark:text-slate-200">Sơ Đồ Tổ Chức QC</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Sơ đồ quan hệ phân cấp báo cáo từ Ban Giám đốc đến các Team QC Inline.
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center py-6 min-w-[900px] select-none">
        <div className="flex justify-center w-full gap-6">
          {roots.map((root) => renderNode(root, 0))}
        </div>
      </div>
    </div>
  );
}
