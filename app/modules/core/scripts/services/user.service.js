(function () {
  'use strict';

  angular.module('Core')
    .constant('NAME_DELIMITER', ' \u000B')
    .service('Userservice', Userservice);

  /* @ngInject */
  function Userservice($http, $q, $rootScope, Authinfo, Config, HuronUser, Log, NAME_DELIMITER, Notification, SunlightConfigService, TelephoneNumberService, UrlConfig) {
    var userUrl = UrlConfig.getAdminServiceUrl();

    var service = {
      updateUsers: updateUsers,
      addUsers: addUsers,
      getUser: getUser,
      updateUserProfile: updateUserProfile,
      inviteUsers: inviteUsers,
      sendEmail: sendEmail,
      patchUserRoles: patchUserRoles,
      migrateUsers: migrateUsers,
      onboardUsers: onboardUsers,
      bulkOnboardUsers: bulkOnboardUsers,
      deactivateUser: deactivateUser,
      resendInvitation: resendInvitation,
      sendSparkWelcomeEmail: sendSparkWelcomeEmail,
      isInvitePending: isInvitePending
    };

    return service;

    function updateUsers(usersDataArray, licenses, entitlements, method, callback) {
      var userData = {
        users: []
      };

      for (var i = 0; i < usersDataArray.length; i++) {
        var userInfo = usersDataArray[i];
        var userEmail = userInfo.address.trim();
        if (userEmail.length > 0) {
          var user = {
            email: userEmail,
            userEntitlements: entitlements,
            licenses: licenses
          };

          var userLic = {};

          userLic.internalExtension = _.get(userInfo, 'assignedDn.pattern');
          if (userInfo.externalNumber && userInfo.externalNumber.pattern !== 'None') {
            userLic.directLine = userInfo.externalNumber.pattern;
          }

          if (_.isArray(entitlements) && entitlements.length > 0) {
            user.userEntitlements = buildUserSpecificProperties(userLic, entitlements);
          }
          if (_.isArray(licenses) && licenses.length > 0) {
            user.licenses = buildUserSpecificProperties(userLic, licenses);
          }
          userData.users.push(user);
        }
      }

      if (userData.users.length > 0) {
        return $http({
          method: 'PATCH',
          url: userUrl + 'organization/' + Authinfo.getOrgId() + '/users',
          data: userData
        }).success(function (data, status, headers) {
          data = data || {};
          $rootScope.$broadcast('Userservice::updateUsers');
          data.success = true;
          if (angular.isFunction(callback)) {
            callback(data, status, method, headers);
          }
        }).error(function (data, status, headers) {
          data = data || {};
          data.success = false;
          data.status = status;
          if (angular.isFunction(callback)) {
            callback(data, status, method, headers);
          }
        });
      } else {
        return $q.when();
      }
    }

    function addUsers(usersDataArray, entitlements, callback) {
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
            $rootScope.$broadcast('Userservice::updateUsers');
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

    function getUser(userid, callback) {
      var scimUrl = UrlConfig.getScimUrl(Authinfo.getOrgId()) + '/' + userid;

      $http.get(scimUrl, {
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
    }

    function updateUserProfile(userid, userData, callback) {
      var scimUrl = UrlConfig.getScimUrl(Authinfo.getOrgId()) + '/' + userid;

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
    }

    function inviteUsers(usersDataArray, entitlements, forceResend, callback) {
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
    }

    function sendEmail(userEmail, adminEmail, callback) {
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
    }

    function patchUserRoles(email, name, roles, callback) {
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
    }

    function migrateUsers(users, callback) {
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
    }

    function onboardUsers(usersDataArray, entitlements, licenses, cancelPromise) {
      var getUserPayload = getUserPayloadForOnboardAPI.bind({
        licenses: licenses,
        entitlements: entitlements
      });
      var userPayload = getUserPayload(usersDataArray, true);
      return onboardUsersAPI(userPayload, cancelPromise);
    }

    function bulkOnboardUsers(usersDataArray, cancelPromise) {
      var userPayload = getUserPayloadForOnboardAPI(usersDataArray, false);
      return onboardUsersAPI(userPayload, cancelPromise);
    }

    function deactivateUser(userData) {
      return $http.delete(userUrl + 'organization/' + Authinfo.getOrgId() + '/user?email=' + encodeURIComponent(userData.email));
    }

    function getUserPayloadForOnboardAPI(users, hasSameLicenses) {
      var thisParams = this;
      users = _.isArray(users) ? users : [];
      hasSameLicenses = _.isBoolean(hasSameLicenses) ? hasSameLicenses : false;
      var licenses = (!_.isUndefined(thisParams) && _.isArray(thisParams.licenses)) ? thisParams.licenses : undefined;
      var entitlements = (!_.isUndefined(thisParams) && _.isArray(thisParams.entitlements)) ? thisParams.entitlements : undefined;
      var userPayload = {
        'users': []
      };

      _.forEach(users || [], function (userData) {
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
          if (!user.name.givenName && !user.name.familyName) {
            delete user.name;
          }
          if (displayName) {
            user.displayName = displayName;
          }

          var theLicenses = (hasSameLicenses) ? licenses || [] : userData.licenses || [];
          var theEntitlements = (hasSameLicenses) ? entitlements || [] : userData.entitlements || [];

          if (_.isArray(theLicenses) && theLicenses.length > 0) {
            user.licenses = buildUserSpecificProperties(userData, theLicenses);
          }
          if (_.isArray(theEntitlements) && theEntitlements.length > 0) {
            user.userEntitlements = buildUserSpecificProperties(userData, theEntitlements);
          }

          userPayload.users.push(user);
        }
      });

      return userPayload;
    }

    function tokenParseFirstLastName(name) {
      var givenName = null;
      var familyName = null;

      if (_.isString(name) && name.length > 0) {
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

    function onboardUsersAPI(userPayload, cancelPromise) {
      if (userPayload && _.isArray(userPayload.users) && userPayload.users.length > 0) {
        var onboardUsersPromise = $http.post(userUrl + 'organization/' + Authinfo.getOrgId() + '/users/onboard', userPayload, {
          timeout: cancelPromise
        });
        onboardUsersPromise.then(function (response) {
          checkAndOnboardSunlightUser(response.data.userResponse, userPayload.users);
        }, function (reason) {
          Log.debug("onboardUsersPromise reason :" + JSON.stringify(reason));
        });
        return onboardUsersPromise;
      } else {
        return $q.reject('No valid emails entered.');
      }
    }

    function checkAndOnboardSunlightUser(userResponse, users) {
      var userResponseSuccess = _.filter(userResponse, function (response) {
        return response.status === 200;
      });
      _.each(userResponseSuccess, function (userResponseSuccess) {
        var userLicenses = getUserLicence(userResponseSuccess.email, users);
        if (isSunlightUser(userLicenses)) {
          var userData = createUserData(userResponseSuccess);
          SunlightConfigService.createUserInfo(userData)
            .then(function (response) {
              Log.debug("SunlightConfigService.createUserInfo success response :" + JSON.stringify(response));
            }, function (response) {
              Log.debug("SunlightConfigService.createUserInfo failure response :" + JSON.stringify(response));
            });
        }
      });

    }

    function createUserData(userResponse) {
      var userData = {};
      userData.userId = userResponse.uuid;
      userData.alias = userResponse.displayName;
      userData.teamId = Authinfo.getOrgId();
      userData.attributes = [];
      userData.media = ["chat"];
      userData.role = 'user';
      return userData;
    }

    function getUserLicence(userEmail, users) {
      return _.find(users, function (user) {
        return userEmail === user.email;
      }).licenses;
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

    function isSunlightUser(licenses) {
      var sunlightLicense = _.find(licenses, function (license) {
        return license.id.indexOf(Config.offerCodes.CDC) >= 0;
      });
      return (typeof sunlightLicense === 'undefined') ? false : true;
    }

    function isHuronUser(allEntitlements) {
      return _.indexOf(allEntitlements, Config.entitlements.huron) >= 0;
    }

    function isInvitePending(user) {
      return _.includes(user.accountStatus, 'pending');
    }

    function resendInvitation(userEmail, userName, uuid, userStatus, dirsyncEnabled, entitlements) {
      if (userStatus === 'pending' && !isHuronUser(entitlements)) {
        return sendSparkWelcomeEmail(userEmail, userName);
      } else if (isHuronUser(entitlements) && !dirsyncEnabled) {
        return HuronUser.sendWelcomeEmail(userEmail, userName, uuid, Authinfo.getOrgId(), false);
      }
      return $q.reject('invitation not sent');
    }

    function sendSparkWelcomeEmail(userEmail, userName) {
      var userData = [{
        'address': userEmail,
        'name': userName
      }];

      return $q(function (resolve, reject) {
        inviteUsers(userData, null, true, function (data, status) {
          if (data.success) {
            resolve();
          } else {
            Log.debug('Resending failed. Status: ' + status);
            reject(status);
          }
        });
      });
    }

  }

})();
