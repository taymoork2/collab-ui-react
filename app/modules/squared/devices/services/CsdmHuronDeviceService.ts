import { CsdmConverter } from './CsdmConverter';

class CsdmHuronUserDeviceService {


  /* @ngInject  */
  constructor(private $http, private $q, private Authinfo, private  HuronConfig, private CsdmConverter, private  UrlConfig) {
  }

  public create(userId) {
    const devicesUrl = this.UrlConfig.getCsdmServiceUrl() + '/organization/' + this.Authinfo.getOrgId() + '/devices/?cisUuid=' + userId + '&type=huron';
    return new CsdmHuronDeviceService(this.$http, this.$q, this.Authinfo, this.HuronConfig, this.CsdmConverter, this.UrlConfig, devicesUrl);

  }
}
class CsdmHuronOrgDeviceService {
  private devicesUrl: string;

  /* @ngInject  */
  constructor(private $http, private $q, private Authinfo, private  HuronConfig, private CsdmConverter, private UrlConfig) {
    this.devicesUrl = UrlConfig.getCsdmServiceUrl() + '/organization/' + Authinfo.getOrgId() + '/devices/?type=huron';
  }

  public create() {
    return new CsdmHuronDeviceService(this.$http, this.$q, this.Authinfo, this.HuronConfig, this.CsdmConverter, this.UrlConfig, this.devicesUrl);
  }
}

class CsdmHuronDeviceService {

  private deviceList = {};
  private loadedData = false;

  constructor(private $http, private  $q, private  Authinfo, private  HuronConfig, private  CsdmConverter: CsdmConverter, private UrlConfig, private  devicesUrl) {
  }

  private huronEnabled() {
    return this.$q.resolve(this.Authinfo.isSquaredUC());
  }

  private getFindDevicesUrl(userId) {
    return this.UrlConfig.getCsdmServiceUrl() + '/organization/' + this.Authinfo.getOrgId() + '/devices/?cisUuid=' + userId + '&type=huron';
  }

  private getCmiUploadLogsUrl(userId, deviceId) {
    return this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/users/' + userId + '/phones/' + deviceId + '/commands/logs';
  }

  private getDirectoryNumbersUrl(userId) {
    return this.HuronConfig.getCmiUrl() + '/voice/customers/' + this.Authinfo.getOrgId() + '/users/' + userId + '/directorynumbers';
  }

  private getAlternateNumbersUrl(directoryNumberId) {
    return this.HuronConfig.getCmiUrl() + '/voice/customers/' + this.Authinfo.getOrgId() + '/directorynumbers/' + directoryNumberId + '/alternatenumbers?alternatenumbertype=%2BE.164+Number';
  }

  private getPhoneUrl(deviceId, cisUuid) {
    return this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/users/' + cisUuid + '/phones/' + deviceId;
  }

  private getAtaUrl(deviceId, cisUuid) {
    return this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/users/' + cisUuid + '/phones/' + deviceId + '/ata190s';
  }

  public fetch() {
    return this.huronEnabled().then((enabled) => {
      return !enabled ? this.$q.resolve([]) : this.$http.get(this.devicesUrl).then((res) => {
        this.loadedData = true;
        _.extend(this.deviceList, this.CsdmConverter.convertHuronDevices(res.data));
      }, () => {
        this.loadedData = true;
      });
    });
  }

  public fetchDevices() {
    return this.$http.get(this.devicesUrl).then((res) => {
      return this.CsdmConverter.convertHuronDevices(res.data);
    });
  }

  public fetchItem(url) {
    return this.$http.get(url).then((res) => {
      return this.CsdmConverter.convertHuronDevice(res.data);
    });
  }

  public dataLoaded() {
    return !this.Authinfo.isSquaredUC() || this.loadedData;
  }

  public getDeviceList() {
    return this.deviceList;
  }

  public deleteItem(device) {
    return this.$http.delete(device.url);
  }

  public deleteDevice(deviceUrl) {
    return this.$http.delete(deviceUrl);
  }

  public getDevicesForPlace(cisUuid) {
    return this.$http.get(this.getFindDevicesUrl(cisUuid)).then((res) => {
      return this.CsdmConverter.convertHuronDevices(res.data);
    });
  }

  public getLinesForDevice(huronDevice) {
    return this.$http.get(this.getDirectoryNumbersUrl(huronDevice.cisUuid))
      .then((res) => {
        const lines: {}[] = [];
        return this.$q.all(_.map(res.data, (directoryNumber: any) => {
          const line: any = {
            directoryNumber: directoryNumber.directoryNumber.pattern,
            usage: directoryNumber.dnUsage,
          };
          return this.$http.get(this.getAlternateNumbersUrl(directoryNumber.directoryNumber.uuid)).then((alternates) => {
            if (alternates.data && alternates.data[0]) {
              line.alternate = alternates.data[0].numMask;
            }
            lines.push(line);
          });
        })).then(() => {
          return lines;
        });
      });
  }

  public getDeviceInfo(huronDevice) {
    return this.$http.get(this.getPhoneUrl(huronDevice.huronId, huronDevice.cisUuid))
      .then((res) => {
        const response: any = {
          timeZone: null,
        };
        if (res.data) {
          response.timeZone = res.data.timeZone;
          response.country = res.data.country;
          response.emergencyCallbackNumber = res.data.emergencyCallbackNumber.number;
        }
        return response;
      });
  }

  public getAtaInfo(huronDevice) {
    return this.$http.get(this.getAtaUrl(huronDevice.huronId, huronDevice.cisUuid))
      .then((res) => {
        const response = {
          port: null,
          inputAudioLevel: null,
          outputAudioLevel: null,
          t38FaxEnabled: false,
          cpcDelay: 2,
        };
        if (res.data) {
          response.port = res.data.port;
          response.inputAudioLevel = res.data.inputAudioLevel;
          response.outputAudioLevel = res.data.outputAudioLevel;
          response.t38FaxEnabled = res.data.t38FaxEnabled;
          response.cpcDelay = res.data.cpcDelay;
        }
        return response;
      });
  }

  public setTimezoneForDevice(huronDevice, timezone) {
    return this.$http.put(this.getPhoneUrl(huronDevice.huronId, huronDevice.cisUuid), {
      timeZone: timezone,
    });
  }

  public setSettingsForAta(huronDevice, settings) {
    return this.$http.put(this.getAtaUrl(huronDevice.huronId, huronDevice.cisUuid), settings);
  }

  public setCountryForDevice(huronDevice, country) {
    return this.$http.put(this.getPhoneUrl(huronDevice.huronId, huronDevice.cisUuid), {
      country: country,
    });
  }

  public setEmergencyCallback(huronDevice, emergencyCallbackNumber) {
    return this.$http.put(this.getPhoneUrl(huronDevice.huronId, huronDevice.cisUuid), {
      emergencyCallbackNumber: {
        number: emergencyCallbackNumber,
      },
    });
  }

  public resetDevice(url) {
    return this.$http.put(url, {
      actions: {
        reset: true,
      },
    });
  }

  public uploadLogs(device, feedbackId) {
    return this.$http.post(this.getCmiUploadLogsUrl(device.cisUuid, device.huronId), {
      ticketId: feedbackId,
    });
  }
}

module.exports =
  angular
    .module('Squared')
    .service('CsdmHuronOrgDeviceService', CsdmHuronOrgDeviceService)
    .service('CsdmHuronUserDeviceService', CsdmHuronUserDeviceService)
    .name;
