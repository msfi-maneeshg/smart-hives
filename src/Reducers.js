//--------- to manage login status ------------
let loginStaus = {isLoggedin:false,userID:''};

export const checkLoginStatus = (state=loginStaus,action)=>{
    if(action.type === "loginStatus"){
        return  {isLoggedin:action.payload.isLoggedin,userID:action.payload.userID};
    }
    return state;
}

export const changeLoginStatus = (userID) => {
    let loginInfo;
    let isLogin = localStorage.getItem('userInfo');
    if(userID){
        loginInfo = {isLoggedin:true,userID:userID};
    }else{
        loginInfo = {isLoggedin:false,userID:""};
    }

    return{
        type:"loginStatus",
        payload:loginInfo
    };
}