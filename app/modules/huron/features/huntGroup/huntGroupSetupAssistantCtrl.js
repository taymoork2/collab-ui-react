(function () {
  'use strict';

  angular
    .module('uc.huntGroup')
    .controller('HuntGroupSetupAssistantCtrl', HuntGroupSetupAssistantCtrl);

  /* @ngInject */
  function HuntGroupSetupAssistantCtrl($scope, $state, Config, $http, HuntGroupService, Notification) {
    var vm = this;
    vm.pageIndex = 0;

    //init();
    vm.previous = 'true';
    vm.next = 'true';
    vm.nextPage = nextPage;
    vm.previousPage = previousPage;
    vm.nextButton = nextButton;
    vm.previousButton = previousButton;
    vm.getPageIndex = getPageIndex;
    vm.close = closePanel;
    vm.selectHuntGroupNumber = selectHuntGroupNumber;
    vm.selectHuntGroupUser = selectHuntGroupUser;
    vm.fetchNumbers = fetchNumbers;
    vm.unSelectHuntGroupNumber = unSelectHuntGroupNumber;

    vm.selected = undefined;
    vm.huntGroupName = undefined;
    vm.huntGroupNumber = undefined;
    vm.selectedPilotNumbers = [];
    vm.users = [];
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
      vm.selectedPilotNumbers.push($item.number);
    }

    function unSelectHuntGroupNumber(number) {
      vm.selectedPilotNumbers.splice(vm.selectedPilotNumbers.indexOf(number), 1);
    }

    function nextButton($index) {
      if ($index === 4) {
        return 'hidden';
      }
      return 'true';
    }

    function previousButton($index) {
      if ($index === 0) {
        return 'hidden';
      }
      return 'true';
    }

    function nextPage() {
      vm.pageIndex++;
    }

    function previousPage() {
      vm.pageIndex--;
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

    function init() {}
  }
})();
