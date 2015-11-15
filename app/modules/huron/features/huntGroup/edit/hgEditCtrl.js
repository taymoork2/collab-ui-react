(function () {
  'use strict';

  angular.module('Huron')
    .controller('HuntGroupEditCtrl', HuntGroupEditCtrl);

  /* @ngInject */
  function HuntGroupEditCtrl($state, $stateParams, $translate,
    Authinfo, HuntGroupService, Notification,
    TelephoneNumberService, HuntGroupFallbackDataService,
    HuntGroupMemberDataService) {
    var vm = this;
    var initialModel;
    var initialnumberoptions;
    var customerId = Authinfo.getOrgId();
    vm.removeFallbackDest = removeFallbackDest;
    vm.removeHuntMember = removeHuntMember;
    vm.toggleMembers = toggleMembers;
    vm.toggleFallback = toggleFallback;
    vm.selectHuntMethod = selectHuntMethod;
    vm.selectHuntGroupMember = selectHuntGroupMember;
    vm.resetForm = resetForm;
    vm.saveForm = saveForm;
    vm.callback = callback;
    vm.initialized = false;
    vm.back = true;
    vm.backUrl = 'huronfeatures';
    vm.hgMethods = HuntGroupService.getHuntMethods();

    // Fallback destination controller functions
    vm.shouldShowFallbackLookup = shouldShowFallbackLookup;
    vm.shouldShowFallbackPill = shouldShowFallbackPill;
    vm.shouldShowFallbackWarning = shouldShowFallbackWarning;
    vm.fetchFallbackDestination = fetchFallbackDestination;
    vm.selectFallback = selectFallback;
    vm.validateFallbackNumber = validateFallbackNumber;
    vm.selectedFallbackNumber = undefined;
    vm.selectedFallbackMember = undefined;

    vm.showDisableSave = showDisableSave;

    vm.model = {};

    if ($stateParams.feature && $stateParams.feature.id) {
      init();
    } else {
      $state.go('huronfeatures');
    }

    ////////////////

    function showDisableSave() {
      return (vm.form.$invalid ||
        !HuntGroupFallbackDataService.isFallbackValid() ||
        !vm.membersValid);
    }

    function shouldShowFallbackLookup() {
      return (!HuntGroupFallbackDataService.isFallbackValid() ||
        HuntGroupFallbackDataService.isFallbackValidNumber());
    }

    function shouldShowFallbackPill() {
      return HuntGroupFallbackDataService.isFallbackValidMember();
    }

    function shouldShowFallbackWarning() {
      return !HuntGroupFallbackDataService.isFallbackValid();
    }

    function init() {
      vm.member = undefined;
      vm.addFallback = false;
      vm.membersValid = true;
      vm.fallbackValid = true;
      vm.fallbackDirty = false;
      vm.model.name = $stateParams.feature.cardName;
      vm.hgId = $stateParams.feature.id;
      HuntGroupFallbackDataService.reset();
      HuntGroupMemberDataService.reset();

      if (vm.initialized) {

        vm.model = angular.copy(initialModel);
        vm.initialnumbers = angular.copy(initialnumberoptions);
        intializeFields();
      } else {
        HuntGroupService.getDetails(customerId, vm.hgId).then(function (data) {

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
            name: data.name,
            numbers: angular.copy(vm.initialnumber),
            huntMethod: data.huntMethod,
            members: data.members,
            fallbackDestination: data.fallbackDestination
          };
          HuntGroupFallbackDataService.setFallbackDestinationJSON(data.fallbackDestination);
          vm.selectedFallbackNumber = HuntGroupFallbackDataService.getFallbackNumber();
          vm.selectedFallbackMember = HuntGroupFallbackDataService.getFallbackMember();

          HuntGroupService.getMemberInfo(customerId, data.fallbackDestination.userUuid).then(function (user) {
            vm.model.fallbackDestination.userName = user.firstName + " " + user.lastName;
          });

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
      vm.selectedFallbackNumber = undefined;
      vm.selectedFallbackMember = HuntGroupFallbackDataService.setFallbackMember($item);
      vm.form.$setDirty();
    }

    function onFailureNotify(notificationKey) {
      return function (response) {
        Notification.errorResponse(response, notificationKey);
      };
    }

    function fetchFallbackDestination(nameHint) {
      return HuntGroupMemberDataService.fetchMembers(nameHint);
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
      HuntGroupService.updateMemberEmail(vm.selectedFallbackMember.member.user).then(
        function () {
          vm.selectedFallbackMember.openPanel = !vm.selectedFallbackMember.openPanel;
        });
    }

    function resetForm() {
      init();
    }

    function hgUpdateReqBody() {
      var members = vm.model.members.map(function (member) {
        return member.numberUuid;
      });

      var numbers = vm.model.numbers.map(function (numberObj) {
        return {
          type: numberObj.type,
          number: numberObj.number
        };
      });

      return {
        name: vm.model.name,
        numbers: numbers,
        huntMethod: vm.model.huntMethod,
        maxRingSecs: vm.model.maxRingSecs.value,
        maxWaitMins: vm.model.maxWaitMins.value,
        fallbackDestination: HuntGroupFallbackDataService.getFallbackDestinationJSON(),
        members: members
      };
    }

    function saveForm() {
      vm.saveInProgress = true;

      HuntGroupService.updateHuntGroup(customerId, vm.hgId, hgUpdateReqBody()).then(function (data) {
        vm.saveInProgress = false;
        Notification.success($translate.instant('huronHuntGroup.successUpdate', {
          huntGroupName: vm.model.name
        }));
        initialModel = angular.copy(vm.model);
        resetForm();

      }, function (data) {
        vm.saveInProgress = false;
        Notification.error($translate.instant('huronHuntGroup.errorUpdate'), {
          huntGroupName: vm.model.name
        });
      });
    }

    function selectHuntMethod(method) {
      vm.model.huntMethod = method;
      vm.form.$setDirty();
    }

    function callback() {
      vm.form.$setDirty();
    }

    function validateFallbackNumber() {
      vm.selectedFallbackNumber =
        HuntGroupFallbackDataService.validateFallbackNumber(vm.selectedFallbackNumber);
    }

    function getDisplayName(user) {
      return HuntGroupMemberDataService.getDisplayName(user);
    }
  }
})();
