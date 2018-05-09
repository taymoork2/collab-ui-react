import { LicenseCardComponent } from './license-card.component';
import { LicenseCardHelperService } from './license-card-helper.service';
import './license-card.scss';

export { LicenseCardHelperService };

export default angular
  .module('core.overview.licenseCard', [
    require('angular-translate'),
    require('@collabui/collab-ui-ng').default,
    require('modules/core/config/urlConfig'),
  ])
  .component('licenseCard', new LicenseCardComponent())
  .service('LicenseCardHelperService', LicenseCardHelperService)
  .name;
