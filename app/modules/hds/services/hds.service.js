(function () {
  'use strict';

  angular
    .module('HDS')
    .service('HDSService', HDSService);

  /* @ngInject */
  function HDSService($http, $q, Authinfo, Orgservice, UrlConfig) {
    var trialUserGroupId = null;

    var service = {
      getServiceStatus: getServiceStatus,
      getOrgSettings: getOrgSettings,
      getHdsTrialUsersGroup: getHdsTrialUsersGroup,
      createHdsTrialUsersTestGroup: createHdsTrialUsersTestGroup,
      getHdsTrialUserGroupID: getHdsTrialUserGroupID,
      queryUser: queryUser,
      queryUsers: queryUsers,
      getHdsTrialUsers: getHdsTrialUsers,
      addHdsTrialUsers: addHdsTrialUsers,
      removeHdsTrialUsers: removeHdsTrialUsers,
      replaceHdsTrialUsers: replaceHdsTrialUsers,
      moveToProductionMode: moveToProductionMode,
      refreshEncryptionServerForTrialUsers: refreshEncryptionServerForTrialUsers,
      upgradeCluster: upgradeCluster,
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

    // TODO: the below 2 functions could be removed when HDS is stable
    function getHdsTrialUsersGroup(oid) {
      var serviceUrl = _.replace(UrlConfig.getScimUrl(oid), 'Users', 'Groups');
      return $http.get(serviceUrl).then(extractData);
    }

    function createHdsTrialUsersTestGroup(oid) {
      var serviceUrl = _.replace(UrlConfig.getScimUrl(oid), 'Users', 'Groups');
      var json = {
        "schemas": ["urn:scim:schemas:core:1.0", "urn:scim:schemas:extension:cisco:commonidentity:1.0"],
        "displayName": "HDS Test Group",
        "members": [
          {
            "value": "4c93e416-ad47-4d3b-b63e-1a4bfa40a2a2",
          },
        ],
      };
      return $http.post(serviceUrl, json).then(extractData);
    }

    function getHdsTrialUserGroupID() {
      var deferred = $q.defer();
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
      });
      return deferred.promise;
    }

    function queryUser(oid, email) {
      var serviceUrl = UrlConfig.getScimUrl(oid) + '?filter=username eq "' + email + '"';
      return $http.get(serviceUrl).then(extractData);
    }

    function queryUsers(oid, emails) {
      var serviceUrl = UrlConfig.getScimUrl(oid);
      serviceUrl += '?filter=' + _.chain(emails)
        .map(function (email) {
          return 'username eq "' + email.text + '"';
        })
        .join(' or ')
        .value();
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
            operation: "delete",
          };
        }),
      };
      return $http.patch(serviceUrl, json).then(extractData);
    }

    function replaceHdsTrialUsers(oid, jsonMembers) {
      var serviceUrl = _.replace(UrlConfig.getScimUrl(oid) + '/' + trialUserGroupId, 'Users', 'Groups');
      return $http.patch(serviceUrl, jsonMembers).then(extractData);
    }

    function moveToProductionMode(oid) {
      var serviceUrl = UrlConfig.getAdminServiceUrl() + '/organizations/' + oid + '/settings/altHdsServers';
      return $http.delete(serviceUrl);
    }

    function refreshEncryptionServerForTrialUsers(gid) {
      var serviceUrl = UrlConfig.getHybridEncryptionServiceUrl() + '/flushTrialUserGroupCache/' + gid;
      return $http.post(serviceUrl).then(extractData);
    }

    function extractData(response) {
      return response.data;
    }

    function upgradeCluster(id) {
      var connectorType = 'hds_app';
      var url = UrlConfig.getHerculesUrlV2() + '/organizations/' + Authinfo.getOrgId() + '/clusters/' + id + '/provisioning/actions/update/invoke?connectorType=' + connectorType + '&forced=true';
      return $http.post(url);
    }
  }
}());
