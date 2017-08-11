import { SearchObject, SearchResult } from '../services/csdmSearch.service';
import { SearchInteraction } from './deviceSearch.component';
export class DevicesCtrl {

  public anyDevicesOrCodesLoaded = true; //TODO remove
  public searchMinimized = true;
  public searchInteraction = new SearchInteraction();
  private _searchString: string = '';
  private _searchResult: SearchResult;
  private _searchObject: SearchObject;

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
  constructor(private WizardFactory, private $state, private FeatureToggleService, private $q, private Userservice, private ServiceDescriptorService, private Authinfo) {
    this.searchResult = { aggregations: {}, hits: { hits: [], total: 0 } };
    this.initForAddButton();
  }

  get searchResult(): SearchResult {
    return this._searchResult;
  }

  set searchResult(value: SearchResult) {
    this._searchResult = value;
  }

  get searchObject(): SearchObject {
    return this._searchObject;
  }

  set search(value: string) {
    this._searchString = value;
  }

  get search() {
    return this._searchString;
  }

  public $onInit(): void {

  }

  public addToSearch(field: string, query: string) {
    this.searchInteraction.addToSearch(field, query);
  }

  public searchChanged(search: SearchObject) {
    this._searchString = search.query || '';
    this._searchObject = search;
  }

  public searchResultChanged(result: SearchResult) {
    this._searchResult = result;
    // this._searchResult.splice(0, this._searchResult.length);
    // if (result && result.length) {
    //   Array.prototype.push.apply(this._searchResult, result);
    // }
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
    const multipleDevicesPerPlacePromise = this.FeatureToggleService.csdmMultipleDevicesPerPlaceGetStatus().then(feature => {
      this.csdmMultipleDevicesPerPlaceFeature = feature;
    });
    this.$q.all([ataPromise, hybridPromise, personalPromise, placeCalendarPromise, anyCalendarEnabledPromise, getLoggedOnUserPromise, multipleDevicesPerPlacePromise]).finally(() => {
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
            sparkOnlyAndCalendar: 'addDeviceFlow.editCalendarService',
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
            sparkOnlyAndCalendar: 'addDeviceFlow.editCalendarService',
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
