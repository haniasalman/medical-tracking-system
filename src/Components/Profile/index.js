import React from 'react';
import { Grid, Typography, Card, CardContent, CardHeader, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Alert, AlertTitle } from '@mui/material';
import { MedicalServices, Warning, Medication, HistoryEdu } from '@mui/icons-material';

function Profile() {
  const patientData = {
    name: 'John Doe',
    age: 45,
    medicalHistory: ['Diabetes', 'Hypertension'],
    allergies: ['Penicillin', 'Peanuts'],
    prescriptions: [
      { drug: 'Metformin', dosage: '500 mg', frequency: 'Twice a day', nextDose: '9:00 AM' },
      { drug: 'Lisinopril', dosage: '10 mg', frequency: 'Once a day', nextDose: '7:00 PM' }
    ]
  };

  const medicationAlerts = [
    { type: 'schedule', message: 'Next dose of Metformin is due at 9:00 AM' },
    { type: 'schedule', message: 'Next dose of Lisinopril is due at 7:00 PM' },
    { type: 'refill', message: 'Metformin refill required in 5 days' },
  ];

  return (
    <Grid container spacing={3} style={{ padding: '20px' }}>
      {/* Patient Profile Section */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader
            title="Patient Profile"
            subheader={`${patientData.name}, Age: ${patientData.age}`}
            avatar={<MedicalServices fontSize="large" />}
          />
          <CardContent>
            <Typography variant="h6">Medical History</Typography>
            {patientData.medicalHistory.map((condition, index) => (
              <Chip
                key={index}
                label={condition}
                icon={<HistoryEdu />}
                color="primary"
                style={{ marginRight: 5, marginBottom: 5 }}
              />
            ))}
            <Typography variant="h6" style={{ marginTop: 15 }}>Allergies</Typography>
            {patientData.allergies.map((allergy, index) => (
              <Chip
                key={index}
                label={allergy}
                icon={<Warning />}
                color="secondary"
                style={{ marginRight: 5, marginBottom: 5 }}
              />
            ))}
          </CardContent>
        </Card>
      </Grid>

      {/* Prescription Section */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader
            title="Current Prescriptions"
            avatar={<Medication fontSize="large" />}
          />
          <CardContent>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Drug</TableCell>
                    <TableCell>Dosage</TableCell>
                    <TableCell>Frequency</TableCell>
                    <TableCell>Next Dose</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {patientData.prescriptions.map((prescription, index) => (
                    <TableRow key={index}>
                      <TableCell>{prescription.drug}</TableCell>
                      <TableCell>{prescription.dosage}</TableCell>
                      <TableCell>{prescription.frequency}</TableCell>
                      <TableCell>{prescription.nextDose}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Alerts and Notifications Section */}
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Alerts & Notifications
        </Typography>
        {medicationAlerts.map((alert, index) => (
          <Alert
            key={index}
            severity={alert.type === 'schedule' ? 'info' : 'warning'}
            icon={alert.type === 'schedule' ? <Medication /> : <Warning />}
            style={{ marginBottom: 10 }}
          >
            <AlertTitle>{alert.type === 'schedule' ? 'Medication Schedule' : 'Refill Alert'}</AlertTitle>
            {alert.message}
          </Alert>
        ))}
      </Grid>
    </Grid>
  );
}

export default Profile;
