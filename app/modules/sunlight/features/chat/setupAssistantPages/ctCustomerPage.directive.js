(function () {
  'use strict';

  angular
    .module('Sunlight')
    .directive('selectable', Selectable);

  function Selectable() {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        element.bind('click', function (e) {
          //Remove active class from previous selection
          $(".active").each(function () {
            $(this).removeClass('active');
          });

          //Make all children which are selectable and mark them active
          element
            .find('.ct-selectable-element')
            .addClass('active');

          //If the current element is container, mark it active
          if (element.hasClass('ct-selectable-container')) {
            element.addClass('active');
          }

          //Hack to effect 'active' changes for tags inside a directive
          element
            .find('.ct-selectable-cs-select')
            .addClass('active');
        });
      }
    };
  }
})();
