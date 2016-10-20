(function () {
  'use strict';

  angular
    .module('Huron')
    .factory('SharedLineInfoService', SharedLineInfoService);

  /* @ngInject */
  function SharedLineInfoService($q, Authinfo, UserServiceCommon,
    UserDirectoryNumberService, DirectoryNumberUserService,
    SipEndpointDirectoryNumberService, UserEndpointService, SipEndpointService) {

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
      disassociateSharedLineUser: disassociateSharedLineUser,
      updateLineEndpoint: updateLineEndpoint
    };
    return sharedLineInfo;
    /////////////////////

    function getSharedLineUsers() {
      return sharedLineUsers;
    }

    function getSharedLineDevices() {
      return userDeviceInfo;
    }

    function loadSharedLineUsers(dnUuid, currentUserId) {
      sharedLineUsers = [];
      var promises = [];
      return DirectoryNumberUserService.query({
        'customerId': Authinfo.getOrgId(),
        'directoryNumberId': dnUuid
      }).$promise
        .then(function (dnUserInfo) {
          for (var i = 0; i < dnUserInfo.length; i++) {
            var promise;
            var dnUser = dnUserInfo[i];
            var userInfo = {
              'uuid': dnUser.user.uuid,
              'name': '',
              'userName': dnUser.user.userId,
              'userDnUuid': dnUser.uuid,
              'dnUsage': dnUser.dnUsage,
              'dnUuid': dnUuid
            };
            if (userInfo.uuid === currentUserId) {
              sharedLineUsers.unshift(userInfo);
            } else {
              sharedLineUsers.push(userInfo);
            }
            promise =
              UserServiceCommon.get({
                customerId: Authinfo.getOrgId(),
                userId: dnUser.user.uuid
              }).$promise
              .then(function (commonUser) {
                this.name = (commonUser && commonUser.firstName) ? (commonUser.firstName) : '';
                this.name = (commonUser && commonUser.lastName) ? (this.name + ' ' + commonUser.lastName).trim() : this.name;
                this.name = (this.name) ? this.name : commonUser.userName;
              }.bind(userInfo));
            promises.push(promise);
          }
          return $q.all(promises)
            .then(function () {
              return sharedLineUsers;
            });
        });
    }

    function loadUserDevices(userUuid, dnuuid) {
      var promises = [];

      return UserEndpointService.query({
        customerId: Authinfo.getOrgId(),
        userId: userUuid
      }).$promise
        .then(function (devices) {
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
              endpointDnUuid: '',
              companyNumber: null,
              externalCallerIdType: null
            };
            userDeviceInfo.push(device);

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
                  this.companyNumber = info.companyNumber;
                  this.externalCallerIdType = info.externalCallerIdType;
                }
              }.bind(device));
            promises.push(promise);
          }
          return $q.all(promises)
            .then(function () {
              return userDeviceInfo;
            });
        });
    }

    function loadSharedLineUserDevices(dnUuid) {
      userDeviceInfo = [];
      var promises = [];
      angular.forEach(sharedLineUsers, function (user) {
        var promise;
        promise = loadUserDevices(user.uuid, dnUuid);
        promises.push(promise);
      });
      return $q.all(promises)
        .then(function () {
          return userDeviceInfo;
        });
    }

    function setDeviceSharedLine(deviceUuid, dnuuid) {
      var info = {
        isSharedLine: false,
        maxIndex: 1,
        endpointDnUuid: '',
        companyNumber: null,
        externalCallerIdType: null
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
                info.companyNumber = d.companyNumber;
                info.externalCallerIdType = d.externalCallerIdType;
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
        'index': parseInt(index, 10) + 1,
        'directoryNumber': {
          'uuid': directoryNumberUuid
        }
      };
      return SipEndpointDirectoryNumberService.save({
        customerId: Authinfo.getOrgId(),
        sipendpointId: deviceUuid
      }, directoryNumberInfo).$promise;
    }

    function disassociateSharedLineUser(userUuid, userDnUuid) {
      return UserDirectoryNumberService.delete({
        'customerId': Authinfo.getOrgId(),
        'userId': userUuid,
        'directoryNumberId': userDnUuid
      }).$promise;
    }

    function disassociateLineEndpoint(deviceUuid, directoryNumberId, endpointDnAssnId) {
      return SipEndpointDirectoryNumberService.delete({
        'customerId': Authinfo.getOrgId(),
        'sipendpointId': deviceUuid,
        'endpointDnAssnId': endpointDnAssnId
      }).$promise;
    }

    function updateLineEndpoint(deviceUuid, directoryNumberId, endpointDnAssnId, data) {
      return SipEndpointDirectoryNumberService.update({
        'customerId': Authinfo.getOrgId(),
        'sipendpointId': deviceUuid,
        'endpointDnAssnId': endpointDnAssnId
      }, data).$promise;
    }

  }

})();
