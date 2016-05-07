(function () {
  'use strict';

  /* @ngInject */
  function HelpdeskHuronService(HelpdeskService, $http, $q, HelpdeskMockData, UserServiceCommonV2, HuronConfig, UserEndpointService, SipEndpointService) {

    function getDevices(userId, orgId) {
      if (HelpdeskService.useMock()) {
        return deferredResolve(massageDevices(HelpdeskMockData.huronDevicesForUser));
      }
      return UserEndpointService.query({
          customerId: orgId,
          userId: userId
        }).$promise
        .then(function (devices) {
          var deviceList = [];
          for (var i = 0; i < devices.length; i++) {
            var device = {
              uuid: devices[i].endpoint.uuid,
              name: devices[i].endpoint.name,
              deviceStatus: {}
            };

            deviceList.push(device);

            SipEndpointService.get({
              customerId: orgId,
              sipEndpointId: device.uuid,
              status: true
            }).$promise.then(function (endpoint) {
              this.model = endpoint.model;
              this.description = endpoint.description;
              if (endpoint.registrationStatus && angular.lowercase(endpoint.registrationStatus) === 'registered') {
                this.deviceStatus.status = 'Online';
              } else {
                this.deviceStatus.status = 'Offline';
              }
              massageDevice(this);
            }.bind(device));
          }
          return deviceList;
        });
    }

    function getDevice(orgId, deviceId) {
      if (HelpdeskService.useMock()) {
        return deferredResolve(massageDevice(HelpdeskMockData.huronDevice));
      }
      return $http.get(HuronConfig.getCmiUrl() + '/voice/customers/' + orgId + '/sipendpoints/' + deviceId + '?status=true').then(extractDevice);
    }

    function getDeviceNumbers(deviceId, orgId, ownerUserId) {
      if (HelpdeskService.useMock()) {
        return deferredResolve(HelpdeskMockData.huronDeviceNumbers);
      }
      if (!ownerUserId) {
        return $http
          .get(HuronConfig.getCmiUrl() + '/voice/customers/' + orgId + '/sipendpoints/' + deviceId + "/directorynumbers")
          .then(extractData);
      }
      return $http
        .get(HuronConfig.getCmiUrl() + '/voice/customers/' + orgId + '/sipendpoints/' + deviceId + "/directorynumbers")
        .then(function (res) {
          var deviceNumbers = res.data;
          $http.get(HuronConfig.getCmiUrl() + '/voice/customers/' + orgId + '/users/' + ownerUserId + "/directorynumbers")
            .then(function (res) {
              _.each(res.data, function (directoryNumber) {
                var matchingDeviceNumber = _.find(deviceNumbers, function (deviceNumber) {
                  return deviceNumber.directoryNumber.uuid === directoryNumber.directoryNumber.uuid;
                });
                if (matchingDeviceNumber && directoryNumber.dnUsage) {
                  matchingDeviceNumber.dnUsage = directoryNumber.dnUsage === "Primary" ? 'primary' : '';
                  matchingDeviceNumber.sortOrder = getNumberSortOrder(matchingDeviceNumber.dnUsage);
                  getUsersUsingNumber(orgId, matchingDeviceNumber.directoryNumber.uuid).then(function (userNumberAssociations) {
                    if (userNumberAssociations.length > 1) {
                      this.dnUsage = this.dnUsage === 'primary' ? 'primaryShared' : 'shared';
                      this.sortOrder = getNumberSortOrder(this.dnUsage);
                    }
                    var users = [];
                    _.each(userNumberAssociations, function (userNumberAssociation) {
                      users.push(userNumberAssociation.user.uuid);
                    });
                    this.users = users;
                  }.bind(matchingDeviceNumber));
                }
              });
            });
          return deviceNumbers;
        });
    }

    function getNumber(directoryNumberId, orgId) {
      if (HelpdeskService.useMock()) {
        return deferredResolve(HelpdeskMockData.huronDeviceNumbers);
      }
      return $http
        .get(HuronConfig.getCmiUrl() + '/voice/customers/' + orgId + '/directorynumbers/' + directoryNumberId)
        .then(extractData);
    }

    function getUserNumbers(userId, orgId) {
      if (HelpdeskService.useMock()) {
        return deferredResolve(extractNumbers(HelpdeskMockData.huronUserNumbers));
      }
      return UserServiceCommonV2.get({
        customerId: orgId,
        userId: userId
      }).$promise.then(function (res) {
        var userNumbers = extractNumbers(res);
        $http.get(HuronConfig.getCmiUrl() + '/voice/customers/' + orgId + '/users/' + userId + "/directorynumbers")
          .then(function (res) {
            _.each(res.data, function (directoryNumber) {
              var matchingUserNumber = _.find(userNumbers, function (userNumber) {
                return userNumber.uuid === directoryNumber.directoryNumber.uuid;
              });
              if (matchingUserNumber && directoryNumber.dnUsage) {
                matchingUserNumber.dnUsage = directoryNumber.dnUsage === "Primary" ? 'primary' : '';
                matchingUserNumber.sortOrder = getNumberSortOrder(matchingUserNumber.dnUsage);
                getUsersUsingNumber(orgId, matchingUserNumber.uuid).then(function (userNumberAssociations) {
                  if (userNumberAssociations.length > 1) {
                    this.dnUsage = this.dnUsage === 'primary' ? 'primaryShared' : 'shared';
                    this.sortOrder = getNumberSortOrder(this.dnUsage);
                  }
                  var users = [];
                  _.each(userNumberAssociations, function (userNumberAssociation) {
                    users.push(userNumberAssociation.user.uuid);
                  });
                  this.users = users;
                }.bind(matchingUserNumber));
              }
            });
          });
        return userNumbers;
      });
    }

    function getUsersUsingNumber(orgId, directoryNumberId) {
      if (HelpdeskService.useMock()) {
        return deferredResolve(extractDevices(HelpdeskMockData.huronUsersUsingNumber));
      }
      return $http
        .get(HuronConfig.getCmiUrl() + '/voice/customers/' + orgId + '/directorynumbers/' + directoryNumberId + '/users')
        .then(extractData);
    }

    function searchDevices(searchString, orgId, limit) {
      if (HelpdeskService.useMock()) {
        return deferredResolve(extractDevices(HelpdeskMockData.huronDeviceSearchResult));
      }
      searchString = sanitizeNumberSearchInput(searchString);
      return $http
        .get(HuronConfig.getCmiUrl() + '/voice/customers/' + orgId + '/sipendpoints?name=' + encodeURIComponent('%' + searchString + '%') + '&limit=' + limit)
        .then(extractDevices);
    }

    function findDevicesMatchingNumber(searchString, orgId, limit) {
      var deferred = $q.defer();
      searchString = sanitizeNumberSearchInput(searchString);
      searchNumbers(searchString, orgId, limit).then(function (numbers) {
        if (_.size(numbers) === 0) {
          deferred.resolve([]);
        } else {
          var devices = [];
          var promises = [];
          _.each(numbers, function (num) {
            if (num.directoryNumber) {
              promises.push(getDevicesForNumber(num.directoryNumber.uuid, orgId).then(function (deviceNumberAssociations) {
                if (_.size(deviceNumberAssociations) > 0) {
                  _.each(deviceNumberAssociations, function (deviceNumberAssociation) {
                    var device = {
                      uuid: deviceNumberAssociation.endpoint.uuid,
                      name: deviceNumberAssociation.endpoint.name,
                      numbers: [num.number]
                    };
                    // Filter out "weird" devices (the ones that don't start with SEP seems to be device profiles or something)"
                    if (_.startsWith(device.name, 'SEP')) {
                      var existingDevice = _.find(devices, {
                        uuid: device.uuid
                      });
                      if (!existingDevice) {
                        devices.push(massageDevice(device));
                      } else {
                        existingDevice.numbers.push(num.number);
                      }
                    }
                  });
                }
              }));
            }
          });
          $q.all(promises).then(function (data) {
            deferred.resolve(devices);
          });
        }
      }, function (err) {
        deferred.reject(err);
      });
      return deferred.promise;
    }

    function searchNumbers(searchString, orgId, limit) {
      if (HelpdeskService.useMock()) {
        return deferredResolve(extractNumbers(HelpdeskMockData.huronNumberSearch));
      }
      return $http
        .get(HuronConfig.getCmiV2Url() + '/customers/' + orgId + '/numbers?number=' + encodeURIComponent('%' + searchString + '%') + '&limit=' + limit)
        .then(extractNumbers);
    }

    function getDevicesForNumber(numberId, orgId) {
      if (HelpdeskService.useMock()) {
        return deferredResolve(HelpdeskMockData.huronDevicesForNumber);
      }
      return $http
        .get(HuronConfig.getCmiUrl() + '/voice/customers/' + orgId + '/directorynumbers/' + numberId + '/endpoints')
        .then(extractData);
    }

    function setOwnerAndDeviceDetails(devices) {
      _.each(devices, function (device) {
        if (device.isHuronDevice) {
          if (!device.user && device.ownerUser) {
            HelpdeskService.getUser(device.organization.id, device.ownerUser.uuid).then(function (user) {
              device.user = user;
            }, angular.noop);
          } else {
            SipEndpointService.get({
                customerId: device.organization.id,
                sipEndpointId: device.uuid
              })
              .$promise.then(function (endpoint) {
                this.model = endpoint.model;
                this.product = endpoint.product;
                this.description = endpoint.description;
                this.ownerUser = endpoint.ownerUser;
                massageDevice(this);
                if (this.ownerUser) {
                  HelpdeskService.getUser(this.organization.id, this.ownerUser.uuid).then(function (user) {
                    this.user = user;
                  }.bind(device), angular.noop);
                }
              }.bind(device));
          }
        }
      });
    }

    function extractData(res) {
      return res.data;
    }

    function extractNumbers(res) {
      return res.data ? res.data.numbers : res.numbers;
    }

    function extractDevices(res) {
      return massageDevices(res.data || res);
    }

    function extractDevice(res) {
      return massageDevice(res.data || res);
    }

    function massageDevices(devices) {
      _.each(devices, massageDevice);
      return devices;
    }

    function massageDevice(device) {
      device.displayName = device.name;
      device.isHuronDevice = true;
      device.image = device.model ? 'images/devices/' + (device.model.trim().replace(/ /g, '_') + '.png').toLowerCase() : 'images/devices-hi/unknown.png';
      if (!device.deviceStatus) {
        if (device.registrationStatus) {
          device.deviceStatus = {
            status: angular.lowercase(device.registrationStatus) === 'registered' ? 'Online' : 'Offline'
          };
        } else {
          device.deviceStatus = {
            status: 'Unknown'
          };
        }
      } else if (!device.deviceStatus.status) {
        device.deviceStatus.status = 'Unknown';
      }
      device.deviceStatus.statusKey = 'common.' + angular.lowercase(device.deviceStatus.status);
      switch (device.deviceStatus.status) {
      case "Online":
        device.deviceStatus.cssColorClass = 'helpdesk-green';
        break;
      case "Unknown":
        device.deviceStatus.cssColorClass = 'helpdesk-grey';
        break;
      default:
        device.deviceStatus.cssColorClass = 'helpdesk-red';
      }
      return device;
    }

    function sanitizeNumberSearchInput(searchString) {
      return searchString.replace(/[-()]/g, '').replace(/\s/g, '');
    }

    function getNumberSortOrder(dnUsage) {
      switch (dnUsage) {
      case 'primary':
        return 1;
      case 'primaryShared':
        return 2;
      case 'shared':
        return 3;
      default:
        return 4;
      }
    }

    function deferredResolve(resolved) {
      var deferred = $q.defer();
      deferred.resolve(resolved);
      return deferred.promise;
    }

    return {
      getDevices: getDevices,
      getUserNumbers: getUserNumbers,
      getDeviceNumbers: getDeviceNumbers,
      searchDevices: searchDevices,
      getDevice: getDevice,
      setOwnerAndDeviceDetails: setOwnerAndDeviceDetails,
      getNumber: getNumber,
      findDevicesMatchingNumber: findDevicesMatchingNumber,
      sanitizeNumberSearchInput: sanitizeNumberSearchInput
    };
  }

  angular.module('Squared')
    .service('HelpdeskHuronService', HelpdeskHuronService);
}());
