import React, { useState } from 'react';
import { TextField, Button, Typography, Grid } from '@mui/material';

function PrescriptionForm() {
  const [prescription, setPrescription] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleParse = async () => {
    setLoading(true);
    setError('');

    const apiKey = process.env.REACT_APP_OPENAI_API_KEY

    console.log('apiKey',apiKey)
    try {
      const response = await fetch('https://api.openai.com/v1/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'gpt-4o', // Use the appropriate model
            messages: [
              { role: 'system', content: 'You are a helpful assistant.' },
              { role: 'user', content: `Extract details from the following prescription: "${prescription}"` }
            ],
            max_tokens: 100,
            temperature: 0.5,
          }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          setError('Quota exceeded. Please check your plan and billing details.');
        } else {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
      }

      const data = await response.json();
      const parsedData = data.choices[0]?.text.trim() || 'No data found';
      setParsedData(parsedData);
    } catch (error) {
      setError('Error parsing prescription');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h5">Prescription Parser</Typography>
        <TextField
          label="Enter Prescription"
          fullWidth
          variant="outlined"
          value={prescription}
          onChange={(e) => setPrescription(e.target.value)}
          multiline
          rows={4}
        />
      </Grid>
      <Grid item xs={12}>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleParse}
          disabled={loading}
        >
          {loading ? 'Parsing...' : 'Parse Prescription'}
        </Button>
      </Grid>

      {/* Display Parsed Data */}
      {parsedData && (
        <Grid item xs={12}>
          <Typography variant="body1">
            <strong>Parsed Data:</strong> {parsedData}
          </Typography>
        </Grid>
      )}

      {/* Display Error Message */}
      {error && (
        <Grid item xs={12}>
          <Typography variant="body1" color="error">
            {error}
          </Typography>
        </Grid>
      )}
    </Grid>
  );
}

export default PrescriptionForm;
