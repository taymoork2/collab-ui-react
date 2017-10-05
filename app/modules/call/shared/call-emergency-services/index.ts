import { CallEmergencyServicesComponent } from './call-emergency-services.component';
import './call-emergency-services.component.scss';

import NotificationModule from 'modules/core/notifications';
import pstnAddressServiceModule from 'modules/huron/pstn/shared/pstn-address';
import phoneNumberModule from 'modules/huron/phoneNumber';

export default angular
.module('call.sharred.call-emergency-services', [
  require('angular-translate'),
  require('angular-resource'),
  NotificationModule,
  pstnAddressServiceModule,
  phoneNumberModule,
])
.component('ucCallEmergencyServices', new CallEmergencyServicesComponent())
.name;
