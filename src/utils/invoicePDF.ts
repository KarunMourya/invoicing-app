import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface InvoiceItem {
  itemName: string;
  description: string;
  quantity: number;
  rate: number;
  discountPct: number;
  amount: number;
}

interface InvoiceData {
  invoiceNo: string;
  invoiceDate: string;
  customerName: string;
  customerAddress?: string;
  city?: string;
  notes?: string;
  items: InvoiceItem[];
  subtotal: number;
  taxPercent: number;
  taxAmount: number;
  total: number;
}

interface CompanyInfo {
  name: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  logo?: string;
}

export const generateInvoicePDF = (
  invoice: InvoiceData,
  company: CompanyInfo
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  let yPosition = 20;

  const primaryColor: [number, number, number] = [82, 82, 82];
  const secondaryColor: [number, number, number] = [117, 117, 117];
  const accentColor: [number, number, number] = [37, 99, 235];

  if (company.logo) {
    try {
      doc.addImage(company.logo, "PNG", 20, yPosition, 30, 30);
    } catch {}
  }

  doc.setFontSize(20);
  doc.setTextColor(...primaryColor);
  doc.setFont("helvetica", "bold");
  doc.text(company.name, company.logo ? 60 : 20, yPosition + 5);

  doc.setFontSize(9);
  doc.setTextColor(...secondaryColor);
  doc.setFont("helvetica", "normal");

  const companyX = company.logo ? 60 : 20;
  doc.text(company.address || "", companyX, yPosition + 12);
  doc.text(company.city || "", companyX, yPosition + 17);
  if (company.phone)
    doc.text(`Phone: ${company.phone}`, companyX, yPosition + 22);
  if (company.email)
    doc.text(`Email: ${company.email}`, companyX, yPosition + 27);

  doc.setFontSize(28);
  doc.setTextColor(...accentColor);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", pageWidth - 20, yPosition + 5, { align: "right" });

  yPosition += 45;

  doc.setFillColor(245, 245, 245);
  doc.rect(15, yPosition, pageWidth - 25, 45, "F");

  doc.setFontSize(10);
  doc.setTextColor(...primaryColor);
  doc.setFont("helvetica", "bold");

  doc.setFont("helvetica", "bold");
  doc.text("Invoice No:", 25, yPosition + 10);
  doc.text("Invoice Date:", 25, yPosition + 18);

  doc.setFont("helvetica", "normal");
  doc.text(String(invoice.invoiceNo), 50, yPosition + 10);
  doc.text(String(invoice.invoiceDate), 50, yPosition + 18);

  const rightX = pageWidth / 2 + 20;

  doc.setFont("helvetica", "bold");
  doc.text("Bill To:", rightX, yPosition + 10);

  doc.setFont("helvetica", "normal");
  doc.text(invoice.customerName, rightX, yPosition + 18);

  if (invoice.customerAddress) {
    doc.text(invoice.customerAddress, rightX, yPosition + 24);
  }

  if (invoice.city) {
    doc.text(invoice.city, rightX, yPosition + 30);
  }

  yPosition += 55;
  const tableColumn = [
    "#",
    "Item",
    "Description",
    "Qty",
    "Rate",
    "Disc %",
    "Amount",
  ];

  const tableRows = invoice.items.map((item, index) => [
    (index + 1).toString(),
    item.itemName,
    item.description || "-",
    String(item.quantity),
    `$${item.rate.toFixed(2)}`,
    `${item.discountPct}%`,
    `$${item.amount.toFixed(2)}`,
  ]);

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: yPosition,
    theme: "striped",
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontSize: 10,
    },
    styles: {
      fontSize: 9,
      cellPadding: 4,
    },
    columnStyles: {
      0: { cellWidth: 12, halign: "center" },
      1: { cellWidth: 40 },
      2: { cellWidth: 55 },
      3: { cellWidth: 15, halign: "center" },
      4: { cellWidth: 22, halign: "right" },
      5: { cellWidth: 18, halign: "center" },
      6: { cellWidth: 25, halign: "right" },
    },
  });

  const finalY = (doc as any).lastAutoTable.finalY;

  let totalsY = finalY + 20;
  const totalsX = pageWidth - 80;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...primaryColor);

  doc.text("Subtotal:", totalsX + 20, totalsY);
  doc.text(`$${invoice.subtotal.toFixed(2)}`, pageWidth - 10, totalsY, {
    align: "right",
  });

  totalsY += 7;

  doc.text(`Tax (${invoice.taxPercent}%):`, totalsX + 20, totalsY);
  doc.text(`$${invoice.taxAmount.toFixed(2)}`, pageWidth - 10, totalsY, {
    align: "right",
  });

  doc.setDrawColor(200, 200, 200);
  doc.line(totalsX - 20, totalsY + 3, pageWidth - 10, totalsY + 3);

  totalsY += 12;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...accentColor);
  doc.text("Total:", totalsX + 20, totalsY);
  doc.text(`$${invoice.total.toFixed(2)}`, pageWidth - 10, totalsY, {
    align: "right",
  });

  if (invoice.notes) {
    totalsY += 20;

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...primaryColor);
    doc.text("Notes:", 20, totalsY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...secondaryColor);

    const splitNotes = doc.splitTextToSize(invoice.notes, pageWidth - 40);
    doc.text(splitNotes, 20, totalsY + 6);
  }

  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(...secondaryColor);
  doc.text("Thank you for your business!", pageWidth / 2, pageHeight - 15, {
    align: "center",
  });

  const fileName = `Invoice_${invoice.invoiceNo}_${invoice.customerName.replace(
    /\s+/g,
    "_"
  )}.pdf`;

  doc.save(fileName);
};
