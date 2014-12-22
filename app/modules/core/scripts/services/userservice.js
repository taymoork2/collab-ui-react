'use strict';

angular.module('Core')
  .service('Userservice', ['$http', '$rootScope', '$location', 'Storage', 'Config', 'Authinfo', 'Log', 'Auth', 'Utils', 'HuronUser',
    function ($http, $rootScope, $location, Storage, Config, Authinfo, Log, Auth, Utils, HuronUser) {

      var userUrl = Config.getAdminServiceUrl();

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
            $http.defaults.headers.common.Authorization = 'Bearer ' + $rootScope.token;
            $http({
                method: 'PATCH',
                url: userUrl + 'organization/' + Authinfo.getOrgId() + '/users',
                data: userData
              })
              .success(function (data, status) {
                // This code is being added temporarily to add/remove users from Squared UC
                // Discussions are ongoing concerning how these common functions should be
                // integrated.
                if (data.userResponse[0].entitled && data.userResponse[0].entitled.indexOf(Config.entitlements.huron) !== -1) {
                  HuronUser.create(data.userResponse[0].email, data.userResponse[0].uuid)
                    .then(function (success) {
                      data.success = true;
                      callback(data, status);
                    }).catch(function (error) {
                      Log.error('Squared UC user create unsuccessful: ' + error);
                      data.success = false;
                      callback(data, status);
                    });
                } else {
                  if (data.userResponse[0].unentitled && data.userResponse[0].unentitled.indexOf(Config.entitlements.huron) !== -1) {
                    HuronUser.delete(data.userResponse[0].uuid)
                      .then(function (success) {
                        data.success = true;
                        callback(data, status);
                      }, function (error) {
                        Log.error('Squared UC user remove unsuccessful: ' + error);
                        //if the user does not exist in Squared UC do not report an error
                        if (error.status === 404) {
                          data.success = true;
                        } else {
                          data.success = false;
                        }
                        callback(data, status);
                      });
                  } else {
                    data.success = true;
                    callback(data, status);
                  }
                }
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
            $http.defaults.headers.common.Authorization = 'Bearer ' + $rootScope.token;
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
          $http.defaults.headers.common.Authorization = 'Bearer ' + $rootScope.token;
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
            $http.defaults.headers.common.Authorization = 'Bearer ' + $rootScope.token;
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
              'displayName': userName
            };
            if (userEmail.length > 0) {
              userData.inviteList.push(user);
            }
          }

          if (userData.inviteList.length > 0) {
            $http.defaults.headers.common.Authorization = 'Bearer ' + $rootScope.token;
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
