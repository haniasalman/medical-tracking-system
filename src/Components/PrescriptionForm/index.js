import React, { useState, useEffect } from 'react';
import { TextField, Button, Typography, Grid, Snackbar, Alert, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../../backend/firebaseConfigure'; // Import Firestore instance
import dayjs from 'dayjs';

function PrescriptionForm() {
  const [prescription, setPrescription] = useState({
    medication: '',
    dosage: '',
    frequency: '',
    startDate: '',
    endDate: '',
    instructions: '',
    doctor: ''
  });

  const [errors, setErrors] = useState({});
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [patientId, setPatientId] = useState(null);
  const [submittedPrescription, setSubmittedPrescription] = useState(null);

  // Fetch the patient profile to get the patientId (doc.id)
  const fetchPatientId = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'patients'));
      if (!querySnapshot.empty) {
        const patientDoc = querySnapshot.docs[0]; // Assuming we're using the first patient for the demo
        setPatientId(patientDoc.id); // Store patientId
      }
    } catch (error) {
      console.error('Error fetching patient: ', error);
    }
  };

  useEffect(() => {
    fetchPatientId(); // Fetch patient ID when the component mounts
  }, []);

  const validate = () => {
    let tempErrors = {};
    tempErrors.medication = prescription.medication ? '' : 'Medication name is required.';
    tempErrors.dosage = prescription.dosage ? '' : 'Dosage is required.';
    tempErrors.frequency = prescription.frequency ? '' : 'Frequency is required.';
    tempErrors.startDate = prescription.startDate ? '' : 'Start date is required.';
    tempErrors.endDate = prescription.endDate ? '' : 'End date is required.';
    tempErrors.doctor = prescription.doctor ? '' : 'Doctor’s name is required.';
    setErrors(tempErrors);
    return Object.values(tempErrors).every((error) => error === '');
  };

  const handleSubmit = async () => {
    if (validate() && patientId) {
      try {
        // Save prescription to Firestore under the patient's sub-collection "prescriptions"
        const docRef = await addDoc(collection(db, 'prescriptions'), {
          ...prescription,
          patientId, // Link the prescription to the patient
          timestamp: new Date(), // Optional: Add a timestamp
        });
        setSnackbarMessage('Prescription added successfully!');
        setSnackbarSeverity('success');
        setOpenSnackbar(true);

        // Store submitted prescription for display
        setSubmittedPrescription({ ...prescription, id: docRef.id });

        // Reset form after submission
        setPrescription({
          medication: '',
          dosage: '',
          frequency: '',
          startDate: '',
          endDate: '',
          instructions: '',
          doctor: ''
        });
        setErrors({});
      } catch (error) {
        console.error('Error submitting prescription: ', error);
        setSnackbarMessage('Error submitting prescription. Please try again.');
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
      }
    }
  };

  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };

  return (
    <Grid container spacing={2} style={{ padding: '20px' }}>
      <Grid item xs={12}>
        <Typography variant="h5">Add Prescription</Typography>
      </Grid>

      {/* Medication Name */}
      <Grid item xs={12}>
        <TextField
          label="Medication Name"
          fullWidth
          variant="outlined"
          value={prescription.medication}
          onChange={(e) => setPrescription({ ...prescription, medication: e.target.value })}
          error={Boolean(errors.medication)}
          helperText={errors.medication}
        />
      </Grid>

      {/* Dosage */}
      <Grid item xs={12}>
        <TextField
          label="Dosage"
          fullWidth
          variant="outlined"
          value={prescription.dosage}
          onChange={(e) => setPrescription({ ...prescription, dosage: e.target.value })}
          error={Boolean(errors.dosage)}
          helperText={errors.dosage}
        />
      </Grid>

      {/* Frequency */}
      <Grid item xs={12}>
        <TextField
          label="Frequency (e.g., Twice a day)"
          fullWidth
          variant="outlined"
          value={prescription.frequency}
          onChange={(e) => setPrescription({ ...prescription, frequency: e.target.value })}
          error={Boolean(errors.frequency)}
          helperText={errors.frequency}
        />
      </Grid>

      {/* Start Date */}
      <Grid item xs={12}>
        <TextField
          label="Start Date"
          fullWidth
          variant="outlined"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={prescription.startDate}
          onChange={(e) => setPrescription({ ...prescription, startDate: e.target.value })}
          error={Boolean(errors.startDate)}
          helperText={errors.startDate}
        />
      </Grid>

      {/* End Date */}
      <Grid item xs={12}>
        <TextField
          label="End Date"
          fullWidth
          variant="outlined"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={prescription.endDate}
          onChange={(e) => setPrescription({ ...prescription, endDate: e.target.value })}
          error={Boolean(errors.endDate)}
          helperText={errors.endDate}
        />
      </Grid>

      {/* Instructions */}
      <Grid item xs={12}>
        <TextField
          label="Special Instructions"
          fullWidth
          variant="outlined"
          multiline
          rows={4}
          value={prescription.instructions}
          onChange={(e) => setPrescription({ ...prescription, instructions: e.target.value })}
        />
      </Grid>

      {/* Doctor's Name */}
      <Grid item xs={12}>
        <TextField
          label="Doctor's Name"
          fullWidth
          variant="outlined"
          value={prescription.doctor}
          onChange={(e) => setPrescription({ ...prescription, doctor: e.target.value })}
          error={Boolean(errors.doctor)}
          helperText={errors.doctor}
        />
      </Grid>

      {/* Submit Button */}
      <Grid item xs={12}>
        <Button variant="contained" color="primary" onClick={handleSubmit} fullWidth>
          Submit Prescription
        </Button>
      </Grid>

      {/* Snackbar for submission feedback */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Display Submitted Prescription */}
      {submittedPrescription && (
        <Grid item xs={12} style={{ marginTop: '20px' }}>
          <Typography variant="h6" color="primary">Submitted Prescription</Typography>
          <Typography><strong>Medication:</strong> {submittedPrescription.medication}</Typography>
          <Typography><strong>Dosage:</strong> {submittedPrescription.dosage}</Typography>
          <Typography><strong>Frequency:</strong> {submittedPrescription.frequency}</Typography>
          <Typography><strong>Start Date:</strong> {dayjs(submittedPrescription.startDate).format('MMMM D, YYYY')}</Typography>
          <Typography><strong>End Date:</strong> {dayjs(submittedPrescription.endDate).format('MMMM D, YYYY')}</Typography>
          <Typography><strong>Instructions:</strong> {submittedPrescription.instructions}</Typography>
          <Typography><strong>Doctor:</strong> {submittedPrescription.doctor}</Typography>
        </Grid>
      )}
    </Grid>
  );
}

export default PrescriptionForm;
