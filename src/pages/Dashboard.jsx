import React from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import {DashboardNavBar} from './DashboardNavBar'
import {DashboardSidebar} from './DashboardSidebar'
import {HourlyInsight} from './HourlyInsight'
import {RealtimeInsight} from './RealtimeInsight'
import {MyDevices} from './MyDevices'
import {MyProfile} from './MyProfile'


const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  bgImage :{
    backgroundImage: "url('https://wallpaperaccess.com/full/1585697.jpg')",
    minHeight: '100vh',
    backgroundAttachment: 'fixed',
    backgroundRepeat: 'no-repeat',
  },
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
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
    minHeight:'10vh !important'
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: -drawerWidth,
  },
  contentShift: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  },
}));

export function Dashboard(props) {
  const classes = useStyles();
 
  const [open, setOpen] = React.useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <>
      <div className={classes.bgImage}>
        <div className={classes.root}>
          <CssBaseline />
          <DashboardNavBar open={open} onClick={handleDrawerOpen} page={props.page} />
          <DashboardSidebar open={open} onClick={handleDrawerClose} />
          <main
            className={clsx(classes.content, {
              [classes.contentShift]: open,
            })}
          >
            <div className={classes.drawerHeader} />   
            {props.page === "hourly-insight" && <HourlyInsight />}
            {props.page === "realtime-insight" && <RealtimeInsight />}
            {props.page === "my-devices" && <MyDevices />}
            {props.page === "my-profile" && <MyProfile />}
          </main>
        </div>
      </div>
    </>
  );
}

export default Dashboard;