import { IUpgradeSchedule } from 'modules/hercules/hybrid-services.types';
import { HybridServicesI18NService } from 'modules/hercules/services/hybrid-services-i18n.service';
import { HybridServicesUtilsService } from 'modules/hercules/services/hybrid-services-utils.service';
import { ResourceGroupService } from 'modules/hercules/services/resource-group.service';

type ClusterEventType = 'nameChange' | 'resourceGroup' | 'releaseChannel' | 'c_mgmtVersion' | 'c_calVersion' | 'c_ucmcVersion' | 'upgradeSchedule';
type PrincipalType = 'PERSON' | 'MACHINE';

export interface IExpresswayClusterHistoryItem {
  username?: string;
  userId: string;
  principalType: PrincipalType;
  timestamp: string;
  type: ClusterEventType;
  previousValue: string;
  newValue: string;
}

export interface IExpresswayClusterHistory {
  earliestTimestampSearched: string;
  nextUrl: string;
  items?: IExpresswayClusterHistoryItem[];
}

interface IRawHistory {
  earliestTimestampSearched: string;
  paging: {
    next: string;
  };
  items: IClusterUpdatedItem[];
}

interface IClusterUpdatedItem {
  timestamp: string;
  payload: {
    name?: string;
    oldName?: string;
    releaseChannel?: string;
    oldReleaseChannel?: string;
    resourceGroupId?: string;
    oldResourceGroupId?: string;
    softwarePackages?: {
      c_ucmc?: {
        version: string;
      },
      c_cal?: {
        version: string;
      },
      c_mgmt?: {
        version: string;
      },
    };
    oldSoftwarePackages?: {
      c_ucmc?: {
        version: string;
      },
      c_cal?: {
        version: string;
      },
      c_mgmt?: {
        version: string;
      },
    };
    upgradeSchedule?: IUpgradeSchedule;
    oldUpgradeSchedule?: IUpgradeSchedule;
  };
  context: {
    principalId: string,
    principalType: PrincipalType,
  };
}

export class HybridServicesAuditLogService {


  /* @ngInject */
  constructor(
    private $http: ng.IHttpService,
    private $q: ng.IQService,
    private Authinfo,
    private HybridServicesI18NService: HybridServicesI18NService,
    private HybridServicesUtilsService: HybridServicesUtilsService,
    private UrlConfig,
    private Userservice,
    private ResourceGroupService: ResourceGroupService,
  ) { }

  private extractData(res) {
    return res.data;
  }

  public getClusterData(clusterId: string, orgId?: string): ng.IPromise<IRawHistory> {
    /* Todo: Check the timestamp in the response, verify that we got all the data we asked for  */
    /* Todo: Take the number of days as a parameter instead of using a hard coded value */
    const timestamp = moment().subtract(60, 'days').toISOString();
    const url = `${this.UrlConfig.getHerculesUrlV2()}/organizations/${orgId || this.Authinfo.getOrgId()}/internals/events/?clusterId=${clusterId}&type=ClusterUpdated&fromTime=${timestamp}`;
    return this.$http
      .get(url)
      .then(this.extractData);
  }

  public getFormattedExpresswayClusterHistory(clusterId: string, orgId?: string): ng.IPromise<IExpresswayClusterHistory> {
    return this.getClusterData(clusterId, orgId || this.Authinfo.getOrgId())
      .then((rawData: IRawHistory) => {
        const formattedData: IExpresswayClusterHistory = {
          earliestTimestampSearched: rawData.earliestTimestampSearched,
          nextUrl: rawData.paging.next,
          items: _.flatMap(rawData.items, (item: IClusterUpdatedItem) =>  this.buildFormattedExpresswayClusterItems(item)),
        };
        return formattedData;
      })
      .then((formattedData) => {
        return this.addUsernames(formattedData);
      })
      .then((formattedData) => {
        return this.addResourceGroupNames(formattedData);
      });

  }

  public addResourceGroupNames(formattedData: IExpresswayClusterHistory): ng.IPromise<IExpresswayClusterHistory> {
    if (formattedData.items && _.find(formattedData.items, (item) => item.type === 'resourceGroup')) {
      return this.ResourceGroupService.getAll()
        .then((groups) => {
          const allResourceGroups = {};
          _.forEach(groups, (group) => allResourceGroups[group.id] = group.name);
          if (formattedData.items) {
            _.forEach(formattedData.items, (item) => {
              if (item.type === 'resourceGroup') {
                item.newValue = allResourceGroups[item.newValue] || '';
                item.previousValue = allResourceGroups[item.previousValue] || '';
              }
            });
          }
          return formattedData;
        })
        .catch(() => {
          return formattedData;
        });
    } else {
      return this.$q.resolve(formattedData);
    }
  }

  public addUsernames(formattedData: IExpresswayClusterHistory): ng.IPromise<IExpresswayClusterHistory> {
    const promises: ng.IPromise<any>[] = [];
    let allUserIds: string[] = [];
    if (formattedData.items) {
      allUserIds = _.chain(formattedData.items)
        .filter(item => item.principalType === 'PERSON')
        .map(item => item.userId)
        .uniq()
        .value();
    }
    _.forEach(allUserIds, (userId) => {
      promises.push(this.Userservice.getUserAsPromise(userId as string));
    });
    return this.HybridServicesUtilsService.allSettled(promises)
      .then((values) => {
        const usernameCache = {};
        _.forEach(values, (user: {
          value: {
            data: {
              id: string,
              displayName?: string;
            },
          },
        }) => {
          if (user.value && user.value.data && user.value.data.id && user.value.data.displayName) {
            usernameCache[user.value.data.id] = user.value.data.displayName;
          }
        });
        if (formattedData.items) {
          _.forEach(formattedData.items, (item) => {
            item.username = usernameCache[item.userId] || '';
          });
        }
        return formattedData;
      });
  }

  private buildFormattedExpresswayClusterItems(item: IClusterUpdatedItem) {
    const formattedItems: IExpresswayClusterHistoryItem[] = [];

    if (item.payload.name || item.payload.oldName) {
      formattedItems.push(this.processClusterUpdateItem(item, 'nameChange', _.get(item, 'payload.oldName', ''), _.get(item, 'payload.name', '')));
    }

    if ((item.payload.releaseChannel || item.payload.oldReleaseChannel) && item.payload.releaseChannel !== item.payload.oldReleaseChannel) {
      let previousValue = '';
      let newValue = '';
      if (item.payload.oldReleaseChannel) {
        previousValue = this.HybridServicesI18NService.getLocalizedReleaseChannel(item.payload.oldReleaseChannel);
      }
      if (item.payload.releaseChannel) {
        newValue = this.HybridServicesI18NService.getLocalizedReleaseChannel(item.payload.releaseChannel);
      }

      formattedItems.push(this.processClusterUpdateItem(item, 'releaseChannel', previousValue, newValue));
    }

    if (item.payload.resourceGroupId || item.payload.oldResourceGroupId) {
      formattedItems.push(this.processClusterUpdateItem(item, 'resourceGroup', _.get(item, 'payload.oldResourceGroupId', ''), _.get(item, 'payload.resourceGroupId', '')));
    }

    if (item.payload.softwarePackages || item.payload.oldSoftwarePackages) {
      if (item.payload.softwarePackages && item.payload.softwarePackages.c_ucmc || item.payload.oldSoftwarePackages && item.payload.oldSoftwarePackages.c_ucmc) {
        formattedItems.push(this.processClusterUpdateItem(item, 'c_ucmcVersion', _.get(item, 'payload.oldSoftwarePackages.c_ucmc.version', ''), _.get(item, 'payload.softwarePackages.c_ucmc.version', '')));

      }
      if (item.payload.softwarePackages && item.payload.softwarePackages.c_cal || item.payload.oldSoftwarePackages && item.payload.oldSoftwarePackages.c_cal) {
        formattedItems.push(this.processClusterUpdateItem(item, 'c_calVersion', _.get(item, 'payload.oldSoftwarePackages.c_cal.version', ''), _.get(item, 'payload.softwarePackages.c_cal.version', '')));
      }
      if (item.payload.softwarePackages && item.payload.softwarePackages.c_mgmt || item.payload.oldSoftwarePackages && item.payload.oldSoftwarePackages.c_mgmt) {
        formattedItems.push(this.processClusterUpdateItem(item, 'c_mgmtVersion', _.get(item, 'payload.oldSoftwarePackages.c_mgmt.version', ''), _.get(item, 'payload.softwarePackages.c_mgmt.version', '')));
      }
    }

    if ((item.payload.upgradeSchedule || item.payload.oldUpgradeSchedule) && !_.isEqual(item.payload.upgradeSchedule, item.payload.oldUpgradeSchedule)) {
      let previousValue = '';
      let newValue = '';
      if (item.payload.oldUpgradeSchedule) {
        previousValue = `${this.HybridServicesI18NService.formatTimeAndDate(item.payload.oldUpgradeSchedule)}, ${item.payload.oldUpgradeSchedule.scheduleTimeZone}`;
      }
      if (item.payload.upgradeSchedule) {
        newValue = `${this.HybridServicesI18NService.formatTimeAndDate(item.payload.upgradeSchedule)}, ${item.payload.upgradeSchedule.scheduleTimeZone}`;
      }
      formattedItems.push(this.processClusterUpdateItem(item, 'upgradeSchedule', previousValue, newValue));
    }
    return formattedItems;
  }

  private processClusterUpdateItem(item: IClusterUpdatedItem, type: ClusterEventType, previousValue: string, newValue: string): IExpresswayClusterHistoryItem {
    return {
      type: type,
      userId: item.context.principalId,
      principalType: item.context.principalType,
      timestamp: item.timestamp,
      previousValue: previousValue,
      newValue: newValue,
    };
  }


}

export default angular
  .module('Hercules')
  .service('HybridServicesAuditLogService', HybridServicesAuditLogService)
  .name;
