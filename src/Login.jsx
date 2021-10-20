import {useState} from 'react'
import { makeStyles } from '@material-ui/core/styles';
import {
    CssBaseline, Typography, Container, Paper, Grid,
    TextField, Button, FormHelperText, LinearProgress,
    InputAdornment, IconButton 
} from '@material-ui/core';
import {Alert} from '@material-ui/lab';
import { useHistory } from "react-router-dom";
import {useDispatch} from 'react-redux';
import {changeLoginStatus} from './Reducers';
import {API_URL} from './constant';
import { Link } from "react-router-dom";
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';

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
    const [username,setUsername] = useState({value:"",error:""})
    const [password,setPassword] = useState({value:"",error:""})
    const [showPassword,setShowPassword] = useState(false)
    const [loginButtonStatus,setLoginButtonStatus] = useState(false)
    const [loginNotification,setLoginNotification] = useState({severity:"",msg:"",status:false})

    const handleInputValues = (e) => {
        switch(e.target.id){
            case "username":
                let usernameProps = username
                usernameProps.value = e.target.value
                usernameProps.error = ""
                if(e.type === "blur" && e.target.value === ""){
                    usernameProps.error = "Username can not be empty!"
                }
                setUsername({...usernameProps})
                break;
            case "password":
                let passwordProps = password
                passwordProps.error = ""
                if(e.type === "blur" && e.target.value === ""){
                    passwordProps.error = "Password can not be empty!"
                }
                passwordProps.value = e.target.value
                setPassword({...passwordProps})
                break;     
            default:
                break;     
        }
    }

    const CheckFarmerID = () => {
        let isValid = true
        let usernameProps = username
        let passwordProps = password

        if(username.value === ""){
            isValid = false
            usernameProps.error = "Username can not be empty!"
        }

        if(password.value === ""){
            isValid = false
            passwordProps.error = "Password can not be empty!"
        }

        setUsername({...usernameProps})
        setPassword({...passwordProps})

        if(isValid){
            setLoginButtonStatus(true)
            let responseStatus;
            let apiEndPoint = API_URL+'login'
            
            const requestOptions = {
                method: "POST",
                body: JSON.stringify({ 
                    username:username.value,
                    password:password.value
                })        
            };
            fetch(apiEndPoint, requestOptions)
                .then((response) => {
                    const data = response.json();
                    responseStatus = response.status;
                    return data   ;
                })
                .then((data) => {
                    if(responseStatus === 200){
                        setLoginNotification({severity:"success",msg:"Login successfull!",status:true})
                        dispatch(changeLoginStatus(data.content));
                        
                        setTimeout(() => {history.push('/home')}, 1000)
                        
                    }else if(responseStatus === 404 || responseStatus === 400){
                        setLoginNotification({severity:"error",msg:data.error,status:true})
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
                            <Typography variant="h3" component="h3" gutterBottom className={classes.heading}>
                                SmartHives

                            </Typography>
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
                                        onChange={(e) => handleInputValues(e)}
                                        onBlur={(e) => handleInputValues(e)}
                                        value={username.value}
                                    />
                                    <FormHelperText className={classes.filedError}>{username.error}</FormHelperText>
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField 
                                        className={classes.farmerIDBox} 
                                        required 
                                        type={showPassword ? 'text' : 'password'}
                                        id="password" 
                                        label="Password"
                                        onChange={(e) => handleInputValues(e)}
                                        onBlur={(e) => handleInputValues(e)}
                                        value={password.value}
                                        InputProps={{
                                            endAdornment: <InputAdornment position="end">
                                                <IconButton
                                                    aria-label="toggle password visibility"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    >
                                                    {showPassword ? <Visibility /> : <VisibilityOff />}
                                                </IconButton>
                                            </InputAdornment>,
                                          }}
                                    />
                                    <FormHelperText className={classes.filedError}>{password.error}</FormHelperText>
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
                                        <Link to="/register"> Click here! to Create New Account!</Link>
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