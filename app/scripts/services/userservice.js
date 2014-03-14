'use strict';

angular.module('wx2AdminWebClientApp')
  .service('Userservice', ['$http', '$rootScope', '$location', 'Storage', 'Config',
    function($http, $rootScope, $location, Storage, Config) {

      var userUrl = Config.adminServiceUrl;
      var token = Storage.get('accessToken');
      var user = {
        'email': null,
        'name': null
      };

      return {
        entitleUsers: function(usersDataArray, callback) {
          var userData = {
            'users': []
          };

          for (var i = 0; i < usersDataArray.length; i++) {
            var userEmail = usersDataArray[i].address.trim();
            var userName = usersDataArray[i].name.trim();

            if (userEmail.length > 0 && typeof userEmail !== 'undefined') {
              user.email = userEmail;
              if (userName.length > 0 && userName !== false && typeof userName !== 'undefined') {
                user.name = userName;
              }
              userData.users.push(user);
            }

          }

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
        },

        addUsers: function(usersDataArray, callback) {
          var userData = {
            'users': []
          };

          for (var i = 0; i < usersDataArray.length; i++) {
            var userEmail = usersDataArray[i].address.trim();
            var userName = usersDataArray[i].name.trim();

            if (userEmail.length > 0 && typeof userEmail !== 'undefined') {
              user.email = userEmail;
              if (userName.length > 0 && userName !== false && typeof userName !== 'undefined') {
                user.name = userName;
              }
              userData.users.push(user);
            }
          }

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

        }

      };


    }
  ]);
