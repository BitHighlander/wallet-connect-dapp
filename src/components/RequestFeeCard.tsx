import React, { useState, useEffect, Fragment } from 'react';
import { FormControl, FormControlLabel, Radio, RadioGroup, TextField, Typography, Alert, Button } from '@mui/material';
import { EIP155_CHAINS } from "@/data/EIP155Data";
import { JsonRpcProvider } from "ethers";

const RequestFeeCard = ({ data, updateFeeData }: any) => {
  const [selectedFee, setSelectedFee] = useState('dappSuggested');
  const [customFee, setCustomFee] = useState('');
  const [dappProvidedFee, setDappProvidedFee] = useState(false);
  const [displayFee, setDisplayFee] = useState('');
  const [feeWarning, setFeeWarning] = useState(false);
  const [isEIP1559, setIsEIP1559] = useState(false);
  const [fees, setFees] = useState<any>({
    dappSuggested: '',
    networkRecommended: ''
  });

  const getFee = async () => {
    try {
      const network = 'eip155:1'; // TODO: Get the current chain
      const rpcUrl = EIP155_CHAINS[network].rpc;
      const provider = new JsonRpcProvider(rpcUrl);
      const feeData = await provider.getFeeData();
      console.log("** feeData: ", feeData);

      const networkRecommendedFee = feeData.gasPrice
          ? (BigInt(feeData.gasPrice.toString()) / BigInt(1e9)).toString() // Convert from Wei to Gwei
          : '';

      setFees((prevFees:any) => ({
        ...prevFees,
        networkRecommended: networkRecommendedFee,
      }));

      setFeeWarning(false);
    } catch (e) {
      console.error('Error fetching fee data:', e);
      setFeeWarning(true);
    }
  };

  useEffect(() => {
    console.log("** data: ", data);

    if (!data.maxPriorityFeePerGas && !data.maxFeePerGas && !data.gasPrice) {
      getFee();
      setDappProvidedFee(false);
    } else {
      // If data is provided, use it and display it
      setDappProvidedFee(true);
      setFees((prevFees:any) => ({
        ...prevFees,
        dappSuggested: (BigInt(data?.gasPrice.toString()) / BigInt(1e9)).toString(), // Convert from Wei to Gwei
      }));
    }
  }, [data]);

  useEffect(() => {
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

  const handleSubmit = () => {
    let selectedFeeData;
    const feeInGwei = selectedFee === 'custom' ? customFee : fees[selectedFee];

    if (isEIP1559) {
      const baseFeeInWei = BigInt(feeInGwei) * BigInt(1e9);
      const priorityFeeInWei = BigInt(2 * 1e9); // Example priority fee of 2 Gwei
      const maxFeeInWei = baseFeeInWei + priorityFeeInWei;

      selectedFeeData = {
        gasPrice: baseFeeInWei.toString(),
        maxFeePerGas: maxFeeInWei.toString(),
        maxPriorityFeePerGas: priorityFeeInWei.toString()
      };
    } else {
      const gasPriceInWei = BigInt(feeInGwei) * BigInt(1e9);
      selectedFeeData = {
        gasPrice: gasPriceInWei.toString(),
        maxFeePerGas: gasPriceInWei.toString(),
        maxPriorityFeePerGas: gasPriceInWei.toString()
      };
    }

    // Convert to hex format
    const feeDataHex = {
      gasPrice: `0x${BigInt(selectedFeeData.gasPrice).toString(16)}`,
      maxFeePerGas: `0x${BigInt(selectedFeeData.maxFeePerGas).toString(16)}`,
      maxPriorityFeePerGas: `0x${BigInt(selectedFeeData.maxPriorityFeePerGas).toString(16)}`
    };

    updateFeeData(feeDataHex);
  };

  return (
      <Fragment>
        {!dappProvidedFee && (
            <Alert severity="warning">Dapp failed to return fee, using recommended fee</Alert>
        )}
        <FormControl component="fieldset">
          <RadioGroup aria-label="fee" name="fee" value={selectedFee} onChange={handleFeeChange}>
            {dappProvidedFee && (
                <FormControlLabel
                    value="dappSuggested"
                    control={<Radio />}
                    label={`DApp Suggested Fee (${fees.dappSuggested} Gwei)`}
                />
            )}
            {fees.networkRecommended && (
                <FormControlLabel
                    value="networkRecommended"
                    control={<Radio />}
                    label={`Network Recommended Fee (${fees.networkRecommended} Gwei)`}
                />
            )}
            <FormControlLabel value="custom" control={<Radio />} label="Custom Fee" />
          </RadioGroup>
          {selectedFee === 'custom' && (
              <TextField
                  variant="outlined"
                  value={customFee}
                  onChange={handleCustomFeeChange}
                  fullWidth
                  margin="normal"
                  type="number"
                  InputProps={{
                    style: { backgroundColor: 'white', color: 'black' }
                  }}
              />
          )}
        </FormControl>
        <Typography variant="h6" style={{ marginTop: '20px' }}>
          Current Fee: {displayFee}
        </Typography>
        <Button variant="contained" color="primary" onClick={handleSubmit} style={{ marginTop: '20px' }}>
          Submit Fee
        </Button>
      </Fragment>
  );
};

export default RequestFeeCard;
