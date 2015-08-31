(function () {
  'use strict';

  angular.module('Huron')
    .controller('PstnSetupCtrl', PstnSetupCtrl);

  /* @ngInject */
  function PstnSetupCtrl($scope, $q, $window, $translate, $state, $stateParams, PstnSetupService, ValidationService, Notification) {
    var vm = this;
    vm.customerId = $stateParams.customerId;
    vm.customerName = $stateParams.customerName;
    vm.customerExists = false;
    vm.loading = true;
    vm.model = {
      areaCode: '',
      quantity: ''
    };
    vm.blockOrders = [];
    vm.blockOrderTotals = 0;

    vm.removeOrder = removeOrder;
    vm.selectProvider = selectProvider;
    vm.notifyCustomer = notifyCustomer;
    vm.launchCustomerPortal = launchCustomerPortal;
    vm.orderNumbers = orderNumbers;
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
          type: 'input',
          key: 'areaCode',
          id: 'areaCode',
          templateOptions: {
            label: $translate.instant('pstnSetup.areaCode'),
            type: 'text'
          },
          validators: {
            numeric: {
              expression: ValidationService.numeric,
              message: function () {
                return $translate.instant('validation.numeric');
              }
            }
          }
        }, {
          noFormControl: true,
          template: '<div class="label-height-offset">' + $translate.instant('common.and') + '</div>'
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
            btnClass: 'btn-primary',
            label: $translate.instant('common.add'),
            onClick: function (options, scope) {
              vm.blockOrders.push({
                areaCode: scope.model.areaCode,
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

    init();

    ////////////////////////

    function selectTata() {
      $state.go('didadd');
    }

    function selectIntelePeer() {
      $state.go('pstnSetup.orderNumbers');
    }

    function removeOrder(order) {
      _.remove(vm.blockOrders, order);
    }

    function resetForm() {
      vm.model.areaCode = vm.model.quantity = '';
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

    function init() {
      PstnSetupService.listCustomerCarriers(vm.customerId)
        .then(function (carriers) {
          vm.customerExists = true;
          return carriers;
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
          if (vm.customerExists && angular.isArray(vm.providers) && vm.providers.length === 1) {
            selectProvider(vm.providers[0]);
            return $state.go('pstnSetup.orderNumbers');
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
          selectFn: selectIntelePeer
        });
      }
      // TODO enable Tata at a later time
      // else if (carrier.name === PstnSetupService.TATA) {
      //   vm.providers.push({
      //     uuid: carrier.uuid,
      //     name: carrier.name,
      //     logoSrc: 'images/carriers/logo_tata_comm.svg',
      //     logoAlt: 'Tata',
      //     title: 'Tata Trial',
      //     features: [],
      //     selectFn: selectTata
      //   });
      // }
    }

    function orderNumbers() {
      if (vm.blockOrders.length === 0) {
        Notification.error('pstnSetup.orderNumbersPrompt');
      } else {
        $state.go('pstnSetup.review');
      }
    }

    function placeOrder() {
      var customerPromise;
      angular.element('#placeOrder').button('loading');
      if (!vm.customerExists) {
        customerPromise = PstnSetupService.createCustomer(vm.customerId, vm.customerName, vm.provider.uuid)
          .catch(function (response) {
            Notification.errorResponse(response);
            return $q.reject(response);
          });
      }
      $q.when(customerPromise).then(function () {
        var promises = [];
        angular.forEach(vm.blockOrders, function (blockOrder) {
          var promise = PstnSetupService.orderBlock(vm.customerId, vm.provider.uuid, blockOrder.areaCode, blockOrder.quantity);
          promise.catch(function (response) {
            Notification.errorResponse(response, 'pstnSetup.blockOrderError', {
              areaCode: this.areaCode,
              quantity: this.quantity
            });
          }.bind(blockOrder));
          promises.push(promise);
        });
        return $q.all(promises);
      }).then(function () {
        $state.go('pstnSetup.nextSteps');
      }).finally(function () {
        angular.element('#placeOrder').button('reset');
      });
    }
  }
})();
