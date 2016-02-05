(function () {
  'use strict';

  angular
    .module('uc.cdrlogsupport')
    .controller('CdrOverviewCtrl', CdrOverviewCtrl);

  /* @ngInject */
  function CdrOverviewCtrl($scope, $state, $stateParams, $translate, $timeout, Config, CdrService) {
    var vm = this;
    var call = $stateParams.call;
    var location = "#" + $stateParams.cdrData.name;

    var cdrData = formatCdr($stateParams.cdrData);
    vm.searchPlaceholder = $translate.instant('cdrLogs.searchPlaceholder');
    vm.searchField = "";
    vm.cdrTable = [];
    vm.jsonUrl = "";

    vm.cdr = [];
    // build an array to use with angular filter.
    angular.forEach(cdrData, function (value, key) {
      if (key.toLowerCase() !== '$$hashkey') {
        vm.cdr.push({
          'key': key,
          'value': value
        });
      }
    });

    vm.tableOptions = {
      cursorcolor: Config.chartColors.gray,
      cursorborder: "0px",
      cursorwidth: "7px",
      railpadding: {
        top: 0,
        right: 3,
        left: 0,
        bottom: 0
      },
      autohidemode: "leave"
    };

    vm.openLadderDiagram = function () {
      $state.go('cdrladderdiagram', {
        call: $stateParams.call,
        uniqueIds: $stateParams.uniqueIds,
        events: $stateParams.events
      });
    };

    function init() {
      vm.jsonUrl = CdrService.createDownload(call);
    }

    function formatCdr(cdrRawJson) {
      var newCdr = cdrRawJson.dataParam;
      delete newCdr['message'];
      delete newCdr['name'];
      for (var key in cdrRawJson) {
        if (["dataParam", "eventSource", "tags", "message"].indexOf(key) < 0) {
          newCdr[key] = cdrRawJson[key];
        }
      }
      return newCdr;
    }

    init();
  }
})();
