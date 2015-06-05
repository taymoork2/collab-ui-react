(function () {
  'use strict';

  angular
    .module('Huron')
    .factory('HuronUser', HuronUser);

  /* @ngInject */
  function HuronUser(Authinfo, UserServiceCommon, UserServiceCommonV2, HuronAssignedLine, HuronEmailService, UserDirectoryNumberService, IdentityOTPService, $q, LogMetricsService, Notification) {
    var userPayload = {
      'userName': null,
      'firstName': null,
      'lastName': null
    };

    function deleteUser(uuid) {
      return UserServiceCommon.remove({
        customerId: Authinfo.getOrgId(),
        userId: uuid
      }).$promise;
    }

    function acquireOTP(userName) {
      var otpRequest = {
        'userName': userName
      };

      return IdentityOTPService.save({}, otpRequest).$promise;
    }

    function create(uuid, data) {
      var user = angular.copy(userPayload);
      user.userName = data.email;

      if (data.familyName) {
        user.lastName = data.familyName;
      } else {
        user.lastName = data.email.split('@')[0];
      }

      if (data.givenName) {
        user.firstName = data.givenName;
      }

      if (angular.isDefined(uuid)) {
        user.uuid = uuid;
      }

      var emailInfo = {
        'email': user.userName,
        'firstName': user.lastName,
        'phoneNumber': null,
        'oneTimePassword': null,
        'expiresOn': null,
        'userId': uuid,
        'customerId': Authinfo.getOrgId()
      };

      return UserServiceCommonV2.save({
          customerId: Authinfo.getOrgId()
        }, user).$promise
        .then(function () {
          return UserDirectoryNumberService.query({
              customerId: Authinfo.getOrgId(),
              userId: user.uuid
            }).$promise
            .then(function (userDnInfo) {
              if (userDnInfo && userDnInfo[0] && userDnInfo[0].directoryNumber && userDnInfo[0].directoryNumber.pattern) {
                emailInfo.phoneNumber = userDnInfo[0].directoryNumber.pattern;
              } else {
                emailInfo.phoneNumber = "1111";
              }
            });
        })
        .then(function () {
          return acquireOTP(user.userName);
        })
        .then(function (otpInfo) {
          emailInfo.oneTimePassword = otpInfo.password;
          emailInfo.expiresOn = otpInfo.expiresOn;
          return HuronEmailService.save({}, emailInfo).$promise
            .then(function () {
              LogMetricsService.logMetrics('User onboard email sent', LogMetricsService.getEventType('userOnboardEmailSent'), LogMetricsService.getEventAction('buttonClick'), 200, moment(), 1);
            })
            .catch(function (response) {
              LogMetricsService.logMetrics('User onboard email sent', LogMetricsService.getEventType('userOnboardEmailSent'), LogMetricsService.getEventAction('buttonClick'), response.status || 409, moment(), 1);
              //Notify email error, don't rethrow error
              Notification.errorResponse(response, 'usersPage.emailError');
            });
        });
    }

    function update(uuid, data) {
      var user = {};
      if (data.name.givenName) {
        user.firstName = data.name.givenName.trim();
      }
      if (data.name.familyName) {
        user.lastName = data.name.familyName.trim();
      } else {
        user.lastName = data.userName.split('@')[0];
      }

      return UserServiceCommon.update({
        customerId: Authinfo.getOrgId(),
        userId: uuid
      }, user).$promise;
    }

    function updateDtmfAccessId(uuid, dtmfAccessId) {
      var payload = {
        'voicemail': {
          'dtmfAccessId': dtmfAccessId
        }
      };

      return UserServiceCommon.update({
        customerId: Authinfo.getOrgId(),
        userId: uuid
      }, payload).$promise;
    }

    return {
      delete: deleteUser,
      acquireOTP: acquireOTP,
      create: create,
      update: update,
      updateDtmfAccessId: updateDtmfAccessId
    };

  }
})();
