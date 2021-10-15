import {useState} from 'react'
import { makeStyles } from '@material-ui/core/styles';
import {
    CssBaseline, Typography, Container, FormHelperText,
    Paper, Grid, TextField, Button, LinearProgress,
    InputAdornment, IconButton 
} from '@material-ui/core';
import {Alert} from '@material-ui/lab';
import { useHistory } from "react-router-dom";
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
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
    registerBox:{
        backgroundColor: 'rgb(253 218 36)',
        minHeight: '50vh',
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
    registerButton:{
        width:'100%',
        backgroundColor:'#f08200',
        '&:hover':{
            backgroundColor:'#ffac49',
        }
    },
    registerBack:{
        backgroundImage: "url('register-back.jpg')",
        backgroundSize: 'cover',
        borderRadius:"4px 0px 0px 4px",
        backgroundRepeat: 'no-repeat',
    },
    filedError:{
        color:'red'
    }
}));

export function Register(){
    const emailPattern = new RegExp(`^[a-zA-Z0-9+_.-]+[@]+[a-zA-Z0-9.-]+[.]+[a-zA-Z0-9.-]+$`);
    const passwordPattern = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,32})");
    
    const classes = useStyles();
    let history = useHistory();
    const [username,setUsername] = useState({value:"",error:""})
    const [password,setPassword] = useState({value:"",error:""})
    const [passwordRepeat,setPasswordRepeat] = useState({value:"",error:""})
    const [showPassword,setShowPassword] = useState(false)
    const [emailID,setEmailID] = useState({value:"",error:""})
    const [registerButtonStatus,setRegisterButtonStatus] = useState(false)
    const [registerNotification,setRegisterNotification] = useState({severity:"",msg:"",status:false})

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
                if(e.type === "blur" && !passwordPattern.test(e.target.value)){
                    passwordProps.error = "Password must contains 8-32 character from [a-z],[A-Z],[0-9],[!@#$%^&*]"
                }
                passwordProps.value = e.target.value
                setPassword({...passwordProps})
                break;
            case "passwordRepeat":
                let passwordRepeatProps = passwordRepeat
                passwordRepeatProps.value = e.target.value
                passwordRepeatProps.error = ""
                if(e.type === "blur" && e.target.value === ""){
                    passwordRepeatProps.error = "Confirm password can not be empty!"
                }else if (e.type === "blur" && e.target.value !== password.value){
                    passwordRepeatProps.error = "Passwords are not matching!"
                }
                setPasswordRepeat({...passwordRepeatProps})
                break;   
            case "emailID":
                let emailIDProps = emailID
                emailIDProps.error = ""
                if(e.type === "blur" && !emailPattern.test(e.target.value)){
                    emailIDProps.error = "Enter a valid email address"
                }
                emailIDProps.value = e.target.value
                setEmailID({...emailIDProps})
                break;        
        }
    }

    const CreateFarmerID = () => {
        let isValid = true
        let usernameProps = username
        let passwordProps = password
        let passwordRepeatProps = passwordRepeat
        let emailIDProps = emailID
        if(username.value === ""){
            isValid = false
            usernameProps.error = "Username can not be empty!"
        }

        if(!passwordPattern.test(password.value)){
            isValid = false
            passwordProps.error = "Password must contains 8-32 character from [a-z],[A-Z],[0-9],[!@#$%^&*] !"
        }

        if(passwordRepeat.value === ""){
            isValid = false
            passwordRepeatProps.error = "Confirm password can not be empty!"
        }else if(passwordRepeat.value !== password.value){
            isValid = false
            passwordProps.error = "Passwords are not matching!"
        }

        if(emailID.value === ""){
            isValid = false
            emailIDProps.error = "Email address can not be empty!"
        }else if(!emailPattern.test(emailID.value)){
            isValid = false
            emailIDProps.error = "Enter a valid email address!"
        }

        setUsername({...usernameProps})
        setPassword({...passwordProps})
        setPasswordRepeat({...passwordRepeatProps})
        setEmailID({...emailIDProps})
            
        if(isValid){
            setRegisterButtonStatus(true)
            let responseStatus;
            let apiEndPoint = 'http://localhost:8000/register';
            
            const requestOptions = {
                method: "POST",
                body: JSON.stringify({ 
                    username:username.value,
                    email:emailID.value,
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
                    console.log(data)
                    if(responseStatus === 201){
                        setRegisterNotification({severity:"success",msg:"Register successfull!",status:true})
                        setInterval(() => {history.push('/login')}, 1000)
                    }else{
                        setRegisterNotification({severity:"warning",msg:data.error,status:true})
                    }
                    setRegisterButtonStatus(false)
                });
        }
    }
    
    return(
        <div className={classes.bgImage}>
            <div className={classes.wallImage}></div>
            <CssBaseline />
            <Container fixed>
                <Paper  className={classes.registerBox} >
                    <Grid container>
                        <Grid item xs={6} className={classes.registerBack}>
                            
                        </Grid>
                        <Grid item xs={6} className={classes.outerBox}>
                            <Grid container spacing={3} className={classes.innerBox}>
                                <Grid item xs={12}>
                                    <Typography variant="h6" component="h2" gutterBottom className={classes.heading}>
                                        Welcome To SmartHive Family
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    {registerNotification.status && <Alert severity={registerNotification.severity}  onClose={() => setRegisterNotification({severity:"",msg:"",status:false})}>{registerNotification.msg}</Alert>}
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
                                        id="emailID" 
                                        label="Email Address"
                                        onChange={(e) => handleInputValues(e)}
                                        onBlur={(e) => handleInputValues(e)}
                                        value={emailID.value}
                                    />
                                    <FormHelperText className={classes.filedError}>{emailID.error}</FormHelperText>
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
                                    <TextField 
                                        className={classes.farmerIDBox} 
                                        required 
                                        type={showPassword ? 'text' : 'password'}
                                        id="passwordRepeat" 
                                        label="Password Repeat"
                                        onChange={(e) => handleInputValues(e)}
                                        onBlur={(e) => handleInputValues(e)}
                                        value={passwordRepeat.value}
                                    />
                                    <FormHelperText className={classes.filedError}>{passwordRepeat.error}</FormHelperText>
                                </Grid>
                                
                                <Grid item xs={12}>
                                <Button variant="contained" className={classes.registerButton} onClick={CreateFarmerID}>{registerButtonStatus?"Creating...":"Create ID"}</Button>
                                    {registerButtonStatus&&<LinearProgress />}
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography  gutterBottom className={classes.heading}>OR</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography  gutterBottom className={classes.heading}>
                                        <Link to="/login"> Click here! If you already have an account!</Link>
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

export default Register;