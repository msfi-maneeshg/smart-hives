import { React, useState } from 'react';
import {API_URL} from '../constant'
import { makeStyles } from '@material-ui/core/styles';
import {
    Typography,Container,Paper, Grid, InputAdornment,
    FormHelperText, IconButton,
    TextField,Button
} from '@material-ui/core';
import {Alert} from '@material-ui/lab';
import {useSelector,useDispatch} from 'react-redux'
import {changeLoginStatus} from '../Reducers';
import { useHistory } from "react-router-dom";
import {RefreshToken} from "../common"
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';

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
    mainContainer:{
        padding: theme.spacing(0,0,0,0)
    },
    justifyContent:{
        justifyContent:"center"
    },
    filedError:{
        color:'red'
    },
    registerButton:{
        width:'50%',
        backgroundColor:'#f08200',
        '&:hover':{
            backgroundColor:'#ffac49',
        }
    },
    farmerIDBox:{
        width:'50%'
    },
}));

export function MyProfile(){
    const classes = useStyles();
    const dispatch = useDispatch();
    const userInfo = useSelector((state) => state.UserLoginStatus);
    let history = useHistory();
    const passwordPattern = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,32})");

    const [password,setPassword] = useState({value:"",error:""})
    const [passwordRepeat,setPasswordRepeat] = useState({value:"",error:""})
    const [showPassword,setShowPassword] = useState(false)
    const [buttonStatus,setButtonStatus] = useState(false)
    const [notification,setNotification] = useState({severity:"",msg:"",status:false})

    const handleInputValues = (e) => {
        switch(e.target.id){
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
            default:
                break;             
        }
    }

    const updateUserPassword = async() => {
        let isValid = true
        let passwordProps = password
        let passwordRepeatProps = passwordRepeat
        
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

        setPassword({...passwordProps})
        setPasswordRepeat({...passwordRepeatProps})
            
        if(isValid){
            setButtonStatus(true)
            let responseStatus;
            let responseData;
            let apiEndPoint = API_URL+'update-password';
            
            const requestOptions = {
                method: "PUT",
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization':'bearer '+userInfo.userToken
                },
                body: JSON.stringify({ 
                    password:password.value
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
                setNotification({severity:"success",msg:responseData.content,status:true})
                setButtonStatus(false)
            }else if (responseStatus === 403 && responseData.error === "Token is expired") {
                let res = await RefreshToken(userInfo)
                if(res.responseStatus === 200){
                    dispatch(changeLoginStatus(res.responseData.content));   
                    updateUserPassword()
                }else{
                    dispatch(changeLoginStatus(""));  
                    setTimeout(() => {history.push('/login')}, 100)
                }
            }else{
                setNotification({severity:"warning",msg:responseData.error,status:true})
                setButtonStatus(false)
            }    
        }
    }

    return(
        <Container className={classes.mainContainer}>
            <div className={classes.root}>
                <Paper className={classes.paper}>
                    <Grid container spacing={3}>
                        <Grid item xs={2}>
                            <Typography variant="h5" gutterBottom>Username</Typography>
                        </Grid>
                        <Grid item xs={1}>
                            <Typography variant="h5" gutterBottom>:</Typography>
                        </Grid>
                        <Grid item xs={9}>
                            <Typography variant="h6" >{userInfo.username}</Typography>
                        </Grid>

                        <Grid item xs={2}>
                            <Typography variant="h5" gutterBottom>Email</Typography>
                        </Grid>
                        <Grid item xs={1}>
                            <Typography variant="h5" gutterBottom>:</Typography>
                        </Grid>
                        <Grid item xs={9}>
                            <Typography variant="h6" >{userInfo.email}</Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <hr/>
                            <Typography variant="h5" >Change Password:</Typography>
                            {notification.status && <Alert severity={notification.severity}  onClose={() => setNotification({severity:"",msg:"",status:false})}>{notification.msg}</Alert>}
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
                            <FormHelperText className={classes.filedError}>{passwordRepeat.error}</FormHelperText>
                        </Grid>
                        <Grid item xs={12}>
                            <Button variant="contained" className={classes.registerButton} onClick={() => updateUserPassword()} disabled={buttonStatus}>{buttonStatus?<><i className="fa fa-spinner fa-spin"></i> Updating...</>:"Update"}</Button>
                        </Grid>
                                
                    </Grid>
                </Paper>
            </div>
        </Container>
    );
} 

