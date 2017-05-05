import './_call-feature-fallback-dest.scss';

import { CallFeatureFallbackDestinationComponent } from './callFeatureFallbackDestination.component';
import { callFeatureFallbackDestinationDirectoryNumberFilter } from './callFeatureFallbackDestinationDirectoryNumber.filter';
import memberService from 'modules/huron/members';
import numberService from 'modules/huron/numbers';
import voicemailService from 'modules/huron/voicemail/services';
import callFeatureFallbackDestinationService from './services';

export default angular
  .module('huron.fallback-destination', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    require('angular-translate'),
    'huron.telephoneNumber',
    require('modules/huron/telephony/cmiServices'),
    require('modules/core/scripts/services/authinfo'),
    memberService,
    numberService,
    voicemailService,
    callFeatureFallbackDestinationService,
  ])
  .component('ucFallbackDestination', new CallFeatureFallbackDestinationComponent())
  .filter('callFeatureFallbackDestinationDirectoryNumberFilter', callFeatureFallbackDestinationDirectoryNumberFilter)
  .name;
