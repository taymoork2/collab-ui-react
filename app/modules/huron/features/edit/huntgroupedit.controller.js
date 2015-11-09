(function () {
  'use strict';

  angular.module('Huron')
    .controller('HuntGroupEditCtrl', HuntGroupEditCtrl);

  /* @ngInject */
  function HuntGroupEditCtrl($state, $stateParams, $translate, Authinfo, HuntGroupService, Notification, TelephoneNumberService) {
    var vm = this;
    var initialModel;
    var initialnumberoptions;
    var customerId = Authinfo.getOrgId();
    vm.removeFallbackDest = removeFallbackDest;
    vm.removeHuntMember = removeHuntMember;
    vm.selectFallback = selectFallback;
    vm.toggleMembers = toggleMembers;
    vm.toggleFallback = toggleFallback;
    vm.selectHuntMethod = selectHuntMethod;
    vm.selectHuntGroupMember = selectHuntGroupMember;
    vm.resetForm = resetForm;
    vm.saveForm = saveForm;
    vm.callback = callback;
    vm.validateFallback = validateFallback;
    vm.fetchHuntMembers = fetchHuntMembers;
    vm.initialized = false;
    vm.back = true;
    vm.hgMethods = {
      "longestIdle": "DA_LONGEST_IDLE_TIME",
      "broadcast": "DA_BROADCAST",
      "circular": "DA_CIRCULAR",
      "topDown": "DA_TOP_DOWN"
    };

    function init() {
      vm.userSelected = undefined;
      vm.member = undefined;
      vm.addFallback = false;
      vm.membersValid = true;
      vm.fallbackValid = true;
      vm.fallbackDirty = false;
      vm.huntGroupId = $stateParams.feature.huntGroupId;

      if (vm.initialized) {
        vm.model = angular.copy(initialModel);
        vm.initialnumbers = angular.copy(initialnumberoptions);
        intializeFields();
      } else {
        HuntGroupService.getDetails(customerId, vm.huntGroupId).then(function (data) {

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
            inputPlaceholder: $translate.instant('huronHuntGroup.numbersInputPlaceHolder'),
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

      if (vm.model.fallbackDestination.number && vm.model.fallbackDestination.number !== '') {
        vm.addFallback = true;
        vm.userSelected = vm.model.fallbackDestination.number;
      }

      vm.initialized = true;
    }

    function removeFallbackDest() {
      vm.addFallback = true;
      vm.fallbackValid = true;
      vm.fallbackDirty = false;
      vm.form.$setDirty();
    }

    function removeHuntMember(item) {
      var index = vm.model.members.indexOf(item);
      vm.model.members.splice(index, 1);
      vm.form.$setDirty();
      if (vm.model.members.length === 0) {
        vm.membersValid = false;
      }
    }

    function selectFallback($item) {
      var numbers = [];
      vm.model.fallbackDestination = {};
      vm.model.fallbackDestination.userName = $item.userName;
      vm.model.fallbackDestination.uuid = $item.uuid;
      $item.numbers.forEach(function (value) {
        var number = value;
        if (number.isSelected) {
          vm.model.fallbackDestination.number = number.internal;
          vm.model.fallbackDestination.selectedNumberUuid = number.uuid;
        }
        var newvalue = {
          internal: number.internal,
          external: number.external,
          value: number.internal,
          name: 'FallbackRadio',
          id: 'internal',
          uuid: number.uuid
        };

        numbers.push(newvalue);
      });
      vm.model.fallbackDestination.numbers = numbers;
      vm.addFallback = false;
      vm.userSelected = undefined;
      vm.form.$setDirty();
    }

    function onFailureNotify(notificationKey) {
      return function (response) {
        Notification.errorResponse(response, notificationKey);
      };
    }

    function fetchHuntMembers(nameHint) {
      var GetHuntMembers = HuntGroupService.getHuntMembers(nameHint);

      if (GetHuntMembers) {
        GetHuntMembers.setOnFailure(onFailureNotify('huronHuntGroup.memberFetchFailure'));
        GetHuntMembers.setFilter({
          sourceKey: 'userUuid',
          responseKey: 'uuid',
          dataToStrip: vm.model.members
        });

        return GetHuntMembers.result();
      }

      return [];
    }

    function selectHuntGroupMember($item) {
      vm.member = undefined;
      vm.membersValid = true;

      vm.model.members.push({
        userUuid: $item.uuid,
        userName: $item.user.firstName + " " + $item.user.lastName,
        number: $item.selectableNumber.number,
        numberUuid: $item.selectableNumber.uuid
      });

      vm.form.$setDirty();
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
        if (item.numbers) {
          item.open = true;
        } else {
          HuntGroupService.getMemberInfo(customerId, item.userUuid).then(function (data) {
            item.email = data.email;
            data.numbers.forEach(function (value) {
              value.label = value.internal;
              value.value = value.internal;
              value.name = 'MemberRadios';
              value.id = 'value.external';

              if (item.numberUuid === value.uuid) {
                item.selectedNumberUuid = value.uuid;
              }
            });
            item.numbers = data.numbers;
            item.open = true;
          });
        }
      }
    }

    function toggleFallback() {
      if (!vm.model.fallbackDestination.open) {
        if (vm.model.fallbackDestination.numbers) {
          vm.model.fallbackDestination.open = true;
        } else {
          HuntGroupService.getMemberInfo(customerId, vm.model.fallbackDestination.userUuid).then(function (data) {
            vm.model.fallbackDestination.email = data.userName;
            data.numbers.forEach(function (value) {
              value.label = value.internal;
              value.value = value.internal;
              value.name = 'MemberRadios';
              value.id = 'value.external';

              if (vm.model.fallbackDestination.numberUuid === value.uuid) {
                vm.model.fallbackDestination.selectedNumberUuid = value.uuid;
              }
            });
            vm.model.fallbackDestination.numbers = data.numbers;
            vm.model.fallbackDestination.open = true;
          });
        }
      } else {
        vm.model.fallbackDestination.open = false;
      }
    }

    function resetForm() {
      init();
    }

    function getFallBackDest() {
      if (vm.model.fallbackDestination.number) {
        return {
          "number": vm.model.fallbackDestination.number
        };
      } else {
        return {
          "numberUuid": vm.model.fallbackDestination.numberUuid,
          "userUuid": vm.model.fallbackDestination.userUuid,
          "sendToVoicemail": vm.model.fallbackDestination.sendToVociemail
        };
      }
    }

    function hgUpdateReqBody() {
      var members = vm.model.members.map(function (member) {
        return member.numberUuid;
      });

      var numbers = vm.model.numbers.map(function (numberObj) {
        return {
          "type": numberObj.type,
          "number": numberObj.number
        };
      });

      return {
        "name": vm.model.name,
        "numbers": numbers,
        "huntMethod": vm.model.huntMethod,
        "maxRingSecs": vm.model.maxRingSecs.value,
        "maxWaitMins": vm.model.maxWaitMins.value,
        "fallbackDestination": getFallBackDest(),
        "members": members
      };
    }

    function saveForm() {
      vm.saveInProgress = true;

      HuntGroupService.updateHuntGroup(customerId, vm.huntGroupId, hgUpdateReqBody()).then(function (data) {
        vm.saveInProgress = false;
        Notification.success($translate.instant('huronHuntGroup.successUpdate'));

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

    function validateFallback() {
      if (vm.userSelected.length > 2 && !vm.fallbackValid) {
        vm.fallbackDirty = true;
      }
      if (vm.userSelected !== '') {
        vm.userSelected = TelephoneNumberService.getDIDLabel(vm.userSelected);
        if (TelephoneNumberService.validateDID(vm.userSelected)) {
          vm.fallbackValid = true;
        } else {
          vm.fallbackValid = false;
        }
      } else {
        vm.fallbackValid = false;
      }
    }

    if ($stateParams.feature) {
      init();
    } else {
      $state.go('huronfeatures');
    }
  }
})();
