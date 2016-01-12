(function () {
  'use strict';

  angular.module('Huron')
    .directive('isolateForm', isolateForm)
    .directive('hrServiceAddress', hrServiceAddress);

  /* @ngInject */
  function hrServiceAddress() {
    var directive = {
      restrict: 'E',
      templateUrl: 'modules/huron/serviceAddress/serviceAddress.tpl.html',
      controller: ServiceAddressCtrl,
      scope: {
        address: '=',
        readOnly: '='
      }
    };

    return directive;
  }

  /* @ngInject */
  function ServiceAddressCtrl($scope, TerminusStateService) {
    TerminusStateService.query().$promise.then(function (states) {
      $scope.stateOptions = _.map(states, function (state) {
        return state.abbreviation;
      });
    });
  }

  function isolateForm() {
    var directive = {
      restrict: 'A',
      require: '^form',
      link: isolateFormLink
    };

    return directive;

    function isolateFormLink(scope, elm, attrs, formCtrl) {
      if (!formCtrl || !scope.form) {
        return;
      }

      var formCtlCopy = angular.copy(formCtrl);
      var parentFormCtrl = scope.form;

      parentFormCtrl.$removeControl(formCtrl);

      // ripped this from an example
      var isolatedFormCtrl = {
        $setValidity: function (validationToken, isValid, control) {
          formCtlCopy.$setValidity(validationToken, isValid, control);
          parentFormCtrl.$setValidity(validationToken, true, formCtrl);
        },
        $setDirty: function () {
          elm.removeClass('ng-pristine').addClass('ng-dirty');
          formCtrl.$dirty = true;
          formCtrl.$pristine = false;
        },
      };
      angular.extend(formCtrl, isolatedFormCtrl);

    }
  }
})();
