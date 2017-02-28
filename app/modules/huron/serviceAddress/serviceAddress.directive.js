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
        readOnly: '=',
        hideSearch: '=',
        formName: '=',
        addressValidate: '&',
        modify: '&',
      },
    };
    return directive;
  }

  /* @ngInject */
  function ServiceAddressCtrl($scope, PstnSetupStatesService, HuronCompassService) {
    PstnSetupStatesService.getLocation(HuronCompassService.getCountryCode()).then(function (location) {
      $scope.areaName = location.type;
      $scope.stateOptions = location.areas;
    });
    $scope.locationModel = {};
    $scope.onLocationSelect = function () {
      $scope.address.state = $scope.locationModel.abbreviation;
    };
    $scope.onModify = function () {
      $scope.locationModel = {};
      $scope.modify();
    };
  }

  function isolateForm() {
    var directive = {
      restrict: 'A',
      require: '^form',
      link: isolateFormLink,
    };

    return directive;

    function isolateFormLink(scope, elm, attrs, formCtrl) {
      var parentFormCtrl = scope.$eval(attrs.isolateForm) || scope.form;

      if (!formCtrl || !parentFormCtrl) {
        return;
      }

      var formCtlCopy = angular.copy(formCtrl);
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
      _.assign(formCtrl, isolatedFormCtrl);

    }
  }
})();
