import { IAutoAssignTemplateRequestPayload } from 'modules/core/users/shared/onboard.interfaces';

export class AutoAssignTemplateService {

  private autoAssignTemplateUrl: string;

  /* @ngInject */
  constructor(
    private $http: ng.IHttpService,
    private Authinfo,
    private UrlConfig,
  ) {
    this.autoAssignTemplateUrl = `${this.UrlConfig.getAdminServiceUrl()}/organizations/${this.Authinfo.getOrgId()}/templates`;
  }

  public save(payload: IAutoAssignTemplateRequestPayload): ng.IPromise<any> {
    return this.$http.post(this.autoAssignTemplateUrl, payload);
  }
}
