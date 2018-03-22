import { CsdmHubFactory, CsdmPollerFactory } from 'modules/squared/devices/services/CsdmPoller';
import { HybridServicesI18NService } from 'modules/hercules/services/hybrid-services-i18n.service';
import { HybridServiceId } from 'modules/hercules/hybrid-services.types';

interface IStatusSummary {
  countsByCluster: {
    'spark-hybrid-impinterop': IStatusSummaryForACluster;
    'squared-fusion-cal': IStatusSummaryForACluster;
    'squared-fusion-ec': IStatusSummaryForACluster;
    'squared-fusion-gcal': IStatusSummaryForACluster;
    'squared-fusion-uc': IStatusSummaryForACluster;
  };
  countsByState: {
    'spark-hybrid-impinterop': IStatusSummaryForAService;
    'squared-fusion-cal': IStatusSummaryForAService;
    'squared-fusion-ec': IStatusSummaryForAService;
    'squared-fusion-gcal': IStatusSummaryForAService;
    'squared-fusion-o365': IStatusSummaryForAService;
    'squared-fusion-uc': IStatusSummaryForAService;
  };
}

interface IStatusSummaryForACluster {
  [clusterId: string]: number;
}
interface IStatusSummaryForAService {
  activated: number;
  activatedWithWarning: number;
  error: number;
  notActivated: number;
  notActivatedWithWarning: number;
  total: number;
}
interface IClusterSipDomain {
  clusterId: string;
  sipDomain: string;
}

export interface IExtendedStatusByClusters {
  id: string;
  serviceId: HybridServiceId;
  users: number;
}

export type IExtendedStatusSummary = IStatusSummaryForAService & {serviceId: HybridServiceId};

export interface IUserProps {
  userId: string;
  resourceGroups: {
    'squared-fusion-cal'?: string,
    'squared-fusion-uc'?: string,
    'squared-fusion-ec'?: string,
    'spark-hybrid-impinterop'?: string,
  };
}

export interface IUserStatusWithExtendedMessages extends IUserStatus {
  owner: string;
  messages: IMessageExtended[];
  hasWarnings?: boolean;
}

type UserStatus = 'activated' | 'notActivated' | 'error';

interface IUserStatus {
  connectorId?: string;
  clusterId?: string;
  entitled: boolean;
  lastStateChange: string;
  lastStatusUpdate: string;
  messages: IMessage[];
  orgId: string;
  resourceGroupId?: string;
  serviceId: HybridServiceId;
  state: UserStatus;
  userId: string;
  owner?: string;
}

export interface IMessage {
  description: string;
  key: string;
  replacementValues?: IReplacementValue[];
  severity: 'warning' | 'info' | 'error';
  title?: string;
}

export interface IMessageExtended extends IMessage {
  iconClass: string;
}

interface IJournalEntry {
  time: string;
  entry: {
    type: string;
    payload: {
      orgId: string;
      userId: string;
      serviceId: HybridServiceId;
      state?: string;
      description?: string;
      descriptionKey?: string;
      lastStateChange?: string;
      lastStatusUpdate?: string;
      messages: IMessage[];
      resourceGroupId?: string;
      userType: string;
    },
    context: {
      userType: string;
      userId: string;
      trackingRoot: string;
    };
  };
}

export interface IUSSOrg {
  id: string;
  sipDomain: string;
}

interface IUserStatusesResponse {
  userStatuses: IUserStatus[];
  paging: {
    count: number;
    limit?: number;
    next?: string;
    pages?: number;
  };
}

interface IUserJournalResponse {
  entries: IJournalEntry[];
  paging: {
    count: number;
    limit?: number;
    next?: string;
    pages?: number;
  };
}

interface IUserPropsSummary {
  userCountByResourceGroup: {
    numberOfUsers: number;
    resourceGroupId: string;
    validAsOf: string;
  }[];
}

// Will it always be the same as IAlarmReplacementValues in hybrid-services.types.ts?
interface IReplacementValue {
  key: string;
  value: string; // TODO: Could it really be a number if type === 'timestamp'?
  type?: string;
}

export class USSService {
  private cachedUserStatusSummary: IStatusSummary;
  private USSUrl = `${this.UrlConfig.getUssUrl()}uss/api/v1`;
  private hub = this.CsdmHubFactory.create();

  public subscribeStatusesSummary: Function;

  /* @ngInject */
  constructor(
    private $http: ng.IHttpService,
    private $translate: ng.translate.ITranslateService,
    private Authinfo,
    private CsdmHubFactory: CsdmHubFactory,
    private CsdmPoller: CsdmPollerFactory,
    private HybridServicesI18NService: HybridServicesI18NService,
    private UrlConfig,
  ) {
    this.extractAndTweakUserStatuses = this.extractAndTweakUserStatuses.bind(this);
    this.extractData = this.extractData.bind(this);
    this.extractJournalEntries = this.extractJournalEntries.bind(this);
    this.fetchStatusesSummary = this.fetchStatusesSummary.bind(this);
    this.hub.on = this.hub.on.bind(this);
    this.subscribeStatusesSummary = this.hub.on;

    this.CsdmPoller.create(this.fetchStatusesSummary, this.hub);
  }

  public decorateWithStatus(status: any): 'unknown' | 'not_entitled' | 'error' | 'pending_activation' | 'activated' {
    if (!status) {
      return 'unknown';
    }
    if (!status.entitled) {
      return 'not_entitled';
    }
    switch (status.state) {
      case 'error':
        return 'error';
      case 'deactivated':
      case 'notActivated':
        return 'pending_activation';
      case 'activated':
        return 'activated';
      default:
        return 'unknown';
    }
  }

  public extractSummaryForAService(servicesId: HybridServiceId[]): IExtendedStatusSummary[] {
    if (!this.cachedUserStatusSummary) {
      return [];
    }
    const result = _.map(servicesId, (serviceId) => {
      return {
        ...this.cachedUserStatusSummary.countsByState[serviceId],
        serviceId: serviceId,
      };
    });
    return result;
  }

  public extractSummaryForClusters(servicesId: HybridServiceId[]): IExtendedStatusByClusters[] {
    if (!this.cachedUserStatusSummary) {
      return [];
    }
    let result = _.map(servicesId, (serviceId) => {
      return _.reduce(this.cachedUserStatusSummary.countsByCluster[serviceId], (acc, users, id) => {
        if (id) {
          acc.push({
            id: id,
            serviceId: serviceId,
            users: users,
          });
        }
        return acc;
      }, <any>[]);
    });
    result = _.flatten(result);
    return result;
  }

  public getAllStatuses(serviceId: HybridServiceId, state?: UserStatus): ng.IPromise<IUserStatusWithExtendedMessages[]> {
    if (serviceId === 'squared-fusion-o365') {
      serviceId = 'squared-fusion-cal';
    }
    return this.recursivelyReadStatuses(`${this.USSUrl}/orgs/${this.Authinfo.getOrgId()}/userStatuses?includeMessages=true&${this.statusesParameterRequestString(serviceId, state, 10000)}`)
      .then(this.extractAndTweakUserStatuses);
  }

  public getAllUserProps(orgId = this.Authinfo.getOrgId()): ng.IPromise<IUserProps[]> {
    return this.$http
      .get<IUserProps[]>(`${this.USSUrl}/orgs/${(orgId)}/userProps`)
      .then(this.extractUserProps);
  }

  public getOrg(orgId: string): ng.IPromise<IUSSOrg> {
    return this.$http
      .get<IUSSOrg>(`${this.USSUrl}/orgs/${orgId}`)
      .then(this.extractData);
  }

  public getStatusesForUser(userId: string, orgId = this.Authinfo.getOrgId()): ng.IPromise<IUserStatusWithExtendedMessages[]> {
    return this.$http
      .get<IUserStatusesResponse>(`${this.USSUrl}/orgs/${(orgId)}/userStatuses?includeMessages=true&entitled=true&userId=${userId}`)
      .then(this.extractAndTweakUserStatuses);
  }

  public getStatusesSummary(): IStatusSummary | {} {
    return (this.cachedUserStatusSummary && this.cachedUserStatusSummary.countsByState) || {};
  }

  public getUserJournal(userId: string, orgId = this.Authinfo.getOrgId(), limit?: number, serviceId?: HybridServiceId): ng.IPromise<IJournalEntry[]> {
    return this.$http
      .get<IUserJournalResponse>(`${this.USSUrl}/orgs/${(orgId)}/userJournal/${userId}${(limit ? `?limit=${limit}` : '')}${(serviceId ? `&serviceId=${serviceId}` : '')}`)
      .then(this.extractJournalEntries);
  }

  public getUserProps(userId: string, orgId = this.Authinfo.getOrgId()): ng.IPromise<IUserProps> {
    return this.$http
      .get<IUserProps>(`${this.USSUrl}/orgs/${(orgId)}/userProps/${userId}`)
      .then(this.extractData);
  }

  public getUserPropsSummary(orgId = this.Authinfo.getOrgId()): ng.IPromise<IUserPropsSummary> {
    return this.$http
      .get<IUserPropsSummary>(`${this.USSUrl}/orgs/${(orgId)}/userProps/summary`)
      .then(this.extractData);
  }

  public invalidateHybridUserCache = (): ng.IPromise<''> => {
    return this.$http.post<''>(`${this.USSUrl}/internals/actions/invalidateUser/invoke`, null)
      .then(this.extractData);
  }

  public refreshEntitlementsForUser(userId: string, orgId = this.Authinfo.getOrgId()): ng.IPromise<''> {
    return this.$http
      .post<''>(`${this.USSUrl}/userStatuses/actions/refreshEntitlementsForUser/invoke?orgId=${(orgId)}&userId=${userId}`, null)
      .then(this.extractData);
  }

  public removeAllUsersFromResourceGroup(resourceGroupId: string): ng.IPromise<''> {
    return this.$http
      .post<''>(`${this.USSUrl}/orgs/${this.Authinfo.getOrgId()}/actions/removeAllUsersFromResourceGroup/invoke?resourceGroupId=${resourceGroupId}`, null)
      .then(this.extractData);
  }

  public updateBulkUserProps(props: IUserProps[], orgId = this.Authinfo.getOrgId()): ng.IPromise<''> {
    return this.$http
      .post<''>(`${this.USSUrl}/orgs/${(orgId)}/userProps`, { userProps: props })
      .then(this.extractData);
  }

  public updateOrg(org: IUSSOrg): ng.IPromise<IUSSOrg> {
    return this.$http
      .patch<IUSSOrg>(`${this.USSUrl}/orgs/${org.id}`, org)
      .then(this.extractData);
  }

  public getStatusSeverity(status: string): -1 | 0 | 1 | 2 | 3 {
    switch (status) {
      case 'not_entitled':
        return 0;
      case 'activated':
        return 1;
      case 'pending_activation':
        return 2;
      case 'error':
        return 3;
      default:
        return -1;
    }
  }

  public resetOwnershipForAllUsers(orgId = this.Authinfo.getOrgId()): ng.IPromise<''> {
    return this.$http
      .post<''>(`${this.USSUrl}/orgs/${orgId}/actions/resetOwnershipForAllUsers/invoke`, null, {
        params: {
          serviceId: 'squared-fusion-cal',
        },
      })
      .then(this.extractData);
  }

  public getSipDestinationForClusters(orgId = this.Authinfo.getOrgId()): ng.IPromise<IClusterSipDomain[]> {
    return this.$http
      .get<{ items: IClusterSipDomain[] }>(`${this.USSUrl}/orgs/${orgId}/clusterSipDomains`)
      .then(this.extractData)
      .then(response => response.items)
      .catch(() => []); // HACK: while this API is not deployed to production, handle the 404 like this
  }

  public addSipDomainForCluster(clusterId: string, sipDomain: string, orgId = this.Authinfo.getOrgId()): ng.IPromise<any> {
    return this.$http
      .post<any>(`${this.USSUrl}/orgs/${orgId}/clusterSipDomains`, {
        clusterId: clusterId,
        sipDomain: sipDomain,
      })
      .then(this.extractData);
  }

  public deleteSipDomainForCluster(clusterId: string, orgId = this.Authinfo.getOrgId()): ng.IPromise<any> {
    return this.$http
      .delete<any>(`${this.USSUrl}/orgs/${orgId}/clusterSipDomains/${clusterId}`)
      .then(this.extractData);
  }

  public removeSipDomainForCluster(clusterId: string, orgId = this.Authinfo.getOrgId()): ng.IPromise<''> {
    return this.$http
      .delete<''>(`${this.USSUrl}/orgs/${orgId}/clusterSipDomains/${clusterId}`)
      .then(this.extractData);
  }

  private convertToTranslateReplacements(messageReplacementValues: IReplacementValue[] | undefined): object {
    if (!messageReplacementValues) {
      return {};
    }
    return _.reduce(messageReplacementValues, (translateReplacements, replacementValue) => {
      translateReplacements[replacementValue.key] = replacementValue.type === 'timestamp' ? this.HybridServicesI18NService.getLocalTimestamp(replacementValue.value) : replacementValue.value;
      return translateReplacements;
    }, {});
  }

  private fetchStatusesSummary(): ng.IPromise<void> {
    return this.$http
      .get(`${this.USSUrl}/orgs/${this.Authinfo.getOrgId()}/userStatuses/summary`)
      .then((res) => {
        this.cachedUserStatusSummary  = _.get(res, 'data');
        // res.data.countsByOwnerAndState.squared-fusion-cal.XXX can be undefined
        const o365 = _.get<IStatusSummaryForAService>(res, 'data.countsByOwnerAndState.squared-fusion-cal.ccc', {
          total:	0,
          notActivated:	0,
          notActivatedWithWarning:	0,
          activated:	0,
          activatedWithWarning:	0,
          error:	0,
        });
        const onPremExchange = _.get<IStatusSummaryForAService>(res, 'data.countsByOwnerAndState.squared-fusion-cal.uss', {
          total:	0,
          notActivated:	0,
          notActivatedWithWarning:	0,
          activated:	0,
          activatedWithWarning:	0,
          error:	0,
        });
        // Add an entry to the cache for Office 365
        if (o365) {
          this.cachedUserStatusSummary.countsByState['squared-fusion-o365'] = o365;
        }
        // Override `squared-fusion-cal` by the value for on-premise Exchange (otherwise it's the sum of on-premise Exchange + Office 365)
        this.cachedUserStatusSummary.countsByState['squared-fusion-cal'] = onPremExchange;
      });
  }

  // From how this method is used, `any` should be `ng.IHttpResponse<any> | IUserStatus[]`
  private extractAndTweakUserStatuses(res: any): IUserStatusWithExtendedMessages[] {
    const userStatuses: IUserStatus[] = res.data ? res.data.userStatuses : res;
    const result = _.chain(userStatuses)
      .map((userStatus) => {
        userStatus.messages = this.sortAndTweakUserMessages(userStatus.messages);
        return userStatus;
      })
      .value();
    return result as IUserStatusWithExtendedMessages[];
  }

  private extractData<T>(res: ng.IHttpResponse<T>): T {
    return res.data;
  }

  private extractJournalEntries(res: ng.IHttpResponse<any>): IJournalEntry[] {
    const entries: IJournalEntry[] = res.data.entries || [];
    const result = _.chain(entries)
      .map((entry) => {
        if (entry.entry.payload) {
          entry.entry.payload.messages = this.sortAndTweakUserMessages(entry.entry.payload.messages);
        }
        return entry;
      })
      .value();
    return result;
  }

  private extractUserProps(res: ng.IHttpResponse<any>): IUserProps[] {
    return res.data.userProps;
  }

  private getMessageIconClass(severity: string): 'icon-error' | 'icon-warning' | 'icon-info' {
    switch (severity) {
      case 'error':
        return 'icon-error';
      case 'warning':
        return 'icon-warning';
      default:
        return 'icon-info';
    }
  }

  private getMessageSortOrder(severity: string): 0 | 1 | 2 {
    switch (severity) {
      case 'error':
        return 0;
      case 'warning':
        return 1;
      default:
        return 2;
    }
  }

  private recursivelyReadStatuses(statusesUrl: string): ng.IPromise<IUserStatus[]> {
    return this.$http
      .get<IUserStatusesResponse>(statusesUrl)
      .then(this.extractData)
      .then((response) => {
        if (response.paging && response.paging.next) {
          return this.recursivelyReadStatuses(response.paging.next)
            .then((statuses) => response.userStatuses.concat(statuses));
        } else {
          return response.userStatuses;
        }
      });
  }

  private sortAndTweakUserMessages(messages: IMessage[]): IMessageExtended[] {
    if (_.size(messages) > 0) {
      const result = _.chain(messages)
        .sortBy((message) => this.getMessageSortOrder(message.severity))
        .map((message) => {
          const translateReplacements = this.convertToTranslateReplacements(message.replacementValues);
          const extendedMessage: IMessageExtended = _.extend({}, message, {
            title: this.translateWithFallback(message.key + '.title', message.title || '', translateReplacements),
            description: this.translateWithFallback(message.key + '.description', message.description, translateReplacements),
            iconClass: this.getMessageIconClass(message.severity),
          });
          return extendedMessage;
        })
        .value();
      return result;
    }
    return [];
  }

  private statusesParameterRequestString(serviceId: HybridServiceId, status?: UserStatus, limit?: number): string {
    const statefilter = status ? `&state=${status}` : '';
    return `serviceId=${serviceId}${statefilter}&limit=${limit}&entitled=true`;
  }

  private translateWithFallback(messageKey: string, fallback: string, translateReplacements: object): string {
    const translationKey = `hercules.userStatusMessages.${messageKey}`;
    const translation = this.$translate.instant(translationKey, translateReplacements);
    return _.includes(translation, translationKey) ? fallback : translation;
  }
}

export default angular
  .module('hercules.uss', [
    require('modules/core/config/urlConfig'),
    require('modules/core/scripts/services/authinfo'),
    require('modules/hercules/services/hybrid-services-i18n.service').default,
    require('modules/squared/devices/services/CsdmPoller'),
  ])
  .service('USSService', USSService)
  .name;
