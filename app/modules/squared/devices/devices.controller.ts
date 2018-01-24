import IDevice = csdm.IDevice;
import { FilteredView } from '../common/filtered-view/filtered-view';
import { IToolkitModalService } from '../../core/modal/index';
import { Notification } from 'modules/core/notifications';
import ICsdmDataModelService = csdm.ICsdmDataModelService;
import { FilteredDeviceViewDataSource } from './filtered-deviceview-datasource';
import { DeviceMatcher } from './device-matcher';
import { ServiceDescriptorService } from 'modules/hercules/services/service-descriptor.service';
import { CsdmPlaceService } from 'modules/squared/devices/services/CsdmPlaceService';
import { CloudConnectorService } from '../../hercules/services/calendar-cloud-connector.service';

export class DevicesLegacyController implements ng.IComponentController {
  public exporting: boolean;
  public filteredView: FilteredView<IDevice>;
  public addDeviceIsDisabled: boolean = true;
  public deviceExportFeature: boolean;
  public licenseError: string;

  private devicePlaceLink: boolean;
  private exportProgressDialog: ng.ui.bootstrap.IModalServiceInstance;
  private huronDeviceService: any;
  private currentDevice: IDevice;
  private showATA: boolean;
  private csdmMultipleDevicesPerPlaceFeature: boolean;
  private csdmHybridCallFeature: boolean;
  private showPersonal: boolean;
  private csdmHybridCalendarFeature: boolean;
  private hybridCalendarEnabledOnOrg: boolean;
  private hybridCallEnabledOnOrg: boolean;

  private adminUserDetails: {
    firstName?: string;
    lastName?: string;
    displayName: string;
    userName: string;
    cisUuid: string;
    organizationId: string
  };
  public gridOptions: uiGrid.IGridOptions;
  public gridApi: uiGrid.IGridApi;

  constructor(
    private $modal: IToolkitModalService,
    private $q: ng.IQService,
    private $state,
    private $translate: ng.translate.ITranslateService,
    private Authinfo,
    private DeviceExportService,
    private FeatureToggleService,
    private GridCellService,
    private Notification: Notification,
    private ServiceDescriptorService: ServiceDescriptorService,
    private Userservice,
    private WizardFactory,
    private CsdmPlaceService: CsdmPlaceService,
    private CloudConnectorService: CloudConnectorService,
    $scope: ng.IScope,
    $timeout: ng.ITimeoutService,
    AccountOrgService,
    CsdmDataModelService: ICsdmDataModelService,
    CsdmHuronOrgDeviceService,
  ) {
    this.fetchAsyncSettings();
    this.filteredView = new FilteredView<IDevice>(new FilteredDeviceViewDataSource(CsdmDataModelService, $q),
      new DeviceMatcher(),
      $timeout,
      $q);

    CsdmDataModelService.subscribeToChanges($scope, () => {
      this.filteredView.refresh();
      this.gridOptions.data = this.filteredView.getResult();
    });

    CsdmDataModelService.devicePollerOn('data', () => {
      this.filteredView.refresh();
      this.gridOptions.data = this.filteredView.getResult();
    }, {
      scope: $scope,
    });

    this.filteredView.setFilters([{
      count: 0,
      name: $translate.instant('common.all'),
      filterValue: 'all',
      passes: function () {
        return true;
      },
    }, {
      count: 0,
      name: $translate.instant('CsdmStatus.connectionStatus.CONNECTED_WITH_ISSUES'),
      filterValue: 'issues',
      passes: function (item: IDevice) {
        return item.hasIssues && item.isOnline;
      },
    }, {
      count: 0,
      name: $translate.instant('CsdmStatus.connectionStatus.DISCONNECTED'),
      filterValue: 'offline',
      passes: function (item: IDevice) {
        return !item.isOnline;
      },
    }, {
      count: 0,
      name: $translate.instant('CsdmStatus.connectionStatus.OFFLINE_EXPIRED'),
      filterValue: 'expired',
      passes: function (item: IDevice) {
        return item.state.key === 'OFFLINE_EXPIRED';
      },
    }, {
      count: 0,
      name: $translate.instant('CsdmStatus.connectionStatus.CONNECTED'),
      filterValue: 'online',
      passes: function (item: IDevice) {
        return item.isOnline;
      },
    }]);

    this.huronDeviceService = CsdmHuronOrgDeviceService.create(Authinfo.getOrgId());

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

    this.gridOptions = {
      data: this.filteredView.getResult(),
      appScopeProvider: {
        selectRow: (grid: uiGrid.IGridInstance, row: uiGrid.IGridRow): void => {
          this.GridCellService.selectRow(grid, row);
          this.showDeviceDetails(row.entity);
        },
        showDeviceDetails: (device: IDevice): void => {
          this.showDeviceDetails(device);
        },
      },
      rowHeight: 45,
      onRegisterApi: (gridApi) => {
        this.gridApi = gridApi;
      },
      columnDefs: [{
        field: 'photos',
        displayName: '',
        cellTemplate: require('./templates/_imageTpl.html'),
        width: 70,
      }, {
        field: 'displayName',
        displayName: $translate.instant('spacesPage.nameHeader'),
        sortingAlgorithm: DevicesLegacyController.sortFn,
        sort: {
          direction: 'asc',
          priority: 1,
        },
        sortCellFiltered: true,
        cellTemplate: '<cs-grid-cell row="row" grid="grid" cell-click-function="grid.appScope.showDeviceDetails(row.entity)" cell-value="row.entity.displayName"></cs-grid-cell>',
      }, {
        field: 'state',
        displayName: $translate.instant('spacesPage.statusHeader'),
        cellTemplate: '<cs-grid-cell row="row" grid="grid" cell-click-function="grid.appScope.showDeviceDetails(row.entity)" cell-icon-css="icon-circle status-indicator {{row.entity.cssColorClass}}" cell-value="row.entity.state.readableState"></cs-grid-cell>',
        sortingAlgorithm: DevicesLegacyController.sortStateFn,
        sort: {
          direction: 'asc',
          priority: 0,
        },
      }, {
        field: 'product',
        displayName: $translate.instant('spacesPage.typeHeader'),
        cellTemplate: require('./templates/_productTpl.html'),
        sortingAlgorithm: DevicesLegacyController.sortFn,
      }],
    };
  }

  private static sortFn(a, b) {
    if (a && a.localeCompare) {
      return a.localeCompare(b);
    }
    return 1;
  }

  private static sortStateFn(a, b) {
    if (!a) {
      return b.priority;
    }
    return a.priority - b.priority;
  }

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
    this.$q.all([ataPromise, hybridPromise, personalPromise, placeCalendarPromise, anyCalendarEnabledPromise, getLoggedOnUserPromise, office365Promise, googleCalendarPromise, multipleDevicesPerPlacePromise]).finally(() => {
      this.addDeviceIsDisabled = false;
    });

    this.FeatureToggleService.atlasDeviceExportGetStatus().then((result: boolean) => {
      this.deviceExportFeature = result;
    });
    this.FeatureToggleService.csdmDevicePlaceLinkGetStatus().then((result: boolean) => {
      this.devicePlaceLink = result;
    });
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

  private isOrgEntitledToRoomSystem() {
    return this.Authinfo.isDeviceMgmt();
  }

  private isOrgEntitledToHuron() {
    return _.filter(this.Authinfo.getLicenses(),
        function (l: any) {
          return l.licenseType === 'COMMUNICATION';
        }).length > 0;
  }

  private showDeviceDetails(device: IDevice) {
    this.currentDevice = device;
    if (this.devicePlaceLink && device.accountType === 'MACHINE') {
      const newPlaceUrl = this.CsdmPlaceService.getPlacesUrl() + device.cisUuid;
      const placeholderPlace =  {
        cisUuid: device.cisUuid,
        displayName: device.displayName,
        isPlace: true,
        url: newPlaceUrl };

      this.$state.go('place-overview.csdmDevice', {
        currentPlace: placeholderPlace,
        currentDevice: device,
        huronDeviceService: this.huronDeviceService,
      });
    } else {
      this.$state.go('device-overview', {
        currentDevice: device,
        huronDeviceService: this.huronDeviceService,
      });
    }
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
}

export class DevicesComponent implements ng.IComponentOptions {
  public controller = 'devicesLegacyController';
  public controllerAs = 'sc';
  public template = require('modules/squared/devices/devices.html');
}

angular
  .module('Squared')
  .controller('devicesLegacyController', DevicesLegacyController)
  .component('devicesPage', new DevicesComponent());
