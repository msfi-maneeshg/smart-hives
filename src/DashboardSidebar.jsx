import React from 'react';
import clsx from 'clsx';
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
import {ListItemText, Link} from '@material-ui/core';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import MailIcon from '@material-ui/icons/Mail';

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
  }));

export function DashboardSidebar(props) {
  const classes = useStyles();
  const theme = useTheme();

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
        <div className={classes.drawerHeader}>
          <IconButton onClick={props.onClick}>
            {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </div>
        <Divider />
        <List>
            <Link href="/hourly-insight" className={classes.link}>
                <ListItem button >
                    <ListItemIcon><InboxIcon /></ListItemIcon>
                    <ListItemText primary='Hourly Insight' />
                </ListItem>
            </Link>
            <Link href="/realtime-insight" className={classes.link}>
                <ListItem button>
                    <ListItemIcon><MailIcon /></ListItemIcon>
                    <ListItemText primary='Real-Time Insight' />
                </ListItem>
            </Link>
        </List>
        <Divider />
        <List>
            <Link href="#" className={classes.link}>
                <ListItem button >
                <ListItemIcon><PhonelinkSetupIcon /></ListItemIcon>
                <ListItemText primary='My Devices' />
                </ListItem>
            </Link>
        </List>
    </Drawer>
  );
}

export default DashboardSidebar;