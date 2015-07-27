(function () {
  'use strict';

  angular
    .module('Huron')
    .factory('HuronUser', HuronUser);

  /* @ngInject */
  function HuronUser(Authinfo, UserServiceCommon, UserServiceCommonV2, HuronAssignedLine, HuronEmailService, UserDirectoryNumberService, IdentityOTPService, UserOTPService, $q, LogMetricsService, Notification) {
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

      if (angular.isString(data.name)) {
        var names = data.name.split(/\s+/);
        if (names.length === 1) {
          user.lastName = names[0];
        } else {
          user.firstName = names[0];
          user.lastName = names[1];
        }
      } else {
        if (data.givenName) {
          user.firstName = data.givenName;
        }
        if (data.familyName) {
          user.lastName = data.familyName;
        }
      }

      if (angular.isDefined(uuid)) {
        user.uuid = uuid;
      }

      return UserServiceCommonV2.save({
          customerId: Authinfo.getOrgId()
        }, user).$promise
        .then(function () {
          return sendWelcomeEmail(user.userName, user.lastName, uuid, Authinfo.getOrgId(), true);
        });
    }

    function sendWelcomeEmail(userName, lastName, uuid, customerId, acquireOTPFlg) {

      var emailInfo = {
        'email': userName,
        'firstName': lastName,
        'phoneNumber': null,
        'oneTimePassword': null,
        'expiresOn': null,
        'userId': uuid,
        'customerId': customerId
      };
      return UserDirectoryNumberService.query({
          customerId: customerId,
          userId: uuid
        }).$promise
        .then(function (userDnInfo) {
          if (userDnInfo && userDnInfo[0] && userDnInfo[0].directoryNumber && userDnInfo[0].directoryNumber.pattern) {
            emailInfo.phoneNumber = userDnInfo[0].directoryNumber.pattern;
          } else {
            emailInfo.phoneNumber = "1111";
          }
        })
        .then(function () {
          if (acquireOTPFlg) {
            return acquireOTP(userName);
          } else {
            return UserOTPService.query({
                customerId: customerId,
                userId: uuid
              }).$promise
              .then(function (otps) {
                var otpList = [];
                for (var i = 0; i < otps.length; i++) {
                  if (otps[i].expires.status === "valid") {
                    var otp = {
                      password: otps[i].activationCode,
                      expiresOn: otps[i].expires.time,
                      valid: otps[i].expires.status
                    };
                    otpList.push(otp);
                  }
                }

                if (otpList.length > 0) {
                  return otpList[0];
                } else {
                  return acquireOTP(userName);
                }

              });
          }
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
      var user = {
        firstName: '',
        lastName: ''
      };
      if (data.name) {
        if (data.name.givenName) {
          user.firstName = data.name.givenName.trim();
        }
        if (data.name.familyName) {
          user.lastName = data.name.familyName.trim();
        }
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
      updateDtmfAccessId: updateDtmfAccessId,
      sendWelcomeEmail: sendWelcomeEmail
    };

  }
})();
