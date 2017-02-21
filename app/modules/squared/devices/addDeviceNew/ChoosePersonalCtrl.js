(function () {
  'use strict';

  angular.module('Core')
    .controller('ChoosePersonalCtrl', ChoosePersonalCtrl);
  /* @ngInject */
  function ChoosePersonalCtrl($q, UserListService, $stateParams, $translate) {
    var vm = this;
    var wizardData = $stateParams.wizard.state().data;
    vm.title = wizardData.title;
    vm.error = false;
    vm.selected = undefined;
    vm.selectedStates = [];
    vm.selectUser = selectUser;
    vm.deviceType = wizardData.account.deviceType;

    vm.model = {
      userInputOption: 0,
      uploadProgress: 0,
    };

    vm.placeholder = $translate.instant('directoryNumberPanel.chooseNumber');
    vm.inputPlaceholder = $translate.instant('directoryNumberPanel.searchNumber');

    vm.search = function (searchString) {
      vm.userError = false;
      vm.cisUuid = undefined;
      var deferred = $q.defer();
      if (searchString.length >= 3) {
        vm.noResults = false;
        var callback = function (data) {
          if (!data.success || !data.Resources) {
            deferred.resolve([]);
            vm.noResults = true;
            return;
          }
          var userList = _(data.Resources).map(function (r) {
            var name = null;
            var firstName = null;
            if (r.name) {
              name = r.name.givenName;
              firstName = name.givenName;
              if (r.name.familyName) {
                name += ' ' + r.name.familyName;
              }
            }
            if (_.isEmpty(name)) {
              name = r.displayName;
            }
            if (_.isEmpty(firstName)) {
              firstName = r.displayName;
            }
            if (_.isEmpty(name)) {
              name = r.userName;
            }
            if (_.isEmpty(firstName)) {
              firstName = r.userName;
            }
            r.extractedName = name;
            r.firstName = firstName;
            return r;
          }).value();
          vm.noResults = _.isEmpty(userList);
          deferred.resolve(userList);
        };
        if (wizardData.showPersonal) {
          UserListService.listUsers(0, 10, null, null, callback, searchString, false);
        } else {
          UserListService.listUsers(0, 10, null, null, callback, searchString, false, 'ciscouc');
        }
      } else {
        deferred.resolve([]);
      }
      return deferred.promise;
    };

    function selectUser($item) {
      if (_.includes($item.entitlements, 'ciscouc')) {
        vm.isEntitledToHuron = true;
      } else {
        vm.userError = true;
        vm.isEntitledToHuron = false;
      }
      vm.cisUuid = $item.id;
      vm.userName = $item.userName;
      vm.displayName = $item.displayName;
      vm.selected = $item.extractedName;
      vm.firstName = $item.firstName;
      vm.organizationId = $item.meta.organizationID;
    }

    vm.next = function () {
      $stateParams.wizard.next({
        account: {
          name: vm.displayName,
          cisUuid: vm.cisUuid,
          username: vm.userName,
          isEntitledToHuron: vm.isEntitledToHuron,
        },
        recipient: {
          displayName: vm.displayName,
          firstName: vm.firstName,
          cisUuid: vm.cisUuid,
          email: vm.userName,
          organizationId: vm.organizationId,
        },
      });
    };

    vm.back = function () {
      $stateParams.wizard.back();
    };

    vm.isNameValid = function () {
      if (vm.cisUuid) {
        return true;
      }
    };
  }
})();
