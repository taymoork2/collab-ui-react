(function () {
  'use strict';

  angular.module('Core')
    .service('PartnerReportService', PartnerReportService);

  /* @ngInject */
  function PartnerReportService($http, $translate, $q, Config, Authinfo, Notification, Log, PartnerService, Utils) {
    var urlBase = Config.getAdminServiceUrl() + 'organization/' + Authinfo.getOrgId() + '/fullReports/timeCharts/managedOrgs/';
    var dateFormat = "MMM DD, YYYY";
    var activeUsers = 'activeUsers';
    var mostRecentUpdate = "";
    var activeUserResponse = [];
    var savedActiveUserData = [];
    var timeFilter;
    var activeUserCustomerCombos = [];
    var customerList = null;
    var userList = [];

    return {
      getMostRecentUpdate: getMostRecentUpdate,
      getPreviousFilter: getPreviousFilter,
      getActiveUsersData: getActiveUsersData,
      getSavedActiveUsers: getSavedActiveUsers,
      getCombinedActiveUsers: getCombinedActiveUsers,
      getCustomerList: getCustomerList,
      getUserName: getUserName
    };

    function getCustomerList() {
      return customerList;
    }

    function getUsersForCustomer(orgId) {
      var url = Utils.sprintf(Config.getScimUrl(), [orgId]) + '?&attributes=name,userName';
      return $http.get(url);
    }

    function getService(filteredUrl) {
      var url = urlBase + filteredUrl;
      return $http.get(url);
    }

    function getQuery() {
      if (timeFilter.id === 0) {
        return '?&intervalCount=1&intervalType=week&spanCount=7&spanType=day&cache=true';
      } else if (timeFilter.id === 1) {
        return '?&intervalCount=1&intervalType=month&spanCount=4&spanType=week&cache=true';
      } else {
        return '?&intervalCount=3&intervalType=month&spanCount=12&spanType=week&cache=true';
      }
    }

    function getMostRecentUpdate() {
      return mostRecentUpdate;
    }

    function setMostRecentUpdate(data) {
      if (data.data !== undefined && data.data.lastUpdated !== null && data.data.lastUpdated !== undefined) {
        mostRecentUpdate = moment(data.data.lastUpdated).format(dateFormat);
      } else {
        mostRecentUpdate = moment().format(dateFormat);
      }
    }

    function getPreviousFilter() {
      return timeFilter;
    }

    function getSavedActiveUsers() {
      return savedActiveUserData;
    }

    function getCombinedActiveUsers(index) {
      return activeUserCustomerCombos[index];
    }

    function getActiveUsersData(filter) {
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

      var reportPromise = getService(activeUsers + query).then(function (response) {
        activeUserResponse = response;
      }, function (error) {
        Log.debug('Loading active users failed.  Status: ' + error.status + ' Response: ' + error.data.message);
        Notification.notify([$translate.instant('activeUsers.activeUserError')], 'error');
      });
      promises.push(reportPromise);

      var dummyUserResponse = [];
      var dummyPromise = $http.get('modules/core/partnerReports/dummyData.json').then(function (response) {
        dummyUserResponse = response;
      });
      promises.push(dummyPromise);

      return $q.all(promises).then(function () {
        setMostRecentUpdate(activeUserResponse);
        savedActiveUserData = modifyActiveUsersResponse(activeUserResponse, activeUsers);
        if (savedActiveUserData.length === 0) { // use Dummy data if there is no active user data
          savedActiveUserData = modifyActiveUsersResponse(dummyUserResponse, activeUsers);
        }
        setActiveUsersCustomerCombos(savedActiveUserData);
        return savedActiveUserData;
      });
    }

    function modifyActiveUsersResponse(response, service) {
      if (response.data === undefined) {
        return [];
      }
      var customerData = response.data.customers;
      var newCustomerData = [];

      for (var index in customerData) {
        var customer = customerData[index];
        var userTotals = [0, 0, 0, 0];
        var chartData = [];
        var userData = [];
        var graphData = [];

        for (var i in customer.data) {
          var data = customer.data[i];

          for (var x in data.activeUsers) {
            var user = data.activeUsers[x];
            if ((userData[user.userId] === null) || (userData[user.userId] === undefined)) {
              userData[user.userId] = {
                "totalCalls": user.calls,
                "totalPosts": user.posts,
                "userId": user.userId
              };
            } else {
              userData[user.userId].totalCalls += user.totalCalls;
              userData[user.userId].totalPosts += user.totalPosts;
            }
            userTotals[2] += user.totalCalls;
            userTotals[3] += user.totalPosts;
          }

          var regUsers = data.totalRegisteredUsers;
          var count = data.activeUsers.length;
          graphData.unshift({
            'date': moment(data.date).format(dateFormat),
            'count': count,
            'totalUsers': regUsers,
            'percentage': Math.floor((count / regUsers) * 100)
          });

          if (userTotals[0] < regUsers) {
            userTotals[0] = regUsers;
          }
          if (userTotals[1] < count) {
            userTotals[1] = count;
          }
        }

        for (var y in userData) {
          chartData.push({
            "userId": userData[y].userId,
            "userName": "",
            "totalCalls": userData[y].totalCalls,
            "totalPosts": userData[y].totalPosts,
            "orgName": getCustomerName(customer.orgId),
            "orgId": customer.orgId
          });
        }

        var newCustomer = {
          'orgId': customer.orgId,
          'graphData': graphData,
          'chartData': chartData,
          'totalPercentage': Math.floor((userTotals[1] / userTotals[0]) * 100),
          'totalActivity': userTotals[2] + userTotals[3]
        };
        newCustomerData.push(newCustomer);
      }

      return newCustomerData;
    }

    function getCustomerName(orgId) {
      for (var index in customerList) {
        if (orgId === customerList[index].customerOrgId) {
          updateUserLIst(orgId);
          return customerList[index].customerName;
        }
      }
      return "Dummy Customer " + orgId;
    }

    function updateUserLIst(orgId) {
      var found = false;

      for (var i in userList) {
        if (userList[i].orgId === orgId) {
          found = true;
        }
      }

      if (!found) {
        getUsersForCustomer(orgId).then(function (response) {
          userList.push({
            'orgId': orgId,
            'users': response.data.resources
          });
        }, function (error) {
          Log.debug('Loading users failed.  Status: ' + error.status + ' Response: ' + error.data.message);
          Notification.notify([$translate.instant('reportsPage.userLoadError')], 'error');
        });
      }
    }

    function getUserName(orgId, userId) {
      for (var index in userList) {
        if (orgId === userList[index].orgId) {
          return getUser(orgId, userId);
        }
      }
      return "Dummy User " + userId;
    }

    function getUser(index, userId) {
      for (var x in userList[index].users) {
        if (userList[index].users[x].userId === userId) {
          return userList[index].users[x].userName;
        }
      }
      return userId;
    }

    function setActiveUsersCustomerCombos(data) {
      if (data.length === 0) {
        var noData = {
          'graphData': [],
          'chartData': []
        };
        activeUserCustomerCombos[0] = noData;
        activeUserCustomerCombos[1] = noData;
        activeUserCustomerCombos[2] = noData;
        activeUserCustomerCombos[3] = noData;
        return;
      }

      var listOne = [];
      var listTwo = [];
      var listThree = [];
      var listFour = [];

      for (var index in data) {
        var customer = data[index];

        if (listOne.length > 4) {
          listOne = activeUserCombos(angular.copy(customer), 0, listOne);
          listTwo = activeUserCombos(angular.copy(customer), 1, listTwo);
          listThree = activeUserCombos(angular.copy(customer), 2, listThree);
          listFour = activeUserCombos(angular.copy(customer), 3, listFour);
        } else {
          listOne.push(angular.copy(customer));
          listTwo.push(angular.copy(customer));
          listThree.push(angular.copy(customer));
          listFour.push(angular.copy(customer));
        }
      }

      activeUserCustomerCombos[0] = combinActiveUserArrays(listOne, 0);
      activeUserCustomerCombos[1] = combinActiveUserArrays(listTwo, 1);
      activeUserCustomerCombos[2] = combinActiveUserArrays(listThree, 2);
      activeUserCustomerCombos[3] = combinActiveUserArrays(listFour, 3);
    }

    function activeUserCombos(customer, combo, array) {
      for (var index in array) {
        if (((combo === 0) && (customer.totalActivity > array[index].totalActivity)) || ((combo === 1) && (customer.totalActivity < array[index].totalActivity)) || ((combo === 2) && (customer.totalPercentage > array[index].totalPercentage)) || ((combo === 3) && (customer.totalPercentage < array[index].totalPercentage))) {
          var replacedCustomer = angular.copy(array[index]);
          array[index] = customer;
          array = activeUserCombos(replacedCustomer, combo, array);
          break;
        }
      }
      return array;
    }

    function combinActiveUserArrays(array, comboIndex) {
      var returnArray = {
        'graphData': [],
        'chartData': []
      };
      for (var index in array) {
        returnArray.graphData = combineActiveUserGraphs(returnArray.graphData, array[index].graphData);
        returnArray.chartData = returnArray.chartData.concat(angular.copy(array[index].chartData));
      }
      return returnArray;
    }

    function combineActiveUserGraphs(arrayOne, arrayTwo) {
      if (arrayOne.length > 0) {
        for (var index in arrayOne) {
          arrayOne[index].count += arrayTwo[index].count;
          arrayOne[index].totalUsers += arrayTwo[index].totalUsers;
        }
        arrayOne[index].percentage = Math.floor((arrayOne[index].count / arrayOne[index].totalUsers) * 100);
      } else {
        arrayOne = angular.copy(arrayTwo);
      }
      return arrayOne;
    }
  }
})();
