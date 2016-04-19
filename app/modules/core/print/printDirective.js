(function () {
  'use strict';

  angular
    .module('Core')
    .directive('crPrint', crPrint);

  /* @ngInject */
  function crPrint($window) {
    var printSection = $window.document.getElementById('printSection');
    // if there is no printing section, create one
    if (!printSection) {
      createPrintSection();
    } else {
      printSection.innerHTML = '';
      createPrintSection();
    }

    function createPrintSection() {
      printSection = $window.document.createElement('div');
      printSection.id = 'printSection';
      printSection.className = 'container';
      $window.document.body.appendChild(printSection);
    }

    function link(scope, element, attrs) {
      element.on('click', function () {
        var elemToPrint = $window.document.getElementById(attrs.printElementId);
        if (elemToPrint) {
          printElement(elemToPrint);
        }
      });

      if ($window.matchMedia) {
        var mediaQueryList = $window.matchMedia('print');
        mediaQueryList.addListener(function (mql) {
          if (!mql.matches) {
            afterPrint();
          }
        });
      }
      // window.onafterprint = function () {
      //   // clean the print section before adding new content
      //   printSection.innerHTML = '';
      // }
      $window.onafterprint = afterPrint;
    }

    function afterPrint() {
      // clean the print section before adding new content
      printSection.innerHTML = '';
    }

    function printElement(elem) {
      // clones the element you want to print
      var domClone = elem.cloneNode(true);
      //console.log(domClone);
      printSection.appendChild(domClone);
      $window.print();
    }
    return {
      link: link,
      restrict: 'A'
    };
  }

})();
