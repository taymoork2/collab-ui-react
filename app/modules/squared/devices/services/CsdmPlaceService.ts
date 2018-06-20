'use strict';
import { CsdmConverter } from './CsdmConverter';
import IPlace = csdm.IPlace;
export class CsdmPlaceService {
  private csdmPlacesUrl: string;

  /* @ngInject  */
  constructor(private $http, Authinfo, UrlConfig, private CsdmConverter: CsdmConverter) {

    this.csdmPlacesUrl = UrlConfig.getCsdmServiceUrl() + '/organization/' + Authinfo.getOrgId() + '/places/';
  }

  public getPlacesUrl() {
    return this.csdmPlacesUrl;
  }

  public getPlacesList(): IPromise<{ [url: string]: IPlace; }> {
    return this.$http.get(this.csdmPlacesUrl + '?shallow=true&type=all')
      .then((res) => {
        return this.CsdmConverter.convertPlaces(res.data);
      });
  }

  public getSearchPlacesList(searchStr: string): IPromise<{ [url: string]: IPlace; }> {
    return this.$http.get(this.csdmPlacesUrl + '?type=all&query=' + searchStr)
      .then((res) => {
        return this.CsdmConverter.convertPlaces(res.data);
      });
  }

  public updateItemName(place, name) {
    return this.$http.patch(place.url, {
      name: name,
    }).then((res) => {
      res.data.type = place.type;
      return this.CsdmConverter.convertPlace(res.data);
    });
  }

  public fetchItem(placeUrl: string): IPromise<IPlace> {
    return this.$http.get(placeUrl).then((res) => {
      return this.CsdmConverter.convertPlace(res.data);
    });
  }

  public deletePlace(place: IPlace): IPromise<boolean>  {
    return this.$http.delete(place.url);
  }

  public deleteItem(item: IPlace): IPromise<boolean>  {
    return this.deletePlace(item);
  }

  public createCsdmPlace(name, entitlements, locationUuid, directoryNumber, externalNumber, externalLinkedAccounts) {
    return this.createPlace(name, entitlements || ['webex-squared', 'spark'], locationUuid, directoryNumber, externalNumber, 'lyra_space', externalLinkedAccounts);
  }

  public createCmiPlace(name, entitlements, locationUuid, directoryNumber, externalNumber) {
    return this.createPlace(name, entitlements || ['ciscouc', 'webex-squared'], locationUuid, directoryNumber, externalNumber, 'room', null);
  }

  public createPlace(name, entitlements, locationUuid, directoryNumber, externalNumber, machineType, externalLinkedAccounts): ng.IPromise<IPlace> {
    return this.$http.post(this.csdmPlacesUrl, {
      name: name,
      locationUuid: locationUuid,
      directoryNumber: directoryNumber,
      externalNumber: externalNumber,
      entitlements: entitlements,
      machineType: machineType,
      extLinkedAccts: externalLinkedAccounts,
    }).then((res) => {
      const convertedPlace = this.CsdmConverter.convertPlace(res.data);
      // TODO: Don't need to set these here when CSDM returns the lines on place creation
      convertedPlace.directoryNumber = convertedPlace.directoryNumber || directoryNumber;
      convertedPlace.externalNumber = convertedPlace.externalNumber || externalNumber;
      return convertedPlace;
    });
  }

  public updatePlace(placeUrl, entitlements, locationUuid, directoryNumber, externalNumber, externalLinkedAccounts): ng.IPromise<IPlace> {
    return this.$http.patch(placeUrl, {
      locationUuid: locationUuid,
      directoryNumber: directoryNumber,
      externalNumber: externalNumber,
      entitlements: entitlements,
      extLinkedAccts: externalLinkedAccounts,
    }).then((res) => {
      return this.CsdmConverter.convertPlace(res.data);
    });
  }
}

module.exports = angular
  .module('Squared')
  .service('CsdmPlaceService', CsdmPlaceService)
  .name;
