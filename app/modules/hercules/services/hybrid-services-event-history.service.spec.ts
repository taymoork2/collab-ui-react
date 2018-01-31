import moduleName, { IHybridServicesEventHistoryData } from './hybrid-services-event-history.service';

describe('HybridServicesEventHistoryService', () => {

  beforeEach(angular.mock.module(moduleName));

  describe('API usage', () => {

    let HybridServicesClusterService, HybridServicesEventHistoryService;
    let $httpBackend: ng.IHttpBackendService;

    const clusterId = 'something';
    const orgId = 'some other thing';
    const timestamp = 'a third thing';
    const userId = 'some user ID';
    beforeEach(inject(dependencies));

    function dependencies(_$httpBackend_, _HybridServicesClusterService_, _HybridServicesEventHistoryService_) {
      $httpBackend = _$httpBackend_;
      HybridServicesClusterService = _HybridServicesClusterService_;
      HybridServicesEventHistoryService = _HybridServicesEventHistoryService_;
    }

    afterEach(() => {
      $httpBackend.flush();
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    const resourceGroupEvent = {
      context: {
        principalType: 'PERSON',
        principalId: userId,
      },
      payload: {
        type: 'ClusterUpdated',
        resourceGroupId: '1',
        oldResourceGroupId: '2',
      },
    };

    const clusterNameChangeEvent = {
      context: {
        principalType: 'PERSON',
        principalId: userId,
      },
      payload: {
        type: 'ClusterUpdated',
        name: '1',
        oldName: '2',
      },
    };

    it('should take clusterId, orgId, timestamp, and userIds into account when getting data, and use five different APIs', () => {

      $httpBackend
        .expectGET(`https://hercules-intb.ciscospark.com/hercules/api/v2/organizations/${orgId}/events/?clusterId=${clusterId}&fromTime=${timestamp}`)
        .respond( {
          items: [resourceGroupEvent],
        });

      $httpBackend
        .expectGET(`https://hercules-intb.ciscospark.com/hercules/api/v2/organizations/${orgId}/events/?type=ServiceEnabled&type=ServiceDisabled&fromTime=${timestamp}`)
        .respond( { some: 'other data' });

      $httpBackend
        .expectGET(`https://hercules-intb.ciscospark.com/hercules/api/v2/organizations/null?fields=@wide`)
        .respond( { some: 'stuff' });

      $httpBackend
        .expectGET(`https://hercules-intb.ciscospark.com/hercules/api/v2/organizations/null/resourceGroups`)
        .respond( { some: 'data' });

      $httpBackend
        .expectGET(`https://identity.webex.com/identity/scim/null/v1/Users/${userId}`)
        .respond( { some: 'user data' });

      HybridServicesEventHistoryService.getAllEvents(clusterId, orgId, timestamp);
    });

    it('should not do the check for resource group names if there are no resource group related events', () => {

      $httpBackend
        .expectGET(`https://hercules-intb.ciscospark.com/hercules/api/v2/organizations/${orgId}/events/?clusterId=${clusterId}&fromTime=${timestamp}`)
        .respond( {
          items: [clusterNameChangeEvent],
        });

      $httpBackend
        .expectGET(`https://hercules-intb.ciscospark.com/hercules/api/v2/organizations/${orgId}/events/?type=ServiceEnabled&type=ServiceDisabled&fromTime=${timestamp}`)
        .respond( { some: 'xxx' });

      $httpBackend
        .expectGET(`https://hercules-intb.ciscospark.com/hercules/api/v2/organizations/null?fields=@wide`)
        .respond( { some: 'yyy' });

      $httpBackend
        .expectGET(`https://identity.webex.com/identity/scim/null/v1/Users/${userId}`)
        .respond( { some: 'zzz' });

      HybridServicesClusterService.clearCache();
      HybridServicesEventHistoryService.getAllEvents(clusterId, orgId, timestamp);
    });

  });

  describe('handling the different event types', () => {
    let $httpBackend, HybridServicesEventHistoryService, HybridServicesI18NService;
    beforeEach(inject(dependencies));

    function dependencies(_$httpBackend_, _$rootScope_, _HybridServicesEventHistoryService_, _HybridServicesI18NService_) {
      $httpBackend = _$httpBackend_;
      HybridServicesEventHistoryService = _HybridServicesEventHistoryService_;
      HybridServicesI18NService = _HybridServicesI18NService_;
    }

    const processEvents = (events, processResourceGroups = false): ng.IPromise<IHybridServicesEventHistoryData> => {
      $httpBackend
        .expectGET(`https://hercules-intb.ciscospark.com/hercules/api/v2/organizations/null/events/?clusterId=&fromTime=time`)
        .respond( {
          items: events,
        });
      if (processResourceGroups) {
        $httpBackend
          .expectGET(`https://hercules-intb.ciscospark.com/hercules/api/v2/organizations/null/resourceGroups`)
          .respond( { some: 'data' });
      }
      return HybridServicesEventHistoryService.getAllEvents('', '', 'time');
    };

    describe('alarm events', () => {

      it('should process AlarmRaised events', (done) => {
        const expectedSeverity = 'critical';
        const expectedTitle = 'Caution: The French Republic is in danger!';
        const expectedDescription = 'We blame the generation of 68!';
        const alarmId = '1234';
        const raisedAt = '5678';

        const alarmRaisedEvent = {
          context: {
            principalType: 'MACHINE',
          },
          payload: {
            type: 'AlarmRaised',
            severity: expectedSeverity,
            title: expectedTitle,
            alarmId: alarmId,
            raisedAt: raisedAt,
            description: expectedDescription,
          },
        };

        processEvents([alarmRaisedEvent])
          .then((data) => {
            expect(data.items[0].type).toBe('AlarmRaised');
            expect(data.items[0].severity).toBe(expectedSeverity);
            expect(data.items[0].alarmDetails).toEqual(jasmine.objectContaining({
              title: expectedTitle,
              description: expectedDescription,
              raisedAt: raisedAt,
              alarmId: alarmId,
            }));
            done();
          });
        $httpBackend.flush();
      });

      it('should process AlarmResolved events', (done) => {
        const originalSeverity = 'critical';
        const expectedTitle = 'de Gaulle to the rescue!';
        const expectedDescription = 'The rebels have been crushed!';
        const alarmId = '1234';
        const raisedAt = '5678';

        const alarmResolvedEvent = {
          context: {
            principalType: 'MACHINE',
          },
          payload: {
            type: 'AlarmResolved',
            oldSeverity: originalSeverity,
            title: expectedTitle,
            alarmId: alarmId,
            raisedAt: raisedAt,
            description: expectedDescription,
          },
        };

        processEvents([alarmResolvedEvent])
          .then((data) => {
            expect(data.items[0].type).toBe('AlarmResolved');
            expect(data.items[0].severity).toBe('RESOLVED');
            expect(data.items[0].alarmDetails).toEqual(jasmine.objectContaining({
              title: expectedTitle,
              description: expectedDescription,
              raisedAt: raisedAt,
              alarmId: alarmId,
            }));
            done();
          });
        $httpBackend.flush();
      });

      it('should process AlarmDebounced events', (done) => {
        const originalSeverity = 'critical';
        const expectedTitle = 'Let them eat brioche!';
        const expectedDescription = 'Why did we not think of that when we could not afford bread?';
        const alarmId = '1234';
        const raisedAt = '5678';

        const alarmDebouncedEvent = {
          context: {
            principalType: 'MACHINE',
          },
          payload: {
            type: 'AlarmDebounced',
            severity: originalSeverity,
            title: expectedTitle,
            alarmId: alarmId,
            raisedAt: raisedAt,
            description: expectedDescription,
          },
        };

        processEvents([alarmDebouncedEvent])
          .then((data) => {
            expect(data.items[0].type).toBe('AlarmDebounced');
            expect(data.items[0].severity).toBe('IGNORED');
            expect(data.items[0].alarmDetails).toEqual(jasmine.objectContaining({
              title: expectedTitle,
              description: expectedDescription,
              raisedAt: raisedAt,
              alarmId: alarmId,
            }));
            done();
          });
        $httpBackend.flush();
      });

      it('should process AlarmRaisedNotificationSent events', (done) => {
        const originalSeverity = 'critical';
        const expectedTitle = '[ww2] Help us, Americans…';
        const expectedDescription = 'France has fallen, could you help liberate us plz?';
        const alarmId = '1234';
        const raisedAt = '5678';
        const recipientCount = 888;

        const alarmDebouncedEvent = {
          context: {
            principalType: 'MACHINE',
          },
          payload: {
            type: 'AlarmRaisedNotificationSent',
            severity: originalSeverity,
            title: expectedTitle,
            alarmId: alarmId,
            raisedAt: raisedAt,
            description: expectedDescription,
            recipientCount: recipientCount,
          },
        };

        processEvents([alarmDebouncedEvent])
          .then((data) => {
            expect(data.items[0].type).toBe('AlarmRaisedNotificationSent');
            expect(data.items[0].severity).toBe('alert');
            expect(data.items[0].alarmDetails).toEqual(jasmine.objectContaining({
              title: expectedTitle,
              description: expectedDescription,
              raisedAt: raisedAt,
              alarmId: alarmId,
              recipientCount: recipientCount,
            }));
            done();
          });
        $httpBackend.flush();
      });

      it('should process AlarmResolvedNotificationSent events', (done) => {
        const originalSeverity = 'critical';
        const expectedTitle = '1966: Withdrawing all French troops from the NATO command structure…';
        const expectedDescription = 'But we might rejoin in 2009!';
        const alarmId = '1234';
        const raisedAt = '5678';
        const recipientCount = 777;

        const alarmDebouncedEvent = {
          context: {
            principalType: 'MACHINE',
          },
          payload: {
            type: 'AlarmResolvedNotificationSent',
            severity: originalSeverity,
            title: expectedTitle,
            alarmId: alarmId,
            raisedAt: raisedAt,
            description: expectedDescription,
            recipientCount: recipientCount,
          },
        };

        processEvents([alarmDebouncedEvent])
          .then((data) => {
            expect(data.items[0].type).toBe('AlarmResolvedNotificationSent');
            expect(data.items[0].severity).toBe('alert');
            expect(data.items[0].alarmDetails).toEqual(jasmine.objectContaining({
              title: expectedTitle,
              description: expectedDescription,
              raisedAt: raisedAt,
              alarmId: alarmId,
              recipientCount: recipientCount,
            }));
            done();
          });
        $httpBackend.flush();
      });

    });

    describe('cluster events', () => {

      it ('should process c_ucmc target version changes', (done) => {
        const clusterEvent = {
          context: {
            principalType: 'PERSON',
          },
          payload: {
            type: 'ClusterUpdated',
            softwareVersions: {
              c_ucmc: '2',
            },
            oldSoftwareVersions: {
              c_ucmc: '1',
            },
          },
        };

        processEvents([clusterEvent])
          .then((data) => {
            expect(data.items[0].type).toBe('c_ucmcVersion');
            expect(data.items[0].connectorType).toBe('c_ucmc');
            expect(data.items[0].severity).toBe('NONE');
            expect(data.items[0].title).toBe('hercules.eventHistory.connectorProvisioningChanged');
            expect(data.items[0].clusterProvisioningDetails).toEqual(jasmine.objectContaining({
              oldValue: '1',
              newValue: '2',
            }));
            done();
          });
        $httpBackend.flush();
      });

      it ('should process c_cal target version changes', (done) => {
        const clusterEvent = {
          context: {
            principalType: 'PERSON',
          },
          payload: {
            type: 'ClusterUpdated',
            softwareVersions: {
              c_cal: '2',
            },
            oldSoftwareVersions: {
              c_cal: '1',
            },
          },
        };

        processEvents([clusterEvent])
          .then((data) => {
            expect(data.items[0].type).toBe('c_calVersion');
            expect(data.items[0].connectorType).toBe('c_cal');
            expect(data.items[0].severity).toBe('NONE');
            expect(data.items[0].title).toBe('hercules.eventHistory.connectorProvisioningChanged');
            expect(data.items[0].clusterProvisioningDetails).toEqual(jasmine.objectContaining({
              oldValue: '1',
              newValue: '2',
            }));
            done();
          });
        $httpBackend.flush();
      });

      it ('should process c_mgmt target version changes', (done) => {
        const clusterEvent = {
          context: {
            principalType: 'PERSON',
          },
          payload: {
            type: 'ClusterUpdated',
            softwareVersions: {
              c_mgmt: '2',
            },
            oldSoftwareVersions: {
              c_mgmt: '1',
            },
          },
        };

        processEvents([clusterEvent])
          .then((data) => {
            expect(data.items[0].type).toBe('c_mgmtVersion');
            expect(data.items[0].connectorType).toBe('c_mgmt');
            expect(data.items[0].severity).toBe('NONE');
            expect(data.items[0].title).toBe('hercules.eventHistory.connectorProvisioningChanged');
            expect(data.items[0].clusterProvisioningDetails).toEqual(jasmine.objectContaining({
              oldValue: '1',
              newValue: '2',
            }));
            done();
          });
        $httpBackend.flush();
      });

      it ('should process c_imp target version changes', (done) => {
        const clusterEvent = {
          context: {
            principalType: 'PERSON',
          },
          payload: {
            type: 'ClusterUpdated',
            softwareVersions: {
              c_imp: '2',
            },
            oldSoftwareVersions: {
              c_imp: '1',
            },
          },
        };

        processEvents([clusterEvent])
          .then((data) => {
            expect(data.items[0].type).toBe('c_impVersion');
            expect(data.items[0].connectorType).toBe('c_imp');
            expect(data.items[0].severity).toBe('NONE');
            expect(data.items[0].title).toBe('hercules.eventHistory.connectorProvisioningChanged');
            expect(data.items[0].clusterProvisioningDetails).toEqual(jasmine.objectContaining({
              oldValue: '1',
              newValue: '2',
            }));
            done();
          });
        $httpBackend.flush();
      });

      it ('should process upgrade schedule changes', (done) => {
        spyOn(HybridServicesI18NService, 'formatTimeAndDate').and.callFake((schedule) => {
          if (schedule === 'something') {
            return 'new schedule!';
          } else {
            return 'the old schedule';
          }
        });
        const clusterEvent = {
          context: {
            principalType: 'PERSON',
          },
          payload: {
            type: 'ClusterUpdated',
            upgradeSchedule: 'something',
            oldUpgradeSchedule: 'some old schedule',
          },
        };

        processEvents([clusterEvent])
          .then((data) => {
            expect(data.items[0].type).toBe('UpgradeSchedule');
            expect(data.items[0].connectorType).toBe('all');
            expect(data.items[0].severity).toBe('NONE');
            expect(data.items[0].title).toBe('hercules.eventHistory.newUpgradeSchedule');
            expect(data.items[0].clusterProvisioningDetails).toEqual(jasmine.objectContaining({
              newValue: 'new schedule!, undefined. hercules.clusterHistoryTable.urgentUpgrades: undefined',
              oldValue: 'the old schedule, undefined. hercules.clusterHistoryTable.urgentUpgrades: undefined',
            }));
            done();
          });
        $httpBackend.flush();
      });

      it ('should process release channel changes', (done) => {
        const clusterEvent = {
          context: {
            principalType: 'PERSON',
          },
          payload: {
            type: 'ClusterUpdated',
            releaseChannel: 'beta',
            oldReleaseChannel: 'stable',
          },
        };

        processEvents([clusterEvent])
          .then((data) => {
            expect(data.items[0].type).toBe('releaseChannelChanged');
            expect(data.items[0].connectorType).toBe('all');
            expect(data.items[0].severity).toBe('NONE');
            expect(data.items[0].title).toBe('hercules.eventHistory.releaseChannelChanged');
            expect(data.items[0].clusterProvisioningDetails).toEqual(jasmine.objectContaining({
              newValue: 'beta',
              oldValue: 'stable',
            }));
            done();
          });
        $httpBackend.flush();
      });

      it ('should process resource group changes', (done) => {
        const clusterEvent = {
          context: {
            principalType: 'PERSON',
          },
          payload: {
            type: 'ClusterUpdated',
            resourceGroupId: '1234',
            oldResourceGroupId: '7788',
          },
        };

        processEvents([clusterEvent], true)
          .then((data) => {
            expect(data.items[0].type).toBe('resourceGroupChanged');
            expect(data.items[0].connectorType).toBe('all');
            expect(data.items[0].severity).toBe('NONE');
            expect(data.items[0].title).toBe('hercules.eventHistory.resourceGroupChanged');
            expect(data.items[0].clusterProvisioningDetails).toEqual(jasmine.objectContaining({
              newValue: '1234',
              oldValue: '7788',
            }));
            done();
          });
        $httpBackend.flush();
      });

      it ('should process cluster name changes', (done) => {
        const clusterEvent = {
          context: {
            principalType: 'PERSON',
          },
          payload: {
            type: 'ClusterUpdated',
            name: 'Paris',
            oldName: 'Lutetia',
          },
        };

        processEvents([clusterEvent], true)
          .then((data) => {
            expect(data.items[0].type).toBe('clusterRenamed');
            expect(data.items[0].connectorType).toBe('all');
            expect(data.items[0].severity).toBe('NONE');
            expect(data.items[0].title).toBe('hercules.eventHistory.clusterRenamed');
            expect(data.items[0].clusterProvisioningDetails).toEqual(jasmine.objectContaining({
              newValue: 'Paris',
              oldValue: 'Lutetia',
            }));
            done();
          });
        $httpBackend.flush();
      });

      it ('should process some single events into multiple, because that is how we get them from the backend', (done) => {
        const clusterEvent = {
          context: {
            principalType: 'PERSON',
          },
          payload: {
            type: 'ClusterUpdated',
            name: 'Durocortorum',
            oldName: 'Reims',
            resourceGroupId: '3',
            oldResourceGroupId: '4',
            releaseChannel: 'stable',
            oldReleaseChannel: 'latest',
          },
        };

        processEvents([clusterEvent], true)
          .then((data) => {
            expect(data.items[0].type).toBe('clusterRenamed');
            expect(data.items[1].type).toBe('resourceGroupChanged');
            expect(data.items[2].type).toBe('releaseChannelChanged');
            done();
          });
        $httpBackend.flush();
      });
    });

    describe('service events', () => {

      const processServiceEvents = (events): ng.IPromise<IHybridServicesEventHistoryData> => {
        $httpBackend
          .expectGET(`https://hercules-intb.ciscospark.com/hercules/api/v2/organizations/null/events/?clusterId=&fromTime=time`)
          .respond( {
            items: [],
          });
        $httpBackend
          .expectGET(`https://hercules-intb.ciscospark.com/hercules/api/v2/organizations/null/events/?type=ServiceEnabled&type=ServiceDisabled&fromTime=time`)
          .respond( {
            items: events,
          });
        $httpBackend
          .expectGET(`https://hercules-intb.ciscospark.com/hercules/api/v2/organizations/null?fields=@wide`)
          .respond( { some: 'stuff' });

        return HybridServicesEventHistoryService.getAllEvents('', '', 'time');
      };

      it('should process ServiceEnabled events', (done) => {
        const serviceEvent = {
          context: {
            principalType: 'PERSON',
          },
          payload: {
            type: 'ServiceEnabled',
            serviceId: 'squared-fusion-uc',
          },
        };

        processServiceEvents([serviceEvent])
          .then((data) => {
            expect(data.items[0].type).toBe('ServiceEnabled');
            expect(data.items[0].connectorType).toBe('c_ucmc');
            expect(data.items[0].resourceName).toBe('hercules.eventHistory.allResources');
            expect(data.items[0].severity).toBe('NONE');
            expect(data.items[0].title).toBe('hercules.eventHistory.serviceEnabled');
            done();
          });
        $httpBackend.flush();
      });

      it('should process ServiceDisabled events', (done) => {
        const serviceEvent = {
          context: {
            principalType: 'PERSON',
          },
          payload: {
            type: 'ServiceDisabled',
            serviceId: 'squared-fusion-cal',
          },
        };

        processServiceEvents([serviceEvent])
          .then((data) => {
            expect(data.items[0].type).toBe('ServiceDisabled');
            expect(data.items[0].connectorType).toBe('c_cal');
            expect(data.items[0].resourceName).toBe('hercules.eventHistory.allResources');
            expect(data.items[0].severity).toBe('NONE');
            expect(data.items[0].title).toBe('hercules.eventHistory.serviceDisabled');
            done();
          });
        $httpBackend.flush();
      });

    });

    describe('connector events', () => {

      const processConnectorEvents = (events): ng.IPromise<IHybridServicesEventHistoryData> => {
        $httpBackend
          .expectGET(`https://hercules-intb.ciscospark.com/hercules/api/v2/organizations/null/events/?clusterId=&fromTime=time`)
          .respond( {
            items: events,
          });
        $httpBackend
          .expectGET(`https://hercules-intb.ciscospark.com/hercules/api/v2/organizations/null/events/?type=ServiceEnabled&type=ServiceDisabled&fromTime=time`)
          .respond( {
            items: [],
          });

        return HybridServicesEventHistoryService.getAllEvents('', '', 'time');
      };

      it('should handle downloading connectors', (done) => {
        const connectorEvent = {
          context: {
            principalType: 'MACHINE',
          },
          payload: {
            type: 'ConnectorStateUpdated',
            connectorType: 'c_mgmt',
            currentState: {
              hostname: 'foobar.example.org',
              state: 'downloading',
            },
          },
        };
        processConnectorEvents([connectorEvent])
          .then((data) => {
            expect(data.items[0].type).toBe('ConnectorStateUpdated');
            expect(data.items[0].connectorStatus).toBe('downloading');
            expect(data.items[0].connectorType).toBe('c_mgmt');
            expect(data.items[0].resourceName).toBe('foobar.example.org');
            expect(data.items[0].severity).toBe('NONE');
            expect(data.items[0].title).toBe('hercules.eventHistory.connectorEventTitles.downloading');
            done();
          });
        $httpBackend.flush();
      });

      it('should handle installing connectors', (done) => {
        const connectorEvent = {
          context: {
            principalType: 'MACHINE',
          },
          payload: {
            type: 'ConnectorStateUpdated',
            connectorType: 'c_ucmc',
            currentState: {
              hostname: 'foobar.example.org',
              state: 'installing',
            },
          },
        };
        processConnectorEvents([connectorEvent])
          .then((data) => {
            expect(data.items[0].type).toBe('ConnectorStateUpdated');
            expect(data.items[0].connectorStatus).toBe('installing');
            expect(data.items[0].connectorType).toBe('c_ucmc');
            expect(data.items[0].resourceName).toBe('foobar.example.org');
            expect(data.items[0].severity).toBe('NONE');
            expect(data.items[0].title).toBe('hercules.eventHistory.connectorEventTitles.installing');
            done();
          });
        $httpBackend.flush();
      });

      it('should handle not_installed connectors', (done) => {
        const connectorEvent = {
          context: {
            principalType: 'MACHINE',
          },
          payload: {
            type: 'ConnectorStateUpdated',
            connectorType: 'c_imp',
            currentState: {
              hostname: 'foobar.example.org',
              state: 'not_installed',
            },
          },
        };
        processConnectorEvents([connectorEvent])
          .then((data) => {
            expect(data.items[0].type).toBe('ConnectorStateUpdated');
            expect(data.items[0].connectorStatus).toBe('not_installed');
            expect(data.items[0].connectorType).toBe('c_imp');
            expect(data.items[0].resourceName).toBe('foobar.example.org');
            expect(data.items[0].severity).toBe('NONE');
            expect(data.items[0].title).toBe('hercules.eventHistory.connectorEventTitles.not_installed');
            done();
          });
        $httpBackend.flush();
      });

      it('should handle not_configured connectors', (done) => {
        const connectorEvent = {
          context: {
            principalType: 'MACHINE',
          },
          payload: {
            type: 'ConnectorStateUpdated',
            connectorType: 'c_cal',
            currentState: {
              hostname: 'foobar.example.org',
              state: 'not_configured',
            },
          },
        };
        processConnectorEvents([connectorEvent])
          .then((data) => {
            expect(data.items[0].type).toBe('ConnectorStateUpdated');
            expect(data.items[0].connectorStatus).toBe('not_configured');
            expect(data.items[0].connectorType).toBe('c_cal');
            expect(data.items[0].resourceName).toBe('foobar.example.org');
            expect(data.items[0].severity).toBe('NONE');
            expect(data.items[0].title).toBe('hercules.eventHistory.connectorEventTitles.not_configured');
            done();
          });
        $httpBackend.flush();
      });

      it('should handle disabled connectors', (done) => {
        const connectorEvent = {
          context: {
            principalType: 'MACHINE',
          },
          payload: {
            type: 'ConnectorStateUpdated',
            connectorType: 'c_mgmt',
            currentState: {
              hostname: 'foobar.example.org',
              state: 'disabled',
            },
          },
        };
        processConnectorEvents([connectorEvent])
          .then((data) => {
            expect(data.items[0].type).toBe('ConnectorStateUpdated');
            expect(data.items[0].connectorStatus).toBe('disabled');
            expect(data.items[0].connectorType).toBe('c_mgmt');
            expect(data.items[0].resourceName).toBe('foobar.example.org');
            expect(data.items[0].severity).toBe('NONE');
            expect(data.items[0].title).toBe('hercules.eventHistory.connectorEventTitles.disabled');
            done();
          });
        $httpBackend.flush();
      });

      it('should handle initializing connectors', (done) => {
        const connectorEvent = {
          context: {
            principalType: 'MACHINE',
          },
          payload: {
            type: 'ConnectorStateUpdated',
            connectorType: 'c_ucmc',
            currentState: {
              hostname: 'foobar.example.org',
              initialized: false,
            },
          },
        };
        processConnectorEvents([connectorEvent])
          .then((data) => {
            expect(data.items[0].type).toBe('ConnectorStateUpdated');
            expect(data.items[0].connectorStatus).toBe('initializing');
            expect(data.items[0].connectorType).toBe('c_ucmc');
            expect(data.items[0].resourceName).toBe('foobar.example.org');
            expect(data.items[0].severity).toBe('NONE');
            expect(data.items[0].title).toBe('hercules.eventHistory.connectorEventTitles.not_initialized');
            done();
          });
        $httpBackend.flush();
      });

      it('should handle running but not operational connectors', (done) => {
        const connectorEvent = {
          context: {
            principalType: 'MACHINE',
          },
          payload: {
            type: 'ConnectorStateUpdated',
            connectorType: 'c_cal',
            currentState: {
              hostname: 'foobar.example.org',
              initialized: true,
              operational: false,
            },
          },
        };
        processConnectorEvents([connectorEvent])
          .then((data) => {
            expect(data.items[0].type).toBe('ConnectorStateUpdated');
            expect(data.items[0].connectorStatus).toBe('not_operational');
            expect(data.items[0].connectorType).toBe('c_cal');
            expect(data.items[0].resourceName).toBe('foobar.example.org');
            expect(data.items[0].severity).toBe('NONE');
            expect(data.items[0].title).toBe('hercules.eventHistory.connectorEventTitles.not_operational');
            done();
          });
        $httpBackend.flush();
      });

      it('should handle connectors that are running and operational', (done) => {
        const connectorEvent = {
          context: {
            principalType: 'MACHINE',
          },
          payload: {
            type: 'ConnectorStateUpdated',
            connectorType: 'c_cal',
            currentState: {
              hostname: 'foobar.example.org',
              initialized: true,
              operational: true,
              state: 'running',
            },
            version: '12345',
            connectorId: 'abcd',
          },
        };
        processConnectorEvents([connectorEvent])
          .then((data) => {
            expect(data.items[0].type).toBe('ConnectorStateUpdated');
            expect(data.items[0].connectorStatus).toBe('running');
            expect(data.items[0].connectorType).toBe('c_cal');
            expect(data.items[0].resourceName).toBe('foobar.example.org');
            expect(data.items[0].severity).toBe('NONE');
            expect(data.items[0].softwareVersion).toBe('12345');
            expect(data.items[0].connectorId).toBe('abcd');
            expect(data.items[0].title).toBe('hercules.eventHistory.connectorEventTitles.running');
            done();
          });
        $httpBackend.flush();
      });

    });

    describe('metadata calculations', () => {

      it('should persist metadata for alarm events', (done) => {
        $httpBackend
          .expectGET(`https://hercules-intb.ciscospark.com/hercules/api/v2/organizations/null/events/?clusterId=&fromTime=time`)
          .respond( {
            items: [{
              context: {
                principalType: 'MACHINE',
                principalId: '12345',
                trackingId: '666-a-fun-number',
              },
              payload: {
                type: 'AlarmRaised',
              },
              timestamp: '2018-something',
            }],
          });

        HybridServicesEventHistoryService.getAllEvents('', '', 'time')
          .then((data) => {
            expect(data.items[0].userId).toBe('12345');
            expect(data.items[0].principalType).toBe('MACHINE');
            expect(data.items[0].timestamp).toBe('2018-something');
            expect(data.items[0].trackingId).toBe('666-a-fun-number');
            done();
          });
        $httpBackend.flush();
      });

      it('should persist metadata for cluster events', (done) => {
        $httpBackend
          .expectGET(`https://hercules-intb.ciscospark.com/hercules/api/v2/organizations/null/events/?clusterId=&fromTime=time`)
          .respond( {
            items: [{
              context: {
                principalType: 'MACHINE',
                principalId: '12345',
                trackingId: '666-a-fun-number',
              },
              payload: {
                type: 'ClusterUpdated',
                name: 'foo',
                oldName: 'bar',
              },
              timestamp: '2018-something',
            }],
          });

        HybridServicesEventHistoryService.getAllEvents('', '', 'time')
          .then((data) => {
            expect(data.items[0].userId).toBe('12345');
            expect(data.items[0].principalType).toBe('MACHINE');
            expect(data.items[0].timestamp).toBe('2018-something');
            expect(data.items[0].trackingId).toBe('666-a-fun-number');
            done();
          });
        $httpBackend.flush();
      });

      it('should persist metadata for connector events', (done) => {
        $httpBackend
          .expectGET(`https://hercules-intb.ciscospark.com/hercules/api/v2/organizations/null/events/?clusterId=&fromTime=time`)
          .respond( {
            items: [{
              context: {
                principalType: 'MACHINE',
                principalId: '12345',
                trackingId: '666-a-fun-number',
              },
              payload: {
                type: 'ConnectorStateUpdated',
                connectorType: 'c_cal',
                currentState: {
                  hostname: 'foobar.example.org',
                  initialized: true,
                  operational: false,
                },
              },
              timestamp: '2018-something',
            }],
          });

        HybridServicesEventHistoryService.getAllEvents('', '', 'time')
          .then((data) => {
            expect(data.items[0].userId).toBe('12345');
            expect(data.items[0].principalType).toBe('MACHINE');
            expect(data.items[0].timestamp).toBe('2018-something');
            expect(data.items[0].trackingId).toBe('666-a-fun-number');
            done();
          });
        $httpBackend.flush();
      });

      it('should persist metadata for service events', (done) => {

        $httpBackend
          .expectGET(`https://hercules-intb.ciscospark.com/hercules/api/v2/organizations/null/events/?clusterId=&fromTime=time`)
          .respond( [{
            items: [],
          }]);

        $httpBackend
          .expectGET(`https://hercules-intb.ciscospark.com/hercules/api/v2/organizations/null/events/?type=ServiceEnabled&type=ServiceDisabled&fromTime=time`)
          .respond( {
            items: [{
              context: {
                principalType: 'MACHINE',
                principalId: '12345',
                trackingId: '666-a-fun-number',
              },
              payload: {
                type: 'ServiceEnabled',
              },
              timestamp: '2018-something',
            }],
          });

        HybridServicesEventHistoryService.getAllEvents('', '', 'time')
          .then((data) => {
            expect(data.items[0].userId).toBe('12345');
            expect(data.items[0].principalType).toBe('MACHINE');
            expect(data.items[0].timestamp).toBe('2018-something');
            expect(data.items[0].trackingId).toBe('666-a-fun-number');
            done();
          });
        $httpBackend.flush();
      });

    });

    describe ('resolving usernames', () => {

      let $q, Userservice;

      beforeEach(inject(dependencies));

      function dependencies(_$q_, _Userservice_) {
        $q = _$q_;
        Userservice = _Userservice_;
      }

      it('should look users up in Common Identity to get their usernames, and default to a blank string if the user is not found in CI', (done) => {

        spyOn(Userservice, 'getUserAsPromise').and.callFake((userId) => {
          if (userId === '12345') {
            return $q.resolve({
              data: {
                id: '12345',
                displayName: 'Ronaldo',
              },
            });
          } else if (userId === '998877') {
            return $q.resolve({
              data: {
                id: '998877',
                displayName: 'Cantona',
              },
            });
          } else {
            return $q.reject({ error: 'user not found!' });
          }
        });

        $httpBackend
          .expectGET(`https://hercules-intb.ciscospark.com/hercules/api/v2/organizations/null/events/?clusterId=&fromTime=time`)
          .respond( {
            items: [{
              context: {
                principalType: 'PERSON',
                principalId: '12345',
                trackingId: '666-a-fun-number',
              },
              payload: {
                type: 'ClusterUpdated',
                name: '1',
                oldName: '2',
              },
              timestamp: '2015-something',
            }, {
              context: {
                principalType: 'PERSON',
                principalId: '998877',
                trackingId: '777-another-number',
              },
              payload: {
                type: 'ClusterUpdated',
                name: '5',
                oldName: '6',
              },
              timestamp: '2018-something',
            }, {
              context: {
                principalType: 'PERSON',
                principalId: '121212',
                trackingId: '888-a-boring-number',
              },
              payload: {
                type: 'ClusterUpdated',
                name: '6',
                oldName: '7',
              },
              timestamp: '2019-something',
            }],
          });

        HybridServicesEventHistoryService.getAllEvents('', '', 'time')
          .then((data) => {
            expect(Userservice.getUserAsPromise.calls.count()).toBe(3);
            expect(Userservice.getUserAsPromise).toHaveBeenCalledWith('12345');
            expect(Userservice.getUserAsPromise).toHaveBeenCalledWith('998877');
            expect(Userservice.getUserAsPromise).toHaveBeenCalledWith('121212');
            expect(_.find(data.items, (item: any) => item.userId === '12345').username).toBe('Ronaldo');
            expect(_.find(data.items, (item: any) => item.userId === '998877').username).toBe('Cantona');
            expect(_.find(data.items, (item: any) => item.userId === '121212').username).toBe('');
            done();
          });
        $httpBackend.flush();

      });

      it('should use "Scheduled Task" for cluster events that were done automatically, "Automatic" for alarm and connectors events that are done automatically, and "Automatic" if the principal type is UNKOWN', (done) => {

        $httpBackend
          .expectGET(`https://hercules-intb.ciscospark.com/hercules/api/v2/organizations/null/events/?clusterId=&fromTime=time`)
          .respond( {
            items: [{
              context: {
                principalType: 'MACHINE',
              },
              payload: {
                type: 'ClusterUpdated',
                name: '1',
                oldName: '2',
              },
            }, {
              context: {
                principalType: 'MACHINE',
              },
              payload: {
                type: 'ConnectorStateUpdated',
                state: 'running',
              },
            }, {
              context: {
                principalType: 'MACHINE',
              },
              payload: {
                type: 'AlarmResolved',
              },
            }, {
              context: {
                principalType: 'UNKNOWN',
              },
              payload: {
                type: 'releaseChannelChanged',
                oldReleaseChannel: 'a',
                releaseChannel: 'b',
              },
            }],
          });

        HybridServicesEventHistoryService.getAllEvents('', '', 'time')
          .then((data) => {
            expect(data.items[0].username).toBe('hercules.eventHistory.scheduledTask');
            expect(data.items[1].username).toBe('hercules.eventHistory.automatic');
            expect(data.items[2].username).toBe('hercules.eventHistory.automatic');
            expect(data.items[3].username).toBe('hercules.eventHistory.automatic');
            done();
          });
        $httpBackend.flush();

      });

    });

  });
});
