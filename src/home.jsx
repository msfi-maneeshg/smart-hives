import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {AppBar,Toolbar,Typography,CssBaseline,Container,Paper, Grid, FormControl,InputLabel,Select,MenuItem,TextField,CircularProgress } from '@material-ui/core';
import Chart from "react-google-charts";
import clsx from 'clsx';
import {Alert} from '@material-ui/lab';
import mqtt from 'mqtt';

// import {mqtt} from 'mqtt'

const useStyles = makeStyles((theme) => ({
    root: {
      flexGrow: 1,
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
  }));

export function Home(props) {
    const classes = useStyles();
    const [weight ,setWeight]= useState(50);
    const [temperature,setTemperature]= useState(0);
    const [humidity,setHumidity]= useState(0);
    const [farmer,setFarmer] = useState('')
    const [hive,setHive] = useState('')
    const [farmerList,setFarmerList] = useState({list:[]})
    const [hiveList,setHiveList] = useState({list:[]})
    const [isFarmerLoaded,setIsFarmerLoaded] = useState(false) 
    const [isHiveLoaded,setIsHiveLoaded] = useState(false) 
    const [isNotificationStart,setIsNotificationStart] = useState(false) 
    const [weightArray,setWeightArray] = useState({data:[['x', 'Weight','Temperature','Humidity']]})
    const [isEventDataLoaded,setIsEventDataLoaded] = useState(false)
    const [eventIntervalId, setEventIntervalId] = useState(null);

    const [isDBDataLoaded,setIsDBDataLoaded] = useState(false)
    var currentDate = new Date()
    let formatTwoDigits = (digit) => ("0" + digit).slice(-2);
    var currentDateFormated = currentDate.getFullYear()+"-"+formatTwoDigits(currentDate.getMonth()+1)+"-"+formatTwoDigits(currentDate.getDate())
    const [selectedDate,setSelectedDate] = useState(currentDateFormated)
    const [cloudantArray,setCloudantArray] = useState({data:[['x','Temperature','Humidity']]})
    const [notificationData,setNotificationData] = useState(null)
    //---------load farmer's list
    
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
        if(!isHiveLoaded && farmer){
            setIsHiveLoaded(true)
            const requestOptions = {
                method: 'GET',
                headers: { 
                    'Content-Type': 'application/json'
                }
            };
            
            let apiUrl = "http://localhost:8000/devices/"+farmer
        
            fetch(apiUrl, requestOptions)
            .then((response) => {
                return response.json()   
            })
            .then((data) => {
                if(data.meta.total_rows > 0){
                    setHiveList({list:data.results})
                }
            });

        }
    })

    
    
    
    useEffect(() => {
        if(!isEventDataLoaded && farmer && hive){
            setIsEventDataLoaded(true)
            console.log("Connecting mqtt")
            var connectOptions = {
                rejectUnauthorized: false,
                username:'a-62m15c-ubghzixbav',
                password:'r+@6D*-wMzAw6U&4tA',
                clientId: 'a:62m15c:test2',
            };
            var mqtt = require('mqtt');

            var client = mqtt.connect('tcp://62m15c.messaging.internetofthings.ibmcloud.com/',connectOptions);  
            client.subscribe("iot-2/type/"+farmer+"/id/"+hive+"/evt/HiveEvent/fmt/+");
        
            client.on('message', function (topic, message) {
                // message is Buffer
                var data = JSON.parse(message.toString())
                setTemperature(data.temperature)
                setHumidity(data.humidity)
                setWeight(data.weight)

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
                    NewtempWeight.push([newTimestamp,data.weight,data.temperature,data.humidity])
                    setWeightArray({data:NewtempWeight})
                }
            });
        }
    });

    useEffect(() => {
        if(!isEventDataLoaded && farmer && hive && false){
            setIsEventDataLoaded(true)
            let newEventIntervalID = setInterval(() => {
                // let isStatusOK = false;
                const requestOptions = {
                    method: 'GET',
                    headers: { 
                        'Content-Type': 'application/json'
                    }
                };
                
                let apiUrl = "http://localhost:8000/last-event/"+farmer+"/"+hive
            
                fetch(apiUrl, requestOptions)
                .then((response) => {
                    //console.log(response)
                    return response.json()   
                })
                .then((data) => {
                    setTemperature(data[0].data.temperature)
                    setHumidity(data[0].data.humidity)
                    setWeight(data[0].data.weight)

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
                    
                    let newTimestamp = new Date(NewtempWeight[NewtempWeight.length-1][0])
                    let oldTimestamp = new Date(data[0].timestamp)
                    
                    if(newTimestamp.getTime() !== oldTimestamp.getTime()){
                        NewtempWeight.push([new Date(data[0].timestamp),data[0].data.weight,data[0].data.temperature,data[0].data.humidity])
                        setWeightArray({data:NewtempWeight})
                    }
                    // console.log(NewtempWeight)
                });
            }, 1000)
            if(eventIntervalId != null){
                clearInterval(eventIntervalId)
            }
            setEventIntervalId(newEventIntervalID)

            
            
        }
    })

    useEffect(() => {
        if(!isDBDataLoaded && farmer && hive && selectedDate){
            setIsDBDataLoaded(true)
            const requestOptions = {
                method: 'GET',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization':'Basic YXBpa2V5LXYyLTI5bW51dWFyeXNuejZ6d3YxbnA4ZnpwODA4YTVlNDA1Mm00NzgzaGprZmxoOjk5Mzg1NmNhODczZWZiMzNjYzY3ZmM2YzgyZDZjN2U4'
                },
            };
            
            let apiUrl = "https://433c346a-cb7c-4736-8e95-0bc99303fe1a-bluemix.cloudant.com/iotp_62m15c_farmer-1_"+selectedDate+"/_design/iotp/_view/by-milliseconds?descending=true"
        

            fetch(apiUrl, requestOptions)
            .then((response) => {
                return response.json()   
            })
            .then((data) => {
                let tempData = [['x','Temperature','Humidity']]
                if(!data.error){
                    for(let i = 0 ; i<data.rows.length;i++){
                        let element = data.rows[i]
                        if(element.value.deviceId === hive){
                            tempData.push([new Date(element.value.timestamp),element.value.data.temperature,element.value.data.humidity])
                        }
                        if(tempData.length === 51){
                            break
                        }
                    }
                }
                setCloudantArray({data:tempData})
            });
            
        }
    })

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
                
                let apiUrl = "https://433c346a-cb7c-4736-8e95-0bc99303fe1a-bluemix.cloudant.com/iotp-notification/_all_docs?include_docs=true&limit=1"
            
            
                fetch(apiUrl, requestOptions)
                .then((response) => {
                    return response.json()   
                })
                .then((data) => {
                    if(data.total_rows > 0){
                        setNotificationData(data.rows[0].doc)
                    }
                });
            }, 10000)
        }
    })


    const handleChangeFarmer = (e) => {
        setFarmer(e.target.value)
        setIsHiveLoaded(false)
    } 

    const handleChangeHive = (e) => {
        setHive(e.target.value)
        setIsEventDataLoaded(false)
        setIsDBDataLoaded(false)
        setWeightArray({data:[['x', 'Weight','Temperature','Humidity']]})
    } 

    const changeDate = (e) => {
        setSelectedDate(e.target.value)
        setIsDBDataLoaded(false)
    }

    const handleCloseNotification = () => {
        const requestOptions = {
            method: 'DELETE',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization':'Basic YXBpa2V5LXYyLTI5bW51dWFyeXNuejZ6d3YxbnA4ZnpwODA4YTVlNDA1Mm00NzgzaGprZmxoOjk5Mzg1NmNhODczZWZiMzNjYzY3ZmM2YzgyZDZjN2U4'
            },
        };
        
        let apiUrl = "https://433c346a-cb7c-4736-8e95-0bc99303fe1a-bluemix.cloudant.com/iotp-notification/"+notificationData._id
    
    
        fetch(apiUrl, requestOptions)
        .then((response) => {
            return response.json()   
        })
        .then((data) => {
            setNotificationData(null)
            setIsNotificationStart(false)
        });
    }
    
  return (
    <>
      <CssBaseline />
        <AppBar>
          <Toolbar>
            <Typography variant="h6">Smart Hives</Typography>
          </Toolbar>
        </AppBar>
        <Toolbar />
        <Container className={classes.mainContainer}>
            <div className={classes.root}>
                <Grid container spacing={3}>
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

                        <FormControl variant="outlined" className={classes.formControl}>
                            <InputLabel id="Hive-label">Hive</InputLabel>
                            <Select
                            labelId="Hive-label"
                            id="Hive"
                            value={hive}
                            onChange={(e) => handleChangeHive(e)}
                            label="Farmer"
                            >
                            <MenuItem value="" disabled>
                                <em>None</em>
                            </MenuItem>
                            {
                                hiveList.list.length > 0 && hiveList.list.map((info,index) => (
                                    <MenuItem key={index} value={info.deviceId}>{info.deviceId}</MenuItem>
                                ))
                            }
                            
                            </Select>
                        </FormControl>
                    </Paper>
                    </Grid>
                    { notificationData !== null &&
                    <Grid item xs={12}>
                        <Paper className={classes.paper}>
                            <Alert severity="warning" onClose={() => handleCloseNotification()}>Humidity is low for {notificationData.deviceId}</Alert>
                        </Paper>
                    </Grid>
                    }

                    { farmer && hive && <>
                    <Grid item xs={4}>
                        <Paper className={clsx(classes.paper,classes.paperCenter)}>
                        <h1>Weight</h1>
                        <div style={{display:'flex'}}>
                        <Chart
                            chartType="Gauge"
                            loader={<div>Loading Chart</div>}
                            data={[
                            ['Label', 'Value'],
                            ['', weight],
                            ]}
                            options={{
                            minorTicks: 25,
                            majorTicks:[50,75,100,125,150,175,200],
                            min:50,
                            max:200,
                            }}
                            rootProps={{ 'data-testid': '1' }}
                        />
                        </div>
                    </Paper>
                    </Grid>
                    <Grid item xs={4}>
                        <Paper className={clsx(classes.paper,classes.paperCenter)}>
                        <h1>Temperature</h1>
                        <div style={{display:'flex'}}>
                        <Chart
                            chartType="Gauge"
                            loader={<div>Loading Chart</div>}
                            data={[
                            ['Label', 'Value'],
                            ['', Number(temperature.toFixed(0))],
                            ]}
                            options={{
                            redFrom: 45,
                            redTo: 60,
                            yellowFrom: 40,
                            yellowTo: 45,
                            greenFrom: 27,
                            greenTo: 40,
                            minorTicks: 10,
                            majorTicks:[-10,"0",10,20,30,40,50,60],
                            min:-10,
                            max:60,
                            }}
                            rootProps={{ 'data-testid': '1' }}
                        />
                        </div>
                    </Paper>
                    </Grid>
                    <Grid item xs={4}>
                        <Paper className={clsx(classes.paper,classes.paperCenter)}>
                        <h1>Humidity</h1>
                        <div style={{display:'flex'}}>
                        <Chart
                            chartType="Gauge"
                            loader={<div>Loading Chart</div>}
                            data={[
                            ['Label', 'Value'],
                            ['', humidity],
                            ]}
                            options={{
                            redFrom: 50,
                            redTo: 100,
                            yellowFrom: 40,
                            yellowTo: 50,
                            greenFrom: 25,
                            greenTo: 40,
                            minorTicks: 10,
                            majorTicks:["0",10,20,30,40,50,60,70,80,90,100],
                            }}
                            rootProps={{ 'data-testid': '1' }}
                        />
                        </div>
                    </Paper>
                    </Grid>
                    
                    <Grid item xs={12}>
                        <Paper className={clsx(classes.paper)}>
                            <h3>Last event data</h3>
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
                                    title: 'Weigth / Temperature / Humidity',
                                    },
                                }}
                                rootProps={{ 'data-testid': '1' }}
                            />:
                            <CircularProgress />       
                            }
                        </Paper>
                    </Grid>

                    <Grid item xs={12}>
                        <Paper className={clsx(classes.paper)}>
                            <TextField
                                id="date"
                                label="Result for"
                                type="date"
                                onChange={(e) => changeDate(e)}
                                value={selectedDate}
                                className={classes.textField}
                                InputLabelProps={{
                                shrink: true,
                                }}
                            />
                            {cloudantArray.data.length > 1 ?
                                <Chart
                                    height={'500px'}
                                    chartType="LineChart"
                                    loader={<div>Loading Chart</div>}
                                    data={cloudantArray.data}
                                    options={{
                                        hAxis: {
                                        title: 'Time',
                                        },
                                        vAxis: {
                                        title: 'Temperature / Humidity',
                                        },
                                    }}
                                    rootProps={{ 'data-testid': '1' }}
                                />:
                                <h4>No Record found</h4>
                            }
                        </Paper>
                    </Grid>        
                    </>}        
                </Grid>
            </div>
        </Container>
    </>
  );
}