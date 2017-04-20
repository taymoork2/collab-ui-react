import { SnrComponent } from './snr.component';
import { SnrService } from './snr.service';
import customerServiceModule from 'modules/huron/customer';
import notifications from 'modules/core/notifications';
export * from './snr';
export * from './snr.service';
export default angular
  .module('huron.snr', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    require('angular-translate'),
    'huron.telephoneNumber',
    'huron.telephoneNumberService',
    customerServiceModule,
    notifications,
  ])
  .component('ucSnr', new SnrComponent())
  .service('SnrService', SnrService)
  .name;
