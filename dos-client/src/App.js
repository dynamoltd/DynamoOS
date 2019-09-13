import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import './globals/styles/main.scss';

// Pages
import home from './pages/home';
import login from './pages/login';
import signup from './pages/signup';

// Components
import { Navbar } from './components';

function App() {
  return (
    <div className='App'>
      <Router>
        <Navbar>
          <Switch>
            <Route exact path='/' component={home} />
            <Route exact path='/login' component={login} />
            <Route exact path='/signup' component={signup} />
          </Switch>
        </Navbar>
      </Router>
    </div>
  );
}

export default App;
