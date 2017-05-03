import { CsdmConverter } from './CsdmConverter';

class CsdmCodeService {
  private codesUrl: string;
  /* @ngInject  */
  constructor(private $http, Authinfo, UrlConfig, private CsdmConverter: CsdmConverter) {
    this.codesUrl = UrlConfig.getCsdmServiceUrl() + '/organization/' + Authinfo.getOrgId() + '/codes';
  }

  public createCodeForExisting(cisUuid) {
    return this.$http.post(this.codesUrl, {
      cisUuid: cisUuid,
    }).then((res) => {
      return this.CsdmConverter.convertCode(res.data);
    });
  }
}

module.exports = angular
  .module('Squared')
  .service('CsdmCodeService', CsdmCodeService)
  .name;
