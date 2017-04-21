import './deviceSettings.scss';
import { DeviceSettingsComponent } from './deviceSettings.component';

export default angular
  .module('Squared')
  .component('ucDeviceSettings', new DeviceSettingsComponent())
  .name;
