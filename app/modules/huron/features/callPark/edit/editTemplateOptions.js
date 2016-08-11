(function () {
  'use strict';

  angular
    .module('Huron')
    .directive('editTemplateOptions', editTemplateOptions);

  function editTemplateOptions($timeout) {
    var directive = {
      restrict: 'A',
      scope: {
        options: '=',
        callback: '&'
      },
      templateUrl: 'modules/huron/features/callPark/edit/editTemplateOptions.tpl.html',
      link: function (scope, element) {
        angular.forEach(scope.options, function (option) {
          option.currentInput = _.get(option, 'currentInput') || 0;
        });

        $timeout(function () {
          var optionsInputs = element.find('input');
          optionsInputs.bind('change', function () {
            scope.callback();
          });
        });
      }
    };

    return directive;
  }

})();
