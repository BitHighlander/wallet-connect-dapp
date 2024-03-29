import React, { useState, useEffect, Fragment } from 'react';
import { FormControl, FormControlLabel, Radio, RadioGroup, TextField, Typography } from '@mui/material';

const RequestFeeCard = ({ data }: any) => {
  const [selectedFee, setSelectedFee] = useState('dappSuggested');
  // Initialize customFee with the DApp suggested fee
  const dappSuggestedFee = '200'; // Example value in Gwei
  const [customFee, setCustomFee] = useState(dappSuggestedFee);
  const [displayFee, setDisplayFee] = useState('');

  // Sample data for DApp Suggested and Network Recommended fees
  const fees: any = {
    dappSuggested: dappSuggestedFee,
    networkRecommended: '180', // Example value in Gwei
  };

  useEffect(() => {
    // Update displayFee whenever selectedFee or customFee changes
    if (selectedFee === 'custom') {
      setDisplayFee(customFee + ' Gwei');
    } else {
      setDisplayFee(fees[selectedFee] + ' Gwei');
    }
  }, [selectedFee, customFee, fees]);

  const handleFeeChange = (event: any) => {
    setSelectedFee(event.target.value);
  };

  const handleCustomFeeChange = (event: any) => {
    setCustomFee(event.target.value);
  };

  return (
    <Fragment>
      <FormControl component="fieldset">
        <RadioGroup aria-label="fee" name="fee" value={selectedFee} onChange={handleFeeChange}>
          <FormControlLabel value="dappSuggested" control={<Radio />} label={`DApp Suggested Fee (${fees.dappSuggested} Gwei)`} />
          <FormControlLabel value="networkRecommended" control={<Radio />} label={`Network Recommended Fee (${fees.networkRecommended} Gwei)`} />
          <FormControlLabel value="custom" control={<Radio />} label="Custom Fee" />
        </RadioGroup>
        {selectedFee === 'custom' && (
          <TextField
            label="Custom Fee in Gwei"
            variant="outlined"
            value={customFee}
            onChange={handleCustomFeeChange}
            fullWidth
            margin="normal"
            inputProps={{ style: { color: 'white' } }}
            // Set the input type as number to facilitate numeric input
            type="number"
          />
        )}
      </FormControl>
      <Typography variant="h6" style={{ marginTop: '20px' }}>
        Current Fee: {displayFee}
      </Typography>
    </Fragment>
  );
};

export default RequestFeeCard;
