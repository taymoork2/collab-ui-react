(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AARouteToUserCtrl', AARouteToUserCtrl);

  /* @ngInject */
  function AARouteToUserCtrl($q, $scope, $translate, AutoAttendantHybridCareService, AAUiModelService, AAUserService, AACommonService, Authinfo, AutoAttendantCeMenuModelService, LineResource, UserListService, Userservice, UserServiceVoice) {
    var vm = this;
    var conditional = 'conditional';

    vm.userSelected = {
      description: '',
      id: '',
    };

    var userQuery = {
      customerId: Authinfo.getOrgId(),
      userId: '',
    };

    vm.users = [];
    vm.sort = {
      by: 'name',
      order: 'ascending',
      maxCount: 10,
      startAt: 0,
      fullLoad: 10, // how many to query, a full listing
    };

    vm.selectPlaceholder = $translate.instant('autoAttendant.selectPlaceholder');
    vm.inputPlaceHolder = $translate.instant('autoAttendant.inputPlaceHolder');

    vm.uiMenu = {};
    vm.menuEntry = {
      entries: [],
    };
    vm.menuKeyEntry = {};

    vm.populateUiModel = populateUiModel;
    vm.saveUiModel = saveUiModel;
    vm.getUser = getUser;
    vm.getUsers = getUsers;

    // the CE action verb is 'routeToUser' or 'routeToVoiceMail'
    var routeToVoiceMail = 'routeToVoiceMail';
    var routeToUser = 'routeToUser';

    var fromRouteCall = false;
    var fromDecision = false;
    var orgHasHybridEnabled = false;
    var CONSTANTS = {};

    CONSTANTS.spark = 'spark';
    CONSTANTS.work = 'work';
    CONSTANTS.squaredFusionEc = 'squared-fusion-ec';
    CONSTANTS.squaredFusionUc = 'squared-fusion-uc';

    /////////////////////

    function populateUiModel() {
      var entry, action;

      if (fromRouteCall || fromDecision) {
        entry = _.get(vm.menuEntry, 'actions[0].queueSettings.fallback', vm.menuEntry);
      } else {
        entry = _.get(vm.menuKeyEntry, 'actions[0].queueSettings.fallback', vm.menuKeyEntry);
      }

      action = _.get(entry, 'actions[0]');

      if (action && _.get(action, 'name') === conditional) {
        action = _.get(action.then, 'queueSettings.fallback.actions[0]', action.then);
      }

      vm.userSelected.id = action.getValue();

      if (vm.userSelected.id) {
        getFormattedUserAndExtension(vm.userSelected.id).then(function (userName) {
          vm.userSelected.description = userName;
        });
      }
      if (AACommonService.isHybridEnabledOnOrg()) {
        AutoAttendantHybridCareService.isHybridAndEPTConfigured().then(function (result) {
          orgHasHybridEnabled = result;
        });
      }
    }

    function saveUiModel() {
      AACommonService.setPhoneMenuStatus(true);

      var entry, action;

      if (fromRouteCall || fromDecision) {
        entry = vm.menuEntry;
      } else {
        entry = vm.menuKeyEntry;
      }
      action = _.get(entry, 'actions[0].queueSettings.fallback.actions[0]', entry.actions[0]);
      if (_.get(action, 'name') === conditional) {
        action = _.get(action.then, 'queueSettings.fallback.actions[0]', action.then);
      }
      action.setValue(vm.userSelected.id);
    }

    function getNameAsPerPriority(user) {
      var name;
      if (!_.isEmpty(_.get(user, 'displayName'))) {
        name = user.displayName;
      } else if (_.isEmpty(_.get(user.name, 'givenName')) && _.isEmpty(_.get(user.name, 'familyName'))) {
        name = _.get(user, 'userName');
      } else {
        if (_.isEmpty(_.get(user.name, 'givenName'))) {
          name = _.get(user.name, 'familyName');
        } else {
          name = _.get(user.name, 'givenName') + ' ' + _.get(user.name, 'familyName');
        }
      }
      return name;
    }

    // format name with extension
    function formatName(user, extension) {
      var name = getNameAsPerPriority(user);
      if (!_.isUndefined(extension) && extension.length > 0) {
        return name + ' (' + extension + ')';
      } else {
        return name;
      }
    }

    // get user by uuid
    function getUser(uuid) {
      var deferred = $q.defer();
      Userservice.getUser(uuid, function (user) {
        if (user.success) {
          return deferred.resolve(user);
        } else {
          return $q.reject();
        }
      });
      return deferred.promise;
    }

    // get the formatted user and extension provided the user uuid
    // used on load to populate the UI model
    function getFormattedUserAndExtension(uuid) {
      return getUser(uuid).then(function (user) {
        var userObj = user;
        userQuery.userId = user.id;

        return getUserExtension(userQuery).then(
          function (extension) {
            // retrieves spark call user
            if (extension != null) {
              return formatName(userObj, extension);
            } else {
              return formatName(userObj, '');
            }
          }).catch(function (error) {
          if (error.status === 404) {
            // When the org has hybrid enabled, check for retrieving call free or hybrid users
            return addOrRetrieveUsers(user, false);
          } else {
            return formatName(userObj, '');
          }
        });
      });
    }

    // get user's primary extension via CMI users API property primaryDirectoryNumber
    function getUserExtension(user) {
      if (AACommonService.isMultiSiteEnabled()) {
        return AAUserService.get(user).$promise.then(function (response) {
          var numbers = _.map(response.numbers, 'siteToSite');

          return numbers;
        }).catch(function (error) {
          // failure
          return $q.reject(error);
        });
      }
      // otherwise not Multi-Site
      return UserServiceVoice.query(user).$promise.then(function (response) {
        // success
        if (!_.isUndefined(response.primaryDirectoryNumber) && response.primaryDirectoryNumber != null) {
          return [response.primaryDirectoryNumber.pattern];
        } else {
          // the user actually has no extension - represented as null in the json, which works here as well
          return null;
        }
      }).catch(function (response) {
        // failure
        return $q.reject(response);
      });
    }

    // get extension's voicemail profile
    function getVoicemailProfile(pattern) {
      return LineResource.query({
        customerId: Authinfo.getOrgId(),
        pattern: pattern,
      }).$promise.then(
        function (response) {
          // success
          return response[0].voiceMailProfile;
        },
        function () {
          // failure
          return null;
        });
    }
    function addExtensionToUsers(aUser, extension) {
      _.forEach(extension, function (ext) {
        if (checkIfUsersLengthLessThanFullLoad()) {
          updateUserData(aUser, ext);
        }
      });
    }

    vm.abortSearchPromise = null;

    // get list of users for the provided search string
    // also retrieves extension for user for display, but not for searching

    function getUsers(searchStr, startat) {
      var abortSearchPromise = vm.abortSearchPromise;

      // if we didn't get a start-at, we are starting over
      if (_.isUndefined(startat)) {
        startat = vm.sort.startAt;
        vm.users = [];
        if (vm.abortSearchPromise) {
          vm.abortSearchPromise.resolve();
        }
        vm.abortSearchPromise = $q.defer();
        abortSearchPromise = vm.abortSearchPromise;
      }

      var defer = $q.defer();

      UserListService.listUsers(startat, vm.sort.maxCount, vm.sort.by, vm.sort.order, function (data) {
        if (data.success) {
          var userInfoPromises = [];
          _.forEach(data.Resources, function (aUser) {
            userQuery.userId = aUser.id;

            userInfoPromises.push(getUserExtension(userQuery).then(function (extension) {
              // only add to the user list if they have a primary extension
              if (extension) {
                // and for voicemail, only add to the list if they have a voicemail profile for the extension
                if ($scope.voicemail) {
                  return getVoicemailProfile(extension).then(function (voicemailProfile) {
                    if (voicemailProfile) {
                      addExtensionToUsers(aUser, extension);
                    }
                  });
                } else {
                  // not voicemail, just add the user with extension
                  addExtensionToUsers(aUser, extension);
                }
              }
            }).catch(function (error) {
              if (error.status === 404) {
                addOrRetrieveUsers(aUser, true);
              } else {
                // if CMI user call otherwise failed, not immediately clear if user has extension or not, show just the user in the UI
                updateUserData(aUser, '');
              }
            }));
          });

          $q.all(userInfoPromises).then(function () {
            // try to offer a minimum amount of matches.
            // if enough users didn't make it past sanity checks,
            // and we're still getting results back, then get some more.
            if (checkIfUsersLengthLessThanFullLoad() && _.size(data.Resources) && !abortSearchPromise.promise.$$state.status) {
              startat += vm.sort.maxCount;
              defer.resolve(getUsers(searchStr, startat));
            } else {
              // otherwise we're done
              vm.users.sort(AACommonService.sortByProperty('description'));
              defer.resolve(data.Resources);
            }
          });
        } else {
          defer.reject();
        }
      }, searchStr, false, null, null, orgHasHybridEnabled);
      return defer.promise;
    }

    function getHybridUserPhoneNumber(phoneNumbers) {
      var result;
      if (!_.isEmpty(phoneNumbers) && phoneNumbers.length > 0) {
        result = _.find(phoneNumbers, function (number) {
          if (!_.isEmpty(_.get(number, 'type')) && _.isEqual(_.get(number, 'type'), CONSTANTS.work)) {
            return _.get(number, 'value', '');
          }
        });
      }
      return result;
    }

    function addOrRetrieveUsers(user, pushUser) {
      // This function can be used for getting all users or retrieve the already selected user on load
      // pushUser parameter is set to true when getting all users and set to false when retrieving already selected user
      if (orgHasHybridEnabled) {
        if (!_.isEmpty(user.entitlements) && (_.indexOf(user.entitlements, CONSTANTS.spark) > -1)) {
          var isUserHybrid = (_.indexOf(user.entitlements, CONSTANTS.squaredFusionEc) > -1) && (_.indexOf(user.entitlements, CONSTANTS.squaredFusionUc) > -1);

          if (isUserHybrid) {
            var phoneNumber = getHybridUserPhoneNumber(_.get(user, 'phoneNumbers'));
            if (!_.isUndefined(phoneNumber)) {
              return (pushUser) ? updateUserData(user, phoneNumber.value) : formatName(user, phoneNumber.value);
            } else {
              // when hybrid user do not have an extension
              return (pushUser) ? updateHybridUserDataWithoutExtension(user) : getHybridUserDescription(user);
            }
          } else {
            // when user is call free
            return (pushUser) ? updateUserData(user, _.capitalize(CONSTANTS.spark)) : formatName(user, _.capitalize(CONSTANTS.spark));
          }
        }
      }
    }

    function getHybridUserDescription(user) {
      var name = getNameAsPerPriority(user);
      if (name !== user.userName) {
        name = name + ' (' + user.userName + ')';
      }
      return name;
    }

    function updateHybridUserDataWithoutExtension(user) {
      var name = getHybridUserDescription(user);

      vm.users.push({
        description: name,
        id: user.id,
      });
    }

    function checkIfUsersLengthLessThanFullLoad() {
      return (_.size(vm.users) < vm.sort.fullLoad);
    }

    function updateUserData(user, extension) {
      vm.users.push({
        description: formatName(user, extension),
        id: user.id,
      });
    }

    function checkForRouteToVU(action, routeToName) {
      // make sure action is V or U not External Number, User, etc
      if (!(action.getName() === routeToName)) {
        action.setName(routeToName);
        action.setValue('');
        delete action.queueSettings;
      }
    }

    function activate() {
      var routeToUserOrVM = !_.isUndefined($scope.voicemail) ? routeToVoiceMail : routeToUser;

      var ui = AAUiModelService.getUiModel();

      if ($scope.fromDecision) {
        var conditionalAction;
        fromDecision = true;

        vm.uiMenu = ui[$scope.schedule];
        vm.menuEntry = vm.uiMenu.entries[$scope.index];
        conditionalAction = _.get(vm.menuEntry, 'actions[0]', '');
        if (!conditionalAction || conditionalAction.getName() !== conditional) {
          conditionalAction = AutoAttendantCeMenuModelService.newCeActionEntry(conditional, '');
          vm.menuEntry.actions[0] = conditionalAction;
        }
        if (!$scope.fromFallback) {
          if (!conditionalAction.then) {
            conditionalAction.then = {};
            conditionalAction.then = AutoAttendantCeMenuModelService.newCeActionEntry(routeToUserOrVM, '');
          } else {
            checkForRouteToVU(conditionalAction.then, routeToUserOrVM);
          }
        }
      } else {
        if ($scope.fromRouteCall) {
          vm.uiMenu = ui[$scope.schedule];
          vm.menuEntry = vm.uiMenu.entries[$scope.index];
          fromRouteCall = true;

          if (!$scope.fromFallback) {
            if (vm.menuEntry.actions.length === 0) {
              action = AutoAttendantCeMenuModelService.newCeActionEntry(routeToUserOrVM, '');
              vm.menuEntry.addAction(action);
            } else {
              checkForRouteToVU(vm.menuEntry.actions[0], routeToUserOrVM);
            }
          }
        } else {
          vm.menuEntry = AutoAttendantCeMenuModelService.getCeMenu($scope.menuId);
          if ($scope.keyIndex < vm.menuEntry.entries.length) {
            vm.menuKeyEntry = vm.menuEntry.entries[$scope.keyIndex];
          } else {
            vm.menuKeyEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
            var action = AutoAttendantCeMenuModelService.newCeActionEntry(routeToUserOrVM, '');
            vm.menuKeyEntry.addAction(action);
          }
        }
      }

      if ($scope.fromFallback) {
        var entry;
        if (_.has(vm.menuKeyEntry, 'actions[0]')) {
          entry = vm.menuKeyEntry.actions[0];
        } else {
          entry = vm.menuEntry.actions[0];
        }
        if (_.get(entry, 'name') === conditional) {
          entry = entry.then;
        }

        var fallbackAction = _.get(entry, 'queueSettings.fallback.actions[0]');
        if (fallbackAction && (fallbackAction.getName() !== routeToUserOrVM)) {
          fallbackAction.setName(routeToUserOrVM);
          fallbackAction.setValue('');
        }
      }
      populateUiModel();
    }

    activate();
  }
})();
