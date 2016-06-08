(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AARouteToUserCtrl', AARouteToUserCtrl);

  /* @ngInject */
  function AARouteToUserCtrl($scope, $translate, AAUiModelService, AutoAttendantCeMenuModelService, AAModelService, $q, Authinfo, Userservice, UserListService, UserServiceVoice, AACommonService, LineService) {

    var vm = this;

    vm.userSelected = {
      description: '',
      id: ''
    };

    vm.users = [];
    vm.sort = {
      by: 'name',
      order: 'ascending',
      maxCount: 10,
      startAt: 0,
      fullLoad: 10 // how many to query, a full listing
    };

    vm.selectPlaceholder = $translate.instant('autoAttendant.selectPlaceHolder');
    vm.inputPlaceHolder = $translate.instant('autoAttendant.inputPlaceHolder');

    vm.aaModel = {};
    vm.uiMenu = {};
    vm.menuEntry = {
      entries: []
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

    /////////////////////

    function populateUiModel() {
      if (fromRouteCall) {
        vm.userSelected.id = vm.menuEntry.actions[0].getValue();
      } else {
        vm.userSelected.id = vm.menuKeyEntry.actions[0].getValue();
      }

      if (vm.userSelected.id) {
        getFormattedUserAndExtension(vm.userSelected.id).then(function (userName) {
          vm.userSelected.description = userName;
        });
      }
    }

    function saveUiModel() {
      AACommonService.setPhoneMenuStatus(true);
      if (fromRouteCall) {
        vm.menuEntry.actions[0].setValue(vm.userSelected.id);
      } else {
        vm.menuKeyEntry.actions[0].setValue(vm.userSelected.id);
      }
    }

    // format name with extension
    function formatName(user, extension) {
      var name;
      if (angular.isDefined(user.displayName))
        name = user.displayName;
      else
        name = user.userName;

      if (angular.isDefined(extension) && extension.length > 0)
        return name + ' (' + extension + ')';
      else
        return name;
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
        return getUserExtension(user.id).then(
          function (extension) {
            if (extension != null) {
              return formatName(userObj, extension);
            } else {
              return formatName(userObj, '');
            }
          },
          function (error) {
            return formatName(userObj, '');
          }
        );
      });
    }

    // get user's primary extension via CMI users API property primaryDirectoryNumber
    function getUserExtension(uuid) {
      return UserServiceVoice.query({
        customerId: Authinfo.getOrgId(),
        userId: uuid
      }).$promise.then(
        function (response) {
          // success
          if (angular.isDefined(response.primaryDirectoryNumber) && response.primaryDirectoryNumber != null)
            return response.primaryDirectoryNumber.pattern;
          else
          // the user actually has no extension - represented as null in the json, which works here as well
            return null;
        },
        function (response) {
          // failure
          return $q.reject(response);
        }
      );
    }

    // get extension's voicemail profile
    function getVoicemailProfile(pattern) {
      return LineService.query({
        customerId: Authinfo.getOrgId(),
        pattern: pattern
      }).$promise.then(
        function (response) {
          // success
          return response[0].voiceMailProfile;
        },
        function (response) {
          // failure
          return null;
        }
      );
    }

    vm.abortSearchPromise = null;

    // get list of users for the provided search string
    // also retrieves extension for user for display, but not for searching
    function getUsers(searchStr, startat) {

      var abortSearchPromise = vm.abortSearchPromise;

      // if we didn't get a start-at, we are starting over
      if (!angular.isDefined(startat)) {
        startat = vm.sort.startAt;
        vm.users = [];
        if (vm.abortSearchPromise) {
          vm.abortSearchPromise.resolve();
        }
        vm.abortSearchPromise = $q.defer();
        abortSearchPromise = vm.abortSearchPromise;
      }

      var defer = $q.defer();

      UserListService.listUsers(startat, vm.sort.maxCount, vm.sort.by, vm.sort.order, function (data, status) {

        if (data.success) {
          var userInfoPromises = [];
          _.each(data.Resources, function (aUser) {

            userInfoPromises.push(getUserExtension(aUser.id).then(function (extension) {
              // only add to the user list if they have a primary extension
              if (extension) {
                // and for voicemail, only add to the list if they have a voicemail profile for the extension
                if ($scope.voicemail) {
                  return getVoicemailProfile(extension).then(function (voicemailProfile) {
                    if (voicemailProfile) {
                      vm.users.push({
                        description: formatName(aUser, extension),
                        id: aUser.id
                      });
                    }
                  });
                } else {
                  // not voicemail, just add the user with extension
                  vm.users.push({
                    description: formatName(aUser, extension),
                    id: aUser.id
                  });
                }
              }
            }, function (error) {
              // if it's not found, there is no extension, don't add to list.
              if (error.status != 404) {
                // if CMI user call otherwise failed, not immediately clear if user has extension or not, show just the user in the UI
                vm.users.push({
                  description: formatName(aUser, ''),
                  id: aUser.id
                });
              }

            }));
          });
          $q.all(userInfoPromises).then(function () {
            // try to offer a minimum amount of matches.
            // if enough users didn't make it past sanity checks,
            // and we're still getting results back, then get some more.
            if (_.size(vm.users) < vm.sort.fullLoad && _.size(data.Resources) && !abortSearchPromise.promise.$$state.status) {

              startat += vm.sort.maxCount;

              /* Adjust the maxCount for query so we don't go over. 
               * Use of fullLoad instead of maxCount will keep maxCount from
               * going negative
               */
              vm.sort.maxCount = vm.sort.fullLoad - _.size(vm.users);

              defer.resolve(getUsers(searchStr, startat));
            } else {
              // otherwise we're done
              defer.resolve(data.Resources);
            }
          });
        } else {
          defer.reject();
        }

      }, searchStr, false);

      return defer.promise;

    }

    function activate() {
      vm.aaModel = AAModelService.getAAModel();
      var ui = AAUiModelService.getUiModel();

      vm.uiMenu = ui[$scope.schedule];
      vm.menuEntry = vm.uiMenu.entries[$scope.index];
      var routeToUserOrVM = angular.isDefined($scope.voicemail) ? routeToVoiceMail : routeToUser;

      if ($scope.fromRouteCall) {

        fromRouteCall = true;

        if (vm.menuEntry.actions.length === 0) {
          action = AutoAttendantCeMenuModelService.newCeActionEntry(routeToUserOrVM, '');
          vm.menuEntry.addAction(action);
        } else {
          // make sure action is User||VoiceMail not AA, HG, extNum, etc
          if (!(vm.menuEntry.actions[0].getName() === routeToUserOrVM)) {
            vm.menuEntry.actions[0].setName(routeToUserOrVM);
            vm.menuEntry.actions[0].setValue('');
          }
        }

      } else {

        if ($scope.keyIndex < vm.menuEntry.entries.length) {
          vm.menuKeyEntry = vm.menuEntry.entries[$scope.keyIndex];
        } else {
          vm.menuKeyEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
          var action = AutoAttendantCeMenuModelService.newCeActionEntry(routeToUserOrVM, '');
          vm.menuKeyEntry.addAction(action);
        }

      }

      populateUiModel();

    }

    activate();

  }
})();
