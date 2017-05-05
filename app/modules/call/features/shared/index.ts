import './call-feature-edit.scss';
import './call-feature-setup.scss';

import callFeatureName from './call-feature-name';
import callFeatureMembers from './callFeatureMembers';
import callFeatureFallbackDestination from './callFeatureFallbackDestination';

export default angular
  .module('call.features.shared', [
    callFeatureName,
    callFeatureMembers,
    callFeatureFallbackDestination,
  ])
  .name;
