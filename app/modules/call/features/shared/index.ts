import './call-feature-edit.scss';
import './call-feature-setup.scss';

import callFeatureName from './call-feature-name';
import callFeatureLocation from './call-feature-location';
import callFeatureMembers from './call-feature-members';
import callFeatureFallbackDestination from './call-feature-fallback-destination';
import noDirtyOverride from './no-dirty-override';

export default angular
  .module('call.features.shared', [
    callFeatureName,
    callFeatureLocation,
    callFeatureMembers,
    callFeatureFallbackDestination,
    noDirtyOverride,
  ])
  .name;
