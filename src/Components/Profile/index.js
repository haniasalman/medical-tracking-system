import React, { useEffect, useState } from "react";
import {
  Grid,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Avatar,
  Divider,
} from "@mui/material";
import {
  MedicalServices,
  Medication,
  Home,
  Phone,
  Email,
  HistoryEdu,
  Event,
} from "@mui/icons-material";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../backend/firebaseConfigure";

function Profile() {
  const [patientData, setPatientData] = useState(null);
  const [appointments, setAppointments] = useState([]); // Placeholder for appointments

  const fetchPatients = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "patients"));
      const patients = [];
      querySnapshot.forEach((doc) => {
        patients.push(doc.data());
      });
      if (patients.length > 0) {
        setPatientData(patients[0]); // Use first patient data for demo
      }
    } catch (error) {
      console.error("Error fetching patients: ", error);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  if (!patientData) {
    return <CircularProgress />;
  }

  return (
    <Grid container spacing={3} style={{ padding: "20px" }}>
      {/* Patient Information Section */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader
            avatar={<Avatar sx={{ bgcolor: "primary.main" }}>{patientData.name.charAt(0)}</Avatar>}
            title={patientData.name}
            subheader={`Age: ${patientData.age}, Gender: ${patientData.gender}`}
          />
          <CardContent>
            <Typography variant="h6">Contact Information</Typography>
            <Divider />
            <Typography variant="body1" style={{ marginTop: 10 }}>
              <Home fontSize="small" /> {patientData.address}
            </Typography>
            <Typography variant="body1" style={{ marginTop: 5 }}>
              <Phone fontSize="small" /> {patientData.phone}
            </Typography>
            <Typography variant="body1" style={{ marginTop: 5 }}>
              <Email fontSize="small" /> {patientData.email}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Medical History Section */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader
            title="Medical History"
            avatar={<HistoryEdu fontSize="large" />}
          />
          <CardContent>
            <Typography variant="h6">Medications</Typography>
            <TableContainer component={Paper} style={{ marginTop: 10 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Medication</TableCell>
                    <TableCell>Dosage</TableCell>
                    <TableCell>Frequency</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>{patientData.medicalHistory.Medications.medName}</TableCell>
                    <TableCell>{patientData.medicalHistory.Medications.dosage}</TableCell>
                    <TableCell>{patientData.medicalHistory.Medications.frequency}</TableCell>
                    <TableCell>{patientData.medicalHistory.Medications.status}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            <Typography variant="h6" style={{ marginTop: 20 }}>
              Allergies
            </Typography>
            <Divider />
            {patientData.medicalHistory.allergies?.map((allergy, index) => (
              <Typography key={index} variant="body1" style={{ marginTop: 10 }}>
                {allergy}
              </Typography>
            ))}

            <Typography variant="h6" style={{ marginTop: 20 }}>
              Past Medical History(PMH)
            </Typography>
            <Divider />
            {patientData.medicalHistory.postMedicalHistory?.map((condition, index) => (
              <Typography key={index} variant="body1" style={{ marginTop: 10 }}>
                {condition}
              </Typography>
            ))}
          </CardContent>
        </Card>
      </Grid>

      {/* Appointments Section */}
      <Grid item xs={12}>
        <Card>
          <CardHeader
            title="Appointments"
            avatar={<Event fontSize="large" />}
          />
          <CardContent>
            <Typography variant="body1" style={{ marginTop: 10 }}>
              No appointments available at the moment.
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

export default Profile;
