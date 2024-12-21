import React, { useState, useEffect } from 'react';
import SparepartCreditPurchaseModal from '../Components/SparePartCreditBuyPurchaseModal';
import {
  Grid,
  TextField,
  Typography,
  Divider,
  IconButton,
  Autocomplete,
  CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { ScrollableContainer, Container, StyledButton, FormSection } from '../Styles/AddBike';
import url from '../baseUrl';

const bikeTypes = ['Electric Motorbike', 'Non-Electric Motorbike'];
const conditions = ['New', 'Used', 'Repaired', 'Scrapped'];

const AddSparePart = () => {
  const [formData, setFormData] = useState({
    bikeType: '',
    category: null,
    subCategory: null,
    supplier: null,
  });

  const [products, setProducts] = useState([{
    productName: '',
    condition: '',
    warehouseLocation: '',
    unitPrice: '',
    quantity: '',
    total: '',
    warranty: ''
  }]);
  const [creditPurchaseModalOpen, setCreditPurchaseModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [error, setError] = useState(null);

  // Initial data fetch
  useEffect(() => {
    fetchCategories();
    fetchSuppliers();
  }, []);

  // Fetch subcategories when category changes
  useEffect(() => {
    if (formData.category) {
      fetchSubCategories(formData.category.id);
    } else {
      setSubCategories([]);
    }
  }, [formData.category]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${url}/category`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubCategories = async (categoryId) => {
    try {
      const response = await fetch(`${url}/subcategory/category/${categoryId}`);
      if (!response.ok) throw new Error('Failed to fetch subcategories');
      const data = await response.json();
      setSubCategories(data);
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to load subcategories');
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await fetch(`${url}/SparePartSeller/`);
      if (!response.ok) throw new Error('Failed to fetch suppliers');
      const data = await response.json();
      setSuppliers(data);
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to load suppliers');
    }
  };

  const handleInputChange = (e, value, name) => {
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      // Clear subcategory when category changes
      if (name === 'category') {
        newData.subCategory = null;
      }
      return newData;
    });
    setError(null);
  };

  const handleProductChange = (index, name, value) => {
    const updatedProducts = [...products];
    updatedProducts[index] = {
      ...updatedProducts[index],
      [name]: value,
    };

    if (name === 'unitPrice' || name === 'quantity') {
      const unitPrice = parseFloat(updatedProducts[index].unitPrice) || 0;
      const quantity = parseInt(updatedProducts[index].quantity) || 0;
      updatedProducts[index].total = (unitPrice * quantity).toFixed(2);
    }

    setProducts(updatedProducts);
    setError(null);
  };

  const addProduct = () => {
    setProducts([...products, {
      productName: '',
      condition: '',
      warehouseLocation: '',
      unitPrice: '',
      quantity: '',
      total: '',
      warranty: ''
    }]);
  };

  const removeProduct = (index) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (!formData.bikeType) throw new Error('Please select a bike type');
    if (!formData.category) throw new Error('Please select a category');
    if (!formData.subCategory) throw new Error('Please select a subcategory');
    if (!formData.supplier) throw new Error('Please select a supplier');

    if (!products.length) throw new Error('At least one product is required');

    products.forEach((product, index) => {
      if (!product.productName.trim()) throw new Error(`Product ${index + 1}: Name is required`);
      if (!product.condition) throw new Error(`Product ${index + 1}: Condition is required`);
      if (!product.warehouseLocation.trim()) throw new Error(`Product ${index + 1}: Location is required`);
      if (!product.unitPrice || isNaN(product.unitPrice) || parseFloat(product.unitPrice) <= 0) {
        throw new Error(`Product ${index + 1}: Valid unit price is required`);
      }
      if (!product.quantity || isNaN(product.quantity) || parseInt(product.quantity) <= 0) {
        throw new Error(`Product ${index + 1}: Valid quantity is required`);
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      validateForm();

      const payload = {
        formData: {
          bikeType: formData.bikeType,
          categoryId: formData.category.id,
          subCategoryId: formData.subCategory.id,
          supplierId: formData.supplier.id
        },
        products: products.map(product => ({
          productName: product.productName,
          condition: product.condition,
          warehouseLocation: product.warehouseLocation,
          unitPrice: parseFloat(product.unitPrice),
          quantity: parseInt(product.quantity),
          total: parseFloat(product.total),
          warranty: product.warranty
        }))
      };

      const response = await fetch(`${url}/sparepart/addSparePart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add spare part');
      }

      // Reset form after successful submission
      setFormData({
        bikeType: '',
        category: null,
        subCategory: null,
        supplier: null,
      });
      setProducts([{
        productName: '',
        condition: '',
        warehouseLocation: '',
        unitPrice: '',
        quantity: '',
        total: '',
        warranty: ''
      }]);

      alert('Spare part added successfully!');
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollableContainer>
      <Container>
        <Typography variant="h4" gutterBottom align="center" color="primary">
          Add Spare Part
        </Typography>

        {error && (
          <Typography color="error" variant="body2" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <Divider sx={{ my: 3 }} />

        <form onSubmit={handleSubmit}>
          <FormSection>
            <Typography variant="h6" gutterBottom>
              Spare Part Details
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  options={bikeTypes}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Bike Type"
                      required
                      error={Boolean(error && !formData.bikeType)}
                    />
                  )}
                  value={formData.bikeType}
                  onChange={(e, value) => handleInputChange(e, value, 'bikeType')}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Autocomplete
                  options={categories}
                  getOptionLabel={(option) => option.name || ''}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Category"
                      required
                      error={Boolean(error && !formData.category)}
                    />
                  )}
                  value={formData.category}
                  onChange={(e, value) => handleInputChange(e, value, 'category')}
                  loading={loading}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Autocomplete
                  options={subCategories}
                  getOptionLabel={(option) => option.name || ''}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Sub-Category"
                      required
                      error={Boolean(error && !formData.subCategory)}
                    />
                  )}
                  value={formData.subCategory}
                  onChange={(e, value) => handleInputChange(e, value, 'subCategory')}
                  disabled={!formData.category}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Autocomplete
                  options={suppliers}
                  getOptionLabel={(option) => option.SellerName || ''}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Supplier"
                      required
                      error={Boolean(error && !formData.supplier)}
                    />
                  )}
                  value={formData.supplier}
                  onChange={(e, value) => handleInputChange(e, value, 'supplier')}
                />
              </Grid>
            </Grid>
          </FormSection>

          <FormSection>
            <Typography variant="h6" gutterBottom>
              Product Details
            </Typography>

            {products.map((product, index) => (
              <FormSection key={index}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      label="Product Name"
                      fullWidth
                      required
                      value={product.productName}
                      onChange={(e) => handleProductChange(index, 'productName', e.target.value)}
                      error={Boolean(error && !product.productName)}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Autocomplete
                      options={conditions}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Condition"
                          required
                          error={Boolean(error && !product.condition)}
                        />
                      )}
                      value={product.condition}
                      onChange={(e, value) => handleProductChange(index, 'condition', value)}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Warehouse Location"
                      fullWidth
                      required
                      value={product.warehouseLocation}
                      onChange={(e) => handleProductChange(index, 'warehouseLocation', e.target.value)}
                      error={Boolean(error && !product.warehouseLocation)}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Unit Price"
                      fullWidth
                      required
                      type="number"
                      value={product.unitPrice}
                      onChange={(e) => handleProductChange(index, 'unitPrice', e.target.value)}
                      error={Boolean(error && !product.unitPrice)}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Quantity"
                      fullWidth
                      required
                      type="number"
                      value={product.quantity}
                      onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
                      error={Boolean(error && !product.quantity)}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="body1" color="textSecondary">
                      Total: {product.total}
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      label="Warranty"
                      fullWidth
                      multiline
                      rows={4}
                      value={product.warranty}
                      onChange={(e) => handleProductChange(index, 'warranty', e.target.value)}
                    />
                  </Grid>

                  {products.length > 1 && (
                    <Grid item xs={12} sx={{ textAlign: 'right' }}>
                      <IconButton onClick={() => removeProduct(index)} color="secondary">
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  )}
                </Grid>
              </FormSection>
            ))}

            <StyledButton
              onClick={addProduct}
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              sx={{ mt: 2 }}
            >
              Add Another Product
            </StyledButton>
          </FormSection>

          <StyledButton
            variant="contained"
            color="primary"
            fullWidth
            type="submit"
            disabled={loading}
            sx={{ mt: 3 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Save Spare Part'}
          </StyledButton>
          
          <StyledButton
  onClick={() => setCreditPurchaseModalOpen(true)}
  variant="outlined"
  
  fullWidth
  sx={{ mr: 2,  mt:3}}
  disabled={loading}
>
  Credit Purchase
</StyledButton>
        </form>
        <SparepartCreditPurchaseModal
  open={creditPurchaseModalOpen}
  onClose={() => setCreditPurchaseModalOpen(false)}
  formData={formData}
  products={products}
  supplier={formData.supplier}
/>
      </Container>
    </ScrollableContainer>
  );
};

export default AddSparePart;