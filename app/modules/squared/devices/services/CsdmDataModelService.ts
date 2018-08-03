import { CsdmPlaceService } from './CsdmPlaceService';
import IDevice = csdm.IDevice;
import ICsdmDataModelService = csdm.ICsdmDataModelService;
import { CsdmDeviceService } from './CsdmDeviceService';
import { CsdmCodeService } from './CsdmCodeService';
import IDeferred = ng.IDeferred;
import ITimeoutService = ng.ITimeoutService;
import { CsdmConverter } from './CsdmConverter';
import { CsdmCacheUpdater } from './CsdmCacheUpdater';
import IPlace = csdm.IPlace;
import IDevicePlaceCommon = csdm.IDevicePlaceCommon;
import { CsdmHuronDeviceService, CsdmHuronOrgDeviceService } from './CsdmHuronDeviceService';
import IBasePlace = csdm.IBasePlace;
import { Dictionary } from 'lodash';

export class CsdmDataModelService implements ICsdmDataModelService {

  private theDeviceMap: Dictionary<IDevice> = {};
  private placesDataModel: Dictionary<IPlace> = {};
  private cloudBerryDevicesLoaded = false;
  private huronDevicesLoaded = false;
  private placesLoaded = false;
  private pollingGracePeriodActive = true;

  private devicesFetchedDeferred;  // TODO: revisit using Map with polyfill support - this es5 stub is not really a Map and causes type errors
  private devicesFastFetchedDeferred;
  private placesMapReadyDeferred;
  private accountsFetchedDeferred: IDeferred<Dictionary<IPlace>>;
  private slowResolved;

  private isBigOrgPromise: IPromise<boolean>;
  private placesUrl: string;
  private csdmHuronOrgDeviceService: CsdmHuronDeviceService;

  /* @ngInject  */
  constructor(private $q: angular.IQService,
              private $timeout: ITimeoutService,
              private $rootScope,
              private CsdmCacheUpdater: CsdmCacheUpdater,
              private CsdmDeviceService: CsdmDeviceService,
              private CsdmCodeService: CsdmCodeService,
              private CsdmPlaceService: CsdmPlaceService,
              CsdmHuronOrgDeviceService: CsdmHuronOrgDeviceService,
              private CsdmConverter: CsdmConverter,
              private Authinfo) {

    this.placesUrl = CsdmPlaceService.getPlacesUrl();

    this.csdmHuronOrgDeviceService = CsdmHuronOrgDeviceService.create();
  }

  public isBigOrg(): IPromise<boolean> {

    if (!this.isBigOrgPromise) {
      this.isBigOrgPromise = this.CsdmPlaceService.getSearchPlacesList('xy')//This method/hack was adapted from the users pages
        .then(() => {
          return this.$q.resolve(false);
        })
        .catch((err) => {
          return this.$q.resolve(err !== null && (err.status === 502 || err.status === 412));
        });
    }

    return this.isBigOrgPromise;
  }

  private fetchDevices() {
    this.devicesFetchedDeferred = this.devicesFetchedDeferred || this.$q.defer();
    if (this.slowResolved === false) {
      return this.devicesFetchedDeferred.promise;
    }
    this.slowResolved = false;
    if (!this.devicesFastFetchedDeferred) {

      //First time: kick off get huron devices: //If we disable device polling,
      // we could move csdmHuronOrgDeviceService.fetch out of (!devicesFastFetchedDeferred)
      // so it is refreshed on "single poll"
      this.fetchHuronDevices();
      this.devicesFastFetchedDeferred = this.CsdmDeviceService.fetchDevices() //fast
        .then((deviceMap) => {
          if (!this.slowResolved) {
            this.updateDeviceMap(deviceMap, (existing) => {
              return !existing.isCloudberryDevice();
            });
          }
        })
        .finally(() => {
          this.setCloudBerryDevicesLoaded();
        });
    }

    this.CsdmDeviceService.fetchDevices(true) //slow
      .then((deviceMapSlow) => {
        this.slowResolved = true;
        this.updateDeviceMap(deviceMapSlow, (existing) => {
          return !existing.isCloudberryDevice();
        });
      })
      .finally(() => {
        this.setCloudBerryDevicesLoaded();
      });

    return this.devicesFetchedDeferred.promise;
  }

  private fetchHuronDevices() {
    if (this.hasHuronLicenses()) {
      this.csdmHuronOrgDeviceService.fetchDevices()
        .then((huronDeviceMap) => {
          this.updateDeviceMap(huronDeviceMap, (existing) => {
            return !existing.isHuronDevice();
          });
        })
        .finally(() => {
          this.setHuronDevicesLoaded();
        });
    } else {
      this.setHuronDevicesLoaded();
    }
  }

  private hasHuronLicenses(): boolean {
    return _.filter(
      this.Authinfo.getLicenses(),
      (l: any) => {
        return l.licenseType === 'COMMUNICATION';
      }).length > 0;
  }

  private updateDeviceMap(deviceMap: Dictionary<IDevice>, keepFunction) {

    this.CsdmCacheUpdater.update(this.theDeviceMap, deviceMap, (deletedDevice) => {
      const shouldKeep = keepFunction && keepFunction(deletedDevice);
      if (!shouldKeep) {
        const placeUrl = this.getPlaceUrl(deletedDevice);
        if (this.placesDataModel[placeUrl]) {
          _.unset(this.placesDataModel, [placeUrl, 'devices', deletedDevice.url]); // delete device from the place
        }
      }
      return shouldKeep;
    });

    _.each(_.values(deviceMap), (d: IDevice) => {
      if (d.accountType !== 'PERSON') {
        this.addOrUpdatePlaceInDataModel(d);
      }
    });

    this.updatePlacesCache();
  }

  public subscribeToChanges(scope, callback) {
    const unRegister = this.$rootScope.$on('PLACES_OR_DEVICES_UPDATED', callback);
    scope.$on('$destroy', unRegister);
    return unRegister;
  }

  public notifyDevicesInPlace(cisUuid, event) {
    const place = this.placesDataModel[this.placesUrl + cisUuid];
    if (place) {
      _.each(place.devices, (d) => {
        this.CsdmDeviceService.notifyDevice(d.url, event);
      });
    }
  }

  private notifyListeners() {
    this.$rootScope.$emit('PLACES_OR_DEVICES_UPDATED');
  }

  private setCloudBerryDevicesLoaded() {
    if (!this.cloudBerryDevicesLoaded) {
      this.cloudBerryDevicesLoaded = true;
      if (this.huronDevicesLoaded) {
        this.devicesFetchedDeferred.resolve(this.theDeviceMap);
      }
    }
  }

  private setHuronDevicesLoaded() {
    if (!this.huronDevicesLoaded) {
      this.huronDevicesLoaded = true;

      if (this.cloudBerryDevicesLoaded) {
        this.devicesFetchedDeferred.resolve(this.theDeviceMap);
      }
    }
  }

  private setPlacesLoaded() {
    this.placesLoaded = true;
    this.accountsFetchedDeferred.resolve(this.placesDataModel);
    this.updatePlacesCache();
  }

  private fetchAccounts() {
    this.accountsFetchedDeferred = this.$q.defer();

    this.isBigOrg().then((isBig) => {
      if (isBig) {
        this.setPlacesLoaded();
        return;
      }
      this.CsdmPlaceService.getPlacesList()
        .then((accounts) => {
          _.each(_.values(accounts), (a) => {
            this.addOrUpdatePlaceInDataModel(a);
          });
        })
        .finally(() => {
          this.setPlacesLoaded();
        });
    });

    return this.accountsFetchedDeferred.promise;
  }

  public getDevicesMap(refreshHuron?: boolean): IPromise<Dictionary<IDevice>> {
    if (!this.devicesFetchedDeferred) {
      this.fetchDevices();
    } else if (refreshHuron) {
      this.fetchHuronDevices();
    }

    return this.devicesFetchedDeferred.promise;
  }

  private getAccountsMap(): IPromise<Dictionary<IPlace>> {

    if (!this.accountsFetchedDeferred) {
      this.fetchAccounts();
    }
    return this.accountsFetchedDeferred.promise;
  }

  public deleteItem(item: IDevicePlaceCommon): IPromise<boolean> {

    if (item.isPlace()) {
      return this.CsdmPlaceService.deleteItem(item)
        .then(() => {
          _.unset(this.placesDataModel, [item.url]);
          _.each(_.values(item.devices), (dev: IDevice) => {
            _.unset(this.theDeviceMap, [dev.url]);
          });
          this.notifyListeners();
          return true;
        });
    }

    if (item.isDevice()) {
      return (item.isHuronDevice() ? this.csdmHuronOrgDeviceService.deleteItem(item) : (item.isCloudberryDevice() && this.CsdmDeviceService.deleteItem(item)))
        .then(() => {
          _.unset(this.theDeviceMap, [item.url]);
          const placeUrl = this.getPlaceUrl(item);
          if (this.placesDataModel[placeUrl]) {
            _.unset(this.placesDataModel, [placeUrl, 'devices', item.url]); // delete device from the place
          }
          this.notifyListeners();
          return true;
        });
    }
    return this.$q.reject();
  }

  private getPlaceUrl(device: IBasePlace): string {
    return this.placesUrl + device.cisUuid;
  }

  public createCsdmPlace(name, entitlements, locationUuid, directoryNumber, externalNumber, externalLinkedAccounts): IPromise<IPlace> {
    return this.CsdmPlaceService.createCsdmPlace(name, entitlements, locationUuid, directoryNumber, externalNumber, externalLinkedAccounts)
      .then((place) => {
        return this.onCreatedPlace(place);
      });
  }

  public createCmiPlace(name, entitlements, locationUuid, directoryNumber, externalNumber): IPromise<IPlace> {
    return this.CsdmPlaceService.createCmiPlace(name, entitlements, locationUuid, directoryNumber, externalNumber)
      .then((place) => {
        return this.onCreatedPlace(place);
      });
  }

  public updateCloudberryPlace(objectToUpdate: IPlace,
                               { entitlements, locationUuid, directoryNumber, externalNumber, externalLinkedAccounts }): IPromise<IPlace> {
    const placeUrl = this.getPlaceUrl(objectToUpdate);
    return this.CsdmPlaceService.updatePlace(placeUrl, entitlements, locationUuid, directoryNumber, externalNumber, externalLinkedAccounts)
      .then((place) => {
        this.addOrUpdatePlaceInDataModel(place);
        this.notifyListeners();
        return place;
      });
  }

  public createCodeForExisting(cisUuid) {
    return this.CsdmCodeService.createCodeForExisting(cisUuid);
  }

  public updateItemName(objectToUpdate: IDevicePlaceCommon, newName) {
    if (!objectToUpdate.isPlace()) {
      return this.$q.reject();
    }
    return this.CsdmPlaceService.updateItemName(objectToUpdate, newName)
      .then((updatedObject) => {

        //Keep the devices reference in the places dm:
        const newDeviceList = updatedObject.devices;
        const cachedPlace = this.placesDataModel[objectToUpdate.url];

        if (cachedPlace) {
          updatedObject.devices = cachedPlace.devices;
        }

        _.each(newDeviceList, (updatedDevice) => {
          this.CsdmCacheUpdater.updateOne(this.theDeviceMap, updatedDevice.url, updatedDevice);

          const deviceInPlace = _.find(updatedObject.devices, { url: updatedDevice.url });
          if (deviceInPlace) {
            this.CsdmCacheUpdater.updateSingle(deviceInPlace, updatedDevice.url, updatedDevice);
          }
        });

        const updatedPlace = this.CsdmCacheUpdater.updateOne(this.placesDataModel, updatedObject.url, updatedObject, undefined, true);
        this.notifyListeners();
        return updatedPlace;
      });
  }

  public updateTags(objectToUpdate: IDevice, newTags: string[]): IPromise<IDevice> {

    return this.CsdmDeviceService.updateTags(objectToUpdate, newTags).then(() => {
      const existingDevice = this.theDeviceMap[objectToUpdate.url];
      if (existingDevice) {
        existingDevice.tags = newTags;
        return existingDevice;
      } else {
        objectToUpdate.tags = newTags;
        return objectToUpdate;
      }
    });
  }

  public reloadPlace(item: IPlace): IPromise<IPlace> {
    return this.CsdmPlaceService.fetchItem(item.url || this.getPlaceUrl(item)).then((reloadedPlace) => {
      let deviceDeleted = false;
      _.each(_.difference(_.values(item.devices), _.values(reloadedPlace.devices)), (deletedDevice: any) => {
        const deviceInReloadedPlace: any = _.find(reloadedPlace.devices, { url: deletedDevice.url });
        const deviceInPlace: any = _.find(reloadedPlace.devices, { url: deletedDevice.url });
        if (!deviceInReloadedPlace || _.some(_.difference(deviceInPlace, deletedDevice))) {
          _.unset(this.theDeviceMap, [deletedDevice.url]);
          deviceDeleted = true;
        }
      });

      const updateRes = this.addOrUpdatePlaceInDataModel(reloadedPlace);

      if (!updateRes.placeAddedToCache && (deviceDeleted || updateRes.deviceAdded || updateRes.placeRenamed)) {
        this.notifyListeners();
      }
      return updateRes.item;
    });
  }

  public reloadDevice(item: IDevice): IPromise<IDevice> {

    const service = (item.isHuronDevice() ? this.csdmHuronOrgDeviceService : this.CsdmDeviceService);

    return service.fetchItem(item.url).then((reloadedDevice) => {
      const deviceIsNew = !this.theDeviceMap[item.url];
      const updatedDevice = this.CsdmCacheUpdater.updateOne(this.theDeviceMap, item.url, reloadedDevice);
      if (deviceIsNew) {
        this.notifyListeners();
      }
      return updatedDevice;
    });
  }

  public reloadPlaceByCisUuid(cisUuid: string): IPromise<IPlace> {
    const placeUrl = this.getPlaceUrl({ cisUuid: cisUuid, displayName: '' });
    let place = this.placesDataModel[placeUrl];
    if (!place) {
      place = this.CsdmConverter.convertPlace({ url: placeUrl, cisUuid: cisUuid, devices: {} });
    }
    return this.reloadPlace(place);
  }

  public reloadDevicesForUser(cisUuid, type) {
    return this.CsdmDeviceService.fetchDevicesForUser(cisUuid, type).then((devices: any) => {
      _.each(devices, (device) => {
        this.CsdmCacheUpdater.updateOne(this.theDeviceMap, device.url, device);
      });
      this.notifyListeners();
      return devices;
    });
  }

  public hasDevices() {
    return this.theDeviceMap && Object.keys(this.theDeviceMap).length > 0;
  }

  public hasLoadedAllDeviceSources() {
    return this.cloudBerryDevicesLoaded && this.huronDevicesLoaded;
  }

  private onCreatedPlace(place) {
    const updatedPlace = this.addOrUpdatePlaceInDataModel(place).item;
    this.notifyListeners();
    return updatedPlace;
  }

  private addOrUpdatePlaceInDataModel(item: IDevicePlaceCommon): {
    item: IPlace,
    placeAddedToCache: boolean,
    deviceAdded: boolean,
    placeRenamed: boolean,
  } {

    const newPlaceUrl = this.getPlaceUrl(item);
    let reloadedPlace = this.placesDataModel[newPlaceUrl];

    if (reloadedPlace && !item.isPlace()) {
      return {
        item: reloadedPlace,
        placeAddedToCache: false,
        deviceAdded: false,
        placeRenamed: false,
      };
    }

    if (!reloadedPlace && item.isPlace() && item.url) {
      reloadedPlace = this.placesDataModel[item.url];
    }

    let placeAddedToCache = false;

    if (!reloadedPlace) {
      reloadedPlace = this.CsdmConverter.convertPlace({ url: newPlaceUrl, devices: {} });
      placeAddedToCache = true;
    }

    const wasRenamed = !!(item.displayName && item.displayName !== reloadedPlace.displayName);
    this.CsdmConverter.updatePlaceFromItem(reloadedPlace, item);
    const updatedPlace = this.CsdmCacheUpdater.updateOne(this.placesDataModel, reloadedPlace.url, reloadedPlace, undefined, true);
    let hasNewDevice = false;

    _.each(reloadedPlace.devices, (reloadedDevice) => {
      hasNewDevice = hasNewDevice || !this.theDeviceMap[reloadedDevice.url];
      this.CsdmCacheUpdater.updateOne(this.theDeviceMap, reloadedDevice.url, reloadedDevice);
    });

    return {
      item: updatedPlace,
      placeAddedToCache: placeAddedToCache,
      deviceAdded: hasNewDevice,
      placeRenamed: wasRenamed,
    };
  }

  private updatePlacesCache() {
    if (this.huronDevicesLoaded && this.cloudBerryDevicesLoaded && this.placesLoaded) {
      _.mapValues(this.placesDataModel, (p) => {
        p.devices = _.pickBy(this.theDeviceMap, (d) => {
          return d.cisUuid === p.cisUuid;
        });
        return p;
      });
      this.notifyListeners();
    }
  }

  private startPollingGracePeriod() {

    this.$timeout(() => {
      this.pollingGracePeriodActive = false;
    }, 30000);
  }

  private retrieveDevicesAndAccountsAndGeneratePlaceMap() {

    const placesMapReadyPromise = this.$q.defer();
    const getDevicesPromise = this.getDevicesMap();

    this.getAccountsMap().then(() => {
      getDevicesPromise.then(() => {
        this.startPollingGracePeriod();
        this.updatePlacesCache();
        placesMapReadyPromise.resolve(this.placesDataModel);
      });
    });

    return placesMapReadyPromise;
  }

  private reFetchDevicesAndAccountsAndGeneratePlaceMap() {

    const placesMapReadyPromise = this.$q.defer();
    const getDevicesPromise = this.fetchDevices();

    this.fetchAccounts().then(() => {
      getDevicesPromise.then(() => {
        this.startPollingGracePeriod();
        this.updatePlacesCache();
        placesMapReadyPromise.resolve(this.placesDataModel);
      });
    });

    return placesMapReadyPromise;
  }

  public getPlacesMap(refreshIfOld): ng.IPromise<Dictionary<IPlace>> {

    if (!this.placesMapReadyDeferred) {
      this.placesMapReadyDeferred = this.retrieveDevicesAndAccountsAndGeneratePlaceMap();
    } else if (refreshIfOld && !this.pollingGracePeriodActive) {
      this.reFetchDevicesAndAccountsAndGeneratePlaceMap();
    }
    return this.placesMapReadyDeferred.promise;
  }

  public getSearchPlacesMap(searchString: string): IPromise<Dictionary<IPlace>> {
    return this.CsdmPlaceService.getSearchPlacesList(searchString).then((searchRes) => {
      _.each(_.values(searchRes), (place) => {
        this.addOrUpdatePlaceInDataModel(place);
      });
      return searchRes;
    });
  }
}

module.exports =
  angular
    .module('Squared')
    .service('CsdmDataModelService', CsdmDataModelService)
    .name;
