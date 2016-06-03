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
  function PstnNumbersCtrl($q, $scope, $state, $timeout, $translate, DidService, Notification, PstnSetup, PstnSetupService, PstnServiceAddressService, TelephoneNumberService, TerminusStateService, ValidationService) {
    var vm = this;

    vm.provider = PstnSetup.getProvider();
    vm.orderCart = PstnSetup.getOrders();

    vm.model = {
      state: '',
      areaCode: '',
      quantity: 1,
      consecutive: false,
      block: false
    };
    vm.orderNumbersTotal = 0;
    vm.showAdvancedOrder = false;
    vm.showPortNumbers = !PstnSetup.getIsTrial();
    var BLOCK_ORDER = PstnSetupService.BLOCK_ORDER;
    var PORT_ORDER = PstnSetupService.PORT_ORDER;
    var NUMBER_ORDER = PstnSetupService.NUMBER_ORDER;

    vm.addToCart = addToCart;
    vm.addAdvancedOrder = addAdvancedOrder;
    vm.removeOrder = removeOrder;
    vm.goToReview = goToReview;
    vm.hasBackButton = hasBackButton;
    vm.goBack = goBack;
    vm.getOrderQuantity = getOrderQuantity;

    vm.formatTelephoneNumber = formatTelephoneNumber;
    vm.showOrderQuantity = showOrderQuantity;
    vm.searchResults = [];

    vm.searchResultsModel = {};
    vm.hasResultsSelected = hasResultsSelected;
    vm.paginateOptions = {
      currentPage: 0,
      pageSize: 15,
      numberOfPages: function () {
        return Math.ceil(vm.searchResults.length / this.pageSize);
      },
      previousPage: function () {
        vm.searchResultsModel = {};
        this.currentPage--;
      },
      nextPage: function () {
        vm.searchResultsModel = {};
        this.currentPage++;
      }
    };

    $scope.$watchCollection(function () {
      return vm.orderCart;
    }, function () {
      vm.orderNumbersTotal = getOrderNumbersTotal();
    });

    vm.fields = [{
      className: 'row collapse-both',
      fieldGroup: [{
        type: 'select',
        key: 'state',
        className: 'medium-4 columns',
        templateOptions: {
          required: true,
          label: $translate.instant('pstnSetup.state'),
          options: [],
          labelfield: 'name',
          valuefield: 'abbreviation',
          onChangeFn: getStateInventory,
          placeholder: $translate.instant('pstnSetup.searchStates'),
          filter: true
        },
        controller: /* @ngInject */ function ($scope) {
          TerminusStateService.query().$promise.then(function (states) {
            $scope.to.options = states;
            if (_.get(PstnSetup.getServiceAddress(), 'state')) {
              vm.model.state = {
                abbreviation: PstnSetup.getServiceAddress().state,
                name: _.result(_.find(states, {
                  'abbreviation': PstnSetup.getServiceAddress().state
                }), 'name')
              };
              getStateInventory();
            }
          });
        }
      }, {
        type: 'select',
        key: 'areaCode',
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
            vm.showAdvancedOrder = false;
          }
        },
        controller: /* @ngInject */ function ($scope) {
          $scope.$watchCollection(function () {
            return vm.areaCodeOptions;
          }, function (newAreaCodes) {
            newAreaCodes = newAreaCodes || [];
            $scope.to.options = _.sortBy(newAreaCodes, 'code');
          });
        }
      }, {
        type: 'input',
        key: 'quantity',
        id: 'quantity',
        className: 'medium-2 columns',
        templateOptions: {
          required: true,
          label: $translate.instant('pstnSetup.quantity')
        },
        hideExpression: function () {
          return !vm.model.block;
        },
        validators: {
          positiveNumber: {
            expression: ValidationService.positiveNumber,
            message: function () {
              return $translate.instant('validation.positiveNumber');
            }
          },
          maxValue: {
            expression: ValidationService.maxNumber100,
            message: function () {
              return $translate.instant('validation.maxNumber100');
            }
          }
        }
      }, {
        type: 'button',
        key: 'searchBtn',
        className: 'search-button right',
        templateOptions: {
          btnClass: 'btn btn--circle primary',
          spanClass: 'icon icon-search',
          onClick: searchCarrierInventory
        },
        expressionProperties: {
          'templateOptions.disabled': function ($viewValue, $modelValue, scope) {
            return !scope.model.areaCode || !scope.model.quantity;
          }
        }
      }]
    }, {
      className: 'row',
      fieldGroup: [{
        type: 'cs-input',
        key: 'block',
        className: 'small-indent',
        templateOptions: {
          type: 'checkbox',
          id: 'blockChk',
          label: $translate.instant('pstnSetup.block')
        }
      }, {
        className: '',
        noFormControl: true,
        template: '<i class="icon icon-info" tooltip="{{::\'pstnSetup.advancedOrder.blockTooltip\' | translate}}"  tooltip-trigger="mouseenter" tooltip-placement="right" tooltip-animation="false" ></i>'
      }, {
        type: 'cs-input',
        key: 'consecutive',
        className: 'check-space',
        templateOptions: {
          type: 'checkbox',
          id: 'consecutiveChk',
          label: $translate.instant('pstnSetup.consecutive')
        },
        hideExpression: function () {
          if (angular.isUndefined(vm.model.quantity) || vm.model.quantity < 2) {
            // uncheck the consecutive checkbox
            vm.model.consecutive = false;
            return true;
          }
          return false;
        }
      }, {
        className: '',
        noFormControl: true,
        template: '<i class="icon icon-info" tooltip="{{::\'pstnSetup.advancedOrder.consecutiveTooltip\' | translate}}"  tooltip-trigger="mouseenter" tooltip-placement="right" tooltip-animation="false" ></i>',
        hideExpression: function () {
          if (angular.isUndefined(vm.model.quantity) || vm.model.quantity < 2) {
            // uncheck the consecutive checkbox
            vm.model.consecutive = false;
            return true;
          }
          return false;
        }
      }]
    }];

    ////////////////////////

    function getStateInventory() {
      PstnSetupService.getCarrierInventory(PstnSetup.getProviderId(), vm.model.state.abbreviation)
        .then(function (response) {
          vm.areaCodeOptions = response.areaCodes;
          vm.model.areaCode = '';
        })
        .catch(function (response) {
          Notification.errorResponse(response, 'pstnSetup.errors.states');
        });
    }

    function searchCarrierInventory() {
      vm.showAdvancedOrder = false;
      var field = this;
      var params = {
        npa: vm.model.areaCode.code,
        count: vm.model.quantity,
        sequential: vm.model.consecutive
      };
      vm.searchResults = [];
      vm.searchResultsModel = {};
      vm.paginateOptions.currentPage = 0;
      vm.singleResults = vm.model.quantity == 1;
      field.loading = true;

      PstnSetupService.searchCarrierInventory(PstnSetup.getProviderId(), params)
        .then(function (numberRanges) {
          if (numberRanges.length === 0) {
            vm.showAdvancedOrder = true;
          } else if (vm.singleResults) {
            vm.searchResults = _.flatten(numberRanges);
          } else {
            vm.searchResults = numberRanges;
          }
        })
        .catch(function (response) {
          Notification.errorResponse(response, 'pstnSetup.errors.inventory');
        })
        .finally(function () {
          field.loading = false;
        });
    }

    function addToCart(type) {
      switch (type) {
      case NUMBER_ORDER:
        addToOrder();
        break;
      case PORT_ORDER:
        addPortNumbersToOrder();
        break;
      case BLOCK_ORDER:
        addAdvancedOrder();
        break;
      }
    }

    function addToOrder() {
      var promises = [];
      vm.addLoading = true;
      // add to cart
      _.forIn(vm.searchResultsModel, function (value, _key) {
        if (value) {
          var key = _.parseInt(_key);
          var searchResultsIndex = vm.paginateOptions.currentPage * vm.paginateOptions.pageSize + key;
          if (searchResultsIndex < vm.searchResults.length) {
            var numbers = vm.searchResults[searchResultsIndex];
            var promise = PstnSetupService.reserveCarrierInventory(PstnSetup.getCustomerId(), PstnSetup.getProviderId(), numbers, PstnSetup.isCustomerExists())
              .then(function () {
                var order = {
                  data: {
                    numbers: numbers
                  },
                  type: NUMBER_ORDER
                };
                vm.orderCart.push(order);
                // return the index to be used in the promise callback
                return {
                  searchResultsIndex: searchResultsIndex,
                  searchResultsModelIndex: key
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
          if (angular.isObject(indices) && angular.isNumber(indices.searchResultsIndex) && angular.isNumber(indices.searchResultsModelIndex)) {
            // clear the checkbox
            _.set(vm.searchResultsModel, indices.searchResultsModelIndex, false);
            // remove from search result
            vm.searchResults.splice(indices.searchResultsIndex, 1);
          }
        });
      }).finally(function () {
        vm.addLoading = false;
        // check if we need to decrement current page
        if (vm.paginateOptions.currentPage >= vm.paginateOptions.numberOfPages()) {
          vm.paginateOptions.currentPage--;
        }
      });
    }

    function addAdvancedOrder() {
      var advancedOrder = {
        data: {
          areaCode: vm.model.areaCode.code,
          length: parseInt(vm.model.quantity),
          consecutive: vm.model.consecutive
        },
        type: BLOCK_ORDER
      };
      vm.orderCart.push(advancedOrder);
      vm.showAdvancedOrder = false;
    }

    function removeOrderFromCart(order) {
      _.pull(vm.orderCart, order);
    }

    function removeOrder(order) {
      if (isPortOrder(order) || isAdvancedOrder(order)) {
        removeOrderFromCart(order);
      } else {
        PstnSetupService.releaseCarrierInventory(PstnSetup.getCustomerId(), PstnSetup.getProviderId(), order.data.numbers, PstnSetup.isCustomerExists())
          .then(_.partial(removeOrderFromCart, order));
      }
    }

    function formatTelephoneNumber(telephoneNumber) {
      switch (_.get(telephoneNumber, 'type')) {
      case NUMBER_ORDER:
        return getCommonPattern(telephoneNumber.data.numbers);
      case PORT_ORDER:
        return PORTING_NUMBERS;
      case BLOCK_ORDER:
        return '(' + telephoneNumber.data.areaCode + ') XXX-XXXX';
      case undefined:
        return getCommonPattern(telephoneNumber);
      default:
        return;
      }
    }

    function getCommonPattern(telephoneNumber) {
      if (angular.isString(telephoneNumber)) {
        return TelephoneNumberService.getDIDLabel(telephoneNumber);
      } else {
        var firstNumber = TelephoneNumberService.getDIDLabel(_.first(telephoneNumber));
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
    vm.tokenfieldId = 'pstn-port-numbers';

    vm.tokenoptions = {
      delimiter: [',', ';'],
      createTokensOnBlur: true,
      limit: 50,
      tokens: [],
      minLength: 9,
      beautify: false
    };
    vm.tokenmethods = {
      createtoken: createToken,
      createdtoken: createdToken,
      removedtoken: removedToken,
      edittoken: editToken
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
    }

    function isTokenInvalid(value) {
      return !TelephoneNumberService.validateDID(value) || _.includes(DidService.getDidList(), value);
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
      DidService.clearDidList();
      angular.element('#' + vm.tokenfieldId).tokenfield('setTokens', tmpDids);
    }

    function getTokens() {
      return angular.element('#' + vm.tokenfieldId).tokenfield('getTokens');
    }

    function isPortOrder(order) {
      return _.get(order, 'type') === PORT_ORDER;
    }

    function addPortNumbersToOrder() {
      var portOrder = {
        data: {},
        type: PORT_ORDER
      };
      var portNumbersPartition = _.partition(getTokens(), 'invalid');
      var invalidPortNumbers = _.map(portNumbersPartition[0], 'value');
      portOrder.data.numbers = _.map(portNumbersPartition[1], 'value');
      var existingPortOrder = _.find(vm.orderCart, {
        type: PORT_ORDER
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
      if (!angular.isString(x) || !angular.isString(y)) {
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
      switch (_.get(order, 'type')) {
      case NUMBER_ORDER:
        return order.data.numbers.length;
      case PORT_ORDER:
        return order.data.numbers.length;
      case BLOCK_ORDER:
        return order.data.length;
      case undefined:
        return;
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

    function hasResultsSelected() {
      return _.contains(vm.searchResultsModel, true);
    }

    function isAdvancedOrder(order) {
      return _.get(order, 'type') === BLOCK_ORDER;
    }

    $scope.$watchCollection(function () {
      return vm.searchResultsModel;
    }, function (searchResultsModel) {
      // set disabled in next digest because of cs-btn
      $timeout(function () {
        vm.addDisabled = !_.contains(searchResultsModel, true);
      });
    });

    // We want to capture the modal close event and clear didList from service.
    if ($state.modal) {
      $state.modal.result.finally(DidService.clearDidList);
    }
  }
})();
