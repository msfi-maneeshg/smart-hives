import { React,useEffect, useState } from 'react';
import {API_URL,IBM_AUTH,IBM_URL} from './constant'
import { makeStyles } from '@material-ui/core/styles';
import {
    Typography,Container,Paper, Grid, FormControl,
    InputLabel,Select,MenuItem,TableCell,TableRow,
    TableBody,TableContainer,Table,TableHead,IconButton,
    Collapse ,TextField,CircularProgress,Grow
} from '@material-ui/core';
import {ExpandMore,ExpandLess} from '@material-ui/icons'
import Chart from "react-google-charts";
import { WiThermometer,WiHumidity, } from "react-icons/wi";
import { GiWeight } from "react-icons/gi";
import {Alert} from '@material-ui/lab';
import {useSelector,useDispatch} from 'react-redux'
import {changeLoginStatus} from './Reducers';
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

export function HourlyInsight(){
    const classes = useStyles();
    const dispatch = useDispatch();
    const userInfo = useSelector((state) => state.UserLoginStatus);
    let history = useHistory();
    var currentDate = new Date()
    currentDate.setHours(currentDate.getHours()-1) // get 1 hours back date time default
    let formatTwoDigits = (digit) => ("0" + digit).slice(-2);
    var currentDateFormated = currentDate.getUTCFullYear()+"-"+formatTwoDigits(currentDate.getUTCMonth()+1)+"-"+formatTwoDigits(currentDate.getUTCDate())
    const [selectedDate,setSelectedDate] = useState(currentDateFormated)
    const [isDataLoaded,setIsDataLoaded] = useState(false)
    const [tableDataLoader,setTableDataLoader] = useState(false)
    const [hiveAggregatedData,setHiveAggregatedData] = useState({list:[]})
    const [isNotificationStart,setIsNotificationStart] = useState(false) 
    const [notificationData,setNotificationData] = useState(null)
    const [period, setPeriod] = useState(formatTwoDigits(currentDate.getUTCHours())+"-"+formatTwoDigits(currentDate.getUTCHours()+1));
    const [notificationIntervalID,setNotificationIntervalID] = useState(0)

    useEffect(() => {
        if(!isDataLoaded){
            const fatchDevice = async() => {
                let responseStatus;
                let responseData;
                setIsDataLoaded(true)
                setTableDataLoader(true)
                var selectedDateTemp =  new Date(selectedDate)
                var startKeyDate = selectedDateTemp.getUTCFullYear()+"-"+formatTwoDigits(selectedDateTemp.getUTCMonth()+1)+"-"+formatTwoDigits(selectedDateTemp.getUTCDate())
                const requestOptions = {
                    method: 'GET',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization':'bearer '+userInfo.userToken
                    }
                };
                let apiUrl = API_URL+"hourly-insight/"+startKeyDate+"/"+period
            

                await fetch(apiUrl, requestOptions)
                .then((response) => {
                    responseStatus = response.status;
                    return response.json()   
                })
                .then((data) => {
                    responseData = data   
                });

                if(responseStatus === 200 && responseData.content && responseData.content.length > 0){
                    setTimeout(() => {
                        setHiveAggregatedData({list:responseData.content})   
                        setTableDataLoader(false)
                    }, 2000)
                }else if (responseStatus === 403 && responseData.error === "Token is expired") {
                    let res = await RefreshToken(userInfo)
                    if(res.responseStatus === 200){
                        dispatch(changeLoginStatus(res.responseData.content));   
                        setIsDataLoaded(false)
                    }else{
                        dispatch(changeLoginStatus(""));  
                        setTimeout(() => {history.push('/login')}, 100)
                    }
                }else{
                    setHiveAggregatedData({list:[]})  
                    setTableDataLoader(false)
                }
            }
            fatchDevice()
        }
    },[isDataLoaded, selectedDate, dispatch, history, period, userInfo])

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
            let intervalID = setInterval(() => {
                GetNotificationAlert()
            }, 60000);
            setNotificationIntervalID(intervalID)
        }
        return () => {
            clearInterval(notificationIntervalID);  
            
        }
    },[isNotificationStart,userInfo.username,notificationIntervalID])

    const changeDate = (e) => {
        setSelectedDate(e.target.value)
        setIsDataLoaded(false)
        setHiveAggregatedData({list:[]})
    }

    const handleChangePeriod = (e) => {
        setPeriod(e.target.value)
        setIsDataLoaded(false)
        setHiveAggregatedData({list:[]})
        
    }

    const handleCloseNotification = (e,info) => {
        const requestOptions = {
            method: 'DELETE',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': IBM_AUTH
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

    const rowHiveData = hiveAggregatedData.list.map((hiveData,index) => (
        <Rows key={index} {...hiveData} username={userInfo.username} />
    ))

    const PeriodList = [];
    for(var i = 0 ;i< 24;i++){
        var periodString = formatTwoDigits(i)+"-"+formatTwoDigits(i+1)
        if(i === 23){
            periodString = formatTwoDigits(i)+"-"+formatTwoDigits(0)
        }
        PeriodList.push(periodString)
    }
    return(
        <Container className={classes.mainContainer}>
            <div className={classes.root}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Paper className={classes.paper}>
                            <TextField
                                id="date"
                                label="Date"
                                type="date"
                                variant="outlined"
                                format="dd/MM/yyyy"
                                onChange={(e) => changeDate(e)}
                                value={selectedDate}
                                className={classes.formControl}
                                InputProps={{inputProps: {max: currentDateFormated}}}
                            />
                            <FormControl variant="outlined" className={classes.formControl}>
                                <InputLabel id="Period-label">Period</InputLabel>
                                <Select
                                labelId="Period-label"
                                id="Period"
                                value={period}
                                onChange={(e) => handleChangePeriod(e)}
                                label="Period"
                                >
                                {
                                    PeriodList.length > 0 && PeriodList.map((value,index) => (
                                        <MenuItem key={index} value={value}>{value}</MenuItem>
                                    ))
                                }
                                
                                </Select>
                            </FormControl>
                        </Paper>
                    </Grid>
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
                    {userInfo.username && 
                        <Grid item xs={12}>
                            <TableContainer component={Paper}>
                                <Table aria-label="collapsible table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell><Typography variant="h6" gutterBottom>Hives</Typography></TableCell>
                                            <TableCell align="right"><Typography variant="h6" gutterBottom>Temperature&nbsp;(°C)</Typography></TableCell>
                                            <TableCell align="right"><Typography variant="h6" gutterBottom>Humidity&nbsp;(%)</Typography></TableCell>
                                            <TableCell align="right"><Typography variant="h6" gutterBottom>Weight&nbsp;(Kg)</Typography></TableCell>
                                            <TableCell align="right"><Typography variant="h6" gutterBottom>View</Typography></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {tableDataLoader?<RowDataLoading/>:
                                        <>
                                        {hiveAggregatedData.list.length === 0 && isDataLoaded ?<RowNotFound /> :rowHiveData}
                                        </>}
                                        
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Grid>                       
                    }
                </Grid>
            </div>
        </Container>
    );
} 

function Rows(props){
    const [open, setOpen] = useState(false);
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const classes = useStyles();
    const [chartData,setChartData] = useState({list:[['x','Temperature','Humidity','Weight']]});

    useEffect(() => {
        if(props.data && !isDataLoaded){
            var sortedData = props.data 
            sortedData.sort((a, b) => a.timestamp > b.timestamp ? 1 : -1)
            setIsDataLoaded(true)
            var tempList = chartData.list;
            for(var i = 0;i< sortedData.length;i++){
                var timestamp = new Date(sortedData[i].timestamp)
                var timeString = new Date(timestamp.getUTCFullYear(),timestamp.getUTCMonth(),timestamp.getUTCDate(),timestamp.getUTCHours(),timestamp.getUTCMinutes(),timestamp.getUTCSeconds(),timestamp.getUTCMilliseconds())
                tempList.push([timeString,sortedData[i].temperature,sortedData[i].humidity,sortedData[i].weight])
            }
            setChartData({list:tempList})
        }
    },[props.data, isDataLoaded, chartData.list])

    return(
        <>
            <TableRow className={classes.root}>
                <TableCell component="th" scope="row">
                    {props.deviceID}
                </TableCell>
                <TableCell align="right">{props.avgTemperature}</TableCell>
                <TableCell align="right">{props.avgHumidity}</TableCell>
                <TableCell align="right">{props.avgWeight}</TableCell>
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
                                <Grid item xs={3} className={classes.dataBox}>
                                    <WiThermometer className={classes.fontIcon} style={{color:'#3566cc'}}/>
                                    <hr/>
                                    <div>Avg : {props.avgTemperature}°C</div>
                                    <div>Min : {props.minTemperature}°C</div>
                                    <div>Max : {props.maxTemperature}°C</div>
                                </Grid>
                            </Grow>
                            <Grow in={open} {...(open ? { timeout: 1500 } : {})}>
                                <Grid item xs={3} className={classes.dataBox}>
                                    <WiHumidity className={classes.fontIcon} style={{color:'#dc392a'}}/>
                                    <hr/>
                                    <div>Avg : {props.avgHumidity}%</div>
                                    <div>Min : {props.minHumidity}%</div>
                                    <div>Max : {props.maxHumidity}%</div>
                                </Grid>
                            </Grow>
                            <Grow in={open} {...(open ? { timeout: 2000 } : {})}>
                                <Grid item xs={3} className={classes.dataBox}>
                                    <GiWeight className={classes.fontIcon} style={{color:'#ed9720'}}/>
                                    <hr/>
                                    <div>Avg : {props.avgWeight} Kg</div>
                                    <div>Min : {props.minWeight} Kg</div>
                                    <div>Max : {props.maxWeight} Kg</div>
                                </Grid>
                            </Grow>
                            {chartData.list.length > 1 && 
                                <Grow in={open} {...(open ? { timeout: 2500 } : {})}>
                                    <Grid item xs={10} className={classes.dataBox}>
                                    <Chart
                                        height={'500px'}
                                        chartType="LineChart"
                                        loader={<div>Loading Chart</div>}
                                        data={chartData.list}
                                        options={{
                                            hAxis: {
                                            title: 'Time',
                                            },
                                            vAxis: {
                                            title: 'Temperature / Humidity / Weight',
                                            minValue: 0,
                                            maxValue: 100
                                            },
                                            animation: {
                                                duration: 2000,
                                                easing: 'linear',
                                                startup: true,
                                            },
                                        }}
                                        chartEvents={[
                                            {
                                            eventName: 'animationfinish',
                                            callback: () => {
                                                console.log('Animation Finished')
                                            },
                                            },
                                        ]}
                                        rootProps={{ 'data-testid': '1' }}
                                    />
                                    
                                    </Grid>
                                </Grow>
                            }
                        </Grid>
                        
                    </Collapse>
                </TableCell>
                
            </TableRow>
        </>
    );
}

function RowNotFound(){
    const classes = useStyles();
    return(
        <TableRow className={classes.root}>
            <TableCell style={{textAlign:'center'}} scope="row" colSpan={5}>
                Records Not Found!
            </TableCell>
        </TableRow>
    );
}

function RowDataLoading(){
    const classes = useStyles();
    return(
        <TableRow className={classes.root}>
            <TableCell style={{textAlign:'center'}} scope="row" colSpan={5}>
                <CircularProgress />
            </TableCell>
        </TableRow>
    );
}

