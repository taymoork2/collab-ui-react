(function () {
  'use strict';

  angular
    .module('Huron')
    .factory('SharedLineInfoService', SharedLineInfoService);

  /* @ngInject */
  function SharedLineInfoService($rootScope, $q, Authinfo, UserServiceCommon,
    UserDirectoryNumberService, DirectoryNumberUserService, DirectoryNumber,
    SipEndpointDirectoryNumberService, UserEndpointService, SipEndpointService) {

    var broadcastEvent = "SharedLineInfoUpdated";

    var sharedLineUsers = [];
    var userDeviceInfo = [];
    var sharedLineInfo = {
      getSharedLineUsers: getSharedLineUsers,
      loadSharedLineUsers: loadSharedLineUsers,
      getSharedLineDevices: getSharedLineDevices,
      loadSharedLineUserDevices: loadSharedLineUserDevices,
      loadUserDevices: loadUserDevices,
      setDeviceSharedLine: setDeviceSharedLine,
      addSharedLineUser: addSharedLineUser,
      getUserLineCount: getUserLineCount,
      associateLineEndpoint: associateLineEndpoint,
      disassociateLineEndpoint: disassociateLineEndpoint,
      disassociateSharedLineUser: disassociateSharedLineUser
    };
    return sharedLineInfo;
    /////////////////////

    function getSharedLineUsers() {
      return sharedLineUsers;
    }

    function getSharedLineDevices() {
      return userDeviceInfo;
    }

    function updateSharedLineDevices(deviceList) {
      userDeviceInfo = deviceList;
      $rootScope.$broadcast(broadcastEvent);
    }

    function loadSharedLineUsers(dnUuid, currentUserId) {
      sharedLineUsers = [];
      return DirectoryNumberUserService.query({
          'customerId': Authinfo.getOrgId(),
          'directoryNumberId': dnUuid
        }).$promise
        .then(function (dnUserInfo) {
          if (angular.isDefined(dnUserInfo)) {
            for (var i = 0; i < dnUserInfo.length; i++) {
              var dnUser = dnUserInfo[i];
              if (dnUser.user.uuid !== currentUserId) {
                var userInfo = {
                  'uuid': dnUser.user.uuid,
                  'name': '',
                  'userName': dnUser.user.userId,
                  'userDnUuid': dnUser.uuid,
                  'dnUsage': dnUser.dnUsage
                };
                sharedLineUsers.push(userInfo);
                UserServiceCommon.get({
                    customerId: Authinfo.getOrgId(),
                    userId: dnUser.user.uuid
                  }).$promise
                  .then(function (commonUser) {
                    if (commonUser && commonUser.firstName && commonUser.lastName) {
                      this.name = commonUser.firstName + ' ' + commonUser.lastName;
                    }
                  }.bind(userInfo));

              }
            }
            return sharedLineUsers;
          }
        });
    }

    function loadUserDevices(userUuid, dnuuid, deviceList) {
      var promises = [];

      return UserEndpointService.query({
          customerId: Authinfo.getOrgId(),
          userId: userUuid
        }).$promise
        .then(function (devices) {
          if (angular.isDefined(devices)) {
            for (var i = 0; i < devices.length; i++) {
              var promise;
              var device = {
                userUuid: userUuid,
                dnUuid: dnuuid,
                uuid: devices[i].endpoint.uuid,
                name: devices[i].endpoint.name,
                model: '',
                description: '',
                isSharedLine: false,
                maxIndex: 1,
                endpointDnUuid: ''
              };
              deviceList.push(device);

              promise =
                SipEndpointService.get({
                  customerId: Authinfo.getOrgId(),
                  sipEndpointId: device.uuid
                }).$promise
                .then(function (endpoint) {
                  if (endpoint) {
                    this.model = endpoint.model;
                    this.description = endpoint.description;
                  }
                }.bind(device));
              promises.push(promise);

              promise =
                setDeviceSharedLine(device.uuid, dnuuid)
                .then(function (info) {
                  if (angular.isDefined(info)) {
                    this.isSharedLine = info.isSharedLine;
                    this.maxIndex = info.maxIndex;
                    this.endpointDnUuid = info.endpointDnUuid;

                  }
                }.bind(device));
              promises.push(promise);
            }
            return $q.all(promises)
              .then(function () {
                return deviceList;
              });
          }
        });
    }

    function loadSharedLineUserDevices(dnUuid) {
      var deviceList = [];
      angular.forEach(sharedLineUsers, function (user) {
        loadUserDevices(user.uuid, dnUuid, deviceList).then(updateSharedLineDevices);
      });
    }

    function setDeviceSharedLine(deviceUuid, dnuuid) {
      var info = {
        isSharedLine: false,
        maxIndex: 1,
        endpointDnUuid: ''
      };
      return SipEndpointDirectoryNumberService.query({
          'customerId': Authinfo.getOrgId(),
          'sipendpointId': deviceUuid
        }).$promise
        .then(function (endpointDn) {
          if (angular.isDefined(endpointDn)) {
            angular.forEach(endpointDn, function (d) {
              if (d.directoryNumber.uuid === dnuuid) {
                info.isSharedLine = true;
                info.endpointDnUuid = d.uuid;

              }
              info.maxIndex = (info.maxIndex < d.index) ? d.index : info.maxIndex;

            });

          }
          return info;
        });
    }

    function addSharedLineUser(userUuid, dnUuid) {
      var directoryNumberInfo = {
        'directoryNumber': {
          'uuid': dnUuid
        },
        'dnUsage': 'undefined'
      };

      return UserDirectoryNumberService.save({
        'customerId': Authinfo.getOrgId(),
        'userId': userUuid
      }, directoryNumberInfo).$promise;
    }

    function getUserLineCount(userUuid) {
      return UserDirectoryNumberService.query({
          'customerId': Authinfo.getOrgId(),
          'userId': userUuid
        }).$promise
        .then(function (data) {
          if (data) {
            return data.length;
          }
        });
    }

    function associateLineEndpoint(deviceUuid, directoryNumberUuid, index) {
      var directoryNumberInfo = {
        'index': parseInt(index) + 1,
        'directoryNumber': {
          'uuid': directoryNumberUuid
        }
      };
      return SipEndpointDirectoryNumberService.save({
        customerId: Authinfo.getOrgId(),
        sipendpointId: deviceUuid
      }, directoryNumberInfo).$promise;
    }

    function disassociateSharedLineUser(userUuid, userDnUuid, dnuuid) {
      return UserDirectoryNumberService.delete({
        'customerId': Authinfo.getOrgId(),
        'userId': userUuid,
        'directoryNumberId': userDnUuid
      }).$promise;
    }

    function disassociateLineEndpoint(deviceUuid, directoryNumberId, endpointDnAssnId) {
      var promises = [];
      var promise = SipEndpointDirectoryNumberService.delete({
        'customerId': Authinfo.getOrgId(),
        'sipendpointId': deviceUuid,
        'endpointDnAssnId': endpointDnAssnId
      }).$promise;
    }
  }

})();
