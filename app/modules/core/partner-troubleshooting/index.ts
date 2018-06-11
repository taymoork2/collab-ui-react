import * as analyticsModuleName from 'modules/core/analytics';
import * as authModuleName from 'modules/core/auth/auth';
import * as authinfoModuleName from 'modules/core/scripts/services/authinfo';
import configModuleName from 'modules/core/config/config';
import notificationsModuleName from 'modules/core/notifications';
import { PartnerTroubleshootingComponent } from './partner-troubleshooting.component';
import './_troubleshooting.scss';

export default angular
  .module('core.partner-troubleshooting', [
    analyticsModuleName,
    authModuleName,
    authinfoModuleName,
    configModuleName,
    notificationsModuleName,
  ])
  .component('partnerTroubleshooting', new PartnerTroubleshootingComponent())
  .name;
