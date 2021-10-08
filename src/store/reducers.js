import {combineReducers} from 'redux'
import {
    checkLoginStatus as UserLoginStatus,
} from '../Reducers'

export const rootReducer = combineReducers({
    UserLoginStatus,
});
export default rootReducer;