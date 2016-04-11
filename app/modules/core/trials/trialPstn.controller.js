(function () {
  'use strict';

  angular
    .module('core.trial')
    .controller('TrialPstnCtrl', TrialPstnCtrl);

  /* @ngInject */
  function TrialPstnCtrl($scope, $timeout, $translate, Authinfo, DidService, Notification, PstnSetupService, TelephoneNumberService, TerminusCarrierService, TerminusStateService, TerminusResellerCarrierService, TrialPstnService) {
    var vm = this;

    vm.trialData = TrialPstnService.getData();
    var customerId = Authinfo.getOrgId();
    var pstnTokenLimit = 5;

    vm.getStateInventory = getStateInventory;
    vm.searchCarrierInventory = searchCarrierInventory;
    vm.checkForInvalidTokens = checkForInvalidTokens;
    vm.skip = skip;

    //TATA Tokenfield
    vm.manualUnsavedTokens = [];
    vm.manualTokenField = 'manualdidfield';
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
      className: 'medium-10 columns',
      templateOptions: {
        required: true,
        labelClass: 'columns medium-2',
        inputClass: 'columns medium-7',
        label: $translate.instant('trialModal.pstn.provider'),
        labelfield: 'name',
        options: []
      },
      controller: /* @ngInject */ function ($scope) {
        TerminusResellerCarrierService.query({
            resellerId: customerId
          }).$promise.then(function (carriers) {
            showCarriers(carriers);
          })
          .catch(function (response) {
            TerminusCarrierService.query({
              defaultOffer: 'true',
              service: 'pstn'
            }).$promise.then(function (carriers) {
              showCarriers(carriers);
            });
          });

        function showCarriers(carriers) {
          angular.forEach(carriers, function (item) {
            if (item.name === 'TATA') {
              item.name = 'TATA Communication';
            } else if (item.name === 'INTELEPEER') {
              item.name = 'IntelePeer';
            } else if (item.name === 'TELSTRA') {
              item.name = 'Telstra';
            }
          });
          $scope.to.options = carriers;

          if (carriers.length === 1) {
            vm.trialData.details.pstnProvider = carriers[0];
          }
        }
      }
    }];

    vm.contractInfoFields = [{
      model: vm.trialData.details.pstnContractInfo,
      key: 'companyName',
      type: 'input',
      className: 'no-pad',
      templateOptions: {
        required: true,
        labelfield: 'label',
        label: $translate.instant('trialModal.pstn.company'),
        labelClass: 'columns medium-5 text-right',
        inputClass: 'columns medium-8',
        type: 'text',
      },
    }, {
      model: vm.trialData.details.pstnContractInfo,
      key: 'signeeFirstName',
      type: 'input',
      className: 'no-pad',
      templateOptions: {
        required: true,
        labelfield: 'label',
        label: $translate.instant('trialModal.pstn.firstName'),
        labelClass: 'columns medium-5 text-right',
        inputClass: 'columns medium-8',
        type: 'text',
      },
    }, {
      model: vm.trialData.details.pstnContractInfo,
      key: 'signeeLastName',
      type: 'input',
      className: 'no-pad',
      templateOptions: {
        required: true,
        labelfield: 'label',
        label: $translate.instant('trialModal.pstn.lastName'),
        labelClass: 'columns medium-5 text-right',
        inputClass: 'columns medium-8',
        type: 'text',
      },
    }, {
      model: vm.trialData.details.pstnContractInfo,
      key: 'email',
      type: 'input',
      className: 'no-pad',
      templateOptions: {
        required: true,
        labelfield: 'label',
        label: $translate.instant('trialModal.pstn.email'),
        labelClass: 'columns medium-5 text-right',
        inputClass: 'columns medium-8',
        type: 'email',
      },
    }];

    vm.pstnStateAreaFields = [{
      type: 'inline',
      className: 'row full',
      templateOptions: {
        fields: [{
          model: vm.trialData.details.pstnNumberInfo,
          key: 'state',
          type: 'select',
          className: 'medium-6 columns max-width',
          templateOptions: {
            labelClass: 'columns medium-4 text-right',
            inputClass: 'columns medium-7',
            label: $translate.instant('pstnSetup.state'),
            labelfield: 'name',
            valuefield: 'abbreviation',
            onChangeFn: getStateInventory,
            options: []
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
          className: 'medium-6 columns max-width',
          templateOptions: {
            labelClass: 'columns medium-5 text-right',
            inputClass: 'columns medium-7',
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
        }]
      }
    }];

    init();

    function init() {
      if (_.get(vm, 'trialData.details.pstnNumberInfo.numbers.length', 0) > 0) {
        $timeout(function () {
          $('#didAddField').tokenfield('setTokens', vm.trialData.details.pstnNumberInfo.numbers.toString());
          reinitTokens();
        }, 100);
      }

      if (_.has(vm.trialData, 'details.pstnNumberInfo.state.abbreviation')) {
        getStateInventory();
      }

      if (_.has($scope, 'trial.details.customerName') && _.get(vm, 'trialData.details.pstnContractInfo.companyName') === '') {
        vm.trialData.details.pstnContractInfo.companyName = $scope.trial.details.customerName;
      }

      if (_.has($scope, 'trial.details.customerEmail') && _.get(vm, 'trialData.details.pstnContractInfo.email') === '') {
        vm.trialData.details.pstnContractInfo.email = $scope.trial.details.customerEmail;
      }
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
          _.forEach(response.areaCodes, function (areaCode, index) {
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

    function editedToken(e) {
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
      // add to service after validation/duplicate checks
      DidService.addDid(e.attrs.value);
      vm.trialData.details.swivelNumbers.push(e.attrs.value);
      setPlaceholderText("");
    }

    function manualRemovedToken(e) {
      DidService.removeDid(e.attrs.value);
      var index = _.indexOf(vm.trialData.details.swivelNumbers, (e.attrs.value));
      if (index > -1) {
        vm.trialData.details.swivelNumbers.splice(index, 1);
      }
      $timeout(reinitTokens);

      //If this is the last token, put back placeholder text.
      var tokenElement = $("div", ".did-input").children(".token");
      if (tokenElement.length === 0) {
        setPlaceholderText(vm.tokenplaceholder);
      }
    }

    function manualEditToken(e) {
      DidService.removeDid(e.attrs.value);
      if (angular.element(e.relatedTarget).hasClass('invalid')) {
        vm.invalidCount--;
      }
    }

    function reinitTokens() {
      var tmpDids = DidService.getDidList();
      // reset invalid and list before setTokens
      vm.invalidCount = 0;
      DidService.clearDidList();
      $('#manualdidfield').tokenfield('setTokens', tmpDids.toString());
    }

    function validateDID(input) {
      return TelephoneNumberService.validateDID(input);
    }

    function isDidAlreadyPresent(input) {
      return _.includes(DidService.getDidList(), input);
    }

    function setPlaceholderText(text) {
      $('#manualdidfield-tokenfield').attr('placeholder', text);
    }

    function checkForInvalidTokens() {
      return vm.invalidCount > 0 ? false : true;
    }
  }
})();
