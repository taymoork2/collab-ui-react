(function () {
  'use strict';

  angular.module('Core')
    .controller('ChoosePersonalCtrl', ChoosePersonalCtrl);
  /* @ngInject */
  function ChoosePersonalCtrl($q, $http, UserListService, OtpService, Notification, CsdmConfigService, Authinfo, $stateParams, $translate) {
    var vm = this;
    vm.wizardData = $stateParams.wizard.state().data;
    vm.userType = 'existing';
    vm.error = false;
    vm.selected = undefined;
    vm.selectedStates = [];
    vm.selectUser = selectUser;

    var devicesUrl = CsdmConfigService.getUrl() + '/organization/' + Authinfo.getOrgId() + '/huronDevices';
    var userDeviceCount = {};

    vm.model = {
      userInputOption: 0,
      uploadProgress: 0
    };

    vm.placeholder = $translate.instant('directoryNumberPanel.chooseNumber');
    vm.inputPlaceholder = $translate.instant('directoryNumberPanel.searchNumber');

    vm.isExistingCollapsed = vm.wizardData.allowUserCreation;
    vm.isLoading = false;

    function init() {
      loadUserDeviceCount();
    }

    init();

    function loadUserDeviceCount() {
      $http.get(devicesUrl).then(function (res) {
        _.forEach(res.data, function (device) {
          if (!userDeviceCount[device.cisUuid]) {
            userDeviceCount[device.cisUuid] = 0;
          }
          userDeviceCount[device.cisUuid] += 1;
        });
      });
    }

    vm.validateTokens = function () {
      vm.deviceName = "NOT IMPLEMENTED";
    };

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
            if (r.name) {
              name = r.name.givenName;
              if (r.name.familyName) {
                name += ' ' + r.name.familyName;
              }
            }
            if (_.isEmpty(name)) {
              name = r.displayName;
            }
            if (_.isEmpty(name)) {
              name = r.userName;
            }
            r.extractedName = name;
            return r;
          }).filter(function (u) {
            return !(u.id in userDeviceCount) || userDeviceCount[u.id] < 10;
          }).value();
          vm.noResults = _.isEmpty(userList);
          deferred.resolve(userList);
        };
        UserListService.listUsers(0, 10, null, null, callback, searchString, false, 'ciscouc');
      } else {
        deferred.resolve([]);
      }
      return deferred.promise;
    };

    function selectUser($item) {
      if (!_.contains($item.entitlements, 'ciscouc')) {
        vm.userError = true;
      }
      vm.cisUuid = $item.id;
      vm.deviceName = $item.displayName;
      vm.userName = $item.userName;
      vm.displayName = $item.displayName;
      vm.selected = $item.extractedName;
      vm.organizationId = $item.meta.organizationID;
    }

    vm.next = function () {
      vm.isLoading = true;
      if (vm.cisUuid) {
        OtpService.generateOtp(vm.userName).then(function (code) {
          vm.isLoading = false;
          $stateParams.wizard.next({
            deviceName: vm.deviceName,
            activationCode: code.code,
            code: code,
            expiryTime: code.friendlyExpiresOn,
            cisUuid: vm.cisUuid,
            userName: vm.userName,
            displayName: vm.displayName,
            organizationId: vm.organizationId
          }, vm.userType);
        }, function (err) {
          vm.isLoading = false;
          Notification.error(err.statusText);
        });
      }
    };

    vm.back = function () {
      $stateParams.wizard.back();
    };

    vm.isNameValid = function () {
      if (vm.cisUuid && !vm.userError) {
        return true;
      }
    };

  }
})();
