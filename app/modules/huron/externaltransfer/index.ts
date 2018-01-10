import { ExternalTransferComponent } from './externaltransfer.component';
import { ExternalTransferService } from './externaltransfer.service';
import FeatureToggleService from 'modules/core/featureToggle';
import siteServiceModule from 'modules/huron/sites';
import notificationsModule from 'modules/core/notifications';

export default angular
  .module('huron.externaltransfer', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
    siteServiceModule,
    FeatureToggleService,
    require('modules/core/scripts/services/authinfo'),
    require('modules/huron/telephony/telephonyConfig'),
    require('modules/huron/telephony/cmiServices'),
    notificationsModule,
  ])
  .component('ucExternalTransfer', new ExternalTransferComponent())
  .service('ExternalTransferService', ExternalTransferService)
  .name;
