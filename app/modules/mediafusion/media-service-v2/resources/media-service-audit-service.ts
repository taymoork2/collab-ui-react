export class MediaServiceAuditService {

  /* @ngInject */
  constructor(
    private $http: ng.IHttpService,
    private Authinfo,
    private UrlConfig,
  ) {}

  public devOpsAuditEvents(payLoad): IPromise<ng.IHttpResponse<{}>> {
    const url = this.UrlConfig.getAthenaServiceUrl() + '/devops/organizations/' + this.Authinfo.getOrgId() + '/auditEvent';
    return this.$http.post(url, payLoad);
  }
}

angular
.module('Mediafusion')
.service('MediaServiceAuditService', MediaServiceAuditService);
