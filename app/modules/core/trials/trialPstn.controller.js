(function () {
  'use strict';

  angular
    .module('core.trial')
    .controller('TrialPstnCtrl', TrialPstnCtrl);

  /* @ngInject */
  function TrialPstnCtrl($scope, $timeout, $translate, Authinfo, Notification, PstnSetupService, TelephoneNumberService, TerminusStateService, TrialPstnService) {
    var vm = this;

    vm.trialData = TrialPstnService.getData();
    vm.customerId = Authinfo.getOrgId();
    var pstnTokenLimit = 10;
    vm.showOrdering = false;

    vm.getStateInventory = getStateInventory;
    vm.searchCarrierInventory = searchCarrierInventory;
    vm.checkForInvalidTokens = checkForInvalidTokens;
    vm.skip = skip;
    vm.disableNextButton = disableNextButton;

    vm._getCarriers = _getCarriers;

    //TATA Tokenfield
    vm.manualUnsavedTokens = [];
    vm.manualTokenFieldId = 'manualdidfield';
    vm.manualTokenOptions = {
      delimiter: [',', ';'],
      createTokensOnBlur: true,
      limit: 100,
      tokens: [],
      minLength: 9,
      beautify: false
    };
    vm.manualTokenMethods = {
      createtoken: createToken,
      createdtoken: manualCreatedToken,
      editedtoken: manualEditToken,
      removedtoken: manualRemovedToken,
    };
    vm.invalidCount = 0;

    //PSTN Lookup Tokenfield
    vm.tokenFieldId = 'didAddField';
    vm.tokenOptions = {
      delimiter: [',', ';'],
      createTokensOnBlur: true,
      limit: pstnTokenLimit,
      tokens: [],
      minLength: 9,
      beautify: false
    };
    vm.tokenMethods = {
      createtoken: createToken,
      editedtoken: editedToken,
      removedtoken: removedToken,
    };

    vm.pstnProviderField = [{
      model: vm.trialData.details,
      key: 'pstnProvider',
      type: 'select',
      className: 'medium-8',
      templateOptions: {
        labelfield: 'vendor',
        required: true,
        label: $translate.instant('trialModal.pstn.provider'),
        options: [],
        onChangeFn: function () {
          vm.showOrdering = vm.trialData.details.pstnProvider.apiExists;
          resetNumbers();
        }
      },
      controller: /* @ngInject */ function ($scope) {
        _getCarriers($scope);
      }
    }];

    vm.contractInfoFields = [{
      model: vm.trialData.details.pstnContractInfo,
      key: 'companyName',
      type: 'cs-input',
      className: 'medium-12',
      templateOptions: {
        required: true,
        labelfield: 'label',
        label: $translate.instant('trialModal.pstn.company'),
        type: 'text',
      },
    }, {
      model: vm.trialData.details.pstnContractInfo,
      key: 'signeeFirstName',
      type: 'cs-input',
      className: 'medium-12',
      templateOptions: {
        required: true,
        labelfield: 'label',
        label: $translate.instant('trialModal.pstn.firstName'),
        type: 'text',
      },
    }, {
      model: vm.trialData.details.pstnContractInfo,
      key: 'signeeLastName',
      type: 'cs-input',
      className: 'medium-12',
      templateOptions: {
        required: true,
        labelfield: 'label',
        label: $translate.instant('trialModal.pstn.lastName'),
        type: 'text',
      },
    }, {
      model: vm.trialData.details.pstnContractInfo,
      key: 'email',
      type: 'cs-input',
      className: 'medium-12',
      templateOptions: {
        required: true,
        labelfield: 'label',
        label: $translate.instant('trialModal.pstn.email'),
        type: 'email',
      },
    }];

    vm.pstnStateAreaFields = [{
      model: vm.trialData.details.pstnNumberInfo,
      key: 'state',
      type: 'select',
      className: 'medium-8 state-dropdown inline-row left',
      templateOptions: {
        inputClass: 'medium-11',
        label: $translate.instant('pstnSetup.state'),
        labelfield: 'name',
        valuefield: 'abbreviation',
        onChangeFn: getStateInventory,
        options: [],
        filter: true
      },
      controller: /* @ngInject */ function ($scope) {
        TerminusStateService.query().$promise.then(function (states) {
          $scope.to.options = states;
        });
      }
    }, {
      model: vm.trialData.details.pstnNumberInfo,
      key: 'areaCode',
      id: 'areaCode',
      type: 'select',
      className: 'medium-4 inline-row left',
      templateOptions: {
        label: $translate.instant('pstnSetup.areaCode'),
        labelfield: 'code',
        valuefield: 'code',
        options: [],
        onChangeFn: searchCarrierInventory
      },
      controller: /* @ngInject */ function ($scope) {
        $scope.$watchCollection(function () {
          return vm.areaCodeOptions;
        }, function (newAreaCodes) {
          newAreaCodes = newAreaCodes || [];
          $scope.to.options = _.sortBy(newAreaCodes, 'code');
        });
      }
    }];

    init();

    function init() {
      if (_.has(vm.trialData, 'details.pstnNumberInfo.state.abbreviation')) {
        getStateInventory();
      }

      if (_.has($scope, 'trial.details.customerName') && _.get(vm, 'trialData.details.pstnContractInfo.companyName') === '') {
        vm.trialData.details.pstnContractInfo.companyName = $scope.trial.details.customerName;
      }

      if (_.has($scope, 'trial.details.customerEmail') && _.get(vm, 'trialData.details.pstnContractInfo.email') === '') {
        vm.trialData.details.pstnContractInfo.email = $scope.trial.details.customerEmail;
      }

      $timeout(function () {
        if (vm.trialData.details.pstnProvider.apiExists) {
          $('#didAddField').tokenfield('setTokens', vm.trialData.details.pstnNumberInfo.numbers.toString());
        } else {
          reinitTokens();
        }
      }, 100);
    }

    function skip(skipped) {
      vm.trialData.enabled = !skipped;
      vm.trialData.skipped = skipped;
      $timeout($scope.trial.nextStep);
    }

    function getStateInventory() {
      vm.areaCodeOptions = [];
      PstnSetupService.getCarrierInventory(vm.trialData.details.pstnProvider.uuid, vm.trialData.details.pstnNumberInfo.state.abbreviation)
        .then(function (response) {
          _.forEach(response.areaCodes, function (areaCode) {
            if (areaCode.count >= pstnTokenLimit) {
              vm.areaCodeOptions.push(areaCode);
            }
          });
        }).catch(function (response) {
          Notification.errorResponse(response, 'trialModal.pstn.error.areaCodes');
        });
    }

    function searchCarrierInventory() {
      vm.trialData.details.pstnNumberInfo.numbers = [];
      var params = {
        npa: vm.trialData.details.pstnNumberInfo.areaCode.code,
        count: pstnTokenLimit.toString(),
        sequential: false
      };

      PstnSetupService.searchCarrierInventory(vm.trialData.details.pstnProvider.uuid, params)
        .then(function (numberRanges) {
          for (var index = 0; index < pstnTokenLimit; index++) {
            vm.trialData.details.pstnNumberInfo.numbers.push(numberRanges[0][index]);
          }
          $('#didAddField').tokenfield('setTokens', vm.trialData.details.pstnNumberInfo.numbers.toString());
        }).catch(function (response) {
          Notification.errorResponse(response, 'trialModal.pstn.error.numbers');
        });
    }

    function createToken(e) {
      var tokenNumber = e.attrs.label;
      e.attrs.value = TelephoneNumberService.getDIDValue(tokenNumber);
      e.attrs.label = TelephoneNumberService.getDIDLabel(tokenNumber);
    }

    function editedToken() {
      $('#didAddField').tokenfield('setTokens', vm.trialData.details.pstnNumberInfo.numbers.toString());
      $('#didfield-tokenfield').attr('placeholder', '');
    }

    function removedToken(e) {
      var index = _.indexOf(vm.trialData.details.pstnNumberInfo.numbers, e.attrs.value);
      if (index > -1) {
        vm.trialData.details.pstnNumberInfo.numbers.splice(index, 1);
      }
    }

    function manualCreatedToken(e) {
      if (!validateDID(e.attrs.value) || isDidAlreadyPresent(e.attrs.value)) {
        angular.element(e.relatedTarget).addClass('invalid');
        vm.invalidCount++;
      }
      vm.trialData.details.swivelNumbers.push(e.attrs.value);
      setPlaceholderText("");
    }

    function manualRemovedToken(e) {
      removeNumber(e.attrs.value);
      if (angular.element(e.relatedTarget).hasClass('invalid')) {
        vm.invalidCount--;
      }
      $timeout(reinitTokens);

      //If this is the last token, put back placeholder text.
      var tokenElement = $("div", ".did-input").children(".token");
      if (tokenElement.length === 0) {
        setPlaceholderText(vm.tokenplaceholder);
      }
    }

    function manualEditToken(e) {
      removeNumber(e.attrs.value);
      if (angular.element(e.relatedTarget).hasClass('invalid')) {
        vm.invalidCount--;
      }
    }

    function reinitTokens() {
      var tmpDids = _.clone(vm.trialData.details.swivelNumbers);
      resetNumbers();
      $('#manualdidfield').tokenfield('setTokens', tmpDids.toString());
    }

    function removeNumber(value) {
      var index = _.indexOf(vm.trialData.details.swivelNumbers, value);
      if (index > -1) {
        vm.trialData.details.swivelNumbers.splice(index, 1);
      }
    }

    function validateDID(input) {
      return TelephoneNumberService.validateDID(input);
    }

    function isDidAlreadyPresent(input) {
      return _.includes(vm.trialData.details.swivelNumbers, input);
    }

    function setPlaceholderText(text) {
      $('#manualdidfield-tokenfield').attr('placeholder', text);
    }

    function checkForInvalidTokens() {
      return vm.invalidCount <= 0;
    }

    function _getCarriers(localScope) {
      PstnSetupService.listResellerCarriers().then(function (carriers) {
        _showCarriers(carriers, localScope);
      })
        .catch(function () {
          PstnSetupService.listDefaultCarriers().then(function (carriers) {
            _showCarriers(carriers, localScope);
          });
        });
    }

    function _showCarriers(carriers, localScope) {
      _.forEach(carriers, function (carrier) {
        localScope.to.options.push(carrier);
      });
      if (localScope.to.options.length === 1) {
        vm.trialData.details.pstnProvider = localScope.to.options[0];
        vm.showOrdering = localScope.to.options[0].apiExists;
      }
    }

    function disableNextButton() {
      if (!vm.showOrdering && vm.trialData.details.swivelNumbers.length === 0) {
        return true;
      } else if (!checkForInvalidTokens()) {
        return true;
      } else {
        return false;
      }
    }

    function resetNumbers() {
      vm.trialData.details.pstnNumberInfo.numbers = [];
      vm.trialData.details.swivelNumbers = [];
      vm.invalidCount = 0;
    }
  }
})();
