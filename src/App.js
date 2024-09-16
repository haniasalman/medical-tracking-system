import React from 'react';
import { AppBar, Toolbar, Typography, Grid, Drawer, List, ListItem, ListItemText, CssBaseline, Box } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

// Import your components for different pages
import PrescriptionForm from './Components/PrescriptionForm';
// import ReminderForm from './ReminderForm';
import FeedbackForm from './Components/FeedbackForm';
import Profile from './Components/Profile';

function App() {
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
            </Toolbar>
          </AppBar>

          {/* Padding to avoid content hiding under the AppBar */}
          <Toolbar />

          {/* Routes */}
          <Box sx={{ flexGrow: 1 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/prescriptions" element={<PrescriptionForm />} />
              {/* <Route path="/reminders" element={<ReminderForm />} /> */}
              <Route path="/feedback" element={<FeedbackForm />} />
              <Route path="/profiles" element={<Profile />} />
            </Routes>
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
        Navigate through the sidebar to view prescriptions, generate reminders, provide feedback, and view patient profiles.
      </Typography>
    </Grid>
  </Grid>
);

export default App;
