export class CertService {
  private CertsUrl: string;

  /* @ngInject */
  constructor(
    private Authinfo,
    private UrlConfig,
    private Utils,
    private $http: ng.IHttpService,
    private $q: ng.IQService,
    private $window,
  ) {
    this.CertsUrl = `${this.UrlConfig.getCertsUrl()}certificate/api/v1`;
  }

  private extractData(res) {
    return res.data;
  }

  public getCerts(orgId: string): ng.IPromise<any> {
    return this.$http
      .get(`${this.CertsUrl}/certificates?expand=decoded&orgId=${orgId}`)
      .then(this.extractData);
  }

  public uploadCert(orgId: string, file: any): ng.IPromise<any> {
    const deferred = this.$q.defer();
    const reader = new this.$window.FileReader();
    reader.onloadend =  () => {
      this.$http.post(`${this.CertsUrl}/certificates?orgId=${orgId}`, {
        cert: this.Utils.Base64.encode(reader.result),
      })
        .then(deferred.resolve, deferred.reject);
    };
    reader.readAsBinaryString(file);
    return deferred.promise;
  }

  public uploadCertificate(orgId: string, file: any): ng.IPromise<any> {
    const deferred = this.$q.defer();
    this.$http.post(`${this.CertsUrl}/certificates?orgId=${orgId}`, {
      cert: this.Utils.Base64.encode(file),
    }).then(deferred.resolve, deferred.reject);
    return deferred.promise;
  }

  public deleteCert(certId: string, orgId?: string): ng.IPromise<any> {
    if (_.isUndefined(orgId)) {
      orgId = this.Authinfo.getOrgId();
    }
    return this.$http.delete(`${this.CertsUrl}/certificates/${certId}?orgId=${orgId}`);
  }
}
export default angular
  .module('hercules.cert', [
    require('modules/core/scripts/services/utils'),
    require('modules/core/config/urlConfig'),
  ])
  .service('CertService', CertService)
  .name;
