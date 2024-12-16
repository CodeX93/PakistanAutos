import CompanyLogo from '../Asset/Images/PakistanAutoLogo.jpeg';

export const generateInvoicePDFLayout = (doc, purchaserDetails, products, sellingDate) => {
  // Set document properties
  doc.setProperties({ title: 'INVOICE' });
  
  // Set page dimensions and margins
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 40;

  // Add logo (smaller and positioned in top left)
  doc.addImage(CompanyLogo, 'JPEG', margin, margin, 30, 30);

  // Add "INVOICE" text (right-aligned, uppercase)
  doc.setFont("helvetica", "normal");
  doc.setFontSize(24);
  doc.text('INVOICE', pageWidth - margin, margin + 10, { align: 'right' });

  // Add invoice details
  doc.setFontSize(10);
  doc.text(`Invoice No. ${purchaserDetails.invoiceNumber}`, pageWidth - margin, margin + 30, { align: 'right' });
  doc.text(sellingDate, pageWidth - margin, margin + 45, { align: 'right' });

  // Billed To section
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text('BILLED TO:', margin, margin + 70);
  
  // Customer details
  doc.setFont("helvetica", "normal");
  let yPos = margin + 85;
  doc.text(purchaserDetails.name, margin, yPos);
  doc.text(purchaserDetails.contactNo, margin, yPos + 15);
  doc.text(purchaserDetails.address, margin, yPos + 30);

  // Table headers with minimal styling
  yPos = margin + 130;
  const headers = ['Item', 'Quantity', 'Unit Price', 'Total'];
  const columnPositions = [margin, 300, 370, 450];
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  headers.forEach((header, index) => {
    doc.text(header, columnPositions[index], yPos);
  });

  // Thin line under headers
  yPos += 5;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.1);
  doc.line(margin, yPos, pageWidth - margin, yPos);

  // Add items
  yPos += 20;
  doc.setFont("helvetica", "normal");
  products.forEach(product => {
    doc.text(product.productName, columnPositions[0], yPos);
    doc.text(product.quantity.toString(), columnPositions[1], yPos);
    doc.text(`$${product.unitPrice}`, columnPositions[2], yPos);
    const total = product.quantity * product.unitPrice;
    doc.text(`$${total}`, columnPositions[3], yPos);
    yPos += 25;
  });

  // Calculate totals
  const subtotal = products.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const taxRate = 0;
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  // Add subtotal, tax, and total
  yPos += 20;
  doc.text('Subtotal', columnPositions[2], yPos);
  doc.text(`$${subtotal}`, columnPositions[3], yPos);
  
  yPos += 15;
  doc.text(`Tax (${taxRate * 100}%)`, columnPositions[2], yPos);
  doc.text(`$${tax}`, columnPositions[3], yPos);
  
  // Add line before total
  yPos += 5;
  doc.line(columnPositions[2] - 10, yPos, pageWidth - margin, yPos);
  
  yPos += 15;
  doc.setFont("helvetica", "bold");
  doc.text('Total', columnPositions[2], yPos);
  doc.text(`$${total}`, columnPositions[3], yPos);

  // Thank you message
  yPos += 40;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text('Thank you!', margin, yPos);

  // Payment information
  yPos += 30;
  doc.setFont("helvetica", "bold");
  doc.text('PAYMENT INFORMATION', margin, yPos);
  
  doc.setFont("helvetica", "normal");
  yPos += 15;
  doc.text('Briard Bank', margin, yPos);
  doc.text(`Account Name: ${purchaserDetails.name}`, margin, yPos + 15);
  doc.text('Account No.: 123-456-7890', margin, yPos + 30);
  doc.text(`Pay by: ${sellingDate}`, margin, yPos + 45);

  // Company details (right-aligned)
  doc.setFont("helvetica", "bold");
  doc.text(purchaserDetails.name, pageWidth - margin, yPos + 30, { align: 'right' });
  doc.setFont("helvetica", "normal");
  doc.text(purchaserDetails.address, pageWidth - margin, yPos + 45, { align: 'right' });
};