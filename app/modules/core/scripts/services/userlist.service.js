(function () {
  'use strict';
  /* global $ */

  angular
    .module('Core')
    .factory('UserListService', UserListService);

  /* @ngInject */
  function UserListService($http, $rootScope, $location, $q, $filter, $compile, Storage, Config, Authinfo, Log, Utils, Auth) {
    var searchFilter = 'filter=active%20eq%20true%20and%20userName%20sw%20%22%s%22%20or%20name.givenName%20sw%20%22%s%22%20or%20name.familyName%20sw%20%22%s%22';
    var attributes = 'attributes=name,userName,userStatus,entitlements,displayName,photos,roles,active,trainSiteNames,licenseID';
    var scimUrl = Config.getScimUrl(Authinfo.getOrgId()) + '?' + '&' + attributes;
    var ciscoOrgId = '1eb65fdf-9643-417f-9974-ad72cae0e10f';

    var service = {
      'listUsers': listUsers,
      'exportCSV': exportCSV,
      'listPartners': listPartners,
      'getUser': getUser
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
        listUrl = listUrl + '&filter=active%20eq%20true';
      }

      if (!getAdmins) {
        if (typeof entitlement !== 'undefined' && entitlement !== null && searchStr !== '' && typeof (searchStr) !== 'undefined') {
          //It seems CI does not support 'ANDing' filters in this situation.
          filter = searchFilter + '%20and%20entitlements%20eq%20%22' + window.encodeURIComponent(entitlement) + '%22';
          scimSearchUrl = Config.getScimUrl(Authinfo.getOrgId()) + '?' + filter + '&' + attributes;
          encodedSearchStr = window.encodeURIComponent(searchStr);
          listUrl = Utils.sprintf(scimSearchUrl, [encodedSearchStr, encodedSearchStr, encodedSearchStr]);
          searchStr = searchStr;
        } else if (searchStr !== '' && typeof (searchStr) !== 'undefined') {
          filter = searchFilter;
          scimSearchUrl = Config.getScimUrl(Authinfo.getOrgId()) + '?' + filter + '&' + attributes;
          encodedSearchStr = window.encodeURIComponent(searchStr);
          listUrl = Utils.sprintf(scimSearchUrl, [encodedSearchStr, encodedSearchStr, encodedSearchStr]);

        } else if (typeof entitlement !== 'undefined' && entitlement !== null) {
          filter = 'filter=active%20eq%20%true%20and%20entitlements%20eq%20%22' + window.encodeURIComponent(entitlement);
          scimSearchUrl = Config.getScimUrl(Authinfo.getOrgId()) + '?' + filter + '&' + attributes;
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
          // var activeUsers = [];
          // for (var i = 0; i < data.Resources.length; i++) {
          //   if (data.Resources[i].active === true) {
          //     activeUsers.push(data.Resources[i]);
          //   }
          // }
          // data.Resources = activeUsers;
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

    function exportCSV(scope) {
      var searchStr = '';
      var deferred = $q.defer();
      var users = [];
      var page = 0;
      var exportedUsers = [];

      var getUsersBatch = function (startIndex) {
        var entitlementFilter = '';
        if (scope.activeFilter === 'administrators') {
          entitlementFilter = 'webex-squared';
        }
        listUsers(startIndex, 0, 'userName', 'ascending', function (data, status) {
          if (data.success && data.Resources.length > 0) {
            users = users.concat(data.Resources);
            page++;
            getUsersBatch(page * 1000 + 1);
          } else if (status === 500 || data.Resources.length <= 0) {
            Log.debug('No more users to return. Exporting to file... ');
            $('#export-icon').html('<i class=\'icon icon-content-share\'></i>');
            $compile(angular.element('#global-export-btn').html($filter('translate')('organizationsPage.exportBtn')))(scope);
            $rootScope.exporting = false;
            $rootScope.$broadcast('EXPORT_FINISHED');
            if (scope.exportBtn) {
              $('#btncover').hide();
            }

            if (users.length === 0) {
              Log.debug('No users found.');
              return;
            }
            //formatting the data for export
            for (var i = 0; i < users.length; i++) {
              var exportedUser = {};
              var entitlements = '';
              exportedUser.userName = users[i].userName;
              if (users[i].hasOwnProperty('name') && users[i].name.familyName !== '' && users[i].name.givenName !== '') {
                exportedUser.name = users[i].name.givenName + ' ' + users[i].name.familyName;
              } else {
                exportedUser.name = 'N/A';
              }
              for (var entitlement in users[i].entitlements) {
                entitlements += users[i].entitlements[entitlement] + ' ';
              }
              exportedUser.entitlements = entitlements;
              exportedUsers.push(exportedUser);
            }
            deferred.resolve(exportedUsers);
          } else {
            Log.debug('Exporting users failed. Status ' + status);
            deferred.reject('Exporting users failed. Status ' + status);
          }
        }, searchStr, entitlementFilter);
      };

      $('#export-icon').html('<i class=\'icon icon-spinner\'></i>');
      $compile(angular.element('#global-export-btn').html($filter('translate')('organizationsPage.loadingMsg')))(scope);
      $rootScope.exporting = true;
      if (scope.exportBtn) {
        scope.exportBtn.disabled = true;
        $('#btncover').show();
      }

      getUsersBatch(1);
      return deferred.promise;
    }

    function listPartners(orgId, callback) {

      var adminUrl = Config.getAdminServiceUrl() + 'organization/' + orgId + '/users/partneradmins';

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

    function getUser(searchinput, callback) {
      var filter = 'filter=userName%20eq%20%22' + window.encodeURIComponent(searchinput) + '%22';
      var scimSearchUrl = Config.getScimUrl(Authinfo.getOrgId()) + '?' + filter + '&' + attributes;
      var getUserUrl = scimSearchUrl;

      $http.get(getUserUrl)
        .success(function (data, status) {
          data = data || {};
          data.success = true;
          Log.debug('Retrieved user successfully.');
          callback(data, status);
        })
        .error(function (data, status) {
          data = data || {};
          data.success = false;
          data.status = status;
          callback(data, status);
        });
    }
  }
})();
