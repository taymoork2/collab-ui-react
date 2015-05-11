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
    var savedActiveUserData = [];

    return {
      getActiveUserData: getActiveUserData,
      getCustomerList: getCustomerList,
      getMostRecentUpdate: getMostRecentUpdate,
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

    function getMostRecentUpdate() {
      return mostRecentUpdate;
    }

    function getCustomerList() {
      var orgPromise = $q.defer();
      if (customerList === null) {
        PartnerService.getManagedOrgsList(function (data, status) {
          if (data.success) {
            customerList = data.organizations;
            orgPromise.resolve(customerList);
          } else {
            Log.debug('Failed to retrieve managed orgs information. Status: ' + status);
            Notification.notify([$translate.instant('reportsPage.customerLoadError')], 'error');
            orgPromise.reject([]);
          }
        });
      } else {
        orgPromise.resolve(customerList);
      }

      return orgPromise.promise;
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
      var detailedData = [];

      return getService(detailed + activeUserUrl + query).then(function (response) {
        detailedData = response;
      }, function (error) {
        Log.debug('Loading active users failed.  Status: ' + error.status + ' Response: ' + error.message);
        Notification.notify([$translate.instant('activeUsers.activeUserGraphError')], 'error');
      }).then(function () {
        setMostRecentUpdate(detailedData);
        savedActiveUserData = [];
        if (detailedData.data !== null && detailedData.data !== undefined) {
          var graphData = detailedData.data.data;

          angular.forEach(graphData, function (index) {
            index.data = modifyActiveUserGraphData(index.data);
          });
          savedActiveUserData = graphData;
        }

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

    function getActiveUserGraphData(id) {
      for (var i = 0; i < savedActiveUserData.length; i++) {
        if (savedActiveUserData[i].orgId === id) {
          return savedActiveUserData[i].data;
        }
      }

      return [];
    }

    // Keeping function for use when mult-org select functionality is added.
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

    // Keeping function for use when mult-org select functionality is added.
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
  }
})();
