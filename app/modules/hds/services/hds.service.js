(function () {
  'use strict';

  module.exports = angular
    .module('hds.hds-service', [
      require('modules/core/scripts/services/authinfo'),
      require('modules/core/scripts/services/accountorgservice'),
      require('modules/core/config/urlConfig'),
    ])
    .service('HDSService', HDSService)
    .name;

  /* @ngInject */
  function HDSService($http, $q, $timeout, Authinfo, Orgservice, UrlConfig) {
    var trialUserGroupId = null;

    var service = {
      getServiceStatus: getServiceStatus,
      getOrgSettings: getOrgSettings,
      getHdsTrialUsersGroup: getHdsTrialUsersGroup,
      createHdsTrialUsersGroup: createHdsTrialUsersGroup,
      deleteCIGroup: deleteCIGroup,
      getHdsTrialUserGroupID: getHdsTrialUserGroupID,
      queryGroup: queryGroup,
      queryUser: queryUser,
      queryUsers: queryUsers,
      getHdsTrialUsers: getHdsTrialUsers,
      addHdsTrialUsers: addHdsTrialUsers,
      removeHdsTrialUsers: removeHdsTrialUsers,
      replaceHdsTrialUsers: replaceHdsTrialUsers,
      moveToProductionMode: moveToProductionMode,
      deleteHdsServerInfo: deleteHdsServerInfo,
      setOrgAltHdsServersHds: setOrgAltHdsServersHds,
      refreshEncryptionServerForTrialUsers: refreshEncryptionServerForTrialUsers,
      enableHdsEntitlement: enableHdsEntitlement,
      getHDSInfo: getHDSInfo,
    };


    return service;

    function getOrgSettings() {
      var promise = Orgservice.getOrg(_.noop);
      var modifiedPromise = promise.then(function (response) {
        return response.data.orgSettings;
      });
      return modifiedPromise;
    }

    function getServiceStatus() {
      return $q(function (resolve) {
        resolve('2');
      });
    }

    function getHDSInfo() {
      var serviceUrl = UrlConfig.getHybridEncryptionServiceUrl() + '/kms';
      return $http.get(serviceUrl).then(extractData);
    }

    function getHdsTrialUsersGroup(oid) {
      var serviceUrl = _.replace(UrlConfig.getScimUrl(oid) + '?filter=displayName eq "HDS Trial Users"', 'Users', 'Groups');
      return $http.get(serviceUrl).then(extractData);
    }
    function deleteCIGroup(oid, gid) {
      var serviceUrl = _.replace(UrlConfig.getScimUrl(oid) + '/' + gid, 'Users', 'Groups');
      return $http.delete(serviceUrl);
    }
    function createHdsTrialUsersGroup(oid) {
      var serviceUrl = _.replace(UrlConfig.getScimUrl(oid), 'Users', 'Groups');
      var json = {
        schemas: ['urn:scim:schemas:core:1.0', 'urn:scim:schemas:extension:cisco:commonidentity:1.0'],
        displayName: 'HDS Trial Users',
        members: [
          {},
        ],
      };
      return $http.post(serviceUrl, json).then(extractData);
    }

    function queryGroup(oid, groupName) {
      var serviceUrl = _.replace(UrlConfig.getScimUrl(oid) + '?filter=displayName eq "' + groupName + '"', 'Users', 'Groups');
      return $http.get(serviceUrl).then(extractData);
    }

    function getHdsTrialUserGroupID() {
      var deferred = $q.defer();
      var params = {
        basicInfo: true,
      };
      Orgservice.getOrg(function (data, status) {
        if (data.success || status === 200) {
          var altHdsServers = data.orgSettings.altHdsServers;
          if (altHdsServers && altHdsServers.length > 1) {
            // trial info
            _.forEach(altHdsServers, function (server) {
              if (server.kmsServer) {
                trialUserGroupId = server.groupId;
              }
            });
            deferred.resolve(trialUserGroupId);
          } else {
            deferred.reject(data);
          }
        } else {
          deferred.reject(data);
        }
      }, null, params);
      return deferred.promise;
    }

    function queryUser(oid, email) {
      var serviceUrl = UrlConfig.getScimUrl(oid) + '?filter=username eq "' + encodeURIComponent(email) + '"';
      return $http.get(serviceUrl).then(extractData);
    }

    function queryUsers(oid, emails) {
      var emailFilter = '';
      if (_.size(emails) === 0) {
        emailFilter = 'username eq " "';
      } else {
        emailFilter = _.chain(emails)
          .map(function (email) {
            return 'username eq "' + encodeURIComponent(email.text) + '"';
          })
          .join(' or ')
          .value();
      }
      var serviceUrl = UrlConfig.getScimUrl(oid) + '?filter=' + emailFilter;
      return $http.get(serviceUrl).then(extractData);
    }

    function getHdsTrialUsers(oid, gid) {
      var serviceUrl = _.replace(UrlConfig.getScimUrl(oid) + '/' + gid, 'Users', 'Groups');
      return $http.get(serviceUrl).then(extractData);
    }

    function addHdsTrialUsers(oid, jsonMembers) {
      var serviceUrl = _.replace(UrlConfig.getScimUrl(oid) + '/' + trialUserGroupId, 'Users', 'Groups');
      return $http.patch(serviceUrl, jsonMembers).then(extractData);
    }

    function removeHdsTrialUsers(oid, uids) {
      var serviceUrl = _.replace(UrlConfig.getScimUrl(oid) + '/' + trialUserGroupId, 'Users', 'Groups');
      var json = {
        schemas: ['urn:scim:schemas:core:1.0', 'urn:scim:schemas:extension:cisco:commonidentity:1.0'],
        members: _.map(uids, function (uid) {
          return {
            value: uid,
            operation: 'delete',
          };
        }),
      };
      return $http.patch(serviceUrl, json).then(extractData);
    }

    function replaceHdsTrialUsers(oid, jsonMembers) {
      var serviceUrl = _.replace(UrlConfig.getScimUrl(oid) + '/' + trialUserGroupId, 'Users', 'Groups');
      return $http.patch(serviceUrl, jsonMembers).then(extractData);
    }

    function moveToProductionMode(kmsServer, kmsServerMachineUUID, adrServer, securityService) {
      // copy altHdsServers info to upper layer under org settings
      // delete altHdsServers undr org settings
      return updateOrgsettingsHdsInfo(kmsServer, kmsServerMachineUUID, adrServer, securityService)
        .then(function () {
          return deleteAtlHdsServers();
        });
    }
    function updateOrgsettingsHdsInfo(kmsServer, kmsServerMachineUUID, adrServer, securityService) {
      var data = {
        kmsServer: kmsServer,
        kmsServerMachineUUID: kmsServerMachineUUID,
        adrServer: adrServer,
        securityService: securityService,
      };
      return Orgservice.setOrgSettings(Authinfo.getOrgId(), data)
        .then(function () {
          // Atlas API has a bug that values not set while returns OK of status 204
          return checkSetOrgServiceRersults(kmsServer, kmsServerMachineUUID, adrServer, securityService, 1000)
            .catch(function () {
              // check one more time with increased delay to check
              return checkSetOrgServiceRersults(kmsServer, kmsServerMachineUUID, adrServer, securityService, 2000);
            });
        })
        .catch(function () {
          return $q.reject('Failed to save Org Settings due to the Atlas API bug');
        });
    }
    function checkSetOrgServiceRersults(kmsServer, kmsServerMachineUUID, adrServer, securityService, msDelay) {
      return $timeout(function () {
        Orgservice.getOrg(function (data, status) {
          if (data.success || status === 200) {
            var orgSettings = data.orgSettings;
            var kmsServer_org = orgSettings.kmsServer;
            var kmsServerMachineUUID_org = orgSettings.kmsServerMachineUUID;
            var adrServer_org = orgSettings.adrServer;
            var securityService_org = orgSettings.securityService;
            if (kmsServer_org === kmsServer && kmsServerMachineUUID_org === kmsServerMachineUUID && adrServer_org === adrServer && securityService_org === securityService) {
              return $q.resolve();
            }
          }
          return $q.reject(status);
        });
      }, msDelay);
    }
    function deleteAtlHdsServers() {
      var serviceUrl = UrlConfig.getAdminServiceUrl() + '/organizations/' + Authinfo.getOrgId() + '/settings';
      return deleteWithConfirmation(serviceUrl, 'altHdsServers');
    }

    function deleteHdsServerInfo() {
      var serviceUrl = UrlConfig.getAdminServiceUrl() + '/organizations/' + Authinfo.getOrgId() + '/settings';
      return deleteWithConfirmation(serviceUrl, 'kmsServer')
        .then(function () {
          return deleteWithConfirmation(serviceUrl, 'kmsServerMachineUUID');
        })
        .then(function () {
          return deleteWithConfirmation(serviceUrl, 'adrServer');
        })
        .then(function () {
          return deleteWithConfirmation(serviceUrl, 'securityService');
        });
    }
    function deleteWithConfirmation(orgServiceUrl, item) {
      var serviceUrl = orgServiceUrl + '/' + item;
      return $http.delete(serviceUrl)
        .then(function () {
          return confirmDelete(orgServiceUrl, item, 1000)
            .catch(function () {
              return confirmDelete(orgServiceUrl, item, 2000);
            });
        })
        .catch(function () {
          return $q.reject('Failed to delete : ' + serviceUrl);
        });
    }
    function confirmDelete(orgServiceUrl, item, msDelay) {
      return $timeout(function () {
        Orgservice.getOrg(function (data, status) {
          if (data.success || status === 200) {
            var orgSettings = data.orgSettings;
            if (_.size(orgSettings[item]) <= 0) {
              return $q.resolve();
            }
          }
          return $q.reject(status);
        });
      }, msDelay);
    }

    function setOrgAltHdsServersHds(orgId, altHdsServers) {
      var serviceUrl = UrlConfig.getAdminServiceUrl() + 'organizations/' + orgId + '/settings/altHdsServers';
      return $http.put(serviceUrl, altHdsServers)
        .then(function () {
          return checkSetOrgAltHdsServersHds(1000)
            .catch(function () {
              return checkSetOrgAltHdsServersHds(2000);
            });
        })
        .catch(function () {
          return $q.reject('Failed to setOrgAltHdsServersHds');
        });
    }
    function checkSetOrgAltHdsServersHds(msDelay) {
      return $timeout(function () {
        Orgservice.getOrg(function (data, status) {
          if (data.success || status === 200) {
            var orgSettings = data.orgSettings;
            if (_.size(orgSettings.altHdsServers) <= 0) {
              return $q.resolve();
            }
          }
          return $q.reject(status);
        });
      }, msDelay);
    }

    function refreshEncryptionServerForTrialUsers(gid) {
      var serviceUrl = UrlConfig.getHybridEncryptionServiceUrl() + '/flushTrialUserGroupCache/' + gid;
      return $http.post(serviceUrl).then(extractData);
    }

    function enableHdsEntitlement() {
      var serviceUrl = UrlConfig.getAdminServiceUrl() + 'organizations/' + Authinfo.getOrgId() + '/services?configureService=sparkHybridDataSecurity';
      return $http.post(serviceUrl).then(extractData);
    }

    function extractData(response) {
      return response.data;
    }
  }
}());
