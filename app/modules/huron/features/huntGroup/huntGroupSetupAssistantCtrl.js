(function () {
  'use strict';

  angular
    .module('Huron')
    .controller('HuntGroupSetupAssistantCtrl', HuntGroupSetupAssistantCtrl);

  /* @ngInject */
  function HuntGroupSetupAssistantCtrl($scope, $state, Config, $http, HuntGroupService, Notification, $modal, $timeout) {
    var vm = this;

    vm.nextPage = nextPage;
    vm.previousPage = previousPage;
    vm.nextButton = nextButton;
    vm.previousButton = previousButton;
    vm.getPageIndex = getPageIndex;
    vm.close = closePanel;
    vm.selectPilotNumber = selectPilotNumber;
    vm.selectHuntGroupMember = selectHuntGroupMember;
    vm.setHuntMethod = setHuntMethod;
    vm.huntGroupName = undefined;
    vm.fetchNumbers = fetchNumbers;
    vm.unSelectPilotNumber = unSelectPilotNumber;
    vm.fetchHuntMembers = fetchHuntMembers;
    vm.cancelModal = cancelModal;
    vm.evalKeyPress = evalKeyPress;
    vm.enterNextPage = enterNextPage;

    vm.selectedPilotNumber = undefined;
    vm.selectedPilotNumbers = [];
    vm.selectedHuntMembers = [];
    vm.pageIndex = 0;
    vm.animation = 'slide-left';
    vm.huntGroupName = '';
    vm.hgMethods = {
      "longestIdle": "longest-idle",
      "broadcast": "broadcast",
      "circular": "circular",
      "topDown": "top-down"
    };
    vm.huntGroupMethod = vm.hgMethods.longestIdle;
    vm.userSelected = undefined;

    // ==============================================

    function fetchHuntMembers(nameHint) {
      return HuntGroupService.getHuntMembers(
        'name', nameHint,
        vm.selectedHuntMembers,
        onFailureNotify('huntGroup.nameFetchFailure'));
    }

    function fetchNumbers(typedNumber) {
      return HuntGroupService.getPilotNumberSuggestions(
        'number', typedNumber,
        vm.selectedPilotNumbers,
        onFailureNotify('huntGroup.numberFetchFailure'));
    }

    function onFailureNotify(notificationKey) {
      return function (response) {
        Notification.errorResponse(response, notificationKey);
      };
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

    function selectHuntGroupMember(user) {
      vm.userSelected = undefined;
      if(huntNumberSelected(user)) {
        vm.selectedHuntMembers.push(user);
      }
    }

    function huntNumberSelected(user) {
      return user.numbers.filter(function (n) {
        return (n.isSelected);
      }).length > 0;
    }

    function setHuntMethod(methodSelected) {

      if (vm.huntGroupMethod === methodSelected) {
        nextPage();
      } else {
        vm.huntGroupMethod = methodSelected;
      }
    }

    function init() {}

    function cancelModal() {
      $modal.open({
        templateUrl: 'modules/huron/features/huntGroup/huntGroupCancelModal.tpl.html'
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
  }
})();
