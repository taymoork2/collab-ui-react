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
  function PstnNumbersCtrl($scope, $q, $translate, $state, $timeout, PstnSetup, PstnSetupService, ValidationService, Notification, TerminusStateService, TelephoneNumberService, DidService, FeatureToggleService) {
    var vm = this;

    vm.provider = PstnSetup.getProvider();
    vm.orderCart = PstnSetup.getNumbers();

    vm.model = {
      state: '',
      areaCode: '',
      quantity: '',
      consecutive: false
    };
    vm.areaCodeOptions = [];
    vm.orderNumbersTotal = 0;

    vm.removeOrder = removeOrder;
    vm.goToReview = goToReview;
    vm.hasBackButton = hasBackButton;
    vm.goBack = goBack;

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
    vm.addToOrder = addToOrder;

    $scope.$watchCollection(function () {
      return vm.orderCart;
    }, function () {
      vm.orderNumbersTotal = getOrderNumbersTotal();
    });

    vm.fields = [{
      type: 'inline',
      templateOptions: {
        fields: [{
          type: 'select',
          key: 'state',
          templateOptions: {
            required: true,
            label: $translate.instant('pstnSetup.state'),
            options: [],
            labelfield: 'name',
            valuefield: 'abbreviation',
            onChangeFn: getStateInventory,
            placeholder: $translate.instant('pstnSetup.selectState'),
            inputPlaceholder: $translate.instant('pstnSetup.searchStates'),
            filter: true
          },
          controller: /* @ngInject */ function ($scope) {
            TerminusStateService.query().$promise.then(function (states) {
              $scope.to.options = states;
            });
            $scope.$watchCollection(function () {
              return vm.areaCodeOptions;
            }, function (newAreaCodes) {
              $scope.to.helpText = $translate.instant('pstnSetup.numbers', {
                count: (newAreaCodes && newAreaCodes.length) ? _.sum(newAreaCodes, 'count') : 0
              }, 'messageformat');
            });
          }
        }, {
          type: 'select',
          key: 'areaCode',
          id: 'areaCode',
          templateOptions: {
            required: true,
            label: $translate.instant('pstnSetup.areaCode'),
            options: [],
            labelfield: 'code',
            valuefield: 'code',
            placeholder: $translate.instant('pstnSetup.selectAreaCode'),
            inputPlaceholder: $translate.instant('pstnSetup.searchAreaCodes'),
            filter: true
          },
          controller: /* @ngInject */ function ($scope) {
            $scope.$watchCollection(function () {
              return vm.areaCodeOptions;
            }, function (newAreaCodes) {
              newAreaCodes = newAreaCodes || [];
              $scope.to.options = _.sortBy(newAreaCodes, 'code');
            });
            $scope.$watch(function () {
              return vm.model.areaCode;
            }, function (newAreaCode) {
              $scope.to.helpText = $translate.instant('pstnSetup.numbers', {
                count: (newAreaCode && newAreaCode.count) ? newAreaCode.count : 0
              }, 'messageformat');
            });
          }
        }, {
          type: 'cs-input',
          key: 'quantity',
          id: 'quantity',
          templateOptions: {
            required: true,
            label: $translate.instant('pstnSetup.quantity'),
            groupSize: 'small-12',
            type: 'number',
            max: 100
          },
          validators: {
            positiveNumber: {
              expression: ValidationService.positiveNumber,
              message: function () {
                return $translate.instant('validation.positiveNumber');
              }
            }
          }
        }, {
          type: 'button',
          key: 'searchBtn',
          className: 'search-button',
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
      }
    }, {
      type: 'checkbox',
      key: 'consecutive',
      templateOptions: {
        id: 'consecutiveChk',
        label: $translate.instant('pstnSetup.consecutive')
      },
      hideExpression: function () {
        var shouldHide = angular.isUndefined(vm.model.quantity) || vm.model.quantity < 2;
        if (shouldHide) {
          // uncheck the consecutive checkbox
          vm.model.consecutive = false;
        }
        return shouldHide;
      }
    }];

    ////////////////////////

    function removeOrderFromCart(order) {
      _.pull(vm.orderCart, order);
    }

    function removeOrder(order) {
      if (isPortOrder(order)) {
        removeOrderFromCart(order);
      } else {
        PstnSetupService.releaseCarrierInventory(PstnSetup.getCustomerId(), PstnSetup.getProviderId(), order, PstnSetup.isCustomerExists())
          .then(_.partial(removeOrderFromCart, order));
      }
    }

    function getStateInventory() {
      PstnSetupService.getCarrierInventory(PstnSetup.getProviderId(), vm.model.state.abbreviation)
        .then(function (response) {
          vm.areaCodeOptions = response.areaCodes;
          vm.model.areaCode = '';
        });
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

    function searchCarrierInventory() {
      var field = this;
      var params = {
        npa: vm.model.areaCode.code,
        count: vm.model.quantity,
        sequential: vm.model.consecutive
      };
      vm.searchResults = [];
      vm.searchResultsModel = {};
      vm.paginateOptions.currentPage = 0;
      vm.singleResults = vm.model.quantity === 1;
      field.loading = true;

      PstnSetupService.searchCarrierInventory(PstnSetup.getProviderId(), params)
        .then(function (numberRanges) {
          if (vm.singleResults) {
            vm.searchResults = _.flatten(numberRanges);
          } else {
            vm.searchResults = numberRanges;
          }
        })
        .finally(function () {
          field.loading = false;
        });
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

    function formatTelephoneNumber(telephoneNumber) {
      // if a single number
      if (angular.isString(telephoneNumber)) {
        return TelephoneNumberService.getDIDLabel(telephoneNumber);
        // else if a range of numbers
      } else if (angular.isArray(telephoneNumber)) {
        if (telephoneNumber.type === PstnSetupService.PORT) {
          return PORTING_NUMBERS;
        }
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

    function hasResultsSelected() {
      return _.contains(vm.searchResultsModel, true);
    }

    $scope.$watchCollection(function () {
      return vm.searchResultsModel;
    }, function (searchResultsModel) {
      // set disabled in next digest because of cs-btn
      $timeout(function () {
        vm.addDisabled = !_.contains(searchResultsModel, true);
      });
    });

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
                vm.orderCart.push(numbers);
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

    function hasBackButton() {
      return (!PstnSetup.isCarrierExists() && !PstnSetup.isSingleCarrierReseller()) || !PstnSetup.isCustomerExists() || !PstnSetup.isSiteExists();
    }

    function getOrderNumbers() {
      return vm.orderCart;
    }

    function getOrderNumbersTotal() {
      return _.size(_.flatten(getOrderNumbers()));
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

    function goToReview() {
      if (vm.orderNumbersTotal === 0) {
        Notification.error('pstnSetup.orderNumbersPrompt');
      } else {
        PstnSetup.setNumbers(getOrderNumbers());
        $state.go('pstnSetup.review');
      }
    }

    function showOrderQuantity(order) {
      return (_.isArray(order) && !isConsecutiveArray(order)) || isPortOrder(order);
    }

    // Port Numbers
    var PORTING_NUMBERS = $translate.instant('pstnSetup.portNumbersLabel');
    vm.addPortNumbersToOrder = addPortNumbersToOrder;
    vm.showPortNumbers = false;
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

    FeatureToggleService.supports(FeatureToggleService.features.huronPstnPort)
      .then(function (isSupported) {
        vm.showPortNumbers = !PstnSetup.getIsTrial() && isSupported;
      });

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
      return _.get(order, 'type') === PstnSetupService.PORT;
    }

    function addPortNumbersToOrder() {
      var portNumbersPartition = _.partition(getTokens(), 'invalid');
      var invalidPortNumbers = _.map(portNumbersPartition[0], 'value');
      var portNumbers = _.map(portNumbersPartition[1], 'value');
      var existingPortNumbers = _.find(vm.orderCart, {
        type: PstnSetupService.PORT
      });
      if (existingPortNumbers) {
        var newPortNumbers = _.difference(portNumbers, existingPortNumbers);
        Array.prototype.push.apply(existingPortNumbers, newPortNumbers);
      } else {
        portNumbers.type = PstnSetupService.PORT;
        vm.orderCart.push(portNumbers);
      }

      // leave the invalid tokens
      initTokens(invalidPortNumbers);
    }

    // We want to capture the modal close event and clear didList from service.
    if ($state.modal) {
      $state.modal.result.finally(DidService.clearDidList);
    }
  }
})();
