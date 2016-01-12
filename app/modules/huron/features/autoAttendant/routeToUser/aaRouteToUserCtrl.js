(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AARouteToUserCtrl', AARouteToUserCtrl);

  /* @ngInject */
  function AARouteToUserCtrl($scope, $translate, AAUiModelService, AutoAttendantCeMenuModelService, AAModelService, $q, Userservice, UserListService) {

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

    var rtUser = 'routeToUser';

    /////////////////////

    function populateUiModel() {
      vm.userSelected.id = vm.menuKeyEntry.actions[0].getValue();
      if (vm.userSelected.id) {
        getUser(vm.userSelected.id).then(function (userName) {
          vm.userSelected.description = userName;
        });
      }
    }

    function saveUiModel() {
      vm.menuKeyEntry.actions[0].setValue(vm.userSelected.id);
    }

    function getUserName(name, userId) {
      var userName = '';
      userName = (name && name.givenName) ? name.givenName : '';
      userName = (name && name.familyName) ? (userName + ' ' + name.familyName).trim() : userName;
      userName = (userName) ? userName : userId;
      return userName;
    }

    function formatName(user) {
      return getUserName(user.name, user.userName) + ' (' + user.displayName + ')';
    }

    function getUser(uuid) {
      var deferred = $q.defer();
      Userservice.getUser(uuid, function (user) {
        deferred.resolve(formatName(user));
      });
      return deferred.promise;
    }

    function getUsers(searchStr) {

      var defer = $q.defer();

      UserListService.listUsers(vm.sort.startAt, vm.sort.maxCount, vm.sort.by, vm.sort.order, function (data, status) {
        if (data.success) {
          vm.users = [];
          _.each(data.Resources, function (aUser) {
            vm.users.push({
              description: formatName(aUser),
              id: aUser.id
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
        var action = AutoAttendantCeMenuModelService.newCeActionEntry(rtUser, 'phoneMenuRouteUser');
        vm.menuKeyEntry.addAction(action);
      }

      getUsers().then(function () {
        populateUiModel();
      });

    }

    activate();

  }
})();
