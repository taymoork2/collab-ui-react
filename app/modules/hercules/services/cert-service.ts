export class CertService {
  private CertsUrl: string;

  /* @ngInject */
  constructor(
    private Utils,
    private $http: ng.IHttpService,
    private UrlConfig,
    private $q: ng.IQService,
    private $window,
  ) {
    this.CertsUrl = `${this.UrlConfig.getCertsUrl()}certificate/api/v1`;
  }

  private extractData(res) {
    return res.data;
  }

  public getCerts(orgId) {
    return this.$http
      .get(`${this.CertsUrl}/certificates?expand=decoded&orgId=${orgId}`)
      .then(this.extractData);
  }

  public uploadCert(orgId, file) {
    let deferred = this.$q.defer();
    let reader = new this.$window.FileReader();
    reader.onloadend =  () => {
      this.$http.post(`${this.CertsUrl}/certificates?orgId=${orgId}`, {
        cert: this.Utils.Base64.encode(reader.result),
      })
        .then(deferred.resolve, deferred.reject);
    };
    reader.readAsBinaryString(file);
    return deferred.promise;
  }

  public deleteCert(certId) {
    return this.$http.delete(`${this.CertsUrl}/certificates/${certId}`);
  }
}
angular
  .module('Hercules')
  .service('CertService', CertService);
