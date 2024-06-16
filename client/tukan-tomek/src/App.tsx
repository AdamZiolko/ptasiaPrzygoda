import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Link, Routes } from "react-router-dom";
import { Drawer, List, ListItem, ListItemText, Button } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import { ArrowBackIosOutlined, ArrowForwardIosSharp } from '@material-ui/icons';
import { DijkstraMap } from './pages/dijkstraMap';

function Index() {
  return <h2>Home</h2>;
}

function Product() {
  return <h2>This is a page for product with ID: </h2>;
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
            <ListItemText primary="First Product" />
          </ListItem>
        </List>
      </Drawer>
      <Routes>
        <Route path="/" element={<DijkstraMap />} />
        <Route path="/graph/:id" element={<DijkstraMap />} />
      </Routes>
    </Router>
  );
}

export default AppRouter;