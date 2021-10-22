import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import clsx from 'clsx';
import { GiHoneyJar } from "react-icons/gi";

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    title: {
        flexGrow: 1,
        color:'black',
    },
    wallImage: {
        backgroundImage: `url('./honey-wall.png')`,
        backgroundSize: 'contain',
        height:'5vh',
        width:'100%'
    },
    appBar: {
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        backgroundColor:'transparent',
        boxShadow:'none'
    },
    appBarShift: {
        width: `calc(100% - ${drawerWidth}px)`,
        marginLeft: drawerWidth,
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    toolBar:{
        backgroundColor:'#f4be22'
    },
    honeyJar:{
      fontSize:"40px",
      color:'#464646'
    },
    name:{
      textShadow: '1px 1px 2px black',
      color:'#464646'
    }
}));

const drawerWidth = 240;

export function DashboardNavBar(props) {
  const classes = useStyles();

  return (
    <>
      <AppBar
        position="fixed"
        className={clsx(classes.appBar, {
          [classes.appBarShift]: props.open,
        })}
      >
        <Toolbar className={classes.toolBar}>
          <IconButton
            aria-label="open drawer"
            onClick={props.onClick}
            edge="start"
            className={clsx(classes.menuButton, props.open && classes.hide)}
          >
            <MenuIcon />
          </IconButton>
          <GiHoneyJar className={classes.honeyJar} />
          <Typography variant="h4" noWrap className={classes.name}>
            SmartHive
          </Typography>
        </Toolbar>
        <div className={classes.wallImage}></div>
      </AppBar>
      
    </>
  );
}


export default DashboardNavBar;