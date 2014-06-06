'use strict';
/* global $ */

angular.module('wx2AdminWebClientApp')
  .service('UserListService', ['$http', '$rootScope', '$location', 'Storage', 'Config', 'Authinfo', 'Log', 'Utils', '$q', '$filter', '$compile',
    function($http, $rootScope, $location, Storage, Config, Authinfo, Log, Utils, $q, $filter, $compile) {

      var token = Storage.get('accessToken');
      var searchfilter = 'filter=userName%20sw%20%22%s%22%20or%20name.givenName%20sw%20%22%s%22%20or%20name.familyName%20sw%20%22%s%22';
      var attributes = 'attributes=name,userName,entitlements';
      var scimUrl = Config.scimUrl + '?' + '&' + attributes;

      var userlistservice = {

        listUsers: function(startIndex, count, sortBy, sortOrder, callback, entitlement) {

          var listUrl = Utils.sprintf(scimUrl, [Authinfo.getOrgId()]);
          var searchStr;
          var filter;
          var scimSearchUrl = null;
          var encodedSearchStr = '';

          if (typeof entitlement !== 'undefined' && entitlement !== null && $rootScope.searchStr !== '' && typeof($rootScope.searchStr) !== 'undefined') {
            //It seems CI does not support 'ANDing' filters in this situation.
            filter = searchfilter + '%20and%20entitlements%20eq%20%22' + window.encodeURIComponent(entitlement) + '%22';
            scimSearchUrl = Config.scimUrl + '?' + filter + '&' + attributes;
            encodedSearchStr = window.encodeURIComponent($rootScope.searchStr);
            listUrl = Utils.sprintf(scimSearchUrl, [Authinfo.getOrgId(), encodedSearchStr, encodedSearchStr, encodedSearchStr]);
            searchStr = $rootScope.searchStr;
          } else if ($rootScope.searchStr !== '' && typeof($rootScope.searchStr) !== 'undefined') {
            filter = searchfilter;
            scimSearchUrl = Config.scimUrl + '?' + filter + '&' + attributes;
            encodedSearchStr = window.encodeURIComponent($rootScope.searchStr);
            listUrl = Utils.sprintf(scimSearchUrl, [Authinfo.getOrgId(), encodedSearchStr, encodedSearchStr, encodedSearchStr]);
            searchStr = $rootScope.searchStr;
          } else if (typeof entitlement !== 'undefined' && entitlement !== null) {
            filter = 'filter=entitlements%20eq%20%22' + window.encodeURIComponent(entitlement) + '%22';
            scimSearchUrl = Config.scimUrl + '?' + filter + '&' + attributes;
            listUrl = Utils.sprintf(scimSearchUrl, [Authinfo.getOrgId()]);
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

          $http.defaults.headers.common.Authorization = 'Bearer ' + token;
          $http.get(listUrl)
            .success(function(data, status) {
              data.success = true;
              Log.debug('Callback with search=' + searchStr);
              callback(data, status, searchStr);
            })
            .error(function(data, status) {
              data.success = false;
              data.status = status;
              callback(data, status, searchStr);
            });
        },

        exportCSV: function(scope) {
          var deferred = $q.defer();
          var users = [];
          var page = 0;
          var exportedUsers = [];

          var getUsersBatch = function(startIndex) {
            userlistservice.listUsers(startIndex, 0, 'userName', 'ascending', function(data, status) {
              if (data.success) {
                users = users.concat(data.Resources);
                page++;
                getUsersBatch(page * 1000 + 1);
              } else if (status === 500) {
                Log.debug('No more users to return. Exporting to file... ');
                $('#export-icon').html('<i class=\'fa fa-file-text\'></i>');
                $compile(angular.element('#global-export-btn').html($filter('translate')('orgsPage.exportBtn')))(scope);
                $rootScope.exporting = false;
                $rootScope.$broadcast('EXPORT_FINISHED');
                if(scope.exportBtn){
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
            }, 'webex-squared');
          };

          $('#export-icon').html('<i class=\'fa fa-refresh fa-spin\'></i>');
          $compile(angular.element('#global-export-btn').html($filter('translate')('orgsPage.loadingMsg')))(scope);
          $rootScope.exporting = true;
          if(scope.exportBtn){
            scope.exportBtn.disabled = true;
            $('#btncover').show();
          }

          getUsersBatch(1);
          return deferred.promise;
        }
      };

      return userlistservice;

    }
  ]);
