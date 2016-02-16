(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AARouteToUserCtrl', AARouteToUserCtrl);

  /* @ngInject */
  function AARouteToUserCtrl($scope, $translate, AAUiModelService, AutoAttendantCeMenuModelService, AAModelService, $q, Authinfo, Userservice, UserListService, UserServiceVoice, AACommonService) {

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
      startAt: 0
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

    /////////////////////

    function populateUiModel() {
      if (angular.isDefined($scope.fromRouteCall)) {
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
      if (angular.isDefined($scope.fromRouteCall)) {
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

    // get list of users for the provided search string
    // also retrieves extension for user for display, but not for searching
    function getUsers(searchStr) {

      var defer = $q.defer();

      UserListService.listUsers(vm.sort.startAt, vm.sort.maxCount, vm.sort.by, vm.sort.order, function (data, status) {
        if (data.success) {
          vm.users = [];
          _.each(data.Resources, function (aUser) {
            getUserExtension(aUser.id).then(function (extension) {
              // only add to the user list if they have a primary extension
              if (extension) {
                vm.users.push({
                  description: formatName(aUser, extension),
                  id: aUser.id
                });
              }
            }, function (error) {
              // CMI user call failed, not clear if user has extension or not, show just the user in the UI
              vm.users.push({
                description: formatName(aUser, ''),
                id: aUser.id
              });

            });
          });
          defer.resolve(data.Resources);
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

      if (angular.isDefined($scope.fromRouteCall)) {
        var from = angular.isDefined($scope.voicemail) ? 'routeToVoiceMail' : 'routeToUser';

        // existing action for route to user?
        if (!_.find(vm.menuEntry.actions, {
            name: from
          })) {
          if (vm.menuEntry.actions.length === 0) {
            action = AutoAttendantCeMenuModelService.newCeActionEntry(from, '');
            vm.menuEntry.addAction(action);
          } else {
            // make sure action is User not AA, HG, extNum, etc
            vm.menuEntry.actions[0].setName(from);
            vm.menuEntry.actions[0].setValue('');
          }
        }

      } else {

        if ($scope.keyIndex < vm.menuEntry.entries.length) {
          vm.menuKeyEntry = vm.menuEntry.entries[$scope.keyIndex];
        } else {
          vm.menuKeyEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
          var action;
          if (angular.isDefined($scope.voicemail) && $scope.voicemail)
            action = AutoAttendantCeMenuModelService.newCeActionEntry('routeToVoiceMail', '');
          else
            action = AutoAttendantCeMenuModelService.newCeActionEntry('routeToUser', '');
          vm.menuKeyEntry.addAction(action);
        }

      }

      populateUiModel();

    }

    activate();

  }
})();
