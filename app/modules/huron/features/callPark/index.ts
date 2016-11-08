import callFeatureName from 'modules/huron/features/components/callFeatureName';

export default angular
  .module('huron.call-park', [
    'atlas.templates',
    'collab.ui',
    callFeatureName,
    require('angular-resource'),
    require('modules/huron/telephony/cmiServices'),
    require('modules/huron/telephony/telephonyConfig'),
    require('modules/core/scripts/services/authinfo'),
  ])
  .name;
