(function () {
  'use strict';

  angular
    .module('Huron')
    .controller('HuntGroupSetupAssistantCtrl', HuntGroupSetupAssistantCtrl);

  /* @ngInject */
  function HuntGroupSetupAssistantCtrl($scope, $state, Config, $http, HuntGroupService, Notification, $modal, $timeout, TelephoneNumberService, Authinfo, $translate) {
    var vm = this;
    var customerId = Authinfo.getOrgId();
    vm.nextPage = nextPage;
    vm.previousPage = previousPage;
    vm.nextButton = nextButton;
    vm.previousButton = previousButton;
    vm.getPageIndex = getPageIndex;
    vm.close = closePanel;
    vm.selectPilotNumber = selectPilotNumber;
    vm.selectHuntGroupMember = selectHuntGroupMember;
    vm.unSelectHuntGroupMember = unSelectHuntGroupMember;
    vm.setHuntMethod = setHuntMethod;
    vm.huntGroupName = undefined;
    vm.selectFallback = selectFallback;
    vm.fetchNumbers = fetchNumbers;
    vm.unSelectPilotNumber = unSelectPilotNumber;
    vm.fetchHuntMembers = fetchHuntMembers;
    vm.fetchFallbackDestination = fetchFallbackDestination;
    vm.getDisplayName = getDisplayName;
    vm.cancelModal = cancelModal;
    vm.evalKeyPress = evalKeyPress;
    vm.enterNextPage = enterNextPage;
    vm.validateFallback = validateFallback;
    vm.toggleFallback = toggleFallback;
    vm.removeFallbackDest = removeFallbackDest;
    vm.saveHuntGroup = saveHuntGroup;
    vm.openMemberPanelUuid = undefined;
    vm.toggleMemberPanel = toggleMemberPanel;
    vm.selectedPilotNumber = undefined;
    vm.selectedPilotNumbers = [];
    vm.selectedHuntMembers = [];
    vm.selectedFallbackMember = undefined;
    vm.selectedFallbackNumber = undefined;
    vm.pageIndex = 0;
    vm.animation = 'slide-left';
    vm.huntGroupName = '';
    vm.hgMethods = {
      longestIdle: "DA_LONGEST_IDLE_TIME",
      broadcast: "DA_BROADCAST",
      circular: "DA_CIRCULAR",
      topDown: "DA_TOP_DOWN"
    };
    vm.huntGroupMethod = vm.hgMethods.longestIdle;
    vm.userSelected = undefined;

    // ==================================================
    // The below methods have elevated access only to be
    // called from unit testing.
    // ==================================================
    vm.populateHuntPilotNumbers = populateHuntPilotNumbers;
    vm.populateHuntMembers = populateHuntMembers;
    vm.populateFallbackDestination = populateFallbackDestination;

    function toggleMemberPanel(userUuid) {
      if (vm.openMemberPanelUuid === userUuid) {
        vm.openMemberPanelUuid = undefined;
      } else {
        vm.openMemberPanelUuid = userUuid;
      }
    }

    function getDisplayName(user) {
      if (user.lastName) {
        return user.firstName + " " + user.lastName;
      } else {
        return user.firstName;
      }
    }

    function fetchNumbers(typedNumber) {

      var GetPilotNumbers = HuntGroupService.getPilotNumberSuggestions(typedNumber);

      if (GetPilotNumbers) {
        GetPilotNumbers.setOnFailure(onFailureNotify('huronHuntGroup.numberFetchFailure'));
        GetPilotNumbers.setFilter({
          sourceKey: 'uuid',
          responseKey: 'uuid',
          dataToStrip: vm.selectedPilotNumbers
        });

        return GetPilotNumbers.fetch();
      }

      return [];
    }

    function fetchMembers(nameHint, filter) {
      var GetHuntMembers = HuntGroupService.getHuntMembers(nameHint);

      if (GetHuntMembers) {
        GetHuntMembers.setOnFailure(onFailureNotify('huronHuntGroup.memberFetchFailure'));
        if (filter) {
          GetHuntMembers.setFilter(filter);
        }
        return GetHuntMembers.fetch();
      }

      return [];
    }

    function fetchHuntMembers(nameHint) {
      return fetchMembers(nameHint, {
        sourceKey: 'uuid',
        responseKey: 'uuid',
        dataToStrip: vm.selectedHuntMembers
      });
    }

    function fetchFallbackDestination(nameHint) {
      return fetchMembers(nameHint); // We don't need filtering.
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

    function selectHuntGroupMember(member) {
      vm.userSelected = undefined;
      HuntGroupService.getMemberInfo(customerId, member.user.uuid).then(function (user) {
        member.user.email = user.email;
      });
      vm.selectedHuntMembers.push(member);
    }

    function unSelectHuntGroupMember(user) {
      vm.selectedHuntMembers.splice(
        vm.selectedHuntMembers.indexOf(user), 1);
      vm.openMemberPanelUuid = undefined;
    }

    function selectFallback($item) {
      vm.selectedFallbackMember = {
        member: $item,
        number: "",
        sendToVoicemail: false,
        openPanel: false
      };

      HuntGroupService.getMemberInfo(customerId, $item.user.uuid).then(function (user) {
        vm.selectedFallbackMember.member.user.email = user.email;
      });
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

    function needNumberValidation() {
      return (vm.selectedFallbackNumber && !isNaN(vm.selectedFallbackNumber));
    }

    function validateFallback() {
      if (!needNumberValidation()) {
        return;
      }

      var internalNumValidator =
        HuntGroupService.isFallbackNumberValid(vm.selectedFallbackNumber);

      if (internalNumValidator) {
        internalNumValidator.setOnFailure(onFailureNotify('huronHuntGroup.numberFetchFailure'));
        internalNumValidator.fetch().then(function (data) {
          if (data.length === 0) {
            // no internal number found, check for a valid external number match.
            validateFallbackForNonHuronUser();
          } else {
            // Either 1 or more internal match found, check for absolute match.
            data.forEach(function (n) {
              if (n.number === vm.selectedFallbackNumber) {
                vm.selectedFallbackNumberValid = true;
                vm.selectedFallbackNumber = TelephoneNumberService.getDIDLabel(vm.selectedFallbackNumber);
              }
            });
          }
        });
      }
    }

    function validateFallbackForNonHuronUser() {
      vm.selectedFallbackNumberValid =
        TelephoneNumberService.validateDID(vm.selectedFallbackNumber);

      if (vm.selectedFallbackNumberValid) {
        vm.selectedFallbackNumber = TelephoneNumberService.getDIDLabel(vm.selectedFallbackNumber);
      }
    }

    function toggleFallback() {
      vm.selectedFallbackMember.openPanel = !vm.selectedFallbackMember.openPanel;
    }

    function removeFallbackDest() {
      vm.selectedFallbackMember = undefined;
    }

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
        Notification.success($translate.instant('huronHuntGroup.successSave'));
        $state.go('huronfeatures');
      }, function (error) {
        vm.saveProgress = false;
        Notification.errorResponse(error, $translate.instant('huronHuntGroup.errorSave'));
      });
    }

    function populateHuntPilotNumbers(data) {
      data.numbers = [];
      vm.selectedPilotNumbers.forEach(function (number) {
        data.numbers.push({
          type: number.type,
          number: number.number
        });
      });
    }

    function populateHuntMembers(data) {
      data.members = [];
      vm.selectedHuntMembers.forEach(function (member) {
        data.members.push(member.selectableNumber.uuid);
      });
    }

    function populateFallbackDestination(data) {
      if (vm.selectedFallbackNumberValid) {
        data.fallbackDestination = {
          number: vm.selectedFallbackNumber
        };
      } else {
        data.fallbackDestination = {
          numberUuid: vm.selectedFallbackMember.member.selectableNumber.uuid,
          userUuid: vm.selectedFallbackMember.member.uuid,
          sendToVoicemail: vm.selectedFallbackMember.sendToVoicemail
        };
      }
    }
  }
})();
