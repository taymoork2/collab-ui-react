import {
  IActiveUserCustomerData,
  IActiveUserData,
  IActiveUserReturnData,
  IActiveTableData,
  ICallMetricsData,
  IEndpointData,
  IMediaQualityData,
  IPopulationData,
  IReportsCustomer,
  ITimespan,
  IIntervalQuery,
  IReportTypeQuery,
} from './partnerReportInterfaces';
import { CommonReportService } from './commonReportServices/commonReport.service';
import { ReportConstants } from './commonReportServices/reportConstants.service';
import { ChartColors } from 'modules/core/config/chartColors';
import { Notification } from 'modules/core/notifications';

export class ReportService {
  private readonly ACTIVE_USERS: string = 'activeUsers';
  private readonly TOPN: string = 'topn';

  private activeUserCustomerGraphs = {};
  private overallPopulation: number = 0;
  private timeFilter: number | string | void;

  // promise tracking
  private ABORT: string = 'ABORT';
  private TIMEOUT: string = 'TIMEOUT';
  private activeUserDetailedPromise: ng.IPromise<any>;
  private activeUserCancelPromise: ng.IDeferred<any>;
  private activeTableCancelPromise: ng.IDeferred<any>;
  private callMetricsCancelPromise: ng.IDeferred<any>;
  private endpointsCancelPromise: ng.IDeferred<any>;
  private qualityCancelPromise: ng.IDeferred<any>;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private $q: ng.IQService,
    private CommonReportService: CommonReportService,
    private Notification: Notification,
    private ReportConstants: ReportConstants,
    private PartnerService,
  ) {}

  public getCustomerList(): ng.IPromise<any[]> {
    return this.PartnerService.getManagedOrgsList()
      .catch((error) => {
        this.Notification.errorWithTrackingId(error, 'reportsPage.customerLoadError');
        return [];
      })
      .then((response) => {
        return _.get(response, 'data.organizations', []);
      });
  }

  // Active User Functions
  public getOverallActiveUserData(filter: ITimespan): void {
    this.timeFilter = filter.value;
    this.activeUserCustomerGraphs = {};
    this.overallPopulation = 0;

    if (this.activeUserCancelPromise) {
      this.activeUserCancelPromise.resolve(this.ABORT);
    }
    this.activeUserCancelPromise = this.$q.defer();

    const reportOptions: IIntervalQuery = this.CommonReportService.getOptions(filter, this.ACTIVE_USERS, this.CommonReportService.DETAILED);
    this.activeUserDetailedPromise = this.CommonReportService.getPartnerReport(reportOptions, undefined, this.activeUserCancelPromise).then((response) => {
      const data = _.get(response, 'data.data');
      if (data) {
        let overallActive = 0;
        let overallRegistered = 0;

        _.forEach(data, (customer) => {
          const customerData = this.formatActiveUserOrgData(customer);
          this.activeUserCustomerGraphs[customer.orgId] = customerData;
          overallActive += customerData.totalActive;
          overallRegistered += customerData.totalRegistered;
        });

        // compute overall population percentage for all customers with active users
        this.overallPopulation = this.CommonReportService.getPercentage(overallActive, overallRegistered);
      }
      return;
    }).catch((error: any): string => {
      if (error.status && (error.status !== 0 || error.config.timeout.$$state.status === 0)) {
        this.timeFilter = undefined;
      }
      return this.CommonReportService.returnErrorCheck(error, 'activeUsers.overallActiveUserGraphError', this.TIMEOUT);
    });
  }

  private formatActiveUserOrgData(org): IActiveUserCustomerData {
    const graphData: IActiveUserData[] = [];
    const populationData: IPopulationData = {
      customerName: org.orgId,
      percentage: undefined,
      overallPopulation: this.overallPopulation,
      color: undefined,
      labelColorField: ChartColors.grayDarkThree,
      balloon: true,
    };
    let totalActive = 0;
    let totalRegistered = 0;

    _.forEach(_.get(org, 'data'), (item: any): void => {
      const date: string = item.date;
      const details: any = item.details;
      if (details && date) {
        const activeUsers = _.toInteger(details.activeUsers);
        const totalRegisteredUsers = _.toInteger(details.totalRegisteredUsers);

        if (activeUsers > 0 || totalRegisteredUsers > 0) {
          graphData.push({
            activeUsers: activeUsers,
            totalRegisteredUsers: totalRegisteredUsers,
            percentage: this.CommonReportService.getPercentage(activeUsers, totalRegisteredUsers),
            date: date,
            balloon: true,
          });

          totalActive += activeUsers;
          totalRegistered += totalRegisteredUsers;
        }
      }
    });

    const percentage: number = this.CommonReportService.getPercentage(totalActive, totalRegistered);
    if (!isNaN(percentage) && percentage >= 0) {
      populationData.percentage = percentage;
    }

    return {
      graphData: graphData,
      populationData: populationData,
      totalActive: totalActive,
      totalRegistered: totalRegistered,
    };
  }

  public getActiveUserData(customers: IReportsCustomer[], filter: ITimespan): ng.IPromise<IActiveUserReturnData> {
    if (_.isUndefined(this.timeFilter) || filter.value !== this.timeFilter || _.isUndefined(this.activeUserDetailedPromise)) {
      this.getOverallActiveUserData(filter);
    }

    return this.activeUserDetailedPromise.then(() => {
      return this.getActiveGraphData(customers, filter);
    });
  }

  private getActiveGraphData(customers: IReportsCustomer[], filter: ITimespan): IActiveUserReturnData {
    const returnData: IActiveUserReturnData = {
      graphData: [],
      popData: [],
      isActiveUsers: false,
    };
    let date: string = '';
    const activeDataSet: IActiveUserData[][] = [];

    _.forEach(customers, (org: IReportsCustomer) => {
      // placeholder for the combined population graph
      const emptyPopGraph: IPopulationData = {
        customerName: org.label,
        percentage: 0,
        overallPopulation: this.overallPopulation,
        balloon: true,
        color: undefined,
        labelColorField: ChartColors.grayDarkThree,
      };
      const orgData: IActiveUserCustomerData = this.activeUserCustomerGraphs[org.value];

      if (orgData) {
        // gather active user data for combining below
        const orgActive: IActiveUserData[] = orgData.graphData;
        activeDataSet.push(orgActive);

        if (orgActive && (orgActive.length > 0) && (date === '' || orgActive[(orgActive.length - 1)].date > date)) {
          date = orgActive[(orgActive.length - 1)].date;
        }

        // Pre-determine if the most active user table will be populated
        if (orgData.totalActive > 0) {
          returnData.isActiveUsers = true;
        }

        // add to the combined population graph
        const popGraph = this.activeUserCustomerGraphs[org.value].populationData;
        if (popGraph) {
          popGraph.customerName = org.label;
          popGraph.overallPopulation = this.overallPopulation;
          returnData.popData.push(popGraph);
        } else {
          returnData.popData.push(emptyPopGraph);
        }
      } else {
        returnData.popData.push(emptyPopGraph);
      }
    });

    // combine the active user data into a single graph
    let baseGraph: IActiveUserData[] = this.CommonReportService.getReturnGraph(filter, date, {
      totalRegisteredUsers: 0,
      activeUsers: 0,
      percentage: 0,
      balloon: true,
    });
    let emptyGraph = true;
    _.forEach(activeDataSet, (item: IActiveUserData[]) => {
      if (item.length > 0) {
        baseGraph = this.combineMatchingDates(baseGraph, item, filter);
        emptyGraph = false;
      }
    });

    if (!emptyGraph) {
      returnData.graphData = baseGraph;
    }
    return returnData;
  }

  private combineMatchingDates(graphData: IActiveUserData[], customerData: IActiveUserData[], filter: ITimespan): IActiveUserData[] {
    if (graphData.length > 0) {
      _.forEach(customerData, (datapoint: IActiveUserData) => {
        _.forEach(graphData, (graphpoint: IActiveUserData) => {
          if (graphpoint.date === this.CommonReportService.getModifiedDate(datapoint.date, filter)) {
            graphpoint.totalRegisteredUsers += datapoint.totalRegisteredUsers;
            graphpoint.activeUsers += datapoint.activeUsers;
            graphpoint.percentage = this.CommonReportService.getPercentage(graphpoint.activeUsers, graphpoint.totalRegisteredUsers);
          }
        });
      });
    }
    return graphData;
  }

  public getActiveTableData(customers: IReportsCustomer[], filter: ITimespan): ng.IPromise<IActiveTableData[]> {
    if (this.activeTableCancelPromise) {
      this.activeTableCancelPromise.resolve(this.ABORT);
    }
    this.activeTableCancelPromise = this.$q.defer();

    const customerArray: IReportsCustomer[] = [];
    _.forEach(customers, (customer) => {
      if (customer.isAllowedToManage) {
        customerArray.push(customer);
      }
    });

    if (customerArray.length === 0) {
      return this.$q.resolve([]);
    } else {
      // TODO: Remove IIntervalQuery once API is fixed; currently necessary to avoid exceptions from API
      const extraOptions: IIntervalQuery = this.CommonReportService.getOptions(filter, this.ACTIVE_USERS, this.TOPN);
      const reportOptions: IReportTypeQuery = this.CommonReportService.getReportTypeOptions(filter, this.ACTIVE_USERS, this.TOPN);

      return this.CommonReportService.getPartnerReportByReportType(reportOptions, extraOptions, customerArray, this.activeTableCancelPromise).then((response) => {
        const tableData: IActiveTableData[] = [];
        _.forEach<any>(_.get(response, 'data.data'), (org) => {
          _.forEach<any>(_.get(org, 'data'), (item) => {
            tableData.push({
              orgName: org.orgName,
              numCalls: _.toInteger(item.details.sparkCalls) + _.toInteger(item.details.sparkUcCalls),
              totalActivity: _.toInteger(item.details.totalActivity),
              sparkMessages: _.toInteger(item.details.sparkMessages),
              userName: item.details.userName,
            });
          });
        });
        return tableData;
      }).catch((error) => {
        return this.CommonReportService.returnErrorCheck(error, 'activeUsers.activeUserTableError', []);
      });
    }
  }

  public getMediaQualityMetrics(customers: IReportsCustomer[], filter: ITimespan): ng.IPromise<IMediaQualityData[]> {
    if (this.qualityCancelPromise) {
      this.qualityCancelPromise.resolve(this.ABORT);
    }
    this.qualityCancelPromise = this.$q.defer();

    const reportOptions = this.CommonReportService.getOptions(filter, 'callQuality', this.CommonReportService.DETAILED);
    return this.CommonReportService.getPartnerReport(reportOptions, customers, this.qualityCancelPromise).then((response) => {
      const data: any = _.get(response, 'data.data');
      if (data) {
        const graphItem: IMediaQualityData = {
          date: '',
          totalDurationSum: 0,
          goodQualityDurationSum: 0,
          fairQualityDurationSum: 0,
          poorQualityDurationSum: 0,
          partialSum: 0,
          balloon: true,
        };

        let date: string = '';
        _.forEach(data, (org: any) => {
          if (_.isArray(org.data)) {
            const orgDate: string = org.data[org.data.length - 1].date;
            if (orgDate && (date === '' || orgDate > date)) {
              date = orgDate;
            }
          }
        });

        let baseGraph = this.CommonReportService.getReturnGraph(filter, date, graphItem);
        let graphUpdated = false;
        _.forEach(data, (org: any) => {
          const orgData = _.get(org, 'data');
          if (_.isArray(orgData)) {
            const graph = this.parseMediaQualityData(orgData, filter);
            if (graph.length > 0) {
              baseGraph = this.combineQualityGraphs(baseGraph, graph);
              graphUpdated = true;
            }
          }
        });
        if (graphUpdated) {
          return baseGraph;
        }
      }
      return [];
    }).catch((error) => {
      return this.CommonReportService.returnErrorCheck(error, 'mediaQuality.mediaQualityGraphError', []);
    });
  }

  private parseMediaQualityData(orgData: any[], filter: ITimespan): IMediaQualityData[] {
    const graph: IMediaQualityData[] = [];
    _.forEach(orgData, (item) => {
      const details: any = _.get(item, 'details');
      if (details) {
        const totalSum = _.toInteger(details.totalDurationSum);
        const goodSum = _.toInteger(details.goodQualityDurationSum);
        const fairSum = _.toInteger(details.fairQualityDurationSum);
        const poorSum = _.toInteger(details.poorQualityDurationSum);
        const partialSum = fairSum + poorSum;
        const date = _.get(item, 'date', '');

        if (totalSum > 0 && date) {
          graph.push({
            date: this.CommonReportService.getModifiedDate(date, filter),
            totalDurationSum: totalSum,
            partialSum: partialSum,
            goodQualityDurationSum: goodSum,
            fairQualityDurationSum: fairSum,
            poorQualityDurationSum: poorSum,
            balloon: true,
          });
        }
      }
    });
    return graph;
  }

  private combineQualityGraphs(baseGraph: IMediaQualityData[], graph: IMediaQualityData[]): IMediaQualityData[] {
    _.forEach(graph, (graphItem) => {
      _.forEach(baseGraph, (baseGraphItem) => {
        if (graphItem.date === baseGraphItem.date) {
          baseGraphItem.totalDurationSum += graphItem.totalDurationSum;
          baseGraphItem.goodQualityDurationSum += graphItem.goodQualityDurationSum;
          baseGraphItem.fairQualityDurationSum += graphItem.fairQualityDurationSum;
          baseGraphItem.poorQualityDurationSum += graphItem.poorQualityDurationSum;
          baseGraphItem.partialSum += graphItem.partialSum;
        }
      });
    });
    return baseGraph;
  }

  public getCallMetricsData(customers: IReportsCustomer[], filter: ITimespan): ng.IPromise<ICallMetricsData> {
    if (this.callMetricsCancelPromise) {
      this.callMetricsCancelPromise.resolve(this.ABORT);
    }
    this.callMetricsCancelPromise = this.$q.defer();
    const returnArray: ICallMetricsData = {
      dataProvider: [],
      labelData: {
        numTotalCalls: 0,
        numTotalMinutes: 0,
      },
      dummy: false,
    };

    const reportOptions = this.CommonReportService.getOptionsOverPeriod(filter, 'callMetrics', this.CommonReportService.DETAILED);
    return this.CommonReportService.getPartnerReport(reportOptions, customers, this.callMetricsCancelPromise).then((response) => {
      const data = _.get(response, 'data.data');
      if (data) {
        let transformDataSet: boolean = false;
        const transformData: ICallMetricsData = {
          dataProvider: [{
            label: this.$translate.instant('callMetrics.callConditionFail'),
            value: 0,
            color: ChartColors.grayDarkThree,
          }, {
            label: this.$translate.instant('callMetrics.callConditionSuccessful'),
            value: 0,
            color: ChartColors.peopleLight,
          }],
          labelData: {
            numTotalCalls: 0,
            numTotalMinutes: 0,
          },
          dummy: false,
        };

        _.forEach(data, (item) => {
          const details: any = _.get(item, 'data[0].details');
          if (details) {
            const totalCalls = _.toInteger(details.totalCalls);

            if (totalCalls > 0) {
              transformData.labelData.numTotalCalls += totalCalls;
              transformData.labelData.numTotalMinutes += Math.round(parseFloat(details.totalAudioDuration));
              transformData.dataProvider[0].value += _.toInteger(details.totalFailedCalls);
              transformData.dataProvider[1].value += _.toInteger(details.totalSuccessfulCalls);
              transformDataSet = true;
            }
          }
        });

        if (transformDataSet) {
          return transformData;
        }
      }
      return returnArray;
    }).catch((error) => {
      return this.CommonReportService.returnErrorCheck(error, 'callMetrics.callMetricsChartError', returnArray);
    });
  }

  public getRegisteredEndpoints(customers: IReportsCustomer[], filter: ITimespan): ng.IPromise<IEndpointData[][]> {
    if (this.endpointsCancelPromise) {
      this.endpointsCancelPromise.resolve(this.ABORT);
    }
    this.endpointsCancelPromise = this.$q.defer();

    const reportOptions: IIntervalQuery = this.CommonReportService.getTrendOptions(filter, 'registeredEndpoints', 'trend');
    return this.CommonReportService.getPartnerReport(reportOptions, customers, this.endpointsCancelPromise).then((response) => {
      const returnArray: IEndpointData[][] = [];
      const data = _.get(response, 'data.data');
      if (data) {
        _.forEach(data, (item) => {
          const details: any = _.get(item, 'details');
          if (details) {
            const customerName: string = this.getCustomerName(customers, details.orgId);
            let direction: string = this.ReportConstants.NEGATIVE;
            let registeredDevicesTrend: string = details.registeredDevicesTrend;

            if (registeredDevicesTrend === 'NaN') {
              direction = this.ReportConstants.POSITIVE;
              registeredDevicesTrend = '+0.0';
            } else if (registeredDevicesTrend >= '0') {
              direction = this.ReportConstants.POSITIVE;
              registeredDevicesTrend = '+' + registeredDevicesTrend;
            }

            returnArray.push(this.createEndpointTableEntry(customerName, details.minRegisteredDevices, details.maxRegisteredDevices, direction, registeredDevicesTrend + '%', details.yesterdaysRegisteredDevices));
          }
        });
      }

      const rLength: number = returnArray.length;
      const cLength: number = customers.length;
      if (cLength > rLength && rLength > 0) {
        _.forEach(customers, (org) => {
          let emptyOrg: boolean = true;
          _.forEach(returnArray, (item) => {
            const orgName = _.get(item, '[0].output[0]');
            if (orgName === org.label) {
              emptyOrg = false;
            }
          });
          if (emptyOrg) {
            returnArray.push(this.createEndpointTableEntry(org.label, '-', '-', '', '-', '-'));
          }
        });
      }
      return returnArray;
    }).catch((error) => {
      return this.CommonReportService.returnErrorCheck(error, 'registeredEndpoints.registeredEndpointsError', []);
    });
  }

  private getCustomerName(customer: IReportsCustomer[], uuid: string): string {
    let customerName = '';
    _.forEach(customer, (org) => {
      if (org.value === uuid) {
        customerName = org.label;
      }
    });
    return customerName;
  }

  private createEndpointTableEntry(customerName: string, min: string, max: string, direction: string, trend: string, yesterday: string): IEndpointData[] {
    return [{
      class: 'vertical-center ' + this.ReportConstants.CUSTOMER_DATA,
      output: [customerName],
      splitClasses: undefined,
    }, {
      class: 'table-data',
      output: [min, max],
      splitClasses: 'table-half vertical-center ' + this.ReportConstants.HORIZONTAL_CENTER,
    }, {
      class: 'vertical-center ' + this.ReportConstants.HORIZONTAL_CENTER + ' ' + direction,
      output: [trend],
      splitClasses: undefined,
    }, {
      class: 'vertical-center ' + this.ReportConstants.HORIZONTAL_CENTER,
      output: [yesterday],
      splitClasses: undefined,
    }];
  }
}

angular.module('Core')
  .service('ReportService', ReportService);
