(function () {
  'use strict';

  angular.module('Sunlight')
    .service('DrillDownReportProps', drillDownReportProps);

  /* @ngInject */
  function drillDownReportProps($translate, ReportConstants, uiGridConstants) {
    var broadcastRefresh = 'DrilldownReport::Refresh';
    var broadcastReset = 'DrilldownReport::Reset';

    var service = {
      taskIncomingDrilldownProps: taskIncomingDrilldownProps,
      taskOfferedDrilldownProps: taskOfferedDrilldownProps,
      taskTimeDrilldownProps: taskTimeDrilldownProps,
      avgCsatDrilldownProps: avgCsatDrilldownProps,
      broadcastRefresh: broadcastRefresh,
      broadcastReset: broadcastReset,
    };

    return service;

    function taskIncomingDrilldownProps(timeSelected) {
      return {
        broadcast: {
          refresh: broadcastRefresh,
          reset: broadcastReset,
        },
        description: function () {
          return $translate.instant('taskIncoming.drilldownDescription', {
            time: timeSelected().drilldownDescription,
          });
        },
        display: false,
        hasData: true,
        emptyDescription: function () {
          return $translate.instant('taskIncoming.drilldownEmptyDescription', {
            time: timeSelected().drilldownDescription,
          });
        },
        errorDescription: function () {
          return $translate.instant('taskIncoming.drilldownErrorDescription');
        },
        show: function () {
          return $translate.instant('taskIncoming.drilldownShow');
        },
        hide: function () {
          return $translate.instant('taskIncoming.drilldownHide');
        },
        search: true,
        searchPlaceholder: $translate.instant('taskIncoming.drilldownSearchPlaceholder'),
        state: ReportConstants.SET,
        table: {
          columnDefs: [
            {
              field: 'displayName',
              id: 'userName',
              displayName: $translate.instant('taskIncoming.user'),
              width: '60%',
              sortable: true,
              sortDirectionCycle: [uiGridConstants.DESC, uiGridConstants.ASC],
              cellClass: function (grid, row) {
                return getClassName(grid, row);
              },
            }, {
              field: 'tasksHandled',
              id: 'tasksHandled',
              displayName: $translate.instant('taskIncoming.tasksHandled'),
              enableFiltering: false,
              width: '40%',
              sortable: true,
              sort: {
                direction: uiGridConstants.DESC,
              },
              sortDirectionCycle: [uiGridConstants.DESC, uiGridConstants.ASC],
            },
          ],
          gridOptions: {
            rowHeight: 42,
          },
        },
        title: function () {
          return $translate.instant('taskIncoming.drilldownTitle', {
            time: timeSelected().drilldownTitle,
          });
        },
      };
    }

    function taskOfferedDrilldownProps(timeSelected) {
      return {
        broadcast: {
          refresh: broadcastRefresh,
          reset: broadcastReset,
        },
        description: function () {
          return $translate.instant('taskOffered.drilldownDescription', {
            time: timeSelected().drilldownDescription,
          });
        },
        display: false,
        hasData: true,
        emptyDescription: function () {
          return $translate.instant('taskOffered.drilldownEmptyDescription', {
            time: timeSelected().drilldownDescription,
          });
        },
        errorDescription: function () {
          return $translate.instant('taskOffered.drilldownErrorDescription');
        },
        show: function () {
          return $translate.instant('taskOffered.drilldownShow');
        },
        hide: function () {
          return $translate.instant('taskOffered.drilldownHide');
        },
        search: true,
        searchPlaceholder: $translate.instant('taskOffered.drilldownSearchPlaceholder'),
        state: ReportConstants.SET,
        table: {
          columnDefs: [
            {
              field: 'displayName',
              id: 'userName',
              displayName: $translate.instant('taskOffered.user'),
              width: '33%',
              sortable: true,
              sortDirectionCycle: [uiGridConstants.DESC, uiGridConstants.ASC],
              cellClass: function (grid, row) {
                return getClassName(grid, row);
              },
            }, {
              field: 'tasksOffered',
              id: 'tasksOffered',
              displayName: $translate.instant('taskOffered.tasksOffered'),
              enableFiltering: false,
              width: '22%',
              sortable: true,
              sortDirectionCycle: [uiGridConstants.DESC, uiGridConstants.ASC],
            }, {
              field: 'tasksAccepted',
              id: 'tasksAccepted',
              displayName: $translate.instant('taskOffered.tasksAccepted'),
              enableFiltering: false,
              width: '23%',
              sortable: true,
              sort: {
                direction: uiGridConstants.DESC,
              },
              sortDirectionCycle: [uiGridConstants.DESC, uiGridConstants.ASC],
            }, {
              field: 'tasksMissed',
              id: 'tasksMissed',
              displayName: $translate.instant('taskOffered.tasksMissed'),
              enableFiltering: false,
              width: '22%',
              sortable: true,
              sortDirectionCycle: [uiGridConstants.DESC, uiGridConstants.ASC],
            },
          ],
          gridOptions: {
            rowHeight: 42,
          },
        },
        title: function () {
          return $translate.instant('taskOffered.drilldownTitle', {
            time: timeSelected().drilldownTitle,
          });
        },
      };
    }

    function avgCsatDrilldownProps(timeSelected) {
      return {
        broadcast: {
          refresh: broadcastRefresh,
          reset: broadcastReset,
        },
        description: function () {
          return $translate.instant('averageCsat.drilldownDescription', {
            time: timeSelected().drilldownDescription,
          });
        },
        display: false,
        hasData: true,
        emptyDescription: function () {
          return $translate.instant('averageCsat.drilldownEmptyDescription', {
            time: timeSelected().drilldownDescription,
          });
        },
        errorDescription: function () {
          return $translate.instant('averageCsat.drilldownErrorDescription');
        },
        show: function () {
          return $translate.instant('averageCsat.drilldownShow');
        },
        hide: function () {
          return $translate.instant('averageCsat.drilldownHide');
        },
        search: true,
        searchPlaceholder: $translate.instant('averageCsat.drilldownSearchPlaceholder'),
        state: ReportConstants.SET,
        table: {
          columnDefs: [
            {
              field: 'displayName',
              id: 'userName',
              displayName: $translate.instant('averageCsat.user'),
              width: '60%',
              sortable: true,
              sortDirectionCycle: [uiGridConstants.DESC, uiGridConstants.ASC],
              cellClass: function (grid, row) {
                return getClassName(grid, row);
              },
            }, {
              field: 'avgCsatScore',
              id: 'averageCsat',
              displayName: $translate.instant('averageCsat.averageCsat'),
              type: 'string',
              enableFiltering: false,
              width: '40%',
              sortable: true,
              sort: {
                direction: uiGridConstants.DESC,
              },
              sortDirectionCycle: [uiGridConstants.DESC, uiGridConstants.ASC],
            },
          ],
          gridOptions: {
            rowHeight: 42,
          },
        },
        title: function () {
          return $translate.instant('averageCsat.drilldownTitle', {
            time: timeSelected().drilldownTitle,
          });
        },
      };
    }

    function taskTimeDrilldownProps(timeSelected) {
      return {
        broadcast: {
          refresh: broadcastRefresh,
          reset: broadcastReset,
        },
        description: function () {
          return $translate.instant('taskTime.drilldownDescription', {
            time: timeSelected().drilldownDescription,
          });
        },
        display: false,
        hasData: true,
        emptyDescription: function () {
          return $translate.instant('taskTime.drilldownEmptyDescription', {
            time: timeSelected().drilldownDescription,
          });
        },
        errorDescription: function () {
          return $translate.instant('taskTime.drilldownErrorDescription');
        },
        show: function () {
          return $translate.instant('taskTime.drilldownShow');
        },
        hide: function () {
          return $translate.instant('taskTime.drilldownHide');
        },
        search: true,
        searchPlaceholder: $translate.instant('taskTime.drilldownSearchPlaceholder'),
        state: ReportConstants.SET,
        table: {
          columnDefs: [
            {
              field: 'displayName',
              id: 'userName',
              displayName: $translate.instant('taskTime.user'),
              width: '60%',
              sortable: true,
              sortDirectionCycle: [uiGridConstants.DESC, uiGridConstants.ASC],
              cellClass: function (grid, row) {
                return getClassName(grid, row);
              },
            }, {
              field: 'handleTime',
              id: 'handleTime',
              displayName: $translate.instant('taskTime.averageHandleTime'),
              cellFilter: 'careTime',
              enableFiltering: false,
              width: '40%',
              sortable: true,
              sort: {
                direction: uiGridConstants.ASC,
              },
              sortDirectionCycle: [uiGridConstants.DESC, uiGridConstants.ASC],
            },
          ],
          gridOptions: {
            rowHeight: 42,
          },
        },
        title: function () {
          return $translate.instant('taskTime.drilldownTitle', {
            time: timeSelected().drilldownTitle,
          });
        },
      };
    }
  }

  function getClassName(grid, row) {
    var className = '';

    if (row.entity.isError) {
      className = 'ui-grid-ui-error';
    } else if (row.entity.isUserDeleted) {
      className = 'ui-grid-ui-deleted';
    }
    return className;
  }
})();
