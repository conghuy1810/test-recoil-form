/* eslint-disable react/jsx-closing-bracket-location */
/* eslint-disable react/jsx-filename-extension */
import React from 'react';
import { Helmet } from 'react-helmet';

import RouterApp from 'containers/router';
import classes from './styles.module.scss';



const App = props => {
  return (
    <div className={classes.containAll}>
      <Helmet
        titleTemplate="%s - BNPL Admin | VPBank"
        defaultTitle="BNPL Admin | VPBank"
      >
        <meta
          name="description"
          content="BNPL Admin | VPBank"
        />
      </Helmet>
      <RouterApp />
    </div>
  );
};

export default App;
