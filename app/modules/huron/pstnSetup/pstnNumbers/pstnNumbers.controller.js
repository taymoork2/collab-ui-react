(function () {
  'use strict';

  angular.module('Huron')
    .filter('startFrom', StartFromFilter)
    .controller('PstnNumbersCtrl', PstnNumbersCtrl);

  function StartFromFilter() {
    return filter;

    function filter(input, startFrom) {
      return _.slice(input, _.parseInt(startFrom));
    }
  }

  /* @ngInject */
  function PstnNumbersCtrl($q, $scope, $state, $timeout, $translate, DidService, Notification, PstnSetup, PstnSetupService, TelephoneNumberService, PstnSetupStatesService, ValidationService) {
    var vm = this;

    vm.provider = PstnSetup.getProvider();
    vm.orderCart = PstnSetup.getOrders();

    var baseModel = {
      addDisabled: true,
      areaCode: null,
      areaCodeOptions: null,
      areaCodeEnable: false,
      nxx: null,
      nxxOptions: null,
      nxxEnable: false,
      block: false,
      consecutive: false,
      isSingleResult: false,
      paginateOptions: null,
      quantity: 1,
      searchEnable: false,
      searchResults: [],
      searchResultsModel: {},
      showAdvancedOrder: false,
      state: '',
      states: [],
    };

    vm.model = {
      pstn: _.clone(baseModel),
      tollFree: _.clone(baseModel),
    };

    vm.orderNumbersTotal = 0;
    vm.showTollFreeNumbers = false;
    vm.showPortNumbers = !PstnSetup.getIsTrial();
    var BLOCK_ORDER = PstnSetupService.BLOCK_ORDER;
    var PORT_ORDER = PstnSetupService.PORT_ORDER;
    var NUMBER_ORDER = PstnSetupService.NUMBER_ORDER;
    var NUMTYPE_DID = PstnSetupService.NUMTYPE_DID;
    var NUMTYPE_TOLLFREE = PstnSetupService.NUMTYPE_TOLLFREE;
    var NXX = 'nxx';
    var NXX_EMPTY = '--';
    var MIN_BLOCK_QUANTITY = 2;
    var MAX_BLOCK_QUANTITY = 100;
    //carrier capabilities
    var TOLLFREE_ORDERING_CAPABILITY = 'TOLLFREE_ORDERING';

    vm.addToCart = addToCart;
    vm.addAdvancedOrder = addAdvancedOrder;
    vm.removeOrder = removeOrder;
    vm.goToReview = goToReview;
    vm.hasBackButton = hasBackButton;
    vm.goBack = goBack;
    vm.getOrderQuantity = getOrderQuantity;
    vm.getStateInventory = getStateInventory;
    vm.getAreaNxx = getAreaNxx;
    vm.searchCarrierInventory = searchCarrierInventory;
    vm.getCapabilities = getCapabilities;
    vm.onBlockClick = onBlockClick;

    vm.formatTelephoneNumber = formatTelephoneNumber;
    vm.showOrderQuantity = showOrderQuantity;
    vm.searchResults = [];
    vm.locationLabel = '';

    vm.model.pstn.paginateOptions = {
      currentPage: 0,
      pageSize: 15,
      numberOfPages: function () {
        return Math.ceil(vm.model.pstn.searchResults.length / this.pageSize);
      },
      previousPage: function () {
        vm.model.pstn.searchResultsModel = {};
        this.currentPage--;
      },
      nextPage: function () {
        vm.model.pstn.searchResultsModel = {};
        this.currentPage++;
      },
    };

    $scope.$watchCollection(function () {
      return vm.orderCart;
    }, function () {
      vm.orderNumbersTotal = getOrderNumbersTotal();
    });

    vm.model.tollFree.paginateOptions = {
      currentPage: 0,
      pageSize: 15,
      numberOfPages: function () {
        return Math.ceil(vm.model.tollFree.searchResults.length / this.pageSize);
      },
      previousPage: function () {
        vm.model.tollFree.searchResultsModel = {};
        this.currentPage--;
      },
      nextPage: function () {
        vm.model.tollFree.searchResultsModel = {};
        this.currentPage++;
      },
    };

    init();

    function init() {
      PstnSetupStatesService.getLocation(PstnSetup.getCountryCode()).then(function (location) {
        vm.model.pstn.quantity = null;
        vm.locationLabel = location.type;
        vm.model.pstn.states = location.areas;
        if (_.get(PstnSetup.getServiceAddress(), 'state')) {
          vm.model.pstn.state = {
            abbreviation: PstnSetup.getServiceAddress().state,
            name: _.result(_.find(vm.model.pstn.states, {
              'abbreviation': PstnSetup.getServiceAddress().state,
            }), 'name'),
          };
          getStateInventory();
        }
      });
      getCapabilities();
    }

    vm.tollFreeFields = [{
      className: 'row collapse-both',
      fieldGroup: [{
        type: 'select',
        key: 'tollFree.areaCode',
        id: 'areaCode',
        className: 'medium-4 columns',
        templateOptions: {
          required: true,
          label: $translate.instant('pstnSetup.areaCode'),
          options: [],
          labelfield: 'code',
          valuefield: 'code',
          placeholder: $translate.instant('pstnSetup.selectAreaCode'),
          inputPlaceholder: $translate.instant('pstnSetup.searchAreaCodes'),
          filter: true,
          onChangeFn: function () {
            vm.model.tollFree.showAdvancedOrder = false;
          },
        },
        controller: /* @ngInject */ function ($scope) {
          $scope.$watchCollection(function () {
            return vm.model.tollFree.areaCodeOptions;
          }, function (newAreaCodes) {
            newAreaCodes = newAreaCodes || [];
            $scope.to.options = _.sortBy(newAreaCodes, 'code');
          });
        },
      }, {
        type: 'input',
        key: 'tollFree.quantity',
        id: 'quantity',
        className: 'medium-2 columns',
        templateOptions: {
          required: true,
          label: $translate.instant('pstnSetup.quantity'),
        },
        hideExpression: function () {
          return !vm.model.tollFree.block;
        },
        validators: {
          positiveNumber: {
            expression: ValidationService.positiveNumber,
            message: function () {
              return $translate.instant('validation.positiveNumber');
            },
          },
          maxValue: {
            expression: ValidationService.maxNumber100,
            message: function () {
              return $translate.instant('validation.maxNumber100');
            },
          },
        },
      }, {
        type: 'button',
        key: 'searchBtn',
        className: 'search-button right',
        templateOptions: {
          btnClass: 'btn btn--circle primary',
          spanClass: 'icon icon-search',
          onClick: searchCarrierTollFreeInventory,
        },
        expressionProperties: {
          'templateOptions.disabled': function ($viewValue, $modelValue, scope) {
            return !scope.model.tollFree.areaCode || !scope.model.tollFree.quantity;
          },
        },
      }],
    }, {
      className: 'row',
      fieldGroup: [{
        type: 'cs-input',
        key: 'tollFree.block',
        className: 'small-indent',
        templateOptions: {
          type: 'checkbox',
          id: 'blockChk',
          label: $translate.instant('pstnSetup.block'),
          onClick: function () {
            // if the 'block' checkbox is unchecked, reset search quantity back to 1
            if (!vm.model.tollFree.block) {
              vm.model.tollFree.quantity = 1;
            }
          },
        },
      }, {
        className: '',
        noFormControl: true,
        template: '<i class="icon icon-info" tooltip="{{::\'pstnSetup.advancedOrder.blockTooltip\' | translate}}"  tooltip-trigger="mouseenter" tooltip-placement="right" tooltip-animation="false" ></i>',
      }],
    }];

    ////////////////////////

    function getStateInventory() {
      PstnSetupService.getCarrierInventory(PstnSetup.getProviderId(), vm.model.pstn.state.abbreviation)
        .then(function (response) {
          vm.model.pstn.areaCodeOptions = _.sortBy(response.areaCodes, 'code');
          vm.model.pstn.areaCode = '';
          vm.model.pstn.areaCodeEnable = true;
          vm.model.pstn.nxxOptions = null;
          vm.model.pstn.nxx = null;
          vm.model.pstn.nxxEnable = false;
          vm.model.pstn.searchEnable = false;
          vm.model.pstn.searchResults = [];
          vm.model.pstn.showAdvancedOrder = false;
        })
        .catch(function (response) {
          Notification.errorResponse(response, 'pstnSetup.errors.states');
        });
    }

    function getAreaNxx() {
      vm.model.pstn.searchEnable = true;
      PstnSetupService.getCarrierInventory(PstnSetup.getProviderId(),
        vm.model.pstn.state.abbreviation, vm.model.pstn.areaCode.code)
        .then(function (response) {
          if (!_.isEmpty(response)) {
            vm.model.pstn.nxxOptions = _.sortBy(response.exchanges, 'code');
            vm.model.pstn.nxxOptions.unshift({ code: NXX_EMPTY });
            vm.model.pstn.nxx = vm.model.pstn.nxxOptions[0];
            vm.model.pstn.nxxEnable = true;
            vm.model.pstn.searchResults = [];
            vm.model.pstn.showAdvancedOrder = false;
          }
        })
        .catch(function (response) {
          Notification.errorResponse(response, 'pstnSetup.errors.states');
        });
    }

    function getTollFreeInventory() {
      PstnSetupService.getCarrierTollFreeInventory(PstnSetup.getProviderId())
        .then(function (response) {
          vm.model.tollFree.areaCodeOptions = response.areaCodes;
          vm.model.tollFree.areaCode = '';
        })
        .catch(function (response) {
          Notification.errorResponse(response, 'pstnSetup.errors.tollfree.areacodes');
        });
    }

    function getCapabilities() {
      if (!PstnSetup.getIsTrial()) {
        PstnSetupService.getCarrierCapabilities(PstnSetup.getProviderId())
          .then(function (response) {
            var supportedCapabilities = [];
            for (var x in response) {
              supportedCapabilities.push(response[x].capability);
            }
            if (supportedCapabilities.indexOf(TOLLFREE_ORDERING_CAPABILITY) !== -1) {
              vm.showTollFreeNumbers = true;
            }
          })
          .catch(function (response) {
            Notification.errorResponse(response, 'pstnSetup.errors.capabilities');
          });
      }
    }

    function onBlockClick() {
      if (vm.model.pstn.block) {
        if (vm.model.pstn.quantity == null) {
          vm.model.pstn.quantity = MIN_BLOCK_QUANTITY;
        } else if (!(vm.model.pstn.quantity >= MIN_BLOCK_QUANTITY || vm.model.pstn.quantity <= MAX_BLOCK_QUANTITY)) {
          vm.model.pstn.quantity = MIN_BLOCK_QUANTITY;
        }
      } else {
        vm.model.pstn.quantity = null;
      }
    }

    function isSingleResult() {
      if (!vm.model.pstn.block) {
        return true;
      }
      if (vm.model.pstn.quantity == 1 || vm.model.pstn.quantity == null) {
        return true;
      }
      return false;
    }

    function getCount() {
      if (!vm.model.pstn.block) {
        return 1; //1 causes the search to return all pstn's
      }
      return (vm.model.pstn.quantity ? vm.model.pstn.quantity : 1);
    }

    function getNxxValue() {
      if (vm.model.pstn.nxx !== null) {
        if (vm.model.pstn.nxx.code !== NXX_EMPTY) {
          return vm.model.pstn.nxx.code;
        }
      }
      return null;
    }

    function searchCarrierInventory() {
      vm.model.pstn.showAdvancedOrder = false;
      var field = this;
      var params = {
        npa: vm.model.pstn.areaCode.code,
        count: getCount(),
        sequential: vm.model.pstn.consecutive,
      };
      //add optional nxx parameter
      var nxx = getNxxValue();
      if (nxx !== null) {
        params[NXX] = vm.model.pstn.nxx.code;
      }

      vm.model.pstn.searchResults = [];
      vm.model.pstn.searchResultsModel = {};
      vm.model.pstn.paginateOptions.currentPage = 0;
      vm.model.pstn.isSingleResult = isSingleResult();
      field.loading = true;

      PstnSetupService.searchCarrierInventory(PstnSetup.getProviderId(), params)
        .then(function (numberRanges) {
          if (numberRanges.length === 0) {
            vm.model.pstn.showAdvancedOrder = true;
          } else if (vm.model.pstn.isSingleResult) {
            vm.model.pstn.searchResults = _.flatten(numberRanges);
          } else {
            vm.model.pstn.searchResults = numberRanges;
          }
        })
        .catch(function (response) {
          Notification.errorResponse(response, 'pstnSetup.errors.inventory');
        })
        .finally(function () {
          field.loading = false;
        });
    }

    function searchCarrierTollFreeInventory() {
      vm.model.tollFree.showAdvancedOrder = false;
      var field = this;
      var params = {
        npa: vm.model.tollFree.areaCode.code,
        count: vm.model.tollFree.quantity === 1 ? undefined : vm.model.tollFree.quantity,
      };
      vm.model.tollFree.searchResults = [];
      vm.model.tollFree.searchResultsModel = {};
      vm.model.tollFree.paginateOptions.currentPage = 0;
      vm.model.tollFree.isSingleResult = vm.model.tollFree.quantity == 1;
      field.loading = true;

      PstnSetupService.searchCarrierTollFreeInventory(PstnSetup.getProviderId(), params)
        .then(function (numberRanges) {
          if (numberRanges.length === 0) {
            vm.model.tollFree.showAdvancedOrder = true;
          } else if (vm.model.tollFree.isSingleResult) {
            vm.model.tollFree.searchResults = _.flatten(numberRanges);
          } else {
            vm.model.tollFree.searchResults = numberRanges;
          }
        })
        .catch(function (response) {
          Notification.errorResponse(response, 'pstnSetup.errors.tollfree.inventory');
        })
        .finally(function () {
          field.loading = false;
        });
    }

    function addToCart(orderType, numberType) {
      switch (orderType) {
        case NUMBER_ORDER:
          addToOrder(numberType);
          break;
        case PORT_ORDER:
          addPortNumbersToOrder();
          break;
        case BLOCK_ORDER:
          addAdvancedOrder(numberType);
          break;
      }
    }

    function addToOrder(numberType) {
      var model;
      var promises = [];
      var reservation;
      vm.addLoading = true;
      // add to cart
      if (numberType === NUMTYPE_DID) {
        model = vm.model.pstn;
      } else if (numberType === NUMTYPE_TOLLFREE) {
        model = vm.model.tollFree;
      } else {
        Notification.error('pstnSetup.errors.unsupportedOrderType', numberType);
      }
      _.forIn(model.searchResultsModel, function (value, _key) {
        if (value) {
          var key = _.parseInt(_key);
          var searchResultsIndex = (model.paginateOptions.currentPage * model.paginateOptions.pageSize) + key;
          if (searchResultsIndex < model.searchResults.length) {
            var numbers = model.searchResults[searchResultsIndex];
            if (numberType === NUMTYPE_DID) {
              reservation = PstnSetupService.reserveCarrierInventoryV2(PstnSetup.getCustomerId(), PstnSetup.getProviderId(), numbers, PstnSetup.isCustomerExists());
            } else if (numberType === NUMTYPE_TOLLFREE) {
              reservation = PstnSetupService.reserveCarrierTollFreeInventory(PstnSetup.getCustomerId(), PstnSetup.getProviderId(), numbers, PstnSetup.isCustomerExists());
            }
            var promise = reservation
              .then(function (reservationData) {
                var order = {
                  data: {
                    numbers: numbers,
                  },
                  numberType: numberType,
                  orderType: NUMBER_ORDER,
                  reservationId: reservationData.uuid,
                };
                vm.orderCart.push(order);
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
      $q.all(promises).then(function (results) {
        // sort our successful indexes and process from high to low
        _.forInRight(_.sortBy(results), function (indices) {
          if (_.isObject(indices) && _.isNumber(indices.searchResultsIndex) && _.isNumber(indices.searchResultsModelIndex)) {
            // clear the checkbox
            _.set(model.searchResultsModel, indices.searchResultsModelIndex, false);
            // remove from search result
            model.searchResults.splice(indices.searchResultsIndex, 1);
          }
        });
      }).finally(function () {
        vm.addLoading = false;
        // check if we need to decrement current page
        if (model.paginateOptions.currentPage >= model.paginateOptions.numberOfPages()) {
          model.paginateOptions.currentPage--;
        }
      });
    }

    function addAdvancedOrder(numberType) {
      var model;
      if (numberType === NUMTYPE_DID) {
        model = vm.model.pstn;
      } else if (numberType === NUMTYPE_TOLLFREE) {
        model = vm.model.tollFree;
      }
      var advancedOrder = {
        data: {
          areaCode: model.areaCode.code,
          length: parseInt(model.quantity, 10),
          consecutive: model.consecutive,
        },
        numberType: numberType,
        orderType: BLOCK_ORDER,
      };
      var nxx = getNxxValue();
      if (nxx !== null) {
        advancedOrder.data[NXX] = vm.model.pstn.nxx.code;
      }
      vm.orderCart.push(advancedOrder);
      model.showAdvancedOrder = false;
    }

    function removeOrderFromCart(order) {
      _.pull(vm.orderCart, order);
    }

    function removeOrder(order) {
      if (isPortOrder(order) || isAdvancedOrder(order)) {
        removeOrderFromCart(order);
      } else if (_.get(order, 'orderType') === PstnSetupService.NUMBER_ORDER && _.get(order, 'numberType') === PstnSetupService.NUMTYPE_TOLLFREE) {
        PstnSetupService.releaseCarrierTollFreeInventory(PstnSetup.getCustomerId(), PstnSetup.getProviderId(), order.data.numbers, order.reservationId, PstnSetup.isCustomerExists())
          .then(_.partial(removeOrderFromCart, order));
      } else {
        PstnSetupService.releaseCarrierInventoryV2(PstnSetup.getCustomerId(), order.reservationId, order.data.numbers, PstnSetup.isCustomerExists())
          .then(_.partial(removeOrderFromCart, order));
      }
    }

    function formatTelephoneNumber(telephoneNumber) {
      switch (_.get(telephoneNumber, 'orderType')) {
        case NUMBER_ORDER:
          return getCommonPattern(telephoneNumber.data.numbers);
        case PORT_ORDER:
          return PORTING_NUMBERS;
        case BLOCK_ORDER: {
          var pstn = 'XXX-XXXX';
          if (_.has(telephoneNumber.data, NXX)) {
            pstn = telephoneNumber.data.nxx + '-' + 'XXXX';
          }
          return '(' + telephoneNumber.data.areaCode + ') ' + pstn;
        }
        case undefined:
          return getCommonPattern(telephoneNumber);
        default:
          return undefined;
      }
    }

    function getCommonPattern(telephoneNumber) {
      if (_.isString(telephoneNumber)) {
        return TelephoneNumberService.getDIDLabel(telephoneNumber);
      } else {
        var firstNumber = TelephoneNumberService.getDIDLabel(_.head(telephoneNumber));
        var lastNumber = TelephoneNumberService.getDIDLabel(_.last(telephoneNumber));
        if (isConsecutiveArray(telephoneNumber)) {
          return firstNumber + ' - ' + _.last(lastNumber.split('-'));
        } else {
          var commonNumber = getLongestCommonSubstring(firstNumber, lastNumber);
          return commonNumber + _.repeat('X', firstNumber.length - commonNumber.length);
        }
      }
    }

    // Port Numbers
    var PORTING_NUMBERS = $translate.instant('pstnSetup.portNumbersLabel');
    vm.addPortNumbersToOrder = addPortNumbersToOrder;
    vm.unsavedTokens = [];
    vm.validCount = 0;
    vm.invalidCount = 0;
    vm.tokenfieldId = 'pstn-port-numbers';

    vm.tokenoptions = {
      delimiter: [',', ';'],
      createTokensOnBlur: true,
      limit: 50,
      tokens: [],
      minLength: 9,
      beautify: false,
    };
    vm.tokenmethods = {
      createtoken: createToken,
      createdtoken: createdToken,
      removedtoken: removedToken,
      edittoken: editToken,
    };

    function createToken(e) {
      var tokenNumber = e.attrs.label;
      e.attrs.value = TelephoneNumberService.getDIDValue(tokenNumber);
      e.attrs.label = TelephoneNumberService.getDIDLabel(tokenNumber);
    }

    function createdToken(e) {
      if (isTokenInvalid(e.attrs.value)) {
        angular.element(e.relatedTarget).addClass('invalid');
        e.attrs.invalid = true;
      } else {
        vm.validCount++;
      }
      // add to service after validation/duplicate checks
      DidService.addDid(e.attrs.value);

      vm.invalidCount = getInvalidTokens().length;
    }

    function isTokenInvalid(value) {
      return !TelephoneNumberService.validateDID(value) ||
        _.includes(DidService.getDidList(), value);
    }

    function removedToken(e) {
      DidService.removeDid(e.attrs.value);
      $timeout(initTokens);
    }

    function editToken(e) {
      DidService.removeDid(e.attrs.value);
      if (!angular.element(e.relatedTarget).hasClass('invalid')) {
        vm.validCount--;
      }
    }

    function initTokens(didList) {
      var tmpDids = didList || DidService.getDidList();
      // reset valid and list before setTokens
      vm.validCount = 0;
      vm.invalidCount = 0;
      DidService.clearDidList();
      angular.element('#' + vm.tokenfieldId).tokenfield('setTokens', tmpDids);
    }

    function getTokens() {
      return angular.element('#' + vm.tokenfieldId).tokenfield('getTokens');
    }

    function getInvalidTokens() {
      return angular.element('#' + vm.tokenfieldId).parent().find('.token.invalid');
    }

    function isPortOrder(order) {
      return _.get(order, 'orderType') === PORT_ORDER;
    }

    function addPortNumbersToOrder() {
      var portOrder = {
        data: {},
        orderType: PORT_ORDER,
      };
      var portNumbersPartition = _.partition(getTokens(), 'invalid');
      var invalidPortNumbers = _.map(portNumbersPartition[0], 'value');
      portOrder.data.numbers = _.map(portNumbersPartition[1], 'value');
      var existingPortOrder = _.find(vm.orderCart, {
        orderType: PORT_ORDER,
      });
      if (existingPortOrder) {
        var newPortNumbers = _.difference(portOrder.data.numbers, existingPortOrder.data.numbers);
        Array.prototype.push.apply(existingPortOrder.data.numbers, newPortNumbers);
      } else {
        vm.orderCart.push(portOrder);
      }

      // leave the invalid tokens
      initTokens(invalidPortNumbers);
    }

    function goToReview() {
      if (vm.orderNumbersTotal === 0) {
        Notification.error('pstnSetup.orderNumbersPrompt');
      } else {
        PstnSetup.setOrders(getOrderNumbers());
        $state.go('pstnSetup.review');
      }
    }

    function goBack() {
      if (!PstnSetup.isSiteExists()) {
        $state.go('pstnSetup.serviceAddress');
      } else if (!PstnSetup.isCustomerExists()) {
        $state.go('pstnSetup.contractInfo');
      } else {
        $state.go('pstnSetup');
      }
    }

    function getLongestCommonSubstring(x, y) {
      if (!_.isString(x) || !_.isString(y)) {
        return '';
      }
      var i = 0;
      var length = x.length;
      while (i < length && x.charAt(i) === y.charAt(i)) {
        i++;
      }
      return x.substring(0, i);
    }

    function isConsecutiveArray(array) {
      return _.every(array, function (value, index, arr) {
        // return true for the first element
        if (index === 0) {
          return true;
        }
        // check the difference with the previous element
        return _.parseInt(value) - _.parseInt(arr[index - 1]) === 1;
      });
    }

    function showOrderQuantity(order) {
      return (_.isArray(order.data.numbers) && !isConsecutiveArray(order.data.numbers)) || isPortOrder(order) || isAdvancedOrder(order);
    }

    function getOrderQuantity(order) {
      switch (_.get(order, 'orderType')) {
        case NUMBER_ORDER:
          return order.data.numbers.length;
        case PORT_ORDER:
          return order.data.numbers.length;
        case BLOCK_ORDER:
          return order.data.length;
        case undefined:
          return undefined;
      }
    }

    function hasBackButton() {
      return (!PstnSetup.isCarrierExists() && !PstnSetup.isSingleCarrierReseller()) || !PstnSetup.isCustomerExists() || !PstnSetup.isSiteExists();
    }

    function getOrderNumbers() {
      return vm.orderCart;
    }

    function getOrderNumbersTotal() {
      return _.size(_.flatten(getOrderNumbers()));
    }

    function isAdvancedOrder(order) {
      return _.get(order, 'orderType') === BLOCK_ORDER;
    }

    $scope.$watchCollection(function () {
      return vm.model.pstn.searchResultsModel;
    }, function (searchResultsModel) {
      // set disabled in next digest because of cs-btn
      $timeout(function () {
        vm.model.pstn.addDisabled = !_.includes(searchResultsModel, true);
      });
    });

    $scope.$watchCollection(function () {
      return vm.model.tollFree.searchResultsModel;
    }, function (searchResultsModel) {
      // set disabled in next digest because of cs-btn
      $timeout(function () {
        vm.model.tollFree.addDisabled = !_.includes(searchResultsModel, true);
      });
    });

    $scope.$watch(function () {
      return vm.showTollFreeNumbers;
    }, function (showTollFreeNumbersTab) {
      if (showTollFreeNumbersTab) {
        getTollFreeInventory();
      }
    });

    // We want to capture the modal close event and clear didList from service.
    if ($state.modal) {
      $state.modal.result.finally(DidService.clearDidList);
    }
  }
})();
