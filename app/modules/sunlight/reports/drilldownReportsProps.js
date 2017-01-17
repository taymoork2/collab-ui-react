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
      taskTimeDrilldownProps: taskTimeDrilldownProps,
      avgCsatDrilldownProps: avgCsatDrilldownProps,
      broadcastRefresh: broadcastRefresh,
      broadcastReset: broadcastReset
    };

    return service;

    function taskIncomingDrilldownProps(timeSelected) {
      return {
        broadcast: {
          refresh: broadcastRefresh,
          reset: broadcastReset
        },
        description: function () {
          return $translate.instant('taskIncoming.drilldownDescription', {
            time: timeSelected().drilldownDescription
          });
        },
        display: false,
        hasData: true,
        emptyDescription: function () {
          return $translate.instant('taskIncoming.drilldownEmptyDescription', {
            interval: timeSelected().intervalTxt
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
              sortDirectionCycle: [uiGridConstants.DESC, uiGridConstants.ASC]
            }, {
              field: 'contactsHandled',
              id: 'contactsHandled',
              displayName: $translate.instant('taskIncoming.contactsHandled'),
              enableFiltering: false,
              width: '40%',
              sortable: true,
              sort: {
                direction: uiGridConstants.DESC
              },
              sortDirectionCycle: [uiGridConstants.DESC, uiGridConstants.ASC]
            }
          ],
          gridOptions: {
            rowHeight: 42
          }
        },
        title: function () {
          return $translate.instant('taskIncoming.drilldownTitle', {
            time: timeSelected().drilldownTitle
          });
        }
      };
    }

    function avgCsatDrilldownProps(timeSelected) {
      return {
        broadcast: {
          refresh: broadcastRefresh,
          reset: broadcastReset
        },
        description: function () {
          return $translate.instant('averageCsat.drilldownDescription', {
            time: timeSelected().drilldownDescription
          });
        },
        display: false,
        hasData: true,
        emptyDescription: function () {
          return $translate.instant('averageCsat.drilldownEmptyDescription', {
            interval: timeSelected().intervalTxt
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
              sortDirectionCycle: [uiGridConstants.DESC, uiGridConstants.ASC]
            }, {
              field: 'avgCsatScore',
              id: 'averageCsat',
              displayName: $translate.instant('averageCsat.averageCsat'),
              type: 'string',
              enableFiltering: false,
              width: '40%',
              sortable: true,
              sort: {
                direction: uiGridConstants.DESC
              },
              sortDirectionCycle: [uiGridConstants.DESC, uiGridConstants.ASC]
            }
          ],
          gridOptions: {
            rowHeight: 42
          }
        },
        title: function () {
          return $translate.instant('averageCsat.drilldownTitle', {
            time: timeSelected().drilldownTitle
          });
        }
      };
    }

    function taskTimeDrilldownProps(timeSelected) {
      return {
        broadcast: {
          refresh: broadcastRefresh,
          reset: broadcastReset
        },
        description: function () {
          return $translate.instant('taskTime.drilldownDescription', {
            time: timeSelected().drilldownDescription
          });
        },
        display: false,
        hasData: true,
        emptyDescription: function () {
          return $translate.instant('taskTime.drilldownEmptyDescription', {
            interval: timeSelected().intervalTxt
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
              sortDirectionCycle: [uiGridConstants.DESC, uiGridConstants.ASC]
            }, {
              field: 'handleTime',
              id: 'handleTime',
              displayName: $translate.instant('taskTime.averageHandleTime'),
              cellFilter: 'careTime',
              enableFiltering: false,
              width: '40%',
              sortable: true,
              sort: {
                direction: uiGridConstants.ASC
              },
              sortDirectionCycle: [uiGridConstants.DESC, uiGridConstants.ASC]
            }
          ],
          gridOptions: {
            rowHeight: 42
          }
        },
        title: function () {
          return $translate.instant('taskTime.drilldownTitle', {
            time: timeSelected().drilldownTitle
          });
        }
      };
    }
  }
})();
