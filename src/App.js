
import './App.css';
import {Login} from './Login'
import {Register} from './Register'
import {Dashboard} from './Dashboard'
import {Home} from './home2'
import {
  BrowserRouter,
  Switch,
  Route
} from "react-router-dom";

export function App() {
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
        <Route exact path="/hourly-insight">
          <Dashboard page="hourly-insight"/>
        </Route>
        <Route exact path="/realtime-insight">
          <Dashboard page="realtime-insight"/>
        </Route>
        <Route exact path="/home">
          <Home/>
        </Route>
      </Switch>
    </BrowserRouter>
    
    </>
  );
}

export default App;
