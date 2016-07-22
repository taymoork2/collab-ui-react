(function () {
  'use strict';

  angular.module('Huron')
    .controller('HuntGroupEditCtrl', HuntGroupEditCtrl);

  /* @ngInject */
  function HuntGroupEditCtrl($state, $q, $stateParams, $translate,
    Authinfo, HuntGroupService, Notification, HuntGroupFallbackDataService,
    HuntGroupMemberDataService, HuntGroupEditDataService) {
    var vm = this;
    vm.selectHuntMethod = selectHuntMethod;
    vm.resetForm = resetForm;
    vm.saveForm = saveForm;
    vm.callback = callback;
    vm.isLoadingCompleted = false;
    vm.back = true;
    vm.huronFeaturesUrl = 'huronfeatures';
    vm.hgMethods = HuntGroupService.getHuntMethods();

    // Hunt Pilot controller functions.
    vm.selectedPilotNumbers = undefined;
    vm.allUnassignedPilotNumbers = undefined;
    vm.allPilotOptions = undefined;

    // Hunt Members controller functions
    vm.unSelectHuntGroupMember = unSelectHuntGroupMember;
    vm.toggleMemberPanel = toggleMemberPanel;
    vm.selectHuntGroupMember = selectHuntGroupMember;
    vm.fetchHuntMembers = fetchHuntMembers;
    vm.getDisplayName = getDisplayName;
    vm.isMembersInvalid = isMembersInvalid;
    vm.checkMemberDirtiness = checkMemberDirtiness;
    vm.userSelected = undefined;
    vm.selectedHuntMembers = undefined;
    vm.openMemberPanelUuid = undefined;

    // Fallback destination controller functions
    vm.shouldShowFallbackLookup = shouldShowFallbackLookup;
    vm.shouldShowFallbackPill = shouldShowFallbackPill;
    vm.shouldShowFallbackWarning = shouldShowFallbackWarning;
    vm.fetchFallbackDestination = fetchFallbackDestination;
    vm.selectFallback = selectFallback;
    vm.toggleFallback = toggleFallback;
    vm.validateFallbackNumber = validateFallbackNumber;
    vm.removeFallbackDest = removeFallbackDest;
    vm.checkFallbackDirtiness = checkFallbackDirtiness;
    vm.selectedFallbackNumber = undefined;
    vm.selectedFallbackMember = undefined;
    vm.disableVoicemail = false;

    vm.showDisableSave = showDisableSave;

    vm.model = {};

    var customerId = Authinfo.getOrgId();

    if ($stateParams.feature && $stateParams.feature.id) {
      vm.hgId = $stateParams.feature.id;
      vm.title = $stateParams.feature.cardName;
      init();
    } else {
      $state.go(vm.huronFeaturesUrl);
    }

    ////////////////

    function init() {
      HuntGroupEditDataService.reset();
      HuntGroupEditDataService.fetchHuntGroup(customerId, vm.hgId)
        .then(function (pristineData) {
          HuntGroupService.getAllUnassignedPilotNumbers().then(function (numbers) {
            vm.allUnassignedPilotNumbers = numbers;

            vm.allUnassignedPilotNumbers.forEach(function (n) {
              n.isSelected = false;
            });

            updateModal(pristineData, true);
          });
        })
        .catch(function (error) {
          Notification.errorResponse(error, 'huronHuntGroup.huntGroupFetchFailure', {
            huntGroupName: vm.model.name
          });
          $state.go(vm.huronFeaturesUrl);
        });
    }

    function updateModal(pristineData, resetFromBackend) {
      HuntGroupFallbackDataService.reset(resetFromBackend);
      HuntGroupMemberDataService.reset(resetFromBackend);

      var fetchFallbackPromise = HuntGroupFallbackDataService.setFallbackDestinationJSON(
        pristineData.fallbackDestination, resetFromBackend);
      var fetchMemberPromise = HuntGroupMemberDataService.setMemberJSON(pristineData.members,
        resetFromBackend);

      $q.all([fetchFallbackPromise, fetchMemberPromise]).then(function () {
        vm.model = pristineData;
        vm.title = vm.model.name;
        updatePilotNumbers(pristineData);
        vm.selectedHuntMembers = HuntGroupMemberDataService.getHuntMembers();
        vm.selectedFallbackNumber = HuntGroupFallbackDataService.getFallbackNumber();
        vm.selectedFallbackMember = HuntGroupFallbackDataService.getFallbackMember();
        HuntGroupFallbackDataService.isVoicemailDisabled(customerId, _.get(pristineData, 'fallbackDestination.numberUuid')).then(function (isVoicemailDisabled) {
          vm.disableVoicemail = isVoicemailDisabled;
        });
        if (resetFromBackend) {
          initializeFields();
        }
      }, function () {
        $state.go(vm.huronFeaturesUrl);
      });
    }

    function updatePilotNumbers(pristineData) {
      vm.allPilotOptions = angular.copy(vm.allUnassignedPilotNumbers);
      pristineData.numbers.forEach(function (n) {
        n.isSelected = true;
      });
      vm.selectedPilotNumbers = angular.copy(pristineData.numbers);
      vm.allPilotOptions = vm.allPilotOptions.concat(pristineData.numbers);
    }

    function resetForm() {
      updateModal(HuntGroupEditDataService.getPristine(), false);
      vm.form.$setPristine();
      vm.form.$setUntouched();
    }

    function checkFallbackDirtiness() {
      if (HuntGroupEditDataService.isFallbackDirty()) {
        vm.form.$setDirty();
      }
    }

    function checkMemberDirtiness(userUuid) {
      if (HuntGroupEditDataService.isMemberDirty(userUuid)) {
        vm.form.$setDirty();
      }
    }

    function fetchHuntMembers(nameHint) {
      return HuntGroupMemberDataService.fetchHuntMembers(nameHint);
    }

    function showDisableSave() {
      return (vm.form.$invalid ||
        HuntGroupFallbackDataService.isFallbackInvalid() ||
        vm.isMembersInvalid());
    }

    function shouldShowFallbackLookup() {
      return (HuntGroupFallbackDataService.isFallbackInvalid() ||
        HuntGroupFallbackDataService.isFallbackValidNumber());
    }

    function shouldShowFallbackPill() {
      return HuntGroupFallbackDataService.isFallbackValidMember();
    }

    function shouldShowFallbackWarning() {
      return HuntGroupFallbackDataService.isFallbackInvalid();
    }

    function removeFallbackDest() {
      vm.selectedFallbackMember = HuntGroupFallbackDataService.removeFallbackMember();
      vm.form.$setDirty();
    }

    function unSelectHuntGroupMember(user) {
      HuntGroupMemberDataService.removeMember(user);
      vm.openMemberPanelUuid = undefined;
      vm.form.$setDirty();
    }

    function selectFallback($item) {
      vm.selectedFallbackNumber = undefined;
      vm.selectedFallbackMember = HuntGroupFallbackDataService.setFallbackMember($item);
      vm.form.$setDirty();
    }

    function fetchFallbackDestination(nameHint) {
      return HuntGroupMemberDataService.fetchMembers(nameHint);
    }

    function selectHuntGroupMember(member) {
      vm.userSelected = undefined;
      vm.selectedHuntMembers = HuntGroupMemberDataService.selectMember(member);
      vm.form.$setDirty();
    }

    function toggleMemberPanel(user) {
      HuntGroupService.updateMemberEmail(user).then(function () {
        vm.openMemberPanelUuid = HuntGroupMemberDataService.toggleMemberPanel(user.uuid);
      });
    }

    function toggleFallback() {
      HuntGroupService.updateMemberEmail(vm.selectedFallbackMember.member.user).then(
        function () {
          vm.selectedFallbackMember.openPanel = !vm.selectedFallbackMember.openPanel;
          HuntGroupFallbackDataService.isVoicemailDisabled(customerId, _.get(vm.selectedFallbackMember, 'member.selectableNumber.uuid')).then(function (isVoicemailDisabled) {
            vm.disableVoicemail = isVoicemailDisabled;
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

      if (HuntGroupEditDataService.isFallbackDirty()) {
        vm.form.$setDirty();
      }
    }

    function getDisplayName(user) {
      return HuntGroupMemberDataService.getDisplayName(user);
    }

    function isMembersInvalid() {
      return (!vm.selectedHuntMembers || vm.selectedHuntMembers.length === 0);
    }

    function hgUpdateReqBody() {
      return {
        name: vm.model.name,
        numbers: vm.model.numbers.map(function (numberObj) {
          if (numberObj.type === 'internal') {
            numberObj.type = 'NUMBER_FORMAT_EXTENSION';
          } else if (numberObj.type === 'external') {
            numberObj.type = 'NUMBER_FORMAT_DIRECT_LINE';
          }
          return {
            type: numberObj.type,
            number: numberObj.number
          };
        }),
        huntMethod: vm.model.huntMethod,
        maxRingSecs: vm.model.maxRingSecs.value,
        maxWaitMins: vm.model.maxWaitMins.value,
        fallbackDestination: HuntGroupFallbackDataService.getFallbackDestinationJSON(),
        members: HuntGroupMemberDataService.getMembersNumberUuidJSON()
      };
    }

    function saveForm() {
      vm.saveInProgress = true;
      var updateJSONRequest = hgUpdateReqBody();
      HuntGroupService.updateHuntGroup(customerId, vm.hgId, updateJSONRequest).then(function (data) {
        vm.saveInProgress = false;
        Notification.success('huronHuntGroup.successUpdate', {
          huntGroupName: vm.model.name
        });

        HuntGroupEditDataService.setPristine(updateJSONRequest);
        HuntGroupFallbackDataService.setAsPristine();
        HuntGroupMemberDataService.setAsPristine();
        resetForm(false);
      }, function (data) {
        vm.saveInProgress = false;
        Notification.errorResponse(data, 'huronHuntGroup.errorUpdate', {
          huntGroupName: vm.model.name
        });
      });
    }

    function initializeFields() {
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
        controller: /* @ngInject */ function ($scope) {
          $scope.to.options = vm.allPilotOptions;
          $scope.$watchCollection('model.numbers', function (value) {
            if (angular.equals(value, vm.selectedPilotNumbers)) {
              $scope.to.options = angular.copy(vm.allPilotOptions);
              $scope.to.placeholder = vm.selectedPilotNumbers.length + ' ' + $translate.instant('huronHuntGroup.numberSingular') + ' Selected';
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
          valuefield: 'value',
          secondaryLabel: $translate.instant('huronHuntGroup.ringTimeSecondaryLabel')
        },
        controller: /* @ngInject */ function ($scope) {
          $scope.to.options = HuntGroupEditDataService.getMaxRingSecsOptions();
        }
      }, {
        key: 'maxWaitMins',
        type: 'select',
        className: 'hg-time',
        templateOptions: {
          label: $translate.instant('huronHuntGroup.waitTimeLabel'),
          description: $translate.instant('huronHuntGroup.waitTimeDesc'),
          labelfield: 'label',
          valuefield: 'value',
          secondaryLabel: $translate.instant('huronHuntGroup.waitTimeSecondaryLabel')
        },
        controller: /* @ngInject */ function ($scope) {
          $scope.to.options = HuntGroupEditDataService.getMaxWaitMinsOptions();
        }
      }];
      vm.isLoadingCompleted = true;
    }
  }
})();
