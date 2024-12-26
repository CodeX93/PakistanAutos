import React, { useState, useEffect } from 'react';
import BikePurchaseCreditModal from '../Components/BikeCreditBuyPurchaseModal';

import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Typography,
  Autocomplete,
  Divider,
  Snackbar,
  Alert,
  FormHelperText,
  Select,
  MenuItem,
  Modal,
  IconButton,
  DialogActions,
  Button,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import url from '../baseUrl'




const cities = [
  'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Multan',
  'Hyderabad', 'Faisalabad', 'Gujranwala', 'Peshawar', 'Quetta',
  'Sialkot', 'Bahawalpur', 'Sukkur', 'Larkana', 'Nawabshah',
];

const AddBike = (role) => {

  const [manufacturers, setManufacturers] = useState([]);
  const [models, setModels] = useState([]);
  const [savedSellers, setSavedSellers] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [currentStep, setCurrentStep] = useState(0);  
  const [bikeModels, setBIKEMODELS] = useState([]);
  const [open, setOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);
const [sellerType, setSellerType] = useState("");
const [selectedSeller, setSelectedSeller] = useState(null);
const [sellerName, setSellerName] = useState("");
const [sellerContactNo, setSellerContactNo] = useState("");
const [sellerAddress, setSellerAddress] = useState("");
const [SellerCNIC, setSellerCNIC] = useState("");
const [selectedModel, setSelectedModel] = useState("");
const [selectedManufacturer, setSelectedManufacturer] = useState("");
const [modelYear, setModelYear] = useState("");
const [stockQuantity, setStockQuantity] = useState(1);
const [purchaseDate, setPurchaseDate] = useState("");
const [creditPurchaseModalOpen, setCreditPurchaseModalOpen] = useState(false);

const [bikeEntries, setBikeEntries] = useState([
  {
    motorNo: "",
    frameNo: "",
    chassisNumber: "",
    engineNo: "",
    registrationNumber: "",
    condition: "new",
    mileage: 0,
    registrationCity: "",
    purchasePrice: "",
    purchaseDate: "",
    purchaseTime: "",
    commissionPrice: 2000, // Default commission price
    expenses: [{ name: "", cost: "" }], // Initialize with one empty expense
    totalExpenses: 0,
  },
]);
const [errors, setErrors] = useState({});

  // Add function to handle expense changes
  const handleExpenseChange = (bikeIndex, expenseIndex, field, value) => {
    const newEntries = [...bikeEntries];
    if (!newEntries[bikeIndex].expenses) {
      newEntries[bikeIndex].expenses = [];
    }
    
    newEntries[bikeIndex].expenses[expenseIndex] = {
      ...newEntries[bikeIndex].expenses[expenseIndex],
      [field]: value
    };

    // Calculate total expenses
    const totalExpenses = newEntries[bikeIndex].expenses.reduce((sum, expense) => {
      return sum + (Number(expense.cost) || 0);
    }, 0);

    newEntries[bikeIndex].totalExpenses = totalExpenses;

    // Update final purchase price including commission and expenses
    const basePrice = Number(newEntries[bikeIndex].purchasePrice) || 0;
    const commission = Number(newEntries[bikeIndex].commissionPrice) || 0;
    newEntries[bikeIndex].finalPurchasePrice = basePrice + commission + totalExpenses;

    setBikeEntries(newEntries);
    clearErrors();
  };

  // Add function to add new expense fields
  const addExpenseField = (bikeIndex) => {
    const newEntries = [...bikeEntries];
    newEntries[bikeIndex].expenses.push({ name: "", cost: "" });
    setBikeEntries(newEntries);
  };

  // Add function to remove expense fields
  const removeExpenseField = (bikeIndex, expenseIndex) => {
    const newEntries = [...bikeEntries];
    newEntries[bikeIndex].expenses.splice(expenseIndex, 1);
    
    // Recalculate total expenses
    const totalExpenses = newEntries[bikeIndex].expenses.reduce((sum, expense) => {
      return sum + (Number(expense.cost) || 0);
    }, 0);

    newEntries[bikeIndex].totalExpenses = totalExpenses;
    setBikeEntries(newEntries);
  };

  

  useEffect(() => {
    const fetchManufacturers = () => {
      fetch(`${url}/manufacturer/`)
        .then((response) => response.json())
        .then((data) => {
          setManufacturers(data);
          localStorage.setItem('manufacturers', JSON.stringify(data));
        })
        .catch((error) => {
          console.error('Error fetching manufacturers:', error);
          const cachedManufacturers = localStorage.getItem('manufacturers');
          if (cachedManufacturers) setManufacturers(JSON.parse(cachedManufacturers));
        });
    };

    if (navigator.onLine) fetchManufacturers();
    else {
      const cachedManufacturers = localStorage.getItem('manufacturers');
      if (cachedManufacturers) setManufacturers(JSON.parse(cachedManufacturers));
    }

    window.addEventListener('online', fetchManufacturers);
    return () => window.removeEventListener('online', fetchManufacturers);
  }, []);
  useEffect(() => {
    // Check if all required fields have values
    const isFormValid =
      selectedType &&
      selectedManufacturer &&
      selectedModel &&
      modelYear &&
      sellerType &&
      stockQuantity;
  
    setIsDisabled(!isFormValid); // Set isDisabled based on form validity
  }, [selectedType, selectedManufacturer, selectedModel, modelYear, sellerType, stockQuantity]);
  
  
  useEffect(() => {
    if (selectedManufacturer && selectedType) {
      const manufacturerId = manufacturers.find((m) => m.name === selectedManufacturer)?.id;
      if (manufacturerId) {
        const fetchModels = () => {
          fetch(`${url}/bikemodel/${manufacturerId}/${selectedType}/models`)
            .then((response) => response.json())
            .then((data) => {
              setModels(data.map((model) => model.modelName));
              setBIKEMODELS(data);
              localStorage.setItem(`models_${manufacturerId}_${selectedType}`, JSON.stringify(data));
            })
            .catch((error) => {
              console.error('Error fetching models:', error);
              const cachedModels = localStorage.getItem(`models_${manufacturerId}_${selectedType}`);
              if (cachedModels) {
                const data = JSON.parse(cachedModels);
                setModels(data.map((model) => model.modelName));
                setBIKEMODELS(data);
              }
            });
        };

        if (navigator.onLine) fetchModels();
        else {
          const cachedModels = localStorage.getItem(`models_${manufacturerId}_${selectedType}`);
          if (cachedModels) {
            const data = JSON.parse(cachedModels);
            setModels(data.map((model) => model.modelName));
            setBIKEMODELS(data);
          }
        }

        window.addEventListener('online', fetchModels);
        return () => window.removeEventListener('online', fetchModels);
      }
    } else {
      setModels([]);
    }
  }, [selectedManufacturer, selectedType, manufacturers]);
  
  useEffect(() => {
    const fetchSellers = () => {
      fetch(`${url}/bikeseller/`)
        .then((response) => response.json())
        .then((data) => {
          console.log('Fetched saved sellers:', data);
          setSavedSellers(data);
          localStorage.setItem('savedSellers', JSON.stringify(data)); // Save to local storage
          if (data.length > 0) {
            setSelectedSeller(data[0]);
          }
        })
        .catch((error) => {
          console.error('Error fetching saved sellers:', error);
          // Load from local storage if available
          const cachedSellers = localStorage.getItem('savedSellers');
          if (cachedSellers) {
            setSavedSellers(JSON.parse(cachedSellers));
          }
        });
    };
  
    if (navigator.onLine) {
      fetchSellers();
    } else {
      // Load from local storage if offline
      const cachedSellers = localStorage.getItem('savedSellers');
      if (cachedSellers) {
        setSavedSellers(JSON.parse(cachedSellers));
      }
    }
  
    // Retry fetching when back online
    window.addEventListener('online', fetchSellers);
    return () => window.removeEventListener('online', fetchSellers);
  }, []);
  
  useEffect(() => {
    // Clear selectedSeller state when savedSellers changes
    setSelectedSeller(Array(savedSellers.length).fill(''));
  }, [savedSellers]);
  
  useEffect(() => {
    if (selectedManufacturer) {
      const manufacturerId = manufacturers.find((m) => m.name === selectedManufacturer)?.id;
      if (manufacturerId) {
        const fetchModels = () => {
          fetch(`${url}/bikemodel/${manufacturerId}/${selectedType}/models`)
            .then((response) => response.json())
            .then((data) => {
              setModels(data.map((model) => model.modelName));
              setBIKEMODELS(data);
              localStorage.setItem(`models_${manufacturerId}_${selectedType}`, JSON.stringify(data)); // Save to local storage
            })
            .catch((error) => {
              console.error('Error fetching models:', error);
              // Load from local storage if available
              const cachedModels = localStorage.getItem(`models_${manufacturerId}_${selectedType}`);
              if (cachedModels) {
                const data = JSON.parse(cachedModels);
                setModels(data.map((model) => model.modelName));
                setBIKEMODELS(data);
              }
            });
        };
  
        if (navigator.onLine) {
          fetchModels();
        } else {
          // Load from local storage if offline
          const cachedModels = localStorage.getItem(`models_${manufacturerId}_${selectedType}`);
          if (cachedModels) {
            const data = JSON.parse(cachedModels);
            setModels(data.map((model) => model.modelName));
            setBIKEMODELS(data);
          }
        }
  
        // Retry fetching when back online
        window.addEventListener('online', fetchModels);
        return () => window.removeEventListener('online', fetchModels);
      }
    } else {
      setModels([]);
    }
  }, [selectedManufacturer, manufacturers]);
  

  const handleManufacturerChange = (event, newValue) => {
    setSelectedManufacturer(newValue);
    setSelectedModel('');
    clearErrors();
  };

  const handleSellerTypeChange = (event) => {
    setSellerType(event.target.value);
    if (event.target.value === 'saved') setSelectedSeller(savedSellers.length > 0 ? savedSellers[0] : null);
    else setSelectedSeller(null);
    clearErrors();
  };
  
  const handleAddBike = () => {
    const newErrors = {};
    let sellerInformation;
  
    // Validate seller information
    if (sellerType === "saved") {
      if (!selectedSeller) {
        newErrors.savedSeller = "Please select a saved seller";
      } else {
        sellerInformation = {
          name: selectedSeller.SellerName,
          contactNo: selectedSeller.SellerContactNo,
          address: selectedSeller.SellerAddress,
          cnic: selectedSeller.SellerCNIC,
        };
      }
    } else if (sellerType === "manual") {
      if (!sellerName) newErrors.sellerName = "Seller Name is required";
      if (!sellerContactNo) newErrors.sellerContactNo = "Contact Number is required";
      if (!sellerAddress) newErrors.sellerAddress = "Address is required";
      if (!SellerCNIC) newErrors.SellerCNIC = "CNIC is required";
  
      sellerInformation = {
        name: sellerName,
        contactNo: sellerContactNo,
        address: sellerAddress,
        cnic: SellerCNIC,
      };
    } else {
      newErrors.sellerType = "Seller Type is required";
    }
  
    // Validate Bike Entries
    const currentTime = new Date().toLocaleTimeString();
    bikeEntries.forEach((entry, index) => {
      if (selectedType === 'Electric') {
        if (!entry.motorNo) newErrors[`motorNo${index}`] = "Motor Number is required.";
        if (!entry.frameNo) newErrors[`frameNo${index}`] = "Frame Number is required.";
      } else {
        if (!entry.chassisNumber) newErrors[`chassisNumber${index}`] = "Chassis Number is required.";
        if (!entry.engineNo) newErrors[`engineNo${index}`] = "Engine Number is required.";
      }
      
      if (entry.condition !== "new" && !entry.registrationNumber)
        newErrors[`registrationNumber${index}`] = "Registration Number is required for used bikes.";
      if (!entry.purchasePrice || entry.purchasePrice <= 0)
        newErrors[`purchasePrice${index}`] = "Valid Purchase Price is required.";
      if (!entry.purchaseDate) newErrors[`purchaseDate${index}`] = "Purchase Date is required.";
      entry.purchaseTime = entry.purchaseTime || currentTime;
    });
  
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
  
    const bikeModelObject = bikeModels.find((model) => model.modelName === selectedModel);
    if (!bikeModelObject) {
      console.error("Bike model not found.");
      return;
    }
  
    const requestBody = {
      Inventory: {
        manufacturer: selectedManufacturer,
        model: bikeModelObject.modelName,
        modelYear,
        stockQuantity,
        purchaseDate,
        bikeEntries: bikeEntries.map((entry) => {
          const baseEntry = {
            ...entry,
            sellerInfo: sellerInformation,
            warranty: entry.warranty || bikeModelObject.warranty,
            type: selectedType,
          };
    
          // Add type-specific fields
          if (selectedType === "Electric") {
            // Extract battery details from the bike model
            const batteryDetails = bikeModelObject.power?.battery || {};
            return {
              ...baseEntry,
              motorNo: entry.motorNo || "NA",
              frameNo: entry.frameNo || "NA",
              power: bikeModelObject.power?.watt || "NA",
              range: bikeModelObject.range || "NA",
              batteryDetails: {
                capacity: batteryDetails.capacity || "NA",
                quantity: batteryDetails.quantity || 1,
                volts: batteryDetails.volts || "NA",
                amperes: batteryDetails.amperes || "NA"
              }
            };
          } else {
            return {
              ...baseEntry,
              engineNo: entry.engineNo,       
              chassisNumber: entry.chassisNumber, 
              cc: bikeModelObject.power?.cc || "NA",
              stroke: bikeModelObject.engine?.stroke || "NA"
            };
          }
        }),
      },
    };
  
    console.log("Request body:", requestBody); // For debugging
  
    fetch(`${url}/bikeinventory/addBikeToInventory`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((errData) => {
            throw new Error(`Failed to add bikes: ${errData.message || response.status}`);
          });
        }
        return response.json();
      })
      .then((data) => {
        console.log("Success:", data);
        setSuccessMessage("Bike added successfully!");
        setOpen(false); // Close the modal on success
      })
      .catch((error) => {
        console.error("Error:", error);
        setError(error.message);
      });
  };

  
  
  
  const handleEntryChange = (index, e) => {
    const { name, value } = e.target;
    const newEntries = [...bikeEntries];
  
    if (!newEntries[index]) {
      newEntries[index] = {};
    }
  
    // Prevent negative values for mileage
    if (name === 'mileage' && value < 0) {
      newEntries[index].mileage = 0;
    } else {
      newEntries[index] = { ...newEntries[index], [name]: value };
    }
  
    setBikeEntries(newEntries);
    clearErrors();
  };
  

  const handleStockQuantityChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setStockQuantity(value);
    if (value > bikeEntries.length) {
      setBikeEntries([...bikeEntries, ...Array(value - bikeEntries.length).fill({})]);
    } else {
      setBikeEntries(bikeEntries.slice(0, value));
    }
  };
  const handleSubmit = (event) => {
    event.preventDefault();
    handleAddBike();
  };

  const handleSavedSellerChange = (event, newValue) => {
    console.log('Selected seller:', newValue);
    setSelectedSeller(newValue);
    
    // Update all bike entries with the selected seller info
    const updatedEntries = bikeEntries.map(entry => ({
      ...entry,
      sellerInfo: newValue ? {
        name: newValue.SellerName,
        contactNo: newValue.SellerContactNo,
        address: newValue.SellerAddress,
        cnic: newValue.SellerCNIC,
      } : null
    }));
    setBikeEntries(updatedEntries);
  };


  // Set mileage to 0 for new bikes and prevent negative values
  const handleConditionChange = (index, value) => {
    const newEntries = [...bikeEntries];
    if (!newEntries[index]) {
      newEntries[index] = {};
    }
    newEntries[index].condition = value;
    if (value === 'new') {
      newEntries[index].registrationCity = 'NA';
      newEntries[index].registrationNumber = 'NA';
      newEntries[index].mileage = 0;
      newEntries[index].commissionPrice = 0;        // Reset commission
      newEntries[index].expenses = [];              // Clear expenses
      newEntries[index].totalExpenses = 0;          // Reset total expenses
    } else {
      newEntries[index].mileage = '';
      newEntries[index].registrationCity = '';
      newEntries[index].registrationNumber = '';
      newEntries[index].commissionPrice = 2000;     // Default commission for used bikes
      newEntries[index].expenses = [{ name: "", cost: "" }]; // Initialize expenses
      newEntries[index].totalExpenses = 0;          // Initialize total expenses
    }
    setBikeEntries(newEntries);
  };


  const clearErrors = () => {
    setErrors({});
    
  };
  
  const handleNextClick = () => {
    if (currentStep < stockQuantity - 1) {
      setCurrentStep(currentStep + 1);  // Show the next modal
    } else {
      handleAddBike();  // Trigger adding bikes when reaching the last step
    }
  };
  const handleCloseSnackbar = () => {
    setOpen(false);
    setSuccessMessage('');
  };

  const handleTypeChange = (event) => {
    setSelectedType(event.target.value);
    clearErrors();
  };


  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '500px',
    maxWidth: '90%',
    backgroundColor: '#f7fdf9',
    borderRadius: '15px',
    boxShadow: '0 8px 24px rgba(0, 128, 0, 0.2)',
    padding: '25px',
    textAlign: 'center',
    overflow: 'hidden',
  };
  
 

  return (

    <div>
      <Box
      sx={{
        position: 'relative',
        padding: 3,
        backgroundColor: '#f0f4f8',
        maxWidth: '800px',
        margin: '0 auto',
        borderRadius: '8px',
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e0e0e0',
        overflow: 'hidden',
      }}
    >
      {[...Array(3)].map((_, index) => (
        <Box
          key={index}
          sx={{
            position: 'absolute',
            borderRadius: '50%',
            backgroundColor: index % 2 === 0 ? '#15c01b' : '#81C784',
            opacity: 0.15,
            animation: `float${index + 1} ${5 + index * 2}s ease-in-out infinite`,
            width: `${80 + index * 20}px`,
            height: `${80 + index * 20}px`,
            top: `${Math.random() * 80}%`,
            left: `${Math.random() * 80}%`,
            '@keyframes float1': {
              '0%': { transform: 'translateY(0) translateX(0)' },
              '50%': { transform: 'translateY(-20px) translateX(10px)' },
              '100%': { transform: 'translateY(0) translateX(0)' },
            },
            '@keyframes float2': {
              '0%': { transform: 'translateY(0) translateX(0)' },
              '50%': { transform: 'translateY(20px) translateX(-10px)' },
              '100%': { transform: 'translateY(0) translateX(0)' },
            },
            '@keyframes float3': {
              '0%': { transform: 'translateY(0) translateX(0)' },
              '50%': { transform: 'translateY(-10px) translateX(15px)' },
              '100%': { transform: 'translateY(0) translateX(0)' },
            },
            '@keyframes float4': {
              '0%': { transform: 'translateY(0) translateX(0)' },
              '50%': { transform: 'translateY(15px) translateX(-10px)' },
              '100%': { transform: 'translateY(0) translateX(0)' },
            },
            '@keyframes float5': {
              '0%': { transform: 'translateY(0) translateX(0)' },
              '50%': { transform: 'translateY(-15px) translateX(20px)' },
              '100%': { transform: 'translateY(0) translateX(0)' },
            },
            '@keyframes float6': {
              '0%': { transform: 'translateY(0) translateX(0)' },
              '50%': { transform: 'translateY(10px) translateX(-20px)' },
              '100%': { transform: 'translateY(0) translateX(0)' },
            },
          }}
        />
      ))}

<Box
        sx={{
          position: 'absolute',
          top: '-50px',
          left: '-50px',
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          backgroundColor: '#4CAF50',
          opacity: 0.2,
          animation: 'float1 6s ease-in-out infinite',
          '@keyframes float1': {
            '0%': { transform: 'translateY(0)' },
            '50%': { transform: 'translateY(20px)' },
            '100%': { transform: 'translateY(0)' },
          },
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '-50px',
          right: '-50px',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          backgroundColor: '#4CAF50',
          opacity: 0.2,
          animation: 'float2 8s ease-in-out infinite',
          '@keyframes float2': {
            '0%': { transform: 'translateY(0)' },
            '50%': { transform: 'translateY(-20px)' },
            '100%': { transform: 'translateY(0)' },
          },
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          backgroundColor: '#4CAF50',
          opacity: 0.1,
          transform: 'translate(-50%, -50%)',
          animation: 'float3 10s ease-in-out infinite',
          '@keyframes float3': {
            '0%': { transform: 'translate(-50%, -50%)' },
            '50%': { transform: 'translate(-50%, -30%)' },
            '100%': { transform: 'translate(-50%, -50%)' },
          },
        }}
      />

{Object.keys(errors).length > 0 && (
    <ul>
      {Object.entries(errors).map(([key, value]) => (
        <li key={key} style={{ color: "red" }}>
          {value}
        </li>
      ))}
    </ul>
  )}
      <Box
        component="form"
        noValidate
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            marginBottom: '7px',
            fontWeight: 'bold',
            color: '#4CAF50',
            fontSize: '1.5rem',
            textAlign: 'center',
          }}
        >
          Add Bikes
        </Typography>

        <Divider sx={{ marginBottom: '20px' }} />

        <Box sx={{ maxHeight: '320px', overflowY: 'auto', padding: '8px' }}>
          <FormControl fullWidth variant="outlined" sx={{ marginBottom: 2 }}>
            <InputLabel>Bike Type</InputLabel>
            <Select
              label="Bike Type"
              name="bikeType"
              value={selectedType}
              onChange={handleTypeChange}
              // onChange={(e) => setSelectedType(e.target.value)}
              required
              sx={{ textAlign: 'left' }}
            >
              <MenuItem value="Electric">Electric</MenuItem>
              <MenuItem value="Non-Electric">Non-Electric</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth variant="outlined" sx={{ marginBottom: 2 }}>
            <Autocomplete
              options={manufacturers.map((manufacturer) => manufacturer.name)}
              value={selectedManufacturer}
              onChange={handleManufacturerChange}
              // onChange={(event, newValue) => setSelectedManufacturer(newValue)}
              disableClearable
              renderInput={(params) => (
                <TextField {...params} label="Select Manufacturer" required />
              )}
            />
            {errors.selectedManufacturer && <FormHelperText error>{errors.selectedManufacturer}</FormHelperText>}
          </FormControl>

          <FormControl fullWidth variant="outlined" sx={{ marginBottom: 2 }}>
            <Autocomplete
              options={models}
              value={selectedModel}
              onChange={(event, newValue) => {
                setSelectedModel(newValue);
                clearErrors();
              }}
              disableClearable
              renderInput={(params) => (
                <TextField {...params} label="Select Model" required />
              )}
            />
            {errors.selectedModel && <FormHelperText error>{errors.selectedModel}</FormHelperText>}
          </FormControl>

          <FormControl fullWidth variant="outlined" sx={{ marginBottom: 2 }}>
            <TextField
              label="Model Year"
              variant="outlined"
              select
              value={modelYear}
              onChange={(e) => setModelYear(e.target.value)}
            >
              {[...Array(50)].map((_, i) => {
                const year = new Date().getFullYear() - i;
                return (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                );
              })}
            </TextField>
          </FormControl>

          <FormControl fullWidth variant="outlined" sx={{ marginBottom: 2 }}>
            <InputLabel>Seller Type</InputLabel>
            <Select
              label="Seller Type"
              name="sellerType"
              value={sellerType}
              // onChange={(e) => setSellerType(e.target.value)}
              onChange={handleSellerTypeChange}
            >
              <MenuItem value="saved">Saved Seller</MenuItem>
              <MenuItem value="manual">Manual Entry</MenuItem>
            </Select>
            {errors.sellerType && <FormHelperText error>{errors.sellerType}</FormHelperText>}
          </FormControl>

          <FormControl fullWidth variant="outlined" sx={{ marginBottom: 2 }}>
            <TextField
              type="number"
              label="Stock Quantity"
              value={stockQuantity}
              // onChange={(e) => setStockQuantity(e.target.value)}
              onChange={handleStockQuantityChange}
              required
              InputProps={{
                inputProps: { 
                  min: 0,
                  style: { 
                    appearance: 'none', 
                    MozAppearance: 'textfield', 
                    WebkitAppearance: 'none',
                  }
                },
              }}
            />
            {errors.stockQuantity && <FormHelperText error>{errors.stockQuantity}</FormHelperText>}
          </FormControl>

          <Button
            variant="contained"
            color="primary"
            onClick={() => setOpen(true)}
            disabled={isDisabled}
            sx={{
              textTransform: 'none',
              padding: '8px 16px',
              fontWeight: 'bold',
              whiteSpace: 'nowrap',
              marginTop: { xs: 2, sm: 0 },
              marginLeft: 'auto',  
              marginRight: 2,
              width: '150px',
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',  
              borderRadius: '30px',
              textAlign: 'center',  
              '&:hover': {
                backgroundColor: isDisabled ? 'primary.main' : 'green',
                transform: isDisabled ? 'none' : 'scale(1.1)',
                transition: 'transform 0.2s ease-in-out',
              },
            }}
          >
            Next
          </Button>



        </Box>
      </Box>
    </Box>

    <Modal open={open} onClose={() => setOpen(false)}  fullWidth maxWidth="sm"> 
    <Box sx={{ ...modalStyle, position: 'relative', padding: 3, maxHeight: '80vh', overflowY: 'auto' }}>
    {Array.from({ length: stockQuantity }).map((_, index) => (

      <Box
        key={index}
        component="form"
        noValidate
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          position: 'relative',
          marginBottom: '20px',
          padding: 2,
          border: '1px solid #E0E0E0',
          borderRadius: '8px',
          backgroundColor: '#fafafa',
        }}
      >
        <IconButton
          onClick={() => setOpen(false)}
          sx={{
            position: 'absolute',
            right: '15px',
            color: '#4CAF50',
            '&:hover': { color: 'red', transform: 'scale(1.1)', transition: 'transform 0.2s ease-in-out' },
          }}
        >
          <CloseIcon />
        </IconButton>
        <Typography variant="h5" sx={{ marginBottom: '7px', fontWeight: 'bold', color: '#4CAF50', fontSize: '1.5rem' }}>
          Bike number {index + 1} detail
        </Typography>
          <Divider sx={{ marginBottom: '20px' }} />


            <Box
              sx={{
                maxHeight: '320px',
                overflowY: 'auto',
                paddingRight: '8px',
              }}
            >
              {selectedType === 'Electric' ? (
                // Electric bike fields
                <>
                  <FormControl fullWidth variant="outlined" sx={{ marginBottom: 2, marginTop: 1 }}>
                    <TextField
                      label="Motor Number"
                      name="motorNo"
                      value={bikeEntries[index]?.motorNo || ''}
                      onChange={(e) => handleEntryChange(index, e)}
                      error={!!errors[`motorNo${index}`]}
                      helperText={errors[`motorNo${index}`]}
                    />
                  </FormControl>

                  <FormControl fullWidth variant="outlined" sx={{ marginBottom: 2 }}>
                    <TextField
                      label="Frame Number"
                      name="frameNo"
                      value={bikeEntries[index]?.frameNo || ''}
                      onChange={(e) => handleEntryChange(index, e)}
                      error={!!errors[`frameNo${index}`]}
                      helperText={errors[`frameNo${index}`]}
                    />
                  </FormControl>
                </>
              ) : (
                // Non-Electric bike fields
                <>
                  <FormControl fullWidth variant="outlined" sx={{ marginBottom: 2, marginTop: 1 }}>
                    <TextField
                      label="Chassis Number"
                      name="chassisNumber"
                      value={bikeEntries[index]?.chassisNumber || ''}
                      onChange={(e) => handleEntryChange(index, e)}
                      error={!!errors[`chassisNumber${index}`]}
                      helperText={errors[`chassisNumber${index}`]}
                    />
                  </FormControl>

                  <FormControl fullWidth variant="outlined" sx={{ marginBottom: 2 }}>
                    <TextField
                      label="Engine Number"
                      name="engineNo"
                      value={bikeEntries[index]?.engineNo || ''}
                      onChange={(e) => handleEntryChange(index, e)}
                      error={!!errors[`engineNo${index}`]}
                      helperText={errors[`engineNo${index}`]}
                    />
                  </FormControl>
                </>
              )}

              <FormControl fullWidth variant="outlined" sx={{ marginBottom: 2 }}>
                <InputLabel>Condition</InputLabel>
                <Select
                    value={bikeEntries[index]?.condition || ''}
                    onChange={(e) => handleConditionChange(index, e.target.value)}
                    name="condition"
                    label="Condition"
                    sx={{ textAlign: 'left' }}
                    required
                >
                      {role.role !== 'used-bikes' && (<MenuItem value="new">New</MenuItem>)}
                    <MenuItem value="used">Used</MenuItem>
                </Select>
            </FormControl>


              <FormControl fullWidth variant="outlined" sx={{ marginBottom: 2}}>
                <TextField
                    label="Registration Number"
                    name="registrationNumber"
                    value={bikeEntries[index]?.registrationNumber || ''}
                    onChange={(e) => handleEntryChange(index, e)}
                    disabled={bikeEntries[index]?.condition === 'new'}
                    required={bikeEntries[index]?.condition !== 'new'}
                    />
                    {errors[`registrationNumber${index}`] && <FormHelperText error>{errors[`registrationNumber${index}`]}</FormHelperText>}
              </FormControl>

              <FormControl fullWidth variant="outlined" sx={{ marginBottom: 2}}>
                <TextField
                    type="number"
                    fullWidth
                    label="Mileage"
                    name="mileage"
                    value={bikeEntries[index]?.mileage || ''} // Use optional chaining to prevent accessing undefined
                    onChange={(e) => handleEntryChange(index, e)}
                    required={bikeEntries[index]?.condition === 'used'} // Require mileage if condition is 'used'
                  />
                  {errors[`mileage${index}`] && <FormHelperText error>{errors[`mileage${index}`]}</FormHelperText>}
              </FormControl>

              <FormControl fullWidth variant="outlined" sx={{ marginBottom: 2}}>
                <Autocomplete
                  options={cities}
                  value={bikeEntries[index]?.registrationCity || ''}
                  onChange={(e, value) => {
                    const newEntries = [...bikeEntries];
                    newEntries[index] = { ...newEntries[index], registrationCity: value };
                    setBikeEntries(newEntries);
                  }}
                  disabled={bikeEntries[index]?.condition === 'new'}
                  renderInput={(params) => (
                    <TextField {...params} label="Registration City" required={bikeEntries[index]?.condition !== 'new'} />
                  )}
                />
                {errors[`registrationCity${index}`] && <FormHelperText error>{errors[`registrationCity${index}`]}</FormHelperText>}
              </FormControl>

              {/* Commission Price and Expenses - Only shown for used bikes */}
{bikeEntries[index]?.condition === 'used' && (
  <>
    <FormControl fullWidth variant="outlined" sx={{ marginBottom: 2 }}>
      <TextField
        label="Commission Price"
        type="number"
        name="commissionPrice"
        value={bikeEntries[index]?.commissionPrice || 2000}
        onChange={(e) => {
          const newEntries = [...bikeEntries];
          newEntries[index].commissionPrice = Number(e.target.value);
          setBikeEntries(newEntries);
        }}
        InputProps={{
          inputProps: { min: 0 }
        }}
      />
    </FormControl>

    <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, fontWeight: 'medium' }}>
      Additional Expenses
    </Typography>
    
    {bikeEntries[index]?.expenses?.map((expense, expenseIndex) => (
      <Box key={expenseIndex} sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          label="Expense Name"
          value={expense.name}
          onChange={(e) => handleExpenseChange(index, expenseIndex, 'name', e.target.value)}
          sx={{ flex: 1 }}
        />
        <TextField
          label="Cost"
          type="number"
          value={expense.cost}
          onChange={(e) => handleExpenseChange(index, expenseIndex, 'cost', e.target.value)}
          sx={{ flex: 1 }}
        />
        {expenseIndex > 0 && (
          <IconButton 
            onClick={() => removeExpenseField(index, expenseIndex)}
            sx={{ color: 'error.main' }}
          >
            <DeleteIcon />
          </IconButton>
        )}
      </Box>
    ))}
    
    <Button
      startIcon={<AddIcon />}
      onClick={() => addExpenseField(index)}
      sx={{
        mb: 2,
        color: '#4CAF50',
        borderColor: '#4CAF50',
        '&:hover': {
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          borderColor: '#4CAF50',
        },
      }}
    >
      Add Expense
    </Button>

    {/* Price Summary Box */}
    <Box sx={{ 
      mt: 2, 
      p: 2, 
      bgcolor: 'rgba(76, 175, 80, 0.1)', 
      borderRadius: 1,
      border: '1px solid #4CAF50'
    }}>
      <Typography sx={{ mb: 1 }}>Base Price: ₨ {bikeEntries[index]?.purchasePrice || 0}</Typography>
      <Typography sx={{ mb: 1 }}>Commission: ₨ {bikeEntries[index]?.commissionPrice || 0}</Typography>
      <Typography sx={{ mb: 1 }}>Total Expenses: ₨ {bikeEntries[index]?.totalExpenses || 0}</Typography>
      <Divider sx={{ my: 1 }} />
      <Typography fontWeight="bold">
        Final Price: ₨ {
          (Number(bikeEntries[index]?.purchasePrice) || 0) +
          (Number(bikeEntries[index]?.commissionPrice) || 0) +
          (Number(bikeEntries[index]?.totalExpenses) || 0)
        }
      </Typography>
    </Box>
  </>
)}

              <FormControl fullWidth variant="outlined" sx={{ marginBottom: 2}}>
                <TextField
                  label="Purchase Price"
                  variant="outlined"
                  fullWidth
                  type="number"
                  name="purchasePrice"
                  value={bikeEntries[index]?.purchasePrice || ''} // Use optional chaining
                  onChange={(e) => handleEntryChange(index, e)}
                  error={!!errors[`purchasePrice${index}`]}
                  helperText={errors[`purchasePrice${index}`]}
                  />
              </FormControl>

              <FormControl fullWidth variant="outlined" sx={{ marginBottom: 2}}>
                <TextField
                  label="Purchase Date"
                  variant="outlined"
                  fullWidth
                  type="date"
                  name="purchaseDate"
                  value={bikeEntries[index]?.purchaseDate || purchaseDate} // Change entry to bikeEntries[index]
                  onChange={(e) => handleEntryChange(index, e)}
                  error={!!errors[`purchaseDate${index}`]}
                  helperText={errors[`purchaseDate${index}`]}
                  
                />
              </FormControl>

              {sellerType === 'manual' && (
                <>

                <FormControl fullWidth variant="outlined" sx={{ marginBottom: 2}}>
                  <TextField
                    label="Seller Name"
                    name="sellerName"
                    onChange={(e) => setSellerName(e.target.value)}
                  />
                  {errors[`sellerName${index}`] && <FormHelperText error>{errors[`sellerName${index}`]}</FormHelperText>}

                </FormControl>

                <FormControl fullWidth variant="outlined" sx={{ marginBottom: 2}}>
                  <TextField
                    label="Contact Number"
                    name="contactNo"
                    onChange={(e) => setSellerContactNo(e.target.value)}
                  />
                  {errors[`contactNo${index}`] && <FormHelperText error>{errors[`contactNo${index}`]}</FormHelperText>}
                </FormControl>
                      
                <FormControl fullWidth variant="outlined" sx={{ marginBottom: 2}}>
                  <TextField
                    label="Address"
                    name="address"
                    onChange={(e) => setSellerAddress(e.target.value)}
                  />
                  {errors[`address${index}`] && <FormHelperText error>{errors[`address${index}`]}</FormHelperText>}
                </FormControl>
                      
                <FormControl fullWidth variant="outlined" sx={{ marginBottom: 2}}>
                  <TextField
                    
                    label="CNIC"
                    name="cnic"
                    onChange={(e) => setSellerCNIC(e.target.value)}
                  />
                  {errors[`cnic${index}`] && <FormHelperText error>{errors[`cnic${index}`]}</FormHelperText>}
                </FormControl>  
                </>
              )}
              {sellerType === 'saved' && (
                <FormControl fullWidth variant="outlined" sx={{ marginBottom: 2}}>
                  <Autocomplete
                    options={savedSellers}
                    getOptionLabel={(option) => option.SellerName || ''}
                    value={selectedSeller}
                    onChange={handleSavedSellerChange}
                    renderInput={(params) => <TextField {...params} label="Select Saved Seller" />}
                    renderOption={(props, option) => (
                      <li {...props} key={option.id}>
                        {option.SellerName}
                      </li>
                    )}
                  />
                  {errors[`sellerInfo${index}`] && <FormHelperText error>{errors[`sellerInfo${index}`]}</FormHelperText>}
                </FormControl>
                )}
<FormControl fullWidth variant="outlined" sx={{ marginBottom: 2}}>
  <TextField
    type="text"
    multiline
    rows={4}
    fullWidth
    label="Warranty"
    name="warranty"
    value={bikeEntries[index]?.warranty || bikeModels.find(model => model.modelName === selectedModel)?.warranty || ''}
    onChange={(e) => handleEntryChange(index, e)}
    placeholder="Enter warranty details..."
    sx={{
      backgroundColor: '#ffffff'  // Changed from #f5f5f5 to show it's editable
    }}
  />
</FormControl>
            </Box>
            <DialogActions sx={{ padding: 2 }}>
           
        {/* Conditionally render buttons */}
        {currentStep < stockQuantity - 1 ? (
          <Button variant="contained" color="primary" onClick={handleNextClick}>
            Next
          </Button>
        ) : (
          <>
          <Button
  variant="outlined"
  onClick={() => setCreditPurchaseModalOpen(true)}
  sx={{
    marginRight: 2,
    textTransform: 'none',
    padding: '8px 16px',
    fontWeight: 'bold',
    borderRadius: '30px',
    '&:hover': {
      backgroundColor: 'rgba(76, 175, 80, 0.1)',
      transform: 'scale(1.02)',
    },
  }}
>
  Credit Purchase
</Button>
          
<Button type="submit" variant="contained" color="primary" onClick={handleSubmit}>
            Add Bikes
          </Button>
          </>
          
          
        )}
      </DialogActions>
        </Box>

      ))}
      </Box>
      

    </Modal> 
    <BikePurchaseCreditModal
  open={creditPurchaseModalOpen}
  onClose={() => setCreditPurchaseModalOpen(false)}
  bikeData={{
    manufacturer: selectedManufacturer,
    model: selectedModel,
    type: selectedType,
    ...bikeEntries[currentStep]
  }}
  seller={sellerType === 'saved' ? selectedSeller : {
    name: sellerName,
    contactNo: sellerContactNo,
    address: sellerAddress,
    cnic: SellerCNIC
  }}
  priceDetails={{
    purchasePrice: bikeEntries[currentStep]?.purchasePrice || 0,
    commissionPrice: bikeEntries[currentStep]?.commissionPrice || 0,
    totalExpenses: bikeEntries[currentStep]?.totalExpenses || 0,
    finalPrice: (Number(bikeEntries[currentStep]?.purchasePrice) || 0) +
                (Number(bikeEntries[currentStep]?.commissionPrice) || 0) +
                (Number(bikeEntries[currentStep]?.totalExpenses) || 0)
  }}
/>
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'Right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </div>
  );
};
export default AddBike;
