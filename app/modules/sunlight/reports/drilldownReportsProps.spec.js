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

  function assertTableWithVideocall(props) {
    expect(props.table.gridOptions.columnDefs.length).toBe(2);
    expect(props.table.gridOptions.columnDefs[0].width).toBe('60%');
    expect(props.table.gridOptions.columnDefs[1].width).toBe('40%');
  }

  function assertTableWithOutVideocall(props) {
    expect(props.table.gridOptions.columnDefs.length).toBe(2);
    expect(props.table.gridOptions.columnDefs[0].width).toBe('60%');
    expect(props.table.gridOptions.columnDefs[1].width).toBe('40%');
  }

  describe('should get props for Incoming task drill-down', function () {
    it('based on shouldDisplayWebcall value', function () {
      var props = drillDownReportsProps.taskIncomingDrilldownProps({}, true, false, 'chat');
      assertTableWithWebcall(props);
      expect(props.table.gridOptions.columnDefs[1].field).toBe('tasksHandled');
      expect(props.table.gridOptions.columnDefs[2].field).toBe('webcallTasksHandled');

      props = drillDownReportsProps.taskIncomingDrilldownProps({}, false, false, 'chat');
      assertTableWithOutWebcall(props);
      expect(props.table.gridOptions.columnDefs[1].field).toBe('tasksHandled');
    });

    it('based on setStateToEmpty value', function () {
      var props = drillDownReportsProps.taskIncomingDrilldownProps({}, false, false, true, 'chat');
      expect(props.state).toBe('empty');

      props = drillDownReportsProps.taskIncomingDrilldownProps({}, false, false, false, 'chat');
      expect(props.state).toBe('set');
    });
  });

  describe('should get props for Incoming task drill-down for video call', function () {
    it('based on shouldDisplayWebcall value', function () {
      var props = drillDownReportsProps.taskIncomingDrilldownProps({}, false, true, 'webcall');
      assertTableWithVideocall(props);
      expect(props.table.gridOptions.columnDefs[1].field).toBe('webcallTasksHandled');

      props = drillDownReportsProps.taskIncomingDrilldownProps({}, false, false, 'webcall');
      assertTableWithOutVideocall(props);
      expect(props.table.gridOptions.columnDefs[1].field).toBe('tasksHandled');
    });

    it('based on setStateToEmpty value', function () {
      var props = drillDownReportsProps.taskIncomingDrilldownProps({}, false, false, true, 'webcall');
      expect(props.state).toBe('empty');

      props = drillDownReportsProps.taskIncomingDrilldownProps({}, false, false, false, 'webcall');
      expect(props.state).toBe('set');
    });
  });

  describe('should get props for avergae CSAT drill-down', function () {
    it('based on shouldDisplayWebcall value', function () {
      var props = drillDownReportsProps.avgCsatDrilldownProps({}, true, false, 'chat');
      assertTableWithWebcall(props);
      expect(props.table.gridOptions.columnDefs[1].field).toBe('avgCsatScore');
      expect(props.table.gridOptions.columnDefs[2].field).toBe('avgWebcallCsatScore');

      props = drillDownReportsProps.avgCsatDrilldownProps({}, false, false, 'chat');
      assertTableWithOutWebcall(props);
      expect(props.table.gridOptions.columnDefs[1].field).toBe('avgCsatScore');
    });

    it('based on setStateToEmpty value', function () {
      var props = drillDownReportsProps.avgCsatDrilldownProps({}, false, false, true, 'chat');
      expect(props.state).toBe('empty');

      props = drillDownReportsProps.avgCsatDrilldownProps({}, false, false, false, 'chat');
      expect(props.state).toBe('set');
    });
  });

  describe('should get props for avergae CSAT drill-down for video call', function () {
    it('based on shouldDisplayWebcall value', function () {
      var props = drillDownReportsProps.avgCsatDrilldownProps({}, false, true, 'webcall');
      assertTableWithVideocall(props);
      expect(props.table.gridOptions.columnDefs[1].field).toBe('avgWebcallCsatScore');

      props = drillDownReportsProps.avgCsatDrilldownProps({}, false, false, 'webcall');
      assertTableWithOutVideocall(props);
      expect(props.table.gridOptions.columnDefs[1].field).toBe('avgCsatScore');
    });

    it('based on setStateToEmpty value', function () {
      var props = drillDownReportsProps.avgCsatDrilldownProps({}, false, false, true, 'webcall');
      expect(props.state).toBe('empty');

      props = drillDownReportsProps.avgCsatDrilldownProps({}, false, false, false, 'webcall');
      expect(props.state).toBe('set');
    });
  });

  describe('should get props for avg handle time drill-down', function () {
    it('based on shouldDisplayWebcall value', function () {
      var props = drillDownReportsProps.taskTimeDrilldownProps({}, true, false, 'chat');
      assertTableWithWebcall(props);
      expect(props.table.gridOptions.columnDefs[1].field).toBe('avgHandleTime');
      expect(props.table.gridOptions.columnDefs[2].field).toBe('avgWebcallHandleTime');

      props = drillDownReportsProps.taskTimeDrilldownProps({}, false, false, 'chat');
      assertTableWithOutWebcall(props);
      expect(props.table.gridOptions.columnDefs[1].field).toBe('avgHandleTime');
    });

    it('based on setStateToEmpty value', function () {
      var props = drillDownReportsProps.taskTimeDrilldownProps({}, false, false, true, 'chat');
      expect(props.state).toBe('empty');

      props = drillDownReportsProps.taskTimeDrilldownProps({}, false, false, false, 'chat');
      expect(props.state).toBe('set');
    });
  });

  describe('should get props for avg handle time drill-down for video call', function () {
    it('based on shouldDisplayWebcall value', function () {
      var props = drillDownReportsProps.taskTimeDrilldownProps({}, false, true, 'webcall');
      assertTableWithVideocall(props);
      expect(props.table.gridOptions.columnDefs[1].field).toBe('avgWebcallHandleTime');

      props = drillDownReportsProps.taskTimeDrilldownProps({}, false, false, 'webcall');
      assertTableWithOutVideocall(props);
      expect(props.table.gridOptions.columnDefs[1].field).toBe('avgHandleTime');
    });

    it('based on setStateToEmpty value', function () {
      var props = drillDownReportsProps.taskTimeDrilldownProps({}, false, false, true, 'webcall');
      expect(props.state).toBe('empty');

      props = drillDownReportsProps.taskTimeDrilldownProps({}, false, false, false, 'webcall');
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
