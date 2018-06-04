import { CallEmergencyServicesComponent } from './call-emergency-services.component';
import './call-emergency-services.component.scss';

import pstnServiceModule from 'modules/huron/pstn/pstn.service';
import pstnAddressServiceModule from 'modules/huron/pstn/shared/pstn-address';
import notificationsModule from 'modules/core/notifications';
import numberServiceModule from 'modules/huron/numbers';
import phoneNumberModule from 'modules/huron/phoneNumber';

export default angular
  .module('call.sharred.call-emergency-services', [
    require('angular-translate'),
    require('angular-resource'),
    pstnServiceModule,
    pstnAddressServiceModule,
    notificationsModule,
    numberServiceModule,
    phoneNumberModule,
  ])
  .component('ucCallEmergencyServices', new CallEmergencyServicesComponent())
  .name;
