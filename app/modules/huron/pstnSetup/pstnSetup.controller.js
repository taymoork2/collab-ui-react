(function () {
  'use strict';

  angular.module('Huron')
    .filter('startFrom', StartFromFilter)
    .controller('PstnSetupCtrl', PstnSetupCtrl);

  function StartFromFilter() {
    return filter;

    function filter(input, startFrom) {
      return _.slice(input, _.parseInt(startFrom));
    }
  }

  //TODO refactor this into several different controllers
  /* @ngInject */
  function PstnSetupCtrl($scope, $q, $window, $translate, $state, $stateParams, $timeout, PstnSetupService, ValidationService, Notification, TerminusStateService, TelephoneNumberService, ExternalNumberPool) {
    var vm = this;
    var customerExists = false;
    vm.hasCarriers = false;

    vm.customerId = $stateParams.customerId;
    vm.customerName = $stateParams.customerName;
    vm.loading = true;
    vm.model = {
      state: '',
      areaCode: '',
      quantity: '',
      consecutive: false
    };
    vm.areaCodeOptions = [];
    vm.orderNumbersTotal = 0;

    vm.removeOrder = removeOrder;
    vm.selectProvider = selectProvider;
    vm.notifyCustomer = notifyCustomer;
    vm.launchCustomerPortal = launchCustomerPortal;
    vm.orderNumbers = orderNumbers;
    vm.goToNumbers = goToNumbers;
    vm.placeOrder = placeOrder;

    vm.formatTelephoneNumber = formatTelephoneNumber;
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
    vm.orderCart = [];
    vm.addToOrder = addToOrder;
    vm.isArray = angular.isArray;

    $scope.$watchCollection(function () {
      return vm.orderCart;
    }, function () {
      vm.orderNumbersTotal = getOrderNumbersTotal();
    });

    vm.providers = [];

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
          type: 'input',
          key: 'quantity',
          id: 'quantity',
          templateOptions: {
            required: true,
            label: $translate.instant('pstnSetup.quantity'),
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
          templateOptions: {
            btnClass: 'btn-primary label-height-offset',
            label: $translate.instant('common.search'),
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
      expressionProperties: {
        'hide': function () {
          var shouldHide = angular.isUndefined(vm.model.quantity) || vm.model.quantity < 2;
          if (shouldHide) {
            // uncheck the consecutive checkbox
            vm.model.consecutive = false;
          }
          return shouldHide;
        }
      }
    }];

    vm.tokenfieldid = 'swivelAddNumbers';
    vm.tokenplaceholder = $translate.instant('didManageModal.inputPlacehoder');
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
      edittoken: editToken
    };
    vm.validateSwivelNumbers = validateSwivelNumbers;

    init();

    ////////////////////////

    function editToken(e) {
      // If invalid token, show the label text in the edit input
      if (e.attrs.invalid) {
        e.attrs.value = e.attrs.label;
      }
    }

    function createToken(e) {
      var tokenNumber = e.attrs.label;
      e.attrs.value = TelephoneNumberService.getDIDValue(tokenNumber);
      e.attrs.label = TelephoneNumberService.getDIDLabel(tokenNumber);

      var duplicate = _.find(getSwivelNumberTokens(), {
        value: e.attrs.value
      });
      if (duplicate) {
        e.attrs.duplicate = true;
      }
    }

    function createdToken(e) {
      if (e.attrs.duplicate) {
        $timeout(function () {
          var tokens = getSwivelNumberTokens();
          _.remove(tokens, function (e) {
            return e.duplicate;
          });
          Notification.error('pstnSetup.duplicateNumber', {
            number: e.attrs.label
          });
          setSwivelNumberTokens(tokens.map(function (token) {
            return token.value;
          }));
        });
      } else if (!TelephoneNumberService.validateDID(e.attrs.value)) {
        angular.element(e.relatedTarget).addClass('invalid');
        e.attrs.invalid = true;
      }
    }

    function setSwivelNumberTokens(tokens) {
      angular.element('#' + vm.tokenfieldid).tokenfield('setTokens', tokens);
    }

    function getSwivelNumberTokens() {
      return angular.element('#' + vm.tokenfieldid).tokenfield('getTokens');
    }

    function validateSwivelNumbers() {
      var tokens = getSwivelNumberTokens() || [];
      var invalid = _.find(tokens, {
        invalid: true
      });
      if (invalid) {
        Notification.error('pstnSetup.invalidNumberPrompt');
      } else if (tokens.length === 0) {
        Notification.error('pstnSetup.orderNumbersPrompt');
      } else {
        vm.swivelTokens = tokens;
        $state.go('pstnSetup.review');
      }
    }

    function goToNumbers() {
      if (vm.provider.swivel) {
        goToSwivelNumbers();
      } else {
        goToOrderNumbers();
      }
    }

    function goToSwivelNumbers() {
      $state.go('pstnSetup.swivelNumbers');
      $timeout(function () {
        setSwivelNumberTokens(vm.swivelNumbers);
      }, 100);
    }

    function goToOrderNumbers() {
      $state.go('pstnSetup.orderNumbers');
    }

    function goToNextSteps() {
      $state.go('pstnSetup.nextSteps');
    }

    function removeOrder(order) {
      PstnSetupService.releaseCarrierInventory(vm.provider.uuid, order)
        .then(function () {
          _.pull(vm.orderCart, order);
        });
    }

    function resetForm() {
      vm.model.quantity = '';
      if (vm.form) {
        vm.form.$setPristine();
        vm.form.$setUntouched();
      }
    }

    function selectProvider(provider) {
      vm.provider = provider;
    }

    function notifyCustomer() {
      //TODO do something
    }

    function launchCustomerPortal() {
      $window.open($state.href('login_swap', {
        customerOrgId: vm.customerId,
        customerOrgName: vm.customerName
      }));
    }

    function getStateInventory() {
      PstnSetupService.getCarrierInventory(vm.provider.uuid, vm.model.state.abbreviation)
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
      var params = {
        npa: vm.model.areaCode.code,
        count: vm.model.quantity,
        sequential: vm.model.consecutive
      };
      vm.searchResults = [];
      vm.searchResultsModel = {};
      vm.paginateOptions.currentPage = 0;
      vm.singleResults = vm.model.quantity === 1;
      vm.consecutiveResults = vm.model.consecutive;

      PstnSetupService.searchCarrierInventory(vm.provider.uuid, params)
        .then(function (numberRanges) {
          if (vm.singleResults) {
            vm.searchResults = _.flatten(numberRanges);
          } else {
            vm.searchResults = numberRanges;
          }
        });
    }

    function formatTelephoneNumber(telephoneNumber) {
      // if a single number
      if (angular.isString(telephoneNumber)) {
        return TelephoneNumberService.getDIDLabel(telephoneNumber);
        // else if a range of numbers
      } else if (angular.isArray(telephoneNumber)) {
        var firstNumber = TelephoneNumberService.getDIDLabel(_.first(telephoneNumber));
        var lastNumber = TelephoneNumberService.getDIDLabel(_.last(telephoneNumber));
        if (vm.consecutiveResults) {
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
            var promise = PstnSetupService.reserveCarrierInventory(vm.provider.uuid, numbers)
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
        // workaround for cs-btn so button is set by ng-disabled
        delete vm.addLoading;
        // check if we need to decrement current page
        if (vm.paginateOptions.currentPage >= vm.paginateOptions.numberOfPages()) {
          vm.paginateOptions.currentPage--;
        }
      });
    }

    function getOrderNumbers() {
      return _.flatten(vm.orderCart);
    }

    function getOrderNumbersTotal() {
      return getOrderNumbers().length;
    }

    function init() {
      PstnSetupService.listCustomerCarriers(vm.customerId)
        .then(function (carriers) {
          customerExists = true;
          if (angular.isArray(carriers) && carriers.length === 0) {
            return PstnSetupService.listCarriers();
          } else {
            vm.hasCarriers = true;
            return carriers;
          }
        })
        .catch(function (response) {
          if (response && response.status === 404) {
            return PstnSetupService.listCarriers();
          } else {
            return $q.reject(response);
          }
        })
        .then(function (carriers) {
          angular.forEach(carriers, initCarrier);
          if (customerExists && vm.hasCarriers && angular.isArray(vm.providers) && vm.providers.length === 1) {
            selectProvider(vm.providers[0]);
            goToNumbers();
          }
        })
        .catch(function (response) {
          Notification.errorResponse(response, 'pstnSetup.carrierListError');
        })
        .finally(function () {
          vm.loading = false;
        });
    }

    function initCarrier(carrier) {
      if (carrier.name === PstnSetupService.INTELEPEER) {
        vm.providers.push({
          uuid: carrier.uuid,
          name: carrier.name,
          logoSrc: 'images/carriers/logo_intelepeer.svg',
          logoAlt: 'IntelePeer',
          title: 'IntelePeer Pro6S',
          features: [
            $translate.instant('intelepeerFeatures.feature1'),
            $translate.instant('intelepeerFeatures.feature2'),
            $translate.instant('intelepeerFeatures.feature3'),
            $translate.instant('intelepeerFeatures.feature4')
          ],
          selectFn: goToOrderNumbers
        });
      } else if (carrier.name === PstnSetupService.TATA) {
        vm.providers.push({
          swivel: true,
          uuid: carrier.uuid,
          name: carrier.name,
          logoSrc: 'images/carriers/logo_tata_comm.svg',
          logoAlt: 'Tata',
          title: 'Tata Smart Voice Bundle',
          features: [
            $translate.instant('tataFeatures.feature1'),
            $translate.instant('tataFeatures.feature2'),
            $translate.instant('tataFeatures.feature3'),
            $translate.instant('tataFeatures.feature4'),
            $translate.instant('tataFeatures.feature5')
          ],
          selectFn: goToSwivelNumbers
        });
      }
    }

    function orderNumbers() {
      if (vm.orderNumbersTotal === 0) {
        Notification.error('pstnSetup.orderNumbersPrompt');
      } else {
        $state.go('pstnSetup.review');
      }
    }

    function createCustomer() {
      return PstnSetupService.createCustomer(vm.customerId, vm.customerName, vm.provider.uuid)
        .then(function () {
          customerExists = true;
        }).catch(function (response) {
          Notification.errorResponse(response, 'pstnSetup.customerCreateError');
          return $q.reject(response);
        });
    }

    function updateCustomerCarrier() {
      return PstnSetupService.updateCustomerCarrier(vm.customerId, vm.provider.uuid)
        .then(function () {
          vm.hasCarriers = true;
        }).catch(function (response) {
          Notification.errorResponse(response, 'pstnSetup.customerUpdateError');
          return $q.reject(response);
        });
    }

    function createNumbers() {
      var promises = [];
      var errors = [];
      if (vm.provider.swivel) {
        angular.forEach(vm.swivelTokens, function (swivelToken) {
          var promise = ExternalNumberPool.create(vm.customerId, swivelToken.value)
            .catch(function (response) {
              if (response.status === 409) {
                errors.push($translate.instant('pstnSetup.swivelDuplicateError', {
                  number: swivelToken.label
                }));
              } else {
                errors.push(Notification.processErrorResponse(response, 'pstnSetup.swivelAddError', {
                  number: swivelToken.label
                }));
              }
            });
          promises.push(promise);
        });
      } else {
        var promise = PstnSetupService.orderNumbers(vm.customerId, vm.provider.uuid, getOrderNumbers())
          .catch(function (response) {
            errors.push(Notification.processErrorResponse(response, 'pstnSetup.orderNumbersError'));
          });
        promises.push(promise);
      }
      return $q.all(promises).then(function () {
        if (errors.length > 0) {
          Notification.notify(errors, 'error');
        }
      });
    }

    function placeOrder() {
      var promise = $q.when();
      vm.placeOrderLoad = true;
      if (!customerExists) {
        promise = promise.then(createCustomer);
      } else if (!vm.hasCarriers) {
        promise = promise.then(updateCustomerCarrier);
      }
      promise.then(createNumbers)
        .then(goToNextSteps)
        .finally(function () {
          vm.placeOrderLoad = false;
        });
    }
  }
})();
