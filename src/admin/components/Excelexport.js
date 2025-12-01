import React from "react";
import ExcelJS from "exceljs";

const ExcelExport = ({ excelData }) => {
  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet 1");

    // Add headers
    const headers = Object.keys(excelData[0][0]);
    worksheet.addRow(headers);

    // Add data rows
    excelData[0].forEach((row) => {
      const values = headers.map((header) => row[header]);
      worksheet.addRow(values);
    });

    // Generate Excel file
    const buffer = await workbook.xlsx.writeBuffer();

    // Trigger download
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const fileName = "exported_data.xlsx";

    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <button className="btn btn-sm btn-default h-25  ml-2" onClick={exportToExcel} style={{ marginTop: "27px" }}>
        <i class="fa fa-file-excel-o" aria-hidden="true" style={{ marginRight: "5px", scale: "1.2" }}></i>
        Export to Excel
      </button>
    </div>
  );
};

export default ExcelExport;
