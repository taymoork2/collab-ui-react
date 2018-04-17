import devicesReduxModule from './devicesRedux';
import csdmSearchModule from './services';
import devicesBulkModule from './bulk';
export default angular
  .module('Csdm', [
    'Squared',
    devicesReduxModule,
    csdmSearchModule,
    devicesBulkModule,
  ])
  .name;
