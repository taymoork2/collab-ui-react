'use strict';

angular.module('Core')
  .directive('crTrialInfoCard', [
    function () {
      return {
        restrict: 'EA',
        replace: true,
        templateUrl: 'modules/core/customers/customerPreview/trialInfoCard.tpl.html',
        link: function () {}
      };
    }
  ]);
