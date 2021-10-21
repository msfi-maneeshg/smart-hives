import './App.css';
import {Login} from './pages/Login'
import {Register} from './pages/Register'
import {Dashboard} from './pages/Dashboard'
import {MyProfile} from './pages/MyProfile'
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
          <Route exact path="/my-profile">
            <Dashboard page="my-profile"/>
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
