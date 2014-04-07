'use strict';

angular.module('wx2AdminWebClientApp')
  .service('UserListService', ['$http', '$rootScope', '$location', 'Storage', 'Config', 'Authinfo',
    function($http, $rootScope, $location, Storage, Config, Authinfo) {

      var token = Storage.get('accessToken');
      var filter = 'filter=userName%20sw%20%22%s%22%20or%20name.givenName%20sw%20%22%s%22%20or%20name.familyName%20sw%20%22%s%22';
      var sortBy = 'sortBy=name';
      var sortOrder = 'sortOrder=ascending';
      var attributes = 'attributes=name,userName,entitlements';
      var scimUrl = Config.scimUrl + '?' + sortBy + '&' + sortOrder + '&' + attributes;
      var scimSearchUrl = Config.scimUrl + '?' + filter + '&' + sortBy + '&' + sortOrder + '&' + attributes;

      function sprintf(template, values) {
        return template.replace(/%s/g, function() {
          return values.shift();
        });
      }

      return {
  
        listUsers: function(startIndex, count, callback) {

          var listUrl = sprintf(scimUrl, [Authinfo.getOrgId()]);

          if ($rootScope.searchStr !== '' && typeof($rootScope.searchStr) !== 'undefined')
          {
            listUrl= sprintf(scimSearchUrl, [Authinfo.getOrgId(), $rootScope.searchStr, $rootScope.searchStr, $rootScope.searchStr]);
          }

          if (startIndex && startIndex > 0) {
            listUrl = listUrl + '&startIndex=' + startIndex;
          }

          if (count && count > 0) {
            listUrl = listUrl + '&count=' + count;
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
