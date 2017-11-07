'use strict';

describe('DrillDownReportsProps', function () {
  var drillDownReportsProps;

  beforeEach(angular.mock.module('Sunlight'));

  beforeEach(inject(function (_DrillDownReportProps_) {
    drillDownReportsProps = _DrillDownReportProps_;
  }));

  function assertTableWithWebcall(props) {
    expect(props.table.gridOptions.columnDefs.length).toBe(3);
    expect(props.table.gridOptions.columnDefs[0].width).toBe('30%');
    expect(props.table.gridOptions.columnDefs[1].width).toBe('30%');
    expect(props.table.gridOptions.columnDefs[2].width).toBe('40%');
  }

  function assertTableWithOutWebcall(props) {
    expect(props.table.gridOptions.columnDefs.length).toBe(2);
    expect(props.table.gridOptions.columnDefs[0].width).toBe('60%');
    expect(props.table.gridOptions.columnDefs[1].width).toBe('40%');
  }

  it('should get props for Incoming task drill-down', function () {
    var props = drillDownReportsProps.taskIncomingDrilldownProps({}, true, 'chat');
    assertTableWithWebcall(props);
    expect(props.table.gridOptions.columnDefs[1].field).toBe('tasksHandled');
    expect(props.table.gridOptions.columnDefs[2].field).toBe('webcallTasksHandled');

    props = drillDownReportsProps.taskIncomingDrilldownProps({}, false, 'chat');
    assertTableWithOutWebcall(props);
    expect(props.table.gridOptions.columnDefs[1].field).toBe('tasksHandled');
  });

  it('should get props for avergae CSAT drill-down', function () {
    var props = drillDownReportsProps.avgCsatDrilldownProps({}, true, 'chat');
    assertTableWithWebcall(props);
    expect(props.table.gridOptions.columnDefs[1].field).toBe('avgCsatScore');
    expect(props.table.gridOptions.columnDefs[2].field).toBe('avgWebcallCsatScore');

    props = drillDownReportsProps.avgCsatDrilldownProps({}, false, 'chat');
    assertTableWithOutWebcall(props);
    expect(props.table.gridOptions.columnDefs[1].field).toBe('avgCsatScore');
  });

  it('should get props for avg handle time drill-down', function () {
    var props = drillDownReportsProps.taskTimeDrilldownProps({}, true, 'chat');
    assertTableWithWebcall(props);
    expect(props.table.gridOptions.columnDefs[1].field).toBe('avgHandleTime');
    expect(props.table.gridOptions.columnDefs[2].field).toBe('avgWebcallHandleTime');

    props = drillDownReportsProps.taskTimeDrilldownProps({}, false, 'chat');
    assertTableWithOutWebcall(props);
    expect(props.table.gridOptions.columnDefs[1].field).toBe('avgHandleTime');
  });
});
