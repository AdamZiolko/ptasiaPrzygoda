import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Link, Routes } from "react-router-dom";
import { Drawer, List, ListItem, ListItemText, Button } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import { ArrowBackIosOutlined, ArrowForwardIosSharp } from '@material-ui/icons';
import { DijkstraMap } from './pages/dijkstraMap';
import { Typography } from '@material-ui/core';
import { Card, CardContent } from '@material-ui/core';

function Index() {
  return <h2>Home</h2>;
}

function Legend() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' , width: '100vw'}}>
      <Card style={{ width: '80%', alignSelf: 'center', margin: '0 auto' }}>
        <CardContent>
          <Typography variant="h5" style={{ textAlign: 'center' }}>
            W trybie rysowania można usuwać, aby poruszać się po mapie należy naciskać scrolla jak i zoomować.
          </Typography>
        </CardContent>
      </Card>
    </div>
  );
}

function AppRouter() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <Router>
      <div style={{ position: 'fixed', left: '10px', bottom: '50%', color: 'black' }}>
        <IconButton edge="start" color="inherit" aria-label="ArrowForwardIosSharp" onClick={toggleDrawer}>
          <ArrowForwardIosSharp />
        </IconButton>
      </div>
      <Drawer open={drawerOpen} onClose={toggleDrawer} anchor="left">
        <List>
          <ListItem button component={Link} to="/" onClick={toggleDrawer}>
            <ListItemText primary="Home" />
          </ListItem>
          <ListItem button component={Link} to="/products/1" onClick={toggleDrawer}>
            <ListItemText primary="Legenda" />
          </ListItem>
        </List>
      </Drawer>
      <Routes>
        <Route path="/" element={<DijkstraMap />} />
        <Route path="/graph/:id" element={<DijkstraMap />} />
        <Route path="/legenda" element={<Legend />} />

      </Routes>
    </Router>
  );
}

export default AppRouter;