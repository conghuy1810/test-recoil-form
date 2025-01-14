import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import NoMatch from 'containers/404';
import DragDrop from 'containers/DragDrop/Loadable';

import { PATH_ROUTE } from 'utils/constants';

export default function Routers() {
  return (
    <Switch>
      <Route exact path="/" render={() => <Redirect to={PATH_ROUTE.dnd} />} />
      <Route path={PATH_ROUTE.dnd}>
        <DragDrop />
      </Route>
      <Route exact>
        <NoMatch />
      </Route>
    </Switch>
  );
}
