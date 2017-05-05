import './call-feature-edit.scss';
import './call-feature-setup.scss';

import callFeatureName from './call-feature-name';
import callFeatureMembers from './call-feature-members';
import callFeatureFallbackDestination from './callFeatureFallbackDestination';
import noDirtyOverride from './no-dirty-override';

export default angular
  .module('call.features.shared', [
    callFeatureName,
    callFeatureMembers,
    callFeatureFallbackDestination,
    noDirtyOverride,
  ])
  .name;
