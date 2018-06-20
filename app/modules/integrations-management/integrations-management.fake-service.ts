import { IApplicationUsage, ICustomPolicy, IGlobalPolicy, IIntegrationsManagementService, IListOptions, PolicyAction, PolicyType, SortOrder } from './integrations-management.types';

export class IntegrationsManagementFakeService implements IIntegrationsManagementService {
  /* @ngInject */
  constructor(
    private $q: ng.IQService,
  ) {}

  private customPolicies: ICustomPolicy[] = [];
  private customPolicyId = 1;
  private applicationUsages: IApplicationUsage[] = this.createApplicationUsages();
  private globalAccessPolicy?: IGlobalPolicy;

  private readonly ORG_ID = '55555';

  public listIntegrations(options: IListOptions = {}): IPromise<IApplicationUsage[]> {

    const {
      count = 20,
      start = 0,
      searchStr = null,
      sortBy,
      sortOrder = SortOrder.ASC,
    } = options;

    let result =  _.clone(this.applicationUsages);
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
    return this.$q.resolve(result);
  }

  public getIntegration(appId: string): IPromise<IApplicationUsage> {
    const applicationUsage = this.getApplicationUsageByAppId(appId);
    if (applicationUsage) {
      return this.$q.resolve(applicationUsage);
    }
    return this.$q.reject();
  }

  public getGlobalAccessPolicy(): IPromise<IGlobalPolicy | undefined> {
    return this.$q.resolve(this.globalAccessPolicy);
  }

  public createGlobalAccessPolicy(action: PolicyAction): ng.IPromise<IGlobalPolicy> {
    this.globalAccessPolicy = {
      id: '11111',
      orgId: this.ORG_ID,
      name: 'Global Access Policy',
      type: PolicyType.DEFAULT,
      action,
    };
    return this.$q.resolve(this.globalAccessPolicy);
  }

  public updateGlobalAccessPolicy(_id: string, action: PolicyAction): ng.IPromise<void> {
    this.globalAccessPolicy!.action = action;
    return this.$q.resolve();
  }

  public getCustomPolicy(id: string): IPromise<ICustomPolicy> {
    const customPolicy = this.getCustomPolicyById(id);
    if (!customPolicy) {
      return this.$q.reject('Custom Policy not found');
    }
    return this.$q.resolve(customPolicy);
  }

  public createCustomPolicy(appId: string, action: PolicyAction, userIds?: string[] | undefined): IPromise<void> {
    const applicationUsage = this.getApplicationUsageByAppId(appId);
    if (!applicationUsage) {
      return this.$q.reject('Application Usage not found');
    }

    const policyId = `${this.customPolicyId}`;
    const customPolicy = {
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
    return this.$q.resolve();
  }

  public updateCustomPolicy(id: string, appId: string, action: PolicyAction, userIds?: string[]): ng.IPromise<void> {
    const customPolicy = this.getCustomPolicyById(id);
    if (!customPolicy) {
      return this.$q.reject('Custom Policy not found');
    }
    customPolicy.action = action;
    customPolicy.appId = appId;
    customPolicy.personIds = userIds;
    return this.$q.resolve();
  }

  public deleteCustomPolicy(id: string): IPromise<void> {
    _.remove(this.customPolicies, customPolicy => customPolicy.id === id);
    const applicationUsage = this.getApplicationUsageByPolicyId(id);
    if (!applicationUsage) {
      return this.$q.reject('Application Usage not found');
    }
    delete applicationUsage.policyId;
    return this.$q.resolve();
  }

  public hasCustomPolicyByAction(action: PolicyAction): IPromise<boolean> {
    const applicationUsageByAction = _.filter(this.applicationUsages, applicationUsage => applicationUsage.policyAction === action);
    return this.$q.resolve(applicationUsageByAction.length > 0);
  }

  public revokeTokensForIntegration(clientId: string): IPromise<void> {
    const applicationUsage = this.getApplicationUsageByAppId(clientId);
    if (!applicationUsage) {
      return this.$q.reject('Application Usage not found');
    }
    applicationUsage.appUserAdoption = 0;
    return this.$q.resolve();
  }

  public listAdoptedUsersForIntegration(_clientId: string): IPromise<string[]> {
    return this.$q.resolve([]);
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

  private createApplicationUsages(): IApplicationUsage[] {
    return _.times(100, index => {
      const action = _.random(0, 1, false);
      return {
        id: `${index}`,
        orgId: this.ORG_ID,
        appId: `${index}`,
        appName: `Fake Integration ${index}`,
        appClientId: `${index}`,
        appPrivacyUrl: `http://fake-${index}.privacy.url/`,
        appCompanyUrl: `http://fake-${index}.company.url/`,
        appContactName: `Fake Contact Name ${index}`,
        appContactEmail: `fake-${index}@contact-email.com`,
        appUserAdoption: 500,
        policyAction: action === 0 ? PolicyAction.DENY : PolicyAction.ALLOW,
        appCreated: '2018-06-08T20:50:19.355Z',
      };
    });
  }
}
