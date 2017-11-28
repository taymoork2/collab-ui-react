(function () {
  'use strict';

  function DrilldownReportController($scope, $q, ReportConstants, $timeout, CardUtils) {
    var dd = this;
    dd.gridData = [];
    $scope.gridData = dd.gridData;
    dd.display = false;
    var RESIZE_DELAY_IN_MS = 100;

    dd.$onInit = function () {
      if (dd.props.broadcast) {
        if (dd.props.broadcast.refresh) {
          $scope.$on(dd.props.broadcast.refresh, function () {
            dd.refreshData();
          });
        }

        if (dd.props.broadcast.reset) {
          $scope.$on(dd.props.broadcast.reset, function () {
            dd.resetDrilldownView();
          });
        }
      }
    };

    dd.$doCheck = function () {
      if (dd.props && dd.props.table && dd.props.table.gridOptions && !dd.props.table.gridOptions.onRegisterApi) {
        dd.props.table.gridOptions.onRegisterApi = onRegisterApi;
      }
    };

    function onRegisterApi(gridApi) {
      $scope.gridApi = gridApi;
    }

    dd.toggleDrilldownReport = function () {
      dd.display = !dd.display;
      if (dd.display && $scope.gridData && $scope.gridData.length === 0) {
        dd.refreshData();
      } else {
        CardUtils.resize();
      }
    };

    dd.onGetDataError = function (err) {
      if (_.get(err, 'reason') !== 'filtersChanged') {
        dd.setDataError();
      }
    };

    dd.onGetDataSuccess = function (data) {
      if (!data || data.length === 0) {
        dd.setDataEmpty();
      } else {
        dd.setData(data);
      }
    };

    dd.refreshData = function () {
      dd.setDataRefreshing();
      dd.callback(
        {
          onSuccess: dd.onGetDataSuccess,
          onError: dd.onGetDataError,
        }
      );
    };

    dd.resetDrilldownView = function () {
      dd.setDataEmpty();
      dd.setDisplay(false);
      dd.resetCurrentPage();
    };

    dd.setDisplay = function (bool) {
      dd.display = Boolean(bool);
    };

    dd.isDataError = function () {
      return dd.props.state === ReportConstants.ERROR;
    };

    dd.isDataEmpty = function () {
      return dd.props.state === ReportConstants.EMPTY;
    };

    dd.isDataAvailable = function () {
      return dd.props.state === ReportConstants.SET;
    };

    dd.isDataRefreshing = function () {
      return dd.props.state === ReportConstants.REFRESH;
    };

    dd.setDataEmpty = function () {
      dd.props.state = ReportConstants.EMPTY;
      $scope.gridData = [];
      CardUtils.resize();
    };

    dd.setData = function (data) {
      dd.props.state = ReportConstants.SET;
      $scope.gridData = data;
      CardUtils.resize();
    };

    dd.setDataError = function () {
      dd.props.state = ReportConstants.ERROR;
      $scope.gridData = [];
      CardUtils.resize();
    };

    dd.setDataRefreshing = function () {
      dd.props.state = ReportConstants.REFRESH;
      $scope.gridData = [];
      CardUtils.resize();
    };

    dd.resizeCards = function () {
      CardUtils.resize(RESIZE_DELAY_IN_MS);
    };

    dd.resetCurrentPage = function () {
      dd.props.table.gridOptions.paginationCurrentPage = 1;
    };
  }

  angular.module('Sunlight').component('drilldownReport', {
    controller: DrilldownReportController,
    bindings: {
      props: '<',
      callback: '&',
      gridData: '=?',
    },
    template: require('modules/sunlight/reports/drilldownReport.tpl.html'),
    controllerAs: 'dd',
  }
  );
})();
