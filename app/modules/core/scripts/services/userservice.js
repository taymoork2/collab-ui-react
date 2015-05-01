'use strict';

angular.module('Core')
  .service('Userservice', ['$http', '$rootScope', '$location', 'Storage', 'Config', 'Authinfo', 'Log', 'Auth', 'Utils', 'HuronUser', 'Notification',
    function ($http, $rootScope, $location, Storage, Config, Authinfo, Log, Auth, Utils, HuronUser, Notification) {

      var userUrl = Config.getAdminServiceUrl();

      return {

        updateUsers: function (usersDataArray, userLicenses, entitlements, callback) {
          var userData = {
            'users': []
          };

          for (var i = 0; i < usersDataArray.length; i++) {
            var userEmail = usersDataArray[i].address.trim();
            if (userEmail.length > 0) {
              var user = {
                'email': userEmail,
                'userEntitlements': entitlements,
                'userLicenses': userLicenses
              };
              userData.users.push(user);
            }
          }
          if (userData.users.length > 0) {

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
                  var userData = {
                    'email': data.userResponse[0].email,
                    'familyName': usersDataArray[0].familyName,
                    'givenName': usersDataArray[0].givenName
                  };
                  HuronUser.create(data.userResponse[0].uuid, userData)
                    .then(function () {
                      data.success = true;
                      callback(data, status);
                    }).catch(function (response) {
                      // Notify Huron error
                      Notification.errorResponse(response);

                      // Callback entitlement success
                      data.success = true;
                      callback(data, status);
                    });
                } else {
                  if (data.userResponse[0].unentitled && data.userResponse[0].unentitled.indexOf(Config.entitlements.huron) !== -1) {
                    HuronUser.delete(data.userResponse[0].uuid)
                      .then(function () {
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
                  $rootScope.$broadcast('Userservice::updateUsers');
                }
              })
              .error(function (data, status) {
                data.success = false;
                data.status = status;
                callback(data, status);
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

            $http.post(userUrl + 'organization/' + Authinfo.getOrgId() + '/users', userData)
              .success(function (data, status) {
                data.success = true;
                callback(data, status);
              })
              .error(function (data, status) {
                data.success = false;
                data.status = status;

                callback(data, status);
              });
          } else {
            callback('No valid emails entered.');
          }
        },

        getUser: function (userid, callback) {
          var scimUrl = Config.getScimUrl() + '/' + userid;
          var userUrl = Utils.sprintf(scimUrl, [Authinfo.getOrgId()]);

          $http.get(userUrl)
            .success(function (data, status) {
              data.success = true;
              callback(data, status);
            })
            .error(function (data, status) {
              data.success = false;
              data.status = status;
              callback(data, status);
            });
        },

        updateUserProfile: function (userid, userData, callback) {
          var scimUrl = Config.getScimUrl() + '/' + userid;
          scimUrl = Utils.sprintf(scimUrl, [Authinfo.getOrgId()]);

          if (userData) {

            $http({
                method: 'PATCH',
                url: scimUrl,
                data: userData
              })
              .success(function (data, status) {
                // This code is being added temporarily to update users on Squared UC
                // Discussions are ongoing concerning how these common functions should be
                // integrated.
                if (data.entitlements && data.entitlements.indexOf(Config.entitlements.huron) !== -1) {
                  HuronUser.update(data.id, data)
                    .then(function () {
                      data.success = true;
                      callback(data, status);
                    }).catch(function (response) {
                      // Notify Huron error
                      Notification.errorResponse(response);

                      // Callback update success
                      data.success = true;
                      callback(data, status);
                    });
                } else {
                  data.success = true;
                  callback(data, status);
                }
              })
              .error(function (data, status) {
                data.success = false;
                data.status = status;
                callback(data, status);
              });
          }
        },

        inviteUsers: function (usersDataArray, entitlements, forceResend, callback) {
          var apiUrl = null;
          if (arguments.length === 3) { // if only two arguments were supplied
            if (Object.prototype.toString.call(forceResend) === '[object Function]') {
              callback = forceResend;
              apiUrl = userUrl + 'organization/' + Authinfo.getOrgId() + '/invitations';
            }
          } else if (arguments.length === 4) {
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
              'displayName': userName,
              'userEntitlements': null
            };
            if (entitlements) {
              user['userEntitlements'] = entitlements;
            }
            if (userEmail.length > 0) {
              userData.inviteList.push(user);
            }
          }

          if (userData.inviteList.length > 0) {

            $http.post(apiUrl, userData)
              .success(function (data, status) {
                data.success = true;
                callback(data, status);
              })
              .error(function (data, status) {
                data.success = false;
                data.status = status;
                callback(data, status);
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
        },

        patchUserRoles: function (email, name, roles, callback) {
          var patchUrl = userUrl + '/organization/' + Authinfo.getOrgId() + '/users/roles';

          var requestBody = {
            'users': [{
              'userRoles': roles,
              'email': email,
              'name': name
            }]
          };

          $http({
              method: 'PATCH',
              url: patchUrl,
              data: requestBody
            })
            .success(function (data, status) {
              data.success = true;
              callback(data, status);
            })
            .error(function (data, status) {
              data.success = false;
              data.status = status;
              callback(data, status);
            });
        },

        migrateUsers: function (users, callback) {
          var requestBody = {
            'users': []
          };

          for (var x in users) {
            var user = {
              'email': users[x].userName
            };
            requestBody.users.push(user);
          }

          $http.post(userUrl + 'organization/' + Authinfo.getOrgId() + '/users/migrate', requestBody)
            .success(function (data, status) {
              data.success = true;
              callback(data, status);
            })
            .error(function (data, status) {
              data.success = false;
              data.status = status;
              callback(data, status);
            });
        },

        onboardUsers: function (usersDataArray, entitlements, userLicenses, callback) {
          var userData = {
            'users': []
          };

          for (var i = 0; i < usersDataArray.length; i++) {
            var userEmail = usersDataArray[i].address.trim();
            var userName = usersDataArray[i].name.trim();
            var user = {
              'email': null,
              'name': null,
              'userEntitlements': entitlements,
              'userLicenses': userLicenses
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

            $http.post(userUrl + 'organization/' + Authinfo.getOrgId() + '/users/onboard', userData)
              .success(function (data, status) {
                data.success = true;
                callback(data, status);
              })
              .error(function (data, status) {
                data.success = false;
                data.status = status;

                callback(data, status);
              });
          } else {
            callback('No valid emails entered.');
          }
        },

        deactivateUser: function (deleteUserOrgId, deleteUserUuId, userData, callback) {
          var scimUrl = Config.getScimUrl() + '/' + deleteUserUuId;
          scimUrl = Utils.sprintf(scimUrl, [deleteUserOrgId]);

          if (userData) {

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
              });
          }
        }
      };
    }
  ]);
