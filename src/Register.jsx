import {useState} from 'react'
import { makeStyles } from '@material-ui/core/styles';
import {
    CssBaseline, Typography, Container,
    Paper, Grid, TextField, Button, Link, LinearProgress 
} from '@material-ui/core';
import {Alert} from '@material-ui/lab';

const useStyles = makeStyles((theme) => ({
    wallImage: {
        backgroundImage: `url('./honey-wall.png')`,
        backgroundSize: 'contain',
        height:'10vh',
        width:'100%'
    },
    registerBox:{
        backgroundColor: 'rgb(253 218 36)',
        height: '50vh',
        marginTop:'5vh'
    },
    heading:{
        textAlign:'center'
    },
    innerBox:{
        width:'50%'
    },
    outerBox:{
        justifyContent:'center',
        display:'flex'
    },
    farmerIDBox:{
        width:'100%'
    },
    registerButton:{
        width:'100%',
        backgroundColor:'#f08200',
        '&:hover':{
            backgroundColor:'#ffac49',
        }
    }
}));

export function Register(){
    const classes = useStyles();
    const [farmerID,setFarmerID] = useState({value:"",error:""})
    const [registerStatus,setRegisterStatus] = useState(false);
    const [registerButtonStatus,setRegisterButtonStatus] = useState(false)
    const [registerNotification,setRegisterNotification] = useState({severity:"",msg:"",status:false})

    const handleFarmerID = (e) => {
        if(e.target.value === ""){
            setFarmerID({value:"",error:"Please enter farmerID"})
        }else{
            setFarmerID({value:e.target.value,error:""})
        }
    }

    const CreateFarmerID = () => {
        if(farmerID.value){
            setRegisterButtonStatus(true)
            let responseStatus;
            let apiEndPoint = 'http://localhost:8000/iot/create-device-type/'+farmerID.value;
            
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
                    console.log(data)
                    if(responseStatus === 200){
                        setRegisterStatus(true)
                        setRegisterNotification({severity:"success",msg:"Register successfull!",status:true})
                    }else{
                        setRegisterNotification({severity:"warning",msg:data.msg,status:true})
                    }
                    setRegisterButtonStatus(false)
                });
        }
    }
    
    return(
        <>
            <div className={classes.wallImage}></div>
            <CssBaseline />
            <Container fixed>
                <Paper  className={classes.registerBox} >
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Typography variant="h3" component="h2" gutterBottom className={classes.heading}>
                                Register To SmartHive
                            </Typography>
                        </Grid>
                        <Grid item xs={12} className={classes.outerBox}>
                            <Grid container spacing={3} className={classes.innerBox}>
                            <Grid item xs={12}>
                                {registerNotification.status && <Alert severity={registerNotification.severity}  onClose={() => setRegisterNotification({severity:"",msg:"",status:false})}>{registerNotification.msg}</Alert>}
                            </Grid>
                                <Grid item xs={12}>
                                    <TextField 
                                        className={classes.farmerIDBox} 
                                        required 
                                        id="farmer-id" 
                                        label="Farmer ID"
                                        onChange={(e) => handleFarmerID(e)}
                                        value={farmerID.value}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                <Button variant="contained" className={classes.registerButton} onClick={CreateFarmerID}>{registerButtonStatus?"Creating...":"Create ID"}</Button>
                                    {registerButtonStatus&&<LinearProgress />}
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="h6" component="h6" gutterBottom className={classes.heading}>OR</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="h6" component="h6" gutterBottom className={classes.heading}>
                                        <Link href="/login"> Click here! If you have already Farmer ID</Link>
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>    
                    
                </Paper >
            </Container>
        </>
    );

}

export default Register;