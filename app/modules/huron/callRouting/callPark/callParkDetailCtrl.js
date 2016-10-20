(function () {
  'use strict';

  angular
    .module('uc.callpark')
    .controller('CallParkDetailCtrl', CallParkDetailCtrl);

  /* @ngInject */
  function CallParkDetailCtrl($modalInstance, CallPark, $translate, ValidationService) {
    var vm = this;

    vm.callPark = {
      retrievalPrefix: {
        name: '*',
        value: '*'
      },
      pattern: '',
      name: '',
      patternOption: 'range',
      reversionOption: 'callparkInitLine',
      reversionPattern: ''
    };

    vm.validations = {
      greaterThan: function (viewValue, modelValue, scope) {
        var value = modelValue || viewValue;
        scope.model.rangeMax = value;
        // we only validate this if rangeMin is valid or populated
        if (angular.isUndefined(scope.model.rangeMin) || scope.model.rangeMin === "") {
          return true;
        } else {
          return parseInt(value, 10) >= parseInt(scope.model.rangeMin, 10);
        }
      },
      lessThan: function (viewValue, modelValue, scope) {
        var value = modelValue || viewValue;
        // we only validate this if rangeMin is valid or populated
        if (angular.isUndefined(scope.model.rangeMax) || scope.model.rangeMax === "") {
          return true;
        } else {
          return parseInt(value, 10) <= parseInt(scope.model.rangeMax, 10);
        }
      },
      checkNumeric: function (viewValue, modelValue, scope) {
        var value = modelValue || viewValue;
        if (angular.isUndefined(value)) {
          return true;
        }
        return ValidationService.numeric(viewValue, modelValue, scope);
      },
      checkRequired: function (viewValue, modelValue, scope) {
        var value = modelValue || viewValue;
        if (scope.model.patternOption !== 'range') {
          return true;
        }
        return angular.isDefined(value) && value !== '';
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
        type: 'text',
        maxlength: 50
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
          model: 'patternOption'
        }
      }, {
        className: 'col-xs-3 align-number-input',
        key: 'rangeMin',
        type: 'input',
        templateOptions: {
          placeholder: 1200,
          maxlength: 11
        },
        validators: {
          lessThan: {
            expression: vm.validations.lessThan,
            message: function ($viewValue, $modelValue, scope) {
              return $translate.instant('callPark.lessThan', {
                'rangeMin': $viewValue,
                'rangeMax': scope.model.rangeMax
              });
            }
          },
          checkNumeric: {
            expression: vm.validations.checkNumeric,
            message: function () {
              return $translate.instant('validation.numeric');
            }
          },
          checkRequired: {
            expression: vm.validations.checkRequired,
            message: function () {
              return $translate.instant('callPark.required');
            }
          }
        },
        hideExpression: function ($viewValue, $modelValue, scope) {
          return scope.model.patternOption !== 'range';
        },
        expressionProperties: {
          'data.validate': function (viewValue, modelValue, scope) {
            if (!scope.fc.$invalid) {
              return true;
            }
            return (scope.fc && scope.fc.$validate());
          }
        }
      }, {
        className: 'col-xs-1 align-to',
        noFormControl: true,
        template: '<div translate="callPark.to"></div>',
        hideExpression: function ($viewValue, $modelValue, scope) {
          return scope.model.patternOption !== 'range';
        }
      }, {
        className: 'col-xs-3',
        key: 'rangeMax',
        type: 'input',
        templateOptions: {
          placeholder: 1230,
          maxlength: 11
        },
        validators: {
          checkNumeric: {
            expression: vm.validations.checkNumeric,
            message: function () {
              return $translate.instant('validation.numeric');
            }
          },
          greaterThan: {
            expression: vm.validations.greaterThan,
            message: function ($viewValue, $modelValue, scope) {
              return $translate.instant('callPark.greaterThan', {
                'rangeMin': scope.model.rangeMin,
                'rangeMax': $viewValue
              });
            }
          },
          checkRequired: {
            expression: vm.validations.checkRequired,
            message: function () {
              return $translate.instant('callPark.required');
            }
          }
        },
        hideExpression: function ($viewValue, $modelValue, scope) {
          return scope.model.patternOption !== 'range';
        },
        expressionProperties: {
          // this expressionProperty is here simply to be run, the property `data.validate` isn't actually used anywhere
          // it retriggers validation
          'data.validate': function (viewValue, modelValue, scope) {
            if (!scope.fc.$invalid) {
              return true;
            }
            return (scope.fc && scope.fc.$validate());
          }
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
          model: 'patternOption'
        }
      }, {
        className: 'col-xs-6 align-number',
        key: 'pattern',
        type: 'input',
        templateOptions: {
          placeholder: $translate.instant('callPark.singleNumberPlaceholder'),
          type: 'text',
          model: 'pattern',
          required: true,
          maxlength: 11
        },
        validators: {
          checkNumeric: {
            expression: vm.validations.checkNumeric,
            message: function () {
              return $translate.instant('validation.numeric');
            }
          }
        },
        hideExpression: function ($viewValue, $modelValue, scope) {
          return scope.model.patternOption !== 'singleNumber';
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
          model: 'reversionPattern',
          maxlength: 11
        },
        validators: {
          checkNumeric: {
            expression: vm.validations.checkNumeric,
            message: function () {
              return $translate.instant('validation.numeric');
            }
          }
        },
        expressionProperties: {
          'templateOptions.disabled': function () {
            return vm.callPark.reversionOption !== 'number';
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
        retrievalPrefix: callParkModel.retrievalPrefix.value,
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
