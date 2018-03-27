import { SsoCertificateService } from './sso-certificate.service';
import './sso-certificate.scss';

export * from './sso-certificate.service';

export default angular.module('core.sso-certificate.shared', [
  require('@collabui/collab-ui-ng').default,
  require('modules/core/scripts/services/authinfo'),
  require('modules/core/config/urlConfig'),
])
  .service('SsoCertificateService', SsoCertificateService)
  .name;
