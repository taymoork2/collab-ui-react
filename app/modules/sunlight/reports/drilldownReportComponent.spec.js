'use strict';

describe('drilldownReports Controller Positive Test cases', function () {
  var $componentController, $log, ReportConstants, $timeout, CardUtils, $rootScope;
  var $scope, ddController, callbackSpy;
  beforeEach(angular.mock.module('Sunlight'));

  beforeEach(inject(function (_$componentController_, _$log_, _ReportConstants_, _$timeout_, _CardUtils_, _$rootScope_) {
    $componentController = _$componentController_;
    $log = _$log_;
    ReportConstants = _ReportConstants_;
    $timeout = _$timeout_;
    CardUtils = _CardUtils_;
    $rootScope = _$rootScope_;
  }));

  beforeEach(function () {
    var props = {
      broadcast: {
        refresh: 'DummyRefreshString',
        reset: 'DummyResetString',
      },
      description: 'Dummy set Description',
      display: false,
      hasData: true,
      emptyDescription: 'Dummy Empty Description',
      errorDescription: 'DUmmy Error Description',
      show: 'Dummy Show',
      hide: 'Dummy Hide',
      search: true,
      searchPlaceholder: 'Dummy Search Placeholder',
      state: 'SET',
      table: {
        gridOptions: {
          columnDefs: [
            {
              field: 'userName',
              id: 'userName',
              displayName: 'Dummy userName',
              sortable: true,
            }, {
              field: 'csat',
              id: 'averageCsat',
              displayName: 'Dummy Csat',
              sortable: true,
            },
          ],
        },
      },
      title: 'Dummy Title',
    };

    $scope = $rootScope.$new();
    callbackSpy = jasmine.createSpy('getDataCallback');
    ddController = $componentController('drilldownReport', {
      $scope: $scope,
      $log: $log,
      ReportConstants: ReportConstants,
      $timeout: $timeout,
      CardUtils: CardUtils,
    }, {
      props: props,
      callback: callbackSpy,
      gridData: [],
    });
    $log.warn($rootScope);
  });

  afterEach(function () {
    $componentController = $log = ReportConstants = $timeout = CardUtils = $rootScope = $scope = ddController = callbackSpy = undefined;
  });

  it('Binding Props and caallback test', function () {
    $log.warn('Controller......', ddController);
    //props check
    expect(ddController.props.broadcast).toBeDefined();
    expect(ddController.props.broadcast.refresh).toBeDefined();
    expect(ddController.props.broadcast.reset).toBeDefined();
    expect(ddController.props.broadcast.nonExistent).toBeUndefined();
    expect(ddController.props.description).toEqual('Dummy set Description');
    expect(ddController.toggleDrilldownReport).toBeDefined();
    expect(ddController.isDataEmpty()).toBe(false);
    expect(ddController.display).toBe(false);

    //callback check
    ddController.callback();
    expect(callbackSpy).toHaveBeenCalled();
  });

  it('Toggle Drilldown Report test', function () {
    var display = ddController.display;
    ddController.toggleDrilldownReport();
    expect(ddController.display).toBe(!display);
  });

  it('State should be set to empty when onGetDataSuccess is called with 0 records', function () {
    ddController.onGetDataSuccess([]);
    expect(ddController.isDataEmpty()).toBe(true);
  });

  it('State should be set to SET when onGetDataSuccess is called with >0 records', function () {
    ddController.onGetDataSuccess([1, 2, 3]);
    expect(ddController.isDataAvailable()).toBe(true);
  });

  it('State should be set to Errored when onGetDataError is called', function () {
    ddController.onGetDataError();
    expect(ddController.isDataError()).toBe(true);
  });

  it('Should trigger the data callback when toggle display is set to true', function () {
    ddController.toggleDrilldownReport();
    expect(callbackSpy).toHaveBeenCalled();
  });

  it('Should not trigger data callback when toggle display while data exists', function () {
    ddController.onGetDataSuccess([1, 2, 3]);
    ddController.toggleDrilldownReport();
    expect(callbackSpy).not.toHaveBeenCalled();
  });

  it('on change of props attribute, should set onRegisterApi attribute of gridOptions', function () {
    expect(ddController.props.table.gridOptions.onRegisterApi).not.toBeDefined();
    ddController.$doCheck();
    expect(ddController.props.table.gridOptions.onRegisterApi).toBeDefined();
  });
});
