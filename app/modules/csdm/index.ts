import devicesReduxModule from './devicesRedux';
import csdmSearchModule from './services';
import devicesBulkModule from './bulk';
import configurationModule from './configuration';
export default angular
  .module('Csdm', [
    'Squared',
    devicesReduxModule,
    csdmSearchModule,
    devicesBulkModule,
    configurationModule,
  ])
  .name;
