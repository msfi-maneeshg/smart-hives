import {React, useState, useEffect,useMemo} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import {
    Paper, Modal, Fade, Backdrop, ButtonGroup, Button,
    Accordion, AccordionSummary, AccordionDetails, Typography,
    Grid, TextField, LinearProgress, FormHelperText ,Stepper,
    Step, StepLabel, Collapse, Divider
} from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import NotInterestedIcon from '@material-ui/icons/NotInterested';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import {Alert} from '@material-ui/lab';
import {useSelector,useDispatch} from 'react-redux'
import {changeLoginStatus} from './Reducers';
import {ExpandMore,ExpandLess} from '@material-ui/icons'
import {API_URL} from './constant'
import { useHistory } from "react-router-dom";
import {RefreshToken} from "./common"

const useStyles = makeStyles((theme) => ({
  table: {
    minWidth: 650,
  },
  tableContainer:{
      marginTop:'5vh'
  },
  deleteButton:{
      "&:hover":{
          color:'#eda116',
          cursor:'pointer'
      }
  },
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deviceDeleteBox: {
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
    textAlign:'center'
  },
  inputBox:{
    width:'100%'
  },
    filedError:{
        color:'red'
    },
    bottomButton:{
        float:'right',
        marginRight:'5px'
    },
    editDeviceInfoBox:{
        margin: theme.spacing(2,1,3,1),
        width:'100%'
    }
}));


export function MyDevices() {
    const classes = useStyles();
    let history = useHistory();
    const dispatch = useDispatch();
    const userInfo = useSelector((state) => state.UserLoginStatus);
    const [isDevicesLoaded,setIsDeviceLoaded] = useState(false)
    const [deviceList,setDeviceList] = useState({status:false,list:[]})
    const [returnMessage, setReturnMessage] = useState({status:false,severity:'',msg:''})

    

    useEffect(() => {
        if(!isDevicesLoaded){
            const GetDeviceList = async() => {
                let responseStatus;
                let responseData;
                setIsDeviceLoaded(true)
                let apiUrl = API_URL+"devices"
                const requestOptions = {
                    method: 'GET',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization':'bearer '+userInfo.userToken
                    }
                };
            
                await fetch(apiUrl, requestOptions)
                .then((response) => {
                    responseStatus = response.status;
                    return response.json()   
                })
                .then((data) => {
                    responseData = data;
                });
        
                if(responseStatus === 200){
                    setDeviceList({status:true,list:responseData.results})
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
            GetDeviceList();
        }
    },[isDevicesLoaded, dispatch, history, userInfo])

  return (
    <>
        {returnMessage.status && <Grid item xs={12}>
                <Alert style={{marginBottom:'5vh'}} variant="filled"  elevation={6} severity={returnMessage.severity}  onClose={() => setReturnMessage({severity:"",msg:"",status:false})}>{returnMessage.msg}</Alert>
        </Grid>}
        <AddNewDevice onClick={() => setIsDeviceLoaded(false)}/>
        
        <TableContainer component={Paper} className={classes.tableContainer}>
            
            <Table className={classes.table} aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell colSpan={2}><b>My Devices</b></TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Device ID</TableCell>
                        <TableCell align="right">Action</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {deviceList.status && deviceList.list.length > 0 && deviceList.list.map((row) => (
                        <DeviceTableRow key={row.deviceId} returnMessage={returnMessage} setReturnMessage={setReturnMessage} username={userInfo.username} deviceId={row.deviceId} deviceInfo={row} onClick={() => setIsDeviceLoaded(false)} />
                    ))}
                    {deviceList.status && deviceList.list.length === 0  && <NoRecordFound/>}
                    {!deviceList.status && deviceList.list.length === 0 && <LoadingData />}
                </TableBody>
            </Table>
        </TableContainer>
    </>
  );
}
  
function DeviceTableRow(props){
    const classes = useStyles();
    let history = useHistory();
    const dispatch = useDispatch();
    const userInfo = useSelector((state) => state.UserLoginStatus);
    const [open, setOpen] = useState(false);
    const [openCollapse, setOpenCollapse] = useState(false);
    const [addButton,setAddButton] = useState({status:false,enable:false})
    const [returnMessage, setReturnMessage] = useState({status:false,severity:'',msg:''})
    const [isDelete,setIsDelete] = useState(false)

    useEffect(() => {
        if(isDelete){
            setIsDelete(false);
            const deleteDevice = async() => {
                if(props.deviceId){
                    setAddButton({status:true,enable:true})
                    let responseStatus;
                    let responseData;
                    let apiEndPoint = API_URL+"devices/"+props.deviceId;
                    
                    const requestOptions = {
                        method: "DELETE",
                        headers: { 
                            'Content-Type': 'application/json',
                            'Authorization':'bearer '+userInfo.userToken
                        }
                    };
                    await fetch(apiEndPoint, requestOptions)
                        .then((response) => {
                            const data = response.json();
                            responseStatus = response.status;
                            return data   ;
                        })
                        .then((data) => {
                            responseData = data 
                        });
                    
                    if(responseStatus === 200){
                        props.setReturnMessage({status:true,severity:"success",msg:"Device has been removed!"})
                        setAddButton({status:false,enable:false})
                        setOpen(false)
                        props.onClick()
                    }else if (responseStatus === 403 && responseData.error === "Token is expired") {
                        let res = await RefreshToken(userInfo)
                        if(res.responseStatus === 200){
                            dispatch(changeLoginStatus(res.responseData.content));   
                            setIsDelete(true)
                        }else{
                            dispatch(changeLoginStatus(""));  
                            setTimeout(() => {history.push('/login')}, 100)
                        }   
                    }else if (responseStatus === 400){
                        setReturnMessage({status:true,severity:"warning",msg:responseData.Error})
                        setAddButton({status:false,enable:false})
                    }else{
                        setReturnMessage({status:true,severity:"warning",msg:"Something went wrong!"})
                        setAddButton({status:false,enable:false})
                    }    
                }
            }
            deleteDevice();
        }
    },[isDelete, dispatch, history, props, userInfo])

    return(
        <>
            <TableRow>
                <TableCell component="th" scope="row" >
                {props.deviceId}
                </TableCell>
                <TableCell align="right" >
                    {openCollapse ? <ExpandLess  onClick={() => setOpenCollapse(!openCollapse)}/> : <ExpandMore onClick={() => setOpenCollapse(!openCollapse)} />}
                    <DeleteIcon className={classes.deleteButton} onClick={() => setOpen(true)} />
                </TableCell>
                
            </TableRow>
            <TableRow >
                <TableCell  style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
                    <Collapse in={openCollapse} timeout="auto" unmountOnExit>
                        <EditDeviceInformation deviceInfo={props.deviceInfo} />
                    </Collapse>
                </TableCell>
            </TableRow>    

            <Modal
                aria-labelledby="transition-modal-title"
                aria-describedby="transition-modal-description"
                className={classes.modal}
                open={open}
                onClose={() => setOpen(false)}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{
                timeout: 500,
                }}
            >
                <Fade in={open}>
                    <Paper className={classes.deviceDeleteBox}>
                        {returnMessage.status && <Grid item xs={12}>
                            <Alert variant="filled"  elevation={6} severity={returnMessage.severity}  onClose={() => setReturnMessage({severity:"",msg:"",status:false})}>{returnMessage.msg}</Alert>
                        </Grid>}
                        <h2 id="transition-modal-title">Are you sure?</h2>
                        <h5>You want to delete {props.deviceId} !</h5>
                        {!addButton.enable && 
                            <ButtonGroup disableElevation variant="contained" >
                                <Button color="primary" onClick={() => setIsDelete(true)} disabled={addButton.enable}><DeleteIcon />YES</Button>
                                <Button color="secondary" onClick={() => setOpen(false)} disabled={addButton.enable}><NotInterestedIcon />NO</Button>
                            </ButtonGroup>
                        }
                        {addButton.enable && 
                            <Button color="primary" disabled={true}><i className="fa fa-spinner fa-spin"></i>Deleting...</Button>
                        }
                    </Paper>
                </Fade>
            </Modal>
        </>
    )
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

function AddNewDevice(props){
    const classes = useStyles();
    let history = useHistory();
    const dispatch = useDispatch();
    const userInfo = useSelector((state) => state.UserLoginStatus);
    const [newDeviceID,setNewDeviceID] = useState({value:'',error:''})
    const [addButton,setAddButton] = useState({status:false,enable:false})
    const [returnMessage, setReturnMessage] = useState({status:false,severity:'',msg:''})
    const [deviceAddStep,setDeviceAddStep] = useState(0)
    const devicePropsReset = useMemo(() => defaultDeviceInfo(), []);
    const deviceMetadata = useMemo(() => defaultDeviceMeta(), []);
    const [newDeviceProps,setNewDeviceProps] = useState({...devicePropsReset})
    const [newDeviceMetadata,setNewDeviceMetadata] = useState({...deviceMetadata})
    const [isAddNewHive,setIsAddNewHive] = useState(false)
    const [isCheckAvailability,setIsCheckAvailability] = useState(false)

    useEffect(() => {
        if(isAddNewHive){
            setIsAddNewHive(false);
            const AddNewHive = async() => {
                if(newDeviceID.value ){
                    setAddButton({status:true,enable:false})
                    let responseStatus;
                    let responseData;
                    let apiEndPoint = API_URL+"devices";
                    
                    const requestOptions = {
                        method: "POST",   
                        headers: { 
                            'Content-Type': 'application/json',
                            'Authorization':'bearer '+userInfo.userToken
                        },
                        body: JSON.stringify({ 
                            deviceId:  newDeviceID.value,
                            deviceInfo:newDeviceProps,
                            metadata:newDeviceMetadata
                        }) 
                    };
                    await fetch(apiEndPoint, requestOptions)
                        .then((response) => {
                            const data = response.json();
                            responseStatus = response.status;
                            return data   ;
                        })
                        .then((data) => {
                            responseData = data  
                        });
                    if(responseStatus === 200){
                        setReturnMessage({status:true,severity:"success",msg:responseData.content})
                        props.onClick()
                        setNewDeviceID({value:'',error:''})
                        setNewDeviceProps({...devicePropsReset})
                        setNewDeviceMetadata({...deviceMetadata})
                        setDeviceAddStep(0)
                        setAddButton({status:false,enable:false})
                    }else if (responseStatus === 403 && responseData.error === "Token is expired") {
                        let res = await RefreshToken(userInfo)
                        if(res.responseStatus === 200){
                            dispatch(changeLoginStatus(res.responseData.content));   
                            setIsAddNewHive(true)
                        }else{
                            dispatch(changeLoginStatus(""));  
                            setTimeout(() => {history.push('/login')}, 100)
                        } 
                    }else if (responseStatus === 400){
                        setReturnMessage({status:true,severity:"warning",msg:responseData.Error})
                        setAddButton({status:false,enable:true})
                    }else{
                        setReturnMessage({status:true,severity:"warning",msg:"Something went wrong!"})
                        setAddButton({status:false,enable:true})
                    }    
                }
            }
            AddNewHive();
        }
    },[isAddNewHive,deviceMetadata, devicePropsReset, dispatch, history, newDeviceID.value, newDeviceMetadata, newDeviceProps, props,userInfo])
    
    useEffect(() => {
        if(isCheckAvailability){
            setIsCheckAvailability(false);
            const CheckAvailabilityOfDeviceID = async() => {
                if(newDeviceID.value){
                    setAddButton({status:true,enable:false})
                    let responseStatus;
                    let responseData;
                    let apiEndPoint = API_URL+"devices/"+newDeviceID.value;
                    
                    const requestOptions = {
                        method: "GET",
                        headers: { 
                            'Content-Type': 'application/json',
                            'Authorization':'bearer '+userInfo.userToken
                        },    
                    };
        
                    await fetch(apiEndPoint, requestOptions)
                        .then((response) => {
                            let data; 
                            if (response !== ""){
                                data = response.json();
                            }
                            responseStatus = response.status;
                            return data   ;
                        })
                        .then((data) => {
                            responseData = data
                        });
        
                    if(responseStatus === 404){
                        setDeviceAddStep(deviceAddStep+1)
                        setAddButton({status:false,enable:true})
                    }else if (responseStatus === 200){
                        setReturnMessage({status:true,severity:"warning",msg:"Please select an another DeviceID"})
                        setAddButton({status:false,enable:true})
                    }else if (responseStatus === 403 && responseData.error === "Token is expired") {
                        let res = await RefreshToken(userInfo)
                        if(res.responseStatus === 200){
                            dispatch(changeLoginStatus(res.responseData.content));   
                            setIsCheckAvailability(true)
                        }else{
                            dispatch(changeLoginStatus(""));  
                            setTimeout(() => {history.push('/login')}, 100)
                        }
                    }else{
                        setReturnMessage({status:true,severity:"warning",msg:"Something went wrong!"})
                        setAddButton({status:false,enable:true})
                    }
                    
                }
            }
            CheckAvailabilityOfDeviceID();
        }
    },[isCheckAvailability,deviceAddStep, dispatch, history, newDeviceID.value, userInfo])

    const handleDeviceIDInputBox = (e) => {
        if(addButton.status){
            return
        }
        setReturnMessage({severity:"",msg:"",status:false})
        if(e.target.id === 'deviceID'){
            let deviceID = newDeviceID
            let buttonProps = addButton
            deviceID.value = e.target.value
            deviceID.error = ""
            buttonProps.enable = true
            if(e.target.value === ''){
                deviceID.error = "*Enter a valid device id*"
                buttonProps.enable = false
            }
            setAddButton(buttonProps)
            setNewDeviceID(deviceID)
        }
    }

    const handleInformationInputBox = (e) => {
        let propsValue = newDeviceProps
        switch(e.target.id){
            case "serialNumber":
                propsValue.serialNumber =  e.target.value;
                break;
            case "description":
                propsValue.description =  e.target.value;
                break;
            case "descriptiveLocation":
                propsValue.descriptiveLocation =  e.target.value;
                break;
            case "deviceClass":
                propsValue.deviceClass =  e.target.value;
                break;
            case "firmwareVersion":
                propsValue.firmwareVersion =  e.target.value;
                break;
            case "hardwareVersion":
                propsValue.hardwareVersion =  e.target.value;
                break;
            case "manufacturer":
                propsValue.manufacturer =  e.target.value;   
                break;     
            case "model":
                propsValue.model =  e.target.value;    
                break;
            default :
                break;         
        }
        setNewDeviceProps({...propsValue})
    }

    const handleMetadataInputBox = (e) => {
        if(addButton.status){
            return
        }
        setReturnMessage({severity:"",msg:"",status:false})
        
        let metadate = newDeviceMetadata
        switch(e.target.id){
            case "minimumTemperature":
                if(e.target.value < metadate.maximumTemperature && e.target.value >= 0 && e.target.value < 100){
                    metadate.minimumTemperature =  Number(e.target.value);
                }
                break;
            case "maximumTemperature":
                if(e.target.value > metadate.minimumTemperature && e.target.value >= 1 && e.target.value <= 100){
                    metadate.maximumTemperature =  Number(e.target.value);
                }    
                break;
            case "minimumHumidity":
                if(e.target.value < metadate.maximumHumidity && e.target.value >= 0 && e.target.value < 100){
                    metadate.minimumHumidity =  Number(e.target.value);
                }   
                break;
            case "maximumHumidity":
                if(e.target.value > metadate.minimumHumidity && e.target.value >= 1 && e.target.value <= 100){
                    metadate.maximumHumidity =  Number(e.target.value);
                }      
                break;
            case "minimumWeight":
                if(e.target.value < metadate.maximumWeight && e.target.value >= 0){
                    metadate.minimumWeight =  Number(e.target.value);
                } 
                break;
            case "maximumWeight":
                if(e.target.value > metadate.minimumWeight && e.target.value >= 1 ){
                    metadate.maximumWeight =  Number(e.target.value);
                }     
                break;  
            default:
                break;      

        }
        setNewDeviceMetadata(metadate)
    }

    return(
        <Accordion>
            <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
            >
                <Typography className={classes.heading}><b>Add New Device</b></Typography>
            </AccordionSummary>
            <AccordionDetails>
            <Grid container spacing={3}>
                {returnMessage.status && <Grid item xs={12}>
                    <Alert variant="filled"  elevation={6} severity={returnMessage.severity}  onClose={() => setReturnMessage({severity:"",msg:"",status:false})}>{returnMessage.msg}</Alert>
                </Grid>}
                <Grid item xs={12}>
                    <Stepper activeStep={deviceAddStep} alternativeLabel>
                        <Step>
                            <StepLabel>Check Availability</StepLabel>
                        </Step>
                        <Step>
                            <StepLabel>Add Device Information</StepLabel>
                        </Step>
                        <Step>
                            <StepLabel>Add Notification Parameters</StepLabel>
                        </Step>
                    </Stepper>
                </Grid>
                {deviceAddStep === 0 &&
                    <>
                        <Grid item xs={6}>
                            <TextField className={classes.inputBox} id="deviceID" label="DeviceID*" variant="outlined" value={newDeviceID.value} onChange={(e) => handleDeviceIDInputBox(e)} />
                            <FormHelperText className={classes.filedError}>{newDeviceID.error}</FormHelperText>
                        </Grid>
                        <Grid item xs={12}>
                            <Button style={{float:'right'}} color="primary" variant="contained" onClick={() => setIsCheckAvailability(true)} disabled={!addButton.enable}>{addButton.status?<><i className="fa fa-spinner fa-spin"></i> Checking...</>:<>Next</>}</Button>
                        </Grid>
                    </>
                }
                {deviceAddStep === 1 &&
                    <>
                        <Grid item xs={6}>
                            <TextField className={classes.inputBox} id="serialNumber" label="Serial Number" variant="outlined" value={newDeviceProps.serialNumber} onChange={(e) => handleInformationInputBox(e)} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField className={classes.inputBox} id="manufacturer" label="Manufacturer" variant="outlined" value={newDeviceProps.manufacturer} onChange={(e) => handleInformationInputBox(e)} />
                        </Grid>

                        <Grid item xs={6}>
                            <TextField className={classes.inputBox} id="model" label="Model" variant="outlined" value={newDeviceProps.model} onChange={(e) => handleInformationInputBox(e)} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField className={classes.inputBox} id="deviceClass" label="Device Class" variant="outlined" value={newDeviceProps.deviceClass} onChange={(e) => handleInformationInputBox(e)} />
                        </Grid>
                        
                        <Grid item xs={6}>
                            <TextField className={classes.inputBox} id="description" label="Description" variant="outlined" value={newDeviceProps.description} onChange={(e) => handleInformationInputBox(e)} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField className={classes.inputBox} id="firmwareVersion" label="Firmware Version" variant="outlined" value={newDeviceProps.firmwareVersion} onChange={(e) => handleInformationInputBox(e)} />
                        </Grid>

                        <Grid item xs={6}>
                            <TextField className={classes.inputBox} id="hardwareVersion" label="Hardware Version" variant="outlined" value={newDeviceProps.hardwareVersion} onChange={(e) => handleInformationInputBox(e)} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField className={classes.inputBox} id="descriptiveLocation" label="Descriptive Location" variant="outlined" value={newDeviceProps.descriptiveLocation} onChange={(e) => handleInformationInputBox(e)} />
                        </Grid>

                        
                        
                        <Grid item xs={12}>
                            <Button style={{float:'left'}} color="primary" variant="outlined" onClick={() => setDeviceAddStep(deviceAddStep-1)}>Back</Button>
                            <Button style={{float:'right'}} color="primary" variant="contained" onClick={() => setDeviceAddStep(deviceAddStep+1)} disabled={!addButton.enable}>{addButton.status?<><i className="fa fa-spinner fa-spin"></i> Checking...</>:<>Next</>}</Button>
                        </Grid>
                    </>
                }
                {deviceAddStep === 2 &&
                    <>
                        <Grid item xs={12}>
                            <Typography>Set the values for Notification</Typography>
                        </Grid>
                        
                        <Grid item xs={6}>
                            <TextField type="number" className={classes.inputBox} id="minimumTemperature" label="Minimum Temperature(°C)" variant="outlined" value={newDeviceMetadata.minimumTemperature} onChange={(e) => handleMetadataInputBox(e)} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField type="number" className={classes.inputBox} id="maximumTemperature" label="Maximum Temperature(°C)" variant="outlined" value={newDeviceMetadata.maximumTemperature} onChange={(e) => handleMetadataInputBox(e)} />
                        </Grid>

                        <Grid item xs={6}>
                            <TextField type="number" className={classes.inputBox} id="minimumHumidity" label="Minimum Humidity(%)" variant="outlined" value={newDeviceMetadata.minimumHumidity} onChange={(e) => handleMetadataInputBox(e)} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField type="number" className={classes.inputBox} id="maximumHumidity" label="Maximum Humidity(%)" variant="outlined" value={newDeviceMetadata.maximumHumidity} onChange={(e) => handleMetadataInputBox(e)} />
                        </Grid>

                        <Grid item xs={6}>
                            <TextField type="number" className={classes.inputBox} id="minimumWeight" label="Minimum Weight(Kg)" variant="outlined" value={newDeviceMetadata.minimumWeight} onChange={(e) => handleMetadataInputBox(e)} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField type="number" className={classes.inputBox} id="maximumWeight" label="Maximum Weight(Kg)" variant="outlined" value={newDeviceMetadata.maximumWeight} onChange={(e) => handleMetadataInputBox(e)} />
                        </Grid>
                        

                        <Grid item xs={12}>
                            <Button style={{float:'left'}} color="primary" variant="outlined" onClick={() => setDeviceAddStep(deviceAddStep-1)}disabled={!addButton.enable}>Back</Button>
                            <Button style={{float:'right'}} color="primary" variant="contained" disabled={!addButton.enable} onClick={() => setIsAddNewHive(true)}>{addButton.status?<><i className="fa fa-spinner fa-spin"></i> Creating...</>:<>Done</>}</Button>
                        </Grid>
                    </>
                }

                
            </Grid>    
            
            </AccordionDetails>
        </Accordion>
    );
}

function defaultDeviceInfo(){
    return {serialNumber:"",manufacturer:"",model:"",deviceClass:"",description:"",firmwareVersion:"",hardwareVersion:"",descriptiveLocation:""};
}

function defaultDeviceMeta(){
    return {minimumTemperature:30,maximumTemperature:40,minimumHumidity:40,maximumHumidity:70,minimumWeight:50,maximumWeight:200};
}

function EditDeviceInformation(props){
    const classes = useStyles();
    let history = useHistory();
    const dispatch = useDispatch();
    const userInfo = useSelector((state) => state.UserLoginStatus);
    const [addButton,setAddButton] = useState({status:false,enable:true})
    const [returnMessage, setReturnMessage] = useState({status:false,severity:'',msg:''})
    const [deviceAddStep,setDeviceAddStep] = useState(0)
    const [isEditable,setIsEditable] = useState(false)
    const devicePropsReset = {
        serialNumber:props.deviceInfo.deviceInfo.serialNumber,
        manufacturer:props.deviceInfo.deviceInfo.manufacturer,
        model:props.deviceInfo.deviceInfo.model,
        deviceClass:props.deviceInfo.deviceInfo.deviceClass,
        description:props.deviceInfo.deviceInfo.description,
        firmwareVersion:props.deviceInfo.deviceInfo.firmwareVersion,
        hardwareVersion:props.deviceInfo.deviceInfo.hardwareVersion,
        descriptiveLocation:props.deviceInfo.deviceInfo.descriptiveLocation
    }
    const deviceMetadata = {
        minimumTemperature:Number(props.deviceInfo.metadata.minimumTemperature),
        maximumTemperature:Number(props.deviceInfo.metadata.maximumTemperature),
        minimumHumidity:Number(props.deviceInfo.metadata.minimumHumidity),
        maximumHumidity:Number(props.deviceInfo.metadata.maximumHumidity),
        minimumWeight:Number(props.deviceInfo.metadata.minimumWeight),
        maximumWeight:Number(props.deviceInfo.metadata.maximumWeight)
    }
    const [newDeviceProps,setNewDeviceProps] = useState({...devicePropsReset})
    const [newDeviceMetadata,setNewDeviceMetadata] = useState({...deviceMetadata})
    const [isSaveInfo,setIsSaveInfo] = useState(false)

    

    useEffect(() => {
        if(isSaveInfo){
            setIsSaveInfo(false);
            const SaveDeviceInfo = async() => {
                setAddButton({status:true,enable:false})
                let responseStatus;
                let responseData;
                let apiEndPoint = API_URL+'devices/'+props.deviceInfo.deviceId;
                
                const requestOptions = {
                    method: "PUT",   
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization':'bearer '+userInfo.userToken
                    },
                    body: JSON.stringify({ 
                        deviceInfo:newDeviceProps,
                        metadata:newDeviceMetadata
                    }) 
                };
                await fetch(apiEndPoint, requestOptions)
                    .then((response) => {
                        const data = response.json();
                        responseStatus = response.status;
                        return data   ;
                    })
                    .then((data) => {
                        responseData = data
                    });
        
                if(responseStatus === 200){
                    setReturnMessage({status:true,severity:"success",msg:responseData.content})
                    setDeviceAddStep(0)
                    setIsEditable(false)
                    setAddButton({status:false,enable:true})
                }else if (responseStatus === 403 && responseData.error === "Token is expired") {
                    let res = await RefreshToken(userInfo)
                    if(res.responseStatus === 200){
                        dispatch(changeLoginStatus(res.responseData.content));   
                        setIsSaveInfo(true)
                    }else{
                        dispatch(changeLoginStatus(""));  
                        setTimeout(() => {history.push('/login')}, 100)
                    }
                }else if (responseStatus === 400){
                    setReturnMessage({status:true,severity:"warning",msg:responseData.error})
                    setAddButton({status:false,enable:true})
                }else{
                    setReturnMessage({status:true,severity:"warning",msg:"Something went wrong!"})
                    setAddButton({status:false,enable:true})
                }
            }
            SaveDeviceInfo();
        }
    },[isSaveInfo,dispatch, history, newDeviceMetadata, newDeviceProps, props.deviceInfo.deviceId,userInfo])

    const handleInformationInputBox = (e) => {
        let propsValue = newDeviceProps
        switch(e.target.id){
            case "serialNumber":
                propsValue.serialNumber =  e.target.value;
                break;
            case "description":
                propsValue.description =  e.target.value;
                break;
            case "descriptiveLocation":
                propsValue.descriptiveLocation =  e.target.value;
                break;
            case "deviceClass":
                propsValue.deviceClass =  e.target.value;
                break;
            case "firmwareVersion":
                propsValue.firmwareVersion =  e.target.value;
                break;
            case "hardwareVersion":
                propsValue.hardwareVersion =  e.target.value;
                break;
            case "manufacturer":
                propsValue.manufacturer =  e.target.value;   
                break;     
            case "model":
                propsValue.model =  e.target.value;    
                break; 
            default :
                break;    
        }
        setNewDeviceProps({...propsValue})
    }

    const handleMetadataInputBox = (e) => {
        if(addButton.status){
            return
        }
        setReturnMessage({severity:"",msg:"",status:false})
        
        let metadate = newDeviceMetadata
        switch(e.target.id){
            case "minimumTemperature":
                if(e.target.value < metadate.maximumTemperature && e.target.value >= 0 && e.target.value < 100){
                    metadate.minimumTemperature =  Number(e.target.value);
                }
                break;
            case "maximumTemperature":
                if(e.target.value > metadate.minimumTemperature && e.target.value >= 1 && e.target.value <= 100){
                    metadate.maximumTemperature =  Number(e.target.value);
                }    
                break;
            case "minimumHumidity":
                if(e.target.value < metadate.maximumHumidity && e.target.value >= 0 && e.target.value < 100){
                    metadate.minimumHumidity =  Number(e.target.value);
                }   
                break;
            case "maximumHumidity":
                if(e.target.value > metadate.minimumHumidity && e.target.value >= 1 && e.target.value <= 100){
                    metadate.maximumHumidity =  Number(e.target.value);
                }      
                break;
            case "minimumWeight":
                if(e.target.value < metadate.maximumWeight && e.target.value >= 0){
                    metadate.minimumWeight =  Number(e.target.value);
                } 
                break;
            case "maximumWeight":
                if(e.target.value > metadate.minimumWeight && e.target.value >= 1 ){
                    metadate.maximumWeight =  Number(e.target.value);
                }     
                break;    
            default:
                break;    
        }
        setNewDeviceMetadata(metadate)
    }

    return(
        <Grid container spacing={3} className={classes.editDeviceInfoBox}>
            {returnMessage.status && <Grid item xs={12}>
                <Alert variant="filled"  elevation={6} severity={returnMessage.severity}  onClose={() => setReturnMessage({severity:"",msg:"",status:false})}>{returnMessage.msg}</Alert>
            </Grid>}
            <Grid item xs={12}>
                {isEditable ?
                <Stepper activeStep={deviceAddStep} alternativeLabel>
                    <Step>
                        <StepLabel>Update Device Information</StepLabel>
                    </Step>
                    <Step>
                        <StepLabel>Update Notification Parameters</StepLabel>
                    </Step>
                </Stepper>
                :
                <>
                    {deviceAddStep===0 && <Typography style={{textAlign:'center'}}>Device Information</Typography>}
                    {deviceAddStep===1 && <Typography style={{textAlign:'center'}}>Notification Parameters</Typography>}
                    <Divider light />
                </>    
                }   
            </Grid>
            {deviceAddStep === 0 &&
                <>
                    <Grid item xs={6}>
                        <TextField className={classes.inputBox} id="serialNumber" label="Serial Number" variant="outlined" value={newDeviceProps.serialNumber} onChange={(e) => handleInformationInputBox(e)} disabled={!isEditable} />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField className={classes.inputBox} id="manufacturer" label="Manufacturer" variant="outlined" value={newDeviceProps.manufacturer} onChange={(e) => handleInformationInputBox(e)} disabled={!isEditable}/>
                    </Grid>

                    <Grid item xs={6}>
                        <TextField className={classes.inputBox} id="model" label="Model" variant="outlined" value={newDeviceProps.model} onChange={(e) => handleInformationInputBox(e)} disabled={!isEditable}/>
                    </Grid>
                    <Grid item xs={6}>
                        <TextField className={classes.inputBox} id="deviceClass" label="Device Class" variant="outlined" value={newDeviceProps.deviceClass} onChange={(e) => handleInformationInputBox(e)} disabled={!isEditable}/>
                    </Grid>
                    
                    <Grid item xs={6}>
                        <TextField className={classes.inputBox} id="description" label="Description" variant="outlined" value={newDeviceProps.description} onChange={(e) => handleInformationInputBox(e)} disabled={!isEditable}/>
                    </Grid>
                    <Grid item xs={6}>
                        <TextField className={classes.inputBox} id="firmwareVersion" label="Firmware Version" variant="outlined" value={newDeviceProps.firmwareVersion} onChange={(e) => handleInformationInputBox(e)} disabled={!isEditable}/>
                    </Grid>

                    <Grid item xs={6}>
                        <TextField className={classes.inputBox} id="hardwareVersion" label="Hardware Version" variant="outlined" value={newDeviceProps.hardwareVersion} onChange={(e) => handleInformationInputBox(e)} disabled={!isEditable}/>
                    </Grid>
                    <Grid item xs={6}>
                        <TextField className={classes.inputBox} id="descriptiveLocation" label="Descriptive Location" variant="outlined" value={newDeviceProps.descriptiveLocation} onChange={(e) => handleInformationInputBox(e)} disabled={!isEditable}/>
                    </Grid>

                    <Grid item xs={12}>
                        <Button  color="primary" className={classes.bottomButton} variant="contained" onClick={() => setDeviceAddStep(deviceAddStep+1)} disabled={!addButton.enable}>Next</Button>
                        {!isEditable && <Button className={classes.bottomButton} color="primary" variant="contained" onClick={() => setIsEditable(!isEditable)}>Edit</Button>}
                        {isEditable && <Button className={classes.bottomButton} color="primary" variant="contained" onClick={() => setIsEditable(!isEditable)}>Cancel</Button>}
                    </Grid>
                </>
            }
            {deviceAddStep === 1 &&
                <>
                    <Grid item xs={6}>
                        <TextField type="number" className={classes.inputBox} id="minimumTemperature" label="Minimum Temperature(°C)" variant="outlined" value={newDeviceMetadata.minimumTemperature} onChange={(e) => handleMetadataInputBox(e)} disabled={!isEditable} />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField type="number" className={classes.inputBox} id="maximumTemperature" label="Maximum Temperature(°C)" variant="outlined" value={newDeviceMetadata.maximumTemperature} onChange={(e) => handleMetadataInputBox(e)} disabled={!isEditable}/>
                    </Grid>

                    <Grid item xs={6}>
                        <TextField type="number" className={classes.inputBox} id="minimumHumidity" label="Minimum Humidity(%)" variant="outlined" value={newDeviceMetadata.minimumHumidity} onChange={(e) => handleMetadataInputBox(e)} disabled={!isEditable}/>
                    </Grid>
                    <Grid item xs={6}>
                        <TextField type="number" className={classes.inputBox} id="maximumHumidity" label="Maximum Humidity(%)" variant="outlined" value={newDeviceMetadata.maximumHumidity} onChange={(e) => handleMetadataInputBox(e)} disabled={!isEditable}/>
                    </Grid>

                    <Grid item xs={6}>
                        <TextField type="number" className={classes.inputBox} id="minimumWeight" label="Minimum Weight(Kg)" variant="outlined" value={newDeviceMetadata.minimumWeight} onChange={(e) => handleMetadataInputBox(e)} disabled={!isEditable}/>
                    </Grid>
                    <Grid item xs={6}>
                        <TextField type="number" className={classes.inputBox} id="maximumWeight" label="Maximum Weight(Kg)" variant="outlined" value={newDeviceMetadata.maximumWeight} onChange={(e) => handleMetadataInputBox(e)} disabled={!isEditable}/>
                    </Grid>
                    

                    <Grid item xs={12}>
                        <Button style={{float:'left'}} color="primary" variant="outlined" onClick={() => setDeviceAddStep(deviceAddStep-1)}disabled={!addButton.enable}>Back</Button>
                        {isEditable && <Button className={classes.bottomButton} color="primary" variant="contained" disabled={!addButton.enable} onClick={() => setIsSaveInfo(true)}>{addButton.status?<><i className="fa fa-spinner fa-spin"></i> Saving...</>:<>Save</>}</Button>}
                        {!isEditable && <Button className={classes.bottomButton} color="primary" variant="contained" onClick={() => setIsEditable(!isEditable)}>Edit</Button>}
                        {isEditable && <Button className={classes.bottomButton} color="primary" variant="contained" onClick={() => setIsEditable(!isEditable)}>Cancel</Button>}
                    </Grid>
                </>
            }

            
        </Grid>    
    );
}

export default MyDevices;