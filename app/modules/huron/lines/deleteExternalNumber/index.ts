import { DeleteExternalNumberComponent } from './deleteExternalNumber.component';
import notifications from 'modules/core/notifications';
import phoneNumberModule from 'modules/huron/phoneNumber';

export default angular
  .module('huron.delete-external-number', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
    require('modules/huron/telephony/cmiServices'),
    require('modules/huron/externalNumbers/externalNumber.service'),
    phoneNumberModule,
    notifications,
  ])
  .component('deleteExternalNumber', new DeleteExternalNumberComponent())
  .name;
