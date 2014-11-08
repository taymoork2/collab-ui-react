'use strict';

angular.module('Core')
  .service('Userservice', ['$http', '$rootScope', '$location', 'Storage', 'Config', 'Authinfo', 'Log', 'Auth', 'Utils',
    function ($http, $rootScope, $location, Storage, Config, Authinfo, Log, Auth, Utils) {

      var userUrl = Config.getAdminServiceUrl();
      var token = Storage.get('accessToken');

      return {

        updateUsers: function (usersDataArray, entitlements, callback) {
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
                url: userUrl + 'organization/' + Authinfo.getOrgId() + '/users',
                data: userData
              })
              .success(function (data, status) {
                data.success = true;
                callback(data, status);
              })
              .error(function (data, status) {
                data.success = false;
                data.status = status;
                callback(data, status);
                Auth.handleStatus(status);
              });
          }

        },

        addUsers: function (usersDataArray, entitlements, callback) {
          var userData = {
            'users': []
          };

          for (var i = 0; i < usersDataArray.length; i++) {
            var userEmail = usersDataArray[i].address.trim();
            var userName = usersDataArray[i].name.trim();
            var user = {
              'email': null,
              'name': null,
              'userEntitlements': entitlements
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
              .success(function (data, status) {
                data.success = true;
                callback(data, status);
              })
              .error(function (data, status) {
                data.success = false;
                data.status = status;
                callback(data, status);
                Auth.handleStatus(status);
              });
          } else {
            callback('No valid emails entered.');
          }
        },

        getUser: function (userid, callback) {
          var scimUrl = Config.scimUrl + '/' + userid;
          var userUrl = Utils.sprintf(scimUrl, [Authinfo.getOrgId()]);
          $http.defaults.headers.common.Authorization = 'Bearer ' + token;
          $http.get(userUrl)
            .success(function (data, status) {
              data.success = true;
              callback(data, status);
            })
            .error(function (data, status) {
              data.success = false;
              data.status = status;
              callback(data, status);
              Auth.handleStatus(status);
            });
        },

        updateUserProfile: function (userid, userData, callback) {
          var scimUrl = Config.scimUrl + '/' + userid;
          scimUrl = Utils.sprintf(scimUrl, [Authinfo.getOrgId()]);

          if (userData) {
            $http.defaults.headers.common.Authorization = 'Bearer ' + token;
            $http({
                method: 'PATCH',
                url: scimUrl,
                data: userData
              })
              .success(function (data, status) {
                data.success = true;
                callback(data, status);
              })
              .error(function (data, status) {
                data.success = false;
                data.status = status;
                callback(data, status);
                Auth.handleStatus(status);
              });
          }
        },

        inviteUsers: function (usersDataArray, forceResend, callback) {
          var apiUrl = null;
          if (arguments.length === 2) { // if only two arguments were supplied
            if (Object.prototype.toString.call(forceResend) === '[object Function]') {
              callback = forceResend;
              apiUrl = userUrl + 'organization/' + Authinfo.getOrgId() + '/invitations';
            }
          } else if (arguments.length === 3) {
            apiUrl = userUrl + 'organization/' + Authinfo.getOrgId() + '/invitations/?resendInvite=' + forceResend;
          }

          var userData = {
            'inviteList': []
          };

          for (var i = 0; i < usersDataArray.length; i++) {
            var userEmail = usersDataArray[i].address.trim();

            var userName = null;
            if (usersDataArray[i].name) {
              userName = usersDataArray[i].name.trim();
            }

            var user = {
              'email': userEmail,
              'name': userName
            };
            if (userEmail.length > 0) {
              userData.inviteList.push(user);
            }
          }

          if (userData.inviteList.length > 0) {
            $http.defaults.headers.common.Authorization = 'Bearer ' + token;
            $http.post(apiUrl, userData)
              .success(function (data, status) {
                data.success = true;
                callback(data, status);
              })
              .error(function (data, status) {
                data.success = false;
                data.status = status;
                callback(data, status);
                Auth.handleStatus(status);
              });
          } else {
            callback('No valid emails entered.');
          }
        },

        sendEmail: function (userEmail, adminEmail, callback) {
          var requestBody = {
            'recipientEmail': userEmail,
            'adminEmail': adminEmail
          };
          $http.post(userUrl + 'user/mail/provisioning', requestBody)
            .success(function (data, status) {
              data.success = true;
              callback(data, status);
            })
            .error(function (data, status) {
              data.success = false;
              data.status = status;
              callback(data, status);
            });
        }

      };
    }
  ]);
