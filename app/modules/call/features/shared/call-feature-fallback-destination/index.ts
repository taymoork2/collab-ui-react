import './call-feature-fallback-destination.component.scss';

import { CallFeatureFallbackDestinationComponent } from './call-feature-fallback-destination.component';
import { callFeatureFallbackDestinationDirectoryNumberFilter } from './call-feature-fallback-destination-directory-number.filter';
import { CallFeatureFallbackDestinationService } from './call-feature-fallback-destination.service';
import memberService from 'modules/huron/members';
import numberService from 'modules/huron/numbers';
import voicemailService from 'modules/huron/voicemail/services';

export * from './call-feature-fallback-destination.service';
export * from './call-feature-fallback-destination';

export default angular
  .module('call.features.shared.fallback-destination', [
    require('angular-resource'),
    require('modules/huron/telephony/telephonyConfig'),
    require('modules/core/scripts/services/authinfo'),
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    require('angular-translate'),
    require('modules/huron/telephony/telephoneNumber.filter.js'),
    require('modules/huron/telephony/cmiServices'),
    require('modules/core/scripts/services/authinfo'),
    memberService,
    numberService,
    voicemailService,
  ])
  .component('ucFallbackDestination', new CallFeatureFallbackDestinationComponent())
  .service('CallFeatureFallbackDestinationService', CallFeatureFallbackDestinationService)
  .filter('callFeatureFallbackDestinationDirectoryNumberFilter', callFeatureFallbackDestinationDirectoryNumberFilter)
  .name;
