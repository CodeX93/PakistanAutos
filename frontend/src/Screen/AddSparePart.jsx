import React, { useState, useEffect } from 'react';
import {
  Grid,
  TextField,
  Typography,
  Divider,
  IconButton,
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { ScrollableContainer, Container, StyledButton, FormSection } from '../Styles/AddBike';
import url from '../baseUrl';

const bikeTypes = ['Electric Motorbike', 'Non-Electric Motorbike'];
const categories = {
  'Electric Motorbike': ['Battery and Charging', 'Electrical Components', 'Drivetrain and Transmission'],
  'Non-Electric Motorbike': ['Engine and Exhaust', 'Fuel System', 'Transmission and Clutch'],
};
const subCategories = {
  'Battery and Charging': ['Lithium-ion battery', 'Battery management system (BMS)', 'Charging port'],
  'Electrical Components': ['Electric motor', 'Motor controller', 'Throttle control'],
  'Drivetrain and Transmission': ['Drive belt or chain', 'Sprockets', 'Gearbox'],
  'Engine and Exhaust': ['Engine components', 'Carburetor or fuel injection system', 'Exhaust pipe'],
  'Fuel System': ['Fuel tank', 'Fuel pump', 'Fuel filter'],
  'Transmission and Clutch': ['Gearbox', 'Clutch plates', 'Chain and sprockets'],
};
const conditions = ['New', 'Used', 'Repaired', 'Scrapped'];

const AddSparePart = () => {
  const [formData, setFormData] = useState({
    bikeType: '',
    category: '',
    subCategory: '',
    supplier: null,
  });

  const [products, setProducts] = useState([{
    productName: '',
    condition: '',
    warehouseLocation: '',
    unitPrice: '',
    quantity: '',
    total: '',
  }]);

  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableSubCategories, setAvailableSubCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    if (formData.bikeType) {
      setAvailableCategories(categories[formData.bikeType] || []);
      setFormData(prev => ({ ...prev, category: '', subCategory: '' }));
    } else {
      setAvailableCategories([]);
    }
  }, [formData.bikeType]);

  useEffect(() => {
    if (formData.category) {
      setAvailableSubCategories(subCategories[formData.category] || []);
      setFormData(prev => ({ ...prev, subCategory: '' }));
    } else {
      setAvailableSubCategories([]);
    }
  }, [formData.category]);

  const fetchSuppliers = async () => {
    try {
      const response = await fetch(`${url}/SparePartSeller/`);
      if (response.ok) {
        const data = await response.json();
        setSuppliers(data);
      } else {
        console.error('Failed to fetch suppliers');
        setError('Failed to fetch suppliers');
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      setError('Error fetching suppliers');
    }
  };

  const handleInputChange = (e, value, name) => {
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
    setError(null); // Clear any previous errors
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
    }]);
  };

  const removeProduct = (index) => {
    const updatedProducts = products.filter((_, i) => i !== index);
    setProducts(updatedProducts);
  };

  const validateForm = () => {
    // Validate form data
    if (!formData.bikeType || !formData.category || !formData.subCategory || !formData.supplier) {
      throw new Error('Please fill in all required form fields');
    }

    // Validate products
    if (!products.length) {
      throw new Error('At least one product is required');
    }

    products.forEach((product, index) => {
      if (!product.productName.trim()) {
        throw new Error(`Product ${index + 1}: Product name is required`);
      }
      if (!product.condition) {
        throw new Error(`Product ${index + 1}: Condition is required`);
      }
      if (!product.warehouseLocation.trim()) {
        throw new Error(`Product ${index + 1}: Warehouse location is required`);
      }
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

    try {
      // Validate the form
      validateForm();

      // Prepare the request payload
      const payload = {
        formData: {
          bikeType: formData.bikeType,
          category: formData.category,
          subCategory: formData.subCategory,
          supplier: formData.supplier
        },
        products: products.map(product => ({
          productName: product.productName,
          condition: product.condition,
          warehouseLocation: product.warehouseLocation,
          unitPrice: parseFloat(product.unitPrice),
          quantity: parseInt(product.quantity),
          total: parseFloat(product.total)
        }))
      };

      // Make the API request
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

      const result = await response.json();
      console.log('Spare Part added successfully:', result);
      
      // Reset form after successful submission
      setFormData({
        bikeType: '',
        category: '',
        subCategory: '',
        supplier: null,
      });
      setProducts([{
        productName: '',
        condition: '',
        warehouseLocation: '',
        unitPrice: '',
        quantity: '',
        total: '',
      }]);
      
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    }
  };

  const circleAnimationStyle = {
    position: 'absolute',
    borderRadius: '50%',
    opacity: 0.5,
    animation: 'float 15s ease-in-out infinite',
  };
  
  const keyframesStyle = `
    @keyframes float {
      0% { transform: translateY(0px); }
      50% { transform: translateY(-15px); }
      100% { transform: translateY(0px); }
    }
    @keyframes floatLeftRight {
      0% { transform: translateX(0px); }
      50% { transform: translateX(15px); }
      100% { transform: translateX(0px); }
    }

  `;

  return (
    <ScrollableContainer>

<div style={{ position: 'relative', overflow: 'auto', padding: '20px', height: '100vh' }}>
  {/* Keyframes for Floating Animation */}
  <style>{keyframesStyle}</style>

  {/* Background Animated Green Circles */}
  <div style={{ ...circleAnimationStyle, width: '100px', height: '100px', backgroundColor: '#a5d6a7', top: '5%', left: '5%' }} />
  <div style={{ ...circleAnimationStyle, width: '100px', height: '100px', backgroundColor: '#81c784', top: '10%', right: '5%', animationName: 'floatLeftRight' }} />
  <div style={{ ...circleAnimationStyle, width: '100px', height: '100px', backgroundColor: '#66bb6a', bottom: '5%', left: '5%' }} />
  <div style={{ ...circleAnimationStyle, width: '100px', height: '100px', backgroundColor: '#4caf50', bottom: '5%', right: '5%' }} />
  
  
  {/* Center Circles */}
  <div style={{ ...circleAnimationStyle, width: '120px', height: '120px', backgroundColor: '#388e3c', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
  <div style={{ ...circleAnimationStyle, width: '90px', height: '90px', backgroundColor: '#66bb6a', top: '55%', left: '55%', transform: 'translate(-50%, -50%)', animationName: 'float' }} />
  <div style={{ ...circleAnimationStyle, width: '80px', height: '80px', backgroundColor: '#81c784', top: '45%', left: '45%', transform: 'translate(-50%, -50%)', animationName: 'floatLeftRight' }} />

  {/* Bottom Center Circles */}
  <div style={{ ...circleAnimationStyle, width: '60px', height: '60px', backgroundColor: '#66bb6a', bottom: '15%', left: '45%' }} />
  <div style={{ ...circleAnimationStyle, width: '50px', height: '50px', backgroundColor: '#81c784', bottom: '10%', right: '45%', animationName: 'float' }} />
  <div style={{ ...circleAnimationStyle, width: '40px', height: '40px', backgroundColor: '#a5d6a7', bottom: '8%', left: '50%', transform: 'translateX(-50%)' }} />

      <Container>
        <Typography variant="h4" gutterBottom align="center" color="primary">
          Add Spare Part
        </Typography>

        {error && (
          <Typography color="error" variant="body2" style={{ marginBottom: '1rem' }}>
            {error}
          </Typography>
        )}

        <Divider style={{ margin: '20px 0' }} />

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
                      variant="outlined" 
                      required 
                      fullWidth 
                      style={{
                        transition: 'transform 0.2s, box-shadow 0.2s',
                      }}
                      onFocus={(e) => e.target.style.transform = 'scale(1.03)'}
                      onBlur={(e) => e.target.style.transform = 'scale(1)'}
                    />
                  )}
                  value={formData.bikeType}
                  onChange={(e, value) => handleInputChange(e, value, 'bikeType')}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Autocomplete
                  options={availableCategories}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      label="Category" 
                      variant="outlined" 
                      required 
                      fullWidth 
                      style={{
                        transition: 'transform 0.2s, box-shadow 0.2s',
                      }}
                      onFocus={(e) => e.target.style.transform = 'scale(1.03)'}
                      onBlur={(e) => e.target.style.transform = 'scale(1)'}
                    />
                  )}
                  value={formData.category}
                  onChange={(e, value) => handleInputChange(e, value, 'category')}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Autocomplete
                  options={availableSubCategories}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      label="Sub-Category" 
                      variant="outlined" 
                      required 
                      fullWidth 
                      style={{
                        transition: 'transform 0.2s, box-shadow 0.2s',
                      }}
                      onFocus={(e) => e.target.style.transform = 'scale(1.03)'}
                      onBlur={(e) => e.target.style.transform = 'scale(1)'}
                    />
                  )}
                  value={formData.subCategory}
                  onChange={(e, value) => handleInputChange(e, value, 'subCategory')}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Autocomplete
                  options={suppliers}
                  getOptionLabel={(option) => option.SellerName}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      label="Supplier" 
                      variant="outlined" 
                      required 
                      fullWidth 
                      style={{
                        transition: 'transform 0.2s, box-shadow 0.2s',
                      }}
                      onFocus={(e) => e.target.style.transform = 'scale(1.03)'}
                      onBlur={(e) => e.target.style.transform = 'scale(1)'}
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
                      variant="outlined"
                      fullWidth
                      required
                      style={{
                        transition: 'transform 0.2s, box-shadow 0.2s',
                      }}
                      onFocus={(e) => e.target.style.transform = 'scale(1.03)'}
                      onBlur={(e) => e.target.style.transform = 'scale(1)'}
                      value={product.productName}
                      onChange={(e) => handleProductChange(index, 'productName', e.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Autocomplete
                      options={conditions}
                      renderInput={(params) => (
                        <TextField 
                          {...params} 
                          label="Condition" 
                          variant="outlined" 
                          required 
                          fullWidth 
                          style={{
                            transition: 'transform 0.2s, box-shadow 0.2s',
                          }}
                          onFocus={(e) => e.target.style.transform = 'scale(1.03)'}
                          onBlur={(e) => e.target.style.transform = 'scale(1)'}
                        />
                      )}
                      value={product.condition}
                      onChange={(e, value) => handleProductChange(index, 'condition', value)}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Warehouse Location"
                      variant="outlined"
                      fullWidth
                      required
                      style={{
                        transition: 'transform 0.2s, box-shadow 0.2s',
                      }}
                      onFocus={(e) => e.target.style.transform = 'scale(1.03)'}
                      onBlur={(e) => e.target.style.transform = 'scale(1)'}
                      value={product.warehouseLocation}
                      onChange={(e) => handleProductChange(index, 'warehouseLocation', e.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Unit Price"
                      variant="outlined"
                      fullWidth
                      required
                      type="number"
                      style={{
                        transition: 'transform 0.2s, box-shadow 0.2s',
                      }}
                      onFocus={(e) => e.target.style.transform = 'scale(1.03)'}
                      onBlur={(e) => e.target.style.transform = 'scale(1)'}
                      value={product.unitPrice}
                      onChange={(e) => handleProductChange(index, 'unitPrice', e.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Quantity"
                      variant="outlined"
                      fullWidth
                      required
                      type="number"
                      style={{
                        transition: 'transform 0.2s, box-shadow 0.2s',
                      }}
                      onFocus={(e) => e.target.style.transform = 'scale(1.03)'}
                      onBlur={(e) => e.target.style.transform = 'scale(1)'}
                      value={product.quantity}
                      onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="body1" color="textSecondary">
                      Total: {product.total}
                    </Typography>
                  </Grid>

                  {products.length > 1 && (
                    <Grid item xs={12} style={{ textAlign: 'right' }}>
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
              type="button"
              startIcon={<AddIcon />}
              style={{
                marginTop: '20px',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              Add Another Product
            </StyledButton>
          </FormSection>

          <StyledButton
            variant="contained"
            color="primary"
            fullWidth
            type="submit"
            style={{
              marginTop: '20px',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            Save Spare Part
          </StyledButton>
        </form>
      </Container>
      </div>
    </ScrollableContainer>
  );
};

export default AddSparePart;