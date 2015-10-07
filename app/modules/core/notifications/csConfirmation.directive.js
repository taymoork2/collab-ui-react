(function () {
  'use strict';

  angular.module('Core')
    .directive('csConfirmation', csConfirmation);

  /* @ngInject */
  function csConfirmation(AlertService, toaster) {
    return {
      template: '{{message}}<br/> <div class="clearfix"><button type="button" class="btn btn-danger ui-ml right" ng-click="notify(true)" translate="common.yes"></button><button type="button" class="btn btn-default right" ng-click="notify(false)" translate="common.no"></button></div>',
      link: function (scope, elem, attrs) {
        scope.message = AlertService.getMessage();
        scope.notify = function (toNotify) {
          if (toNotify) {
            AlertService.getDeferred().resolve();
            toaster.clear('*');
          } else {
            AlertService.getDeferred().reject();
            toaster.clear('*');
          }
        };
      }
    };
  }
})();
