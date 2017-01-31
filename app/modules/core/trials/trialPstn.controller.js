(function () {
  'use strict';

  angular
    .module('core.trial')
    .controller('TrialPstnCtrl', TrialPstnCtrl);

  /* @ngInject */
  function TrialPstnCtrl($scope, $timeout, $translate, Analytics, Authinfo, Notification, PstnSetupService, TelephoneNumberService, TerminusStateService, TrialPstnService) {
    var vm = this;

    var NXX = 'nxx';
    var NXX_EMPTY = '--';
    var MAX_CARRIER_CNT = 50;

    vm.parentTrialData = $scope.$parent.trialData;
    vm.trialData = TrialPstnService.getData();
    vm.customerId = Authinfo.getOrgId();
    var pstnTokenLimit = 10;
    vm.SWIVEL = 'SWIVEL';
    vm.providerImplementation = vm.SWIVEL;
    vm.carrierCnt = 0;

    vm.getStateInventory = getStateInventory;
    vm.onAreaCodeChange = onAreaCodeChange;
    vm.onNxxChange = onNxxChange;
    vm.searchCarrierInventory = searchCarrierInventory;
    vm.checkForInvalidTokens = checkForInvalidTokens;
    vm.skip = skip;
    vm.disableNextButton = disableNextButton;
    vm._getCarriers = _getCarriers;

    vm.pstn = {
      stateOptions: [],
      areaCodeOptions: null,
      areaCodeEnable: false,
      nxxOptions: null,
      nxxEnable: false
    };

    //TATA Tokenfield
    vm.manualUnsavedTokens = [];
    vm.manualTokenFieldId = 'manualdidfield';
    vm.manualTokenOptions = {
      delimiter: [',', ';'],
      createTokensOnBlur: true,
      limit: 100,
      tokens: [],
      beautify: false
    };
    vm.manualTokenMethods = {
      createtoken: manualCreateToken,
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
        labelfield: 'name',
        required: true,
        label: $translate.instant('trialModal.pstn.provider'),
        options: [],
        onChangeFn: function () {
          vm.providerImplementation = vm.trialData.details.pstnProvider.apiImplementation;
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

    init();

    function init() {
      _setupResellers();

      TerminusStateService.query().$promise.then(function (states) {
        vm.pstn.stateOptions = states;
      });

      Analytics.trackTrialSteps(Analytics.eventNames.ENTER_SCREEN, vm.parentTrialData);
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
        if (vm.trialData.details.pstnProvider.apiImplementation !== vm.SWIVEL) {
          $('#didAddField').tokenfield('setTokens', vm.trialData.details.pstnNumberInfo.numbers.toString());
        } else {
          reinitTokens();
        }
      }, 100);
    }

    function _setupResellers() {
      if (!vm.trialData.reseller) {
        PstnSetupService.getResellerV2().then(function () {
          vm.trialData.reseller = true;
        }).catch(function () {
          PstnSetupService.createResellerV2().then(function () {
            vm.trialData.reseller = true;
          }).catch(function (response) {
            Notification.errorResponse(response, 'pstnSetup.resellerCreateError');
          });
        });
      }
    }

    function skip(skipped) {
      Analytics.trackTrialSteps(Analytics.eventNames.SKIP, vm.parentTrialData);
      vm.trialData.enabled = !skipped;
      vm.trialData.skipped = skipped;
      $timeout($scope.trial.nextStep);
    }

    function getStateInventory() {
      vm.pstn.areaCodeOptions = [];
      vm.trialData.details.pstnNumberInfo.areaCode = null;
      vm.trialData.details.pstnNumberInfo.nxx = null;
      vm.pstn.nxxEnable = false;
      resetNumbers();
      PstnSetupService.getCarrierInventory(
        vm.trialData.details.pstnProvider.uuid,
        vm.trialData.details.pstnNumberInfo.state.abbreviation
      ).then(
        function (response) {
          var options = [];
          vm.pstn.areaCodeEnable = true;
          _.forEach(response.areaCodes,
            function (areaCode) {
              if (areaCode.count >= pstnTokenLimit) {
                options.push(areaCode);
              }
            }
          );
          vm.pstn.areaCodeOptions = _.sortBy(options, 'code');
        }
      ).catch(
        function (response) {
          Notification.errorResponse(response, 'trialModal.pstn.error.areaCodes');
        }
      );
    }

    function onAreaCodeChange() {
      //Reset NXX after Area Code changed
      vm.trialData.details.pstnNumberInfo.nxx = null;
      searchCarrierInventory();
      //Get Exchanges
      PstnSetupService.getCarrierInventory(
        vm.trialData.details.pstnProvider.uuid,
        vm.trialData.details.pstnNumberInfo.state.abbreviation,
        vm.trialData.details.pstnNumberInfo.areaCode.code
      ).then(
        function (response) {
          var options = [];
          vm.pstn.nxxEnable = true;
          _.forEach(response.exchanges,
            function (exchange) {
              if (exchange.count >= pstnTokenLimit) {
                options.push(exchange);
              }
            }
          );
          vm.pstn.nxxOptions = _.sortBy(options, 'code');
          vm.pstn.nxxOptions.unshift({ code: NXX_EMPTY });
          vm.trialData.details.pstnNumberInfo.nxx = vm.pstn.nxxOptions[0];
        }
      ).catch(
        function (response) {
          Notification.errorResponse(response, 'trialModal.pstn.error.exchanges');
        }
      );
    }

    function onNxxChange() {
      searchCarrierInventory();
    }

    function getNxxValue() {
      if (vm.trialData.details.pstnNumberInfo.nxx !== null) {
        if (vm.trialData.details.pstnNumberInfo.nxx.code !== NXX_EMPTY) {
          return vm.trialData.details.pstnNumberInfo.nxx.code;
        }
      }
      return null;
    }

    function searchCarrierInventory() {
      vm.trialData.details.pstnNumberInfo.numbers = [];
      var params = {
        npa: vm.trialData.details.pstnNumberInfo.areaCode.code,
        count: pstnTokenLimit.toString(),
        sequential: false
      };

      var nxx = getNxxValue();
      if (nxx !== null) {
        params[NXX] = nxx;
      }

      PstnSetupService.searchCarrierInventory(vm.trialData.details.pstnProvider.uuid, params)
        .then(function (numberRanges) {
          for (var index = 0; index < pstnTokenLimit; index++) {
            vm.trialData.details.pstnNumberInfo.numbers.push(numberRanges[0][index]);
          }
          $('#didAddField').tokenfield('setTokens', vm.trialData.details.pstnNumberInfo.numbers.toString());
        })
        .catch(function (response) {
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

    function manualCreateToken(e) {
      if (e.attrs.value.charAt(0) !== '+') {
        e.attrs.value = '+'.concat(e.attrs.value);
      }
      try {
        e.attrs.value = e.attrs.label = phoneUtils.formatE164(e.attrs.value);
      } catch (e) {
        //noop
      }
    }

    function manualCreatedToken(e) {
      if (!TelephoneNumberService.internationalNumberValidator(e.attrs.value) || isDidAlreadyPresent(e.attrs.value)) {
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

    function isDidAlreadyPresent(input) {
      return _.includes(vm.trialData.details.swivelNumbers, input);
    }

    function setPlaceholderText(text) {
      $('#manualdidfield-tokenfield').attr('placeholder', text);
    }

    function checkForInvalidTokens() {
      return vm.invalidCount <= 0;
    }

    function _listCarriers(localScope) {
      PstnSetupService.listResellerCarriers().then(function (carriers) {
        if (_.isArray(carriers) && carriers.length > 0) {
          _showCarriers(carriers, localScope);
        } else {
          PstnSetupService.listDefaultCarriers().then(function (carriers) {
            _showCarriers(carriers, localScope);
          });
        }
      }).catch(function () {
        PstnSetupService.listDefaultCarriers().then(function (carriers) {
          _showCarriers(carriers, localScope);
        });
      });
    }

    function _getCarriers(localScope) {
      if (!vm.trialData.reseller) {
        $timeout(function () {
          if (vm.carrierCnt < MAX_CARRIER_CNT) {
            vm.carrierCnt++;
            _getCarriers(localScope);
          }
        }, 100);
      } else {
        _listCarriers(localScope);
      }
    }

    function _showCarriers(carriers, localScope) {
      _.forEach(carriers, function (carrier) {
        carrier.displayName = (carrier.displayName || carrier.name);
        if (_.get(carrier, 'offers', []).length > 0) {
          carrier.name = carrier.offers[0] + '-' + carrier.displayName;
        } else if (_.get(carrier, 'offers', []).length === 0) {
          carrier.name = carrier.vendor + '-' + carrier.displayName;
        }
        localScope.to.options.push(carrier);
      });
      if (localScope.to.options.length === 1) {
        vm.trialData.details.pstnProvider = localScope.to.options[0];
        vm.providerImplementation = localScope.to.options[0].apiImplementation;
      }
    }

    function disableNextButton() {
      if (!checkForInvalidTokens()) {
        // there are invalid tokens
        return true;
      } else if (vm.providerImplementation === vm.SWIVEL && _.size(vm.trialData.details.swivelNumbers) === 0) {
        // no swivel numbers entered
        return true;
      } else if (vm.providerImplementation !== vm.SWIVEL && _.size(vm.trialData.details.pstnNumberInfo.numbers) === 0) {
        // no PSTN numbers
        return true;
      } else {
        // have some valid numbers
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
