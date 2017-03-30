import { DeleteExternalNumberComponent } from './deleteExternalNumber.component';
import notifications from 'modules/core/notifications';

export default angular
  .module('huron.delete-external-number', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    require('angular-translate'),
    'huron.telephoneNumber',
    notifications,
    require('modules/huron/telephony/cmiServices'),
    require('modules/huron/externalNumbers/externalNumber.service'),
  ])
  .component('deleteExternalNumber', new DeleteExternalNumberComponent())
  .name;
