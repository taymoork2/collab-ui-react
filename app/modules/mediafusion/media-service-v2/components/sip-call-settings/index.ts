import { SipCallSettingsComponent } from './sip-call-settings.component';
import hybridServicesClusterServiceModuleName from 'modules/hercules/services/hybrid-services-cluster.service';
import  { SipRegistrationSectionService } from 'modules/mediafusion/media-service-v2/components/sip-registration-section/sip-registration-section.service';
import  sipRegistrationSectionModuleName from 'modules/mediafusion/media-service-v2/components/sip-registration-section';
import  { TrustedSipSectionService } from 'modules/mediafusion/media-service-v2/components/trusted-sip-section/trusted-sip-section.service';
import  trustedSipSectionServiceModuleName from 'modules/mediafusion/media-service-v2/components/trusted-sip-section';

export default angular.module('mediafusion.media-service-v2.components.sip-call-settings', [
  require('angular-translate'),
  require('@collabui/collab-ui-ng').default,
  //require('modules/mediafusion/media-service-v2/components/sip-registration-section/sip-registration-section.service'),
  hybridServicesClusterServiceModuleName,
  sipRegistrationSectionModuleName,
  trustedSipSectionServiceModuleName,
])
  .component('sipCallSettings', new SipCallSettingsComponent())
  .service('SipRegistrationSectionService', SipRegistrationSectionService)
  .service('TrustedSipSectionService', TrustedSipSectionService)
  .name;
