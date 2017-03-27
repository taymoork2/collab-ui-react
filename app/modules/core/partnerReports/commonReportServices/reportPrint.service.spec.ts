import reportServices from './index';
import { IExportMenu } from '../partnerReportInterfaces';

describe('Service: Report Print Service', () => {
  beforeEach(function () {
    this.initModules(reportServices);
    this.injectDependencies('$scope', 'ReportPrintService', 'Notification');

    this.activeData = getJSONFixture('core/json/customerReports/activeUser.json');
    this.defaults = getJSONFixture('core/json/partnerReports/commonReportService.json');
    this.ctrlData = getJSONFixture('core/json/partnerReports/ctrl.json');
    this.mediaData = getJSONFixture('core/json/customerReports/mediaQuality.json');
    this.devicesJson = getJSONFixture('core/json/customerReports/devices.json');
    this.endpointsData = getJSONFixture('core/json/partnerReports/registeredEndpointData.json');

    this.responseFunction = (_layout, callResponse: Function): void => {
      callResponse('fake data');
    };

    this.dummyChart = {
      export: {
        capture: jasmine.createSpy('capture').and.callFake((_item, callResponse: Function): void => {
          callResponse();
        }),
        toJPG: jasmine.createSpy('toJPG').and.callFake(this.responseFunction),
        toPDF: jasmine.createSpy('toPDF').and.callFake(this.responseFunction),
        download: jasmine.createSpy('downlaod'),
      },
    };

    spyOn(this.Notification, 'errorWithTrackingId');
  });

  it(' - printCustomerPage should print charts to pdf using Amcharts calls', function () {
    this.activeOptions = _.cloneDeep(this.ctrlData.activeUserOptions);
    this.avgRoomsCard = _.cloneDeep(this.ctrlData.avgRoomsOptions);
    this.deviceCard = _.cloneDeep(this.ctrlData.deviceOptions);
    this.filesSharedCard = _.cloneDeep(this.ctrlData.filesSharedOptions);
    this.mediaOptions = _.cloneDeep(this.ctrlData.mediaOptions);
    this.metricsOptions = _.cloneDeep(this.ctrlData.callOptions);
    this.metricsLabels = _.cloneDeep(this.ctrlData.metricsLabels);
    this.qualityLabels = _.cloneDeep(this.ctrlData.qualityLabels);

    this.activeOptions.description = 'activeUsers.customerPortalDescription';
    this.mediaOptions.description = 'mediaQuality.descriptionCustomer';
    this.metricsOptions.description = 'callMetrics.customerDescription';

    this.activeDropdown = {
      array: this.activeData.dropdownOptions,
      disabled: false,
      selected: this.activeData.dropdownOptions[0],
      click: (): void => {},
    };

    this.deviceDropdown = {
      array: this.devicesJson.response.filterArray,
      disabled: false,
      selected: this.devicesJson.response.filterArray[0],
      click: (): void => {},
    };

    this.mediaDropdown = {
      array: this.mediaData.dropdownFilter,
      disabled: false,
      selected: this.mediaData.dropdownFilter[0],
      click: (): void => {},
    };
    this.ReportPrintService.printCustomerPage('all', this.defaults.timeFilter[0], {
      min: 0,
      max: 0,
    }, {
      active: this.dummyChart,
      rooms: this.dummyChart,
      files: this.dummyChart,
      media: this.dummyChart,
      device: this.dummyChart,
      metrics: this.dummyChart,
    }, {
      active: this.activeOptions,
      rooms: this.avgRoomsCard,
      files: this.filesSharedCard,
      media: this.mediaOptions,
      device: this.deviceCard,
      metrics: this.metricsOptions,
    }, {
      active: this.activeDropdown,
      media: this.mediaDropdown,
      device: this.deviceDropdown,
    }, {
      media: this.qualityLabels,
      metrics: this.metricsLabels,
    });

    expect(this.dummyChart.export.capture).toHaveBeenCalledTimes(6);
    expect(this.dummyChart.export.toJPG).toHaveBeenCalledTimes(6);
    this.$scope.$apply();
    expect(this.dummyChart.export.toPDF).toHaveBeenCalledTimes(1);
    expect(this.dummyChart.export.download).toHaveBeenCalledTimes(1);
  });

  it(' - printPartnerPage should print charts to pdf using Amcharts calls', function () {
    this.activeUserOptions = _.cloneDeep(this.ctrlData.activeUserOptions);
    this.populationOptions = _.cloneDeep(this.ctrlData.populationOptions);
    this.mediaOptions = _.cloneDeep(this.ctrlData.mediaOptions);
    this.endpointOptions = _.cloneDeep(this.ctrlData.endpointOptions);
    this.callOptions = _.cloneDeep(this.ctrlData.callOptions);
    this.endpointOptions.table.data = _.cloneDeep(this.endpointsData.registeredEndpointResponse);

    this.ReportPrintService.printPartnerPage('all', this.defaults.timeFilter[0], {
      active: this.dummyChart,
      population: this.dummyChart,
      media: this.dummyChart,
      metrics: this.dummyChart,
    }, {
      active: this.activeUserOptions,
      population: this.populationOptions,
      media: this.mediaOptions,
      device: this.endpointOptions,
      metrics: this.callOptions,
    });

    expect(this.dummyChart.export.capture).toHaveBeenCalledTimes(4);
    expect(this.dummyChart.export.toJPG).toHaveBeenCalledTimes(4);
    this.$scope.$apply();
    expect(this.dummyChart.export.toPDF).toHaveBeenCalledTimes(1);
    expect(this.dummyChart.export.download).toHaveBeenCalledTimes(1);
  });

  it('should return the export menu', function () {
    this.exportMenu = this.ReportPrintService.createExportMenu({});
    expect(this.exportMenu.length).toBe(4);
    _.forEach(this.exportMenu, (exportItem: IExportMenu, index: number): void => {
      expect(exportItem.id).toEqual(this.ctrlData.exportMenu[index].id);
      expect(exportItem.label).toEqual(this.ctrlData.exportMenu[index].label);
      if (index > 0) {
        expect(exportItem.click).toEqual(jasmine.any(Function));
      } else {
        expect(exportItem.click).toBeUndefined();
      }
    });
  });
});
