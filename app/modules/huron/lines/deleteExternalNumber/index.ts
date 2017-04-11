import { DeleteExternalNumberComponent } from './deleteExternalNumber.component';
import notifications from 'modules/core/notifications';

export default angular
  .module('huron.delete-external-number', [
    'atlas.templates',
    'collab.ui',
    'pascalprecht.translate',
    'huron.telephoneNumber',
    notifications,
    require('modules/huron/telephony/cmiServices'),
    require('modules/huron/externalNumbers/externalNumber.service'),
  ])
  .component('deleteExternalNumber', new DeleteExternalNumberComponent())
  .name;
