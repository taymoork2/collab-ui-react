'use strict';

angular.module('Core')
  .constant('NAME_DELIMITER', ' \u000B')
  .service('Userservice', ['$http', '$rootScope', '$location', 'Storage', 'Config', 'Authinfo', 'Log', 'Auth', 'Utils', 'HuronUser', 'Notification', 'NAME_DELIMITER',
    '$translate', '$q', 'TelephoneNumberService',
    function ($http, $rootScope, $location, Storage, Config, Authinfo, Log, Auth, Utils, HuronUser, Notification, NAME_DELIMITER, $translate, $q, TelephoneNumberService) {

      var userUrl = Config.getAdminServiceUrl();

      function tokenParseFirstLastName(name) {
        var givenName = null;
        var familyName = null;

        if (angular.isString(name) && name.length > 0) {
          if (name.indexOf(NAME_DELIMITER) > -1) {
            givenName = name.split(NAME_DELIMITER).slice(0, -1).join(' ').trim();
            familyName = name.split(NAME_DELIMITER).slice(-1).join(' ').trim();
          } else {
            givenName = name.split(' ').slice(0, -1).join(' ').trim();
            familyName = name.split(' ').slice(-1).join(' ').trim();
          }
        }
        return {
          'givenName': givenName,
          'familyName': familyName
        };
      }

      function onboardUsers(userPayload, callback, cancelPromise) {

        if (userPayload && angular.isArray(userPayload.users) && userPayload.users.length > 0) {
          $http.post(userUrl + 'organization/' + Authinfo.getOrgId() + '/users/onboard', userPayload, {
              timeout: cancelPromise
            }).success(function (data, status) {
              data = data || {};
              data.success = true;
              callback(data, status);
            })
            .error(function (data, status) {
              data = data || {};
              data.success = false;
              data.status = status;

              callback(data, status);
            });
        } else {
          callback('No valid emails entered.');
        }
      }

      /*
       * Modifies a license or entitlement array with properties specific for the user
       */
      function buildUserSpecificProperties(user, entitlementOrLicenseList) {
        return _.map(entitlementOrLicenseList, function (_entitlementOrLicense) {
          var entitlementOrLicense = angular.copy(_entitlementOrLicense);
          if (!_.has(entitlementOrLicense, 'properties')) {
            entitlementOrLicense.properties = {};
          }

          // Communications license or ciscouc entitlement
          if (_.startsWith(entitlementOrLicense.id, 'CO_') || entitlementOrLicense.entitlementName === 'ciscoUC') {
            if (user.internalExtension) {
              entitlementOrLicense.properties.internalExtension = user.internalExtension;
            }
            if (user.directLine) {
              entitlementOrLicense.properties.directLine = TelephoneNumberService.getDIDValue(user.directLine);
            }
          }

          return entitlementOrLicense;
        });
      }

      return {

        updateUsers: function (usersDataArray, licenses, entitlements, method, callback) {
          var userData = {
            'users': []
          };

          for (var i = 0; i < usersDataArray.length; i++) {
            var userEmail = usersDataArray[i].address.trim();
            if (userEmail.length > 0) {
              var user = {
                'email': userEmail,
                'userEntitlements': entitlements,
                'licenses': licenses,
                'assignedDn': usersDataArray[i].assignedDn,
                'externalNumber': usersDataArray[i].externalNumber
              };
              userData.users.push(user);
            }
          }

          if (userData.users.length > 0) {
            $http({
              method: 'PATCH',
              url: userUrl + 'organization/' + Authinfo.getOrgId() + '/users',
              data: userData
            }).success(function (data, status) {
              data = data || {};
              $rootScope.$broadcast('Userservice::updateUsers');
              data.success = true;
              if (angular.isFunction(callback)) {
                callback(data, status, method);
              }
            }).error(function (data, status) {
              data = data || {};
              data.success = false;
              data.status = status;
              if (angular.isFunction(callback)) {
                callback(data, status, method);
              }
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
                data = data || {};
                data.success = true;
                callback(data, status);
              })
              .error(function (data, status) {
                data = data || {};
                data.success = false;
                data.status = status;

                callback(data, status);
              });
          } else {
            callback('No valid emails entered.');
          }
        },

        getUser: function (userid, callback) {
          var scimUrl = Config.getScimUrl(Authinfo.getOrgId()) + '/' + userid;
          var userUrl = scimUrl;

          $http.get(userUrl, {
              cache: true
            })
            .success(function (data, status) {
              data = data || {};
              data.success = true;
              callback(data, status);
            })
            .error(function (data, status) {
              data = data || {};
              data.success = false;
              data.status = status;
              callback(data, status);
            });
        },

        updateUserProfile: function (userid, userData, callback) {
          var scimUrl = Config.getScimUrl(Authinfo.getOrgId()) + '/' + userid;

          if (userData) {

            $http({
                method: 'PATCH',
                url: scimUrl,
                data: userData
              })
              .success(function (data, status) {
                data = data || {};
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
                data = data || {};
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
                data = data || {};
                data.success = true;
                callback(data, status);
              })
              .error(function (data, status) {
                data = data || {};
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
              data = data || {};
              data.success = true;
              callback(data, status);
            })
            .error(function (data, status) {
              data = data || {};
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
              data = data || {};
              data.success = true;
              callback(data, status);
            })
            .error(function (data, status) {
              data = data || {};
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
              data = data || {};
              data.success = true;
              callback(data, status);
            })
            .error(function (data, status) {
              data = data || {};
              data.success = false;
              data.status = status;
              callback(data, status);
            });
        },

        onboardUsers: function (usersDataArray, entitlements, licenses, callback, cancelPromise) {
          var userPayload = {
            'users': []
          };

          _.forEach(usersDataArray, function (userData) {
            var userEmail = userData.address.trim();
            var userName = userData.name;
            var displayName = userData.displayName;

            var user = {
              'email': null,
              'name': {
                'givenName': null,
                'familyName': null,
              },
              'userEntitlements': null,
              'licenses': null
            };

            if (userEmail.length > 0) {

              user.email = userEmail;
              user.name = tokenParseFirstLastName(userName);
              if (displayName) {
                user.displayName = displayName;
              }

              // Build entitlement and license arrays with properties driven from userData model
              if (_.isArray(entitlements) && entitlements.length > 0) {
                user.userEntitlements = buildUserSpecificProperties(userData, entitlements);
              }
              if (_.isArray(licenses) && licenses.length > 0) {
                user.licenses = buildUserSpecificProperties(userData, licenses);
              }

              userPayload.users.push(user);
            }
          });
          onboardUsers(userPayload, callback, cancelPromise);
        },

        deactivateUser: function (userData) {
          return $http.delete(userUrl + 'organization/' + Authinfo.getOrgId() + '/user?email=' + encodeURIComponent(userData.email));
        }
      };
    }
  ]);
