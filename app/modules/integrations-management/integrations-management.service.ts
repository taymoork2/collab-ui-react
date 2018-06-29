import { IApplicationAdoptedUsers, IApplicationUsage, IApplicationUsageList, ICustomPolicy, IGlobalPolicy, IIntegrationsManagementService, IListOptions, PolicyAction, PolicyType } from './integrations-management.types';

export class IntegrationsManagementService implements IIntegrationsManagementService {

  /* @ngInject */
  constructor(
    private $http: ng.IHttpService,
    private Authinfo,
    private UrlConfig,
  ) {}

  public listIntegrations(options: IListOptions = {}): ng.IPromise<IApplicationUsage[]> {
    return this.$http.get<IApplicationUsageList>(this.applicationUsageUrl, {
      params: {
        orgId: this.orgId,
        ...options,
      },
    }).then(response => response.data.items);
  }

  public getIntegration(appId: string): ng.IPromise<IApplicationUsage> {
    return this.$http.get<IApplicationUsage>(this.applicationUsageUrl, {
      params: {
        appId: appId,
        orgId: this.orgId,
      },
    }).then(response => response.data);
  }

  public getGlobalAccessPolicy(): ng.IPromise<IGlobalPolicy | undefined> {
    return this.$http.get<IGlobalPolicy>(this.policiesUrl, {
      params: {
        orgId: this.orgId,
        type: PolicyType.DEFAULT,
      },
    }).then(response => response.data); // TODO(brspence): confirm behavior of API if not found
  }

  public createGlobalAccessPolicy(action: PolicyAction): ng.IPromise<void> {
    return this.$http.post<void>(this.policiesUrl, {
      action,
      orgId: this.orgId,
      type: PolicyType.DEFAULT,
    }).then(response => response.data);
  }

  public updateGlobalAccessPolicy(id: string, action: PolicyAction): ng.IPromise<void> {
    return this.$http.put<void>(`${this.policiesUrl}/${encodeURIComponent(id)}`, {
      action,
      orgId: this.orgId,
    }).then(response => response.data);
  }

  public getCustomPolicy(id: string): ng.IPromise<ICustomPolicy> {
    return this.$http.get<ICustomPolicy>(`${this.policiesUrl}/${encodeURIComponent(id)}`)
      .then(response => response.data);
  }

  public createCustomPolicy(appId: string, action: PolicyAction, userIds?: string[]): ng.IPromise<void> {
    return this.$http.post<void>(this.policiesUrl, {
      action,
      appId,
      orgId: this.orgId,
      personIds: userIds,
      type: PolicyType.CUSTOM,
    }).then(response => response.data);
  }

  public updateCustomPolicy(id: string, appId: string, action: PolicyAction, userIds?: string[]): ng.IPromise<void> {
    return this.$http.put<void>(`${this.policiesUrl}/${encodeURIComponent(id)}`, {
      action,
      appId,
      orgId: this.orgId,
      personIds: userIds,
      type: PolicyType.CUSTOM,
    }).then(response => response.data);
  }

  public deleteCustomPolicy(id: string): ng.IPromise<void> {
    return this.$http.delete<void>(`${this.policiesUrl}/${encodeURIComponent(id)}`) // TODO(brspence): confirm no payload needed
      .then(response => response.data);
  }

  public hasCustomPolicyByAction(_action: PolicyAction): ng.IPromise<boolean> {
    // TODO(brspence): confirm API to query - application/usage or policies
    throw new Error('Method not implemented.');
  }

  public revokeTokensForIntegration(clientId: string): ng.IPromise<void> {
    return this.$http.post<void>(this.revokeTokensUrl, {
      clientIds: [clientId],
    }).then(response => response.data);
  }

  public listAdoptedUsersForIntegration(clientId: string): ng.IPromise<string[]> {
    return this.$http.get<IApplicationAdoptedUsers>(this.getAdoptedUsersUrl(clientId))
      .then(response => response.data.emails);
  }

  private get orgId(): string {
    return this.Authinfo.getOrgId();
  }

  private get applicationUsageUrl(): string {
    return `${this.UrlConfig.getHydraServiceUrl()}/applications/usage`;
  }

  private get policiesUrl(): string {
    return `${this.UrlConfig.getHydraServiceUrl()}/policies`;
  }

  private get revokeTokensUrl() {
    return `${this.UrlConfig.getOAuth2Url()}${encodeURIComponent(this.orgId)}/actions/revokeTokens`;
  }

  private getAdoptedUsersUrl(clientId: string) {
    return `${this.UrlConfig.getOAuth2Url()}${encodeURIComponent(this.orgId)}/adoptedUsers/${encodeURIComponent(clientId)}`;
  }
}
