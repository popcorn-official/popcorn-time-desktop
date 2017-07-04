/**
 * Home page component that renders CardList and uses VisibilitySensor
 * @flow
 * @TODO: Use waitForImages plugin to load background images and fade in on load
 */
import { connect } from 'react-redux';
import * as HomeActions from '../actions/homePageActions';
import Home from '../components/home/Home.jsx';

export const mapStateToProps = (state) => ({
  activeMode        : state.homePageReducer.activeMode,
  activeModeOptions : state.homePageReducer.activeModeOptions,
  modes             : state.homePageReducer.modes,
  items             : state.homePageReducer.items,
  isLoading         : state.homePageReducer.isLoading,
  infinitePagination: false
})

export default connect(mapStateToProps, { ...HomeActions })(Home);
