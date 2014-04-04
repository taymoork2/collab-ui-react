'use strict';

angular.module('wx2AdminWebClientApp')
  .service('UserListService', ['$http', '$rootScope', '$location', 'Storage', 'Config', 'Authinfo',
    function($http, $rootScope, $location, Storage, Config, Authinfo) {

      var token = Storage.get('accessToken');
      var scimUrl = Config.scimUrl + '?filter=entitlements%20eq%20%22webex-squared%22&sortBy=name&sortOrder=ascending&attributes=name,userName';
      var scimSearchUrl = Config.scimUrl + '?filter=entitlements%20eq%20%22webex-squared%22%20and%20(userName%20%20sw%20%22%s%22%20or%20name.givenName%20sw%20%22%s%22%20or%20name.familyName%20sw%20%22%s%22)&sortBy=name&sortOrder=ascending&attributes=name,userName';

      function sprintf(template, values) {
        return template.replace(/%s/g, function() {
          return values.shift();
        });
      }

      return {
  
        listUsers: function(startIndex, count, callback) {

          var listUrl = sprintf(scimUrl, [Authinfo.getOrgId()]);
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

        },

        searchUsers: function(searchStr, startIndex, count, callback) {

          var searchUrl = sprintf(scimSearchUrl, [Authinfo.getOrgId(), searchStr, searchStr, searchStr]);
          if (startIndex && startIndex > 0) {
            searchUrl = searchUrl + '&startIndex=' + startIndex;
          }

          if (count && count > 0) {
            searchUrl = searchUrl + '&count=' + count;
          }

          $http.defaults.headers.common.Authorization = 'Bearer ' + token;
          $http.get(searchUrl)
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
