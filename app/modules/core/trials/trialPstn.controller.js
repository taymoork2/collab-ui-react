(function () {
  'use strict';

  angular
    .module('core.trial')
    .controller('TrialPstnCtrl', TrialPstnCtrl);

  /* @ngInject */
  function TrialPstnCtrl($scope, $q, $timeout, $translate, Analytics, Authinfo, Notification, PstnModel, PstnService, PhoneNumberService, TrialPstnService, PstnAreaService, NumberModelFactory) {
    var vm = this;

    var NXX = 'nxx';
    var NXX_EMPTY = '--';
    var pstnTokenLimit = 10;
    var SELECT = '';
    var MIN_VALID_CODE = 3;
    var MAX_VALID_CODE = 6;
    var MAX_DID_QUANTITY = 100;

    vm.parentTrialData = $scope.$parent.trialData;
    vm.trialData = TrialPstnService.getData();
    vm.customerId = Authinfo.getOrgId();
    vm.SWIVEL = 'SWIVEL';
    vm.providerImplementation = vm.SWIVEL;
    vm.carrierCnt = 0;
    vm.providerSelected = false;
    vm.nsModel = NumberModelFactory.create();

    vm.getStateInventory = getStateInventory;
    vm.onAreaCodeChange = onAreaCodeChange;
    vm.onNxxChange = onNxxChange;
    vm.searchCarrierInventory = searchCarrierInventory;
    vm.checkForInvalidTokens = checkForInvalidTokens;
    vm.skip = skip;
    vm.disableNextButton = disableNextButton;
    vm.onProviderChange = onProviderChange;
    vm.onProviderReady = onProviderReady;
    vm.addToCart = addToCart;
    vm.removeOrder = removeOrder;
    vm.manualTokenChange = manualTokenChange;
    vm.changePstnProviderImplementation = changePstnProviderImplementation;
    vm.isSwivel = isSwivel;

    vm.location = '';
    vm.errorMessages = {
      email: $translate.instant('common.invalidEmail'),
      required: $translate.instant('common.required'),
    };

    vm.pstn = {
      stateOptions: [],
      areaCodeOptions: null,
      areaCodeEnable: false,
      nxxOptions: null,
      nxxEnable: false,
    };

    //TATA Tokenfield
    vm.manualUnsavedTokens = [];
    vm.manualTokenFieldId = 'manualdidfield';
    vm.manualTokenOptions = {
      delimiter: [',', ';'],
      createTokensOnBlur: true,
      limit: 100,
      tokens: [],
      beautify: false,
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
      beautify: false,
    };
    vm.tokenMethods = {
      createtoken: createToken,
      editedtoken: editedToken,
      removedtoken: removedToken,
    };
    vm.pstnProviderList = [];

    init();

    function init() {
      _setupResellers();

      SELECT = $translate.instant('common.select');

      PstnAreaService.getCountryAreas(vm.trialData.details.countryCode).then(loadLocations);

      Analytics.trackTrialSteps(Analytics.eventNames.ENTER_SCREEN, vm.parentTrialData);
      if (_.has(vm.trialData, 'details.pstnNumberInfo.state.abbreviation')) {
        getStateInventory();
      }

      if (_.has($scope, 'trial.details.customerName') && _.get(vm, 'trialData.details.pstnContractInfo.companyName') === '') {
        vm.trialData.details.pstnContractInfo.companyName = $scope.trial.details.customerName;
      }

      if (_.has($scope, 'trial.details.customerEmail') && _.get(vm, 'trialData.details.pstnContractInfo.emailAddress') === '') {
        vm.trialData.details.pstnContractInfo.emailAddress = $scope.trial.details.customerEmail;
      }

      $timeout(function () {
        if (vm.trialData.details.pstnProvider.apiImplementation !== vm.SWIVEL) {
          $('#didAddField').tokenfield('setTokens', vm.trialData.details.pstnNumberInfo.numbers.toString());
        } else {
          reinitTokens();
        }
      }, 100);
    }

    function isSwivel() {
      return (vm.providerImplementation === vm.SWIVEL || vm.trialData.details.pstnProvider.apiImplementation === vm.SWIVEL);
    }

    function loadLocations(location) {
      vm.location = location.typeName;
      vm.pstn.stateOptions = location.areas;
    }
    function changePstnProviderImplementation() {
      vm.providerImplementation = vm.trialData.details.pstnProvider.apiImplementation;
      resetNumbers();
      vm.providerSelected = true;
    }

    function onProviderChange(reset) {
      vm.trialData.details.pstnProvider = PstnModel.getProvider();
      vm.providerImplementation = vm.trialData.details.pstnProvider.apiImplementation;
      resetNumberSearch(reset);
      vm.providerSelected = true;
    }

    function onProviderReady() {
      if (PstnModel.getCarriers().length === 1) {
        PstnModel.getCarriers()[0].selected = true;
        PstnModel.setProvider(PstnModel.getCarriers()[0]);
        onProviderChange();
      } else {
        PstnModel.getCarriers().forEach(function (pstnCarrier) {
          if (pstnCarrier.selected) {
            PstnModel.setProvider(pstnCarrier);
            onProviderChange();
          }
        });
      }
    }

    function _setupResellers() {
      if (!vm.trialData.reseller) {
        PstnService.getResellerV2().then(function () {
          vm.trialData.reseller = true;
        }).catch(function () {
          PstnService.createResellerV2().then(function () {
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
      PstnService.getCarrierInventory(
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
      PstnService.getCarrierInventory(
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

    function removeOrderFromCart(order) {
      _.pull(vm.trialData.details.pstnNumberInfo.numbers, order);
      vm.nsModel.maxSelection = 10 - vm.trialData.details.pstnNumberInfo.numbers.length;
    }

    function removeOrder(order) {
      PstnService.releaseCarrierInventoryV2(PstnModel.getCustomerId(), order.reservationId, order.data.numbers, PstnModel.isCustomerExists())
        .then(_.partial(removeOrderFromCart, order));
    }

    function addToCart(searchResultsModel) {
      var reservation;
      var promises = [];
      _.forIn(searchResultsModel, function (value, _key) {
        if (value) {
          var key = _.parseInt(_key);
          var searchResultsIndex = (vm.nsModel.paginateOptions.currentPage * vm.nsModel.paginateOptions.pageSize) + key;
          if (searchResultsIndex < vm.nsModel.searchResults.length && !vm.trialData.details.pstnNumberInfo.numbers.includes(vm.nsModel.searchResults[searchResultsIndex])) {
            var numbers = vm.nsModel.searchResults[searchResultsIndex];
            reservation = PstnService.reserveCarrierInventoryV2(PstnModel.getCustomerId(), PstnModel.getProviderId(), numbers, PstnModel.isCustomerExists());
            var promise = reservation
              .then(function (reservationData) {
                var order = {
                  data: {
                    numbers: numbers,
                  },
                  numberType: 'DID',
                  orderType: 'NUMBER_ORDER',
                  reservationId: reservationData.uuid,
                };
                vm.trialData.details.pstnNumberInfo.numbers.push(order);
                // return the index to be used in the promise callback
                return {
                  searchResultsIndex: searchResultsIndex,
                  searchResultsModelIndex: key,
                };
              }).catch(function (response) {
                Notification.errorResponse(response);
              });
            promises.push(promise);
          }
        }
      });

      $q.all(promises).finally(function () {
        vm.nsModel.addLoading = false;
        vm.nsModel.searchResults = [];
      });
    }

    function searchCarrierInventory(value) {
      vm.nsModel.paginateOptions.currentPage = 0;
      if (value) {
        vm.trialData.details.pstnNumberInfo.areaCode = {
          code: ('' + value).slice(0, MIN_VALID_CODE),
        };
      } else {
        vm.trialData.details.pstnNumberInfo.numbers = [];
      }
      var params = {
        npa: vm.trialData.details.pstnNumberInfo.areaCode.code,
        count: MAX_DID_QUANTITY,
        sequential: false,
      };

      var nxx = getNxxValue();
      if (nxx !== null) {
        params[NXX] = nxx;
      }

      if (value) {
        if (value.length === MAX_VALID_CODE) {
          params[NXX] = value.slice(MIN_VALID_CODE, value.length);
        } else {
          params[NXX] = null;
        }
      }

      PstnService.searchCarrierInventory(vm.trialData.details.pstnProvider.uuid, params)
        .then(function (numberRanges) {
          vm.nsModel.searchResults = _.flatten(numberRanges);
          vm.nsModel.showNoResult = vm.nsModel.searchResults.length === 0;
          if (!value) {
            for (var index = 0; index < pstnTokenLimit; index++) {
              vm.trialData.details.pstnNumberInfo.numbers.push(numberRanges[0][index]);
            }
          }
          $('#didAddField').tokenfield('setTokens', vm.trialData.details.pstnNumberInfo.numbers.toString());
        })
        .catch(function (response) {
          Notification.errorResponse(response, 'trialModal.pstn.error.numbers');
        });
    }

    function createToken(e) {
      var tokenNumber = e.attrs.label;
      e.attrs.value = PhoneNumberService.getE164Format(tokenNumber);
      e.attrs.label = PhoneNumberService.getNationalFormat(tokenNumber);
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
      e.attrs.value = e.attrs.label = PhoneNumberService.getE164Format(e.attrs.value);
    }

    function manualCreatedToken(e) {
      if (!PhoneNumberService.internationalNumberValidator(e.attrs.value) || isDidAlreadyPresent(e.attrs.value)) {
        angular.element(e.relatedTarget).addClass('invalid');
        vm.invalidCount++;
      }
      vm.trialData.details.swivelNumbers.push(e.attrs.value);
      setPlaceholderText('');
    }

    function manualRemovedToken(e) {
      removeNumber(e.attrs.value);
      if (angular.element(e.relatedTarget).hasClass('invalid')) {
        vm.invalidCount--;
      }
      $timeout(reinitTokens);

      //If this is the last token, put back placeholder text.
      var tokenElement = $('div', '.did-input').children('.token');
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

    function manualTokenChange(tokens, invalidCount) {
      vm.trialData.details.swivelNumbers = tokens;
      vm.invalidCount = invalidCount;
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
      $('#didAddField').tokenfield('setTokens', ',');
    }

    function resetNumberSearch(reset) {
      vm.trialData.details.pstnNumberInfo.state = SELECT;
      vm.trialData.details.pstnNumberInfo.areaCode = SELECT;
      vm.pstn.areaCodeEnable = false;
      vm.trialData.details.pstnNumberInfo.nxx = '--';
      vm.pstn.nxxEnable = false;
      if (reset) {
        resetNumbers();
      }
    }
  }
})();
