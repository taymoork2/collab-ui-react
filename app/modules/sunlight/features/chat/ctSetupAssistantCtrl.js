(function () {
  'use strict';

  angular
    .module('Sunlight')
    .controller('CareChatSetupAssistantCtrl', CareChatSetupAssistantCtrl);

  /* @ngInject */
  function CareChatSetupAssistantCtrl($modal, $timeout) {
    var vm = this;

    vm.cancelModal = cancelModal;
    vm.evalKeyPress = evalKeyPress;

    // Setup assistant controller functions
    vm.nextPage = nextPage;
    vm.previousPage = previousPage;
    vm.nextButton = nextButton;
    vm.previousButton = previousButton;
    vm.pageIndex = 0;
    vm.getPageIndex = getPageIndex;
    vm.animation = 'slide-left';

    // Setup Assistant pages with index
    vm.namePageIndex = 0;
    vm.profilePageIndex = 1;
    vm.overviewPageIndex = 2;
    vm.customerInfoPageIndex = 3;
    vm.feedbackPageIndex = 4;
    vm.agentUnavailablePageIndex = 5;
    vm.offHoursPageIndex = 6;
    vm.chatStringsPageIndex = 7;
    vm.embedCodePageIndex = 8;

    vm.totalPages = 9;

    // Event key codes
    vm.escapeKey = 27;
    vm.leftArrow = 37;
    vm.rightArrow = 39;

    function cancelModal() {
      $modal.open({
        templateUrl: 'modules/sunlight/features/chat/ctCancelModal.tpl.html'
      });
    }

    function evalKeyPress($keyCode) {
      switch ($keyCode) {
      case vm.escapeKey:
        cancelModal();
        break;
      case vm.rightArrow:
        if (nextButton(getPageIndex()) === true) {
          nextPage();
        }
        break;
      case vm.leftArrow:
        if (previousButton(getPageIndex()) === true) {
          previousPage();
        }
        break;
      default:
        break;
      }
    }

    function getPageIndex() {
      return vm.pageIndex;
    }

    function nextButton($index) {
      if ($index === (vm.totalPages - 1)) {
        return 'hidden';
      }
      return true;
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

  }
})();
