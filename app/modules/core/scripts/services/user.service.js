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
      getUserAsPromise: getUserAsPromise,
      updateUserProfile: updateUserProfile,
      inviteUsers: inviteUsers,
      sendEmail: sendEmail,
      getUsersEmailStatus: getUsersEmailStatus,
      patchUserRoles: patchUserRoles,
      migrateUsers: migrateUsers,
      onboardUsers: onboardUsers,
      bulkOnboardUsers: bulkOnboardUsers,
      deactivateUser: deactivateUser,
      isHuronUser: isHuronUser,
      isInvitePending: isInvitePending,
      resendInvitation: resendInvitation,
      sendSparkWelcomeEmail: sendSparkWelcomeEmail,
      getUserPhoto: getUserPhoto,
      isValidThumbnail: isValidThumbnail,
      getFullNameFromUser: getFullNameFromUser,
      getPrimaryEmailFromUser: getPrimaryEmailFromUser,
      getUserLicence: getUserLicence,
      getPreferredWebExSiteForCalendaring: getPreferredWebExSiteForCalendaring,
    };

    var _helpers = {
      isSunlightUserUpdateRequired: isSunlightUserUpdateRequired,
      getUserLicence: getUserLicence,
      createUserData: createUserData,
    };

    return service;

    function updateUsers(usersDataArray, licenses, entitlements, method, callback) {
      var userData = {
        users: [],
      };

      _.forEach(usersDataArray, function (userInfo) {
        var userEmail = _.trim(userInfo.address);
        if (userEmail.length > 0) {
          var user = {
            email: userEmail,
            userEntitlements: entitlements,
            licenses: licenses,
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
      });

      if (userData.users.length > 0) {
        return $http({
          method: 'PATCH',
          url: userUrl + 'organization/' + Authinfo.getOrgId() + '/users',
          data: userData,
        }).success(function (data, status, headers) {
          data = _.isObject(data) ? data : {};
          $rootScope.$broadcast('Userservice::updateUsers');
          data.success = true;
          if (_.isFunction(callback)) {
            callback(data, status, method, headers);
          }
        }).error(function (data, status, headers) {
          data = _.isObject(data) ? data : {};
          data.success = false;
          data.status = status;
          if (_.isFunction(callback)) {
            callback(data, status, method, headers);
          }
        });
      } else {
        return $q.resolve();
      }
    }

    function addUsers(usersDataArray, entitlements, callback) {
      var userData = {
        'users': [],
      };

      _.forEach(usersDataArray, function (userInfo) {
        var userEmail = _.trim(userInfo.address);
        var userName = _.trim(userInfo.name);
        var user = {
          'email': null,
          'name': null,
          'userEntitlements': entitlements,
        };
        if (userEmail.length > 0) {
          user.email = userEmail;
          if (userName.length > 0 && userName !== false) {
            user.name = userName;
          }
          userData.users.push(user);
        }
      });

      if (userData.users.length > 0) {

        $http.post(userUrl + 'organization/' + Authinfo.getOrgId() + '/users', userData)
          .success(function (data, status) {
            data = _.isObject(data) ? data : {};
            $rootScope.$broadcast('Userservice::updateUsers');
            data.success = true;
            callback(data, status);
          })
          .error(function (data, status) {
            data = _.isObject(data) ? data : {};
            data.success = false;
            data.status = status;

            callback(data, status);
          });
      } else {
        callback('No valid emails entered.');
      }
    }

    // DEPRECATED
    // - update all callers of this method to use 'getUserAsPromise()' instead, before removing
    //   this implementataion
    // - 'getUserAsPromise()' can then assume this name after all callers use promise-style
    //   chaining
    function getUser(userid, noCache, callback) {
      var scimUrl = UrlConfig.getScimUrl(Authinfo.getOrgId()) + '/' + userid;
      // support the signature getUser(userid, noCache, callback) and getUser(userid, callback)
      if (!_.isFunction(callback)) {
        callback = noCache;
      }
      return $http.get(scimUrl, {
        cache: !noCache,
      })
        .success(function (data, status) {
          data = _.isObject(data) ? data : {};
          data.success = true;
          callback(data, status);
        })
        .error(function (data, status) {
          data = _.isObject(data) ? data : {};
          data.success = false;
          data.status = status;
          callback(data, status);
        });
    }

    function getUserAsPromise(userId, httpConfig) {
      var scimUrl = UrlConfig.getScimUrl(Authinfo.getOrgId()) + '/' + userId;
      var _httpConfig = _.extend({}, httpConfig);
      return $http.get(scimUrl, _httpConfig);
    }

    function updateUserProfile(userid, userData) {
      var scimUrl = UrlConfig.getScimUrl(Authinfo.getOrgId()) + '/' + userid;

      if (!userData) {
        return $q.reject('Invalid user data');
      }

      return $http({
        method: 'PATCH',
        url: scimUrl,
        data: userData,
      })
        .then(function (response) {
          var entitlements = _.get(response, 'data.entitlements', []);
          // This code is being added temporarily to update users on Squared UC
          // Discussions are ongoing concerning how these common functions should be
          // integrated.
          if (_.includes(entitlements, Config.entitlements.huron)) {
            var data = _.get(response, 'data', {});
            return HuronUser.update(data.id, data)
              .catch(function (huronResponse) {
                // Notify Huron error huronResponse
                Notification.errorResponse(huronResponse);
              })
              .then(function () {
                // always return original successful response
                return response;
              });
          }
          return response;
        });
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
        'inviteList': [],
      };

      _.forEach(usersDataArray, function (userInfo) {
        var userEmail = _.trim(userInfo.address);

        var userName = null;
        if (userInfo.name) {
          userName = _.trim(userInfo.name);
        }

        var user = {
          'email': userEmail,
          'displayName': userName,
          'userEntitlements': null,
        };
        if (entitlements) {
          user['userEntitlements'] = entitlements;
        }
        if (userEmail.length > 0) {
          userData.inviteList.push(user);
        }
      });

      if (userData.inviteList.length > 0) {

        $http.post(apiUrl, userData)
          .success(function (data, status) {
            data = _.isObject(data) ? data : {};
            data.success = true;
            callback(data, status);
          })
          .error(function (data, status) {
            data = _.isObject(data) ? data : {};
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
        'adminEmail': adminEmail,
      };
      $http.post(userUrl + 'user/mail/provisioning', requestBody)
        .success(function (data, status) {
          data = _.isObject(data) ? data : {};
          data.success = true;
          callback(data, status);
        })
        .error(function (data, status) {
          data = _.isObject(data) ? data : {};
          data.success = false;
          data.status = status;
          callback(data, status);
        });
    }

    function getUsersEmailStatus(orgId, userId) {
      if (orgId === null) {
        $q.reject('No Org ID was passed');
      }
      if (userId === null) {
        $q.reject('No User ID was passed');
      }
      var emailUrl = userUrl + 'organization/' + orgId + '/email/' + userId;

      return $http.get(emailUrl);
    }

    // TODO: mipark2 - remove this and update upstream code to use UserRoleService
    function patchUserRoles(email, name, roles) {
      var patchUrl = userUrl + '/organization/' + Authinfo.getOrgId() + '/users/roles';

      var requestBody = {
        'users': [{
          'userRoles': roles,
          'email': email,
          'name': name,
        }],
      };

      return $http({
        method: 'PATCH',
        url: patchUrl,
        data: requestBody,
      });
    }

    function migrateUsers(users, callback) {
      var requestBody = {
        'users': [],
      };

      for (var x in users) {
        var user = {
          'email': users[x].userName,
        };
        requestBody.users.push(user);
      }

      $http.post(userUrl + 'organization/' + Authinfo.getOrgId() + '/users/migrate', requestBody)
        .success(function (data, status) {
          data = _.isObject(data) ? data : {};
          data.success = true;
          callback(data, status);
        })
        .error(function (data, status) {
          data = _.isObject(data) ? data : {};
          data.success = false;
          data.status = status;
          callback(data, status);
        });
    }

    /**
     * Onboard users that share the same set of entitlements and licenses
     */
    function onboardUsers(usersDataArray, entitlements, licenses, cancelPromise) {
      // bind the licenses and entitlements that are shared by all users
      var getUserPayload = getUserPayloadForOnboardAPI.bind({
        licenses: licenses,
        entitlements: entitlements,
      });
      var userPayload = getUserPayload(usersDataArray, true);
      return onboardUsersAPI(userPayload, cancelPromise);
    }

    /**
     * Onboard users with each user specifiying their own set of licenses and entitlements
     */
    function bulkOnboardUsers(usersDataArray, cancelPromise) {
      var userPayload = getUserPayloadForOnboardAPI(usersDataArray, false);
      return onboardUsersAPI(userPayload, cancelPromise);
    }

    function deactivateUser(userData) {
      return $http.delete(userUrl + 'organization/' + Authinfo.getOrgId() + '/user?email=' + encodeURIComponent(userData.email));
    }

    /**
     * Generate the payload used for onboard API call.
     */
    function getUserPayloadForOnboardAPI(users, hasSameLicenses) {
      var thisParams = this;
      users = _.isArray(users) ? users : [];
      hasSameLicenses = _.isBoolean(hasSameLicenses) ? hasSameLicenses : false;
      var licenses = (!_.isUndefined(thisParams) && _.isArray(thisParams.licenses)) ? thisParams.licenses : undefined;
      var entitlements = (!_.isUndefined(thisParams) && _.isArray(thisParams.entitlements)) ? thisParams.entitlements : undefined;
      var userPayload = {
        'users': [],
      };

      _.forEach(users, function (userData) {
        var userEmail = _.trim(userData.address);
        var userName = userData.name;
        var displayName = userData.displayName;

        var user = {
          'email': null,
          'name': {
            'givenName': null,
            'familyName': null,
          },
          'userEntitlements': null,
          'licenses': null,
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
        'familyName': familyName,
      };
    }

    function onboardUsersAPI(userPayload, cancelPromise) {
      if (userPayload && _.isArray(userPayload.users) && userPayload.users.length > 0) {
        var onboardUsersPromise = $http.post(userUrl + 'organization/' + Authinfo.getOrgId() + '/users/onboard', userPayload, {
          timeout: cancelPromise,
        });
        onboardUsersPromise.then(function (response) {
          checkAndOnboardSunlightUser(response.data.userResponse, userPayload.users);
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
        var userLicenses = _helpers.getUserLicence(userResponseSuccess.email, users);
        if (_helpers.isSunlightUserUpdateRequired(userLicenses)) {
          var userData = _helpers.createUserData();
          var userId = userResponseSuccess.uuid;
          // Get user to check for roles and entitlements
          getUser(userId, function (data) {
            if (data.success) {
              var hasSyncKms = _.find(data.roles, function (r) {
                return r === Config.backend_roles.spark_synckms;
              });
              var hasContextServiceEntitlement = _.find(data.entitlements, function (r) {
                return r === Config.entitlements.context;
              });
              checkAndPatchSunlightRolesAndEntitlements(userId, hasSyncKms, hasContextServiceEntitlement)
                .then(function () {
                  SunlightConfigService.updateUserInfo(userData, userId)
                    .catch(function (response) {
                      Notification.errorResponse(response, 'usersPage.careAddUserError');
                    });
                })
                .catch(function (response) {
                  Notification.errorResponse(response, 'usersPage.careAddUserRoleError');
                });
            }
          });
        }
      });
    }

    function checkAndPatchSunlightRolesAndEntitlements(userId, hasSyncKms, hasContextServiceEntitlement) {
      var userRoleData = {
        schemas: Config.scimSchemas,
      };
      if (!hasSyncKms) {
        userRoleData.roles = [Config.backend_roles.spark_synckms];
      }
      if (!hasContextServiceEntitlement) {
        userRoleData.entitlements = [Config.entitlements.context];
      }
      if (!hasSyncKms || !hasContextServiceEntitlement) {
        return updateUserProfile(userId, userRoleData);
      } else {
        var defer = $q.defer();
        defer.resolve();
        return defer.promise;
      }
    }

    function createUserData() {
      var userData = {};
      userData.alias = '';
      userData.teamId = Authinfo.getOrgId();
      userData.attributes = [];
      userData.media = ['chat'];
      userData.role = 'user';
      return userData;
    }

    function getUserLicence(userEmail, users) {
      var aUser = _.find(users, function (user) {
        return _.toLower(userEmail) === _.toLower(user.email);
      });
      if (!_.isNil(aUser)) {
        return _.get(aUser, 'licenses', []);
      } else {
        return [];
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

    function isSunlightUserUpdateRequired(licenses) {
      var addedSunlightLicense = _.find(licenses, function (license) {
        return license.id.indexOf(Config.offerCodes.CDC) >= 0 && license.idOperation === 'ADD';
      });
      return typeof addedSunlightLicense !== 'undefined';
    }

    function isHuronUser(allEntitlements) {
      return _.indexOf(allEntitlements, Config.entitlements.huron) >= 0;
    }

    function isInvitePending(user) {
      return user.pendingStatus;
    }

    function resendInvitation(userEmail, userName, uuid, userStatus, dirsyncEnabled, entitlements) {
      if ((userStatus === 'pending' || userStatus === 'error') && !isHuronUser(entitlements)) {
        return sendSparkWelcomeEmail(userEmail, userName);
      } else if (isHuronUser(entitlements) && !dirsyncEnabled) {
        return HuronUser.sendWelcomeEmail(userEmail, userName, uuid, Authinfo.getOrgId());
      }
      return $q.reject('invitation not sent');
    }

    function sendSparkWelcomeEmail(userEmail, userName) {
      var userData = [{
        'address': userEmail,
        'name': userName,
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

    function getUserPhoto(user) {
      return _.chain(user)
        .get('photos')
        .find(function (photo) {
          return photo.type === 'thumbnail';
        })
        .get('value')
        .value();
    }

    function isValidThumbnail(user) {
      var userPhotoValue = getUserPhoto(user);
      return !(_.startsWith(userPhotoValue, 'file:') || _.isEmpty(userPhotoValue));
    }

    function getFullNameFromUser(user) {
      var givenName = _.get(user, 'name.givenName', '');
      var familyName = _.get(user, 'name.familyName', '');
      if (givenName && familyName) {
        return givenName + ' ' + familyName;
      }
      return (user.displayName) ? user.displayName : user.userName;
    }

    function getPrimaryEmailFromUser(user) {
      var primaryEmail = _.chain(user)
        .get('emails')
        .find({ primary: true })
        .get('value')
        .value();

      if (!primaryEmail) {
        primaryEmail = _.get(user, 'userName');
      }

      return primaryEmail;
    }

    function getPreferredWebExSiteForCalendaring(user) {
      if (!_.isEmpty(user.userPreferences)) {
        var name = _.find(user.userPreferences, function (userPreference) {
          return userPreference.indexOf('calSvcPreferredWebexSite') > 0;
        });
        if (_.isString(name)) {
          return name.substring(name.indexOf(':') + 1).replace(/"/g, '');
        }
      }
    }
  }

})();
