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
import { Notification } from 'modules/core/notifications';

class ReportService {
  private readonly POSITIVE: string = 'positive';
  private readonly NEGATIVE: string = 'negative';
  private readonly ACTIVE_USERS: string = 'activeUsers';
  private readonly TOPN: string = 'topn';

  private activeUserCustomerGraphs = {};
  private overallPopulation: number = 0;
  private timeFilter: number | string | void;

  // promise tracking
  private ABORT: string = 'ABORT';
  private TIMEOUT: string = 'TIMEOUT';
  private activeUserDetailedPromise: ng.IHttpPromise<any>;
  private activeUserCancelPromise: ng.IDeferred<any>;
  private activeTableCancelPromise: ng.IDeferred<any>;
  private callMetricsCancelPromise: ng.IDeferred<any>;
  private endpointsCancelPromise: ng.IDeferred<any>;
  private qualityCancelPromise: ng.IDeferred<any>;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private $q: ng.IQService,
    private CommonReportService,
    private chartColors,
    private Notification: Notification,
    private PartnerService,
  ) {}

  public getCustomerList(): ng.IHttpPromise<any> {
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
  public getOverallActiveUserData(filter: ITimespan): ng.IHttpPromise<any> {
    this.timeFilter = filter.value;
    this.activeUserCustomerGraphs = {};
    this.overallPopulation = 0;

    if (this.activeUserCancelPromise) {
      this.activeUserCancelPromise.resolve(this.ABORT);
    }
    this.activeUserCancelPromise = this.$q.defer();

    let reportOptions: IIntervalQuery = this.CommonReportService.getOptions(filter, this.ACTIVE_USERS, this.CommonReportService.DETAILED);
    this.activeUserDetailedPromise = this.CommonReportService.getPartnerReport(reportOptions, null, this.activeUserCancelPromise).then((response) => {
      let data = _.get(response, 'data.data');
      if (data) {
        let overallActive = 0;
        let overallRegistered = 0;

        _.forEach(data, (customer) => {
          let customerData = this.formatActiveUserOrgData(customer);
          this.activeUserCustomerGraphs[customer.orgId] = customerData;
          overallActive += customerData.totalActive;
          overallRegistered += customerData.totalRegistered;
        });

        // compute overall population percentage for all customers with active users
        this.overallPopulation = this.CommonReportService.getPercentage(overallActive, overallRegistered);
      }
      return;
    }).catch((error: any) => {
      if (error.status && (error.status !== 0 || error.config.timeout.$$state.status === 0)) {
        this.timeFilter = undefined;
      }
      return this.CommonReportService.returnErrorCheck(error, 'activeUsers.overallActiveUserGraphError', this.TIMEOUT);
    });

    return this.activeUserDetailedPromise;
  }

  private formatActiveUserOrgData(org): IActiveUserCustomerData {
    let graphData: Array<IActiveUserData> = [];
    let populationData: IPopulationData = {
      customerName: org.orgId,
      percentage: undefined,
      overallPopulation: this.overallPopulation,
      color: undefined,
      labelColorField: this.chartColors.grayDarkest,
      balloon: true,
    };
    let totalActive = 0;
    let totalRegistered = 0;

    _.forEach(_.get(org, 'data'), (item: any): void => {
      let date: string = item.date;
      let details: any = item.details;
      if (details && date) {
        let activeUsers = this.CommonReportService.getInt(details.activeUsers);
        let totalRegisteredUsers = this.CommonReportService.getInt(details.totalRegisteredUsers);

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

    let percentage: number = this.CommonReportService.getPercentage(totalActive, totalRegistered);
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

  public getActiveUserData(customers: Array<IReportsCustomer>, filter: ITimespan): ng.IHttpPromise<IActiveUserReturnData> {
    let overallStatus = true;
    let promise;

    if (_.isUndefined(this.timeFilter) || filter.value !== this.timeFilter || _.isUndefined(this.activeUserDetailedPromise)) {
      promise = this.getOverallActiveUserData(filter).then((response) => {
        if (response === this.ABORT) {
          overallStatus = false;
        }
        return;
      });
    } else {
      promise = this.activeUserDetailedPromise;
    }

    return promise.then(() => {
      if (overallStatus) {
        return this.getActiveGraphData(customers, filter);
      } else {
        return {
          graphData: [],
          isActiveUsers: false,
          popData: [],
        };
      }
    });
  }

  private getActiveGraphData(customers: Array<IReportsCustomer>, filter: ITimespan): IActiveUserReturnData {
    let returnData: IActiveUserReturnData = {
      graphData: [],
      popData: [],
      isActiveUsers: false,
    };
    let date: string = '';
    let activeDataSet: Array<Array<IActiveUserData>> = [];

    _.forEach(customers, (org: IReportsCustomer) => {
      // placeholder for the combined population graph
      let emptyPopGraph: IPopulationData = {
        customerName: org.label,
        percentage: 0,
        overallPopulation: this.overallPopulation,
        balloon: true,
        color: undefined,
        labelColorField: this.chartColors.grayDarkest,
      };
      let orgData: IActiveUserCustomerData = this.activeUserCustomerGraphs[org.value];

      if (orgData) {
        // gather active user data for combining below
        let orgActive: Array<IActiveUserData> = orgData.graphData;
        activeDataSet.push(orgActive);

        if (orgActive && (orgActive.length > 0) && (date === '' || orgActive[(orgActive.length - 1)].date > date)) {
          date = orgActive[(orgActive.length - 1)].date;
        }

        // Pre-determine if the most active user table will be populated
        if (orgData.totalActive > 0) {
          returnData.isActiveUsers = true;
        }

        // add to the combined population graph
        let popGraph = this.activeUserCustomerGraphs[org.value].populationData;
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
    let baseGraph: Array<IActiveUserData> = this.CommonReportService.getReturnGraph(filter, date, {
      totalRegisteredUsers: 0,
      activeUsers: 0,
      percentage: 0,
      balloon: true,
    });
    let emptyGraph = true;
    _.forEach(activeDataSet, (item: Array<IActiveUserData>) => {
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

  private combineMatchingDates(graphData: Array<IActiveUserData>, customerData: Array<IActiveUserData>, filter: ITimespan): Array<IActiveUserData> {
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

  public getActiveTableData(customers: Array<IReportsCustomer>, filter: ITimespan): ng.IHttpPromise<Array<IActiveTableData>> {
    if (this.activeTableCancelPromise) {
      this.activeTableCancelPromise.resolve(this.ABORT);
    }
    this.activeTableCancelPromise = this.$q.defer();

    let customerArray: Array<IReportsCustomer> = [];
    _.forEach(customers, (customer) => {
      if (customer.isAllowedToManage) {
        customerArray.push(customer);
      }
    });

    if (customerArray.length === 0) {
      return this.$q.when([]);
    } else {
      // TODO: Remove IIntervalQuery once API is fixed; currently necessary to avoid exceptions from API
      let extraOptions: IIntervalQuery = this.CommonReportService.getOptions(filter, this.ACTIVE_USERS, this.TOPN);
      let reportOptions: IReportTypeQuery = this.CommonReportService.getReportTypeOptions(filter, this.ACTIVE_USERS, this.TOPN);

      return this.CommonReportService.getPartnerReportByReportType(reportOptions, extraOptions, customerArray, this.activeTableCancelPromise).then((response) => {
        let tableData: Array<IActiveTableData> = [];
        _.forEach(_.get(response, 'data.data'), (org) => {
          _.forEach(_.get(org, 'data'), (item) => {
            tableData.push({
              orgName: org.orgName,
              numCalls: this.CommonReportService.getInt(item.details.sparkCalls) + this.CommonReportService.getInt(item.details.sparkUcCalls),
              totalActivity: this.CommonReportService.getInt(item.details.totalActivity),
              sparkMessages: this.CommonReportService.getInt(item.details.sparkMessages),
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

  public getMediaQualityMetrics(customers: Array<IReportsCustomer>, filter: ITimespan): Array<IMediaQualityData> {
    if (this.qualityCancelPromise) {
      this.qualityCancelPromise.resolve(this.ABORT);
    }
    this.qualityCancelPromise = this.$q.defer();

    let reportOptions = this.CommonReportService.getOptions(filter, 'callQuality', this.CommonReportService.DETAILED);
    return this.CommonReportService.getPartnerReport(reportOptions, customers, this.qualityCancelPromise).then((response) => {
      let data: any = _.get(response, 'data.data');
      if (data) {
        let graphItem: IMediaQualityData = {
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
            let orgDate: string = org.data[org.data.length - 1].date;
            if (orgDate && (date === '' || orgDate > date)) {
              date = orgDate;
            }
          }
        });

        let baseGraph = this.CommonReportService.getReturnGraph(filter, date, graphItem);
        let graphUpdated = false;
        _.forEach(data, (org: any) => {
          let orgData = _.get(org, 'data');
          if (_.isArray(orgData)) {
            let graph = this.parseMediaQualityData(orgData, filter);
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

  private parseMediaQualityData(orgData: Array<any>, filter: ITimespan): Array<IMediaQualityData> {
    let graph: Array<IMediaQualityData> = [];
    _.forEach(orgData, (item) => {
      let details: any = _.get(item, 'details');
      if (details) {
        let totalSum = this.CommonReportService.getInt(details.totalDurationSum);
        let goodSum = this.CommonReportService.getInt(details.goodQualityDurationSum);
        let fairSum = this.CommonReportService.getInt(details.fairQualityDurationSum);
        let poorSum = this.CommonReportService.getInt(details.poorQualityDurationSum);
        let partialSum = fairSum + poorSum;
        let date = _.get(item, 'date');

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

  private combineQualityGraphs(baseGraph: Array<IMediaQualityData>, graph: Array<IMediaQualityData>): Array<IMediaQualityData> {
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

  public getCallMetricsData(customers: Array<IReportsCustomer>, filter: ITimespan): ng.IHttpPromise<ICallMetricsData> {
    if (this.callMetricsCancelPromise) {
      this.callMetricsCancelPromise.resolve(this.ABORT);
    }
    this.callMetricsCancelPromise = this.$q.defer();
    let returnArray: ICallMetricsData = {
      dataProvider: [],
      labelData: {
        numTotalCalls: 0,
        numTotalMinutes: 0,
      },
      dummy: false,
    };

    let reportOptions = this.CommonReportService.getOptionsOverPeriod(filter, 'callMetrics', this.CommonReportService.DETAILED);
    return this.CommonReportService.getPartnerReport(reportOptions, customers, this.callMetricsCancelPromise).then((response) => {
      let data = _.get(response, 'data.data');
      if (data) {
        let transformDataSet: boolean = false;
        let transformData: ICallMetricsData = {
          dataProvider: [{
            label: this.$translate.instant('callMetrics.callConditionFail'),
            value: 0,
            color: this.chartColors.grayDarkest,
          }, {
            label: this.$translate.instant('callMetrics.callConditionSuccessful'),
            value: 0,
            color: this.chartColors.brandInfo,
          }],
          labelData: {
            numTotalCalls: 0,
            numTotalMinutes: 0,
          },
          dummy: false,
        };

        _.forEach(data, (item) => {
          let details: any = _.get(item, 'data[0].details');
          if (details) {
            let totalCalls = this.CommonReportService.getInt(details.totalCalls);

            if (totalCalls > 0) {
              transformData.labelData.numTotalCalls += totalCalls;
              transformData.labelData.numTotalMinutes += Math.round(parseFloat(details.totalAudioDuration));
              transformData.dataProvider[0].value += this.CommonReportService.getInt(details.totalFailedCalls);
              transformData.dataProvider[1].value += this.CommonReportService.getInt(details.totalSuccessfulCalls);
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

  public getRegisteredEndpoints(customers: Array<IReportsCustomer>, filter: ITimespan): ng.IHttpPromise<Array<Array<IEndpointData>>> {
    if (this.endpointsCancelPromise) {
      this.endpointsCancelPromise.resolve(this.ABORT);
    }
    this.endpointsCancelPromise = this.$q.defer();

    let reportOptions: IIntervalQuery = this.CommonReportService.getTrendOptions(filter, 'registeredEndpoints', 'trend');
    return this.CommonReportService.getPartnerReport(reportOptions, customers, this.endpointsCancelPromise).then((response) => {
      let returnArray: Array<Array<IEndpointData>> = [];
      let data = _.get(response, 'data.data');
      if (data) {
        _.forEach(data, (item) => {
          let details: any = _.get(item, 'details');
          if (details) {
            let customerName: string = this.getCustomerName(customers, details.orgId);
            let direction: string = this.NEGATIVE;
            let registeredDevicesTrend: string = details.registeredDevicesTrend;

            if (registeredDevicesTrend === 'NaN') {
              direction = this.POSITIVE;
              registeredDevicesTrend = '+0.0';
            } else if (registeredDevicesTrend >= '0') {
              direction = this.POSITIVE;
              registeredDevicesTrend = '+' + registeredDevicesTrend;
            }

            returnArray.push(this.createEndpointTableEntry(customerName, details.minRegisteredDevices, details.maxRegisteredDevices, direction, registeredDevicesTrend + '%', details.yesterdaysRegisteredDevices));
          }
        });
      }

      let rLength: number = returnArray.length;
      let cLength: number = customers.length;
      if (cLength > rLength && rLength > 0) {
        _.forEach(customers, (org) => {
          let emptyOrg: boolean = true;
          _.forEach(returnArray, (item) => {
            let orgName = _.get(item, '[0].output[0]');
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

  private getCustomerName(customer: Array<IReportsCustomer>, uuid: string): string {
    let customerName = '';
    _.forEach(customer, (org) => {
      if (org.value === uuid) {
        customerName = org.label;
      }
    });
    return customerName;
  }

  private createEndpointTableEntry(customerName: string, min: string, max: string, direction: string, trend: string, yesterday: string): Array<IEndpointData> {
    return [{
      class: 'vertical-center customer-data',
      output: [customerName],
      splitClasses: undefined,
    }, {
      class: 'table-data',
      output: [min, max],
      splitClasses: 'table-half vertical-center horizontal-center',
    }, {
      class: 'vertical-center horizontal-center ' + direction,
      output: [trend],
      splitClasses: undefined,
    }, {
      class: 'vertical-center horizontal-center',
      output: [yesterday],
      splitClasses: undefined,
    }];
  }
}

angular.module('Core')
  .service('ReportService', ReportService);
