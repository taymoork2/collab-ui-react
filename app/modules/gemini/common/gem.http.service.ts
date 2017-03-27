export class GmHttpService {

  private gemUrl;
  private httpConfig: any = {};
  private HTTP_GET: string = 'GET';
  private HTTP_POST: string = 'POST';
  private HTTP_PUT: string = 'PUT';
  private HTTP_PATCH: string = 'PATCH';
  private HTTP_DELETE: string = 'DELETE';
  private headers = {
    'Content-Type': 'application/json',
  };

  /* @ngInject */
  constructor(
    private UrlConfig,
    private $http: ng.IHttpService,
  ) {
    this.gemUrl = this.UrlConfig.getGeminiUrl();
  }

  public httpGet(url: string, headers: any = undefined, params: any = undefined) {
    this.setHttpConfig(this.gemUrl + url, this.HTTP_GET, headers, params);
    return this.$http(this.httpConfig);
  }

  public httpPost(url: string, headers: any = undefined, params: any = undefined, data: any = undefined) {
    this.setHttpConfig(this.gemUrl + url, this.HTTP_POST, headers, params, data);
    return this.$http(this.httpConfig);
  }

  public httpPut(url: string, headers: any = undefined, params: any = undefined, data: any = undefined) {
    this.setHttpConfig(this.gemUrl + url, this.HTTP_PUT, headers, params, data);
    return this.$http(this.httpConfig);
  }

  public httpPatch(url: string, headers: any = undefined, params: any = undefined, data: any = undefined) {
    this.setHttpConfig(this.gemUrl + url, this.HTTP_PATCH, headers, params, data);
    return this.$http(this.httpConfig);
  }

  public httpDelete(url: string, headers: any = undefined, params: any = undefined) {
    this.setHttpConfig(this.gemUrl + url, this.HTTP_DELETE, headers, params);
    return this.$http(this.httpConfig);
  }

  private setHttpConfig(url: string, method: string, headers: any = this.headers, params: any = {}, data: any = {}) {
    this.httpConfig = {};
    this.httpConfig.url = url;
    this.httpConfig.method = method;
    this.httpConfig.headers = headers;
    this.httpConfig.params = params;
    this.httpConfig.data = data;
  }

}
