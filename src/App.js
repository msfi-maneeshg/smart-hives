
import './App.css';
import {Login} from './Login'
import {Register} from './Register'
import {Dashboard} from './Dashboard'
import {
  BrowserRouter,
  Switch,
  Route,
  Redirect
} from "react-router-dom";
import {useSelector} from 'react-redux'

export function App() {
  const userInfo = useSelector((state) => state.UserLoginStatus);
  return (
    <>
    <BrowserRouter>
      <Switch>
        <Route exact path="/">
          <Login/>
        </Route>
        <Route exact path="/login">
          <Login/>
        </Route>
        <Route exact path="/register">
          <Register/>
        </Route>
        {userInfo.isLoggedin && 
        <>
          <Route exact path="/hourly-insight">
            <Dashboard page="hourly-insight"/>
          </Route>
          <Route exact path="/realtime-insight">
            <Dashboard page="realtime-insight"/>
          </Route>
          <Route exact path="/my-devices">
            <Dashboard page="my-devices"/>
          </Route>
          <Route exact path="/home">
            <Dashboard page="hourly-insight"/>
          </Route>
          {/* <Redirect from='*' to='/home' /> */}

        </>
        }
        {!userInfo.isLoggedin &&
        <Redirect from='*' to='/login' />
        }
        
      </Switch>
    </BrowserRouter>
    
    </>
  );
}

export default App;
