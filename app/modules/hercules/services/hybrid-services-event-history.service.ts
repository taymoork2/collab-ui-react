import { ConnectorAlarmSeverity, ConnectorType, IUpgradeSchedule, HybridServiceId, ConnectorState } from 'modules/hercules/hybrid-services.types';
import hybridServicesI18NServiceModuleName, { HybridServicesI18NService } from './hybrid-services-i18n.service';
import hybridServicesClusterServiceModuleName, { HybridServicesClusterService } from './hybrid-services-cluster.service';
import { HybridServicesUtilsService } from './hybrid-services-utils.service';
import resourceGroupServiceModuleName, { ResourceGroupService } from './resource-group.service';
import * as authinfoModuleName from 'modules/core/scripts/services/authinfo';
import * as userServiceModuleName from 'modules/core/scripts/services/user.service.js';
import moment = require('moment');

export type EventType = 'AlarmRaised' | 'AlarmResolved' | 'AlarmRaisedNotificationSent'
  | 'AlarmResolvedNotificationSent' | 'ClusterUpdated'| 'ConnectorStateUpdated' | 'UpgradeSchedule'
  | 'c_ucmcVersion' | 'c_calVersion' | 'c_mgmtVersion' | 'c_impVersion' | 'clusterRenamed'
  | 'resourceGroupChanged' | 'releaseChannelChanged' | 'ServiceEnabled' | 'ServiceDisabled' | 'ClusterCreated'
  | 'ClusterDeleted' | 'ResourceGroupCreated' | 'ResourceGroupUpdated' | 'ResourceGroupDeleted' | 'HostUpdated'
  | 'ConnectorUpdated' | 'ConnectorCreated' | 'ConnectorDeregistered' | 'ConnectorRemoved' | 'RedirectTargetCreated'
  | 'RedirectTargetDeleted' | 'MachineAccountCreated' | 'MailSubscriberListUpdated';

export interface IHybridServicesEventHistoryData {
  earliestTimestampSearched: string;
  items: IHybridServicesEventHistoryItem[];
  paging: {
    next: string;
  };
}

export interface IHybridServicesEventHistoryItem {
  userId: string;
  username?: string;
  type: EventType;
  connectorType: ConnectorType | 'all';
  connectorId?: string;
  serviceId?: HybridServiceId;
  timestamp: string;
  previousValue?: ConnectorState;
  connectorStatus?: ConnectorState;
  hostname?: string;
  hostSerial?: string;
  resourceName: string;
  softwareVersion?: string;
  trackingId: string;
  severity: ConnectorAlarmSeverity | 'IGNORED' | 'RESOLVED' | 'NONE';
  title: string;
  clusterId?: string;
  clusterName?: string;
  principalType: string;
  alarmDetails?: {
    alarmId: string;
    title: string;
    description: string;
    raisedAt: string;
    recipientCount?: number,
  };
  clusterProvisioningDetails?: {
    oldValue: string | null;
    newValue: string | null;
  };
  clusterDetails?: {
    name?: string;
    oldName?: string;
    resourceGroupId?: string;
    oldResourceGroupId?: string;
    resourceGroupName?: string;
    oldResourceGroupName?: string;
    releaseChannel?: string;
    oldReleaseChannel?: string;
  };
  resourceGroupDetails?: {
    name?: string;
    oldName?: string;
    releaseChannel?: string;
    oldReleaseChannel?: string;
  };
  hostDetails?: {
    maintenanceMode?: string;
    oldMaintenanceMode?: string;
  };
  connectorDetails?: {
    registrationState?: string;
    oldRegistrationState?: string;
    maintenanceMode?: string;
    oldMaintenanceMode?: string;
    clusterId?: string;
    oldClusterId?: string;
    upgradeState?: string;
    oldUpgradeState?: string;
  };
  redirectTargetDetails?: {
    hostname?: string;
    ttlInSeconds?: number;
  };
  machineAccountDetails?: {
    entitlements?: string;
    roles?: string;
  };
  mailSubscriberDetails?: {
    oldUserList?: string;
    newUserList?: string;
  };
}

interface IRawClusterEvent {
  context: {
    principalId: string;
    trackingId: string;
    timestamp: string;
    principalType: 'PERSON' | 'MACHINE' | 'UNKOWN';
  };
  payload: {
    type: EventType;
    alarmId?: string;
    upgradeSchedule?: IUpgradeSchedule;
    oldUpgradeSchedule?: IUpgradeSchedule;
    clusterId: string;
    oldClusterId: string;
    connectorId?: string;
    hostname: string;
    connectorType?: ConnectorType | 'all';
    targetType?: ConnectorType | 'all';
    title?: string;
    oldTitle?: string;
    currentState?: {
      hostname: string;
      initialized: boolean;
      operational: boolean;
      state: string;
    };
    previousState?: {
      initialized: boolean;
      operational: boolean;
      state: string;
    }
    version: string;
    description?: string;
    raisedAt?: string;
    recipientCount?: number;
    serviceId: HybridServiceId;
    name?: string;
    oldName?: string;
    resourceGroupId?: string;
    oldResourceGroupId?: string;
    releaseChannel?: string;
    oldReleaseChannel?: string;
    maintenanceMode?: string;
    oldMaintenanceMode?: string;
    registrationState?: string;
    oldRegistrationState?: string;
    upgradeState?: string;
    oldUpgradeState?: string;
    ttlInSeconds?: number;
    entitlements?: string;
    roles?: string;
    oldUserList?: string;
    newUserList?: string;
  };
  timestamp: string;
}

interface IRawClusterData {
  earliestTimestampSearched: string;
  paging: {
    next: string;
  };
  items: IRawClusterEvent[];
}

interface ICommonIdentityUser {
  data: {
    id: string;
    displayName?: string;
  };
}

interface IGetAllEventsOptions {
  clusterId?: string;
  hostSerial?: string;
  serviceId?: HybridServiceId | HybridServiceId[];
  eventsSince?: string;
  eventsTo?: string;
  orgId?: string;
}

export class HybridServicesEventHistoryService {

  /* @ngInject */
  constructor(
    private $http: ng.IHttpService,
    private $q: ng.IQService,
    private $translate: ng.translate.ITranslateService,
    private Authinfo,
    private HybridServicesI18NService: HybridServicesI18NService,
    private HybridServicesClusterService: HybridServicesClusterService,
    private HybridServicesUtilsService: HybridServicesUtilsService,
    private ResourceGroupService: ResourceGroupService,
    private UrlConfig,
    private Userservice,
  ) { }

  private extractData(res) {
    return res.data;
  }


  public getAllEvents(options: IGetAllEventsOptions, next: string | undefined, updateItems: (items: IHybridServicesEventHistoryItem[]) => void, items: IHybridServicesEventHistoryItem[]  ): ng.IPromise<IHybridServicesEventHistoryData | null | undefined> {
    const fromTimestamp = options.eventsSince || moment().subtract(7, 'days').toISOString();
    const toTimestamp = options.eventsTo || moment().toISOString();
    let url = `${this.UrlConfig.getHerculesUrlV2()}/organizations/${options.orgId || this.Authinfo.getOrgId()}/events/`;
    const diffInHours = moment(toTimestamp).diff(moment(fromTimestamp)) / (60000 * 60);

    if (diffInHours > 24 * 7 || (items !== undefined && items.length > 0)) {
      // to make this more responsive for queries > 7 days, lets make this scope for getting one day at a time
      // the view will be updated when the data arrives
      let tempOptions: IGetAllEventsOptions | null = options;
      if (next !== undefined) {
        url = next;
        tempOptions = null;
      }
      return this.getEvents(url, tempOptions, moment(toTimestamp).subtract(1, 'days').toISOString(), toTimestamp)
        .then((response) => {
          if (moment(response.earliestTimestampSearched) > moment(options.eventsSince)) {
            let getNextOptions: IGetAllEventsOptions = options;
            if (response.paging === undefined) {
              // We have gotten all data for the last request (next is not defined)
              // so continue with setting to = next day and call ourselves
              getNextOptions = options;
              getNextOptions.eventsTo = response.earliestTimestampSearched;
            }
            items = items ? items.concat(response.items) : items;
            updateItems(items);

            return this.getAllEvents(getNextOptions, response.paging ? response.paging.next : undefined, updateItems, items);
          }
          return this.returnProcessedEvents(items, response);
        });
    } else {
      // For queries >= 7 days, one query will suffice
      return this.getEvents(url, options, fromTimestamp, toTimestamp)
        .then((response) => {
          if (response.paging !== undefined) {
            // we have more data, call ourselves again
            items = items ? items.concat(response.items) : items;
            updateItems(items);

            return this.getAllEvents(options, response.paging.next, updateItems, items);
          }
          return this.returnProcessedEvents(response.items, response);
        });
    }
  }

  private returnProcessedEvents(items: IHybridServicesEventHistoryItem[], response) {
    // We have searched past eventsSince, so return
    let processedEvents: IHybridServicesEventHistoryData | null = null;
    if (items) {
      processedEvents = {
        earliestTimestampSearched: response.earliestTimestampSearched,
        items: items,
        paging: response.paging,
      };
    }

    return this.$q.resolve(processedEvents);
  }

  private getEvents(url: string, options: IGetAllEventsOptions | null, fromTimestamp: string | undefined, toTimestamp: string | undefined) {
    return this.$http
      .get(url, {
        params: options ? {
          clusterId: options.clusterId,
          fromTime: fromTimestamp,
          hostSerial: options.hostSerial,
          serviceId: options.serviceId,
          toTime: toTimestamp,
        } : null,
      })
      .then(this.extractData)
      .then((rawData: IRawClusterData) => {
        const processedEvents: IHybridServicesEventHistoryData = {
          earliestTimestampSearched: rawData.earliestTimestampSearched,
          items: [],
          paging: rawData.paging,
        };
        if (rawData.items) {
          processedEvents.items = this.processEvents(rawData.items);
        }
        return processedEvents;
      })
      .then((events) => {
        events.items = _.orderBy(events.items, (event) => event.timestamp, ['desc']);
        return events;
      })
      .then((events) => this.addClusterNames(events))
      .then((events) => this.addResourceGroupNames(events))
      .then((events) => this.addUsernames(events));
  }

/////////////////////

  /* Auxiliary methods we want to expose  */

  public isKnownEventType(event: IRawClusterEvent | IHybridServicesEventHistoryItem): boolean {
    return this.isAlarmEvent(event) || this.isClusterEvent(event) || this.isConnectorEvent(event)
      || this.isServiceActivationEvent(event) || this.isResourceGroupEvent(event) || this.isHostEvent(event)
      || this.isRedirectTargetEvent(event) || this.isMachineAccountEvent(event) || this.isMailSubscriberEvent(event);
  }

  public isAlarmEvent(event: IRawClusterEvent | IHybridServicesEventHistoryItem): boolean {
    let type: EventType;
    if ('payload' in event) {
      type = (<IRawClusterEvent>event).payload.type;
    } else {
      type = (<IHybridServicesEventHistoryItem>event).type;
    }
    return type === 'AlarmRaised' || type === 'AlarmResolved' || type === 'AlarmRaisedNotificationSent' || type === 'AlarmResolvedNotificationSent';
  }

  public isClusterEvent(event: IRawClusterEvent | IHybridServicesEventHistoryItem): boolean {
    let type: EventType;
    if ('payload' in event) {
      type = (<IRawClusterEvent>event).payload.type;
    } else {
      type = (<IHybridServicesEventHistoryItem>event).type;
    }
    return type === 'ClusterUpdated' || type === 'UpgradeSchedule' || type === 'c_ucmcVersion'
      || type === 'c_calVersion' || type === 'c_mgmtVersion' || type === 'c_impVersion'
      || type === 'clusterRenamed' || type === 'resourceGroupChanged' || type === 'releaseChannelChanged'
      || type === 'ClusterCreated' || type === 'ClusterDeleted';
  }

  public isResourceGroupEvent(event: IRawClusterEvent | IHybridServicesEventHistoryItem): boolean {
    let type: EventType;
    if ('payload' in event) {
      type = (<IRawClusterEvent>event).payload.type;
    } else {
      type = (<IHybridServicesEventHistoryItem>event).type;
    }
    return type === 'ResourceGroupCreated' || type === 'ResourceGroupUpdated' || type === 'ResourceGroupDeleted';
  }

  public isConnectorEvent(event: IRawClusterEvent | IHybridServicesEventHistoryItem): boolean {
    let type: EventType;
    if ('payload' in event) {
      type = (<IRawClusterEvent>event).payload.type;
    } else {
      type = (<IHybridServicesEventHistoryItem>event).type;
    }
    return type === 'ConnectorStateUpdated' || type === 'ConnectorUpdated' || type === 'ConnectorCreated'
      || type === 'ConnectorDeregistered' || type === 'ConnectorRemoved';
  }

  public isServiceActivationEvent(event: IRawClusterEvent | IHybridServicesEventHistoryItem): boolean {
    let type: EventType;
    if ('payload' in event) {
      type = (<IRawClusterEvent>event).payload.type;
    } else {
      type = (<IHybridServicesEventHistoryItem>event).type;
    }
    return type === 'ServiceEnabled' || type === 'ServiceDisabled';
  }

  public isHostEvent(event: IRawClusterEvent | IHybridServicesEventHistoryItem): boolean {
    let type: EventType;
    if ('payload' in event) {
      type = (<IRawClusterEvent>event).payload.type;
    } else {
      type = (<IHybridServicesEventHistoryItem>event).type;
    }
    return type === 'HostUpdated';
  }

  public isRedirectTargetEvent(event: IRawClusterEvent | IHybridServicesEventHistoryItem): boolean {
    let type: EventType;
    if ('payload' in event) {
      type = (<IRawClusterEvent>event).payload.type;
    } else {
      type = (<IHybridServicesEventHistoryItem>event).type;
    }
    return type === 'RedirectTargetCreated' || type === 'RedirectTargetDeleted';
  }

  public isMachineAccountEvent(event: IRawClusterEvent | IHybridServicesEventHistoryItem): boolean {
    let type: EventType;
    if ('payload' in event) {
      type = (<IRawClusterEvent>event).payload.type;
    } else {
      type = (<IHybridServicesEventHistoryItem>event).type;
    }
    return type === 'MachineAccountCreated';
  }

  public isMailSubscriberEvent(event: IRawClusterEvent | IHybridServicesEventHistoryItem): boolean {
    let type: EventType;
    if ('payload' in event) {
      type = (<IRawClusterEvent>event).payload.type;
    } else {
      type = (<IHybridServicesEventHistoryItem>event).type;
    }
    return type === 'MailSubscriberListUpdated';
  }

  /////////////////////

  /* Private methods  */

  private processEvents(events: IRawClusterEvent[]): IHybridServicesEventHistoryItem[] {
    const filteredItems = _.filter(events, (event) => this.isKnownEventType(event));
    let processedEvents: IHybridServicesEventHistoryItem[] = [];
    _.forEach(filteredItems, (event) => {
      if (this.isAlarmEvent(event)) {
        processedEvents.push(this.buildAlarmItem(event));
      }
      if (this.isClusterEvent(event)) {
        processedEvents = _.concat(processedEvents, this.buildClusterItems(event));
      }
      if (this.isConnectorEvent(event)) {
        processedEvents.push(this.buildConnectorEvent(event));
      }
      if (this.isServiceActivationEvent(event)) {
        processedEvents.push(this.buildServiceActivationEvent(event));
      }
      if (this.isResourceGroupEvent(event)) {
        processedEvents.push(this.buildResourceGroupEvent(event));
      }
      if (this.isHostEvent(event)) {
        processedEvents.push(this.buildHostEvent(event));
      }
      if (this.isRedirectTargetEvent(event)) {
        processedEvents.push(this.buildRedirectTargetEvent(event));
      }
      if (this.isMachineAccountEvent(event)) {
        processedEvents.push(this.buildMachineAccountEvent(event));
      }
      if (this.isMailSubscriberEvent(event)) {
        processedEvents.push(this.buildMailSubscriberEvent(event));
      }
    });
    return processedEvents;
  }

  private buildAlarmItem(event: IRawClusterEvent): IHybridServicesEventHistoryItem {
    let title = event.payload.title || event.payload.oldTitle || '';
    let severity: ConnectorAlarmSeverity | 'RESOLVED' | 'IGNORED' | '' = _.get(event, 'payload.severity', '') || 'RESOLVED';
    if (event.payload.type === 'AlarmRaisedNotificationSent') {
      title = this.$translate.instant('hercules.eventHistory.sidepanel.alarmEvents.alarmRaisedEmailsSentTitle');
      severity = 'alert';
    } else if (event.payload.type === 'AlarmResolvedNotificationSent') {
      title = this.$translate.instant('hercules.eventHistory.sidepanel.alarmEvents.alarmResolvedEmailsSentTitle');
      severity = 'alert';
    }
    return {
      principalType: event.context.principalType,
      type: event.payload.type,
      connectorType: _.get(event, 'payload.connectorType', 'all'),
      timestamp: event.timestamp,
      trackingId: event.context.trackingId,
      severity: severity,
      userId: _.get(event, 'context.principalId'),
      title: title,
      hostname: event.payload.hostname,
      resourceName: event.payload.hostname,
      connectorId: event.payload.connectorId,
      alarmDetails: {
        title: event.payload.title || event.payload.oldTitle || '',
        description: event.payload.description || '',
        raisedAt: event.payload.raisedAt || '',
        recipientCount: event.payload.recipientCount,
        alarmId: _.get(event, 'payload.alarmId', ''),
      },
    };
  }

  private buildClusterItems(event): IHybridServicesEventHistoryItem[] {

    const formattedEvents: IHybridServicesEventHistoryItem[] = [];

    if (event.payload.type === 'ClusterCreated') {
      const name = _.get(event, 'payload.name', '');
      formattedEvents.push(this.processClusterItem(event, event.payload.type, name, this.$translate.instant(`hercules.eventHistory.clusterCreated`, {
        clusterName: name,
      })));
    } else if (event.payload.type === 'ClusterDeleted') {
      const name = _.get(event, 'payload.oldName', '');
      formattedEvents.push(this.processClusterItem(event, event.payload.type, name, this.$translate.instant(`hercules.eventHistory.clusterDeleted`, {
        clusterName: name,
      })));
    } else if (event.payload.type === 'ClusterUpdated') {
      if ((event.payload.upgradeSchedule || event.payload.oldUpgradeSchedule) && !_.isEqual(event.payload.upgradeSchedule, event.payload.oldUpgradeSchedule)) {
        let previousValue = '';
        let newValue = '';
        const urgent = this.$translate.instant('hercules.clusterHistoryTable.urgentUpgrades');

        if (event.payload.oldUpgradeSchedule) {
          previousValue = `${this.HybridServicesI18NService.formatTimeAndDate(event.payload.oldUpgradeSchedule)}, ${event.payload.oldUpgradeSchedule.scheduleTimeZone}. ${urgent}: ${this.HybridServicesI18NService.labelForTime(event.payload.oldUpgradeSchedule.urgentScheduleTime)}`;
        }
        if (event.payload.upgradeSchedule) {
          newValue = `${this.HybridServicesI18NService.formatTimeAndDate(event.payload.upgradeSchedule)}, ${event.payload.upgradeSchedule.scheduleTimeZone}. ${urgent}: ${this.HybridServicesI18NService.labelForTime(event.payload.upgradeSchedule.urgentScheduleTime)}`;
        }
        formattedEvents.push(this.processClusterUpdateItem(event, 'UpgradeSchedule', previousValue, newValue));
      }

      if (event.payload.softwareVersions || event.payload.oldSoftwareVersions) {
        if (event.payload.softwareVersions && event.payload.softwareVersions.c_ucmc || event.payload.oldSoftwareVersions && event.payload.oldSoftwareVersions.c_ucmc) {
          formattedEvents.push(this.processClusterUpdateItem(event, 'c_ucmcVersion', _.get(event, 'payload.oldSoftwareVersions.c_ucmc', ''), _.get(event, 'payload.softwareVersions.c_ucmc', '')));
        }
        if (event.payload.softwareVersions && event.payload.softwareVersions.c_cal || event.payload.oldSoftwareVersions && event.payload.oldSoftwareVersions.c_cal) {
          formattedEvents.push(this.processClusterUpdateItem(event, 'c_calVersion', _.get(event, 'payload.oldSoftwareVersions.c_cal', ''), _.get(event, 'payload.softwareVersions.c_cal', '')));
        }
        if (event.payload.softwareVersions && event.payload.softwareVersions.c_mgmt || event.payload.oldSoftwareVersions && event.payload.oldSoftwareVersions.c_mgmt) {
          formattedEvents.push(this.processClusterUpdateItem(event, 'c_mgmtVersion', _.get(event, 'payload.oldSoftwareVersions.c_mgmt', ''), _.get(event, 'payload.softwareVersions.c_mgmt', '')));
        }
        if (event.payload.softwareVersions && event.payload.softwareVersions.c_imp || event.payload.oldSoftwareVersions && event.payload.oldSoftwareVersions.c_imp) {
          formattedEvents.push(this.processClusterUpdateItem(event, 'c_impVersion', _.get(event, 'payload.oldSoftwareVersions.c_imp', ''), _.get(event, 'payload.softwareVersions.c_imp', '')));
        }
      }

      if (event.payload.name !== event.payload.oldName) {
        formattedEvents.push(this.processClusterUpdateItem(event, 'clusterRenamed', _.get(event, 'payload.oldName', ''), _.get(event, 'payload.name', '')));
      }

      if (event.payload.resourceGroupId !== event.payload.oldResourceGroupId) {
        formattedEvents.push(this.processClusterUpdateItem(event, 'resourceGroupChanged', _.get(event, 'payload.oldResourceGroupId', ''), _.get(event, 'payload.resourceGroupId', '')));
      }

      if (event.payload.releaseChannel !== event.payload.oldReleaseChannel) {
        formattedEvents.push(this.processClusterUpdateItem(event, 'releaseChannelChanged', _.get(event, 'payload.oldReleaseChannel', ''), _.get(event, 'payload.releaseChannel', '')));
      }
    }

    return formattedEvents;
  }

  private buildConnectorEvent(event: IRawClusterEvent): IHybridServicesEventHistoryItem {
    let resName = _.get(event, 'payload.currentState.hostname', '');
    if (event.payload.type === 'ConnectorUpdated' || event.payload.type === 'ConnectorCreated'
      || event.payload.type === 'ConnectorDeregistered' || event.payload.type === 'ConnectorRemoved') {
      resName = _.get(event, 'payload.connectorId', '');
    }
    return {
      principalType: event.context.principalType,
      userId: _.get(event, 'context.principalId'),
      type: event.payload.type,
      connectorType: _.get(event, 'payload.connectorType', 'all'),
      connectorId: event.payload.connectorId,
      timestamp: event.timestamp,
      trackingId: event.context.trackingId,
      severity: 'NONE',
      title: this.buildConnectorEventTitle(event) || '',
      hostname: _.get(event, 'payload.currentState.hostname', ''),
      resourceName: resName,
      connectorStatus: this.getConnectorStateUpdatedType(event),
      softwareVersion: event.payload.version,
      connectorDetails: {
        registrationState: event.payload.registrationState,
        oldRegistrationState: event.payload.oldRegistrationState,
        maintenanceMode: event.payload.maintenanceMode,
        oldMaintenanceMode: event.payload.oldMaintenanceMode,
        clusterId: event.payload.clusterId,
        oldClusterId: event.payload.oldClusterId,
        upgradeState: event.payload.upgradeState,
        oldUpgradeState: event.payload.oldUpgradeState,
      },
    };
  }

  private buildResourceGroupEvent(event: IRawClusterEvent): IHybridServicesEventHistoryItem {
    let title: string = '';
    if (event.payload.type === 'ResourceGroupCreated') {
      title = this.$translate.instant(`hercules.eventHistory.resourceGroupEvents.created`, {
        serviceName: event.payload.name,
      });
    } else if (event.payload.type === 'ResourceGroupUpdated') {
      title = this.$translate.instant(`hercules.eventHistory.resourceGroupEvents.updated`, {
        serviceName: event.payload.name,
      });
    } else if (event.payload.type === 'ResourceGroupDeleted') {
      title = this.$translate.instant(`hercules.eventHistory.resourceGroupEvents.deleted`, {
        serviceName: event.payload.name,
      });
    }

    return {
      principalType: event.context.principalType,
      userId: _.get(event, 'context.principalId'),
      type: event.payload.type,
      connectorType: 'all',
      serviceId: event.payload.serviceId,
      timestamp: event.timestamp,
      trackingId: event.context.trackingId,
      severity: 'NONE',
      title: title,
      resourceName: this.$translate.instant('hercules.eventHistory.allResources'),
      resourceGroupDetails: {
        name: event.payload.name,
        oldName:  event.payload.oldName,
        releaseChannel: event.payload.releaseChannel,
        oldReleaseChannel: event.payload.oldReleaseChannel,
      }};
  }

  private buildHostEvent(event: IRawClusterEvent): IHybridServicesEventHistoryItem {
    let title: string = '';
    if (event.payload.type === 'HostUpdated') {
      title = this.$translate.instant(`hercules.eventHistory.hostEvents.updated`, {
        serviceName: event.payload.name,
      });
    }

    return {
      principalType: event.context.principalType,
      userId: _.get(event, 'context.principalId'),
      type: event.payload.type,
      connectorType: 'all',
      timestamp: event.timestamp,
      trackingId: event.context.trackingId,
      severity: 'NONE',
      title: title,
      resourceName: this.$translate.instant('hercules.eventHistory.allResources'),
      hostDetails: {
        maintenanceMode: event.payload.maintenanceMode,
        oldMaintenanceMode:  event.payload.oldMaintenanceMode,
      }};
  }

  private buildRedirectTargetEvent(event: IRawClusterEvent): IHybridServicesEventHistoryItem {
    let title: string = '';
    if (event.payload.type === 'RedirectTargetCreated') {
      title = this.$translate.instant(`hercules.eventHistory.redirectTargetEvents.created`);
    } else if (event.payload.type === 'RedirectTargetDeleted') {
      title = this.$translate.instant(`hercules.eventHistory.redirectTargetEvents.deleted`);
    }

    return {
      principalType: event.context.principalType,
      userId: _.get(event, 'context.principalId'),
      type: event.payload.type,
      connectorType: 'all',
      timestamp: event.timestamp,
      clusterId: event.payload.clusterId,
      trackingId: event.context.trackingId,
      severity: 'NONE',
      title: title,
      resourceName: this.$translate.instant('hercules.eventHistory.allResources'),
      redirectTargetDetails: {
        hostname: event.payload.hostname,
        ttlInSeconds:  event.payload.ttlInSeconds,
      }};
  }

  private buildMachineAccountEvent(event: IRawClusterEvent): IHybridServicesEventHistoryItem {
    let title: string = '';
    if (event.payload.type === 'MachineAccountCreated') {
      title = this.$translate.instant(`hercules.eventHistory.machineAccountEvents.created`);
    }

    return {
      principalType: event.context.principalType,
      userId: _.get(event, 'context.principalId'),
      type: event.payload.type,
      connectorType: _.get(event, 'payload.targetType', 'all'),
      timestamp: event.timestamp,
      clusterId: event.payload.clusterId,
      trackingId: event.context.trackingId,
      severity: 'NONE',
      title: title,
      resourceName: event.payload.clusterId,
      machineAccountDetails: {
        entitlements: event.payload.entitlements,
        roles: event.payload.roles,
      }};
  }

  private buildMailSubscriberEvent(event: IRawClusterEvent): IHybridServicesEventHistoryItem {
    let title: string = '';
    if (event.payload.type === 'MailSubscriberListUpdated') {
      title = this.$translate.instant(`hercules.eventHistory.mailSubscriberEvents.updated`);
    }

    return {
      principalType: event.context.principalType,
      userId: _.get(event, 'context.principalId'),
      type: event.payload.type,
      connectorType: this.HybridServicesUtilsService.serviceId2ConnectorType(event.payload.serviceId) || 'all',
      timestamp: event.timestamp,
      clusterId: event.payload.clusterId,
      trackingId: event.context.trackingId,
      serviceId: event.payload.serviceId,
      severity: 'NONE',
      title: title,
      resourceName: this.$translate.instant('hercules.eventHistory.allResources'),
      mailSubscriberDetails: {
        oldUserList: event.payload.oldUserList,
        newUserList: event.payload.newUserList,
      }};
  }

  private buildServiceActivationEvent(event: IRawClusterEvent): IHybridServicesEventHistoryItem {
    let title: string = '';
    const serviceName = this.$translate.instant(`hercules.serviceNames.${event.payload.serviceId}`);
    if (event.payload.type === 'ServiceEnabled') {
      title = this.$translate.instant(`hercules.eventHistory.serviceEnabled`, {
        serviceName: serviceName,
      });
    } else if (event.payload.type === 'ServiceDisabled') {
      title = this.$translate.instant(`hercules.eventHistory.serviceDisabled`, {
        serviceName: serviceName,
      });
    }
    return {
      principalType: event.context.principalType,
      userId: _.get(event, 'context.principalId'),
      type: event.payload.type,
      connectorType: this.HybridServicesUtilsService.serviceId2ConnectorType(event.payload.serviceId) || 'all',
      serviceId: event.payload.serviceId,
      timestamp: event.timestamp,
      trackingId: event.context.trackingId,
      severity: 'NONE',
      title: title,
      resourceName: this.$translate.instant('hercules.eventHistory.allResources'),
    };
  }


  private processClusterItem(event: IRawClusterEvent, type: EventType, name: string, title: string): IHybridServicesEventHistoryItem {
    event.payload.type = type;
    return {
      principalType: event.context.principalType,
      type: type,
      userId: _.get(event, 'context.principalId'),
      timestamp: event.timestamp,
      trackingId: event.context.trackingId,
      connectorType: _.get(event, 'payload.targetType', 'all'),
      severity: 'NONE',
      title: title,
      clusterId: event.payload.clusterId,
      resourceName: event.payload.clusterId,
      clusterDetails: {
        name: name,
      },
    };
  }

  private processClusterUpdateItem(event: IRawClusterEvent, type: EventType, previousValue: string, newValue: string): IHybridServicesEventHistoryItem {
    let clusterDetails;

    if (type === 'clusterRenamed') {
      clusterDetails = {
        oldName: previousValue,
        name: newValue,
      };
    } else if (type === 'resourceGroupChanged') {
      clusterDetails = {
        oldResourceGroupId: previousValue,
        resourceGroupId: newValue,
      };
    } else if (type === 'releaseChannelChanged') {
      clusterDetails = {
        oldReleaseChannel: this.$translate.instant(`hercules.fusion.add-resource-group.release-channel.${previousValue}`),
        releaseChannel: this.$translate.instant(`hercules.fusion.add-resource-group.release-channel.${newValue}`),
      };
    }

    event.payload.type = type;
    return {
      principalType: event.context.principalType,
      type: type,
      userId: _.get(event, 'context.principalId'),
      timestamp: event.timestamp,
      trackingId: event.context.trackingId,
      connectorType: this.getConnectorTypeFromClusterItem(type),
      severity: 'NONE',
      title: this.buildClusterUpdateTitle(event, newValue, previousValue),
      clusterId: event.payload.clusterId,
      resourceName: event.payload.clusterId,
      clusterDetails: clusterDetails,
      clusterProvisioningDetails: {
        oldValue: previousValue,
        newValue: newValue,
      },
    };
  }

  private getConnectorTypeFromClusterItem(type: EventType): 'c_imp' | 'c_cal' | 'c_mgmt' | 'c_ucmc' | 'all' {
    if (type === 'c_mgmtVersion') {
      return 'c_mgmt';
    } else if (type === 'c_calVersion') {
      return 'c_cal';
    } else if (type === 'c_ucmcVersion') {
      return 'c_ucmc';
    } else if (type === 'c_impVersion') {
      return 'c_imp';
    }
    return 'all';
  }

  private buildClusterUpdateTitle(event: IRawClusterEvent, newValue: string, previousValue: string): string {
    if (event.payload.type === 'UpgradeSchedule') {
      return this.$translate.instant(`hercules.eventHistory.newUpgradeSchedule`, {
        newSchedule: newValue,
      });
    }
    if (event.payload.type === 'ClusterCreated') {
      return this.$translate.instant(`hercules.eventHistory.clusterCreated`, {
        clusterName: newValue,
      });
    }
    if (event.payload.type === 'resourceGroupChanged') {
      return this.$translate.instant(`hercules.eventHistory.resourceGroupChanged`);
    }
    if (event.payload.type === 'releaseChannelChanged') {
      return this.$translate.instant(`hercules.eventHistory.releaseChannelChanged`);
    }
    if (event.payload.type === 'clusterRenamed') {
      return this.$translate.instant(`hercules.eventHistory.clusterRenamed`);
    }
    if (event.payload.type === 'c_mgmtVersion') {
      return this.buildClusterUpgradeString('c_mgmt', previousValue, newValue);
    }
    if (event.payload.type === 'c_calVersion') {
      return this.buildClusterUpgradeString('c_cal', previousValue, newValue);
    }
    if (event.payload.type === 'c_ucmcVersion') {
      return this.buildClusterUpgradeString('c_ucmc', previousValue, newValue);
    }
    if (event.payload.type === 'c_impVersion') {
      return this.buildClusterUpgradeString('c_imp', previousValue, newValue);
    }
    return event.payload.type;
  }

  private buildClusterUpgradeString(connectorType: ConnectorType, previousValue: string | undefined, newValue: string | undefined): string {
    const localizedConnectorName = this.$translate.instant('hercules.connectorNameFromConnectorType.' + connectorType);
    if (previousValue === null && newValue === null) {
      return '';
    }
    if (previousValue === null && newValue !== null) {
      return this.$translate.instant('hercules.eventHistory.connectorProvisioned', {
        connectorName: localizedConnectorName,
        newVersion: newValue,
      });
    }
    if (previousValue !== null && newValue === null) {
      return this.$translate.instant('hercules.eventHistory.connectorDeprovisioned', {
        connectorName: localizedConnectorName,
      });
    }
    if (previousValue !== null && newValue !== null) {
      return this.$translate.instant('hercules.eventHistory.connectorProvisioningChanged', {
        connectorName: localizedConnectorName,
        newVersion: newValue,
      });
    }
    return '';
  }

  private getConnectorStateUpdatedType(event: IRawClusterEvent): ConnectorState | undefined {
    let connectorState: ConnectorState;
    if (!_.get(event, 'payload.currentState.initialized') &&
      _.get(event, 'payload.currentState.state') !== 'not_installed' &&
      _.get(event, 'payload.currentState.state') !== 'disabled' &&
      _.get(event, 'payload.currentState.state') !== 'not_configured' &&
      _.get(event, 'payload.currentState.state') !== 'downloading' &&
      _.get(event, 'payload.currentState.state') !== 'installing') {
      connectorState = 'initializing';
    } else if (!_.get(event, 'payload.currentState.operational') &&
      _.get(event, 'payload.currentState.state') !== 'not_installed' &&
      _.get(event, 'payload.currentState.state') !== 'disabled' &&
      _.get(event, 'payload.currentState.state') !== 'not_configured' &&
      _.get(event, 'payload.currentState.state') !== 'downloading' &&
      _.get(event, 'payload.currentState.state') !== 'installing') {
      connectorState = 'not_operational';
    } else {
      connectorState = _.get(event, 'payload.currentState.state');
    }
    return connectorState;
  }

  private buildConnectorEventTitle(event: IRawClusterEvent): string | undefined {
    const localizedConnectorName = this.$translate.instant('hercules.connectorNameFromConnectorType.' + event.payload.connectorType);

    if (event.payload.type === 'ConnectorUpdated') {
      return this.$translate.instant('hercules.eventHistory.connectorEvents.updated', {
        connectorType: localizedConnectorName,
      });
    } else if (event.payload.type === 'ConnectorCreated') {
      return this.$translate.instant('hercules.eventHistory.connectorEvents.created', {
        connectorType: localizedConnectorName,
      });
    } else if (event.payload.type === 'ConnectorRemoved') {
      return this.$translate.instant('hercules.eventHistory.connectorEvents.removed', {
        connectorType: localizedConnectorName,
      });
    } else if (event.payload.type === 'ConnectorDeregistered') {
      return this.$translate.instant('hercules.eventHistory.connectorEvents.deregistered', {
        connectorType: localizedConnectorName,
      });
    } else if (event.payload.type === 'ConnectorStateUpdated') {
      const modifiedState = this.getConnectorStateUpdatedType(event) || undefined;
      if (modifiedState === 'downloading') {
        return this.$translate.instant('hercules.eventHistory.connectorEventTitles.downloading', {
          connectorType: localizedConnectorName,
        });
      }
      if (modifiedState === 'installing') {
        return this.$translate.instant('hercules.eventHistory.connectorEventTitles.installing', {
          connectorType: localizedConnectorName,
        });
      }
      if (modifiedState === 'not_installed') {
        return this.$translate.instant('hercules.eventHistory.connectorEventTitles.not_installed', {
          connectorType: localizedConnectorName,
        });
      }
      if (modifiedState === 'not_configured') {
        return this.$translate.instant('hercules.eventHistory.connectorEventTitles.not_configured', {
          connectorType: localizedConnectorName,
        });
      }
      if (modifiedState === 'disabled') {
        return this.$translate.instant('hercules.eventHistory.connectorEventTitles.disabled', {
          connectorType: localizedConnectorName,
        });
      }
      if (modifiedState === 'initializing') {
        return this.$translate.instant('hercules.eventHistory.connectorEventTitles.not_initialized', {
          connectorType: localizedConnectorName,
        });
      }
      if (modifiedState === 'not_operational') {
        return this.$translate.instant('hercules.eventHistory.connectorEventTitles.not_operational', {
          connectorType: localizedConnectorName,
        });
      }
      if (modifiedState === 'running') {
        return this.$translate.instant('hercules.eventHistory.connectorEventTitles.running', {
          connectorType: localizedConnectorName,
          version: event.payload.version,
        });
      }
      return modifiedState;
    }
  }

  private addUsernames(formattedData: IHybridServicesEventHistoryData): ng.IPromise<IHybridServicesEventHistoryData> {
    let allUserIds: string[] = [];
    if (formattedData.items) {
      allUserIds = _.chain(formattedData.items)
        .filter(item => item.principalType === 'PERSON')
        .map(item => item.userId)
        .uniq()
        .value();
    }
    const promises: ng.IPromise<any>[] = _.map(allUserIds, (userId) => this.Userservice.getUserAsPromise(userId));
    return this.HybridServicesUtilsService.allSettled(promises)
      .then((users) => {
        const usernameCache = {};
        _.forEach(users, (user: { value: ICommonIdentityUser }) => {
          if (user.value && user.value.data && user.value.data.id && user.value.data.displayName) {
            usernameCache[user.value.data.id] = user.value.data.displayName;
          }
        });
        if (formattedData.items) {
          formattedData.items = _.map(formattedData.items, (item) => {
            if (item.principalType === 'MACHINE' && this.isClusterEvent(item)) {
              item.username = this.$translate.instant('hercules.eventHistory.scheduledTask');
            } else if (item.principalType === 'MACHINE' && (this.isConnectorEvent(item) || this.isAlarmEvent(item))) {
              item.username = this.$translate.instant('hercules.eventHistory.automatic');
            } else if (item.principalType === 'UNKNOWN') {
              item.username = this.$translate.instant('hercules.eventHistory.automatic');
            } else {
              item.username = usernameCache[item.userId] || '';
            }
            return item;
          });
        }
        return formattedData;
      });
  }

  private addClusterNames(events: IHybridServicesEventHistoryData): ng.IPromise<IHybridServicesEventHistoryData> {
    return this.HybridServicesClusterService.getAll()
      .then((clusters) => {
        const allClusterNames = _.map(clusters, (cluster) => {
          return {
            clusterId: cluster.id,
            clusterName: cluster.name,
          };
        });
        events.items = _.map(events.items, (item) => {
          if (item.clusterId) {
            const cluster = _.find(allClusterNames, (cluster) => cluster.clusterId === item.clusterId);
            if (cluster !== undefined) {
              item.clusterName = item.resourceName = _.find(allClusterNames, (cluster) => cluster.clusterId === item.clusterId).clusterName || this.$translate.instant('common.unknown');
            }
          }
          return item;
        });
        return events;
      })
      ;
  }

  private addResourceGroupNames(events: IHybridServicesEventHistoryData): ng.IPromise<IHybridServicesEventHistoryData> {
    if (events.items && _.find(events.items, (item) => item.type === 'resourceGroupChanged' )) {
      return this.ResourceGroupService.getAll()
        .then((groups) => {
          const resourceGroupMap = {};
          _.forEach(groups, (group) => resourceGroupMap[group.id] = group.name);
          events.items = _.map(events.items, (item) => {
            if (item.type !== 'resourceGroupChanged') {
              return item;
            } else {
              if (item.clusterDetails) {
                if (item.clusterDetails.resourceGroupId) {
                  item.clusterDetails.resourceGroupName = resourceGroupMap[item.clusterDetails.resourceGroupId] || '';
                }
                if (item.clusterDetails.oldResourceGroupId) {
                  item.clusterDetails.oldResourceGroupName = resourceGroupMap[item.clusterDetails.oldResourceGroupId];
                }
              }
              return item;
            }
          });
          return events;
        });
    } else {
      return this.$q.resolve(events);
    }
  }
}

export default angular
  .module('hercules.services.hybrid-services-event-history-service', [
    require('angular-translate'),
    authinfoModuleName,
    hybridServicesI18NServiceModuleName,
    hybridServicesClusterServiceModuleName,
    resourceGroupServiceModuleName,
    userServiceModuleName,
  ])
  .service('HybridServicesEventHistoryService', HybridServicesEventHistoryService)
  .name;
