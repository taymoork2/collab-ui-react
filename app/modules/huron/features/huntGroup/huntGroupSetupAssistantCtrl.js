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
    vm.selectHuntGroupNumber = selectHuntGroupNumber;
    vm.selectHuntGroupUser = selectHuntGroupUser;
    vm.setHuntMethod = setHuntMethod;
    vm.huntGroupName = undefined;
    vm.fetchNumbers = fetchNumbers;
    vm.unSelectHuntGroupNumber = unSelectHuntGroupNumber;
    vm.cancelModal = cancelModal;
    vm.evalKeyPress = evalKeyPress;
    vm.enterNextPage = enterNextPage;

    vm.selected = undefined;
    vm.selectedPilotNumbers = [];
    vm.pageIndex = 0;
    vm.animation = 'slide-left';
    vm.huntGroupName = '';
    vm.huntGroupNumber = undefined;
    vm.users = [];
    vm.hgMethods = {
      "longestIdle": "longest-idle",
      "broadcast": "broadcast",
      "circular": "circular",
      "topDown": "top-down"
    };
    vm.huntGroupMethod = vm.hgMethods.longestIdle;
    vm.numberData = [{
      "userNumber": "1597534567"
    }, {
      "userNumber": "6549873210"
    }, {
      "userNumber": "3216549870"
    }, {
      "userNumber": "3692581470"
    }];
    vm.userData = [{
      "userName": "samwi",
      "userNumber": ["3579517894", "9876543210"]
    }, {
      "userName": "nlipe",
      "userNumber": ["6549873210"]
    }, {
      "userName": "brspence",
      "userNumber": ["3216549870"]
    }, {
      "userName": "jlowery",
      "userNumber": ["3692581470"]
    }];
    vm.userSelected = undefined;

    // ==============================================

    function fetchNumbers(typedNumber) {
      return HuntGroupService.getPilotNumberSuggestions(
        typedNumber,
        vm.selectedPilotNumbers,
        onFetchNumbersFailure);
    }

    function onFetchNumbersFailure(response) {
      Notification.errorResponse(response, 'huntGroup.numberFetchFailure');
    }

    function selectHuntGroupNumber($item) {
      vm.selected = undefined;
      vm.selectedPilotNumbers.push($item.number);
    }

    function unSelectHuntGroupNumber(number) {
      vm.selectedPilotNumbers.splice(vm.selectedPilotNumbers.indexOf(number), 1);
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
        if (vm.users.length === 0) {
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

    function selectHuntGroupUser($item) {
      var selectedUser = {
        'userName': $item.userName,
        'userNumber': $item.userNumber
      };
      vm.userSelected = undefined;
      vm.users.push(selectedUser);
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
        if (vm.selected === undefined || vm.userSelected === undefined || vm.huntGroupName !== '') {
          nextPage();
        }
      }
    }
  }
})();
