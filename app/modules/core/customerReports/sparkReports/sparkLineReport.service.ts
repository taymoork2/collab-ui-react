import { CommonReportService } from '../../partnerReports/commonReportServices/commonReport.service';
import { ReportConstants } from '../../partnerReports/commonReportServices/reportConstants.service';
import {
  IActiveTableBase,
  IActiveUserData,
  ITimespan,
  ITypeQuery,
} from '../../partnerReports/partnerReportInterfaces';

import {
  IActiveUserWrapper,
} from './sparkReportInterfaces';

export class SparkLineReportService {
  // Promise Tracking
  private activeDeferred: ng.IDeferred<any>;
  private mostActiveDeferred: ng.IDeferred<any>;

  /* @ngInject */
  constructor(
    private $q: ng.IQService,
    private CommonReportService: CommonReportService,
    private ReportConstants: ReportConstants,
  ) {}

  // Active User Data
  public getActiveUserData(filter: ITimespan): ng.IHttpPromise<IActiveUserWrapper> {
    // cancel any currently running jobs
    if (this.activeDeferred) {
      this.activeDeferred.resolve(this.ReportConstants.ABORT);
    }
    this.activeDeferred = this.$q.defer();

    let returnData: IActiveUserWrapper = {
      graphData: [],
      isActiveUsers: false,
    };

    let lineOptions: ITypeQuery = this.CommonReportService.getLineTypeOptions(filter, 'activeUsers');
    return this.CommonReportService.getCustomerAltReportByType(lineOptions, this.activeDeferred).then((response: any): IActiveUserWrapper => {
      let data = _.get(response, 'data.data');
      if (data) {
        return this.adjustActiveData(data, filter, returnData);
      } else {
        return returnData;
      }
    }).catch((error: any): IActiveUserWrapper => {
      return this.CommonReportService.returnErrorCheck(error, 'activeUsers.overallActiveUserGraphError', returnData);
    });
  }

  private adjustActiveData(activeData: any, filter: ITimespan, returnData: IActiveUserWrapper): IActiveUserWrapper {
    let emptyGraph: boolean = true;
    let graphItem: IActiveUserData = {
      date: '',
      totalRegisteredUsers: 0,
      activeUsers: 0,
      percentage: 0,
      balloon: true,
    };
    let returnGraph: Array<IActiveUserData> = this.CommonReportService.getReturnLineGraph(filter, graphItem);

    _.forEach(activeData, (item: any): void => {
      let date: string = this.CommonReportService.getModifiedLineDate(item.date);
      let details: any = _.get(item, 'details[0]');

      if (details) {
        let activeUsers: number = _.toInteger(details.combinedActiveUsers);
        let totalRegisteredUsers: number = _.toInteger(details.totalSparkEntitled);

        if (activeUsers > 0 || totalRegisteredUsers > 0) {
          _.forEach(returnGraph, (graphPoint) => {
            if (graphPoint.date === date) {
              graphPoint.totalRegisteredUsers = totalRegisteredUsers;
              graphPoint.activeUsers = activeUsers;
              graphPoint.percentage = this.CommonReportService.getPercentage(activeUsers, totalRegisteredUsers);
              emptyGraph = false;
            }
          });
        }
      }
    });

    if (!emptyGraph) {
      returnData.graphData = returnGraph;
      returnData.isActiveUsers = true;
    }
    return returnData;
  }

  // Most Active User Data
  public getMostActiveUserData(filter: ITimespan): ng.IPromise<Array<IActiveTableBase>> {
    // cancel any currently running jobs
    if (this.mostActiveDeferred) {
      this.mostActiveDeferred.resolve(this.ReportConstants.ABORT);
    }
    this.mostActiveDeferred = this.$q.defer();

    let deferred: ng.IDeferred<Array<IActiveTableBase>> = this.$q.defer();
    let responseArray: Array<IActiveTableBase> = [];
    let options: ITypeQuery = this.CommonReportService.getTypeOptions(filter, 'mostActive');
    this.CommonReportService.getCustomerAltReportByType(options, this.mostActiveDeferred).then((response: any): void => {
      let responseData: any = _.get(response, 'data.data');
      if (responseData) {
        _.forEach(responseData, (item: any): void => {
          let details: any = _.get(item, 'details', undefined);
          if (details) {
            responseArray.push({
              numCalls: _.toInteger(details.sparkCalls) + _.toInteger(item.details.sparkUcCalls),
              totalActivity: _.toInteger(details.totalActivity),
              sparkMessages: _.toInteger(details.sparkMessages),
              userName: details.userName,
            });
          }
        });
      }
      deferred.resolve(responseArray);
    }).catch((error: any): void => {
      deferred.reject(this.CommonReportService.returnErrorCheck(error, 'activeUsers.mostActiveError', responseArray));
    });

    return deferred.promise;
  }
}

angular.module('Core')
  .service('SparkLineReportService', SparkLineReportService);
