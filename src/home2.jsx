import { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {AppBar,Toolbar,Typography,CssBaseline,Container,Paper, Grid, FormControl,InputLabel,Select,MenuItem,TableCell,TableRow,TableBody,TableContainer,Table,TableHead,IconButton,Collapse ,Divider,TextField,ButtonGroup,Button,CircularProgress } from '@material-ui/core';
import {ExpandMore,ExpandLess} from '@material-ui/icons'
import Chart from "react-google-charts";

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
    }
}));

export function Home(){
    const classes = useStyles();
    const [farmer,setFarmer] = useState('')
    const [farmerList,setFarmerList] = useState({list:[]})
    const [isFarmerLoaded,setIsFarmerLoaded] = useState(false) 
    var currentDate = new Date()
    let formatTwoDigits = (digit) => ("0" + digit).slice(-2);
    var currentDateFormated = currentDate.getFullYear()+"-"+formatTwoDigits(currentDate.getMonth()+1)+"-"+formatTwoDigits(currentDate.getDate())
    const [selectedDate,setSelectedDate] = useState(currentDateFormated)
    const [selectedTab,setSelectedTab] = useState(currentQuarterOfDay())
    const [isDataLoaded,setIsDataLoaded] = useState(false)
    const [tableDataLoader,setTableDataLoader] = useState(false)
    const [hiveAggregatedData,setHiveAggregatedData] = useState({list:[]})
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
            const requestOptions = {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization':'Basic YXBpa2V5LXYyLTI5bW51dWFyeXNuejZ6d3YxbnA4ZnpwODA4YTVlNDA1Mm00NzgzaGprZmxoOjk5Mzg1NmNhODczZWZiMzNjYzY3ZmM2YzgyZDZjN2U4'
                },
                body: JSON.stringify({ 
                    include_docs:  true,
                })
            };
            
            let apiUrl = "https://433c346a-cb7c-4736-8e95-0bc99303fe1a-bluemix.cloudant.com/iotp_62m15c_farmer-1/_all_docs"
        

            fetch(apiUrl, requestOptions)
            .then((response) => {
                return response.json()   
            })
            .then((data) => {
               var selectedDateTemp =  new Date(selectedDate)
               console.log(selectedDateTemp.getUTCFullYear()+"_"+formatTwoDigits(selectedDateTemp.getUTCMonth())+"_"+formatTwoDigits(selectedDateTemp.getUTCDate()))
                if(!data.error){
                    var tempData = [];
                    data.rows.forEach(element => {
                        if(element.id.includes(selectedTab) && element.id.includes(selectedDateTemp.getUTCFullYear()+"_"+formatTwoDigits(selectedDateTemp.getUTCMonth()+1)+"_"+formatTwoDigits(selectedDateTemp.getUTCDate()))){
                            tempData.push(element) 
                        }
                    });
                    setHiveAggregatedData({list:tempData})
                    setTableDataLoader(false)
                }
            });
            
        }
    })

    const changeDate = (e) => {
        setSelectedDate(e.target.value)
        setIsDataLoaded(false)
        setHiveAggregatedData({list:[]})
    }


    const changeQuarterTab = (tabID) => {
        setSelectedTab(tabID)
        setIsDataLoaded(false)
        setHiveAggregatedData({list:[]})
        
    }

    const rowHiveData = hiveAggregatedData.list.map((hiveData,index) => (
        <Rows key={index} {...selectedTab} {...hiveData}/>
    ))

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
                        </Paper>
                    </Grid>
                    {farmer && 
                    <>
                    <Grid item xs={12}>
                        <Paper className={classes.paper}>
                            <Grid container spacing={3}>
                                <Grid item xs={3}>
                                    <TextField
                                        id="date"
                                        label="Result for"
                                        type="date"
                                        onChange={(e) => changeDate(e)}
                                        value={selectedDate}
                                        className={classes.textField}
                                        InputProps={{inputProps: {max: currentDateFormated}}}
                                    />
                                </Grid>
                                <Grid item xs={9}>
                                    <ButtonGroup color="primary" aria-label="contained primary button group">
                                        <Button variant={selectedTab==="Q1" && "contained"} onClick={() =>changeQuarterTab("Q1")}>Q1 (12:01AM-06:00AM)</Button>
                                        <Button variant={selectedTab==="Q2" && "contained"} onClick={() =>changeQuarterTab("Q2")}>Q2 (06:01AM-12:00PM)</Button>
                                        <Button variant={selectedTab==="Q3" && "contained"} onClick={() =>changeQuarterTab("Q3")}>Q3 (12:01PM-06:00PM)</Button>
                                        <Button variant={selectedTab==="Q4" && "contained"} onClick={() =>changeQuarterTab("Q4")}>Q4 (06:01PM-12:00AM)</Button>
                                    </ButtonGroup>
                                </Grid>
                            </Grid>
                            
                        </Paper>
                    </Grid>
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
                                    {hiveAggregatedData.list.length == 0 && isDataLoaded ?<RowNotFound /> :rowHiveData}
                                    </>}
                                    
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid>
                    </>                        
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
        if(props.doc.data && !isDataLoaded){
            var sortedData = props.doc.data 
            sortedData.sort((a, b) => a.timestamp > b.timestamp ? 1 : -1)
            setIsDataLoaded(true)
            var tempList = chartData.list;
            for(var i = 0;i< sortedData.length;i++){
                tempList.push([sortedData[i].timestamp,sortedData[i].temperature,sortedData[i].humidity,sortedData[i].weight])
            }
            setChartData({list:tempList})
        }
    })

    return(
        <>
            <TableRow className={classes.root}>
                <TableCell component="th" scope="row">
                    {props.doc.deviceID}
                </TableCell>
                <TableCell align="right">{props.doc.avgTemperature}</TableCell>
                <TableCell align="right">{props.doc.avgHumidity}</TableCell>
                <TableCell align="right">{props.doc.avgWeight}</TableCell>
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
                            <Grid item xs={3} className={classes.dataBox}>
                                <div>Temperature</div>
                                <div>Avg : {props.doc.avgTemperature}°C</div>
                                <div>Min : {props.doc.minTemperature}°C</div>
                                <div>Max : {props.doc.maxTemperature}°C</div>
                            </Grid>
                            <Grid item xs={3} className={classes.dataBox}>
                                <div>Humidity</div>
                                <div>Avg : {props.doc.avgHumidity}%</div>
                                <div>Min : {props.doc.minHumidity}%</div>
                                <div>Max : {props.doc.maxHumidity}%</div>
                            </Grid>
                            <Grid item xs={3} className={classes.dataBox}>
                                <div>Weight</div>
                                <div>Avg : {props.doc.avgWeight} Kg</div>
                                <div>Min : {props.doc.minWeight} Kg</div>
                                <div>Max : {props.doc.maxWeight} Kg</div>
                            </Grid>
                            {chartData.list.length > 1 &&<Grid item xs={12} className={classes.dataBox}>
                                
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
                                        },
                                    }}
                                    rootProps={{ 'data-testid': '1' }}
                                />
                                
                            </Grid>}
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
