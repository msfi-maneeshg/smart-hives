import { React,useEffect, useState, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {Typography,Container,Paper, Grid,TableCell,TableRow,TableBody,TableContainer,Table,TableHead,IconButton,Collapse,CircularProgress,Grow,LinearProgress} from '@material-ui/core';
import {ExpandMore,ExpandLess} from '@material-ui/icons'
import Chart from "react-google-charts";
import {Alert} from '@material-ui/lab';
import {useSelector,useDispatch} from 'react-redux'
import {changeLoginStatus} from './Reducers';
import {API_URL, IBM_AUTH, IBM_URL} from './constant'
import { useHistory } from "react-router-dom";
import {RefreshToken} from "./common"

const useStyles = makeStyles((theme) => ({
    root: {
      flexGrow: 1,
      '& > *': {
        borderBottom: 'unset',
    },
    },
    paper: {
      padding: theme.spacing(2),
      color: 'gray',
    },
    paperCenter: {
        textAlign: 'center',
    },
    mainContainer:{
        padding: theme.spacing(0,0,0,0)
    },
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
    },
    selectEmpty: {
        marginTop: theme.spacing(2),    
    },
    table: {
        minWidth: 650,
    },
    quarterTab:{
        width:'24%',
        textAlign:'center',
        background:'#cacaca',
        padding:'15px',
        cursor: 'pointer',
        '&:hover':{
            background:'#bbbaba',
        }
    },
    quarterSelectedTab:{
        width:'24%',
        textAlign:'center',
        background:'#888787',
        padding:'15px',
        cursor: 'pointer',
        color:'white'
    },
    justifyContent:{
        justifyContent:"center"
    },
    dataBox:{
        textAlign:'center',
        border:'1px solid',
        boxShadow:'0px 0px 5px slategrey',
        borderRadius:'5px',
        margin:'5px 5px 5px 5px',
    },
    dataBoxOuter:{
        marginTop:'5px',
        marginBottom:'5px',
        justifyContent:"center"
    },
    fontIcon:{
        fontSize:'50px'
    },
    modal: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    alertMessage:{
        marginTop: theme.spacing(2)
    }
}));

export function RealtimeInsight(){
    const classes = useStyles();
    let history = useHistory();
    const dispatch = useDispatch();
    const userInfo = useSelector((state) => state.UserLoginStatus);
    const [isNotificationStart,setIsNotificationStart] = useState(false) 
    const [notificationData,setNotificationData] = useState(null)
    const [isDevicesLoaded,setIsDeviceLoaded] = useState(false)
    const [deviceList,setDeviceList] = useState({status:false,list:[]})
    
    useEffect(() => {
        if(!isDevicesLoaded){
            async function getDeviceList(){
        
                let responseStatus;
                let responseData;
                setIsDeviceLoaded(true)
                const requestOptions = {
                    method: 'GET',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization':'bearer '+userInfo.userToken
                    }
                };
                
                let apiUrl = API_URL+"devices"
            
                await fetch(apiUrl, requestOptions)
                .then((response) => {
                    responseStatus = response.status;
                    return response.json()   
                })
                .then((data) => {
                    responseData = data
                });

                if(responseStatus === 200){
                    setTimeout(() => {
                        setDeviceList({status:true,list:responseData.results})
                    }, 2000)
                }else if (responseStatus === 403 && responseData.error === "Token is expired") {
                    let res = await RefreshToken(userInfo)
                    if(res.responseStatus === 200){
                        dispatch(changeLoginStatus(res.responseData.content));   
                        setIsDeviceLoaded(false)
                    }else{
                        dispatch(changeLoginStatus(""));  
                        setTimeout(() => {history.push('/login')}, 100)
                    }
                }else{
                    setDeviceList({status:true,list:[]})
                }
            } 
            getDeviceList();   
        }
    },[isDevicesLoaded,dispatch,history,userInfo])

    

    useEffect(() => {
        if(!isNotificationStart){
            setIsNotificationStart(true);
            const GetNotificationAlert = () => {
                const requestOptions = {
                    method: 'GET',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization':IBM_AUTH
                    },
                };
                
                let apiUrl = IBM_URL+'iotp-notification/_design/iotp/_view/by-deviceType?key="'+userInfo.username+'"'
            
            
                fetch(apiUrl, requestOptions)
                .then((response) => {
                    return response.json()   
                })
                .then((data) => {
                    if(data.total_rows > 0){
                        setNotificationData(data.rows)
                    }
                });
            }

            
            GetNotificationAlert();
            setInterval(() => GetNotificationAlert(), 60000);
        }
    },[isNotificationStart,userInfo.username])

    const handleCloseNotification = (e,info) => {
        const requestOptions = {
            method: 'DELETE',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization':IBM_AUTH
            },
        };
        
        let apiUrl = IBM_URL+"iotp-notification/"+info.value._id+"?rev="+info.value._rev
    
    
        fetch(apiUrl, requestOptions)
        .then((response) => {
            return response.json()   
        })
        .then((data) => {
            if(data.ok){
                var updatedRows = [...notificationData]
                var indexToRemove = updatedRows.findIndex(x => x.value._id === info.value._id);
                if(indexToRemove > -1){
                    updatedRows.splice(indexToRemove, 1)
                    setNotificationData(updatedRows);
                }
            }
        });
    }

    return(
        <>
        <Container className={classes.mainContainer}>
            <div className={classes.root}>
                <Grid container spacing={3}>
                    { notificationData !== null &&  notificationData.length !== 0 &&
                        <Grid item xs={12}>
                            <Paper className={classes.paper}>
                                <Typography variant="h6" gutterBottom>Alerts</Typography>
                                {notificationData.map((data,index) => (
                                    <Alert className={classes.alertMessage} variant="filled"  elevation={3} key={index} severity="warning"  onClose={(e) => handleCloseNotification(e,data)}>Alert for {data.value.deviceId}, Temperature is : {data.value.temperature}°C and Humidity is : {data.value.humidity}%</Alert>
                                    ))
                                }
                            </Paper>
                        </Grid>
                    }
                    <Grid item xs={12}>
                        <TableContainer component={Paper}>
                            <Table aria-label="collapsible table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Hive</TableCell>
                                        <TableCell align="right">View</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {deviceList.status && deviceList.list.length > 0 && deviceList.list.map((row,index) => (
                                        <DeviceTableRow key={index} index={index} username={userInfo.username} deviceId={row.deviceId} />
                                    ))}
                                    {deviceList.status && deviceList.list.length === 0  && <NoRecordFound/>}
                                    {!deviceList.status && deviceList.list.length === 0 && <LoadingData />}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid>
                </Grid>
            </div>
        </Container>
    </>
    );
} 

function DeviceTableRow(props){
    const classes = useStyles();
    const [open, setOpen] = useState(false);
    //const [isEventDataLoaded,setIsEventDataLoaded] = useState(false)
    const [weightArray,setWeightArray] = useState({data:[['x','Temperature','Humidity', 'Weight']]})
    var client = useRef();  

    let mqtt = require('mqtt');

    useEffect(() => {
        if(open && props.deviceId){
            //setIsEventDataLoaded(true)
            const connectOptions = {
                rejectUnauthorized: false,
                username:'a-8l173e-ahdw2reb1r',
                password:'XKe_utxjf(jf+VHkXV',
                clientId: 'a:8l173e:receiving-'+props.index,
            };

            client.current = mqtt.connect('tcp://8l173e.messaging.internetofthings.ibmcloud.com/',connectOptions); 
            client.current.subscribe("iot-2/type/"+props.username+"/id/"+props.deviceId+"/evt/HiveEvent/fmt/+");
            client.current.on('message', function (topic, message) {
                // message is Buffer
                var data = JSON.parse(message.toString())
                
                let tempWeight = weightArray.data
                let NewtempWeight;
                if(tempWeight.length > 50 ){
                    tempWeight.splice(1, 1);
                    NewtempWeight = tempWeight
                }else{
                    NewtempWeight = tempWeight
                }
                let oldTimestamp = new Date(NewtempWeight[NewtempWeight.length-1][0])
                let newTimestamp= new Date()
                
                if(newTimestamp.getTime() !== oldTimestamp.getTime()){
                    NewtempWeight.push([newTimestamp,data.temperature,data.humidity,data.weight])
                    setWeightArray({data:NewtempWeight})
                }
            });
            
        }
        if(!open && client.current){
            client.current.end()
        }
    },[mqtt,open, props.deviceId, props.username,weightArray.data]);

    return(
        <>
            <TableRow className={classes.root}>
                <TableCell component="th" scope="row">
                    {props.deviceId}
                </TableCell>
                <TableCell align="right">
                    <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
                        {open ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                </TableCell>
            </TableRow>
            <TableRow >
                <TableCell  style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <hr/>
                        
                        <Grid container spacing={3} className={classes.dataBoxOuter}>
                            <Grow in={open} {...(open ? { timeout: 1000 } : {})}>
                                <Grid item xs={10} className={classes.dataBox}>
                                    {weightArray.data && weightArray.data.length > 1 ?
                                    <Chart
                                        height={'500px'}
                                        chartType="LineChart"
                                        loader={<div>Loading Chart</div>}
                                        data={weightArray.data}
                                        options={{
                                            hAxis: {
                                            title: 'Time',
                                            },
                                            vAxis: {
                                            title: 'Temperature / Humidity / Weigth',
                                            },
                                        }}
                                        rootProps={{ 'data-testid': '1' }}
                                    />:
                                    <CircularProgress />       
                                    }
                                </Grid>
                            </Grow>
                        </Grid>
                        
                    </Collapse>
                </TableCell>
                
            </TableRow>
        </>
    );
}

function NoRecordFound(){
    return(
        <TableRow >
            <TableCell align="center" colSpan={2} >No Device Found!</TableCell>
        </TableRow>
    );
}

function LoadingData(){
    return(
        <TableRow >
            <TableCell align="center" colSpan={2} ><LinearProgress />Fatching Devices</TableCell>
        </TableRow>
    );
}

