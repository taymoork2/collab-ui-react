(function () {
  'use strict';

  angular.module('Huron')
    .controller('CallParkEditCtrl', CallParkEditCtrl);

  /* @ngInject */
  function CallParkEditCtrl($scope, $state, $stateParams, $translate, Authinfo, CallParkService, Notification, CallParkMemberDataService, CallParkEditDataService) {
    var vm = this;
    vm.resetForm = resetForm;
    vm.saveForm = saveForm;
    vm.callback = callback;
    vm.isLoadingCompleted = false;
    vm.back = true;
    vm.huronFeaturesUrl = 'huronfeatures';

    // Call Park controller functions.
    vm.selectedNumbers = undefined;
    vm.allOptions = undefined;

    // Call Park Members controller functions
    vm.unSelectCallParkMember = unSelectCallParkMember;
    vm.toggleMemberPanel = toggleMemberPanel;
    vm.selectCallParkMember = selectCallParkMember;
    vm.fetchMembers = fetchMembers;
    vm.getDisplayName = getDisplayName;
    vm.isMembersInvalid = isMembersInvalid;
    vm.areOptionsInvalid = areOptionsInvalid;
    vm.isStringValid = isStringValid;
    vm.checkMemberDirtiness = checkMemberDirtiness;
    vm.userSelected = undefined;
    vm.selectedMembers = undefined;
    vm.openMemberPanelUuid = undefined;

    vm.showDisableSave = showDisableSave;
    vm.templateRadios = [];

    var customerId = Authinfo.getOrgId();

    if ($stateParams.feature && $stateParams.feature.id) {
      vm.cpId = $stateParams.feature.id;
      vm.title = $stateParams.feature.cardName;
      init();
    } else {
      $state.go(vm.huronFeaturesUrl);
    }

    ////////////////

    function init() {
      CallParkEditDataService.reset();
      CallParkEditDataService.fetchCallPark(customerId, vm.cpId)
        .then(function (pristineData) {
          updateModal(pristineData, true);
        })
        .catch(function (error) {
          Notification.errorResponse(error, 'callPark.callParkFetchFailure', {
            callParkName: vm.name
          });
          $state.go(vm.huronFeaturesUrl);
        });
    }

    function updateModal(pristineData, resetFromBackend) {
      CallParkMemberDataService.reset(resetFromBackend);

      CallParkMemberDataService.setMemberJSON(pristineData.members, resetFromBackend).then(function () {
        vm.title = pristineData.name;
        vm.name = pristineData.name;
        vm.selectedMembers = CallParkMemberDataService.getCallParkMembers();
        if (resetFromBackend) {
          initializeFields(pristineData);
        }
      }, function () {
        $state.go(vm.huronFeaturesUrl);
      });
    }

    function resetForm() {
      updateModal(CallParkEditDataService.getPristine(), false);
      vm.form.$setPristine();
      vm.form.$setUntouched();
    }

    function checkMemberDirtiness(userUuid) {
      if (CallParkEditDataService.isMemberDirty(userUuid)) {
        vm.form.$setDirty();
      }
    }

    function fetchMembers(nameHint) {
      return CallParkMemberDataService.fetchMembers(nameHint);
    }

    function showDisableSave() {
      return (vm.form.$invalid || vm.isMembersInvalid() || vm.areOptionsInvalid());
    }

    function unSelectCallParkMember(user) {
      CallParkMemberDataService.removeMember(user);
      vm.openMemberPanelUuid = undefined;
      vm.form.$setDirty();
    }

    function selectCallParkMember(member) {
      vm.userSelected = undefined;
      member.user.primaryNumber = _.find(member.user.numbers, {
        'primary': true
      });
      vm.selectedMembers = CallParkMemberDataService.selectMember(member);
      vm.form.$setDirty();
    }

    function toggleMemberPanel(user) {
      CallParkService.updateMemberEmail(user).then(function () {
        vm.openMemberPanelUuid = CallParkMemberDataService.toggleMemberPanel(user.uuid);
      });
    }

    function callback() {
      vm.form.$setDirty();
    }

    function getDisplayName(user) {
      return CallParkMemberDataService.getDisplayName(user);
    }

    function isMembersInvalid() {
      return (!vm.selectedMembers || vm.selectedMembers.length === 0);
    }

    function areOptionsInvalid() {
      var valid = false;
      var input;
      angular.forEach(vm.templateRadios, function (radio) {
        angular.forEach(radio, function (option) {
          input = option.inputs[option.currentInput];
          switch (input.type) {
            case 'range': valid = (vm.isStringValid(input.range_1, 'value', "") === "" || vm.isStringValid(input.range_2, 'value', "") === "") || valid;
              break;
            case 'number': valid = (vm.isStringValid(input, 'value', "") === "") || valid;
              break;
            case 'input': valid = (vm.isStringValid(input, 'value', "") === "") || valid;
              break;
            case 'text': break;
          }
        });
      });

      return valid;
    }

    function isStringValid(obj, prop, def) {
      var str = _.get(obj, prop, def);
      return str ? String(str).trim() : "";
    }

    function cpUpdateReqBody() {
      return {
        name: vm.name,
        startRange: vm.cpNumberOptions[0].currentInput === 0 ? vm.cpNumberOptions[0].inputs[0].range_1.value : vm.cpNumberOptions[0].inputs[1].value,
        endRange: vm.cpNumberOptions[0].currentInput === 0 ? vm.cpNumberOptions[0].inputs[0].range_2.value : vm.cpNumberOptions[0].inputs[1].value,
        members: CallParkMemberDataService.getMembersUuidJSON()
      };
    }

    function saveForm() {
      vm.saveInProgress = true;
      var updateJSONRequest = cpUpdateReqBody();
      CallParkService.updateCallPark(customerId, vm.cpId, updateJSONRequest).then(function () {
        vm.saveInProgress = false;
        Notification.success($translate.instant('callPark.successUpdate', {
          callParkName: vm.name
        }));

        CallParkEditDataService.setPristine(updateJSONRequest);
        CallParkMemberDataService.setAsPristine();
        resetForm(false);
      }, function (data) {
        vm.saveInProgress = false;
        Notification.errorResponse(data, $translate.instant('callPark.errorUpdate'), {
          callParkName: vm.name
        });
      });
    }

    function getExtensionLength(option) {
      var currentInput = _.get(vm.cpNumberOptions, '[0].currentInput', false);
      return currentInput === option ? 4 : null;
    }

    function initializeFields(model) {
      var currentInput = model.startRange === model.endRange ? 1 : 0;
      vm.cpNumberOptions = [{
        key: 'cp-number',
        name: $translate.instant('callPark.numberLabel'),
        description: $translate.instant('callPark.numberDesc'),
        currentInput: currentInput,
        inputs: [{
          type: 'range',
          range_1: {
            type: 'number',
            grid_size: 2,
            value: currentInput === 0 ? parseInt(model.startRange, 10) : '',
            maxlength: 4,
            minlength: 4,
            placeholder: $translate.instant('callPark.firstRange')
          },
          range_2: {
            type: 'number',
            grid_size: 2,
            value: currentInput === 0 ? parseInt(model.endRange, 10) : '',
            maxlength: 4,
            minlength: 4,
            placeholder: $translate.instant('callPark.secondRange')
          }
        }, {
          type: 'number',
          value: currentInput === 1 ? parseInt(model.startRange, 10) : '',
          maxlength: 4,
          minlength: 4,
          placeholder: $translate.instant('callPark.singleRange')
        }]
      }];

      vm.templateRadios.push(vm.cpNumberOptions);

      /*
      vm.cpReversionOptions = [{
        key: 'cp-reversion',
        name: $translate.instant('callPark.reversionLabel'),
        description: $translate.instant('callPark.reversionDesc'),
        inputs: [{
          type: 'text',
          text: $translate.instant('callPark.personWhoParked')
        }, {
          type: 'input',
          value: '',
          placeholder: '',
          required: true
        }]
      }];

      vm.templateRadios.push(vm.cpReversionOptions);
      */
      vm.isLoadingCompleted = true;

      $scope.numberOption = vm.cpNumberOptions[0];

      $scope.$watch('numberOption', function () {
        var newLength = getExtensionLength(vm.cpNumberOptions[0].currentInput);
        angular.forEach(vm.cpNumberOptions[0].inputs, function (input, index) {
          var length = index === vm.cpNumberOptions[0].currentInput ? newLength : null;
          var values = (input.type === 'range') ? [input.range_1, input.range_2] : [input];
          angular.forEach(values, function (value) {
            value.minlength = length;
            value.maxlength = length;
          });
        });
      }, true);
    }
  }
})();
