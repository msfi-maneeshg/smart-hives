import { React,useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {Button,AppBar,Toolbar,Typography,CssBaseline,Container,Paper, Grid, FormControl,InputLabel,Select,MenuItem,TableCell,TableRow,TableBody,TableContainer,Table,TableHead,IconButton,Collapse ,TextField,CircularProgress,Grow} from '@material-ui/core';
import {ExpandMore,ExpandLess} from '@material-ui/icons'
import Chart from "react-google-charts";
import { WiThermometer,WiHumidity, } from "react-icons/wi";
import { GiWeight } from "react-icons/gi";
import {Alert} from '@material-ui/lab';
import Modal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';
import clsx from 'clsx';


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
        padding: theme.spacing(5,0,0,0)
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
}));


export function Home(){
    const classes = useStyles();
    const [farmer,setFarmer] = useState('')
    const [farmerList,setFarmerList] = useState({list:[]})
    const [isFarmerLoaded,setIsFarmerLoaded] = useState(false) 
    const [openAddFarmer, setOpenAddFarmer] = useState(false);
    const [openAddHive, setOpenAddHive] = useState(false);
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
    const [newFarmerName,setNewFarmerName] = useState("")
    const [newHiveName,setNewHiveName] = useState("")
    const [period, setPeriod] = useState(formatTwoDigits(currentDate.getUTCHours())+"-"+formatTwoDigits(currentDate.getUTCHours()+1));
    const [closeNotificationFarmer,setCloseNotificationFarmer] = useState(false) 
    const [closeNotificationHive,setCloseNotificationHive] = useState(false) 
    const [notificationHive,setNotificationHive] = useState({severity:"",msg:""}) 
    const [notificationFarmer,setNotificationFarmer] = useState({severity:"",msg:""}) 

    const [addFarmerButton,setAddFarmerButton] = useState(false)
    const [addHiveButton,setAddHiveButton] = useState(false)
    const handleChangeFarmer = (e) => {
        setFarmer(e.target.value)
        setIsDataLoaded(false)
    }


    useEffect(() => {
        if(!isFarmerLoaded){
            setIsFarmerLoaded(true)
            const requestOptions = {
                method: 'GET',
                headers: { 
                    'Content-Type': 'application/json'
                }
            };
            
            let apiUrl = "http://localhost:8000/device-types"
        
            fetch(apiUrl, requestOptions)
            .then((response) => {
                return response.json()   
            })
            .then((data) => {
                if(data.meta.total_rows > 0){
                    setFarmerList({list:data.results})
                    
                }
            });

        }
    },[isFarmerLoaded])

    useEffect(() => {
        if(!isDataLoaded && farmer){
            setIsDataLoaded(true)
            setTableDataLoader(true)
            var selectedDateTemp =  new Date(selectedDate)
            var startKeyDate = selectedDateTemp.getUTCFullYear()+"-"+formatTwoDigits(selectedDateTemp.getUTCMonth()+1)+"-"+formatTwoDigits(selectedDateTemp.getUTCDate())
            const requestOptions = {
                method: 'GET',
                headers: { 
                    'Content-Type': 'application/json',
                }
            };
            var tempFarmer = (farmer==="Farmer-1-Hives")?"farmer-1":farmer;
            let apiUrl = "http://localhost:8000/hive-data/"+tempFarmer+"/"+startKeyDate+"/"+period
        

            fetch(apiUrl, requestOptions)
            .then((response) => {
                return response.json()   
            })
            .then((data) => {
                if(data && data.length > 0){
                    setHiveAggregatedData({list:data})   
                }else{
                    setHiveAggregatedData({list:[]})  
                }
                setTableDataLoader(false)
            });
            
        }
    },[isDataLoaded, farmer, selectedDate])

    useEffect(() => {
        if(!isNotificationStart && farmer){
            setIsNotificationStart(true)
            setInterval(() => {
                const requestOptions = {
                    method: 'GET',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization':'Basic YXBpa2V5LXYyLTI5bW51dWFyeXNuejZ6d3YxbnA4ZnpwODA4YTVlNDA1Mm00NzgzaGprZmxoOjk5Mzg1NmNhODczZWZiMzNjYzY3ZmM2YzgyZDZjN2U4'
                    },
                };
                
                let apiUrl = 'https://433c346a-cb7c-4736-8e95-0bc99303fe1a-bluemix.cloudant.com/iotp-notification/_design/iotp/_view/by-deviceType?key="'+farmer+'"'
            
            
                fetch(apiUrl, requestOptions)
                .then((response) => {
                    return response.json()   
                })
                .then((data) => {
                    if(data.total_rows > 0){
                        setNotificationData(data.rows)
                    }
                });
            }, 60000)
        }
    })

    const changeDate = (e) => {
        setSelectedDate(e.target.value)
        setIsDataLoaded(false)
        setHiveAggregatedData({list:[]})
    }

    const handleAddFarmerModal = () => {
        setNewFarmerName("")
        setOpenAddFarmer(!openAddFarmer);
    };
    
    const handleAddHiveModal = () => {
        setNewHiveName("")
        setOpenAddHive(!openAddHive);
    };

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
                'Authorization':'Basic YXBpa2V5LXYyLTI5bW51dWFyeXNuejZ6d3YxbnA4ZnpwODA4YTVlNDA1Mm00NzgzaGprZmxoOjk5Mzg1NmNhODczZWZiMzNjYzY3ZmM2YzgyZDZjN2U4'
            },
        };
        
        let apiUrl = "https://433c346a-cb7c-4736-8e95-0bc99303fe1a-bluemix.cloudant.com/iotp-notification/"+info.value._id+"?rev="+info.value._rev
    
    
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

    const AddNewFarmer = () => {
        
        if(newFarmerName){
            setAddFarmerButton(true)
            let responseStatus;
            let apiEndPoint = 'http://localhost:8000/iot/create-device-type/'+newFarmerName;
            
            const requestOptions = {
                method: "POST",    
            };
            fetch(apiEndPoint, requestOptions)
                .then((response) => {
                    const data = response.json();
                    responseStatus = response.status;
                    return data   ;
                })
                .then((data) => {
                    if(responseStatus === 200){
                        setIsFarmerLoaded(false)
                        setNotificationFarmer({severity:"success",msg:data.msg})
                        setOpenAddFarmer(false)
                    }else if (responseStatus === 400){
                        setNotificationFarmer({severity:"warning",msg:data.msg})
                    }else{
                        setNotificationFarmer({severity:"warning",msg:"Something went wrong!"})
                    }
                    setCloseNotificationFarmer(true)
                    setAddFarmerButton(false)
                });
        }
    }

    const AddNewHive = () => {
        
        if(newHiveName && farmer){
            setAddHiveButton(true)
            let responseStatus;
            let apiEndPoint = 'http://localhost:8000/iot/create-device/'+farmer+'/'+newHiveName;
            
            const requestOptions = {
                method: "POST",    
            };
            fetch(apiEndPoint, requestOptions)
                .then((response) => {
                    const data = response.json();
                    responseStatus = response.status;
                    return data   ;
                })
                .then((data) => {
                    if(responseStatus === 200){
                        setNotificationHive({severity:"success",msg:data.msg})
                        setOpenAddHive(false)
                    }else if (responseStatus === 400){
                        setNotificationHive({severity:"warning",msg:data.msg})
                    }else{
                        setNotificationHive({severity:"warning",msg:"Something went wrong!"})
                    }
                    
                    setCloseNotificationHive(true)
                    setAddHiveButton(false)
                });
        }
    }

    const rowHiveData = hiveAggregatedData.list.map((hiveData,index) => (
        <Rows key={index} {...hiveData} farmer={farmer} />
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
        <>
      <CssBaseline />
        <AppBar>
          <Toolbar>
            <Typography variant="h6">Smart Hives - Aggregated view</Typography>
          </Toolbar>
        </AppBar>
        <Toolbar />
        <Container className={classes.mainContainer}>
            <div className={classes.root}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        {closeNotificationFarmer && notificationFarmer.severity === "success" &&
                        <Alert severity={notificationFarmer.severity}  onClose={() => setCloseNotificationFarmer(false)}>{notificationFarmer.msg}</Alert>       
                        }
                        {closeNotificationHive &&  notificationHive.severity === "success" &&
                        <Alert severity={notificationHive.severity}  onClose={() => setCloseNotificationHive(false)}>{notificationHive.msg}</Alert>       
                        }
                    </Grid>
                    <Grid item xs={12}>
                        <Paper className={classes.paper}>
                            <FormControl variant="outlined" className={classes.formControl}>
                                <InputLabel id="Farmer-label">Farmer</InputLabel>
                                <Select
                                labelId="Farmer-label"
                                id="Farmer"
                                value={farmer}
                                onChange={(e) => handleChangeFarmer(e)}
                                label="Farmer"
                                >
                                <MenuItem value="" disabled>
                                    <em>None</em>
                                </MenuItem>
                                {
                                    farmerList.list.length > 0 && farmerList.list.map((info,index) => (
                                        <MenuItem key={index} value={info.id}>{info.id}</MenuItem>
                                    ))
                                }
                                
                                </Select>
                            </FormControl>
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
                            <Button style={{float:'right'}} className={classes.formControl} variant="outlined" color="primary" onClick={() =>handleAddFarmerModal()}>Add New Farmer</Button>    
                            <Button style={{float:'right'}} className={classes.formControl} variant="outlined" color="primary" onClick={() =>handleAddHiveModal()} disabled={farmer?false:true}>Add Hive</Button>    
                        </Paper>
                        <Modal
                            aria-labelledby="transition-modal-title"
                            aria-describedby="transition-modal-description"
                            className={classes.modal}
                            open={openAddFarmer}
                            onClose={handleAddFarmerModal}
                            closeAfterTransition
                            BackdropComponent={Backdrop}
                            BackdropProps={{
                            timeout: 500,
                            }}
                        >
                            <Fade in={openAddFarmer}>
                            <Paper className={classes.paper}>
                                <h2 id="transition-modal-title">Add New Farmer</h2>
                                <Grid container spacing={3}>
                                <Grid item xs={12}>
                                        {closeNotificationFarmer && notificationFarmer.severity !== "success" &&
                                        <Alert severity={notificationFarmer.severity}  onClose={() => setCloseNotificationFarmer(false)}>{notificationFarmer.msg}</Alert>       
                                        }
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField id="outlined-basic" label="FarmerID" variant="outlined" value={newFarmerName} onChange={(e) => setNewFarmerName(e.target.value)} />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Button variant="outlined" color="primary" onClick={() => AddNewFarmer()} disabled={newFarmerName?false:true}>{addFarmerButton?<><CircularProgress />{"Creating"}</>:"Create"}</Button>    
                                    </Grid>
                                </Grid>
                            </Paper>
                            </Fade>
                        </Modal>
                        <Modal
                            aria-labelledby="transition-modal-title"
                            aria-describedby="transition-modal-description"
                            className={classes.modal}
                            open={openAddHive}
                            onClose={handleAddHiveModal}
                            closeAfterTransition
                            BackdropComponent={Backdrop}
                            BackdropProps={{
                            timeout: 500,
                            }}
                        >
                            <Fade in={openAddHive}>
                            <Paper className={classes.paper}>
                                <h2 id="transition-modal-title">Add New Hive</h2>
                                <Grid container spacing={3}>
                                    <Grid item xs={12}>
                                        {closeNotificationHive &&  notificationHive.severity !== "success" &&
                                        <Alert severity={notificationHive.severity}  onClose={() => setCloseNotificationHive(false)}>{notificationHive.msg}</Alert>       
                                        }
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField id="outlined-basic" label="HiveID" variant="outlined" value={newHiveName} onChange={(e) => setNewHiveName(e.target.value)} />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Button variant="outlined" color="primary" onClick={() => AddNewHive()} disabled={newHiveName?false:true}>{addHiveButton?<><CircularProgress />{"Creating"}</>:"Create"}</Button>    
                                    </Grid>
                                </Grid>
                            </Paper>
                            </Fade>
                        </Modal>
                    </Grid>
                    { notificationData !== null &&  notificationData.length !== 0 &&
                        <Grid item xs={12}>
                        <Paper className={classes.paper}>
                        <Typography variant="h6" gutterBottom>Alerts</Typography>
                            {notificationData.map((data,index) => (
                                <Alert key={index} severity="warning"  onClose={(e) => handleCloseNotification(e,data)}>Alert for {data.value.deviceId}, Temperature is : {data.value.temperature}°C and Humidity is : {data.value.humidity}%</Alert>
                                ))
                            }
                        </Paper>
                        
                        </Grid>

                    }
                    {farmer && 
                        <Grid item xs={12}>
                            <TableContainer component={Paper}>
                                <Table aria-label="collapsible table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Hive</TableCell>
                                            <TableCell align="right">Temperature&nbsp;(°C)</TableCell>
                                            <TableCell align="right">Humidity&nbsp;(%)</TableCell>
                                            <TableCell align="right">Weight&nbsp;(Kg)</TableCell>
                                            <TableCell align="right">View</TableCell>
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
    </>
    );
} 

function currentQuarterOfDay(){
    var currentDate = new Date()
    currentDate.setUTCHours(currentDate.getUTCHours() - 6) // last processed data to show
    var quarterOfDay;
    if(currentDate.getUTCHours() < 6){
        quarterOfDay = 'Q1'
    }else if(currentDate.getUTCHours() < 12){
        quarterOfDay = 'Q2'
    }else if(currentDate.getUTCHours() < 18){
        quarterOfDay = 'Q3'
    }else if(currentDate.getUTCHours() < 24){
        quarterOfDay = 'Q4'
    }
    return quarterOfDay
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
                                    <Grid item xs={12} className={classes.dataBox}>
                                    <h3>Insight data</h3>
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
                            <Grow in={open} {...(open ? { timeout: 2500 } : {})}>
                                <RealTimeRecord farmer={props.farmer} hive={props.deviceID}/>
                            </Grow>
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

function RealTimeRecord(props){
    const classes = useStyles();
    const [isEventDataLoaded,setIsEventDataLoaded] = useState(false)
    const [weightArray,setWeightArray] = useState({data:[['x','Temperature','Humidity', 'Weight']]})
    useEffect(() => {
        if(!isEventDataLoaded && props.farmer && props.hive){
            setIsEventDataLoaded(true)
            var connectOptions = {
                rejectUnauthorized: false,
                username:'a-8l173e-ahdw2reb1r',
                password:'XKe_utxjf(jf+VHkXV',
                clientId: 'a:8l173e:test1',
            };
            var mqtt = require('mqtt');

            var client = mqtt.connect('tcp://8l173e.messaging.internetofthings.ibmcloud.com/',connectOptions);  
            client.subscribe("iot-2/type/"+props.farmer+"/id/"+props.hive+"/evt/HiveEvent/fmt/+");
        
            client.on('message', function (topic, message) {
                // message is Buffer
                var data = JSON.parse(message.toString())
                
                let tempWeight = weightArray.data
                let NewtempWeight;
                if(tempWeight.length > 50 ){
                    // NewtempWeight = tempWeight.filter(function(element,index) {
                    //     return index !== 1
                    // });
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
    });

    return(
        <Grid item xs={12} className={classes.dataBox}>
            <Paper className={clsx(classes.paper)}>
                <h3>Real Time data</h3>
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
            </Paper>
        </Grid>

    )
}
