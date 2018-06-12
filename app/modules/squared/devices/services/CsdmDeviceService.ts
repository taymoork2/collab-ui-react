import { CsdmConverter } from './CsdmConverter';
import IHttpService = angular.IHttpService;

export class CsdmDeviceService {
  private devicesUrl: string;
  private devicesFastUrlPostFix: string;
  /* @ngInject  */
  constructor(private $http: IHttpService, Authinfo, UrlConfig, private CsdmConverter: CsdmConverter, private Utils) {
    this.devicesUrl = UrlConfig.getCsdmServiceUrl() + '/organization/' + Authinfo.getOrgId() + '/devices';
    this.devicesFastUrlPostFix = '?checkDisplayName=false&checkOnline=false';
  }

  public fetchDevices(requestFullData?: boolean) {
    let url = this.devicesUrl;
    if (!requestFullData) {
      url += this.devicesFastUrlPostFix;
    }
    return this.$http.get(url).then((res) => {
      return this.CsdmConverter.convertCloudberryDevices(res.data);
    });
  }

  public fetchDevicesForUser(userId, type) {
    return this.$http.get(this.devicesUrl + '?type=' + type + '&cisUuid=' + userId).then((res) => {
      return _.mapValues(res.data, (device) => {
        if (device.productFamily === 'Huron' || device.productFamily === 'ATA') {
          return this.CsdmConverter.convertHuronDevice(device);
        } else {
          return this.CsdmConverter.convertCloudberryDevice(device);
        }
      });
    });
  }

  public fetchItem(url) {
    return this.$http.get(url).then((res) => {
      return this.CsdmConverter.convertCloudberryDevice(res.data);
    });
  }

  public deleteItem(device) {
    return this.$http.delete(device.url + '?keepPlace=true');
  }

  public updateTags(deviceUrl, tags) {
    return this.$http.patch(deviceUrl, {
      description: JSON.stringify(tags || []),
    });
  }

  public notifyDevice(deviceUrl, message) {
    return this.$http.post(deviceUrl + '/notify', message);
  }

  // //Grey list:
  public uploadLogs(deviceUrl, feedbackId, email) {
    return this.notifyDevice(deviceUrl, {
      command: 'logUpload',
      eventType: 'room.request_logs',
      feedbackId: feedbackId,
      email: email,
    });
  }

  public sendAdvancedSettingsOtp(deviceUrl, token, email, displayName) {
    return this.notifyDevice(deviceUrl, {
      command: 'localAccess',
      eventType: 'room.localAccess',
      displayName: displayName,
      email: email,
      token: token,
    });
  }

  // //Grey list:
  public renewRsuKey(deviceUrl, feedbackId, email) {
    return this.notifyDevice(deviceUrl, {
      command: 'renewRSU',
      eventType: 'room.renewRSU',
      feedbackId: feedbackId,
      email: email,
      message: this.Utils.getUUID(),
    });
  }
}
module.exports = angular
  .module('Squared')
  .service('CsdmDeviceService', CsdmDeviceService)
  .name;
