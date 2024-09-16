import React, { useState, useEffect, lazy, Suspense, useCallback } from 'react';
import { AppBar, Toolbar, Typography, Grid, Drawer, List, ListItem, ListItemText, CssBaseline, Box, IconButton, Badge, Menu, MenuItem } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { collection, getDocs, query, limit, addDoc } from 'firebase/firestore';
import { db } from './backend/firebaseConfigure';
import dayjs from 'dayjs';
import debounce from 'lodash.debounce'; // Import lodash debounce

const PrescriptionForm = lazy(() => import('./Components/PrescriptionForm'));
const FeedbackForm = lazy(() => import('./Components/FeedbackForm'));
const Profile = lazy(() => import('./Components/Profile'));

function App() {
  const [reminders, setReminders] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(true); // Track loading state

  // Fetch reminders from Firestore
  const fetchReminders = useCallback(async () => {
    setLoading(true); // Start loading
    try {
      const remindersSnapshot = await getDocs(query(collection(db, 'reminders'), limit(10)));
      const reminderList = remindersSnapshot.docs.map(doc => doc.data());
      setReminders(reminderList);
    } catch (error) {
      console.error("Error fetching reminders:", error);
    } finally {
      setLoading(false); // Stop loading
    }
  }, []);

  useEffect(() => {
    fetchReminders(); // Fetch reminders on component mount
  }, [fetchReminders]);

  // Fetch prescription data from Firestore
  const fetchPrescriptions = async () => {
    const prescriptionsSnapshot = await getDocs(collection(db, 'prescriptions'));
    return prescriptionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  };

  // Break reminder generation into smaller chunks
  const generateReminders = (prescriptions) => {
    const reminders = [];
    prescriptions.forEach((prescription) => {
      const { medication, startDate, frequency } = prescription;
      let frequencyHours = 0;

      if (frequency === 'Twice a day') frequencyHours = 12;
      if (frequency === 'Once a day') frequencyHours = 24;
      if (frequency === 'Three times a day') frequencyHours = 8;

      let nextReminder = dayjs(startDate);
      const now = dayjs();

      // Break work into chunks, so we avoid long computations
      while (nextReminder.isBefore(now)) {
        nextReminder = nextReminder.add(frequencyHours, 'hour');
      }

      reminders.push({
        title: 'Medication Reminder',
        message: `It's time to take your medication: ${medication}`,
        reminderTime: nextReminder.format('YYYY-MM-DD HH:mm:ss'),
      });
    });

    return reminders;
  };

  // Save reminders in batches with delay to prevent UI freeze
  const saveRemindersInBatches = async (reminders) => {
    const chunkSize = 5;
    for (let i = 0; i < reminders.length; i += chunkSize) {
      const batch = reminders.slice(i, i + chunkSize);
      batch.forEach(async (reminder) => {
        await addDoc(collection(db, 'reminders'), reminder);
      });
      await new Promise(resolve => setTimeout(resolve, 200)); // Pause for 200ms to prevent blocking
    }
  };

  // Define debounced function outside of component
const debouncedGenerateReminders = debounce(async (fetchPrescriptions, saveRemindersInBatches, fetchReminders) => {
  try {
    const prescriptions = await fetchPrescriptions(); // Fetch prescription data
    const generatedReminders = generateReminders(prescriptions); // Generate reminders
    await saveRemindersInBatches(generatedReminders); // Save reminders to Firestore in batches
    await fetchReminders(); // Refresh reminders
  } catch (error) {
    console.error('Error generating reminders:', error);
  }
}, 500); // Debounce reminder generation by 500ms

  // useEffect(() => {
  //   debouncedGenerateReminders(fetchPrescriptions, saveRemindersInBatches, fetchReminders);
  //   // Ensure that dependencies are correct to prevent unnecessary calls
  // }, [fetchPrescriptions, saveRemindersInBatches, fetchReminders]);

  const handleReminderClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleReminderClose = () => {
    setAnchorEl(null);
  };

  return (
    <Router>
      <div style={{ display: 'flex' }}>
        <CssBaseline />
        {/* Sidebar (Drawer) */}
        <Drawer
          variant="permanent"
          sx={{
            width: 240,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 240,
              boxSizing: 'border-box',
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
          sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
        >
          {/* AppBar for the Header */}
          <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
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
      <MenuItem key={index}>
        {reminder.title}: {reminder.message} at {reminder.reminderTime}
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
          <footer style={{ textAlign: 'center', padding: '10px 0', marginTop: '200px' }}>
            <Typography variant="caption">© 2024 Medical Tracking System. All rights reserved.</Typography>
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
