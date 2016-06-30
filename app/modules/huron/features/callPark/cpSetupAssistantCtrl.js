(function () {
  'use strict';

  angular
    .module('Huron')
    .controller('CallParkSetupAssistantCtrl', CallParkSetupAssistantCtrl);

  /* @ngInject */
  function CallParkSetupAssistantCtrl($q, $state, $modal, $timeout, $translate,
    Authinfo, Notification, CallParkService, CallParkMemberDataService) {
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
    vm.saveCallPark = saveCallPark;
    vm.pageIndex = 0;
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
      switch ($index) {
        case 0: return vm.callParkName !== '';
          break;
        case 1: return vm.selectedSingleNumber !== '';
          break;
        case 2: return vm.selectedMembers.length !== 0;
          break;
        default: return true;
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
        if (vm.selectedNumber === undefined || vm.userSelected === undefined || vm.callParkName !== '') {
          nextPage();
        }
      }
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

    function getDisplayName(user) {
      return CallParkMemberDataService.getDisplayName(user);
    }

    /////////////////////////////////////////////////////////

    // this function will be used in future milestones
    function saveCallPark() {
      vm.saveProgress = true;
      var data = {
        name: vm.callParkName
      };

      populateNumbers(data);
      populateMembers(data);

      CallParkService.saveCallPark(customerId, data).then(function (data) {
        vm.saveProgress = false;
        Notification.success($translate.instant('callPark.successSave', {
          callParkName: vm.callParkName
        }));
        $state.go('huronfeatures');
      }, function (error) {
        vm.saveProgress = false;
        Notification.errorResponse(error, $translate.instant('callPark.errorSave', {
          callParkName: vm.callParkName
        }));
      });
    }

    function populateNumbers(data) {
      data.numbers = [];
      vm.selectedNumbers.forEach(function (number) {
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

    function populateMembers(data) {
      data.members = CallParkMemberDataService.getMembersNumberUuidJSON();
    }
  }
})();
