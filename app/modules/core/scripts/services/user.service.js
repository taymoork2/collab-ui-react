(function () {
  'use strict';

  var authinfoModuleName = require('modules/core/scripts/services/authinfo');
  var huronUserModuleName = require('modules/huron/telephony/telephonyUserService');
  var sunlightServiceModuleName = require('modules/sunlight/services').default;
  var phoneNumberModuleName = require('modules/huron/phoneNumber').default;
  var urlConfigModuleName = require('modules/core/config/urlConfig');

  // TODO: relocate this service into 'modules/core/users/shared'
  module.exports = angular.module('core.user', [
    authinfoModuleName,
    huronUserModuleName,
    phoneNumberModuleName,
    sunlightServiceModuleName,
    urlConfigModuleName,
  ]).constant('NAME_DELIMITER', ' \u000B')
    .service('Userservice', Userservice)
    .name;

  /* @ngInject */
  function Userservice($http, $q, $rootScope, Authinfo, Config, HuronUser, Log, NAME_DELIMITER, Notification, SunlightConfigService, PhoneNumberService, UrlConfig) {
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
      onboardUsersLegacy: onboardUsersLegacy,
      onboardUsers: onboardUsers,
      bulkOnboardUsers: bulkOnboardUsers,
      deactivateUser: deactivateUser,
      isHuronUser: isHuronUser,
      resendInvitation: resendInvitation,
      sendSparkWelcomeEmail: sendSparkWelcomeEmail,
      getUserPhoto: getUserPhoto,
      isValidThumbnail: isValidThumbnail,
      getAnyDisplayableNameFromUser: getAnyDisplayableNameFromUser,
      getFullNameFromUser: getFullNameFromUser,
      getPrimaryEmailFromUser: getPrimaryEmailFromUser,
      getUserLicence: getUserLicence,
      getPreferredWebExSiteForCalendaring: getPreferredWebExSiteForCalendaring,
      updateUserData: updateUserData,
      _helpers: {
        mkOnboardUsersPayload: mkOnboardUsersPayload,
        onboardUsersAPI: onboardUsersAPI,
      },
    };

    // TODO: migrate these helpers to 'SunlightUserService'
    var _sunlightHelpers = {
      licenseUpdateRequired: licenseUpdateRequired,
      getUserLicence: getUserLicence,
      createUserData: createUserData,
      isCareFeatureGettingRemoved: isCareFeatureGettingRemoved,
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
        }).then(function (response) {
          var data = response.data;
          data = _.isObject(data) ? data : {};
          $rootScope.$broadcast('Userservice::updateUsers');
          data.success = true;
          if (_.isFunction(callback)) {
            callback(data, response.status, method, response.headers);
          }
          return response;
        }).catch(function (response) {
          var data = response.data;
          data = _.isObject(data) ? data : {};
          data.success = false;
          data.status = response.status;
          if (_.isFunction(callback)) {
            callback(data, response.status, method, response.headers);
          }
          return $q.reject(response);
        });
      } else {
        return $q.resolve();
      }
    }

    function addUsers(usersDataArray, entitlements, callback) {
      var userData = {
        users: [],
      };

      _.forEach(usersDataArray, function (userInfo) {
        var userEmail = _.trim(userInfo.address);
        var userName = _.trim(userInfo.name);
        var user = {
          email: null,
          name: null,
          userEntitlements: entitlements,
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
          .then(function (response) {
            var data = response.data;
            data = _.isObject(data) ? data : {};
            $rootScope.$broadcast('Userservice::updateUsers');
            data.success = true;
            callback(data, response.status);
          })
          .catch(function (response) {
            var data = response.data;
            data = _.isObject(data) ? data : {};
            data.success = false;
            data.status = response.status;

            callback(data, response.status);
          });
      } else {
        callback('No valid emails entered.');
      }
    }

    // DEPRECATED
    // - update all callers of this method to use 'getUserAsPromise()' instead, before removing
    //   this implementation
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
        .then(function (response) {
          var data = response.data;
          data = _.isObject(data) ? data : {};
          data.success = true;
          callback(data, response.status);
          return response;
        })
        .catch(function (response) {
          var data = response.data;
          data = _.isObject(data) ? data : {};
          data.success = false;
          data.status = response.status;
          callback(data, response.status);
          return $q.reject(response);
        });
    }

    function getUserAsPromise(userId, httpConfig) {
      var scimUrl = UrlConfig.getScimUrl(Authinfo.getOrgId()) + '/' + userId;
      var _httpConfig = _.extend({}, httpConfig);
      return $http.get(scimUrl, _httpConfig);
    }

    function updateUserProfile(userid, userData) {
      return updateUserData(userid, userData).then(function (response) {
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

    function updateUserData(userid, userData) {
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
        inviteList: [],
      };

      _.forEach(usersDataArray, function (userInfo) {
        var userEmail = _.trim(userInfo.address);

        var userName = null;
        if (userInfo.name) {
          userName = _.trim(userInfo.name);
        }

        var user = {
          email: userEmail,
          displayName: userName,
          userEntitlements: null,
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
          .then(function (response) {
            var data = response.data;
            data = _.isObject(data) ? data : {};
            data.success = true;
            callback(data, response.status);
          })
          .catch(function (response) {
            var data = response.data;
            data = _.isObject(data) ? data : {};
            data.success = false;
            data.status = response.status;
            callback(data, response.status);
          });
      } else {
        callback('No valid emails entered.');
      }
    }

    function sendEmail(userEmail, adminEmail, callback) {
      var requestBody = {
        recipientEmail: userEmail,
        adminEmail: adminEmail,
      };
      $http.post(userUrl + 'user/mail/provisioning', requestBody)
        .then(function (response) {
          var data = response.data;
          data = _.isObject(data) ? data : {};
          data.success = true;
          callback(data, response.status);
        })
        .catch(function (response) {
          var data = response.data;
          data = _.isObject(data) ? data : {};
          data.success = false;
          data.status = response.status;
          callback(data, response.status);
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
        users: [{
          userRoles: roles,
          email: email,
          name: name,
        }],
      };

      return $http({
        method: 'PATCH',
        url: patchUrl,
        data: requestBody,
      });
    }

    function migrateUsers(users) {
      var usersWithEmail = _.map(users, function (user) {
        return {
          email: user.userName,
        };
      });
      var requestBody = {
        users: usersWithEmail,
      };

      return $http.post(userUrl + 'organization/' + Authinfo.getOrgId() + '/users/migrate', requestBody);
    }

    // DEPRECATED
    // - 'onboardUsers()' should be able to satisfy the behavior requirements of this function, but
    //   this needs to be verified
    // - once all callers have been replaced, rm this
    function onboardUsersLegacy(usersDataArray, entitlements, licenses, cancelPromise) {
      // bind the licenses and entitlements that are shared by all users
      var getUserPayload = getUserPayloadForOnboardAPI.bind({
        licenses: licenses,
        entitlements: entitlements,
      });
      var userPayload = getUserPayload(usersDataArray, true);
      return onboardUsersAPI(userPayload, cancelPromise);
    }

    /**
     * Onboard users that share the same set of entitlements and licenses
     */
    // notes:
    // - as of 2018-01-12, 'licenses' and 'userEntitlements' are optional properties now (they will
    //   default to empty lists used in the request payload if left undefined)
    // - if both 'licenses' and 'userEntitlements' are empty lists, onboard API will apply
    //   appropriate logic (the default auto-assign template is applied if one is defined and the
    //   org has been enabled to use it)
    function onboardUsers(options) {
      var users = options.users;
      var licenses = options.licenses;
      var userEntitlements = options.userEntitlements;
      var onboardMethod = options.onboardMethod;
      var cancelPromise = options.cancelPromise;
      var payload = service._helpers.mkOnboardUsersPayload(users, licenses, userEntitlements, onboardMethod);
      return service._helpers.onboardUsersAPI(payload, cancelPromise);
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

    function mkOnboardUsersPayload(users, _licenses, _userEntitlements, _onboardMethod) {
      // default 'licenses' and 'userEntitlements' to empty lists if falsey
      var licenses = _licenses || [];
      var userEntitlements = _userEntitlements || [];
      var onboardMethod = _onboardMethod || null;

      var usersPayload = _.map(users, function (user) {
        // early-out if email is falsey
        var userEmail = _.trim(user.address);
        if (!userEmail) {
          return;
        }

        var sanitizedUser = {};
        _.set(sanitizedUser, 'email', userEmail);
        _.set(sanitizedUser, 'licenses', licenses);
        _.set(sanitizedUser, 'userEntitlements', userEntitlements);
        _.set(sanitizedUser, 'onboardMethod', onboardMethod);

        // set 'name' property only if both 'givenName' or 'familyName' are truthy
        _.set(sanitizedUser, 'name', tokenParseFirstLastName(user.name));
        if (!sanitizedUser.name.givenName && !sanitizedUser.name.familyName) {
          delete sanitizedUser.name;
        }

        // set 'displayName' if truthy
        if (user.displayName) {
          _.set(sanitizedUser, 'displayName', user.displayName);
        }

        if (_.size(licenses)) {
          sanitizedUser.licenses = buildUserSpecificProperties(user, licenses);
        }
        if (_.size(userEntitlements)) {
          sanitizedUser.userEntitlements = buildUserSpecificProperties(user, userEntitlements);
        }

        if (!_.isNull(onboardMethod)) {
          _.set(sanitizedUser, 'onboardMethod', onboardMethod);
        }

        return sanitizedUser;
      });

      // prune out falsey values and return
      usersPayload = _.compact(usersPayload);
      return {
        users: usersPayload,
      };
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
      var onboardMethod = !_.isNull(users[0].onboardMethod) ? users[0].onboardMethod : null;
      var userPayload = {
        users: [],
      };

      _.forEach(users, function (userData) {
        var userEmail = _.trim(userData.address);
        var userName = userData.name;
        var displayName = userData.displayName;

        var user = {
          email: null,
          name: {
            givenName: null,
            familyName: null,
          },
          userEntitlements: null,
          licenses: null,
          onboardMethod: null,
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

          if (!_.isNull(onboardMethod)) {
            user.onboardMethod = onboardMethod;
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
        givenName: givenName,
        familyName: familyName,
      };
    }

    function onboardUsersAPI(userPayload, cancelPromise) {
      if (userPayload && _.isArray(userPayload.users) && userPayload.users.length > 0) {
        var onboardUsersPromise = $http.post(userUrl + 'organization/' + Authinfo.getOrgId() + '/users/onboard', userPayload, {
          timeout: cancelPromise,
        });
        onboardUsersPromise.then(function (response) {
          checkAndUpdateSunlightUser(response.data.userResponse, userPayload.users);
        });
        return onboardUsersPromise;
      } else {
        return $q.reject('No valid emails entered.');
      }
    }

    function checkRolesAndOnboardSunlightUser(userId, ciUserData, sunlightUserData) {
      var needSyncKms = !_.includes(ciUserData.roles, Config.backend_roles.spark_synckms);
      var needContextServiceEntitlement = !_.includes(ciUserData.entitlements, Config.entitlements.context);

      onboardSunlightUser(userId, needSyncKms, needContextServiceEntitlement, sunlightUserData);
    }

    function onboardSunlightUser(userId, needSyncKms, needContextServiceEntitlement, sunlightUserData) {
      return patchSunlightRolesAndEntitlements(userId, needSyncKms, needContextServiceEntitlement)
        .then(function () {
          SunlightConfigService.updateUserInfo(sunlightUserData, userId)
            .catch(function (response) {
              Notification.errorWithTrackingId(response, 'usersPage.careAddUserError');
            });
        })
        .catch(function (response) {
          Notification.errorWithTrackingId(response, 'usersPage.careAddUserRoleError');
        });
    }

    function checkAndUpdateSunlightUser(userResponse, users) {
      var userResponseSuccess = _.filter(userResponse, function (response) {
        return response.status === 200;
      });
      _.each(userResponseSuccess, function (userResponseSuccess) {
        var userLicenses = _sunlightHelpers.getUserLicence(userResponseSuccess.email, users);
        var userId = userResponseSuccess.uuid;
        if ((_sunlightHelpers.licenseUpdateRequired(userLicenses, Config.offerCodes.CDC, 'ADD')) || (_sunlightHelpers.licenseUpdateRequired(userLicenses, Config.offerCodes.CVC, 'ADD'))) {
          var sunlightUserData = _sunlightHelpers.createUserData();
          // Get user to check for roles and entitlements
          getUserAsPromise(userId)
            .then(function (ciUserData) {
              if (ciUserData.status === 200) {
                checkRolesAndOnboardSunlightUser(userId, ciUserData, sunlightUserData);
              }
            });
        } else if (_sunlightHelpers.isCareFeatureGettingRemoved(userLicenses)) {
          SunlightConfigService.deleteUser(userId)
            .catch(function (response) {
              Notification.errorWithTrackingId(response, 'usersPage.careDeleteUserError');
            });
        }
      });
    }

    function isCareFeatureGettingRemoved(licenses) {
      var careLicenses = _.filter(licenses, function (license) {
        return (_.includes(license.id, Config.offerCodes.CDC) || _.includes(license.id, Config.offerCodes.CVC));
      });
      var hasCareLicenses = !!_.size(careLicenses);
      var careLicensesToAdd = _.filter(careLicenses, { idOperation: 'ADD' });
      var hasCareLicensesToAdd = !!_.size(careLicensesToAdd);
      return hasCareLicenses && !hasCareLicensesToAdd;
    }

    function licenseUpdateRequired(licenses, offerCode, idOperation) {
      return _.some(licenses, function (license) {
        if (license.idOperation === idOperation) {
          return _.includes(license.id, offerCode);
        }
      });
    }

    function patchSunlightRolesAndEntitlements(userId, needSyncKms, needContextServiceEntitlement) {
      var userRoleData = {
        schemas: Config.scimSchemas,
        roles: [],
      };
      if (needSyncKms) {
        userRoleData.roles.push(Config.backend_roles.spark_synckms);
      }

      if (needContextServiceEntitlement) {
        userRoleData.entitlements = [Config.entitlements.context];
      }
      if (needSyncKms || needContextServiceEntitlement) {
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
        var entitlementOrLicense = _.cloneDeep(_entitlementOrLicense);
        if (!_.has(entitlementOrLicense, 'properties')) {
          entitlementOrLicense.properties = {};
        }

        // Communications license or ciscouc entitlement
        if (_.startsWith(entitlementOrLicense.id, 'CO_') || entitlementOrLicense.entitlementName === 'ciscoUC') {
          if (user.location) {
            entitlementOrLicense.properties.location = user.location;
          }
          if (user.internalExtension) {
            entitlementOrLicense.properties.internalExtension = user.internalExtension;
          }
          if (user.directLine) {
            entitlementOrLicense.properties.directLine = PhoneNumberService.getE164Format(user.directLine);
          }
        }

        return entitlementOrLicense;
      });
    }

    function isHuronUser(allEntitlements) {
      return _.indexOf(allEntitlements, Config.entitlements.huron) >= 0;
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
        address: userEmail,
        name: userName,
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

    function getAnyDisplayableNameFromUser(user) {
      var givenName = _.get(user, 'name.givenName', '');
      var familyName = _.get(user, 'name.familyName', '');
      var nameParts = [];
      if (givenName) {
        nameParts.push(givenName);
      }
      if (familyName) {
        nameParts.push(familyName);
      }
      if (nameParts.length) {
        return nameParts.join(' ');
      }
      if (user.displayName) {
        return user.displayName;
      }
      return user.userName;
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
