require('./_cdr-overview.scss');

(function () {
  'use strict';

  angular
    .module('uc.cdrlogsupport')
    .controller('CdrOverviewCtrl', CdrOverviewCtrl);

  var ChartColors = require('modules/core/config/chartColors').ChartColors;

  /* @ngInject */
  function CdrOverviewCtrl($state, $stateParams, $translate, CdrService) {
    var vm = this;
    var call = $stateParams.call;
    var logstashPath = $stateParams.logstashPath;

    var cdrData = formatCdr($stateParams.cdrData);
    vm.searchPlaceholder = $translate.instant('cdrLogs.searchPlaceholder');
    vm.searchField = '';
    vm.cdrTable = [];
    vm.filename = 'cdr.json';
    vm.jsonUrl = undefined;
    vm.jsonBlob = undefined;

    vm.localSessionID = cdrData.localSessionID;
    vm.remoteSessionID = cdrData.remoteSessionID;
    vm.cdr = [];
    // build an array to use with angular filter
    _.forEach(cdrData, function (value, key) {
      if (key.toLowerCase() !== '$$hashkey') {
        vm.cdr.push({
          key: key,
          value: value,
        });
      }
    });

    vm.tableOptions = {
      cursorcolor: ChartColors.gray,
      cursorborder: '0px',
      cursorwidth: '7px',
      railpadding: {
        top: 0,
        right: 3,
        left: 0,
        bottom: 0,
      },
      autohidemode: 'leave',
    };

    vm.openLadderDiagram = function () {
      $state.go('cdrladderdiagram', {
        call: $stateParams.call,
        uniqueIds: $stateParams.uniqueIds,
        events: $stateParams.events,
        logstashPath: logstashPath,
      });
    };

    vm.cdrClick = function () {
      if (!_.isUndefined(vm.jsonBlob)) {
        CdrService.downloadInIE(vm.jsonBlob, vm.filename);
      }
    };

    function init() {
      var downloadData = CdrService.createDownload(call);
      if (!_.isUndefined(downloadData.jsonBlob)) {
        vm.jsonBlob = downloadData.jsonBlob;
      }
      if (!_.isUndefined(downloadData.jsonUrl)) {
        vm.jsonUrl = downloadData.jsonUrl;
      }
    }

    function formatCdr(cdrRawJson) {
      var newCdr = cdrRawJson.dataParam;
      delete newCdr['message'];
      delete newCdr['name'];
      for (var key in cdrRawJson) {
        if (['dataParam', 'eventSource', 'tags', 'message'].indexOf(key) < 0) {
          newCdr[key] = cdrRawJson[key];
        }
      }
      return newCdr;
    }

    init();
  }
})();
