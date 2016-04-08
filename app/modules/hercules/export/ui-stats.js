(function () {
  'use strict';

  angular
    .module('Hercules')
    .service('UiStats', UiStats);

  /* @ngInject  */
  function UiStats(Log) {

    var statuses = [];

    var insertServiceInfo = function (serviceInfo) {
      statuses = [{
        "stateType": "activated",
        "text": "activated",
        "count": serviceInfo.activated.toString(),
        "selected": false,
        "unselectable": serviceInfo.activated === 0 ? true : false,
        "progress": 0
      }, {
        "stateType": "error",
        "text": "errors",
        "count": serviceInfo.error.toString(),
        "selected": true,
        "unselectable": serviceInfo.error === 0 ? true : false,
        "progress": 0
      }, {
        "stateType": "notActivated",
        "text": "pending activation",
        "count": serviceInfo.notActivated.toString(),
        "selected": true,
        "unselectable": serviceInfo.notActivated === 0 ? true : false,
        "progress": 0
      }];

      initStats();
      return statuses;
    };

    function initStats() {
      $.each(statuses, function (i, s) {
        s.progress = 0;
        if (s.count === "0") {
          s.unselectable = true;
        }
      });
    }

    var selectedStates = function () {
      var statusTypes = $.map(statuses, function (val, i) {
        if (val.selected === true) {
          return val.stateType;
        }
      });
      return statusTypes;
    };

    var isSelected = function (state) {
      return ($.inArray(state, selectedStates()) !== -1) ? true : false;
    };

    var noneSelected = function () {
      var selected = $.grep(statuses, function (s) {
        return (s.selected === true);
      });
      return !selected.length;
    };

    var updateProgress = function (state) {
      $.grep(statuses, function (s) {
        if (s.stateType == state) {
          s.progress = (s.progress + 1);
        }
      });
    };

    return {
      insertServiceInfo: insertServiceInfo,
      isSelected: isSelected,
      noneSelected: noneSelected,
      initStats: initStats,
      updateProgress: updateProgress
    };
  }

})();
