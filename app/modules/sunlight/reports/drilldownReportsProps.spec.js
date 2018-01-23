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

  describe('should get props for Incoming task drill-down', function () {
    it('based on shouldDisplayWebcall value', function () {
      var props = drillDownReportsProps.taskIncomingDrilldownProps({}, true, 'chat');
      assertTableWithWebcall(props);
      expect(props.table.gridOptions.columnDefs[1].field).toBe('tasksHandled');
      expect(props.table.gridOptions.columnDefs[2].field).toBe('webcallTasksHandled');

      props = drillDownReportsProps.taskIncomingDrilldownProps({}, false, 'chat');
      assertTableWithOutWebcall(props);
      expect(props.table.gridOptions.columnDefs[1].field).toBe('tasksHandled');
    });

    it('based on setStateToEmpty value', function () {
      var props = drillDownReportsProps.taskIncomingDrilldownProps({}, false, true, 'chat');
      expect(props.state).toBe('empty');

      props = drillDownReportsProps.taskIncomingDrilldownProps({}, false, false, 'chat');
      expect(props.state).toBe('set');
    });

  });

  describe('should get props for avergae CSAT drill-down', function () {
    it('based on shouldDisplayWebcall value', function () {
      var props = drillDownReportsProps.avgCsatDrilldownProps({}, true, 'chat');
      assertTableWithWebcall(props);
      expect(props.table.gridOptions.columnDefs[1].field).toBe('avgCsatScore');
      expect(props.table.gridOptions.columnDefs[2].field).toBe('avgWebcallCsatScore');

      props = drillDownReportsProps.avgCsatDrilldownProps({}, false, 'chat');
      assertTableWithOutWebcall(props);
      expect(props.table.gridOptions.columnDefs[1].field).toBe('avgCsatScore');
    });

    it('based on setStateToEmpty value', function () {
      var props = drillDownReportsProps.avgCsatDrilldownProps({}, false, true, 'chat');
      expect(props.state).toBe('empty');

      props = drillDownReportsProps.avgCsatDrilldownProps({}, false, false, 'chat');
      expect(props.state).toBe('set');
    });
  });

  describe('should get props for avg handle time drill-down', function () {
    it('based on shouldDisplayWebcall value', function () {
      var props = drillDownReportsProps.taskTimeDrilldownProps({}, true, 'chat');
      assertTableWithWebcall(props);
      expect(props.table.gridOptions.columnDefs[1].field).toBe('avgHandleTime');
      expect(props.table.gridOptions.columnDefs[2].field).toBe('avgWebcallHandleTime');

      props = drillDownReportsProps.taskTimeDrilldownProps({}, false, 'chat');
      assertTableWithOutWebcall(props);
      expect(props.table.gridOptions.columnDefs[1].field).toBe('avgHandleTime');
    });

    it('based on setStateToEmpty value', function () {
      var props = drillDownReportsProps.taskTimeDrilldownProps({}, false, true, 'chat');
      expect(props.state).toBe('empty');

      props = drillDownReportsProps.taskTimeDrilldownProps({}, false, false, 'chat');
      expect(props.state).toBe('set');
    });
  });

  it('should get props for Offered task drill-down based on setStateToEmpty value', function () {
    var props = drillDownReportsProps.taskOfferedDrilldownProps({}, true, 'chat');
    expect(props.state).toBe('empty');

    props = drillDownReportsProps.taskOfferedDrilldownProps({}, false, 'chat');
    expect(props.state).toBe('set');
  });
});
