(function () {
  'use strict';

  angular.module('Huron')
    .controller('PstnSetupCtrl', PstnSetupCtrl);

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
      quantity: ''
    };
    vm.areaCodeOptions = [];
    vm.blockOrders = [];
    vm.blockOrderTotals = 0;

    vm.removeOrder = removeOrder;
    vm.selectProvider = selectProvider;
    vm.notifyCustomer = notifyCustomer;
    vm.launchCustomerPortal = launchCustomerPortal;
    vm.orderNumbers = orderNumbers;
    vm.goToNumbers = goToNumbers;
    vm.placeOrder = placeOrder;

    $scope.$watchCollection(function () {
      return vm.blockOrders;
    }, function (blockOrders) {
      vm.blockOrderTotals = blockOrders.reduce(function (previousValue, currentOrder) {
        return previousValue + (parseInt(currentOrder.quantity) || 0);
      }, 0);
    });

    vm.providers = [];
    vm.blockOrders = [];

    vm.fields = [{
      type: 'inline',
      templateOptions: {
        fields: [{
          type: 'select',
          key: 'state',
          templateOptions: {
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
          }
        }, {
          type: 'select',
          key: 'areaCode',
          id: 'areaCode',
          templateOptions: {
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
            label: $translate.instant('pstnSetup.quantity'),
            type: 'number'
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
          key: 'addBtn',
          templateOptions: {
            btnClass: 'btn-primary label-height-offset',
            label: $translate.instant('common.add'),
            onClick: function (options, scope) {
              vm.blockOrders.push({
                areaCode: scope.model.areaCode.code,
                quantity: scope.model.quantity
              });
              resetForm();
              angular.element('#areaCode').focus();
            }
          },
          expressionProperties: {
            'templateOptions.disabled': function ($viewValue, $modelValue, scope) {
              return !scope.model.areaCode || !scope.model.quantity;
            }
          }
        }]
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
      _.remove(vm.blockOrders, order);
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
      if (vm.blockOrders.length === 0) {
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
                  number: this.label
                }));
              } else {
                errors.push(Notification.processErrorResponse(response, 'pstnSetup.swivelAddError', {
                  number: this.label
                }));
              }
            }.bind(swivelToken));
          promises.push(promise);
        });
      } else {
        angular.forEach(vm.blockOrders, function (blockOrder) {
          var promise = PstnSetupService.orderBlock(vm.customerId, vm.provider.uuid, blockOrder.areaCode, blockOrder.quantity)
            .catch(function (response) {
              errors.push(Notification.processErrorResponse(response, 'pstnSetup.blockOrderError', {
                areaCode: this.areaCode,
                quantity: this.quantity
              }));
            }.bind(blockOrder));
          promises.push(promise);
        });
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
