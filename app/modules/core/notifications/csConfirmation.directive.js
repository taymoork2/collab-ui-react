(function () {
  'use strict';

  angular.module('core.notifications')
    .directive('csConfirmation', csConfirmation);

  /* @ngInject */
  function csConfirmation(AlertService, toaster) {
    return {
      template: '{{message}}<br><div class="clearfix"><button type="button" class="btn btn--negative ui-ml right" ng-click="notify(true)" translate="common.yes"></button><button type="button" class="btn right" ng-click="notify(false)" translate="common.no"></button></div>',
      link: function (scope) {
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
