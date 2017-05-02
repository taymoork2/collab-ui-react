import IPromise = ng.IPromise;
export class CsdmUpgradeChannelService {
  private channelsUrl: string;
  private channelsPromise: IPromise<any>;

  /* @ngInject  */
  constructor(private $http, Authinfo, UrlConfig) {
    this.channelsUrl = UrlConfig.getCsdmServiceUrl() + '/organization/' + Authinfo.getOrgId() + '/upgradeChannels';

    this.channelsPromise = $http.get(this.channelsUrl).then((res) => {
      return res.data;
    });
  }

  public getUpgradeChannelsPromise() {
    return this.channelsPromise;
  }

  public updateUpgradeChannel(deviceUrl, newUpgradeChannel) {
    return this.$http.post(deviceUrl + '/upgradeChannel', {
      channel: newUpgradeChannel,
    });
  }
}

module.exports =
  angular
    .module('Squared')
    .service('CsdmUpgradeChannelService', CsdmUpgradeChannelService)
    .name;
