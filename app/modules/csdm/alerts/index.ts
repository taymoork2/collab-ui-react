import { DeviceAlertsModalComponent } from './device-alerts-modal.component';
require('./_device-alerts.scss');

export default angular
  .module('Csdm.alerts', [
    'Csdm.services',
    require('angular-translate'),
  ])
  .component('deviceAlertsModal', new DeviceAlertsModalComponent())
  .name;
