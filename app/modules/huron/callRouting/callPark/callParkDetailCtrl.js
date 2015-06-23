(function () {
  'use strict';

  angular
    .module('uc.callpark')
    .controller('CallParkDetailCtrl', CallParkDetailCtrl);

  /* @ngInject */
  function CallParkDetailCtrl($modalInstance, CallPark, $translate, ValidationService) {
    var vm = this;

    vm.callPark = {
      retrievalPrefix: '*',
      pattern: '',
      name: '',
      patternOption: '',
      reversionOption: 'callparkInitLine',
      reversionPattern: ''
    };
    vm.validations = {
      greaterThan: function (viewValue, modelValue, scope) {
        var value = modelValue || viewValue;
        // we only validate this if rangeMin is valid or populated
        if (angular.isUndefined(scope.model.rangeMin) || scope.model.rangeMin === "" || !ValidationService.numeric(viewValue, modelValue)) {
          return true;
        } else {
          return parseInt(value) >= parseInt(scope.model.rangeMin);
        }
      },
      lessThan: function (viewValue, modelValue, scope) {
        var value = modelValue || viewValue;
        // we only validate this if rangeMin is valid or populated
        if (angular.isUndefined(scope.model.rangeMax) || scope.model.rangeMax === "" || !ValidationService.numeric(viewValue, modelValue)) {
          return true;
        } else {
          return parseInt(value) <= parseInt(scope.model.rangeMax);
        }
      }
    };
    vm.nameFields = [{
      key: 'name',
      type: 'input',
      templateOptions: {
        className: 'name-align',
        label: $translate.instant('callPark.name'),
        placeholder: $translate.instant('callPark.enterName'),
        labelClass: 'col-xs-1',
        inputClass: 'col-xs-10',
        type: 'text'
      }
    }];

    vm.retrieveFields = [{
      key: 'retrievalPrefix',
      type: 'select',
      className: 'align-prefix',
      templateOptions: {
        labelfield: 'name',
        valuefield: 'value',
        inputClass: 'col-xs-3',
        required: true,
        options: [{
          name: '#',
          value: '#'
        }, {
          name: '*',
          value: '*'
        }, {
          name: '@',
          value: '@'
        }]
      }
    }];

    vm.numberFields = [{
      className: 'row row-callpark',
      fieldGroup: [{
        className: 'col-xs-4 align-radio margin-radio',
        key: 'range',
        type: 'radio',
        templateOptions: {
          label: $translate.instant('callPark.patternRange'),
          value: 'range',
          model: 'patternOption',
          required: true
        }
      }, {
        className: 'col-xs-3 align-number-input',
        key: 'rangeMin',
        type: 'input',
        templateOptions: {
          placeholder: 1200,
          required: true
        },
        validators: {
          numeric: {
            expression: ValidationService.numeric,
            message: function () {
              return $translate.instant('validation.numeric');
            }
          },
          lessThan: {
            expression: vm.validations.lessThan,
            message: function ($viewValue, $modelValue, scope) {
              return $translate.instant('callPark.greaterThanLessThan', {
                'rangeMax': scope.model.rangeMax,
                'rangeMin': $viewValue
              });
            }
          }
        },
        expressionProperties: {
          'hide': function ($viewValue, $modelValue, scope) {
            return scope.model.patternOption !== 'range';
          }
        }
      }, {
        className: 'col-xs-1 align-to',
        noFormControl: true,
        template: '<div translate="callPark.to"></div>',
        expressionProperties: {
          'hide': function ($viewValue, $modelValue, scope) {
            return scope.model.patternOption !== 'range';
          }
        }
      }, {
        className: 'col-xs-3',
        key: 'rangeMax',
        type: 'input',
        templateOptions: {
          placeholder: 1230,
          required: true
        },
        validators: {
          numeric: {
            expression: ValidationService.numeric,
            message: function () {
              return $translate.instant('validation.numeric');
            }
          },
          greaterThan: {
            expression: vm.validations.greaterThan,
            message: function ($viewValue, $modelValue, scope) {
              return $translate.instant('callPark.greaterThanLessThan', {
                'rangeMin': scope.model.rangeMin,
                'rangeMax': $viewValue
              });
            }
          }
        },
        expressionProperties: {
          'hide': function ($viewValue, $modelValue, scope) {
            return scope.model.patternOption !== 'range';
          },
        }
      }]
    }, {
      className: 'row row-callpark',
      fieldGroup: [{
        className: 'col-xs-4 margin-radio',
        key: 'singleNumber',
        type: 'radio',
        templateOptions: {
          label: $translate.instant('callPark.patternSingle'),
          value: 'singleNumber',
          model: 'patternOption',
          required: true
        }
      }, {
        className: 'col-xs-6 align-number',
        key: 'pattern',
        type: 'input',
        templateOptions: {
          placeholder: $translate.instant('callPark.singleNumberPlaceholder'),
          type: 'text',
          required: true,
          model: 'pattern'
        },
        validators: {
          numeric: {
            expression: ValidationService.numeric,
            message: function () {
              return $translate.instant('validation.numeric');
            }
          }
        },
        expressionProperties: {
          'hide': function ($viewValue, $modelValue, scope) {
            return scope.model.patternOption !== 'singleNumber';
          }
        }
      }]
    }];

    vm.reversionFields = [{
      className: 'row row-callpark',
      fieldGroup: [{
        className: 'col-xs-8 margin-radio',
        key: 'callparkInitLine',
        type: 'radio',
        templateOptions: {
          label: $translate.instant('callPark.callparkInitLine'),
          value: 'callparkInitLine',
          model: 'reversionOption'
        }
      }]
    }, {
      className: 'row row-callpark',
      fieldGroup: [{
        className: 'col-xs-1 margin-radio',
        key: 'reversionOption',
        type: 'radio',
        templateOptions: {
          value: 'number',
          model: 'reversionOption'
        }
      }, {
        className: 'col-xs-6 align-reversion-number',
        key: 'reversionPattern',
        type: 'input',
        templateOptions: {
          horizontal: true,
          placeholder: $translate.instant('callPark.numberPlaceholder'),
          type: 'text',
          model: 'reversionPattern'
        },
        validators: {
          numeric: {
            expression: ValidationService.numeric,
            message: function () {
              return $translate.instant('validation.numeric');
            }
          }
        }
      }]
    }];

    vm.addCallPark = addCallPark;
    vm.addCallParkByRange = addCallParkByRange;

    function addCallParkByRange(callPark, rangeMin, rangeMax) {
      CallPark.createByRange(callPark, rangeMin, rangeMax)
        .then(function () {
          $modalInstance.close();
        })
        .catch(function () {
          $modalInstance.dismiss();
        });
    }

    function addCallPark(callParkModel) {

      var callPark = {
        description: callParkModel.name,
        retrievalPrefix: callParkModel.retrievalPrefix,
        pattern: callParkModel.pattern,
        reversionPattern: callParkModel.reversionPattern
      };
      if (callParkModel.patternOption === 'singleNumber') {
        CallPark.create(callPark)
          .then(function () {
            $modalInstance.close();
          })
          .catch(function () {
            $modalInstance.dismiss();
          });
      } else {
        addCallParkByRange(callPark, callParkModel.rangeMin, callParkModel.rangeMax);
      }
    }
  }
})();
