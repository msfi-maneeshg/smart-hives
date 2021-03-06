import React from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import PhonelinkSetupIcon from '@material-ui/icons/PhonelinkSetup';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import {ListItemText, Avatar, Typography} from '@material-ui/core';
import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty';
import EqualizerIcon from '@material-ui/icons/Equalizer';
import ExitToApp from '@material-ui/icons/ExitToApp';
import {useDispatch, useSelector} from 'react-redux';
import {changeLoginStatus} from './Reducers';
import {Link} from 'react-router-dom'

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
    menuButton: {
      marginRight: theme.spacing(2),
    },
    hide: {
      display: 'none',
    },
    drawer: {
      width: drawerWidth,
      flexShrink: 0,
    },
    drawerPaper: {
      width: drawerWidth,
      backgroundImage: `url('https://mcdn.wallpapersafari.com/medium/19/81/UNKDkl.png')`,
      backgroundSize: 'contain',
    },
    link:{
        textDecoration: 'none',
        color: '#757575',
    },
    backgroundColor:{
        backgroundColor: '#f6ca08',
    },
    profileBox:{
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'column',
    },
    profileAvatar:{
        cursor: 'pointer',
        width: 64,
        height: 64
    }

  }));

export function DashboardSidebar(props) {
  const classes = useStyles();
  const theme = useTheme();
  const dispatch = useDispatch();
  const loginStatus = useSelector((state) => state.UserLoginStatus);


  return (
    <Drawer
        className={classes.drawer}
        variant="persistent"
        anchor="left"
        open={props.open}
        classes={{
          paper: classes.drawerPaper,
        }}
      >
        <div className={classes.backgroundColor}> 
            <div className={classes.drawerHeader}>
            <IconButton onClick={props.onClick}>
                {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </IconButton>
            </div>
            <Divider />
            <div className={classes.profileBox}>
                <Avatar
                    src="./bee_farmer_avatar.png"
                    className={classes.profileAvatar}
                    />
                <Typography
                    color="textPrimary"
                    variant="h5"
                    gutterBottom
                >
                    {loginStatus.username}
                </Typography>
            </div>
            <Divider />
            <List >
                <Link to="/hourly-insight" className={classes.link}>
                    <ListItem button selected={props.page === 'hourly-insight'}>
                        <ListItemIcon><HourglassEmptyIcon /></ListItemIcon>
                        <ListItemText primary='Hourly Insight' />
                    </ListItem>
                </Link>
                <Link to="/realtime-insight" className={classes.link}>
                    <ListItem button selected={props.page === 'realtime-insight'}>
                        <ListItemIcon><EqualizerIcon /></ListItemIcon>
                        <ListItemText primary='Real-Time Insight' />
                    </ListItem>
                </Link>
            </List>
            <Divider />
            <List>
                <Link to="/my-devices" className={classes.link}>
                    <ListItem button selected={props.page === 'my-devices'}>
                    <ListItemIcon><PhonelinkSetupIcon /></ListItemIcon>
                    <ListItemText primary='My Devices' />
                    </ListItem>
                </Link>
                <Link to="#"  onClick={() => dispatch(changeLoginStatus(""))} className={classes.link}>
                    <ListItem button>
                    <ListItemIcon><ExitToApp /></ListItemIcon>
                    <ListItemText primary='Logout' />
                    </ListItem>
                </Link>
            </List>
            <Divider />
        </div>
    </Drawer>
  );
}

export default DashboardSidebar;