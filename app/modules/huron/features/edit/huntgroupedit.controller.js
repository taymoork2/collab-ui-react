(function () {
  'use strict';

  angular.module('Huron')
    .controller('HuntGroupEditCtrl', HuntGroupEditCtrl);

  /* @ngInject */
  function HuntGroupEditCtrl($state, $translate, Authinfo, HuntGroupService, Notification) {
    var vm = this;
    var initialModel;
    var initialnumberoptions;
    var customerId = Authinfo.getOrgId();
    vm.removeFallbackDest = removeFallbackDest;
    vm.removeHuntMember = removeHuntMember;
    vm.selectHuntGroupUser = selectHuntGroupUser;
    vm.toggleMembers = toggleMembers;
    vm.toggleFallback = toggleFallback;
    vm.selectHuntMethod = selectHuntMethod;
    vm.selectHuntGroupMember = selectHuntGroupMember;
    vm.resetForm = resetForm;
    vm.saveForm = saveForm;
    vm.callback = callback;
    vm.initialized = false;

    function init() {
      vm.userSelected = undefined;
      vm.member = undefined;
      vm.addFallback = false;

      if (vm.initialized) {
        vm.model = angular.copy(initialModel);
        vm.initialnumbers = angular.copy(initialnumberoptions);
        intializeFields();
      } else {
        HuntGroupService.getDetails(customerId).then(function (data) {
          vm.title = data.name;
          vm.initialnumber = data.numbers;
          vm.model = {
            maxRingSecs: {
              'label': data.maxRingSecs + ' secs',
              'value': data.maxRingSecs
            },
            maxWaitMins: {
              'label': data.maxWaitMins + ' mins',
              'value': data.maxWaitMins
            },
            name: vm.title,
            numbers: angular.copy(vm.initialnumber),
            huntMethod: data.huntMethod,
            members: data.members,
            fallbackDestination: data.fallbackDestination
          };

          HuntGroupService.getNumbersWithSelection(data.numbers).then(function (data) {
            vm.numberoptions = data;
            initialModel = angular.copy(vm.model);
            initialnumberoptions = angular.copy(vm.numberoptions);
            intializeFields();
          });

        }, function (data) {
          $state.go('huronfeatures');
        });

      }
    }

    function intializeFields() {
      if (!vm.initialized) {
        vm.fields = [{
          key: 'name',
          type: 'input',
          className: 'hg-name',
          templateOptions: {
            label: $translate.instant('huronHuntGroup.nameLabel'),
            placeholder: $translate.instant('huronHuntGroup.nameLabel'),
            description: $translate.instant('huronHuntGroup.nameDesc'),
            required: true
          }
        }, {
          key: 'numbers',
          type: 'select',
          className: 'hg-num',
          templateOptions: {
            label: $translate.instant('huronHuntGroup.numbersLabel'),
            placeholder: $translate.instant('huronHuntGroup.numbersLabel'),
            waitTime: 'true',
            multi: 'true',
            filter: true,
            singular: $translate.instant('huronHuntGroup.numberSingular'),
            plural: $translate.instant('huronHuntGroup.numberPlural'),
            valuefield: 'number',
            labelfield: 'number',
            required: true,
            onClick: function () {
              vm.form.$setDirty();
            }
          },
          controller: /* ngInject */ function ($scope) {
            $scope.to.options = vm.numberoptions;
            $scope.$watchCollection('model.numbers', function (value) {
              if (angular.equals(value, vm.initialnumber)) {
                $scope.to.options = angular.copy(initialnumberoptions);
                $scope.to.placeholder = vm.initialnumber.length + ' ' + $translate.instant('huronHuntGroup.numberSingular') + ' Selected';
              }
              if (angular.equals(value, [])) {
                if (vm.form.numbers) {
                  vm.form.numbers.$setValidity('required', false);
                }
                $scope.to.placeholder = 'Select Option';
              } else {
                if (vm.form.numbers) {
                  vm.form.numbers.$setValidity('required', true);
                }
              }
            });
          }
        }, {
          key: 'maxRingSecs',
          type: 'select',
          className: 'hg-time',
          templateOptions: {
            label: $translate.instant('huronHuntGroup.ringTimeLabel'),
            description: $translate.instant('huronHuntGroup.ringTimeDesc'),
            labelfield: 'label',
            valuefield: 'value'
          },
          controller: /* @ngInject */ function ($scope) {
            $scope.to.options = [{
              label: '30 secs',
              value: 30
            }, {
              label: '40 secs',
              value: 40
            }];
          }
        }, {
          key: 'maxWaitMins',
          type: 'select',
          className: 'hg-time',
          templateOptions: {
            label: $translate.instant('huronHuntGroup.waitTimeLabel'),
            description: $translate.instant('huronHuntGroup.waitTimeDesc'),
            labelfield: 'label',
            valuefield: 'value'
          },
          controller: /* @ngInject */ function ($scope) {
            $scope.to.options = [{
              label: '30 secs',
              value: 30
            }, {
              label: '40 secs',
              value: 40
            }];
          }
        }];
      } else {
        vm.form.$setPristine();
        vm.form.$setUntouched();
      }
      vm.initialized = true;
    }

    function removeFallbackDest() {
      vm.addFallback = true;
      vm.form.$setDirty();
    }

    function removeHuntMember(item) {
      var index = vm.model.members.indexOf(item);
      vm.model.members.splice(index, 1);
      vm.form.$setDirty();
    }

    function selectHuntGroupUser($item) {
      vm.model.fallbackDestination = {};
      vm.model.fallbackDestination.userName = $item.userName;
      vm.model.fallbackDestination.number = $item.userNumber[0];
      vm.addFallback = false;
      vm.userSelected = undefined;
      vm.form.$setDirty();
    }

    function selectHuntGroupMember($item) {
      var item = {
        userName: $item.userName,
        userEmail: $item.userEmail
      };
      var alreadyExist = false;
      angular.forEach(vm.model.items, function (value) {
        if (value.userName === $item.userName) {
          alreadyExist = true;
        }
      });
      vm.member = undefined;
      if (!alreadyExist) {
        vm.model.members.push(item);
        vm.form.$setDirty();
      }
    }

    function toggleMembers(item) {
      var isOpen = false;
      if (item.open) {
        isOpen = true;
      }
      angular.forEach(vm.model.members, function (value) {
        value.open = false;
      });
      if (isOpen) {
        item.open = false;
      } else {
        HuntGroupService.getMemberInfo(customerId, item.userUuid).then(function (data) {
          item.email = data.userName;
          data.numbers.forEach(function (value) {
            value.label = value.internal;
            value.value = value.internal;
            value.name = 'MemberRadios';
            value.id = 'value.external';
          });
          item.numbers = data.numbers;
          item.open = true;
        });

      }
    }

    function toggleFallback() {
      if (!vm.model.fallbackDestination.open) {
        HuntGroupService.getMemberInfo(customerId, vm.model.fallbackDestination.userUuid).then(function (data) {
          vm.model.fallbackDestination.email = data.userName;
          data.numbers.forEach(function (value) {
            value.label = value.internal;
            value.value = value.internal;
            value.name = 'MemberRadios';
            value.id = 'value.external';
          });
          vm.model.fallbackDestination.numbers = data.numbers;
          vm.model.fallbackDestination.open = true;
        });
      } else {
        vm.model.fallbackDestination.open = false;
      }
    }

    function resetForm() {
      init();
    }

    function saveForm() {
      vm.saveInProgress = true;
      HuntGroupService.updateHuntGroup(customerId, vm.model).then(function (data) {
        vm.saveInProgress = false;
        Notification.success($translate.instant('huronHuntGroup.successUpdate'));
        resetForm();
      }, function (data) {
        vm.saveInProgress = false;
        Notification.error($translate.instant('huronHuntGroup.errorUpdate'));
      });
    }

    function selectHuntMethod(method) {
      vm.model.huntMethod = method;
      vm.form.$setDirty();
    }

    function callback() {
      vm.form.$setDirty();
    }

    vm.userData = [{
      "userName": "samwi",
      "userEmail": "samwi@cisco.com",
      "userNumber": ["3579517894", "9876543210"]
    }, {
      "userName": "nlipe",
      "userEmail": "nlipe@cisco.com",
      "userNumber": ["6549873210"]
    }, {
      "userName": "bspence",
      "userEmail": "bspence@cisco.com",
      "userNumber": ["8177777777"]
    }, {
      "userName": "jlowery",
      "userEmail": "jlowery@cisco.com",
      "userNumber": ["3692581470"]
    }];

    init();
  }
})();
