import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

const ExpenseCard = ({ title, expenses = [], total }) => {
  return (
    <Card style={{ height: '250px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', aspectRatio: '1 / 1', margin: '8px', width: '100%' }} sx={{ boxShadow: 3, padding: '20px' }}>
      <CardContent style={{ overflowY: 'auto', maxHeight: '200px' }}>
        <Typography variant="h5" component="div" sx={{ fontWeight: 'bolder', my: '20px' }}>
          {title}
        </Typography>
        {expenses.map((expense) => (
          <Typography key={expense.id} variant="body2" sx={{ paddingY: '4px' }}>
            {expense.expenseDate ? `${new Date(expense.expenseDate).toLocaleDateString()}: ` : ''}
            {expense.itemDescription}: Rs.{expense.expenseAmount?.toFixed(2)}
          </Typography>
        ))}
        <Typography variant="body1" component="div" style={{ fontWeight: 'bold', textAlign: 'right', marginTop: '20px' }}>
          Total: Rs.{total?.toFixed(2) || '0'}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default ExpenseCard;