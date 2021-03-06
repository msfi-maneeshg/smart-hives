import {API_URL} from './constant'

export const RefreshToken = async(userInfo) => {

    let responseStatus;
    let responseData;
    let apiUrl = API_URL+"refresh-token"
    const requestOptions = {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'refreshToken': userInfo.refreshToken
        }
    };
    
    await fetch(apiUrl, requestOptions)
    .then((response) => {
        responseStatus = response.status;
        return response.json()   
    })
    .then((data) => {
        responseData = data
    });

    return({responseData:responseData,responseStatus:responseStatus});
}