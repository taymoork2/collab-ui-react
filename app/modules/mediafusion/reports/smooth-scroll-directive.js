(function () {
  'use strict';

  angular
    .module('Mediafusion')
    .directive('scrollOnClick', scrollOnClick);

  function scrollOnClick($timeout) {
    var directive = {
      restrict: 'A',
      link: function (scope, $elm) {
        $elm.on('click', function () {
          $(".media-reports-container").animate({ scrollTop: 2000 }, "slow");
          $("#availability-card").hide();
          var showDiv = function () {
            $("#availability-card").show();
          };
          $timeout(showDiv, 500);
        });
      },
    };
    return directive;
  }

})();
