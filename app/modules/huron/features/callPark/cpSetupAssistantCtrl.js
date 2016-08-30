(function () {
  'use strict';

  /* eslint no-unreachable:0 */

  angular
    .module('Huron')
    .controller('CallParkSetupAssistantCtrl', CallParkSetupAssistantCtrl);

  /* @ngInject */
  function CallParkSetupAssistantCtrl($scope, $window, $q, $state, $modal, $timeout, $translate,
    Authinfo, Notification, CallParkService, CallParkMemberDataService) {
    var vm = this;
    var customerId = Authinfo.getOrgId();

    // Setup assistant controller functions
    vm.callback = callback;
    vm.nextPage = nextPage;
    vm.previousPage = previousPage;
    vm.nextButton = nextButton;
    vm.previousButton = previousButton;
    vm.getPageIndex = getPageIndex;
    vm.close = closePanel;
    vm.cancelModal = cancelModal;
    vm.evalKeyPress = evalKeyPress;
    vm.enterNextPage = enterNextPage;
    vm.saveCallPark = saveCallPark;
    vm.createHelpText = createHelpText;
    vm.pageIndex = 0;
    vm.submitted = false;
    vm.animation = 'slide-left';

    vm.callParkName = '';
    vm.selectedSingleNumber = '';

    // Call park single numbers controller functions
    vm.selectSingleNumber = selectSingleNumber;
    vm.fetchNumbers = fetchNumbers;
    vm.selectedNumber = undefined;
    vm.selectedNumbers = [];
    vm.errorNumberInput = false;

    // Call park members controller functions
    vm.selectCallParkMember = selectCallParkMember;
    vm.unSelectCallParkMember = unSelectCallParkMember;
    vm.fetchMembers = fetchMembers;
    vm.toggleMemberPanel = toggleMemberPanel;
    vm.getDisplayName = getDisplayName;
    vm.selectedMembers = [];
    vm.openMemberPanelUuid = undefined;
    vm.userSelected = undefined;
    vm.errorMemberInput = false;

    // ==================================================
    // The below methods have elevated access only to be
    // called from unit testing.
    // ==================================================
    vm.populateNumbers = populateNumbers;
    vm.populateMembers = populateMembers;

    init();

    function init() {
      CallParkMemberDataService.reset();
      initializeFields();
    }

    function fetchNumbers(typedNumber) {

      vm.errorNumberInput = false;
      var GetNumbers = CallParkService.getNumberSuggestions(typedNumber);

      if (GetNumbers) {
        GetNumbers.setOnFailure(function (response) {
          Notification.errorResponse(response, 'callPark.numberFetchFailure');
        });
        GetNumbers.setFilter({
          sourceKey: 'uuid',
          responseKey: 'uuid',
          dataToStrip: vm.selectedNumbers
        });

        return GetNumbers.fetch().then(function (numbers) {
          vm.errorNumberInput = (numbers && numbers.length === 0);
          return numbers;
        });
      }

      return [];
    }

    function selectSingleNumber(numItem) {
      vm.selectedSingleNumber = numItem.number;
      vm.selectedNumbers.push(numItem);
    }

    function nextButton($index) {
      var buttonStates = {
        0: function () {
          return vm.callParkName !== '';
        },
        1: function () {
          return !_.get(vm, 'form.$invalid', true) && !areOptionsInvalid();
        },
        2: function () {
          if (vm.selectedMembers.length !== 0) {
            applyElement($window.document.getElementsByClassName("helptext-btn--right"), 'enabled', 'add');
            return true;
          } else {
            applyElement($window.document.getElementsByClassName("helptext-btn--right"), 'enabled', 'remove');
            return false;
          }
        },
        'default': function () {
          return false;
        }
      };

      return buttonStates[$index]() || buttonStates['default']();
    }

    function areOptionsInvalid() {
      var valid = false;
      var input;
      angular.forEach(vm.cpNumberOptions, function (option) {
        input = option.inputs[option.currentInput];
        switch (input.type) {
          case 'range': valid = (isStringValid(input.range_1, 'value', "") === "" || isStringValid(input.range_2, 'value', "") === "") || valid;
            break;
          case 'number': valid = (isStringValid(input, 'value', "") === "") || valid;
            break;
          case 'input': valid = (isStringValid(input, 'value', "") === "") || valid;
            break;
          case 'text': break;
        }
      });

      return valid;
    }

    function isStringValid(obj, prop, def) {
      var str = _.get(obj, prop, def);
      return str ? String(str).trim() : "";
    }

    function previousButton($index) {
      if ($index === 0) {
        return 'hidden';
      }
      return true;
    }

    function nextPage() {
      vm.animation = 'slide-left';
      $timeout(function () {
        if (getPageIndex() === 2) {
          vm.saveCallPark();
        } else {
          vm.pageIndex++;
          if (getPageIndex() === 2) {
            applyElement($window.document.getElementsByClassName("btn--circle btn--primary btn--right"), 'saveCallPark', 'add');
            applyElement($window.document.getElementsByClassName("helptext-btn--right"), 'active', 'add');
          }
        }
      }, 10);
    }

    function previousPage() {
      vm.animation = 'slide-right';
      $timeout(function () {
        vm.pageIndex--;
        applyElement($window.document.getElementsByClassName("btn--circle btn--primary btn--right"), 'saveCallPark', 'remove');
        applyElement($window.document.getElementsByClassName("helptext-btn--right"), 'active', 'remove');
      }, 10);
    }

    function getPageIndex() {
      return vm.pageIndex;
    }

    function closePanel() {
      $state.go('huronfeatures');
    }

    function cancelModal() {
      $modal.open({
        templateUrl: 'modules/huron/features/callPark/cpCancelModal.tpl.html',
        type: 'dialog'
      });
    }

    function evalKeyPress($keyCode) {
      switch ($keyCode) {
        case 27:
        //escape key
          cancelModal();
          break;
        case 39:
        //right arrow
          if (nextButton(getPageIndex()) === true) {
            nextPage();
          }
          break;
        case 37:
        //left arrow
          if (previousButton(getPageIndex()) === true) {
            previousPage();
          }
          break;
        default:
          break;
      }
    }

    function enterNextPage($keyCode) {
      if ($keyCode === 13 && nextButton(getPageIndex()) === true) {
        switch (getPageIndex()) {
          case 0 :
            if (vm.callParkName !== '') {
              nextPage();
            }
            break;
          case 1 :
            if (!_.get(vm, 'form.$invalid', true) && !areOptionsInvalid()) {
              nextPage();
            }
            break;
          default : return false;
        }
      }
    }

    function callback() {
      vm.form.$setDirty();
    }

    /////////////////////////////////////////////////////////
    // Call park members presentation controller functions.

    function selectCallParkMember(member) {
      vm.userSelected = undefined;
      vm.selectedMembers = CallParkMemberDataService.selectMember(member);
    }

    function unSelectCallParkMember(user) {
      CallParkMemberDataService.removeMember(user);
      vm.openMemberPanelUuid = undefined;
    }

    function fetchMembers(nameHint) {
      return $q.when(CallParkMemberDataService.fetchCallParkMembers(nameHint)).then(function (members) {
        angular.forEach(members, function (member) {
          member.user.primaryNumber = _.find(member.user.numbers, {
            'primary': true
          });
        });

        if (CallParkService.suggestionsNeeded(nameHint)) {
          vm.errorMemberInput = (members && members.length === 0);
        } else {
          vm.errorMemberInput = false;
        }
        return members;
      });
    }

    function toggleMemberPanel(user) {
      CallParkService.updateMemberEmail(user).then(function () {
        vm.openMemberPanelUuid = CallParkMemberDataService.toggleMemberPanel(user.uuid);
      });
    }

    function createHelpText() {
      return $translate.instant('callPark.createHelpText');
    }

    function getDisplayName(user) {
      return CallParkMemberDataService.getDisplayName(user);
    }

    /////////////////////////////////////////////////////////

    // this function will be used in future milestones
    function saveCallPark() {
      vm.submitted = true;
      vm.saveProgress = true;
      var data = {
        name: vm.callParkName,
        startRange: '',
        endRange: '',
        members: vm.selectedMembers
      };

      populateMembers(data);
      populateNumbers(data);

      CallParkService.saveCallPark(customerId, data).then(function () {
        vm.saveProgress = false;
        Notification.success('callPark.successSave', {
          callParkName: vm.callParkName
        });
        $state.go('huronfeatures');
      }, function (error) {
        vm.saveProgress = false;
        Notification.errorResponse(error, 'callPark.errorSave', {
          callParkName: vm.callParkName
        });
        vm.submitted = false;
      });
    }

    function populateNumbers(data) {
      var form = _.get(vm.cpNumberOptions, [0]);
      var input;
      if (form.currentInput === 0) {
        input = form.inputs[0];
        data.startRange = input.range_1.value;
        data.endRange = input.range_2.value;
      } else {
        input = form.inputs[1];
        data.startRange = input.value;
        data.endRange = input.value;
      }
    }

    function populateMembers(data) {
      data.members = CallParkMemberDataService.getMembersUuidJSON();
    }

    function applyElement(element, appliedClass, method) {
      var domElement = _.get(element, '[0]');
      if (domElement) {
        switch (method) {
          case 'add':
            domElement.classList.add(appliedClass);
            break;
          case 'remove':
            domElement.classList.remove(appliedClass);
            break;
          case 'default':
            return true;
        }
      }
    }

    function getExtensionLength(option) {
      var currentInput = _.get(vm.cpNumberOptions, '[0].currentInput', false);
      return currentInput === option ? 4 : null;
    }

    function initializeFields() {
      vm.cpNumberOptions = [{
        key: 'cp-number',
        currentInput: 0,
        inputs: [{
          type: 'range',
          range_1: {
            type: 'number',
            value: '',
            grid_size: 5,
            maxlength: getExtensionLength(0),
            minlength: getExtensionLength(0),
            placeholder: $translate.instant('callPark.firstRange')
          },
          range_2: {
            type: 'number',
            value: '',
            grid_size: 5,
            maxlength: getExtensionLength(1),
            minlength: getExtensionLength(1),
            placeholder: $translate.instant('callPark.secondRange')
          }
        }, {
          type: 'number',
          value: '',
          maxlength: getExtensionLength(1),
          minlength: getExtensionLength(1),
          placeholder: $translate.instant('callPark.singleRange')
        }]
      }];

      $scope.numberOption = vm.cpNumberOptions[0];

      $scope.$watch('numberOption', function () {
        var newLength = getExtensionLength(vm.cpNumberOptions[0].currentInput);
        angular.forEach(vm.cpNumberOptions[0].inputs, function (input, index) {
          var length = index == vm.cpNumberOptions[0].currentInput ? newLength : null;
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
