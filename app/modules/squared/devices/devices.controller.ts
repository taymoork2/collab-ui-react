import IDevice = csdm.IDevice;
import { FilteredView } from '../common/filtered-view/filtered-view';
import { IToolkitModalService } from '../../core/modal/index';
import { Notification } from 'modules/core/notifications';
import ICsdmDataModelService = csdm.ICsdmDataModelService;
import { FilteredDeviceViewDataSource } from './filtered-deviceview-datasource';
import { DeviceMatcher } from './device-matcher';

export class DevicesController {

  public exporting: boolean;
  public filteredView: FilteredView<IDevice>;
  public addDeviceIsDisabled: boolean = true;
  public deviceExportFeature: boolean;
  public licenseError: string;

  private exportProgressDialog: ng.ui.bootstrap.IModalServiceInstance;
  private huronDeviceService: any;
  private currentDevice: IDevice;
  private showATA: boolean;
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
  private gridOptions: any;

  constructor(private $q: ng.IQService,
              private $state,
              private $translate: ng.translate.ITranslateService,
              private $templateCache,
              private Userservice,
              private WizardFactory,
              private FeatureToggleService,
              private $modal: IToolkitModalService,
              private Notification: Notification,
              private DeviceExportService,
              private ServiceDescriptor,
              $timeout: ng.ITimeoutService,
              CsdmDataModelService: ICsdmDataModelService,
              AccountOrgService,
              $scope: ng.IScope,
              CsdmHuronOrgDeviceService,
              private Authinfo) {
    this.fetchAsyncSettings();
    this.filteredView = new FilteredView<IDevice>(new FilteredDeviceViewDataSource(CsdmDataModelService, $q),
      new DeviceMatcher(),
      $timeout,
      $q);

    CsdmDataModelService.subscribeToChanges($scope, () => {
      this.filteredView.refresh();
    });

    CsdmDataModelService.devicePollerOn('data',
      () => {
        this.filteredView.refresh();
      }, {
        scope: $scope,
      },
    );

    this.filteredView.setFilters([{
      count: 0,
      name: $translate.instant('common.all'),
      filterValue: 'all',
      passes: function () {
        return true;
      },
    }, {
      count: 0,
      name: $translate.instant('CsdmStatus.OnlineWithIssues'),
      filterValue: 'issues',
      passes: function (item: IDevice) {
        return item.hasIssues && item.isOnline;
      },
    }, {
      count: 0,
      name: $translate.instant('CsdmStatus.Offline'),
      filterValue: 'offline',
      passes: function (item: IDevice) {
        return !item.isOnline;
      },
    }, {
      count: 0,
      name: $translate.instant('CsdmStatus.Online'),
      filterValue: 'online',
      passes: function (item: IDevice) {
        return item.isOnline;
      },
    }]);

    this.huronDeviceService = CsdmHuronOrgDeviceService.create(Authinfo.getOrgId());

    AccountOrgService.getAccount(Authinfo.getOrgId()).success((data) => {
      let hasNoSuspendedLicense = !!_.find(data.accounts, {
        licenses: [{
          offerName: 'SD',
          status: 'SUSPENDED',
        }],
      });
      this.licenseError = hasNoSuspendedLicense ? $translate.instant('spacesPage.licenseSuspendedWarning') : '';
    });

    this.gridOptions = {
      data: 'sc.filteredView.getResult()',
      enableHorizontalScrollbar: 0,
      rowHeight: 45,
      enableRowHeaderSelection: false,
      enableColumnMenus: false,
      multiSelect: false,
      onRegisterApi: (gridApi) => {
        $scope.gridApi = gridApi;
        gridApi.selection.on.rowSelectionChanged($scope, (row) => {
          this.showDeviceDetails(row.entity);
        });
      },

      columnDefs: [{
        field: 'photos',
        displayName: '',
        cellTemplate: this.getTemplate('_imageTpl'),
        sortable: false,
        width: 70,
      }, {
        field: 'displayName',
        displayName: $translate.instant('spacesPage.nameHeader'),
        sortingAlgorithm: DevicesController.sortFn,
        sort: {
          direction: 'asc',
          priority: 1,
        },
        sortCellFiltered: true,
      }, {
        field: 'state',
        displayName: $translate.instant('spacesPage.statusHeader'),
        cellTemplate: this.getTemplate('_statusTpl'),
        sortable: true,
        sortingAlgorithm: DevicesController.sortStateFn,
        sort: {
          direction: 'asc',
          priority: 0,
        },
      }, {
        field: 'product',
        displayName: $translate.instant('spacesPage.typeHeader'),
        cellTemplate: this.getTemplate('_productTpl'),
        sortingAlgorithm: DevicesController.sortFn,
      }],
    };
  }

  private getTemplate(name) {
    return this.$templateCache.get('modules/squared/devices/templates/' + name + '.html');
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
    let ataPromise = this.FeatureToggleService.csdmATAGetStatus().then((result: boolean) => {
      this.showATA = result;
    });
    let hybridPromise = this.FeatureToggleService.csdmHybridCallGetStatus().then((feature: boolean) => {
      this.csdmHybridCallFeature = feature;
    });
    let getLoggedOnUserPromise = this.fetchDetailsForLoggedInUser();
    let personalPromise = this.FeatureToggleService.cloudberryPersonalModeGetStatus().then((showPersonal: boolean) => {
      this.showPersonal = !showPersonal;
    });
    let placeCalendarPromise = this.FeatureToggleService.csdmPlaceCalendarGetStatus().then((feature: boolean) => {
      this.csdmHybridCalendarFeature = feature;
    });
    let anyCalendarEnabledPromise = this.ServiceDescriptor.getServices().then((services) => {
      this.hybridCalendarEnabledOnOrg = _.chain(this.ServiceDescriptor.filterEnabledServices(services)).filter((service) => {
        return service.id === 'squared-fusion-gcal' || service.id === 'squared-fusion-cal';
      }).some().value();
      this.hybridCallEnabledOnOrg = _.chain(this.ServiceDescriptor.filterEnabledServices(services)).filter((service) => {
        return service.id === 'squared-fusion-uc';
      }).some().value();
    });
    this.$q.all([ataPromise, hybridPromise, personalPromise, placeCalendarPromise, anyCalendarEnabledPromise, getLoggedOnUserPromise]).finally(() => {
      this.addDeviceIsDisabled = false;
    });

    this.FeatureToggleService.atlasDeviceExportGetStatus().then((result: boolean) => {
      this.deviceExportFeature = result;
    });
  }

  private fetchDetailsForLoggedInUser() {
    let userDetailsDeferred = this.$q.defer();
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

  private showDeviceDetails(device: IDevice) {
    this.currentDevice = device;
    this.$state.go('device-overview', {
      currentDevice: device,
      huronDeviceService: this.huronDeviceService,
    });
  }

  public startAddDeviceFlow() {
    let wizard = this.WizardFactory.create(this.showPersonal ? this.wizardWithPersonal() : this.wizardWithoutPersonal());
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

  private wizardWithoutPersonal() {
    return {
      data: {
        function: 'addDevice',
        showATA: this.showATA,
        showPersonal: false,
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

  private wizardWithPersonal() {
    return {
      data: {
        function: 'addDevice',
        showATA: this.showATA,
        showPersonal: true,
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

  public startDeviceExport() {
    this.$modal.open({
      templateUrl: 'modules/squared/devices/export/devices-export.html',
      type: 'dialog',
    }).result.then(() => {
      this.openExportProgressTracker();
    }, () => {
      this.exporting = false;
    });
  }

  private openExportProgressTracker() {
    this.exportProgressDialog = this.$modal.open({
      templateUrl: 'modules/squared/devices/export/devices-export-progress.html',
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
      let title = this.$translate.instant('spacesPage.export.exportCompleted');
      let text = this.$translate.instant('spacesPage.export.deviceListReadyForDownload');
      this.Notification.success(text, title);
    } else if (percent === -1) {
      this.exportProgressDialog.close();
      this.exporting = false;
      let warn = this.$translate.instant('spacesPage.export.deviceExportFailedOrCancelled');
      this.Notification.warning(warn);
    }
  }
}

angular
  .module('Squared')
  .controller('DevicesCtrl', DevicesController);
