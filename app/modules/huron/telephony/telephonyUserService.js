(function () {
  'use strict';

  var userServiceCommonModuleName = require('./cmiServices');
  var logMetricsServiceModuleName = require('modules/core/scripts/services/logmetricsservice');
  var notificationModuleName = require('modules/core/notifications').default;

  module.exports = angular
    .module('huron.huron-user', [
      userServiceCommonModuleName,
      logMetricsServiceModuleName,
      notificationModuleName,
    ])
    .factory('HuronUser', HuronUser)
    .name;

  /* @ngInject */
  function HuronUser(Authinfo, UserServiceCommon, HuronEmailService, UserDirectoryNumberService, IdentityOTPService, LogMetricsService, Notification) {
    function acquireOTP(userName) {
      var otpRequest = {
        userName: userName,
      };

      return IdentityOTPService.save({}, otpRequest).$promise;
    }

    function sendWelcomeEmail(userName, lastName, uuid, customerId) {
      var emailInfo = {
        email: userName,
        firstName: lastName,
        phoneNumber: null,
        oneTimePassword: null,
        expiresOn: null,
        userId: uuid,
        customerId: customerId,
      };
      return UserDirectoryNumberService.query({
        customerId: customerId,
        userId: uuid,
      }).$promise
        .then(function (userDnInfo) {
          if (userDnInfo && userDnInfo[0] && userDnInfo[0].directoryNumber && userDnInfo[0].directoryNumber.pattern) {
            emailInfo.phoneNumber = userDnInfo[0].directoryNumber.pattern;
          } else {
            emailInfo.phoneNumber = '1111';
          }
        })
        .then(function () {
          return acquireOTP(userName);
        })
        .then(function (otpInfo) {
          emailInfo.oneTimePassword = otpInfo.password;
          var timezone = jstz.determine().name();
          if (timezone === null || _.isUndefined(timezone)) {
            timezone = 'UTC';
          }
          emailInfo.expiresOn = moment(otpInfo.expiresOn).local().tz(timezone).format('MMMM DD, YYYY h:mm A (z)');
          return HuronEmailService.save({}, emailInfo).$promise
            .then(function () {
              LogMetricsService.logMetrics('User onboard email sent', LogMetricsService.getEventType('userOnboardEmailSent'), LogMetricsService.getEventAction('buttonClick'), 200, moment(), 1, null);
            })
            .catch(function (response) {
              LogMetricsService.logMetrics('User onboard email sent', LogMetricsService.getEventType('userOnboardEmailSent'), LogMetricsService.getEventAction('buttonClick'), response.status || 409, moment(), 1, null);
              //Notify email error, don't rethrow error
              Notification.errorResponse(response, 'usersPage.emailError');
            });
        });
    }

    function update(uuid, data) {
      var user = {
        firstName: '',
        lastName: '',
      };
      if (data.name && data.name.givenName) {
        user.firstName = data.name.givenName.trim();
      }
      if (data.name && data.name.familyName) {
        user.lastName = data.name.familyName.trim();
      }

      return UserServiceCommon.update({
        customerId: Authinfo.getOrgId(),
        userId: uuid,
      }, user).$promise;
    }

    return {
      acquireOTP: acquireOTP,
      update: update,
      sendWelcomeEmail: sendWelcomeEmail,
    };
  }
})();
