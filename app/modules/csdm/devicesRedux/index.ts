import { DevicesCtrl } from './devices.controller';
import { DeviceSearchComponent } from './deviceSearch.component';
import { DevicesReduxDetailsCtrl, TagFactory } from './devicesDetails.controller';
import { DeviceListComponent } from './deviceList.component';
import { highlightFilter } from './highlightFilter';

export default angular
  .module('Csdm.devices', [
    require('scripts/app.templates'),
    require('modules/csdm/services'),
    require('angular-resource'),
  ])
  .factory('TagFactory', TagFactory)
  .component('deviceSearch', new DeviceSearchComponent())
  .component('deviceList', new DeviceListComponent())
  .filter('highlight', highlightFilter)
  .controller('DevicesReduxCtrl', DevicesCtrl)
  .controller('DevicesReduxDetailsCtrl', DevicesReduxDetailsCtrl)
  .name;
