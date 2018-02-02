import { DevicesComponent, DevicesCtrl } from './devices.component';
import { DeviceSearchBulletComponent } from './deviceSearchBullet.component';
import { DeviceSearchComponent } from './deviceSearch.component';
import { DeviceListComponent } from './deviceList.component';
import { ChartComponent } from './chart.component';
import { highlightAndTranslate, highlightFilter } from './highlightFilter';

export default angular
  .module('Csdm.devices', [
    'Csdm.services',
    require('angular-resource'),
    require('angular-translate'),
    require('angular-sanitize'),
    require('modules/core/scripts/services/missing-translation-handler.factory').default,
    require('modules/core/analytics'),
  ])
  .component('deviceSearchBullet', new DeviceSearchBulletComponent())
  .component('deviceSearch', new DeviceSearchComponent())
  .component('deviceList', new DeviceListComponent())
  .component('deviceChart', new ChartComponent())
  .controller('DevicesReduxCtrl', DevicesCtrl)
  .component('devicesRedux', new DevicesComponent())
  .filter('highlight', highlightFilter)
  .filter('translateHighlight', highlightAndTranslate)
  .name;
