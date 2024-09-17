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
  // Helper function to convert date strings to JavaScript Date objects
  const parseDate = (dateString) => dayjs(dateString, "M/D/YYYY").toDate();

  const fetchPrescriptions = async () => {
    try {
      const today = dayjs().startOf("day").toDate(); // Start of today

      // Fetch all documents
      const prescriptionsSnapshot = await getDocs(
        collection(db, "prescriptions")
      );

      // Filter documents locally
      const prescriptions = prescriptionsSnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((prescription) => {
          const startDate = parseDate(prescription.startDate);
          const endDate = parseDate(prescription.endDate);
          return startDate <= today && endDate >= today;
        });

      console.log("Fetched prescriptions: ", prescriptions);
      return prescriptions;
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
    }
  };

  // Convert Firebase Timestamp to formatted date
  // const formatTimestamp = (timestamp) => {
  //   // Assuming timestamp is a Firestore Timestamp object
  //   const date = timestamp.toDate(); // Convert to JavaScript Date object
  //   return dayjs(date).format("YYYY-MM-DD HH:mm:ss"); // Format as needed
  // };

  // Convert Firebase Timestamp to formatted date
  const formatTimestamp = (timestamp) => {
    if (timestamp) {
      const date = timestamp.toDate(); // Convert to JavaScript Date object
      return dayjs(date).format("YYYY-MM-DD HH:mm:ss"); // Format as needed
    }
    return "Unknown Date"; // Default value if timestamp is undefined
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
  const generateReminders = (prescriptions, appointments) => {
    const reminders = [];

    // Generate medication reminders
    prescriptions.forEach((prescription) => {
      const { medication, startDate, endDate, frequency } = prescription;
      // let frequencyHours = 0;

      // if (frequency === "Twice a day") frequencyHours = 12;
      // if (frequency === "Once a day") frequencyHours = 24;
      // if (frequency === "Three times a day") frequencyHours = 8;

      // let nextReminder = dayjs(startDate);
      // const end = dayjs(endDate);
      // const now = dayjs();

      // while (nextReminder.isBefore(end) && nextReminder.isBefore(now)) {
      //   nextReminder = nextReminder.add(frequencyHours, "hour");
      // }

      // if (nextReminder.isBefore(end)) {
      reminders.push({
        title: "Medication Reminder",
        message: `It's time to take your medication: ${medication}`,
      });
      // }
    });

    // Generate appointment reminders
    appointments.forEach((appointment) => {
      const { appointmentDate, doctor } = appointment;
      const formattedDate = formatTimestamp(appointmentDate);
      const reminderTime = dayjs(appointmentDate?.toDate()).format(
        "YYYY-MM-DD HH:mm:ss"
      );

      reminders.push({
        title: "Appointment Reminder",
        message: `You have an upcoming appointment with ${doctor} on ${formattedDate}`,
        reminderTime,
      });
    });

    console.log("Generated Reminders: ", reminders);
    return reminders;
  };

  // Debounce the reminder generation to avoid unnecessary calls
  const debouncedGenerateReminders = debounce((prescriptions, appointments) => {
    const reminders = generateReminders(prescriptions, appointments);
    console.log("reminders", reminders);
    setReminders(reminders); // Set the reminders locally, not saving them to Firestore
  }, 1000); // 1-second delay

  // Fetch prescriptions and appointments, then generate reminders
  const fetchAndSetReminders = async () => {
    try {
      const prescriptions = await fetchPrescriptions();
      const appointments = await fetchAppointments();
      debouncedGenerateReminders(prescriptions, appointments);
    } catch (error) {
      console.error("Error generating reminders:", error);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      fetchAndSetReminders();
    }, 24 * 60 * 60 * 1000); // Every 24 hours

    // Run immediately on mount to check reminders
    fetchAndSetReminders();

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
              <Typography
                variant="h6"
                noWrap
                component={Link}
                to="/"
                style={{
                  textDecoration: "none",
                  color: "white",
                }}
              >
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
                    <MenuItem
                      key={index}
                      sx={{
                        whiteSpace: "normal",
                        display: "block",
                        maxWidth: "250px",
                      }}
                    >
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
      <Typography variant="h4">
        Welcome to the Medical Tracking System
      </Typography>
      <Typography variant="body1">
        Navigate through the sidebar to enter prescriptions, provide feedback,
        and view patient profiles.
      </Typography>
    </Grid>
  </Grid>
);

export default App;
