import { SipCallSettingsComponent } from './sip-call-settings.component';
import * as ngTranslateModuleName from 'angular-translate';
import collabUiModuleName from '@collabui/collab-ui-ng';
import hybridServicesClusterServiceModuleName from 'modules/hercules/services/hybrid-services-cluster.service';
import { SipRegistrationSectionService } from 'modules/mediafusion/media-service-v2/components/sip-registration-section/sip-registration-section.service';
import { TrustedSipSectionService } from 'modules/mediafusion/media-service-v2/components/trusted-sip-section/trusted-sip-section.service';

export default angular.module('mediafusion.media-service-v2.components.sip-call-settings', [
  ngTranslateModuleName,
  collabUiModuleName,
  hybridServicesClusterServiceModuleName,
  SipRegistrationSectionService,
  TrustedSipSectionService,
])
  .component('sipCallSettings', new SipCallSettingsComponent())
  .name;
