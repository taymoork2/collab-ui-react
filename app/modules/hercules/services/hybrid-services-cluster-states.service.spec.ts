import { HybridServicesClusterStatesService, IMergedStateSeverity } from 'modules/hercules/services/hybrid-services-cluster-states.service';
import { IConnector } from 'modules/hercules/hybrid-services.types';

describe('Service: HybridServicesClusterStatesService', () => {
  let HybridServicesClusterStatesService: HybridServicesClusterStatesService;

  beforeEach(angular.mock.module('Hercules'));
  beforeEach(inject(dependencies));

  function dependencies(_HybridServicesClusterStatesService_) {
    HybridServicesClusterStatesService = _HybridServicesClusterStatesService_;
  }

  describe('getStateSeverity()', () => {
    it('should accept a connector as argument', () => {
      const connector = createConnector({
        alarms: [],
        state: 'running',
      });
      const severity = HybridServicesClusterStatesService.getStateSeverity(connector);
      expect(severity).toBe(0);
    });

    it('should accept a string (state) as argument', () => {
      const severity = HybridServicesClusterStatesService.getStateSeverity('running');
      expect(severity).toBe(0);
    });

    it('should return 2 for the \'has_warning_alarms\' state', () => {
      const connector = createConnector({
        alarms: [{ severity: 'warning' }, { severity: 'alert' }],
        state: 'running',
      });
      const severity = HybridServicesClusterStatesService.getStateSeverity(connector);
      expect(severity).toBe(2);
    });

    it('should return 3 for the \'has_error_alarms\' state', () => {
      const connector = createConnector({
        alarms: [{ severity: 'critical' }, { severity: 'error' }],
        state: 'running',
      });
      const severity = HybridServicesClusterStatesService.getStateSeverity(connector);
      expect(severity).toBe(3);
    });

    it('should return 1 for the \'no_nodes_registered\' state', () => {
      const aggregatedState = 'no_nodes_registered';
      const severity = HybridServicesClusterStatesService.getStateSeverity(aggregatedState);
      expect(severity).toBe(1);
    });

  });

  describe('getSeverityLabel()', () => {
    it('should return \'ok\' for a severity of 0', () => {
      const label = HybridServicesClusterStatesService.getSeverityLabel(0);
      expect(label).toBe('ok');
    });
  });

  describe('getMergedUpgradeState()', () => {
    it('should upgraded when all connectors are upgraded', () => {
      const connectors: IConnector[] = [
        createConnector({
          alarms: [],
          upgradeState: 'upgraded',
        }),
        createConnector({
          alarms: [],
          upgradeState: 'upgraded',
        }),
      ];
      const state = HybridServicesClusterStatesService.getMergedUpgradeState(connectors);
      expect(state).toBe('upgraded');
    });

    it('should upgrading if at least one connector is pending', () => {
      const connectors: IConnector[] = [
        createConnector({
          alarms: [],
          upgradeState: 'pending',
        }),
        createConnector({
          alarms: [],
          upgradeState: 'upgraded',
        }),
      ];
      const state = HybridServicesClusterStatesService.getMergedUpgradeState(connectors);
      expect(state).toBe('upgrading');
    });
  });

  describe('getMergedStateSeverity()', () => {
    it('should return the most severe state', () => {
      const connectors: IConnector[] = [
        createConnector({
          alarms: [],
          state: 'running',
        }),
        createConnector({
          alarms: [],
          state: 'not_configured',
        }),
        createConnector({
          alarms: [],
          state: 'stopped',
        },
      )];
      const state = HybridServicesClusterStatesService.getMergedStateSeverity(connectors);
      expect(state).toEqual(<IMergedStateSeverity>{
        cssClass: 'danger',
        label: 'error',
        name: 'stopped',
        severity: 3,
      });
    });

    it('should return not_installed when there are not connectors', () => {
      const connectors = [];
      const state = HybridServicesClusterStatesService.getMergedStateSeverity(connectors);
      expect(state).toEqual(<IMergedStateSeverity>{
        cssClass: 'disabled',
        label: 'unknown',
        name: 'not_installed',
        severity: 1,
      });
    });
  });

  function createConnector(params): IConnector {
    return _.extend<IConnector>({}, {
      alarms: [],
      clusterId: '',
      clusterUrl: '',
      connectorType: 'c_mgmt',
      createdAt: '',
      hostSerial: '123',
      hostUrl: '',
      hostname: '123',
      id: '',
      maintenanceMode: 'off',
      runningVersion: '1',
      state: 'running',
      upgradeState: 'upgraded',
      url: '',
    }, params);
  }
});
