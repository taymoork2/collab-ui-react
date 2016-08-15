(function () {
  'use strict';

  angular.module('core.notifications')
    .directive('bindUnsafeHtml', bindUnsafeHtml);

  function bindUnsafeHtml() {
    return {
      template: '<span ng-repeat="n in directiveData.data">{{n}}<br></span>'
    };
  }
})();
