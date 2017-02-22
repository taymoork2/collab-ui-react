(function () {
  'use strict';

  angular
    .module('HDS')
    .service('HDSService', HDSService);

  /* @ngInject */
  function HDSService($http, $q, Orgservice, UrlConfig) {
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
      getOrgHdsInfo();
      return trialUserGroupId;
    }

    function getOrgHdsInfo() {
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
          }
        }
      });
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

    function getHdsTrialUsers(oid) {
      if (trialUserGroupId.length < 1) {
        getOrgHdsInfo();
      }
      var serviceUrl = _.replace(UrlConfig.getScimUrl(oid) + '/' + trialUserGroupId, 'Users', 'Groups');
      return $http.get(serviceUrl).then(extractData);
    }

    function addHdsTrialUsers(oid, jsonMembers) {
      if (trialUserGroupId.length < 1) {
        getOrgHdsInfo();
      }
      var serviceUrl = _.replace(UrlConfig.getScimUrl(oid) + '/' + trialUserGroupId, 'Users', 'Groups');
      return $http.patch(serviceUrl, jsonMembers).then(extractData);
    }

    function removeHdsTrialUsers(oid, uids) {
      if (trialUserGroupId.length < 1) {
        getOrgHdsInfo();
      }
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
      if (trialUserGroupId.length < 1) {
        getOrgHdsInfo();
      }
      var serviceUrl = _.replace(UrlConfig.getScimUrl(oid) + '/' + trialUserGroupId, 'Users', 'Groups');
      return $http.patch(serviceUrl, jsonMembers).then(extractData);
    }

    function extractData(response) {
      return response.data;
    }
  }
}());
