import { DevicesComponent, DevicesCtrl } from './devices.component';
import { DeviceSearchBulletComponent } from './deviceSearchBullet.component';
import { DeviceSearchComponent } from './deviceSearch.component';
import { DeviceListComponent } from './deviceList.component';
import { ChartComponent } from './chart.component';
import { highlightAndTranslate, highlightFilter } from './highlightFilter';
import { DeviceExportService } from 'modules/squared/devices/export/deviceExport.service';
import * as userServiceModuleName from 'modules/core/scripts/services/user.service';
import serviceDescriptorModuleName from 'modules/hercules/services/service-descriptor.service';
import cloudConnectorServiceModuleName from 'modules/hercules/services/calendar-cloud-connector.service';

export default angular
  .module('Csdm.devices', [
    'Csdm.services',
    require('angular-resource'),
    require('angular-translate'),
    require('angular-sanitize'),
    require('modules/core/scripts/services/missing-translation-handler.factory').default,
    require('modules/core/analytics'),
    require('modules/core/scripts/services/accountorgservice'),
    userServiceModuleName,
    serviceDescriptorModuleName,
    cloudConnectorServiceModuleName,
    require('modules/squared/devices/addDeviceNew/Wizard').default,
  ])
  .service('DeviceExportService', DeviceExportService)
  .component('deviceSearchBullet', new DeviceSearchBulletComponent())
  .component('deviceSearch', new DeviceSearchComponent())
  .component('deviceList', new DeviceListComponent())
  .component('deviceChart', new ChartComponent())
  .controller('DevicesReduxCtrl', DevicesCtrl)
  .component('devicesRedux', new DevicesComponent())
  .filter('highlight', highlightFilter)
  .filter('translateHighlight', highlightAndTranslate)
  .name;
