'use strict';

angular.module('wx2AdminWebClientApp')
  .service('UserListService', ['$http', '$rootScope', '$location', 'Storage', 'Config', 'Authinfo',
    function($http, $rootScope, $location, Storage, Config, Authinfo) {

      var token = Storage.get('accessToken');
      var filter = 'filter=userName%20sw%20%22%s%22%20or%20name.givenName%20sw%20%22%s%22%20or%20name.familyName%20sw%20%22%s%22';
      var attributes = 'attributes=name,userName,entitlements';
      var scimUrl = Config.scimUrl + '?' + '&' + attributes;
      var scimSearchUrl = Config.scimUrl + '?' + filter + '&' + attributes;

      function sprintf(template, values) {
        return template.replace(/%s/g, function() {
          return values.shift();
        });
      }

      return {

        listUsers: function(startIndex, count, sortBy, sortOrder, callback) {

          var listUrl = sprintf(scimUrl, [Authinfo.getOrgId()]);

          if ($rootScope.searchStr !== '' && typeof($rootScope.searchStr) !== 'undefined') {
            var encodedSearchStr = window.encodeURIComponent($rootScope.searchStr);
            listUrl = sprintf(scimSearchUrl, [Authinfo.getOrgId(), encodedSearchStr, encodedSearchStr, encodedSearchStr]);
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
              callback(data, status);
            })
            .error(function(data, status) {
              data.success = false;
              data.status = status;
              callback(data, status);
            });

        }
      };


    }
  ]);
