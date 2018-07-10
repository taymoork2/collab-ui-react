require('./_trials.scss');

var TrialService = require('./trial.service');
var TrialWebexService = require('./trialWebex.service');
var TrialBroadCloudCommonAreaService = require('./trial-broadcloud-common-area.service');
var TrialBroadCloudStdService = require('./trial-broadcloud-std.service');

(function () {
  'use strict';

  module.exports = angular
    .module('core.trial', [
      require('modules/core/scripts/services/logmetricsservice'),
      require('modules/core/notifications').default,
      require('modules/huron/pstn/pstn.service').default,
      require('modules/huron/pstnSetup/pstnServiceAddress/pstnServiceAddress.service'),
      require('modules/core/scripts/services/userlist.service'),
      require('modules/core/setupWizard/setup-wizard.service').default,
      require('modules/shared/input-validator').default,
    ])
    .factory('TrialService', TrialService.TrialService)
    .factory('TrialResource', TrialService.TrialResource)
    .factory('TrialCallService', require('./trialCall.service'))
    .factory('TrialAdvanceCareService', require('./trialAdvanceCare.service'))
    .factory('TrialCareService', require('./trialCare.service'))
    .factory('TrialContextService', require('./trialContext.service'))
    .factory('TrialDeviceService', require('./trialDevice.service'))
    .factory('TrialMeetingService', require('./trialMeeting.service'))
    .factory('TrialMessageService', require('./trialMessage.service'))
    .factory('TrialPstnService', require('./trialPstn.service'))
    .factory('TrialRoomSystemService', require('./trialRoomSystem.service'))
    .factory('TrialSparkBoardService', require('./trialSparkBoard.service'))
    .factory('TrialTimeZoneService', require('./trialTimeZone.service'))
    .factory('TrialWebexService', TrialWebexService.TrialWebexService)
    .factory('WebexOrderStatusResource', TrialWebexService.WebexOrderStatusResource)
    .service('TrialBroadCloudStdService', TrialBroadCloudStdService.TrialBroadCloudStdService)
    .service('TrialBroadCloudCommonAreaService', TrialBroadCloudCommonAreaService.TrialBroadCloudCommonAreaService)
    .name;
})();

