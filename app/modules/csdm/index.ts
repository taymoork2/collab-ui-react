import devicesReduxModule from './devicesRedux';
import csdmSearchModule from './services';
export default angular
  .module('Csdm', [
    'Squared',
    devicesReduxModule,
    csdmSearchModule,
  ])
  .name;
