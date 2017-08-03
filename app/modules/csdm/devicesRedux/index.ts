import { DevicesCtrl } from './devices.controller';
import { DeviceSearchComponent } from './deviceSearch.component';
import { DevicesReduxDetailsCtrl, TagFactory } from './devicesDetails.controller';
import { highlightFilter } from './highlightFilter';
import { ChartComponent } from './chart.component';
import { DeviceNewListComponent } from './deviceNewList.component';

export default angular
  .module('Csdm.devices', [
    require('scripts/app.templates'),
    require('modules/csdm/services'),
    require('angular-resource'),
  ])
  .factory('TagFactory', TagFactory)
  .component('deviceSearch', new DeviceSearchComponent())
  .component('deviceList', new DeviceNewListComponent())
  .filter('highlight', highlightFilter)
  .controller('DevicesReduxCtrl', DevicesCtrl)
  .controller('DevicesReduxDetailsCtrl', DevicesReduxDetailsCtrl)
  .name;
