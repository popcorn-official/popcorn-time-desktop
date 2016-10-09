/* eslint global-require: 0 */
// @flow
import React, { Component, PropTypes } from 'react';


export default class App extends Component {
  render() {
    const { children } = this.props;

    return (
      <div>
        {children}
        {
          (() => {
            if (process.env.NODE_ENV !== 'production') {
              const DevTools = require('./DevTools');

              return <DevTools />;
            }
            return false;
          })()
        }
      </div>
    );
  }
}

App.propTypes = {
  children: PropTypes.element.isRequired
};
