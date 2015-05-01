(function () {
  'use strict';

  angular
    .module('Huron')
    .factory('HuronUser', HuronUser);

  /* @ngInject */
  function HuronUser(Authinfo, UserServiceCommon, HuronAssignedLine, HuronEmailService, UserDirectoryNumberService, IdentityOTPService, $q, LogMetricsService) {
    var userProfile = Authinfo.getOrgId() + '_000001_UCUP';
    var userPayload = {
      'userName': null,
      'firstName': null,
      'lastName': null,
      'voice': {
        'userProfile': userProfile
      },
      'services': ['VOICE'],
      'voicemail': {}
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
        'expiresOn': null
      };

      return UserServiceCommon.save({
          customerId: Authinfo.getOrgId()
        }, user).$promise
        .then(function () {
          return HuronAssignedLine.assignDirectoryNumber(user.uuid, 'Primary')
            .then(function (directoryNumber) {
              emailInfo.phoneNumber = directoryNumber ? directoryNumber.pattern : '';
              delete user.uuid;
              // TO-DO
              // the following is commented out to disable Voicemail setting while adding new users,
              // in order to upgrade Unity to 11.0. Needs to turn it back on when the upgrade is done.
              //
              //   user.services.push('VOICEMAIL');
              //   user.voicemail = {
              //     'dtmfAccessId': directoryNumber.pattern
              //   };
              //   return UserServiceCommon.update({
              //     customerId: Authinfo.getOrgId(),
              //     userId: uuid
              //   }, user).$promise;
            });
        }).then(function () {
          return acquireOTP(user.userName);
        }).then(function (otpInfo) {
          emailInfo.oneTimePassword = otpInfo.password;
          emailInfo.expiresOn = otpInfo.expiresOn;
          return HuronEmailService.save({}, emailInfo).$promise
            .then(function () {
              LogMetricsService.logMetrics('User onboard email sent', LogMetricsService.getEventType('userOnboardEmailSent'), LogMetricsService.getEventAction('buttonClick'), 200, moment(), 1);
            })
            .catch(function (response) {
              LogMetricsService.logMetrics('User onboard email sent', LogMetricsService.getEventType('userOnboardEmailSent'), LogMetricsService.getEventAction('buttonClick'), response.status || 409, moment(), 1);
              return $q.reject(response);
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
