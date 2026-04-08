import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generatePayslipPDF = (data) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Clean Corporate Colors
  const colors = {
     dark: [15, 23, 42],      // Slate 900
     muted: [100, 116, 139],  // Slate 500
     teal: [13, 148, 136],   // Teal 600
     border: [203, 213, 225], // Slate 300
  };

  // 1. HEADER section
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...colors.dark);
  doc.text(data.company?.name || "WORKNEST TECHNOLOGIES", pageWidth / 2, 25, { align: "center" });
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...colors.muted);
  doc.text(data.company?.address || "123 Business Hub, Cyber City", pageWidth / 2, 31, { align: "center" });
  doc.text(`Contact: ${data.company?.phone || "+91 80 1234 5678"} | Email: ${data.company?.email || "hr@worknest.com"}`, pageWidth / 2, 36, { align: "center" });

  // 2. PAYSLIP TITLE
  doc.setFillColor(...colors.dark);
  doc.rect(20, 45, pageWidth - 40, 10, 'F');
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text(`PAYSLIP FOR ${data.month ? data.month.toUpperCase() : "THE MONTH"}`, pageWidth / 2, 51.5, { align: "center" });

  // 3. EMPLOYEE DETAILS
  doc.setDrawColor(...colors.border);
  doc.setLineWidth(0.3);
  doc.line(20, 60, pageWidth - 20, 60);

  const printDetail = (label, value, x, y) => {
     doc.setFont("helvetica", "bold");
     doc.setFontSize(8);
     doc.setTextColor(...colors.muted);
     doc.text(label, x, y);
     doc.setFont("helvetica", "normal");
     doc.setFontSize(10);
     doc.setTextColor(...colors.dark);
     doc.text(value?.toString().toUpperCase() || "-", x, y + 5);
  };

  printDetail("EMPLOYEE NAME", data.employeeName, 25, 70);
  printDetail("DESIGNATION", data.designation, 100, 70);
  printDetail("BANK A/C NO", data.accountNo || "NOT PROVIDED", 25, 82);
  printDetail("PAN NUMBER", data.panNo || "NOT PROVIDED", 100, 82);
  printDetail("STATUS", data.status?.toUpperCase() || "PAID", 160, 70);

  // Helper to ensure clean currency strings in the PDF
  const fmt = (val) => {
     if (!val) return "0";
     // Ensure we don't have double hyphens or negative signs in the individual table rows
     return val.toString().replace('-', '');
  };

  // 4. SUMMARY TABLE
  const startY = 100;
  
  autoTable(doc, {
    startY: startY,
    margin: { left: 20, right: 20 },
    head: [['DESCRIPTION', 'AMOUNT (INR)']],
    body: [
      ['Gross Salary (Total Earnings)', `Rs ${fmt(data.details?.gross)}`],
      ['Total Deductions', `Rs ${fmt(data.details?.totalDeductions)}`],
    ],
    foot: [['NET PAYABLE AMOUNT', `Rs ${data.amount}`]],
    theme: 'striped',
    styles: { fontSize: 10, cellPadding: 5 },
    headStyles: { fillColor: [15, 23, 42], textColor: 255 },
    footStyles: { fillColor: [13, 148, 136], textColor: 255, fontStyle: 'bold' },
    columnStyles: { 1: { halign: 'right' } }
  });

  // 5. CALCULATION PROOF (Summary)
  const calcY = doc.lastAutoTable.finalY + 20;
  doc.setDrawColor(...colors.border);
  doc.setFillColor(248, 250, 252);
  doc.rect(20, calcY, pageWidth - 40, 25, 'F');
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...colors.muted);
  doc.text("SETTLEMENT FORMULA:", 25, calcY + 10);
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...colors.dark);
  const formulaText = `Rs ${fmt(data.details?.gross)} - Rs ${fmt(data.details?.totalDeductions)} = Rs ${data.amount}`;
  doc.text(formulaText, 25, calcY + 18);

  // 7. FOOTER & SIGNATURE
  const footerY = 260;
  doc.setDrawColor(...colors.muted);
  doc.line(pageWidth - 70, footerY, pageWidth - 20, footerY);
  doc.setFontSize(9);
  doc.setTextColor(...colors.dark);
  doc.text("Authorized Signatory", pageWidth - 45, footerY + 5, { align: "center" });

  doc.setFontSize(7);
  doc.setTextColor(...colors.muted);
  doc.text("This is a computer generated document, no signature required.", pageWidth/2, 280, { align: "center" });

  // Save the PDF
  const filename = data.month ? data.month.replace(/\s+/g, "_") : "Payslip";
  doc.save(`${filename}_Slip.pdf`);
};

export const generateDocumentPDF = (docType, employeeName, companyData, joiningDate) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  const formattedDate = joiningDate 
    ? new Date(joiningDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text(companyData?.companyName || "WORKNEST TECHNOLOGIES", pageWidth / 2, 25, { align: "center" });
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const fullAddress = [companyData?.address, companyData?.city, companyData?.pinCode].filter(Boolean).join(", ");
  doc.text(fullAddress || "123 Business Hub, Cyber City", pageWidth / 2, 32, { align: "center" });
  
  doc.setDrawColor(200, 200, 200);
  doc.line(20, 40, pageWidth - 20, 40);

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(docType.toUpperCase(), pageWidth / 2, 55, { align: "center" });

  // Body
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  
  let content = [];
  if (docType === "Offer Letter") {
     content = [
        `Date: ${formattedDate}`,
        ``,
        `Dear ${employeeName},`,
        ``,
        `We are pleased to offer you a position at ${companyData?.companyName || "our organization"}.`,
        `Your expertise and skills will be a valuable asset to our team.`,
        ``,
        `Position: Active Designation`,
        `Joining Date: ${formattedDate}`,
        ``,
        `We look forward to having you on board.`,
     ];
  } else if (docType === "Employment Contract") {
     content = [
        `Date: ${formattedDate}`,
        ``,
        `EMPLOYMENT AGREEMENT`,
        ``,
        `This agreement is made between ${companyData?.companyName || "WORKNEST"} and ${employeeName}.`,
        ``,
        `1. SCOPE OF WORK: The employee shall perform duties as per the job description.`,
        `2. REMUNERATION: Compensation details are as per the signed offer letter.`,
        `3. CONDUCT: The employee shall abide by the organization's code of conduct.`,
        `4. EFFECTIVE DATE: This contract is active from ${formattedDate}.`,
        ``,
        `By downloading this document, both parties acknowledge the terms.`,
     ];
  } else {
     content = [
        `Date: ${formattedDate}`,
        ``,
        `ORGANIZATION POLICY & CODE OF CONDUCT`,
        ``,
        `To: ${employeeName}`,
        ``,
        `1. WORK HOURS: Mon-Fri, 9:00 AM to 6:00 PM.`,
        `2. LEAVE POLICY: 24 Paid leaves annually.`,
        `3. DATA PRIVACY: Employees must protect sensitive company information.`,
        ``,
        `This document outlines the general guidelines for all employees.`,
     ];
  }

  let y = 75;
  content.forEach(line => {
     doc.text(line, 20, y);
     y += 10;
  });

  // Footer
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text("Authorized Digital Signature", pageWidth - 70, 260);
  doc.line(pageWidth - 75, 258, pageWidth - 20, 258);

  doc.save(`${docType.replace(/\s+/g, "_")}_${employeeName.replace(/\s+/g, "_")}.pdf`);
};
