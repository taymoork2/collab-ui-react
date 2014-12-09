(function () {
  'use strict';

  angular
    .module('Huron')
    .factory('HuronUser', ['Authinfo', 'UserServiceCommon', 'HuronAssignedLine', 'HuronEmailService', 'UserDirectoryNumberService', 'IdentityOTPService',
      function (Authinfo, UserServiceCommon, HuronAssignedLine, HuronEmailService, UserDirectoryNumberService, IdentityOTPService) {
        var userProfile = Authinfo.getOrgId() + '_000001_UCUP';
        var userPayload = {
          'userId': null,
          'firstName': null,
          'lastName': null,
          'email': null,
          'voice': {
            'userProfile': userProfile
          },
          'services': ['VOICE'],
          'voicemail': {}
        };

        return {
          delete: function (uuid) {
            return UserServiceCommon.remove({
              customerId: Authinfo.getOrgId(),
              userId: uuid
            }).$promise;
          },
          acquireOTP: function (userName) {
            var otpRequest = {
              'userName': userName
            };

            return IdentityOTPService.save({}, otpRequest).$promise;
          },

          create: function (email, uuid) {
            var user = angular.copy(userPayload);
            user.email = email;
            user.userId = email;
            user.lastName = email.split('@')[0];
            if (angular.isDefined(uuid)) {
              user.uuid = uuid;
            }

            var emailInfo = {
              'email': user.email,
              'firstName': user.lastName,
              'phoneNumber': null,
              'oneTimePassword': null,
            };

            return UserServiceCommon.save({
                customerId: Authinfo.getOrgId()
              }, user).$promise
              .then(function () {
                return HuronAssignedLine.assignDirectoryNumber(user.uuid, 'Primary');
              }).then(function (directoryNumber) {
                emailInfo.phoneNumber = directoryNumber.pattern;
                user.services.push('VOICEMAIL');
                user.voicemail = {
                  'dtmfAccessId': directoryNumber.pattern
                };
                return UserServiceCommon.update({
                  customerId: Authinfo.getOrgId(),
                  userId: uuid
                }, user);
              }).then(function () {
                return this.acquireOTP(user.userId);
              }.bind(this)).then(function (otpInfo) {
                emailInfo.oneTimePassword = otpInfo.password;
                return HuronEmailService.save({}, emailInfo);
              });
          }
        };
      }
    ]);
})();
