import {React, useState, useEffect} from 'react';
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
    Grid, TextField, LinearProgress, FormHelperText 
} from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import NotInterestedIcon from '@material-ui/icons/NotInterested';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import AddBoxIcon from '@material-ui/icons/AddBox';
import {Alert} from '@material-ui/lab';
import {useSelector} from 'react-redux'

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
    }
}));


export function MyDevices() {
    const classes = useStyles();
    const loginStatus = useSelector((state) => state.UserLoginStatus);
    const farmer =loginStatus.userID
    const [isDevicesLoaded,setIsDeviceLoaded] = useState(false)
    const [deviceList,setDeviceList] = useState({status:false,list:[]})

    useEffect(() => {
        if(!isDevicesLoaded){
            let responseStatus;
            setIsDeviceLoaded(true)
            const requestOptions = {
                method: 'GET',
                headers: { 
                    'Content-Type': 'application/json'
                }
            };
            
            let apiUrl = "http://localhost:8000/iot/device-list/"+farmer
        
            fetch(apiUrl, requestOptions)
            .then((response) => {
                responseStatus = response.status;
                return response.json()   
            })
            .then((data) => {
                console.log(data)
                if(responseStatus === 200){
                    setDeviceList({status:true,list:data.results})
                }else{
                    setDeviceList({status:true,list:[]})
                }
            });

        }
    },[isDevicesLoaded])

  return (
    <>
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
                        <DeviceTableRow key={row.deviceId} deviceId={row.deviceId} />
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
    const [open, setOpen] = useState(false);
    return(
        <>
            <TableRow >
                <TableCell component="th" scope="row">
                {props.deviceId}
                </TableCell>
                <TableCell align="right" ><DeleteIcon className={classes.deleteButton} onClick={() => setOpen(true)} /></TableCell>
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
                        <h2 id="transition-modal-title">Are you sure?</h2>
                        <h5>You want to delete {props.deviceId} !</h5>
                        <ButtonGroup disableElevation variant="contained" >
                            <Button color="primary"><DeleteIcon />YES</Button>
                            <Button color="secondary" onClick={() => setOpen(false)}><NotInterestedIcon />NO</Button>
                        </ButtonGroup>
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
    const loginStatus = useSelector((state) => state.UserLoginStatus);
    const farmer =loginStatus.userID
    const [newDeviceID,setNewDeviceID] = useState({value:'',error:''})
    const [addButton,setAddButton] = useState({status:false})
    const [returnMessage, setReturnMessage] = useState({status:false,severity:'',msg:''})

    const AddNewHive = () => {
        if(newDeviceID.value && farmer){
            setAddButton({status:true})
            let responseStatus;
            let apiEndPoint = 'http://localhost:8000/iot/create-device/'+farmer+'/'+newDeviceID.value;
            
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
                        setReturnMessage({status:true,severity:"success",msg:data.msg})
                        props.onClick()
                        setNewDeviceID({value:'',error:''})
                    }else if (responseStatus === 400){
                        setReturnMessage({status:true,severity:"warning",msg:data.msg})
                    }else{
                        setReturnMessage({status:true,severity:"warning",msg:"Something went wrong!"})
                    }
                    setAddButton({status:false})
                });
        }
    }

    const handleInputBox = (e) => {
        setReturnMessage({severity:"",msg:"",status:false})
        if(e.target.id === 'deviceID'){
            let deviceID = newDeviceID
            deviceID.value = e.target.value
            deviceID.error = ""
            if(e.target.value === ''){
                deviceID.error = "Enter a valid device id!"
            }
            setNewDeviceID(deviceID)
        }
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
                <Grid item xs={12}>
                    {returnMessage.status && <Alert variant="filled"  elevation={6} severity={returnMessage.severity}  onClose={() => setReturnMessage({severity:"",msg:"",status:false})}>{returnMessage.msg}</Alert>}
                </Grid>
                <Grid item xs={6}>
                    <TextField className={classes.inputBox} id="deviceID" label="DeviceID" variant="outlined" value={newDeviceID.value} onChange={(e) => handleInputBox(e)} />
                    <FormHelperText className={classes.filedError}>{newDeviceID.error}</FormHelperText>
                </Grid>
                <Grid item xs={6}>
                    {/* <TextField className={classes.inputBox} label="Outlined" variant="outlined" /> */}
                </Grid>
                <Grid item xs={12}>
                    <Button style={{float:'right'}} color="primary" variant="contained" onClick={() => AddNewHive()}>{addButton.status?<><i className="fa fa-spinner fa-spin"></i> Creating</>:<><AddBoxIcon /> Create</>}</Button>
                </Grid>

                
            </Grid>    
            
            </AccordionDetails>
        </Accordion>
    );
}

export default MyDevices;