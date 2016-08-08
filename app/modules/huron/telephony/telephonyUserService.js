(function () {
  'use strict';

  angular
    .module('Huron')
    .factory('HuronUser', HuronUser);

  /* @ngInject */
  function HuronUser(Authinfo, UserServiceCommon, UserServiceCommonV2, HuronEmailService, UserDirectoryNumberService, IdentityOTPService, UserOTPService, LogMetricsService, Notification, CallerId) {

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
      var user = {};
      user.userName = data.email;

      if (data.name) {
        if (data.name.givenName) {
          user.firstName = data.name.givenName.trim();
        }
        if (data.name.familyName) {
          user.lastName = data.name.familyName.trim();
        }
      }

      if (angular.isDefined(uuid)) {
        user.uuid = uuid;
      }

      if (data.directoryNumber) {
        user.directoryNumber = data.directoryNumber;
      }

      if (data.externalNumber) {
        user.externalNumber = data.externalNumber;
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
          var timezone = jstz.determine().name();
          if (timezone === null || angular.isUndefined(timezone)) {
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
        lastName: ''
      };
      if (data.name && data.name.givenName) {
        user.firstName = data.name.givenName.trim();
      }
      if (data.name && data.name.familyName) {
        user.lastName = data.name.familyName.trim();
      }

      return UserServiceCommon.update({
        customerId: Authinfo.getOrgId(),
        userId: uuid
      }, user).$promise.then(function () {
        var userName = '';
        userName = (user.firstName) ? user.firstName : '';
        userName = (user.lastName) ? (userName + ' ' + user.lastName) : userName;
        userName = userName || data.userName;
        return CallerId.updateInternalCallerId(uuid, userName);
      });
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
