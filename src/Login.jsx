import {useState} from 'react'
import { makeStyles } from '@material-ui/core/styles';
import {
    CssBaseline, Typography, Container, Paper, Grid,
    TextField, Button, Link, FormHelperText,CircularProgress, LinearProgress
} from '@material-ui/core';
import {Alert} from '@material-ui/lab';

const useStyles = makeStyles((theme) => ({
    wallImage: {
        backgroundImage: `url('./honey-wall.png')`,
        backgroundSize: 'contain',
        height:'10vh',
        width:'100%'
    },
    loginBox:{
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
    loginButton:{
        width:'100%',
        backgroundColor:'#f08200',
        '&:hover':{
            backgroundColor:'#ffac49',
        }
    },
    filedError:{
        color:'red'
    }
}));

export function Login(){
    const classes = useStyles();
    const [farmerID,setFarmerID] = useState({value:"",error:""})
    const [loginStatus,setLoginStatus] = useState(false);
    const [loginButtonStatus,setLoginButtonStatus] = useState(false)
    const [loginNotification,setLoginNotification] = useState({severity:"",msg:"",status:false})

    const handleFarmerID = (e) => {
        if(e.target.value === ""){
            setFarmerID({value:"",error:"Please enter farmerID"})
        }else{
            setFarmerID({value:e.target.value,error:""})
        }
    }

    const CheckFarmerID = () => {
        if(farmerID.value){
            setLoginButtonStatus(true)
            let responseStatus;
            let apiEndPoint = 'http://localhost:8000/iot/device-type/'+farmerID.value;
            
            const requestOptions = {
                method: "GET",    
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
                        setLoginStatus(true)
                        setLoginNotification({severity:"success",msg:"Login successfull!",status:true})
                    }else if(responseStatus === 404){
                        setLoginNotification({severity:"warning",msg:"Invalid farmer ID!",status:true})
                    }else{
                        setLoginNotification({severity:"warning",msg:"Something went wrong!",status:true})
                    }
                    setLoginButtonStatus(false)
                });
        }
    }

    return(
        <>
            <div className={classes.wallImage}></div>
            <CssBaseline />
            <Container fixed>
                <Paper  className={classes.loginBox} >
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Typography variant="h3" component="h2" gutterBottom className={classes.heading}>
                                Login To SmartHive
                            </Typography>
                        </Grid>
                        <Grid item xs={12} className={classes.outerBox}>
                            <Grid container spacing={3} className={classes.innerBox}>
                                <Grid item xs={12}>
                                    {loginNotification.status && <Alert severity={loginNotification.severity}  onClose={() => setLoginNotification({severity:"",msg:"",status:false})}>{loginNotification.msg}</Alert>}
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
                                    <FormHelperText className={classes.filedError}>{farmerID.error}</FormHelperText>
                                </Grid>
                                <Grid item xs={12}>
                                    <Button variant="contained" className={classes.loginButton} onClick={CheckFarmerID}>{loginButtonStatus?<>Verifying...</>:"Login"}</Button>
                                    {loginButtonStatus&&<LinearProgress />}
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="h6" component="h6" gutterBottom className={classes.heading}>OR</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="h6" component="h6" gutterBottom className={classes.heading}>
                                        <Link href="/register"> Click here! to Create New Farmer</Link>
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

export default Login;