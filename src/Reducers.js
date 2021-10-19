//--------- to manage login status ------------
let loginStaus = {isLoggedin:false,refreshToken:"",userToken:"",username:"",email:""};
let userInfo = JSON.parse(localStorage.getItem('userInfo'));
if(userInfo){
    loginStaus = {isLoggedin:true,refreshToken:userInfo.refereshtoken,userToken:userInfo.usertoken,username:userInfo.username,email:userInfo.email};
    console.log(loginStaus)
}
export const checkLoginStatus = (state=loginStaus,action)=>{
    if(action.type === "loginStatus"){
        return  {isLoggedin:action.payload.isLoggedin,refreshToken:action.payload.refreshToken,userToken:action.payload.userToken,username:action.payload.username,email:action.payload.email};
    }
    return state;
}

export const changeLoginStatus = (userData) => {
    let loginInfo;
    if(userData){
        localStorage.setItem('userInfo',JSON.stringify(userData));
        loginInfo = {isLoggedin:true,refreshToken:userData.refereshtoken,userToken:userData.usertoken,username:userData.username,email:userData.email};
    }else{
        localStorage.removeItem('userInfo');
        loginInfo = {isLoggedin:false,refreshToken:"",userToken:"",username:"",email:""};
    }

    return{
        type:"loginStatus",
        payload:loginInfo
    };
}

