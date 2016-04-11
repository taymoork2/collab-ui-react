(function () {
  'use strict';

  /* global Uint8Array:false */

  angular
    .module('Core')
    .factory('UserListService', UserListService);

  /* @ngInject */
  function UserListService($http, $rootScope, $location, $q, $filter, $compile, $timeout, $translate, Storage, Config, Authinfo, Log, Utils, Auth, pako, $resource, UrlConfig) {
    var searchFilter = 'filter=active%20eq%20true%20and%20userName%20sw%20%22%s%22%20or%20name.givenName%20sw%20%22%s%22%20or%20name.familyName%20sw%20%22%s%22%20or%20displayName%20sw%20%22%s%22';
    var attributes = 'attributes=name,userName,userStatus,entitlements,displayName,photos,roles,active,trainSiteNames,licenseID';
    var scimUrl = UrlConfig.getScimUrl(Authinfo.getOrgId()) + '?' + '&' + attributes;
    // Get last 7 day user counts
    var userCountResource = $resource(UrlConfig.getAdminServiceUrl() + 'organization/' + Authinfo.getOrgId() + '/reports/detailed/activeUsers?&intervalCount=7&intervalType=day&spanCount=1&spanType=day');

    var service = {
      listUsers: listUsers,
      generateUserReports: generateUserReports,
      getUserReports: getUserReports,
      extractUsers: extractUsers,
      exportCSV: exportCSV,
      listPartners: listPartners,
      listPartnersAsPromise: listPartnersAsPromise,
      getUserCount: getUserCount
    };

    return service;

    ////////////////

    function listUsers(startIndex, count, sortBy, sortOrder, callback, searchStr, getAdmins) {
      var listUrl = scimUrl;
      var filter;
      var entitlement;
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
        if (typeof entitlement !== 'undefined' && entitlement !== null && searchStr !== '' && typeof (searchStr) !== 'undefined') {
          //It seems CI does not support 'ANDing' filters in this situation.
          filter = searchFilter + '%20and%20entitlements%20eq%20%22' + window.encodeURIComponent(entitlement) + '%22';
          scimSearchUrl = UrlConfig.getScimUrl(Authinfo.getOrgId()) + '?' + filter + '&' + attributes;
          encodedSearchStr = window.encodeURIComponent(searchStr);
          listUrl = Utils.sprintf(scimSearchUrl, [encodedSearchStr, encodedSearchStr, encodedSearchStr, encodedSearchStr]);
          searchStr = searchStr;
        } else if (searchStr !== '' && typeof (searchStr) !== 'undefined') {
          filter = searchFilter;
          scimSearchUrl = UrlConfig.getScimUrl(Authinfo.getOrgId()) + '?' + filter + '&' + attributes;
          encodedSearchStr = window.encodeURIComponent(searchStr);
          listUrl = Utils.sprintf(scimSearchUrl, [encodedSearchStr, encodedSearchStr, encodedSearchStr, encodedSearchStr]);

        } else if (typeof entitlement !== 'undefined' && entitlement !== null) {
          filter = 'filter=active%20eq%20%true%20and%20entitlements%20eq%20%22' + window.encodeURIComponent(entitlement);
          scimSearchUrl = UrlConfig.getScimUrl(Authinfo.getOrgId()) + '?' + filter + '&' + attributes;
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

      $http.get(listUrl)
        .success(function (data, status) {
          data = data || {};
          data.success = true;
          Log.debug('Callback with search=' + searchStr);
          callback(data, status, searchStr);
        })
        .error(function (data, status) {
          data = data || {};
          data.success = false;
          data.status = status;
          callback(data, status, searchStr);
          var description = null;
          var errors = data.Errors;
          if (errors) {
            description = errors[0].description;
          }
        });
    }

    // Call user reports REST api to request a user report be generated.
    function generateUserReports(sortBy, callback) {
      var generateUserReportsUrl = UrlConfig.getUserReportsUrl(Authinfo.getOrgId());
      var requestData = {
        "sortedBy": [sortBy],
        "attributes": ["name", "displayName", "userName", "active"]
      };

      $http({
          method: 'POST',
          url: generateUserReportsUrl,
          data: requestData
        })
        .success(function (data, status) {
          data = data || {};
          data.success = true;
          Log.debug('UserListService.generateUserReport - executing callback...');
          callback(data, status);
        })
        .error(function (data, status) {
          data = data || {};
          data.success = false;
          data.status = status;
          callback(data, status);
        });
    }

    // Call user reports rest api to get the user report data based on the report id from the
    // generate user report request.
    function getUserReports(userReportsID, callback) {
      var userReportsUrl = UrlConfig.getUserReportsUrl(Authinfo.getOrgId()) + '/' + userReportsID;

      $http.get(userReportsUrl)
        .success(function (data, status) {
          if (data.status !== 'success') {
            // Set 3 second delay to limit the amount times we
            // continually hit the user reports REST api.
            $timeout(function () {
              getUserReports(userReportsID, callback);
            }, 3000);
          } else {
            data = data || {};
            data.success = true;
            Log.debug('UserListService.getUserReport - executing callback...');
            callback(data, status);
            // delete the cached report, so that the next one will be fresh.
            $http.delete(userReportsUrl);
          }
        })
        .error(function (data, status) {
          data = data || {};
          data.success = false;
          data.status = status;
          callback(data, status);
        });
    }

    // Extract users from userReportData where it has been GZIP compressed
    // and then Base64 encoded. Also, apply appropriate filters to the list
    // of users.
    function extractUsers(userReportData, entitlementFilter) {
      // Workaround atob issue (InvalidCharacterError: DOM Exception 5
      // atob@[native code]) for Safari browser on how it handles
      // base64 encoded text string by removing all the whitespaces.
      userReportData = userReportData.replace(/\s/g, '');

      // Decode base64 (convert ascii phbinary)
      var binData = atob(userReportData);

      // Convert binary string to character-number array
      var charData = binData.split('').map(function (x) {
        return x.charCodeAt(0);
      });

      // Turn number array into byte-array
      var byteData = new Uint8Array(charData);

      // Pako magic
      var userReport = pako.inflate(byteData, {
        to: 'string'
      });

      // Filtering user report
      var users = _.filter(JSON.parse(userReport), {
        active: true
      });
      if (entitlementFilter) {
        users = _.filter(users, {
          roles: ['id_full_admin']
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
                header.firstName = "First Name";
                header.lastName = "Last Name";
                header.displayName = "Display Name";
                header.email = "User ID/Email (Required)";
                exportedUsers.push(header);

                //formatting the data for export
                for (var i = 0; i < users.length; i++) {
                  var exportedUser = {};
                  exportedUser.firstName = (users[i].name && users[i].name.givenName) ? users[i].name.givenName : '';
                  exportedUser.lastName = (users[i].name && users[i].name.familyName) ? users[i].name.familyName : '';
                  exportedUser.displayName = users[i].displayName || '';
                  exportedUser.email = users[i].userName;
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
      var deferred = $q.defer();
      userCountResource.get().$promise.then(function (response) {
        var count = -1;
        if (_.isArray(response.data[0].data)) {
          count = _.chain(response.data[0].data)
            .dropRightWhile(function (d) { // skip '0' count
              return d.details.totalRegisteredUsers === '0';
            })
            .last()
            .get('details.totalRegisteredUsers')
            .parseInt()
            .value();
        }
        deferred.resolve(count);
      }).catch(function () {
        deferred.reject();
      });
      return deferred.promise;
    }

    // TODO: rm this after replacing all instances of usage to listPartnersAsPromise
    function listPartners(orgId, callback) {

      var adminUrl = UrlConfig.getAdminServiceUrl() + 'organization/' + orgId + '/users/partneradmins';

      $http.get(adminUrl)
        .success(function (data, status) {
          data = data || {};
          data.success = true;
          callback(data, status);
        })
        .error(function (data, status) {
          data = data || {};
          data.success = false;
          data.status = status;
          callback(data, status);
          var description = null;
          var errors = data.Errors;
          if (errors) {
            description = errors[0].description;
          }
        });
    }

    // TODO: revisit after graduation, consider:
    // - simply unpacking the 'data' property on success
    function listPartnersAsPromise(orgId) {

      var adminUrl = UrlConfig.getAdminServiceUrl() + 'organization/' + orgId + '/users/partneradmins';

      return $http.get(adminUrl)
        .catch(function (data, status) {
          data = _.extend({}, data, {
            success: false,
            status: status
          });
          return $q.reject(data);
        })
        .then(function (data, status) {
          data = _.extend({}, data, {
            success: true,
            status: status
          });
          return data;
        });
    }
  }
})();
