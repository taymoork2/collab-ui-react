(function () {
  'use strict';

  angular.module('Huron')
    .controller('PstnSetup', PstnSetup);

  /* @ngInject */
  function PstnSetup($scope, $translate, $state, ValidationService) {
    var vm = this;
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

    $scope.$watchCollection(function () {
      return vm.blockOrders;
    }, function (blockOrders) {
      vm.blockOrderTotals = blockOrders.reduce(function (previousValue, currentOrder) {
        return previousValue + (parseInt(currentOrder.quantity) || 0);
      }, 0);
    });

    vm.providers = [{
      logoSrc: 'images/cisco_logo.png',
      logoAlt: 'Tata',
      title: 'Tata Trial',
      features: [
        'Who needs an API?',
        'Pick me!'
      ],
      selectFn: selectTata
    }, {
      logoSrc: 'images/cisco_logo.png',
      logoAlt: 'IntelePeer',
      title: 'IntelePeer Pro6S',
      features: [
        'I need an API!',
        'Feature two is special',
        'Feature three is the best',
        'Feature four could be here?',
        'Feature five doesn\'t even exist yet'
      ],
      selectFn: selectIntelePeer
    }];

    vm.blockOrders = [{
      areaCode: '123',
      quantity: '5'
    }, {
      areaCode: '456',
      quantity: '2'
    }];

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

    function selectTata() {
      $state.go('didadd', {});
    }

    function selectIntelePeer() {
      $state.go('pstnSetup.orderNumbers', {});
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
      //TODO do something
    }
  }
})();
