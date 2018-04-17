import './call-feature-fallback-destination.component.scss';

import { CallFeatureFallbackDestinationComponent } from './call-feature-fallback-destination.component';
import { callFeatureFallbackDestinationDirectoryNumberFilter } from './call-feature-fallback-destination-directory-number.filter';
import { CallFeatureFallbackDestinationService } from './call-feature-fallback-destination.service';
import memberService from 'modules/huron/members';
import numberService from 'modules/huron/numbers';
import voicemailServiceModule from 'modules/huron/voicemail';
import featureMemberService from 'modules/huron/features/services';
import phoneNumberModule from 'modules/huron/phoneNumber';
import featureToggleModule from 'modules/core/featureToggle';
import callDestModule from 'modules/call/shared/call-destination-translate';

export { CallFeatureFallbackDestinationService };
export * from './call-feature-fallback-destination';

export default angular
  .module('call.features.shared.fallback-destination', [
    require('angular-resource'),
    require('modules/huron/telephony/telephonyConfig'),
    require('modules/core/scripts/services/authinfo'),
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
    require('modules/huron/telephony/cmiServices'),
    require('modules/core/scripts/services/authinfo'),
    'call.shared.call-destination-translate',
    memberService,
    featureMemberService,
    numberService,
    voicemailServiceModule,
    phoneNumberModule,
    featureToggleModule,
    callDestModule,
  ])
  .component('ucFallbackDestination', new CallFeatureFallbackDestinationComponent())
  .service('CallFeatureFallbackDestinationService', CallFeatureFallbackDestinationService)
  .filter('callFeatureFallbackDestinationDirectoryNumberFilter', callFeatureFallbackDestinationDirectoryNumberFilter)
  .name;
