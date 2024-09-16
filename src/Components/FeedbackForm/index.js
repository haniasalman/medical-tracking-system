import React, { useState } from 'react';
import { TextField, Button, Typography, Grid, Snackbar, Alert, FormControl, InputLabel, MenuItem, Select } from '@mui/material';

function FeedbackForm() {
  const [feedback, setFeedback] = useState({
    medication: '',
    intakeStatus: '',
    dosage: '',
    sideEffects: ''
  });

  const [errors, setErrors] = useState({});
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const validate = () => {
    let tempErrors = {};
    tempErrors.medication = feedback.medication ? '' : 'Medication name is required.';
    tempErrors.intakeStatus = feedback.intakeStatus ? '' : 'Please specify whether you took the medication.';
    tempErrors.dosage = feedback.intakeStatus === 'Yes' ? (feedback.dosage ? '' : 'Dosage is required if medication was taken.') : '';
    setErrors(tempErrors);
    return Object.values(tempErrors).every((error) => error === '');
  };

  const handleSubmit = () => {
    if (validate()) {
      console.log('Feedback submitted:', feedback);
      setOpenSnackbar(true); // Open success message
      // Reset form after submission
      setFeedback({
        medication: '',
        intakeStatus: '',
        dosage: '',
        sideEffects: ''
      });
      setErrors({});
    }
  };

  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };

  return (
    <Grid container spacing={2} style={{ padding: '20px' }}>
      <Grid item xs={12}>
        <Typography variant="h5">Medication Feedback</Typography>
      </Grid>

      {/* Medication Name */}
      <Grid item xs={12}>
        <TextField
          label="Medication Name"
          fullWidth
          variant="outlined"
          value={feedback.medication}
          onChange={(e) => setFeedback({ ...feedback, medication: e.target.value })}
          error={Boolean(errors.medication)}
          helperText={errors.medication}
        />
      </Grid>

      {/* Intake Status (Yes/No) */}
      <Grid item xs={12}>
        <FormControl fullWidth variant="outlined" error={Boolean(errors.intakeStatus)}>
          <InputLabel>Did you take the medication?</InputLabel>
          <Select
            label="Did you take the medication?"
            value={feedback.intakeStatus}
            onChange={(e) => setFeedback({ ...feedback, intakeStatus: e.target.value })}
          >
            <MenuItem value="Yes">Yes</MenuItem>
            <MenuItem value="No">No</MenuItem>
          </Select>
          {errors.intakeStatus && (
            <Typography variant="caption" color="error">
              {errors.intakeStatus}
            </Typography>
          )}
        </FormControl>
      </Grid>

      {/* Dosage */}
      {feedback.intakeStatus === 'Yes' && (
        <Grid item xs={12}>
          <TextField
            label="Dosage Taken"
            fullWidth
            variant="outlined"
            value={feedback.dosage}
            onChange={(e) => setFeedback({ ...feedback, dosage: e.target.value })}
            error={Boolean(errors.dosage)}
            helperText={errors.dosage}
            placeholder='e.g: 5mg tablet 3 times a day'
          />
        </Grid>
      )}

      {/* Side Effects */}
      <Grid item xs={12}>
        <TextField
          label="Side Effects (if any)"
          fullWidth
          variant="outlined"
          multiline
          rows={4}
          value={feedback.sideEffects}
          onChange={(e) => setFeedback({ ...feedback, sideEffects: e.target.value })}
        />
      </Grid>

      {/* Submit Button */}
      <Grid item xs={12}>
        <Button variant="contained" color="primary" onClick={handleSubmit} fullWidth>
          Submit Feedback
        </Button>
      </Grid>

      {/* Snackbar for submission feedback */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          Feedback submitted successfully!
        </Alert>
      </Snackbar>
    </Grid>
  );
}

export default FeedbackForm;
