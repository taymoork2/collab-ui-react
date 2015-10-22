(function () {
  'use strict';

  angular
    .module('uc.huntGroup')
    .controller('HuntGroupSetupAssistantCtrl', HuntGroupSetupAssistantCtrl);

  /* @ngInject */
  function HuntGroupSetupAssistantCtrl($scope, $state, Config, $http) {
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
    vm.setHuntMethod = setHuntMethod;
    vm.huntGroupName = undefined;
    vm.huntGroupNumber = undefined;
    vm.numbers = [];
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
    vm.selected = undefined;
    vm.userSelected = undefined;
    // ==============================================

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

    function selectHuntGroupNumber($item) {
      vm.selected = undefined;

      vm.numbers.push($item.userNumber);
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
  }
})();
