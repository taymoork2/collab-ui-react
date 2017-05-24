import { HuronSettingsService } from './settings.service';
import { HuronSettingsOptionsService } from './settingsOptions.service';
import siteServiceModule from 'modules/huron/sites';
import customerServiceModule from 'modules/huron/customer';
import serviceSetupModule from 'modules/huron/serviceSetup';

export * from './settings.service';
export * from './settingsOptions.service';

export const E911_ADDRESS_PENDING: string = 'PENDING';

export default angular
  .module('huron.settings.services', [
    require('modules/huron/lineSettings/callerIdService'),
    require('modules/huron/settings/voicemailMessageAction.service'),
    require('modules/huron/pstnSetup/terminusServices'),
    siteServiceModule,
    customerServiceModule,
    serviceSetupModule,
  ])
  .service('HuronSettingsService', HuronSettingsService)
  .service('HuronSettingsOptionsService', HuronSettingsOptionsService)
  .name;
