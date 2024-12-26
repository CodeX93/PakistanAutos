import React, { useEffect, useState } from 'react';
import { Page, Text, View, Document, StyleSheet, pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';

// Styles remain unchanged
const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 12 },
  section: { marginBottom: 20 },
  header: { display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  invoiceTitle: { fontSize: 18, fontWeight: 'bold' },
  companyInfo: { fontSize: 12 },
  table: { display: 'flex', width: '100%', borderWidth: 1, borderColor: '#e4e4e4', borderStyle: 'solid' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#e4e4e4', padding: 5 },
  tableHeader: { fontWeight: 'bold' },
  tableCol: { width: '20%', padding: 5 },
  totalSection: { display: 'flex', justifyContent: 'flex-end', marginTop: 20 },
  noteSection: { marginTop: 20 },
});

// Helper function to safely access nested properties
const safelyAccessProperty = (obj, path, defaultValue = 'N/A') => {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj) || defaultValue;
};

// Create Document Component
const Invoice = ({ newSales }) => {
  

  if (!newSales || Object.keys(newSales).length === 0) {
    console.error('Invalid or empty newSales object');
    return (
      <Document>
        <Page style={styles.page}>
          <Text>Error: No valid sales data available</Text>
        </Page>
      </Document>
    );
  }

  const chassisNumber = safelyAccessProperty(newSales, 'bikeDetails.chassisNumber');
  const clientFullName = safelyAccessProperty(newSales, 'registrationDetails.client.fullName');
  const clientAddress = safelyAccessProperty(newSales, 'registrationDetails.client.address');
  const registrationCity = safelyAccessProperty(newSales, 'registrationDetails.registrationCity');
  const bikeModel = safelyAccessProperty(newSales, 'bikeDetails.model');
  const sellingPrice = safelyAccessProperty(newSales, 'priceDetails.sellingPrice', '0.00');

  return (
    <Document>
      <Page style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text>Your Company Name</Text>
            <Text>Your Business Address</Text>
            <Text>City, Country</Text>
            <Text>Postal Code</Text>
          </View>
          <View>
            <Text>BILL TO:</Text>
            <Text>{clientFullName}</Text>
            <Text>{clientAddress}</Text>
            <Text>{registrationCity}</Text>
            <Text>Postal Code</Text>
          </View>
        </View>

        {/* Invoice Info */}
        <View style={styles.section}>
          <Text>Chassis Number: {chassisNumber}</Text>
          <Text>Date: {new Date().toLocaleDateString()}</Text>
          <Text>Invoice Due Date: {new Date().toLocaleDateString()}</Text>
          <Text>Amount Due: ${sellingPrice}</Text>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={[styles.tableCol, styles.tableHeader]}>ITEMS</Text>
            <Text style={[styles.tableCol, styles.tableHeader]}>DESCRIPTION</Text>
            <Text style={[styles.tableCol, styles.tableHeader]}>QUANTITY</Text>
            <Text style={[styles.tableCol, styles.tableHeader]}>PRICE</Text>
            <Text style={[styles.tableCol, styles.tableHeader]}>AMOUNT</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCol}>Bike</Text>
            <Text style={styles.tableCol}>{bikeModel}</Text>
            <Text style={styles.tableCol}>1</Text>
            <Text style={styles.tableCol}>${sellingPrice}</Text>
            <Text style={styles.tableCol}>${sellingPrice}</Text>
          </View>
        </View>

        {/* Subtotal and Total Section */}
        <View style={styles.totalSection}>
          <Text>Sub-Total: ${sellingPrice}</Text>
          <Text>Tax Rate: 0%</Text>
          <Text>Tax: $0.00</Text>
          <Text>Total: ${sellingPrice}</Text>
        </View>

        {/* Notes Section */}
        <View style={styles.noteSection}>
          <Text>NOTES:</Text>
          <Text>Thank you for your business!</Text>
        </View>
      </Page>
    </Document>
  );
};

// Export PDF download link
const GenerateInvoice = ({ newSales }) => {
    const [pdfBlob, setPdfBlob] = useState(null);
  
    useEffect(() => {
      if (newSales && Object.keys(newSales).length > 0) {
        generatePDF();
      }
    }, [newSales]);
  
    const generatePDF = async () => {
      try {
        const blob = await pdf(<Invoice newSales={newSales} />).toBlob();
        setPdfBlob(blob);
        // Automatically trigger download
        saveAs(blob, `invoice_${newSales.chassisNumber || 'unknown'}.pdf`);
      } catch (error) {
        console.error('Error generating PDF:', error);
      }
    };
  
    // if (!newSales || Object.keys(newSales).length === 0) {
    //   return <div>No valid sales data available for invoice generation</div>;
    // }
  
    return (
      <div>
        {pdfBlob ? (
          <button onClick={() => saveAs(pdfBlob, `invoice_${newSales.bikeDetails.chassisNumber || 'unknown'}.pdf`)}>
            
          </button>
        ):<></> }
      </div>
    );
  };

export default GenerateInvoice;