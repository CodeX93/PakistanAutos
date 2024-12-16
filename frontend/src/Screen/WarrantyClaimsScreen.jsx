import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Breadcrumbs,
  Link,
  Typography,
  Button,
  CircularProgress,
  InputAdornment,
  useTheme,
  TablePagination
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import url from '../baseUrl';

const WarrantyClaimsScreen = () => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('All');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);

  useEffect(() => {
    const fetchClaims = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${url}/warranty/`);
        const data = await response.json();
        setClaims(data.claims || []);
      } catch (error) {
        console.error('Error fetching claims:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClaims();
  }, []);

  const toggleClaimStatus = async (id, currentStatus) => {
    try {
      const updatedStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await fetch(`${url}/warranty/update/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ saleStatus: updatedStatus }),
      });

      setClaims((prevClaims) =>
        prevClaims.map((claim) =>
          claim.id === id ? { ...claim, saleStatus: updatedStatus } : claim
        )
      );
    } catch (error) {
      console.error('Error updating claim status:', error);
    }
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };
  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const filteredClaims = claims.filter((claim) => {
    const matchesFilter =
      filterType === 'All' ||
      (filterType === 'Active' && claim.saleStatus === 'active') ||
      (filterType === 'Claimed' && claim.saleStatus === 'inactive');
    const matchesSearch = claim.productDetails.productName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <Box sx={{ padding: '20px', maxWidth: '1200px', margin: 'auto' }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ marginBottom: '10px' }}>
          <Typography variant="h4" sx={{ padding: '5px', fontWeight: 'bold' }} color="primary">
            Warranty Claims
          </Typography>

          <TextField
            label="Search by Product Name"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{
              width: '400px', 
              backgroundColor: theme.palette.background.paper,
              borderRadius: '12px',
            }}
          />
      </Box>

  <Breadcrumbs aria-label="breadcrumb" sx={{ marginBottom: '30px', fontSize: '1.1rem', fontWeight: '500' }}>

<Link
      color={filterType === 'All' ? 'textPrimary' : theme.palette.text.secondary}
      onClick={() => setFilterType('All')}
      underline="hover"
      sx={{
        padding: '5px',
        cursor: 'pointer',
        fontSize: '1.1rem',
        '&:hover': { color: theme.palette.primary.main },
      }}
    >
      All
    </Link>
    <Link
          color={filterType === 'Active' ? 'textPrimary' : theme.palette.text.secondary}
          onClick={() => setFilterType('Active')}
          underline="hover"
          sx={{
            cursor: 'pointer',
            fontSize: '1.1rem',
            '&:hover': { color: theme.palette.primary.main },
          }}
        >
          Active
        </Link>
        <Link
          color={filterType === 'Claimed' ? 'textPrimary' : theme.palette.text.secondary}
          onClick={() => setFilterType('Claimed')}
          underline="hover"
          sx={{
            cursor: 'pointer',
            fontSize: '1.1rem',
            '&:hover': { color: theme.palette.primary.main },
          }}
        >
        Claimed
        </Link>
      </Breadcrumbs>

      

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
          <CircularProgress />
        </Box>
      ) : filteredClaims.length > 0 ? (
        <TableContainer
          component={Paper}
          sx={{ borderRadius: '12px', boxShadow: theme.shadows[4] }}
        >
          <Table>
            <TableHead>
              <TableRow>
                {[
                  'Product Name',
                  'Category',
                  'Condition',
                  'Quantity',
                  'Unit Price',
                  'Sale Status',
                  'Action',
                ].map((header) => (
                  <TableCell
                    key={header}
                    sx={{ fontWeight: 'bold', fontSize: '1rem', backgroundColor: theme.palette.grey[200] }}                  >
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredClaims.map((claim) => (
                <TableRow
                  key={claim.id}
                  hover
                  sx={{
                    '&:nth-of-type(odd)': { backgroundColor: theme.palette.grey[50] },
                  }}
                >
                  <TableCell>{claim.productDetails.productName}</TableCell>
                  <TableCell>{claim.productDetails.category}</TableCell>
                  <TableCell>{claim.productDetails.condition}</TableCell>
                  <TableCell>{claim.productDetails.quantity}</TableCell>
                  <TableCell>${claim.productDetails.unitPrice}</TableCell>
                  <TableCell>{claim.saleStatus}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      size="small"
                      color={claim.saleStatus === 'active' ? 'secondary' : 'primary'}
                      onClick={() => toggleClaimStatus(claim.id, claim.saleStatus)}
                      sx={{
                        textTransform: 'none',
                        '&:hover': {
                          backgroundColor:
                            claim.saleStatus === 'active'
                              ? theme.palette.error.main
                              : theme.palette.success.main,
                          color: '#fff',
                        },
                      }}
                    >
                      Mark as {claim.saleStatus === 'active' ? 'Claimed' : 'Active'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

      ) : (
        <Box sx={{ textAlign: 'center', marginTop: '20px' }}>
          <Typography variant="h6" color="textSecondary">
            No claims found.
          </Typography>
        </Box>
      )}
       <TablePagination
        component="div"
        count={filteredClaims.length}
        page={page}
        onPageChange={handlePageChange}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleRowsPerPageChange}
        rowsPerPageOptions={[10, 25, 50]}
      />
    </Box>
  );
};

export default WarrantyClaimsScreen;
