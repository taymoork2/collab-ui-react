import moduleName from './index';

describe('event history sidepanel', () => {

  beforeEach(function() {
    this.initModules(moduleName);
  });

  it('should show the alarm section and the technical details section when there is an alarm event', function() {
    this.compileComponent('hybridServicesClusterStatusHistorySidepanel', {
      eventItem: {
        type: 'AlarmRaised',
        alarmDetails: {
          alarmId: 'something',
        },
        trackingId: '1234',
      },
    });
    expect(this.view.find('span:contains("hercules.eventHistory.sidepanel.alarmEvents.alarmRaised-description")').length).toBe(1);
    expect(this.view.find('span:contains("hercules.eventHistory.sidepanel.technicalDetails.alarmId")').length).toBe(1);
    expect(this.view.find('span:contains("hercules.eventHistory.sidepanel.technicalDetails.trackingId")').length).toBe(1);
  });

  it('should show the connector section and the technical details section when there is a connector event', function() {
    this.compileComponent('hybridServicesClusterStatusHistorySidepanel', {
      eventItem: {
        type: 'ConnectorStateUpdated',
        connectorStatus: 'running',
        trackingId: '1234',
      },
    });
    expect(this.view.find('span:contains("hercules.eventHistory.sidepanel.connectorEvents.running")').length).toBe(1);
    expect(this.view.find('span:contains("hercules.eventHistory.sidepanel.technicalDetails.trackingId")').length).toBe(1);
  });

  it('should show the cluster section and the technical details section when there is a cluster event', function() {
    this.compileComponent('hybridServicesClusterStatusHistorySidepanel', {
      eventItem: {
        principalType: 'MACHINE',
        type: 'c_ucmcVersion',
        clusterProvisioningDetails: {
          oldValue: '4',
          newValue: '5',
        },
        trackingId: '1234',
      },
    });
    expect(this.view.find('span:contains("hercules.eventHistory.sidepanel.clusterEvents.automatedProvisioningChange")').length).toBe(1);
    expect(this.view.find('span:contains("hercules.eventHistory.sidepanel.technicalDetails.trackingId")').length).toBe(1);
  });

  it('should show the service section and the technical details section when there is a service event', function() {
    this.compileComponent('hybridServicesClusterStatusHistorySidepanel', {
      eventItem: {
        type: 'ServiceEnabled',
        serviceId: 'squared-fusion-uc',
        trackingId: '1234',
      },
    });
    expect(this.view.find('span:contains("hercules.eventHistory.sidepanel.serviceActivationEvents.serviceEnabled")').length).toBe(1);
    expect(this.view.find('span:contains("hercules.eventHistory.sidepanel.technicalDetails.trackingId")').length).toBe(1);
  });

});

