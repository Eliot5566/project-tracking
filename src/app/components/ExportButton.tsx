'use client';

import React from 'react';
import { Button, Dropdown, message } from 'antd';
import type { MenuProps } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ExportButtonProps {
  data: any[];
  columns: { title: string, dataIndex: string }[];
  fileName: string;
  buttonText?: string;
}

const ExportButton: React.FC<ExportButtonProps> = ({
  data,
  columns,
  fileName,
  buttonText = '匯出報表'
}) => {
  // 匯出為 Excel
  const exportToExcel = () => {
    try {
      // 準備工作表數據
      const worksheet = XLSX.utils.json_to_sheet(
        data.map(item => {
          const row: Record<string, any> = {};
          columns.forEach(col => {
            row[col.title] = item[col.dataIndex];
          });
          return row;
        })
      );

      // 創建工作簿並添加工作表
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, '資料');

      // 寫入檔案並下載
      XLSX.writeFile(workbook, `${fileName}.xlsx`);
      message.success('Excel 報表匯出成功');
    } catch (error) {
      console.error('匯出 Excel 失敗:', error);
      message.error('匯出 Excel 報表失敗');
    }
  };

  // 匯出為 PDF
  const exportToPDF = () => {
    try {
      // 創建 PDF 文檔
      const doc = new jsPDF();

      // 添加標題
      doc.text(fileName, 14, 15);

      // 準備表格數據
      const tableHeaders = columns.map(col => col.title);
      const tableRows = data.map(item => columns.map(col => item[col.dataIndex]));

      // 創建表格
      autoTable(doc, {
        head: [tableHeaders],
        body: tableRows,
        startY: 20,
      });

      // 保存 PDF 檔案
      doc.save(`${fileName}.pdf`);
      message.success('PDF 報表匯出成功');
    } catch (error) {
      console.error('匯出 PDF 失敗:', error);
      message.error('匯出 PDF 報表失敗');
    }
  };

  // 下拉選單項目
  const items: MenuProps['items'] = [
    {
      key: 'excel',
      label: '匯出為 Excel',
      onClick: exportToExcel,
    },
    // {
    //   key: 'pdf',
    //   label: '匯出為 PDF',
    //   onClick: exportToPDF,
    // },
  ];

  return (
    <Dropdown menu={{ items }} placement="bottomRight">
      <Button type="primary" icon={<DownloadOutlined />}>
        {buttonText}
      </Button>
    </Dropdown>
  );
};

export default ExportButton;
