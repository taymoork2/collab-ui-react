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

    if (angular.isDefined($scope.voicemail) && $scope.voicemail)
      vm.selectPlaceholder = $translate.instant('autoAttendant.routeToMailboxPlaceholder');
    else
      vm.selectPlaceholder = $translate.instant('autoAttendant.selectUserPlaceHolder');

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
      vm.userSelected.id = vm.menuKeyEntry.actions[0].getValue();
      if (vm.userSelected.id) {
        getFormattedUserAndExtension(vm.userSelected.id).then(function (userName) {
          vm.userSelected.description = userName;
        });
      }
    }

    function saveUiModel() {
      AACommonService.setPhoneMenuStatus(true);
      vm.menuKeyEntry.actions[0].setValue(vm.userSelected.id);
    }

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

    function getFormattedUserAndExtension(uuid) {
      return getUser(uuid).then(function (user) {
        var userObj = user;
        return getUserExtension(user.id).then(

          function (extension) {
            return formatName(userObj, extension);
          },
          function (error) {
            return formatName(userObj, '');
          }
        );
      });
    }

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
            return "";
        },
        function (response) {
          // failure
          return $q.reject(response);
        }
      );
    }

    function getUsers(searchStr) {

      var defer = $q.defer();

      UserListService.listUsers(vm.sort.startAt, vm.sort.maxCount, vm.sort.by, vm.sort.order, function (data, status) {
        if (data.success) {
          vm.users = [];
          _.each(data.Resources, function (aUser) {
            getUserExtension(aUser.id).then(function (extension) {
              vm.users.push({
                description: formatName(aUser, extension),
                id: aUser.id
              });
            }, function (error) {
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

      if ($scope.keyIndex < vm.menuEntry.entries.length) {
        vm.menuKeyEntry = vm.menuEntry.entries[$scope.keyIndex];
      } else {
        vm.menuKeyEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
        var action;
        if (angular.isDefined($scope.voicemail) && $scope.voicemail)
          action = AutoAttendantCeMenuModelService.newCeActionEntry('routeToMailbox', '');
        else
          action = AutoAttendantCeMenuModelService.newCeActionEntry('routeToUser', '');
        vm.menuKeyEntry.addAction(action);
      }

      getUsers().then(function () {
        populateUiModel();
      });

    }

    activate();

  }
})();
