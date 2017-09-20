import { DevicesCtrl } from './devices.controller';
import { DeviceSearchComponent } from './deviceSearch.component';
import { highlightFilter } from './highlightFilter';
import { DeviceListComponent } from './deviceList.component';
import { ChartComponent } from './chart.component';

export default angular
  .module('Csdm.devices', [
    'Csdm.services',
    require('angular-resource'),
  ])
  .component('deviceSearch', new DeviceSearchComponent())
  .component('deviceList', new DeviceListComponent())
  .component('deviceChart', new ChartComponent())
  .filter('highlight', highlightFilter)
  .controller('DevicesReduxCtrl', DevicesCtrl)
  .name;
