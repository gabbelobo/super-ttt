import React from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from "react-router-dom"
import PrivateRoute from './components/PrivateRoute'
import { ProvideAuth } from './contexts/Auth'
import Login from './pages/Login'
import Main from './pages/Main'
import TicTac from './pages/Tictac'



const App = () => {
  return (
    <ProvideAuth>
      <Router>
        <Switch>
          <Route path="/login">
            <Login />
          </Route>
          <PrivateRoute path="/room/:id">
            <TicTac />
          </PrivateRoute>
          <PrivateRoute path="/room">
            <TicTac newRoom/>
          </PrivateRoute>
          <PrivateRoute path="/" exact>
            <Main />
          </PrivateRoute>
          <Route path="*">
            <Redirect to="/" />
          </Route>
        </Switch>
      </Router>
    </ProvideAuth>
  )
}

export default App
