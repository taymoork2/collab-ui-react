import serviceModule, { HybridServicesClusterStatesService, IServiceStatusDetails } from 'modules/hercules/services/hybrid-services-cluster-states.service';
import { IConnector } from 'modules/hercules/hybrid-services.types';

describe('Service: HybridServicesClusterStatesService', () => {
  let HybridServicesClusterStatesService: HybridServicesClusterStatesService;

  beforeEach(angular.mock.module(serviceModule));
  beforeEach(inject(dependencies));

  function dependencies(_HybridServicesClusterStatesService_) {
    HybridServicesClusterStatesService = _HybridServicesClusterStatesService_;
  }

  describe('getConnectorStateSeverity()', () => {
    it('should accept a connector as argument', () => {
      const connector = createConnector({
        alarms: [],
        state: 'running',
      });
      const severity = HybridServicesClusterStatesService.getConnectorStateSeverity(connector.state);
      expect(severity).toBe(0);
    });

    it('should return 1 for the \'not_configured\' state', () => {
      const connector = createConnector({
        state: 'not_configured',
      });
      const severity = HybridServicesClusterStatesService.getConnectorStateSeverity(connector.state);
      expect(severity).toBe(1);
    });

    it('should return 2 for the \'initializing\' state', () => {
      const connector = createConnector({
        state: 'initializing',
      });
      const severity = HybridServicesClusterStatesService.getConnectorStateSeverity(connector.state);
      expect(severity).toBe(2);
    });

    it('should return 3 for the \'offline\' state', () => {
      const connector = createConnector({
        state: 'offline',
      });
      const severity = HybridServicesClusterStatesService.getConnectorStateSeverity(connector.state);
      expect(severity).toBe(3);
    });
  });

  describe('getConnectorStateSeverityLabel()', () => {
    it('should return \'ok\' for a severity of 0', () => {
      const label = HybridServicesClusterStatesService.getConnectorStateSeverityLabel(0);
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

  describe('getConnectorStateDetails()', () => { /* TODO */ });

  describe('getServiceStatusDetails()', () => {
    it('should return operational if all connectors are running', () => {
      const connectors = [
        createConnector({
          alarms: [],
          state: 'running',
        }),
        createConnector({
          alarms: [],
          state: 'running',
        }),
        createConnector({
          alarms: [],
          state: 'running',
        },
      )];
      const state = HybridServicesClusterStatesService.getServiceStatusDetails(connectors);
      expect(state).toEqual(<IServiceStatusDetails>{
        cssClass: 'success',
        name: 'operational',
      });
    });

    it('should return impaired when there is a running connector and another offline', () => {
      const connectors = [
        createConnector({
          alarms: [],
          state: 'running',
        }),
        createConnector({
          alarms: [],
          state: 'offline',
        }),
      ];
      const state = HybridServicesClusterStatesService.getServiceStatusDetails(connectors);
      expect(state).toEqual(<IServiceStatusDetails>{
        cssClass: 'warning',
        name: 'impaired',
      });
    });

    it('should return outage when there are no connectors', () => {
      const connectors = [];
      const state = HybridServicesClusterStatesService.getServiceStatusDetails(connectors);
      expect(state).toEqual(<IServiceStatusDetails>{
        cssClass: 'danger',
        name: 'outage',
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
