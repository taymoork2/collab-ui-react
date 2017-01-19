/**
 * Created by bijnair on 06/01/17.
 */
(function () {
  'use strict';

  function DrilldownReportController($scope, $q, ReportConstants, $timeout, CardUtils) {

    var dd = this;
    dd.gridData = [];
    $scope.gridData = dd.gridData;

    dd.$onInit = function () {

      var defaultProps = {
        broadcast: {},
        description: '',
        display: false,
        hasData: false,
        emptyDescription: '',
        errorDescription: '',
        show: '',
        hide: '',
        search: '',
        searchPlaceholder: '',
        state: ReportConstants.EMPTY,
        table: {
          columnDefs: [],
          gridOptions: {
            data: 'gridData',
            multiSelect: false,
            enableRowHeaderSelection: false,
            enableColumnResize: true,
            enableSorting: true,
            enableFiltering: true,
            enableColumnMenus: false,
            enableHorizontalScrollbar: 0,
            enableVerticalScrollbar: 0,
            onRegisterApi: onRegisterApi,
            columnDefs: dd.props.table.columnDefs
          }
        },
        title: ''
      };

      dd.props = _.merge(defaultProps, dd.props);

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

    function onRegisterApi(gridApi) {
      $scope.gridApi = gridApi;
    }

    dd.toggleDrilldownReport = function () {
      dd.props.display = !dd.props.display;
      if (dd.display() && $scope.gridData && $scope.gridData.length === 0) {
        dd.refreshData();
      } else {
        CardUtils.resize();
      }
    };

    dd.onGetDataError = function () {
      dd.setDataError();
      return $q.reject();
    };

    dd.onGetDataSuccess = function (data) {
      if (!data || data.length === 0) {
        dd.setDataEmpty();
      } else {
        dd.setData(data);
      }
      return $q.resolve(data);
    };

    dd.refreshData = function () {
      dd.setDataRefreshing();
      dd.callback(
        {
          onSuccess: dd.onGetDataSuccess,
          onError: dd.onGetDataError
        }
      );
    };

    dd.resetDrilldownView = function () {
      dd.setDataEmpty();
      dd.setDisplay(false);
    };

    dd.display = function () {
      return dd.props.display;
    };

    dd.setDisplay = function (bool) {
      dd.props.display = Boolean(bool);
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

  }

  angular.module('Core').component('drilldownReport', {
    controller: DrilldownReportController,
    bindings: {
      props: '=',
      callback: '&',
      gridData: '=?'
    },
    templateUrl: 'modules/sunlight/reports/drilldownReport.tpl.html',
    controllerAs: 'dd'
  }
  );

})();
