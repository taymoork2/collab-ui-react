export class MediaServiceAuditService {

  /* @ngInject */
  constructor(
    private $http: ng.IHttpService,
    private Authinfo,
    private UrlConfig,
  ) {}

  public devOpsAuditEvents(entity, operation, id): IPromise<ng.IHttpResponse<{}>> {
    const payLoad = {
      entity: entity,
      operation: operation,
      id: id,
    };
    const url = this.UrlConfig.getAthenaServiceUrl() + '/devops/organizations/' + this.Authinfo.getOrgId() + '/auditEvent';
    return this.$http.post(url, payLoad);
  }
}

angular
.module('Mediafusion')
.service('MediaServiceAuditService', MediaServiceAuditService);
