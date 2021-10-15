import {useState} from 'react'
import { makeStyles } from '@material-ui/core/styles';
import {
    CssBaseline, Typography, Container, Paper, Grid,
    TextField, Button, FormHelperText, LinearProgress
} from '@material-ui/core';
import {Alert} from '@material-ui/lab';
import { useHistory } from "react-router-dom";
import {useDispatch} from 'react-redux';
import {changeLoginStatus} from './Reducers';
import {API_URL} from './constant';
import { Link } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
    bgImage :{
        backgroundImage: "url('https://wallpaperaccess.com/full/1585697.jpg')",
        minHeight: '100vh',
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat',
      },
    wallImage: {
        backgroundImage: `url('./honey-wall.png')`,
        backgroundSize: 'contain',
        height:'10vh',
        width:'100%'
    },
    loginBox:{
        //backgroundColor: 'rgb(253 218 36)',
        backgroundImage: "url('login-back.jpg')",
        backgroundSize: 'contain',
        backgroundRepeat: 'round',
        height: '50vh',
        marginTop:'5vh'
    },
    heading:{
        textAlign:'center'
    },
    innerBox:{
        width:'75%'
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
    const dispatch = useDispatch();
    let history = useHistory();
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
            let apiEndPoint = 'http://localhost:8000/iot/device/types/'+farmerID.value;
            
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
                    if(responseStatus === 200){
                        setLoginStatus(true)
                        setLoginNotification({severity:"success",msg:"Login successfull!",status:true})
                        dispatch(changeLoginStatus(farmerID.value));
                        
                        setTimeout(() => {history.push('/home')}, 1000)
                        
                    }else if(responseStatus === 404){
                        setLoginNotification({severity:"error",msg:"Invalid farmer ID!",status:true})
                    }else{
                        setLoginNotification({severity:"error",msg:"Something went wrong!",status:true})
                    }
                    setLoginButtonStatus(false)
                });
        }
    }

    return(
        <div className={classes.bgImage}>
            <div className={classes.wallImage}></div>
            <CssBaseline />
            <Container fixed>
                <Paper  className={classes.loginBox} >
                    <Grid container spacing={3}>
                        <Grid item xs={6}>
                            
                        </Grid>
                        <Grid item xs={6} className={classes.outerBox}>
                            <Grid container spacing={3} className={classes.innerBox}>
                                <Grid item xs={12}>
                                    <Typography variant="h6" component="h6" gutterBottom className={classes.heading}>
                                        Welcome back
                                    </Typography>
                                </Grid> 
                                <Grid item xs={12}>
                                    {loginNotification.status && <Alert variant="filled"  elevation={6} severity={loginNotification.severity}  onClose={() => setLoginNotification({severity:"",msg:"",status:false})}>{loginNotification.msg}</Alert>}
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField 
                                        className={classes.farmerIDBox} 
                                        required 
                                        id="username" 
                                        label="Username"
                                        onChange={(e) => handleFarmerID(e)}
                                        value={farmerID.value}
                                    />
                                    <FormHelperText className={classes.filedError}>{farmerID.error}</FormHelperText>
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField 
                                        className={classes.farmerIDBox} 
                                        required 
                                        id="password" 
                                        label="Password"
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
                                    <Typography gutterBottom className={classes.heading}>OR</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography gutterBottom className={classes.heading}>
                                        <Link to="/register"> Click here! to Create New Farmer</Link>
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>    
                    
                </Paper >
            </Container>
        </div>
    );

}

export default Login;