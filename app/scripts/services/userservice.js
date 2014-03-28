'use strict';

angular.module('wx2AdminWebClientApp')
  .service('Userservice', ['$http', '$rootScope', '$location', 'Storage', 'Config', 'Authinfo',
    function($http, $rootScope, $location, Storage, Config, Authinfo) {

      var userUrl = Config.adminServiceUrl;
      var token = Storage.get('accessToken');
      var scimUrl = Config.scimUrl;

      function sprintf(template, values) {
        return template.replace(/%s/g, function() {
          return values.shift();
        });
      }

      return {
        entitleUsers: function(usersDataArray, callback) {
          var userData = {
            'users': []
          };

          for (var i = 0; i < usersDataArray.length; i++) {
            var userEmail = usersDataArray[i].address.trim();
            var userName = usersDataArray[i].name.trim();
            var user = {
              'email': null,
              'name': null
            };

            if (userEmail.length > 0) {
              user.email = userEmail;
              if (userName.length > 0 && userName !== false) {
                user.name = userName;
              }
              userData.users.push(user);
            }
          }

          if (userData.users.length > 0) {
            $http.defaults.headers.common.Authorization = 'Bearer ' + token;
            $http.post(userUrl + 'user', userData)
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

        },

        addUsers: function(usersDataArray, callback) {
          var userData = {
            'users': []
          };

          for (var i = 0; i < usersDataArray.length; i++) {
            var userEmail = usersDataArray[i].address.trim();
            var userName = usersDataArray[i].name.trim();
            var user = {
              'email': null,
              'name': null
            };
            if (userEmail.length > 0) {
              user.email = userEmail;
              if (userName.length > 0 && userName !== false) {
                user.name = userName;
              }
              userData.users.push(user);
            }
          }

          if (userData.users.length > 0) {
            $http.defaults.headers.common.Authorization = 'Bearer ' + token;
            $http.put(userUrl + 'user', userData)
              .success(function(data, status) {
                data.success = true;
                callback(data, status);
              })
              .error(function(data, status) {
                data.success = false;
                data.status = status;
                callback(data, status);
              });
          } else {
            callback('No valid emails entered.');
          }
        },

        listUsers: function(startIdx, count, callback) {

          var listUrl = sprintf(scimUrl, [Authinfo.getOrgId()]);
          if (startIdx && startIdx > 0) {
            listUrl = listUrl + '&startIdx=' + startIdx;
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

        sendEmail: function(userEmail, callback) {
          $http.post(userUrl + 'user/mail?email=' + encodeURIComponent(userEmail))
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
