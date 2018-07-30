import { IntegrationsManagementService } from 'modules/integrations-management/integrations-management.service';
import { IApplicationUsage, ICustomPolicy, IGlobalPolicy, IIntegrationsManagementService, IListOptions, IUserInfo, PolicyAction, PolicyType, SortOrder, UserQueryType } from './integrations-management.types';

export class IntegrationsManagementFakeService implements IIntegrationsManagementService {
  /* @ngInject */
  constructor(
    private $q: ng.IQService,
    private $timeout: ng.ITimeoutService,
    private Authinfo,
    private $http: ng.IHttpService,
    private IntegrationsManagementService: IntegrationsManagementService,
    private UrlConfig,
  ) {
    this.populateApplicationUsages();
    this.populateCustomPolicies();
  }

  private customPolicies: ICustomPolicy[] = [];
  private customPolicyId = 1;
  private applicationUsages: IApplicationUsage[] = [];
  private globalAccessPolicy?: IGlobalPolicy;

  private readonly ORG_ID = this.Authinfo.getOrgId;

  public listIntegrations(options: IListOptions = {}): IPromise<IApplicationUsage[]> {

    const {
      count = 20,
      start = 0,
      searchStr = null,
      sortBy,
      sortOrder = SortOrder.ASC,
    } = options;

    let result = _.clone(this.applicationUsages);
    if (sortBy) {
      result = _.orderBy(result, sortBy, sortOrder);
    }
    if (!searchStr) {
      result = result.slice(start, start + count);
    } else {
      const filteredList = _.filter(result, usage => _.includes(usage.appName, searchStr));
      result = filteredList.slice(start, start + count);
    }
    if (sortBy) {
      result = _.orderBy(result, sortBy, sortOrder);
    }
    return this.$timeout(() => result, this.randomDelay);
  }

  public getIntegration(appId: string): IPromise<IApplicationUsage> {
    const applicationUsage = this.getApplicationUsageByAppId(appId);
    if (applicationUsage) {
      return this.$timeout(() => applicationUsage, this.randomDelay);
    }
    return this.$timeout(() => this.$q.reject(), this.randomDelay);
  }

  public getGlobalAccessPolicy(): IPromise<IGlobalPolicy | undefined> {
    return this.$timeout(() => this.globalAccessPolicy, this.randomDelay);
  }

  public createGlobalAccessPolicy(action: PolicyAction): ng.IPromise<void> {
    this.globalAccessPolicy = {
      id: '11111',
      orgId: this.ORG_ID,
      name: 'Global Access Policy',
      type: PolicyType.DEFAULT,
      action,
    };
    return this.$timeout(this.randomDelay);
  }

  public updateGlobalAccessPolicy(_id: string, action: PolicyAction): ng.IPromise<void> {
    this.globalAccessPolicy!.action = action;
    return this.$timeout(this.randomDelay);
  }

  public getCustomPolicy(id: string): IPromise<ICustomPolicy> {
    const customPolicy = this.getCustomPolicyById(id);
    if (!customPolicy) {
      return this.$timeout(() => this.$q.reject('Custom Policy not found'), this.randomDelay);
    }
    const url = this.UrlConfig.getScimUrl(this.Authinfo.getOrgId());
    return this.$http.get(url, {
      params: { attributes: 'userName,id', count: this.randomUserNumber },
    }).then((reply) => {
      const users: { id: string }[] = _.get(reply.data, 'Resources', []);
      customPolicy.personIds = _.map(users, 'id');
      return this.$timeout(() => customPolicy, this.randomDelay);
    });
  }

  public createCustomPolicy(appId: string, action: PolicyAction, userIds?: string[] | undefined): IPromise<void> {
    const applicationUsage = this.getApplicationUsageByAppId(appId);
    if (!applicationUsage) {
      return this.$timeout(() => this.$q.reject('Application Usage not found'), this.randomDelay);
    }

    const policyId = `${this.customPolicyId}`;
    const customPolicy: ICustomPolicy = {
      id: policyId,
      orgId: this.ORG_ID,
      name: 'Custom Policy',
      type: PolicyType.CUSTOM,
      action,
      appId,
      personIds: userIds,
    };
    this.customPolicies.push(customPolicy);
    this.customPolicyId += 1;

    applicationUsage.policyId = policyId;
    applicationUsage.policyAction = action;
    return this.$timeout(this.randomDelay);
  }

  public updateCustomPolicy(id: string, appId: string, action: PolicyAction, userIds?: string[]): ng.IPromise<void> {
    const customPolicy = this.getCustomPolicyById(id);
    if (!customPolicy) {
      return this.$timeout(() => this.$q.reject('Custom Policy not found'), this.randomDelay);
    }

    const applicationUsage = this.getApplicationUsageByAppId(appId);
    if (!applicationUsage) {
      return this.$timeout(() => this.$q.reject('Application Usage not found'), this.randomDelay);
    }

    customPolicy.action = action;
    customPolicy.appId = appId;
    customPolicy.personIds = userIds;
    applicationUsage.policyAction = action;

    return this.$timeout(this.randomDelay);
  }

  public deleteCustomPolicy(id: string): IPromise<void> {
    _.remove(this.customPolicies, customPolicy => customPolicy.id === id);
    const applicationUsage = this.getApplicationUsageByPolicyId(id);
    if (!applicationUsage) {
      return this.$timeout(() => this.$q.reject('Application Usage not found'), this.randomDelay);
    }
    delete applicationUsage.policyId;
    applicationUsage.policyAction = this.globalAccessPolicy ? this.globalAccessPolicy.action : PolicyAction.DENY;
    return this.$timeout(this.randomDelay);
  }

  public hasCustomPolicyByAction(action: PolicyAction): IPromise<boolean> {
    const applicationUsageByAction = _.filter(this.applicationUsages, applicationUsage => applicationUsage.policyAction === action);
    return this.$timeout(() => applicationUsageByAction.length > 0, this.randomDelay);
  }

  public revokeTokensForIntegration(clientId: string): IPromise<void> {
    const applicationUsage = this.getApplicationUsageByAppId(clientId);
    if (!applicationUsage) {
      return this.$timeout(() => this.$q.reject('Application Usage not found'), this.randomDelay);
    }
    applicationUsage.appUserAdoption = 0;
    return this.$timeout(this.randomDelay);
  }

  public listAdoptedUsersForIntegration(_clientId: string): IPromise<string[]> {
    return this.$timeout(() => [], this.randomDelay);
  }

  private getApplicationUsageByAppId(appId: string): IApplicationUsage | undefined {
    return _.find(this.applicationUsages, applicationUsage => applicationUsage.appId === appId);
  }

  private getApplicationUsageByPolicyId(policyId: string): IApplicationUsage | undefined {
    return _.find(this.applicationUsages, applicationUsage => applicationUsage.policyId === policyId);
  }

  private getCustomPolicyById(id: string): ICustomPolicy | undefined {
    return _.find(this.customPolicies, customPolicy => customPolicy.id === id);
  }

  private populateApplicationUsages(): void {
    this.applicationUsages = _.times(100, index => {
      const action = _.random(0, 1, false);
      return {
        id: `${index}`,
        orgId: this.ORG_ID,
        appId: `${index}`,
        appName: `Fake Integration ${index}`,
        appClientId: `${index}`,
        appPrivacyUrl: `http://fake-${index}.privacy.url/`,
        appSupportUrl: `http://fake-${index}.support.url/`,
        appCompanyUrl: `http://fake-${index}.company.url/`,
        appContactName: `Fake Contact Name ${index}`,
        appContactEmail: `fake-${index}@contact-email.com`,
        appUserAdoption: 500,
        policyAction: action === 0 ? PolicyAction.DENY : PolicyAction.ALLOW,
        appCreated: '2018-06-08T20:50:19.355Z',
      };
    });
  }

  private populateCustomPolicies(): void {
    _.forEach(this.applicationUsages, applicationUsage => {
      if (applicationUsage.policyAction === PolicyAction.ALLOW) {
        this.createCustomPolicy(applicationUsage.appId, applicationUsage.policyAction);
      }
    });
  }

  private get randomDelay(): number {
    return _.random(500, 1000);
  }

  private get randomUserNumber(): number {
    return _.random(1, 10);
  }

  public getUsers(searchType: UserQueryType, uidOrEmail: string[] | string): ng.IPromise<IUserInfo[]> {
    return this.IntegrationsManagementService.getUsers(searchType, uidOrEmail);
  }

  public getUsersBulk(searchType: UserQueryType, emailsOrIdsArray: string[]): IPromise<IUserInfo[]> {
    return this.IntegrationsManagementService.getUsersBulk(searchType, emailsOrIdsArray);
  }
}
