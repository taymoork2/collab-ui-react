'use strict';

angular.module('wx2AdminWebClientApp')
  .service('Userservice', ['$http', '$rootScope', '$location', 'Storage', 'Config', 'Authinfo', 'Log', 'Utils',
    function($http, $rootScope, $location, Storage, Config, Authinfo, Log, Utils) {

      var userUrl = Config.adminServiceUrl.prod;
      var token = Storage.get('accessToken');

      return {

        updateUsers: function(usersDataArray, entitlements, callback) {
          var userData = {
            'users': []
          };

          for (var i = 0; i < usersDataArray.length; i++) {
            var userEmail = usersDataArray[i].address.trim();
            if (userEmail.length > 0) {
              var user = {
                'email': userEmail,
                'userEntitlements': entitlements
              };
              userData.users.push(user);
            }
          }
          if (userData.users.length > 0) {
            $http.defaults.headers.common.Authorization = 'Bearer ' + token;
            $http({
              method: 'PATCH',
              url: userUrl + 'users',
              data: userData
            })
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

        addUsers: function(usersDataArray, entitlements, callback) {
          var userData = {
            'users': []
          };

          for (var i = 0; i < usersDataArray.length; i++) {
            var userEmail = usersDataArray[i].address.trim();
            var userName = usersDataArray[i].name.trim();
            var user = {
              'email': null,
              'name': null,
              'userEntitlements' : entitlements
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
            $http.post(userUrl + 'users', userData)
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

        getUser: function(userid, callback) {
          var scimUrl = Config.scimUrl + '/' + userid;
          var userUrl = Utils.sprintf(scimUrl, [Authinfo.getOrgId()]);
          $http.defaults.headers.common.Authorization = 'Bearer ' + token;
          $http.get(userUrl)
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

        updateUserProfile: function(userid, userData, callback) {
          var scimUrl = Config.scimUrl + '/' + userid;
          scimUrl = Utils.sprintf(scimUrl, [Authinfo.getOrgId()]);

          if (userData) {
            $http.defaults.headers.common.Authorization = 'Bearer ' + token;
            $http({
              method: 'PATCH',
              url: scimUrl,
              data: userData
            })
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

        sendEmail: function(userEmail, adminEmail, callback) {
          var requestBody = {
            'recipientEmail': userEmail,
            'adminEmail': adminEmail
          };
          $http.post(userUrl + 'user/mail/provisioning', requestBody)
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
