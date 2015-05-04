(function () {
  'use strict';

  angular.module('Core')
    .service('PartnerReportService', PartnerReportService);

  /* @ngInject */
  function PartnerReportService($http, $translate, $q, Config, Authinfo, Notification, Log, PartnerService) {
    var urlBase = Config.getAdminServiceUrl() + 'organization/' + Authinfo.getOrgId() + '/reports/';
    var detailed = 'detailed';
    var topn = 'topn';
    var activeUserUrl = '/managedOrgs/activeUsers';
    var dateFormat = "MMM DD, YYYY";
    var mostRecentUpdate = "";
    var timeFilter;
    var customerList = null;
    var fiveMostActiveCustomers = [];
    var fiveLeastActiveCustomers = [];
    var fiveHighestQualityCustomers = [];
    var fiveLowestQualityCustomers = [];
    var savedActiveUserData = [];

    return {
      getActiveUserData: getActiveUserData,
      getCustomerList: getCustomerList,
      getPreviousFilter: getPreviousFilter,
      setActiveUsersData: setActiveUsersData
    };

    function getActiveUserData(id, name) {
      var graphData = getActiveUserGraphData(id);
      return getActiveUserTableData(id, name).then(function (tableData) {
        return {
          graphData: graphData,
          tableData: tableData
        };
      });
    }

    function getCustomerList() {
      return {
        customers: customerList,
        recentUpdate: mostRecentUpdate
      };
    }

    function getPreviousFilter() {
      return timeFilter;
    }

    function getService(urlQuery) {
      var url = urlBase + urlQuery;
      return $http.get(url);
    }

    function setMostRecentUpdate(data) {
      if (data.data !== undefined && data.data.date !== null && data.data.date !== undefined) {
        mostRecentUpdate = moment(data.data.date).format(dateFormat);
      }
    }

    function setActiveUsersData(filter) {
      timeFilter = filter;
      var query = getQuery();
      var promises = [];

      if (customerList === null) {
        var orgPromise = $q.defer();
        PartnerService.getManagedOrgsList(function (data, status) {
          if (data.success) {
            customerList = data.organizations;
            orgPromise.resolve();
          } else {
            Log.debug('Failed to retrieve managed orgs information. Status: ' + status);
            Notification.notify([$translate.instant('reportsPage.customerLoadError')], 'error');
            orgPromise.reject();
          }
        });
        promises.push(orgPromise.promise);
      }

      var detailedData = [];
      var detailedPromise = getService(detailed + activeUserUrl + query).then(function (response) {
        detailedData = response;
      }, function (error) {
        Log.debug('Loading active users failed.  Status: ' + error.status + ' Response: ' + error.message);
        Notification.notify([$translate.instant('activeUsers.activeUserGraphError')], 'error');
      });

      promises.push(detailedPromise);

      return $q.all(promises).then(function () {
        savedActiveUserData = [];
        if (detailedData.data !== null && detailedData.data !== undefined) {
          var graphData = detailedData.data.data;

          angular.forEach(graphData, function (index) {
            index.data = modifyActiveUserGraphData(index.data);
          });
          savedActiveUserData = graphData;
        }

        setMostRecentUpdate(detailedData);
        identifyMostLeastActiveCustomers();

        return;
      });
    }

    function getQuery() {
      if (timeFilter.value === 0) {
        return '?&intervalCount=1&intervalType=week&spanCount=1&spanType=day&cache=false';
      } else if (timeFilter.value === 1) {
        return '?&intervalCount=1&intervalType=month&spanCount=1&spanType=week&cache=false';
      } else {
        return '?&intervalCount=3&intervalType=month&spanCount=1&spanType=month&cache=false';
      }
    }

    function modifyActiveUserGraphData(data) {
      angular.forEach(data, function (index) {
        index.percentage = Math.floor((parseInt(index.details.activeUsers) / parseInt(index.details.totalRegisteredUsers)) * 100);
        index.activeUsers = parseInt(index.details.activeUsers);
        index.totalRegisteredUsers = parseInt(index.details.totalRegisteredUsers);
        index.modifiedDate = moment(index.date).format(dateFormat);
      });
      return data;
    }

    function identifyMostLeastActiveCustomers() {
      // reset to empty before sorting/resorting the customers
      fiveMostActiveCustomers = [];
      fiveLeastActiveCustomers = [];

      angular.forEach(customerList, function (customer) {
        var data = getActiveUserGraphData(customer.customerOrgId);
        var totalActivity = 0;
        if (data.length > 0) {
          angular.forEach(data, function (index) {
            totalActivity += parseInt(index.activeUsers);
          });
          addMostActive(customer.customerOrgId, customer.customerName, totalActivity);
        }
        addLeastActive(customer.customerOrgId, customer.customerName, totalActivity);
      });
    }

    function addMostActive(orgId, orgName, activity) {
      if (fiveMostActiveCustomers.length < 5) {
        fiveMostActiveCustomers.push({
          'orgId': orgId,
          'activity': activity
        });
      } else {
        for (var i = 0; i < fiveMostActiveCustomers.length; i++) {
          var org = angular.copy(fiveMostActiveCustomers[i]);
          if (org.activity < activity) {
            fiveMostActiveCustomers[i].orgId = orgId;
            fiveMostActiveCustomers[i].orgName = orgName;
            fiveMostActiveCustomers[i].activity = activity;
            return addMostActive(org.orgId, org.orgName, org.activity);
          }
        }
      }
    }

    function addLeastActive(orgId, orgName, activity) {
      if (fiveLeastActiveCustomers.length < 5) {
        fiveLeastActiveCustomers.push({
          'orgId': orgId,
          'activity': activity
        });
      } else {
        for (var i = 0; i < fiveLeastActiveCustomers.length; i++) {
          var org = angular.copy(fiveLeastActiveCustomers[i]);
          if (org.activity > activity) {
            fiveLeastActiveCustomers[i].orgId = orgId;
            fiveLeastActiveCustomers[i].orgName = orgName;
            fiveLeastActiveCustomers[i].activity = activity;
            return addLeastActive(org.orgId, org.orgName, org.activity);
          }
        }
      }
    }

    function getActiveUserGraphData(id) {
      if (id === 0) {
        return combineActiveUsersGraph(fiveMostActiveCustomers);
      } else if (id === 1) {
        return combineActiveUsersGraph(fiveLeastActiveCustomers);
      } else if (id === 2) {
        return combineActiveUsersGraph(fiveHighestQualityCustomers);
      } else if (id === 3) {
        return combineActiveUsersGraph(fiveLowestQualityCustomers);
      } else {
        for (var i = 0; i < savedActiveUserData.length; i++) {
          if (savedActiveUserData[i].orgId === id) {
            return savedActiveUserData[i].data;
          }
        }
      }

      return [];
    }

    function combineActiveUsersGraph(orgs) {
      var graphData = [];
      angular.forEach(orgs, function (org) {
        var orgData = getActiveUserGraphData(org.orgId);
        angular.forEach(orgData, function (data) {
          graphData = combineMatchingDates(graphData, data);
        });
      });

      // not all customers have active data for every day
      // this can cause data to be out of order without sorting
      return graphData.sort(function (a, b) {
        if (a.date === b.date) {
          return 0;
        } else if (a.date > b.date) {
          return 1;
        }
        return -1;
      });
    }

    function combineMatchingDates(graphData, dateData) {
      var updated = false;

      if (graphData.length > 0) {
        for (var i = 0; i < graphData.length; i++) {
          if (graphData[i].modifiedDate.indexOf(dateData.modifiedDate) !== -1) {
            graphData[i].totalRegisteredUsers += dateData.totalRegisteredUsers;
            graphData[i].activeUsers += dateData.activeUsers;
            graphData[i].percentage = Math.floor((graphData[i].activeUsers / graphData[i].totalRegisteredUsers) * 100);
            updated = true;
            break;
          }
        }
      }

      if (!updated) {
        graphData.push(angular.copy(dateData));
      }
      return graphData;
    }

    function getActiveUserTableData(id, name) {
      if (id === 0) {
        return combineActiveUsersTable(fiveMostActiveCustomers);
      } else if (id === 1) {
        return combineActiveUsersTable(fiveLeastActiveCustomers);
      } else if (id === 2) {
        return combineActiveUsersTable(fiveHighestQualityCustomers);
      } else if (id === 3) {
        return combineActiveUsersTable(fiveLowestQualityCustomers);
      }

      return getService(topn + activeUserUrl + getQuery() + "&orgId=" + id).then(function (response) {
        return modifyActiveUserTableData(response.data.data[0]);
      }, function (error) {
        Log.debug('Loading most active users for customer ' + name + ' failed.  Status: ' + error.status + ' Response: ' + error.message);
        Notification.notify([$translate.instant('activeUsers.activeUserTableError', {
          customer: name
        })], 'error');
        return [];
      });
    }

    function combineActiveUsersTable(orgs) {
      var promises = [];
      var tableData = [];
      angular.forEach(orgs, function (org) {
        var promise = getActiveUserTableData(org.orgId, org.orgName).then(function (response) {
          tableData = tableData.concat(response);
        });
        promises.push(promise);
      });
      return $q.all(promises).then(function () {
        return tableData;
      });
    }

    function modifyActiveUserTableData(data) {
      angular.forEach(data.data, function (index) {
        index.orgName = data.orgName;
        index.numCalls = parseInt(index.details.numCalls);
        index.totalActivity = parseInt(index.details.totalActivity);
        index.userId = index.details.userId;
        index.userName = index.details.userName;
      });
      return data.data;
    }
  }
})();
