(function () {
  'use strict';

  /* eslint no-unreachable:0 */

  angular
    .module('Huron')
    .controller('HuntGroupSetupAssistantCtrl', HuntGroupSetupAssistantCtrl);

  /* @ngInject */
  function HuntGroupSetupAssistantCtrl($scope, $q, $state, Config, $modal, $timeout, $translate,
    Authinfo, Notification, HuntGroupService,
    HuntGroupFallbackDataService, HuntGroupMemberDataService) {
    var vm = this;
    var customerId = Authinfo.getOrgId();

    // Setup assistant controller functions
    vm.nextPage = nextPage;
    vm.previousPage = previousPage;
    vm.nextButton = nextButton;
    vm.previousButton = previousButton;
    vm.getPageIndex = getPageIndex;
    vm.close = closePanel;
    vm.cancelModal = cancelModal;
    vm.evalKeyPress = evalKeyPress;
    vm.enterNextPage = enterNextPage;
    vm.saveHuntGroup = saveHuntGroup;
    vm.pageIndex = 0;
    vm.animation = 'slide-left';

    vm.huntGroupName = '';

    // Hunt pilot numbers controller functions
    vm.selectPilotNumber = selectPilotNumber;
    vm.fetchNumbers = fetchNumbers;
    vm.unSelectPilotNumber = unSelectPilotNumber;
    vm.selectedPilotNumber = undefined;
    vm.selectedPilotNumbers = [];
    vm.errorNumberInput = false;

    // Hunt Methods controller functions
    vm.hgMethods = HuntGroupService.getHuntMethods();
    vm.huntGroupMethod = vm.hgMethods.longestIdle;
    vm.setHuntMethod = setHuntMethod;

    // Hunt Members controller functions
    vm.selectHuntGroupMember = selectHuntGroupMember;
    vm.unSelectHuntGroupMember = unSelectHuntGroupMember;
    vm.fetchHuntMembers = fetchHuntMembers;
    vm.toggleMemberPanel = toggleMemberPanel;
    vm.getDisplayName = getDisplayName;
    vm.selectedHuntMembers = [];
    vm.openMemberPanelUuid = undefined;
    vm.userSelected = undefined;
    vm.errorMemberInput = false;

    // Hunt fallback destination controller functions
    vm.selectedFallbackMember = undefined;
    vm.selectedFallbackNumber = undefined;
    vm.isFallbackValid = isFallbackValid;
    vm.selectFallback = selectFallback;
    vm.fetchFallbackDestination = fetchFallbackDestination;
    vm.validateFallbackNumber = validateFallbackNumber;
    vm.toggleFallback = toggleFallback;
    vm.removeFallbackDest = removeFallbackDest;
    vm.isErrorFallbackInput = isErrorFallbackInput;
    vm.fallbackSuggestionsAvailable = false;
    vm.disableVoicemail = false;

    // ==================================================
    // The below methods have elevated access only to be
    // called from unit testing.
    // ==================================================
    vm.populateHuntPilotNumbers = populateHuntPilotNumbers;
    vm.populateHuntMembers = populateHuntMembers;
    vm.populateFallbackDestination = populateFallbackDestination;

    init();

    function init() {
      HuntGroupFallbackDataService.reset();
      HuntGroupMemberDataService.reset();
    }

    function fetchNumbers(typedNumber) {

      vm.errorNumberInput = false;
      var GetPilotNumbers = HuntGroupService.getPilotNumberSuggestions(typedNumber);

      if (GetPilotNumbers) {
        GetPilotNumbers.setOnFailure(function (response) {
          Notification.errorResponse(response, 'huronHuntGroup.numberFetchFailure');
        });
        GetPilotNumbers.setFilter({
          sourceKey: 'uuid',
          responseKey: 'uuid',
          dataToStrip: vm.selectedPilotNumbers
        });

        return GetPilotNumbers.fetch().then(function (numbers) {
          vm.errorNumberInput = (numbers && numbers.length === 0);
          return numbers;
        });
      }

      return [];
    }

    function selectPilotNumber(numItem) {
      vm.selectedPilotNumber = undefined;
      vm.selectedPilotNumbers.push(numItem);
    }

    function unSelectPilotNumber(numItem) {
      vm.selectedPilotNumbers.splice(vm.selectedPilotNumbers.indexOf(numItem), 1);
    }

    function nextButton($index) {
      switch ($index) {
      case 0:
        if (vm.huntGroupName === '') {
          return false;
        } else {
          return true;
        }
        break;
      case 1:
        if (vm.selectedPilotNumbers.length === 0) {
          return false;
        } else {
          return true;
        }
        break;
      case 2:
        if (vm.huntGroupMethod === '') {
          return false;
        } else {
          return true;
        }
        break;
      case 3:
        if (vm.selectedHuntMembers.length === 0) {
          return false;
        } else {
          return true;
        }
        break;
      case 4:
        return 'hidden';
      default:
        return true;
      }
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
        vm.pageIndex++;
      }, 10);
    }

    function previousPage() {
      vm.animation = 'slide-right';
      $timeout(function () {
        vm.pageIndex--;
      }, 10);
    }

    function getPageIndex() {
      return vm.pageIndex;
    }

    function closePanel() {
      $state.go('huronfeatures');
    }

    function setHuntMethod(methodSelected) {

      if (vm.huntGroupMethod === methodSelected) {
        nextPage();
      } else {
        vm.huntGroupMethod = methodSelected;
      }
    }

    function cancelModal() {
      $modal.open({
        templateUrl: 'modules/huron/features/huntGroup/hgCancelModal.tpl.html'
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
        if (vm.selectedPilotNumber === undefined || vm.userSelected === undefined || vm.huntGroupName !== '') {
          nextPage();
        }
      }
    }

    /////////////////////////////////////////////////////////
    // Hunt members presentation controller functions.

    function selectHuntGroupMember(member) {
      vm.userSelected = undefined;
      vm.selectedHuntMembers = HuntGroupMemberDataService.selectMember(member);
    }

    function unSelectHuntGroupMember(user) {
      HuntGroupMemberDataService.removeMember(user);
      vm.openMemberPanelUuid = undefined;
    }

    function fetchHuntMembers(nameHint) {
      return $q.when(HuntGroupMemberDataService.fetchHuntMembers(nameHint)).then(function (members) {
        if (HuntGroupService.suggestionsNeeded(nameHint)) {
          vm.errorMemberInput = (members && members.length === 0);
        } else {
          vm.errorMemberInput = false;
        }
        return members;
      });
    }

    function toggleMemberPanel(user) {
      HuntGroupService.updateMemberEmail(user).then(function () {
        vm.openMemberPanelUuid = HuntGroupMemberDataService.toggleMemberPanel(user.uuid);
      });
    }

    function getDisplayName(user) {
      return HuntGroupMemberDataService.getDisplayName(user);
    }

    function populateHuntMembers(data) {
      data.members = HuntGroupMemberDataService.getMembersNumberUuidJSON();
    }

    /////////////////////////////////////////////////////////
    // Fallback destination presentation controller functions.

    function selectFallback($item) {
      vm.selectedFallbackNumber = undefined;
      vm.selectedFallbackMember = HuntGroupFallbackDataService.setFallbackMember($item);
      HuntGroupFallbackDataService.isVoicemailDisabled(customerId, _.get($item, 'selectableNumber.uuid')).then(function (isVoicemailDisabled) {
        vm.disableVoicemail = isVoicemailDisabled;
      });
    }

    function isFallbackValid() {
      return !HuntGroupFallbackDataService.isFallbackInvalid();
    }

    function validateFallbackNumber() {
      vm.selectedFallbackNumber =
        HuntGroupFallbackDataService.validateFallbackNumber(vm.selectedFallbackNumber);
    }

    function isErrorFallbackInput() {
      return (HuntGroupService.suggestionsNeeded(vm.selectedFallbackNumber) &&
        !vm.fallbackSuggestionsAvailable &&
        !isFallbackValid());
    }

    function fetchFallbackDestination(nameHint) {
      return $q.when(HuntGroupMemberDataService.fetchMembers(nameHint)).then(function (mems) {
        vm.fallbackSuggestionsAvailable = (mems && mems.length > 0);
        return mems;
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

    function removeFallbackDest() {
      vm.selectedFallbackMember = HuntGroupFallbackDataService.removeFallbackMember();
    }

    function populateFallbackDestination(data) {
      data.fallbackDestination = HuntGroupFallbackDataService.getFallbackDestinationJSON();
    }
    /////////////////////////////////////////////////////////

    function saveHuntGroup() {
      vm.saveProgress = true;
      var data = {
        name: vm.huntGroupName,
        huntMethod: vm.huntGroupMethod,
      };

      populateHuntPilotNumbers(data);
      populateHuntMembers(data);
      populateFallbackDestination(data);

      HuntGroupService.saveHuntGroup(customerId, data).then(function (data) {
        vm.saveProgress = false;
        Notification.success($translate.instant('huronHuntGroup.successSave', {
          huntGroupName: vm.huntGroupName
        }));
        $state.go('huronfeatures');
      }, function (error) {
        vm.saveProgress = false;
        Notification.errorResponse(error, $translate.instant('huronHuntGroup.errorSave', {
          huntGroupName: vm.huntGroupName
        }));
      });
    }

    function populateHuntPilotNumbers(data) {
      data.numbers = [];
      vm.selectedPilotNumbers.forEach(function (number) {
        if (number.type === 'internal') {
          number.type = 'NUMBER_FORMAT_EXTENSION';
        } else if (number.type === 'external') {
          number.type = 'NUMBER_FORMAT_DIRECT_LINE';
        }
        data.numbers.push({
          type: number.type,
          number: number.number
        });
      });
    }
  }
})();
