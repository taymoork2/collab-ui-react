'use strict';

angular.module('Huron')
  .factory('HuronUser', ['Authinfo', 'UserServiceCommon', 'HuronUnassignedLine', 'UserDirectoryNumberService',
    function (Authinfo, UserServiceCommon, HuronUnassignedLine, UserDirectoryNumberService) {
      var userPayload = {
        'userId': null,
        'firstName': null,
        'lastName': null,
        'email': null,
        'voice': {
          'userProfile': 'STANDARD_USER_PROFILE'
        },
        'services': ['VOICE'],
        'voicemail': {}
      };

      return {
        assignPrimaryLine: function (userUuid, directoryNumberUuid) {
          var userLine = {
            'dnUsage': 'Primary',
            'directoryNumber': {
              'uuid': directoryNumberUuid
            }
          };
          return UserDirectoryNumberService.save({
            customerId: Authinfo.getOrgId(),
            userId: userUuid
          }, userLine).$promise;
        },
        delete: function (uuid) {
          return UserServiceCommon.remove({
            customerId: Authinfo.getOrgId(),
            userId: uuid
          });
        },
        create: function (email, uuid) {
          var user = angular.copy(userPayload);
          user.email = email;
          user.userId = email;
          user.lastName = email.split('@')[0];
          if (angular.isDefined(uuid)) {
            user.uuid = uuid;
          }

          return UserServiceCommon.save({
              customerId: Authinfo.getOrgId()
            }, user).$promise
            .then(function () {
              return HuronUnassignedLine.getFirst();
            }).then(function (directoryNumberUuid) {
              return this.assignPrimaryLine(uuid, directoryNumberUuid);
            }.bind(this));
        }
      };
    }
  ]);
