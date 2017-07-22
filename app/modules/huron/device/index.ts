import { DeviceListComponent } from './deviceList.component';

require('./_hn-devices.scss');

export default angular
  .module('Squared')
  .component('ucDeviceList', new DeviceListComponent())
  .name;
