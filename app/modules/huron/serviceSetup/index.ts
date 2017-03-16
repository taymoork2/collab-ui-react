import featureToggleService from 'modules/core/featureToggle';

export default angular
  .module('huron.serviceSetup', [
    require('modules/core/auth/auth'),
    require('modules/huron/telephony/cmiServices'),
    require('modules/huron/features/autoAttendant/services/ceService'),
    require('modules/huron/telephony/telephonyExternalNumbersService'),
    featureToggleService,
  ])
  .factory('ServiceSetup', require('./serviceSetup.service'))
  .name;
