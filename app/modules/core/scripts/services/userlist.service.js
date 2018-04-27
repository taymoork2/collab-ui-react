(function () {
  'use strict';

  /* global Uint8Array:false */

  module.exports = angular.module('core.userlist', [
    require('angular-resource'),
    require('modules/core/scripts/services/authinfo'),
    require('modules/core/scripts/services/log'),
    require('modules/core/notifications').default,
    require('modules/core/scripts/services/utils'),
    require('modules/core/config/urlConfig'),
  ])
    .service('UserListService', UserListService)
    .name;

  /* @ngInject */
  function UserListService($http, $q, $resource, $rootScope, $timeout, $window, Authinfo, Config, Log, Notification, Utils, UrlConfig) {
    // DEPRECATED
    // - remove these vars after all calls to 'listUsers()' has been migrated to 'listUsersAsPromise()'
    var searchFilter = 'filter=active%20eq%20true%20and%20%s(userName%20sw%20%22%s%22%20or%20name.givenName%20sw%20%22%s%22%20or%20name.familyName%20sw%20%22%s%22%20or%20displayName%20sw%20%22%s%22)';
    var attributes = 'attributes=name,userName,userStatus,entitlements,displayName,photos,roles,active,trainSiteNames,linkedTrainSiteNames,licenseID,userSettings,userPreferences';
    var attributesForHybridOrg = 'attributes=name,userName,userStatus,entitlements,displayName,photos,roles,active,trainSiteNames,linkedTrainSiteNames,licenseID,userSettings,userPreferences,phoneNumbers,sipAddresses';

    // Get last 7 day user counts
    var userCountResource = $resource(UrlConfig.getAdminServiceUrl() + 'organization/' + Authinfo.getOrgId() + '/reports/detailed/activeUsers?&intervalCount=7&intervalType=day&spanCount=1&spanType=day');
    var pako = require('pako');

    var CI_QUERY = {
      ACTIVE_EQ_TRUE: 'active eq true',
      DEFAULT_ATTRS: 'name,userName,userStatus,entitlements,displayName,photos,roles,active,trainSiteNames,linkedTrainSiteNames,licenseID,userSettings,userPreferences',

      // US8552: For organizations with too many users, don't load the user list
      // searching a large org with too few characters 'xz' triggers an useful error.
      DISPLAYNAME_SW_XZ: 'displayName sw "xz"',
    };

    var service = {
      listUsers: listUsers,
      listUsersAsPromise: listUsersAsPromise,
      listNonAdminUsers: listNonAdminUsers,
      listFullAdminUsers: listFullAdminUsers,
      generateUserReports: generateUserReports,
      getUserReports: getUserReports,
      extractUsers: extractUsers,
      exportCSV: exportCSV,
      listPartners: listPartners,
      listPartnersAsPromise: listPartnersAsPromise,
      getUserCount: getUserCount,
      queryUser: queryUser,
      _helpers: {
        mkAttrEqValsExpr: mkAttrEqValsExpr,
        mkAttrsSwValExpr: mkAttrsSwValExpr,
        mkAttrsFilterExpr: mkAttrsFilterExpr,
        mkEntitlementsExpr: mkEntitlementsExpr,
        mkRolesExpr: mkRolesExpr,
        mkNameStartsWithExpr: mkNameStartsWithExpr,
        mkFilterExpr: mkFilterExpr,
      },
    };

    return service;

    ////////////////

    function mkAttrEqValsExpr(attrName, matchVals, booleanOp) {
      if (!attrName || !matchVals) {
        return;
      }

      // convert to array if arg is provided as a string (ie. a single value)
      matchVals = _.isString(matchVals) ? [matchVals] : matchVals;

      // default to using 'and' as the boolean operator when joining multiple expressions
      booleanOp = booleanOp || 'and';

      // make a list of expressions for each value
      // e.g. attribute name of 'foo' and match val of ['bar']
      //   => ['foo eq "bar"']
      // e.g. attribute name of 'foo' and match vals of ['a', 'b']
      //   => ['foo eq "a"', 'foo eq "b"']
      var exprList = _.map(matchVals, function (matchVal) {
        return attrName + ' eq "' + matchVal + '"';
      });

      // combine all expressions back into a single one
      // e.g. attribute name of 'foo' and match val of ['bar']
      //   => '(foo eq "bar")'
      // e.g. attribute name of 'foo' and match vals of ['a', 'b']
      //   => '(foo eq "a" and foo eq "b")'
      return '(' + exprList.join(' ' + booleanOp + ' ') + ')';
    }

    function mkAttrsFilterExpr(attrNames, searchStr, filterOp, booleanOp) {
      if (!attrNames || !searchStr) {
        return;
      }

      // convert to array if arg is provided as a string (ie. a single value)
      attrNames = _.isString(attrNames) ? [attrNames] : attrNames;

      // default to using 'sw' (starts with) as the filter operator
      filterOp = filterOp || 'sw';

      // default to using 'or' as the boolean operator when joining multiple expressions
      booleanOp = booleanOp || 'or';

      // make a list of expressions for each attribute name
      // e.g. attribute name of 'foo' and search value of 'bar'
      //   => ['foo sw "bar"']
      // e.g. attribute names of ['a', 'b'] and search value of 'bar'
      //   => ['a sw "bar"', 'b sw "bar"']
      var exprList = _.map(attrNames, function (attrName) {
        return attrName + ' ' + filterOp + ' "' + searchStr + '"';
      });

      // combine all expressions back into a single one
      // e.g. attribute name of 'foo' and search value of 'bar'
      //   => '(foo sw "bar")'
      // e.g. attribute names of ['a', 'b'] and search value of 'bar'
      //   => '('a' sw "bar" or b sw "bar")'
      return '(' + exprList.join(' ' + booleanOp + ' ') + ')';
    }

    function mkAttrsSwValExpr(attrNames, searchStr) {
      return service._helpers.mkAttrsFilterExpr(attrNames, searchStr, 'sw', 'or');
    }

    function mkEntitlementsExpr(entitlements) {
      return service._helpers.mkAttrEqValsExpr('entitlements', entitlements);
    }

    function mkRolesExpr(roles) {
      return service._helpers.mkAttrEqValsExpr('roles', roles);
    }

    function mkNameStartsWithExpr(searchStr) {
      return service._helpers.mkAttrsSwValExpr(['userName', 'name.givenName', 'name.familyName', 'displayName'], searchStr);
    }

    /**
     * Helper function for combining multiple CI query expressions into one.
     *
     * @param {string} filterParams.nameStartsWith - prefix substring to search for in any name attribute
     * @param {(string|string[])} filterParams.allEntitlements - single entitlement (e.g. 'ciscouc'), or list of
     *   entitlements that must ALL be present (e.g. ['ciscouc', 'spark'])
     * @param {(string|string[])} filterParams.allRoles - single role (e.g. 'id_full_admin'), or list of roles that must
     *   ALL be present (e.g. ['id_user_admin', 'id_readonly_admin'])
     * @param {string} filterParams.useUnboundedResultsHack - set to true if needing to include
     *   CI_QUERY.DISPLAYNAME_SW_XZ expression by default in the final expression (not included though, if a search
     *   string of length > 1 is present)
     * @return {string} - combined CI query expressing (each expression combined using 'and')
     */
    function mkFilterExpr(filterParams) {
      var exprList;
      var defaultExpr = CI_QUERY.ACTIVE_EQ_TRUE;

      var nameStartsWith = _.get(filterParams, 'nameStartsWith');
      var allRoles = _.get(filterParams, 'allRoles');
      var allEntitlements = _.get(filterParams, 'allEntitlements');
      var useUnboundedResultsHack = _.get(filterParams, 'useUnboundedResultsHack');

      var isAdequateSearchStr = nameStartsWith && nameStartsWith.length > 1;

      // append hack when option is enabled and no valid search string is present
      if (useUnboundedResultsHack && !isAdequateSearchStr) {
        defaultExpr = defaultExpr + ' or ' + CI_QUERY.DISPLAYNAME_SW_XZ;
      }
      exprList = [defaultExpr];

      if (nameStartsWith && isAdequateSearchStr) {
        exprList.push(mkNameStartsWithExpr(nameStartsWith));
      }

      if (allRoles) {
        exprList.push(mkRolesExpr(allRoles));
      }

      if (allEntitlements) {
        exprList.push(mkEntitlementsExpr(allEntitlements));
      }

      return exprList.join(' and ');
    }

    function queryUser(searchEmail) {
      return listUsers(0, 1, null, null, _.noop, searchEmail, false)
        .then(function (response) {
          var user = _.get(response, 'data.Resources[0]');
          return user || $q.reject('Not found');
        });
    }

    /**
     * Fetch users from CI using query parameters.
     *
     * @param {(string|number)} params.orgId - org id of users to search for (default: logged-in user's org id)
     * @param {Object} params.filter - params object passed through to 'mkFilterExpr()'
     * @param {Object} params.ci - params object passed through to the underlying '$http.get()' request
     * @param {Object} params.noErrorNotificationOnReject - set to true to prevent error notification if '$http.get()' rejects
     * @see {@link mkFilterExpr}
     * @see {@link https://wiki.cisco.com/display/PLATFORM/CI3.0+SCIM+API+-+Query+Users}
     */
    function listUsersAsPromise(params) {
      var searchOrgId = _.get(params, 'orgId', Authinfo.getOrgId());
      var url = UrlConfig.getScimUrl(searchOrgId);

      // crunch 'filter.*' properties to make a proper filter expression, then set as 'ci.filter'
      var filterParams = _.get(params, 'filter');
      var filterExpr = service._helpers.mkFilterExpr(filterParams);
      _.set(params, 'ci.filter', filterExpr);

      // define 'ci.attributes' property
      _.set(params, 'ci.attributes', CI_QUERY.DEFAULT_ATTRS);

      return $http.get(url, {
        params: _.get(params, 'ci'),
      })
        .catch(function (response) {
          var useErrorNotification = !_.get(params, 'noErrorNotificationOnReject');
          if (useErrorNotification) {
            Notification.errorWithTrackingId(response, 'usersPage.loadError');
          }
          return $q.reject(response);
        });
    }

    function listNonAdminUsers(params, searchStr) {
      params = _.assignIn({}, params);
      _.set(params, 'filter.nameStartsWith', searchStr);
      _.set(params, 'filter.useUnboundedResultsHack', true);
      return service.listUsersAsPromise(params);
    }

    function listFullAdminUsers(params, searchStr) {
      params = _.assignIn({}, params);
      _.set(params, 'filter.nameStartsWith', searchStr);
      _.set(params, 'filter.allRoles', 'id_full_admin');
      return service.listUsersAsPromise(params);
    }

    // DEPRECATED
    // - update all callers of this method to use 'listUsersAsPromise()' instead, before removing
    //   this implementataion
    // - 'listUsersAsPromise()' can then assume this name after all callers use promise-style
    //   chaining
    function listUsers(startIndex, count, sortBy, sortOrder, callback, searchStr, getAdmins, entitlements, orgId, orgHasHybridEnabled) {
      if (orgHasHybridEnabled) {
        attributes = attributesForHybridOrg;
      }
      var searchOrgId = orgId || Authinfo.getOrgId();
      var listUrl = UrlConfig.getScimUrl(searchOrgId) + '?' + '&' + attributes;
      var filter;
      var scimSearchUrl = null;
      var encodedSearchStr = '';
      var adminFilter = '&filter=roles%20eq%20%22id_full_admin%22%20and%20active%20eq%20true';

      if (getAdmins && listUrl.indexOf(adminFilter) === -1) {
        listUrl = listUrl + adminFilter;
      } else {
        // US8552: For organizations with too many users, don't load the user list
        // searching a large org with too few characters 'xz' triggers an useful error.
        listUrl = listUrl + '&filter=active%20eq%20true%20or%20displayName%20sw%20%22xz%22';
      }

      if (!getAdmins) {
        if (typeof entitlements !== 'undefined' && entitlements !== null && searchStr !== '' && typeof (searchStr) !== 'undefined') {
          filter = searchFilter;
          scimSearchUrl = UrlConfig.getScimUrl(searchOrgId) + '?' + filter + '&' + attributes;
          var encodedEntitlementsStr = 'entitlements%20eq%20%22' + $window.encodeURIComponent(entitlements) + '%22%20and%20';
          encodedSearchStr = $window.encodeURIComponent(searchStr);
          listUrl = Utils.sprintf(scimSearchUrl, [encodedEntitlementsStr, encodedSearchStr, encodedSearchStr, encodedSearchStr, encodedSearchStr]);
        } else if (searchStr !== '' && typeof (searchStr) !== 'undefined') {
          filter = searchFilter;
          scimSearchUrl = UrlConfig.getScimUrl(searchOrgId) + '?' + filter + '&' + attributes;
          encodedSearchStr = $window.encodeURIComponent(searchStr);
          listUrl = Utils.sprintf(scimSearchUrl, ['', encodedSearchStr, encodedSearchStr, encodedSearchStr, encodedSearchStr]);
        } else if (typeof entitlements !== 'undefined' && entitlements !== null) {
          filter = 'filter=active%20eq%20true%20and%20entitlements%20eq%20%22' + $window.encodeURIComponent(entitlements) + '%22';
          scimSearchUrl = UrlConfig.getScimUrl(searchOrgId) + '?' + filter + '&' + attributes;
          listUrl = scimSearchUrl;
        }
      }

      if (startIndex && startIndex > 0) {
        listUrl = listUrl + '&startIndex=' + startIndex;
      }

      if (count && count > 0) {
        listUrl = listUrl + '&count=' + count;
      }

      if (sortBy && sortBy.length > 0) {
        listUrl = listUrl + '&sortBy=' + sortBy;
      }

      if (sortOrder && sortOrder.length > 0) {
        listUrl = listUrl + '&sortOrder=' + sortOrder;
      }

      return $http.get(listUrl)
        .then(function (response) {
          var data = response.data;
          data = _.isObject(data) ? data : {};
          data.success = true;
          Log.debug('Callback with search=' + searchStr);
          callback(data, response.status, searchStr, response);
          return response;
        })
        .catch(function (response) {
          var data = response.data;
          data = _.isObject(data) ? data : {};
          data.success = false;
          data.status = response.status;
          callback(data, response.status, searchStr, response);
          return $q.reject(response);
        });
    }

    // Call user reports REST api to request a user report be generated.
    function generateUserReports(sortBy, callback) {
      var generateUserReportsUrl = UrlConfig.getUserReportsUrl(Authinfo.getOrgId());
      var requestData = {
        sortedBy: [sortBy],
        attributes: ['name', 'displayName', 'userName', 'entitlements', 'active'],
      };
      $http({
        method: 'POST',
        url: generateUserReportsUrl,
        data: requestData,
      })
        .then(function (response) {
          var data = response.data;
          data = _.isObject(data) ? data : {};
          data.success = true;
          Log.debug('UserListService.generateUserReport - executing callback...');
          callback(data, response.status);
        })
        .catch(function (response) {
          var data = response.data;
          data = _.isObject(data) ? data : {};
          data.success = false;
          data.status = response.status;
          callback(data, response.status);
        });
    }

    // Call user reports rest api to get the user report data based on the report id from the
    // generate user report request.
    function getUserReports(userReportsID, callback) {
      var userReportsUrl = UrlConfig.getUserReportsUrl(Authinfo.getOrgId()) + '/' + userReportsID;
      //keep the user from being logged off for inactivity
      $rootScope.$emit(Config.idleTabKeepAliveEvent);

      $http.get(userReportsUrl)
        .then(function (response) {
          var data = response.data;
          if (data.status !== 'success') {
            // Set 3 second delay to limit the amount times we
            // continually hit the user reports REST api.
            $timeout(function () {
              getUserReports(userReportsID, callback);
            }, 3000);
          } else {
            data = _.isObject(data) ? data : {};
            data.success = true;
            Log.debug('UserListService.getUserReport - executing callback...');
            callback(data, response.status);
            // delete the cached report, so that the next one will be fresh.
            $http.delete(userReportsUrl);
          }
        })
        .catch(function (response) {
          var data = response.data;
          data = _.isObject(data) ? data : {};
          data.success = false;
          data.status = response.status;
          callback(data, response.status);
        });
    }

    // Extract users from userReportData where it has been GZIP compressed
    // and then Base64 encoded. Also, apply appropriate filters to the list
    // of users.
    function extractUsers(userReportData, entitlementFilter) {
      // Workaround atob issue (InvalidCharacterError: DOM Exception 5
      // atob@[native code]) for Safari browser on how it handles
      // base64 encoded text string by removing all the whitespaces.
      userReportData = _.replace(userReportData, /\s/g, '');

      // Decode base64 (convert ascii phbinary)
      var binData = $window.atob(userReportData);

      // Convert binary string to character-number array
      var charData = binData.split('').map(function (x) {
        return x.charCodeAt(0);
      });

      // Turn number array into byte-array
      var byteData = new Uint8Array(charData);

      // Pako magic
      var userReport = pako.inflate(byteData, {
        to: 'string',
      });

      // Filtering user report
      var users = _.filter(JSON.parse(userReport), {
        active: true,
      });
      if (entitlementFilter) {
        users = _.filter(users, {
          roles: ['id_full_admin'],
        });
      }

      return users;
    }

    // Return a list of users from calling the user reports REST
    // apis.
    function exportCSV(activeFilter) {
      var deferred = $q.defer();

      activeFilter = activeFilter || '';

      $rootScope.exporting = true;
      $rootScope.$broadcast('EXPORTING');

      var entitlementFilter = '';
      if (activeFilter === 'administrators') {
        entitlementFilter = 'webex-squared';
      }

      generateUserReports('userName', function (data, status) {
        if (data.success && data.id) {
          getUserReports(data.id, function (data, status) {
            if (data.success && data.report) {
              var users = extractUsers(data.report, entitlementFilter);
              var exportedUsers = [];
              if (users.length === 0) {
                Log.debug('No users found.');
              } else {
                // header line for CSV file
                var header = {};
                header.firstName = 'First Name';
                header.lastName = 'Last Name';
                header.displayName = 'Display Name';
                header.email = 'User ID/Email (Required)';
                header.entitlements = 'Entitlements';
                exportedUsers.push(header);

                //formatting the data for export
                for (var i = 0; i < users.length; i++) {
                  var exportedUser = {};
                  exportedUser.firstName = (users[i].name && users[i].name.givenName) ? users[i].name.givenName : '';
                  exportedUser.lastName = (users[i].name && users[i].name.familyName) ? users[i].name.familyName : '';
                  exportedUser.displayName = users[i].displayName || '';
                  exportedUser.email = users[i].userName;
                  exportedUser.entitlements = _.isArray(users[i].entitlements) ? users[i].entitlements.join(' ') : '';
                  exportedUsers.push(exportedUser);
                }
              }

              deferred.resolve(exportedUsers);
            } else {
              deferred.reject('Get user reports failed. Status ' + status);
            }
          });
        } else {
          deferred.reject('Generate user reports failed. Status ' + status);
        }
      });

      return deferred.promise;
    }

    function getUserCount() {
      return userCountResource.get().$promise
        .then(function (response) {
          var count = -1;
          if (_.isArray(_.get(response, 'data[0].data'))) {
            count = _.chain(response.data[0].data)
              .dropRightWhile(function (d) { // skip '0' count
                return d.details.totalRegisteredUsers == 0;
              })
              .last()
              .get('details.totalRegisteredUsers')
              .parseInt()
              .value();
          }
          return (_.isNaN(count) ? 0 : count);
        });
    }

    // TODO: rm this after replacing all instances of usage to listPartnersAsPromise
    function listPartners(orgId, callback) {
      var adminUrl = UrlConfig.getAdminServiceUrl() + 'organization/' + orgId + '/users/partneradmins';

      $http.get(adminUrl)
        .then(function (response) {
          var data = response.data;
          data = _.isObject(data) ? data : {};
          data.success = true;
          callback(data, response.status);
        })
        .catch(function (response) {
          var data = response.data;
          data = _.isObject(data) ? data : {};
          data.success = false;
          data.status = response.status;
          callback(data, response.status);
        });
    }

    // TODO: revisit after graduation, consider:
    // - simply unpacking the 'data' property on success
    function listPartnersAsPromise(orgId) {
      var adminUrl = UrlConfig.getAdminServiceUrl() + 'organization/' + orgId + '/users/partneradmins';

      return $http.get(adminUrl)
        .catch(function (response) {
          var data = response.data;
          data = _.extend({}, data, {
            success: false,
            status: response.status,
          });
          return $q.reject(data);
        })
        .then(function (response) {
          var data = response.data;
          data = _.extend({}, data, {
            success: true,
            status: response.status,
          });
          return data;
        });
    }
  }
})();
