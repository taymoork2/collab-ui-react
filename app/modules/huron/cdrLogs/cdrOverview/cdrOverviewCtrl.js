(function () {
  'use strict';

  angular
    .module('uc.cdrlogsupport')
    .controller('CdrOverviewCtrl', CdrOverviewCtrl);

  /* @ngInject */
  function CdrOverviewCtrl($scope, $state, $stateParams, $translate, $timeout, Config, CdrService) {
    var vm = this;
    var cdr = formatCdr($stateParams.cdrData);
    var call = $stateParams.call;
    var location = "#" + $stateParams.cdrData.name;

    vm.searchPlaceholder = $translate.instant('cdrLogs.searchPlaceholder');
    vm.searchField = "";
    vm.cdrTable = [];
    vm.jsonUrl = "";

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

    vm.filter = filter;

    function init() {
      vm.jsonUrl = CdrService.createDownload(call);
    }

    function filter() {
      var result = {};
      angular.forEach(cdr, function (value, key) {
        if (vm.searchField === undefined || vm.searchField === '' || (value.toString().toLowerCase().replace(/_/g, ' ')).indexOf(vm.searchField.toLowerCase().replace(/_/g, ' ')) > -1 || (key.toString().toLowerCase().replace(/_/g, ' ')).indexOf(vm.searchField.toLowerCase().replace(/_/g, ' ')) > -1) {
          result[key] = value;
        }
      });
      $timeout(function () {
        $('#cdrDisplayTable').getNiceScroll().resize();
      });
      return result;
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
