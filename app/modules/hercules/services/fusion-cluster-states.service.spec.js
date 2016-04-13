'use strict';

describe('Service: FusionClusterStatesService', function () {
  var FusionClusterStatesService;

  beforeEach(module('Hercules'));
  beforeEach(inject(dependencies));

  function dependencies(_FusionClusterStatesService_) {
    FusionClusterStatesService = _FusionClusterStatesService_;
  }

  describe('getStateSeverity()', function () {
    it('should accept a connector as argument', function () {
      var connector = {
        alarms: [],
        state: 'running'
      };
      var severity = FusionClusterStatesService.getStateSeverity(connector);
      expect(severity).toBe(0);
    });

    it('should accept a string (state) as argument', function () {
      var severity = FusionClusterStatesService.getStateSeverity('running');
      expect(severity).toBe(0);
    });

    it('should return 3 for the \'has_alarms\' state', function () {
      var connector = {
        alarms: [{}],
        state: 'running'
      };
      var severity = FusionClusterStatesService.getStateSeverity(connector);
      expect(severity).toBe(3);
    });
  });

  describe('getSeverityLabel()', function () {
    it('should return \'ok\' for a severity of 0', function () {
      var label = FusionClusterStatesService.getSeverityLabel(0);
      expect(label).toBe('ok');
    });
  });

  describe('getMergedUpgradeState()', function () {
    it('should upgraded when all connectors are upgraded', function () {
      var connectors = [{
        alarms: [],
        upgradeState: 'upgraded'
      }, {
        alarms: [],
        upgradeState: 'upgraded'
      }];
      var state = FusionClusterStatesService.getMergedUpgradeState(connectors);
      expect(state).toBe('upgraded');
    });

    it('should upgrading if at least one connector is pending', function () {
      var connectors = [{
        alarms: [],
        upgradeState: 'pending'
      }, {
        alarms: [],
        upgradeState: 'upgraded'
      }];
      var state = FusionClusterStatesService.getMergedUpgradeState(connectors);
      expect(state).toBe('upgrading');
    });
  });

  describe('getMergedStateSeverity()', function () {
    it('should return the most severe state', function () {
      var connectors = [{
        alarms: [],
        state: 'running'
      }, {
        alarms: [],
        state: 'not_configured'
      }, {
        alarms: [],
        state: 'stopped'
      }];
      var state = FusionClusterStatesService.getMergedStateSeverity(connectors);
      expect(state).toEqual({
        name: 'stopped',
        severity: 3,
        label: 'error',
      });
    });

    it('should return not_installed when there are not connectors', function () {
      var connectors = [];
      var state = FusionClusterStatesService.getMergedStateSeverity(connectors);
      expect(state).toEqual({
        name: 'not_installed',
        severity: 1,
        label: 'unknown',
      });
    });
  });
});
