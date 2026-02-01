import React from 'react';
import {BrowserRouter as Router, Route, Redirect, Switch} from 'react-router-dom';
import Users from './user/pages/Users';
import NewPlace from './places/pages/NewPlace';
import MainNavigation from './shared/components/Navigation/MainNavigation';
import UserPlaces from './places/pages/UserPlaces';
import UpdatePlace from './places/pages/UpdatePlace';
import Auth from './user/pages/Auth';

const App = () => {
  return (
  <Router> 
    <MainNavigation />
    <main>
      <Switch>                  {/*if the fitting routes are encountered, do not evalate other routes*/}
        <Route path="/" exact>  {/*root will only be rendered if the path is exactly slash */}
          <Users />
        </Route>
        <Route path='/:userId/places'exact>
          <UserPlaces />
        </Route>
        <Route path="/places/new" exact>  {/* */}
          <NewPlace />
        </Route>
        <Route path="/places/:placeId">
          <UpdatePlace />
        </Route>
        <Route path="/auth">
          <Auth />
        </Route>
        <Redirect to="/" />     {/*if the path is sth else redirect to slash*/}
      </Switch>  
    </main>
  </Router>
  );
};

export default App;
