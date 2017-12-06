import { DevicesCtrl } from './devices.controller';
import { DeviceSearchBulletComponent } from './deviceSearchBullet.component';
import { DeviceSearchComponent } from './deviceSearch.component';
import { DeviceListComponent } from './deviceList.component';
import { ChartComponent } from './chart.component';
import { highlightFilter, highlightSearchAndTranslateFilter } from './highlightFilter';

export default angular
  .module('Csdm.devices', [
    'Csdm.services',
    require('angular-resource'),
    require('angular-translate'),
    require('angular-sanitize'),
  ])
  .component('deviceSearchBullet', new DeviceSearchBulletComponent())
  .component('deviceSearch', new DeviceSearchComponent())
  .component('deviceList', new DeviceListComponent())
  .component('deviceChart', new ChartComponent())
  .controller('DevicesReduxCtrl', DevicesCtrl)
  .filter('highlight', highlightFilter)
  .filter('highlightSearchAndTranslate', highlightSearchAndTranslateFilter)
  .name;
