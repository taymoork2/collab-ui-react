import { DeviceListComponent } from './deviceList.component';

export default angular
  .module('Squared')
  .component('ucDeviceList', new DeviceListComponent())
  .name;
