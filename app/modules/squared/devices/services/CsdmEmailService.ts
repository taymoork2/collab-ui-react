class CsdmEmailService {
  private url: string;

  /* @ngInject  */
  constructor(private $http, HuronConfig) {
    this.url = HuronConfig.getEmailUrl() + '/email';
  }

  public sendPersonalEmail(cbEmailInfo) {
    return this.$http.post(this.url + '/personalactivationcode/device', cbEmailInfo);
  }

  public sendPersonalCloudberryEmail(cbEmailInfo) {
    return this.$http.post(this.url + '/personalactivationcode/roomdevice', cbEmailInfo);
  }

  public sendCloudberryEmail(cbEmailInfo) {
    return this.$http.post(this.url + '/placeactivationcode/roomdevice', cbEmailInfo);
  }

  public sendHuronEmail(cbEmailInfo) {
    return this.$http.post(this.url + '/placeactivationcode/deskphone', cbEmailInfo);
  }
}

module.exports = angular
  .module('Squared')
  .service('CsdmEmailService', CsdmEmailService)
  .name;
