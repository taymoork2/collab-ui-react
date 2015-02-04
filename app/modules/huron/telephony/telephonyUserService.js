(function () {
  'use strict';

  angular
    .module('Huron')
    .factory('HuronUser', HuronUser);

  /* @ngInject */
  function HuronUser(Authinfo, UserServiceCommon, HuronAssignedLine, HuronEmailService, UserDirectoryNumberService, IdentityOTPService) {
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

    var factory = {
      delete: deleteUser,
      acquireOTP: acquireOTP,
      create: create,
      update: update
    };

    return factory;

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
          return HuronAssignedLine.assignDirectoryNumber(user.uuid, 'Primary');
        }).then(function (directoryNumber) {
          emailInfo.phoneNumber = directoryNumber.pattern;
          delete user["uuid"];
          user.services.push('VOICEMAIL');
          user.voicemail = {
            'dtmfAccessId': directoryNumber.pattern
          };
          return UserServiceCommon.update({
            customerId: Authinfo.getOrgId(),
            userId: uuid
          }, user).$promise;
        }).then(function () {
          return acquireOTP(user.userName);
        }).then(function (otpInfo) {
          emailInfo.oneTimePassword = otpInfo.password;
          emailInfo.expiresOn = otpInfo.expiresOn;
          return HuronEmailService.save({}, emailInfo).$promise;
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
  }
})();
