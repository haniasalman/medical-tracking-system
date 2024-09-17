import React, { useState, useEffect, lazy, Suspense, useCallback } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Grid,
  Drawer,
  List,
  ListItem,
  ListItemText,
  CssBaseline,
  Box,
  IconButton,
  Badge,
  Menu,
  MenuItem,
} from "@mui/material";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "./backend/firebaseConfigure";
import dayjs from "dayjs";
import { debounce } from "lodash";

const PrescriptionForm = lazy(() => import("./Components/PrescriptionForm"));
const FeedbackForm = lazy(() => import("./Components/FeedbackForm"));
const Profile = lazy(() => import("./Components/Profile"));

function App() {
  const [reminders, setReminders] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch prescription data from Firestore (for future prescriptions)
  // const fetchPrescriptions = async () => {
  //   try {
  //     const today = dayjs().toDate(); // Today's date
  //     const prescriptionsSnapshot = await getDocs(
  //       query(collection(db, "prescriptions"), where("endDate", ">=", today))
  //     );
  //     const prescriptions = prescriptionsSnapshot.docs.map((doc) => ({
  //       id: doc.id,
  //       ...doc.data(),
  //     }));
  //     console.log("Fetched prescriptions: ", prescriptions);
  //     return prescriptions;
  //   } catch (error) {
  //     console.error("Error fetching prescriptions:", error);
  //   }
  // };

  // Convert Firebase Timestamp to formatted date
const formatTimestamp = (timestamp) => {
  // Assuming timestamp is a Firestore Timestamp object
  const date = timestamp.toDate(); // Convert to JavaScript Date object
  return dayjs(date).format("YYYY-MM-DD HH:mm:ss"); // Format as needed
};

  // Fetch upcoming appointments from Firestore (for future appointments)
  const fetchAppointments = async () => {
    try {
      const today = dayjs().toDate(); // Today's date
      const patientsSnapshot = await getDocs(collection(db, "patients"));
  
      const upcomingAppointments = [];
      
      patientsSnapshot.docs.forEach((doc) => {
        const patientData = doc.data();
        const appointments = patientData.appointments || [];
        
        // Filter appointments that are scheduled after today
        appointments.forEach((appointment) => {
          if (dayjs(appointment.appointmentDate.toDate()).isAfter(today)) {
            upcomingAppointments.push({
              patientId: doc.id,
              ...appointment,
            });
          }
        });
      });
  
      console.log("Fetched Appointments: ", upcomingAppointments);
      return upcomingAppointments;
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  // Reminder generation algorithm based on prescription data
  const generateReminders = ( appointments) => {
    const reminders = [];

    // // Generate medication reminders
    // prescriptions.forEach((prescription) => {
    //   const { medication, startDate, endDate, frequency } = prescription;
    //   let frequencyHours = 0;

    //   if (frequency === "Twice a day") frequencyHours = 12;
    //   if (frequency === "Once a day") frequencyHours = 24;
    //   if (frequency === "Three times a day") frequencyHours = 8;

    //   let nextReminder = dayjs(startDate);
    //   const end = dayjs(endDate);
    //   const now = dayjs();

    //   while (nextReminder.isBefore(end) && nextReminder.isBefore(now)) {
    //     nextReminder = nextReminder.add(frequencyHours, "hour");
    //   }

    //   if (nextReminder.isBefore(end)) {
    //     reminders.push({
    //       title: "Medication Reminder",
    //       message: `It's time to take your medication: ${medication}`,
    //       reminderTime: nextReminder.format("YYYY-MM-DD HH:mm:ss"),
    //     });
    //   }
    // });

    // Generate appointment reminders
    appointments.forEach((appointment) => {
      const { appointmentDate, doctor } = appointment;
      const reminderTime = dayjs(appointmentDate).format("YYYY-MM-DD HH:mm:ss");

      reminders.push({
        title: "Appointment Reminder",
        message: `You have an upcoming appointment with ${doctor} on ${formatTimestamp(appointmentDate)}`,
        reminderTime,
      });
    });

    console.log("Generated Reminders: ", reminders);
    return reminders;
  };

  // Debounce the reminder generation to avoid unnecessary calls
  const debouncedGenerateReminders = debounce((appointments) => {
    const reminders = generateReminders( appointments);
    console.log('reminders',reminders)
    setReminders(reminders); // Set the reminders locally, not saving them to Firestore
  }, 1000); // 1-second delay

  // Fetch prescriptions and appointments, then generate reminders
  const fetchAndSetReminders = async () => {
    try {
      // const prescriptions = await fetchPrescriptions();
      const appointments = await fetchAppointments();
      debouncedGenerateReminders(appointments);
    } catch (error) {
      console.error("Error generating reminders:", error);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      fetchAndSetReminders();
    }, 60000); // Every minute for testing

    return () => clearInterval(interval); // Clear interval on unmount
  }, []);

  const handleReminderClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleReminderClose = () => {
    setAnchorEl(null);
  };

  return (
    <Router>
      <div style={{ display: "flex" }}>
        <CssBaseline />
        {/* Sidebar (Drawer) */}
        <Drawer
          variant="permanent"
          sx={{
            width: 240,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: 240,
              boxSizing: "border-box",
            },
          }}
        >
          <Toolbar />
          <List>
            <ListItem button component={Link} to="/prescriptions">
              <ListItemText primary="Prescriptions" />
            </ListItem>
            <ListItem button component={Link} to="/reminders">
              <ListItemText primary="Reminders" />
            </ListItem>
            <ListItem button component={Link} to="/feedback">
              <ListItemText primary="Feedback" />
            </ListItem>
            <ListItem button component={Link} to="/profiles">
              <ListItemText primary="Profiles" />
            </ListItem>
          </List>
        </Drawer>

        {/* Main Content Area */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            bgcolor: "background.default",
            p: 3,
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* AppBar for the Header */}
          <AppBar
            position="fixed"
            sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
          >
            <Toolbar>
              <Typography variant="h6" noWrap>
                Medical Tracking System
              </Typography>
              <IconButton color="inherit" onClick={handleReminderClick}>
                <Badge badgeContent={reminders.length} color="secondary">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleReminderClose}
              >
                {reminders.length > 0 ? (
                  reminders.map((reminder, index) => (
                    <MenuItem key={index} sx={{ whiteSpace: 'normal', display: 'block', maxWidth: '250px' }}>
        <Typography variant="subtitle1" fontWeight="bold">
          {reminder.title}
        </Typography>
        <Typography variant="body2">
          {reminder.message}
        </Typography>
        {/* <Typography variant="caption" color="textSecondary">
          at {reminder.reminderTime}
        </Typography> */}
      </MenuItem>
                  ))
                ) : (
                  <MenuItem>No reminders available</MenuItem>
                )}
              </Menu>
            </Toolbar>
          </AppBar>

          {/* Padding to avoid content hiding under the AppBar */}
          <Toolbar />

          {/* Routes */}
          <Box sx={{ flexGrow: 1 }}>
            <Suspense fallback={<div>Loading...</div>}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/prescriptions" element={<PrescriptionForm />} />
                <Route path="/feedback" element={<FeedbackForm />} />
                <Route path="/profiles" element={<Profile />} />
              </Routes>
            </Suspense>
          </Box>

          {/* Footer */}
          <footer
            style={{
              textAlign: "center",
              padding: "10px 0",
              marginTop: "200px",
            }}
          >
            <Typography variant="caption">
              © 2024 Medical Tracking System. All rights reserved.
            </Typography>
          </footer>
        </Box>
      </div>
    </Router>
  );
}

const Home = () => (
  <Grid container spacing={2}>
    <Grid item xs={12}>
      <Typography variant="h4">Welcome to the Medical Tracking System</Typography>
      <Typography variant="body1">
        Navigate through the sidebar to enter prescriptions, provide feedback, and view patient profiles.
      </Typography>
    </Grid>
  </Grid>
);

export default App;
