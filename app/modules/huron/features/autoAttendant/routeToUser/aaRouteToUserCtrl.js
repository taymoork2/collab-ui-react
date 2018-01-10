(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AARouteToUserCtrl', AARouteToUserCtrl);

  /* @ngInject */
  function AARouteToUserCtrl($q, $scope, $translate, AAUiModelService, AAUserService, AACommonService, Authinfo, AutoAttendantCeMenuModelService, LineResource, UserListService, Userservice, UserServiceVoice) {
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

    //constants: squareFusionEc and squareFusionUc will used when we replace hybrid toggle with the hybrid api call
    CONSTANTS.squareFusionEc = 'squared-fusion-ec';
    CONSTANTS.squareFusionUc = 'squared-fusion-uc';
    CONSTANTS.ciscouc = 'ciscouc';
    CONSTANTS.spark = 'spark';

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

    // format name with extension
    function formatName(user, extension) {
      var name;
      if (!_.isUndefined(user.displayName)) {
        name = user.displayName;
      } else {
        name = user.userName;
      }

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
            if (extension != null) {
              return formatName(userObj, extension);
            } else {
              return formatName(userObj, '');
            }
          },
          function () {
            return formatName(userObj, '');
          }
        );
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
              // if it's not found, there is no extension, don't add to list.
              if (error.status === 404) {
                if (!$scope.voicemail && orgHasHybridEnabled) {
                  // when user has selected route to user and org has hybrid enabled
                  if (!_.isEmpty(aUser.entitlements) && (_.indexOf(aUser.entitlements, CONSTANTS.spark) > -1)) {
                    var sparkCallUser = (_.indexOf(aUser.entitlements, CONSTANTS.ciscouc) > -1);
                    var hybridUser = (_.indexOf(aUser.entitlements, CONSTANTS.squareFusionEc) > -1);

                    if (!sparkCallUser && checkIfUsersLengthLessThanFullLoad()) {
                      // appends (spark) in place of extension in case of callFreeUsers
                      updateUserData(aUser, CONSTANTS.spark);
                    }
                  }
                }
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
      }, searchStr, false);

      return defer.promise;
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
        if (!$scope.voicemail) {
          //TODO: Replace hybrid toggle with actual API call andd add check for whether enterprise trunking is enabled
          if (AACommonService.isHybridEnabledOnOrg()) {
            orgHasHybridEnabled = true;
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
