import { BsftSettingsService, BsftSettingsData } from './bsft-settings.service';
import { BsftSettingsOptionsService, BsftSettingsOptions } from './bsft-settings-options.service';
import { BsftCustomerService } from './bsft-customer.service';

export * from './bsft-settings';
export { BsftSettingsOptionsService, BsftSettingsOptions };
export { BsftSettingsService, BsftSettingsData };
export { BsftCustomerService };

export default angular
  .module('bsft.settings.services', [
    require('angular-resource'),
  ])
  .service('BsftCustomerService', BsftCustomerService)
  .service('BsftSettingsService', BsftSettingsService)
  .service('BsftSettingsOptionsService', BsftSettingsOptionsService)
  .name;
