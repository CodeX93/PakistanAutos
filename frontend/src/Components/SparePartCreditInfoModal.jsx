import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Package2, User, UserCheck, CalendarClock, CreditCard, Truck } from 'lucide-react';

const SparePartDetailsModal = ({ buy, open, onClose }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return `Rs. ${amount.toLocaleString()}`;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Package2 className="h-5 w-5" />
          Credit Buy Details
        </DialogTitle>
      </DialogHeader>
      <DialogContent className="max-h-[80vh] max-w-3xl">
        <ScrollArea className="h-full pr-4">
          <div className="space-y-6">
            {/* Purchaser Information */}
            <Card>
              <CardHeader className="flex flex-row items-center gap-2">
                <User className="h-5 w-5" />
                <h3 className="font-semibold">Purchaser Details</h3>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{buy.purchaserDetails?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">CNIC</p>
                  <p className="font-medium">{buy.purchaserDetails?.cnic}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Contact</p>
                  <p className="font-medium">{buy.purchaserDetails?.contactNo}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">{buy.purchaserDetails?.address}</p>
                </div>
              </CardContent>
            </Card>

            {/* Trusted Person Information */}
            {buy.trustedPerson && (
              <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  <h3 className="font-semibold">Trusted Person</h3>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{buy.trustedPerson.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">CNIC</p>
                    <p className="font-medium">{buy.trustedPerson.cnic}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{buy.trustedPerson.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium">{buy.trustedPerson.address}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Products Information */}
            <Card>
              <CardHeader className="flex flex-row items-center gap-2">
                <Truck className="h-5 w-5" />
                <h3 className="font-semibold">Products</h3>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {buy.products?.map((product, index) => (
                      <TableRow key={index}>
                        <TableCell>{product.productName}</TableCell>
                        <TableCell>{`${product.category} - ${product.subCategory}`}</TableCell>
                        <TableCell>{product.quantity}</TableCell>
                        <TableCell>{formatCurrency(product.unitSellingPrice)}</TableCell>
                        <TableCell>{formatCurrency(product.total)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader className="flex flex-row items-center gap-2">
                <CreditCard className="h-5 w-5" />
                <h3 className="font-semibold">Payment Details</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Amount</p>
                    <p className="font-medium">{formatCurrency(buy.products?.[0]?.totalPrice || 0)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Balance</p>
                    <p className="font-medium">{formatCurrency(buy.pendingBalance)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Promised Date</p>
                    <p className="font-medium">{formatDate(buy.promisedDate)}</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-2">Payment History</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Mode</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {buy.paymentsReceived?.map((payment, index) => (
                        <TableRow key={index}>
                          <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                          <TableCell>{formatCurrency(payment.paymentAmount)}</TableCell>
                          <TableCell>{payment.paymentMode}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Close</Button>
      </DialogFooter>
    </Dialog>
  );
};

export default SparePartDetailsModal;