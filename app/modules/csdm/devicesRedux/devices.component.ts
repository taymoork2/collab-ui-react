import { SearchInteraction } from './deviceSearch.component';
import { SearchObject } from '../services/search/searchObject';
import { SearchResult } from '../services/search/searchResult';
import { IToolkitModalService } from '../../core/modal/index';
import { Notification } from 'modules/core/notifications';
import { QueryParser } from '../services/search/queryParser';
import { SearchTranslator } from '../services/search/searchTranslator';
import { SearchElement } from '../services/search/searchElement';
import { CloudConnectorService } from '../../hercules/services/calendar-cloud-connector.service';

require('./_devices.scss');

export class DevicesCtrl implements ng.IComponentController {
  public anyDevicesOrCodesLoaded = true; //TODO remove
  public searchInteraction = new SearchInteraction();
  public issearching = false;
  private devicesHaveBeenSeen = false;
  private _searchResult: SearchResult;
  private _searchObject: SearchObject;
  public licenseError: string;

  //region for add device/place button
  private showPersonal = false;
  public addDeviceIsDisabled = true;
  private showATA: boolean;
  private hybridCallEnabledOnOrg: boolean;
  private hybridCalendarEnabledOnOrg: boolean;
  private csdmHybridCalendarFeature: boolean;
  private csdmHybridCallFeature: boolean;
  private csdmMultipleDevicesPerPlaceFeature: boolean;
  private deviceExportFeature: boolean;
  public exporting: boolean;
  private exportProgressDialog: ng.ui.bootstrap.IModalServiceInstance;
  private adminUserDetails: {
    firstName: any;
    lastName: any;
    displayName: any;
    userName: any;
    cisUuid: any;
    organizationId: any;
  };
  //region for add device/place button

  /* @ngInject */
  constructor(private $modal: IToolkitModalService,
              AccountOrgService,
              private DeviceExportService,
              private $translate: ng.translate.ITranslateService,
              private Notification: Notification,
              private WizardFactory,
              private $state,
              private FeatureToggleService,
              private $q,
              private Userservice,
              private DeviceSearchTranslator: SearchTranslator,
              private ServiceDescriptorService,
              private Authinfo,
              private CloudConnectorService: CloudConnectorService) {
    this.initForAddButton();
    AccountOrgService.getAccount(Authinfo.getOrgId())
      .then((response) => {
        const hasNoSuspendedLicense = !!_.find(response.data.accounts, {
          licenses: [{
            offerName: 'SD',
            status: 'SUSPENDED',
          }],
        });
        this.licenseError = hasNoSuspendedLicense ? $translate.instant('spacesPage.licenseSuspendedWarning') : '';
      });

    this._searchObject = SearchObject.createWithQuery(new QueryParser(this.DeviceSearchTranslator), '');
  }

  get searchResult(): SearchResult {
    return this._searchResult;
  }

  set searchResult(value: SearchResult) {
    this._searchResult = value;
  }

  public initializing(): boolean {
    return !(this._searchObject || this._searchResult);
  }

  public showresult(): boolean {
    return !this.initializing() && !this.emptydatasource() && !this.emptysearchresult();
  }

  public emptysearchresult(): boolean {
    return !this.issearching && this._searchObject && this._searchObject.getTranslatedQueryString(null) !== ''
      && (this._searchResult && this._searchResult.hits.total === 0);
  }

  public emptydatasource(): boolean {
    return !this.devicesHaveBeenSeen && !this.issearching && this._searchObject && this._searchObject.getTranslatedQueryString(null) === ''
      && (this._searchResult && this._searchResult.hits.total === 0);
  }

  get searchObject(): SearchObject {
    return this._searchObject;
  }

  public $onInit(): void {

  }

  public startDeviceExport() {
    this.$modal.open({
      template: require('modules/squared/devices/export/devices-export.html'),
      type: 'dialog',
    }).result.then(() => {
      this.openExportProgressTracker();
    }, () => {
      this.exporting = false;
    });
  }

  private openExportProgressTracker() {
    this.exportProgressDialog = this.$modal.open({
      template: require('modules/squared/devices/export/devices-export-progress.html'),
      type: 'dialog',
      controller: () => {
        return {
          cancelExport: () => {
            this.DeviceExportService.cancelExport();
          },
        };
      },
      controllerAs: 'vm',
    });
    this.exportProgressDialog.opened.then(() => {
      this.exporting = true;
      this.DeviceExportService.exportDevices((percent) => {
        this.exportStatus(percent);
      });
    });
  }

  private exportStatus(percent) {
    if (percent === 100) {
      this.exportProgressDialog.close();
      this.exporting = false;
      const title = this.$translate.instant('spacesPage.export.exportCompleted');
      const text = this.$translate.instant('spacesPage.export.deviceListReadyForDownload');
      this.Notification.success(text, title);
    } else if (percent === -1) {
      this.exportProgressDialog.close();
      this.exporting = false;
      const warn = this.$translate.instant('spacesPage.export.deviceExportFailedOrCancelled');
      this.Notification.warning(warn);
    }
  }

  public addToSearch(searchElement: SearchElement, toggle: boolean) {
    this.searchInteraction.addToSearch(searchElement, toggle);
  }

  public sortOrderChanged(field, order) {
    this.searchInteraction.setSortOrder(field, order);
  }

  public searchResultChanged(result: SearchResult) {
    if (result && result.hits && result.hits.total > 0) {
      this.devicesHaveBeenSeen = true;
    }
    this._searchResult = result;
  }

  private initForAddButton() {
    this.fetchAsyncSettings();
  }

  //TODO this is a duplicate from devices.controller.ts in squared  extract to class or maintain
  private fetchAsyncSettings() {
    const ataPromise = this.FeatureToggleService.csdmATAGetStatus().then((result: boolean) => {
      this.showATA = result;
    });
    const hybridPromise = this.FeatureToggleService.csdmHybridCallGetStatus().then((feature: boolean) => {
      this.csdmHybridCallFeature = feature;
    });
    const getLoggedOnUserPromise = this.fetchDetailsForLoggedInUser();
    const personalPromise = this.FeatureToggleService.cloudberryPersonalModeGetStatus().then((showPersonal: boolean) => {
      this.showPersonal = showPersonal;
    });
    const placeCalendarPromise = this.FeatureToggleService.csdmPlaceCalendarGetStatus().then((feature: boolean) => {
      this.csdmHybridCalendarFeature = feature;
    });
    const anyCalendarEnabledPromise = this.ServiceDescriptorService.getServices().then((services) => {
      this.hybridCalendarEnabledOnOrg = _.chain(this.ServiceDescriptorService.filterEnabledServices(services)).filter((service) => {
        return service.id === 'squared-fusion-gcal' || service.id === 'squared-fusion-cal';
      }).some().value();
      this.hybridCallEnabledOnOrg = _.chain(this.ServiceDescriptorService.filterEnabledServices(services)).filter((service) => {
        return service.id === 'squared-fusion-uc';
      }).some().value();
    });
    const office365Promise = this.FeatureToggleService.atlasOffice365SupportGetStatus().then(feature => {
      if (feature) {
        return this.CloudConnectorService.getService('squared-fusion-o365').then(service => {
          this.hybridCalendarEnabledOnOrg = this.hybridCalendarEnabledOnOrg || service.provisioned;
        });
      }
    });
    const googleCalendarPromise = this.CloudConnectorService.getService('squared-fusion-gcal').then(service => {
      this.hybridCalendarEnabledOnOrg = this.hybridCalendarEnabledOnOrg || service.provisioned;
    });
    const multipleDevicesPerPlacePromise = this.FeatureToggleService.csdmMultipleDevicesPerPlaceGetStatus().then(feature => {
      this.csdmMultipleDevicesPerPlaceFeature = feature;
    });
    this.$q.all([ataPromise, hybridPromise, personalPromise, placeCalendarPromise, anyCalendarEnabledPromise, getLoggedOnUserPromise, multipleDevicesPerPlacePromise, office365Promise, googleCalendarPromise]).finally(() => {
      this.addDeviceIsDisabled = false;
    });

    this.FeatureToggleService.atlasDeviceExportGetStatus().then((result: boolean) => {
      this.deviceExportFeature = result;
    });
  }

  private isOrgEntitledToRoomSystem() {
    return this.Authinfo.isDeviceMgmt();
  }

  private isOrgEntitledToHuron() {
    return _.filter(this.Authinfo.getLicenses(),
      function (l: any) {
        return l.licenseType === 'COMMUNICATION';
      }).length > 0;
  }

  private fetchDetailsForLoggedInUser() {
    const userDetailsDeferred = this.$q.defer();
    this.Userservice.getUser('me', (data) => {
      if (data.success) {
        this.adminUserDetails = {
          firstName: data.name && data.name.givenName,
          lastName: data.name && data.name.familyName,
          displayName: data.displayName,
          userName: data.userName,
          cisUuid: data.id,
          organizationId: data.meta.organizationID,
        };
      }
      userDetailsDeferred.resolve();
    });
    return userDetailsDeferred.promise;
  }

  public startAddDeviceFlow() {
    const wizard = this.WizardFactory.create(this.showPersonal ? this.wizardWithPersonal() : this.wizardWithoutPersonal());
    this.$state.go(wizard.state().currentStateName, {
      wizard: wizard,
    });
  }

  private wizardWithPersonal() {
    return {
      data: {
        function: 'addDevice',
        showATA: this.showATA,
        showPersonal: true,
        multipleRoomDevices: this.csdmMultipleDevicesPerPlaceFeature,
        admin: this.adminUserDetails,
        csdmHybridCallFeature: this.csdmHybridCallFeature,
        csdmHybridCalendarFeature: this.csdmHybridCalendarFeature,
        hybridCalendarEnabledOnOrg: this.hybridCalendarEnabledOnOrg,
        hybridCallEnabledOnOrg: this.hybridCallEnabledOnOrg,
        title: 'addDeviceWizard.newDevice',
        isEntitledToHuron: this.isOrgEntitledToHuron(),
        isEntitledToRoomSystem: this.isOrgEntitledToRoomSystem(),
        account: {
          organizationId: this.Authinfo.getOrgId(),
        },
        recipient: {
          cisUuid: this.Authinfo.getUserId(),
          displayName: this.adminUserDetails.displayName,
          email: this.Authinfo.getPrimaryEmail(),
          organizationId: this.adminUserDetails.organizationId,
          firstName: this.adminUserDetails.firstName || this.adminUserDetails.displayName,
        },
      },
      history: [],
      currentStateName: 'addDeviceFlow.chooseAccountType',
      wizardState: {
        'addDeviceFlow.chooseAccountType': {
          nextOptions: {
            shared: 'addDeviceFlow.chooseSharedSpace',
            personal: 'addDeviceFlow.choosePersonal',
          },
        },
        'addDeviceFlow.choosePersonal': {
          next: 'addDeviceFlow.showActivationCode',
        },
        'addDeviceFlow.chooseSharedSpace': {
          nextOptions: {
            existing: 'addDeviceFlow.showActivationCode',
            create: 'addDeviceFlow.chooseDeviceType',
          },
        },
        'addDeviceFlow.chooseDeviceType': {
          nextOptions: {
            cloudberry: 'addDeviceFlow.editServices',
            huron: 'addDeviceFlow.addLines',
          },
        },
        'addDeviceFlow.editServices': {
          nextOptions: {
            sparkCall: 'addDeviceFlow.addLines',
            sparkCallConnect: 'addDeviceFlow.callConnectOptions',
            sparkOnly: 'addDeviceFlow.showActivationCode',
            calendar: 'addDeviceFlow.editCalendarService',
          },
        },
        'addDeviceFlow.addLines': {
          nextOptions: {
            next: 'addDeviceFlow.showActivationCode',
            calendar: 'addDeviceFlow.editCalendarService',
          },
        },
        'addDeviceFlow.callConnectOptions': {
          nextOptions: {
            next: 'addDeviceFlow.showActivationCode',
            calendar: 'addDeviceFlow.editCalendarService',
          },
        },
        'addDeviceFlow.editCalendarService': {
          next: 'addDeviceFlow.showActivationCode',
        },
        'addDeviceFlow.showActivationCode': {},
      },
    };
  }

  private wizardWithoutPersonal() {
    return {
      data: {
        function: 'addDevice',
        showATA: this.showATA,
        showPersonal: false,
        multipleRoomDevices: this.csdmMultipleDevicesPerPlaceFeature,
        admin: this.adminUserDetails,
        csdmHybridCallFeature: this.csdmHybridCallFeature,
        csdmHybridCalendarFeature: this.csdmHybridCalendarFeature,
        hybridCalendarEnabledOnOrg: this.hybridCalendarEnabledOnOrg,
        hybridCallEnabledOnOrg: this.hybridCallEnabledOnOrg,
        title: 'addDeviceWizard.newDevice',
        isEntitledToHuron: this.isOrgEntitledToHuron(),
        isEntitledToRoomSystem: this.isOrgEntitledToRoomSystem(),
        account: {
          organizationId: this.Authinfo.getOrgId(),
        },
        recipient: {
          cisUuid: this.Authinfo.getUserId(),
          displayName: this.adminUserDetails.displayName,
          email: this.Authinfo.getPrimaryEmail(),
          organizationId: this.adminUserDetails.organizationId,
          firstName: this.adminUserDetails.firstName || this.adminUserDetails.displayName,
        },
      },
      history: [],
      currentStateName: 'addDeviceFlow.chooseDeviceType',
      wizardState: {
        'addDeviceFlow.chooseDeviceType': {
          nextOptions: {
            cloudberry: 'addDeviceFlow.chooseSharedSpace',
            huron: 'addDeviceFlow.chooseAccountType',
          },
        },
        'addDeviceFlow.chooseAccountType': {
          nextOptions: {
            shared: 'addDeviceFlow.chooseSharedSpace',
            personal: 'addDeviceFlow.choosePersonal',
          },
        },
        'addDeviceFlow.choosePersonal': {
          next: 'addDeviceFlow.showActivationCode',
        },
        'addDeviceFlow.chooseSharedSpace': {
          nextOptions: {
            cloudberry_existing: 'addDeviceFlow.showActivationCode',
            cloudberry_create: 'addDeviceFlow.editServices',
            huron_existing: 'addDeviceFlow.showActivationCode',
            huron_create: 'addDeviceFlow.addLines',
          },
        },
        'addDeviceFlow.editServices': {
          nextOptions: {
            sparkCall: 'addDeviceFlow.addLines',
            sparkCallConnect: 'addDeviceFlow.callConnectOptions',
            sparkOnly: 'addDeviceFlow.showActivationCode',
            calendar: 'addDeviceFlow.editCalendarService',
          },
        },
        'addDeviceFlow.addLines': {
          nextOptions: {
            next: 'addDeviceFlow.showActivationCode',
            calendar: 'addDeviceFlow.editCalendarService',
          },
        },
        'addDeviceFlow.callConnectOptions': {
          nextOptions: {
            next: 'addDeviceFlow.showActivationCode',
            calendar: 'addDeviceFlow.editCalendarService',
          },
        },
        'addDeviceFlow.editCalendarService': {
          next: 'addDeviceFlow.showActivationCode',
        },
        'addDeviceFlow.showActivationCode': {},
      },
    };
  }

  //TODO end this is a duplicate from devices.controller.ts in squared
}

export class DevicesComponent implements ng.IComponentOptions {
  public controller = DevicesCtrl;
  public controllerAs = 'devices';
  public template = require('modules/csdm/devicesRedux/devices.html');
}
