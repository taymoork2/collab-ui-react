import devicesReduxModuleName from './devicesRedux';
import csdmSearchModuleName from './services';
import devicesBulkModuleName from './bulk';
import configurationModuleName from './configuration';
import alertsModuleName from './alerts';
export default angular
  .module('Csdm', [
    'Squared',
    devicesReduxModuleName,
    csdmSearchModuleName,
    devicesBulkModuleName,
    configurationModuleName,
    alertsModuleName,
  ])
  .name;
