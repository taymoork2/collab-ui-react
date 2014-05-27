'use strict';

angular.module('wx2AdminWebClientApp')
  .service('UserListService', ['$http', '$rootScope', '$location', 'Storage', 'Config', 'Authinfo', 'Log', 'Utils',
    function($http, $rootScope, $location, Storage, Config, Authinfo, Log, Utils) {

      var token = Storage.get('accessToken');
      var searchfilter = 'filter=userName%20sw%20%22%s%22%20or%20name.givenName%20sw%20%22%s%22%20or%20name.familyName%20sw%20%22%s%22';
      var attributes = 'attributes=name,userName,entitlements';
      var scimUrl = Config.scimUrl + '?' + '&' + attributes;

      return {

        listUsers: function(startIndex, count, sortBy, sortOrder, callback, entitlement) {

          var listUrl = Utils.sprintf(scimUrl, [Authinfo.getOrgId()]);
          var searchStr;
          var filter;
          var scimSearchUrl = null;
          var encodedSearchStr = '';

          if(typeof entitlement !== 'undefined' && entitlement !== null && $rootScope.searchStr !== '' && typeof($rootScope.searchStr) !== 'undefined'){
            //It seems CI does not support 'ANDing' filters in this situation.
            filter = searchfilter + '%20and%20entitlements%20eq%20%22' +  window.encodeURIComponent(entitlement) +'%22';
            scimSearchUrl = Config.scimUrl + '?' + filter + '&' + attributes;
            encodedSearchStr = window.encodeURIComponent($rootScope.searchStr);
            listUrl = Utils.sprintf(scimSearchUrl, [Authinfo.getOrgId(), encodedSearchStr, encodedSearchStr, encodedSearchStr]);
            searchStr = $rootScope.searchStr;
          } else if($rootScope.searchStr !== '' && typeof($rootScope.searchStr) !== 'undefined') {
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

        }
      };


    }
  ]);
