'use strict';

angular.module('Core')
  .directive('crCustomerInfoCard', [
    function () {
      return {
        restrict: 'EA',
        replace: true,
        templateUrl: 'modules/core/customers/customerPreview/customerInfoCard.tpl.html',
        link: function () {}
      };
    }
  ]);
