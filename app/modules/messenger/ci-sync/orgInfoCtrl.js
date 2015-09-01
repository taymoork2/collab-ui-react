(function () {
  'use strict';

  angular
    .module('Messenger')
    .controller('OrgInfoCtrl', OrgInfoCtrl);

  /** @ngInject */
  function OrgInfoCtrl(CiService, UtilService, WapiService, Config) {
    // Interface ---------------------------------------------------------------

    var vm = this;

    // Const Enum to show/hide HTML elements by state
    vm.dataState = Object.freeze({
      loading: 1,
      loaded: 2,
      error: 3
    });

    vm.org = {
      dataStatus: vm.dataState.loading,
      errorMsg: '',
      info: {},

      policies: {
        dataStatus: vm.dataState.loading,
        errorMsg: '',
        policyList: []
      },

      users: {
        dataStatus: vm.dataState.loading,
        errorMsg: '',
        userList: []
      }
    };

    // User Grid ---------------------------------------------------------------
    var rowTemplate = '<div ng-style="{\'cursor\': row.cursor}" ng-repeat="col in renderedColumns" ng-class="col.colIndex()" class="ngCell {{col.cellClass}}">' +
      '<div class="ngVerticalBar" ng-style="{height: rowHeight}" ng-class="{ ngVerticalBarVisible: !$last }">&nbsp;</div>' +
      '<div ng-cell></div>' +
      '</div>';

    vm.userGrid = {
      data: 'admin.org.users.userList',
      headerRowHeight: 40,
      rowHeight: 35,

      columnDefs: [{
        field: 'email',
        displayName: 'Email',
        sortable: true
      }, {
        field: 'isActive',
        displayName: 'Active',
        sortable: true
      }, {
        field: 'creationTime',
        displayName: 'Created',
        sortable: true
      }, {
        field: 'modifiedTime',
        displayName: 'Modified',
        sortable: true
      }, {
        field: 'id',
        displayName: 'ID',
        sortable: true
      }]
    };
    // End User Grid -----------------------------------------------------------

    vm.init = init;

    // Event handlers
    vm.refreshOrgInfo = refreshOrgInfo;
    vm.refreshUserList = refreshUserList;
    vm.setOrgInfo = setOrgInfo;
    vm.updatePolicy = updatePolicy;

    vm.init();

    ////////////////////////////////////////////////////////////////////////////

    // Implementation ----------------------------------------------------------

    function refreshOrgInfo() {
      getOrgInfo();
    }

    function refreshUserList() {
      getUsers();
    }

    function getOrgInfo() {
      var org = vm.org;
      org.dataStatus = vm.dataState.loading;

      WapiService.getOrgInfo()
        .then(function (orgInfo) {
            org.info = orgInfo;
            org.dataStatus = vm.dataState.loaded;
          },
          function (errorMsg) {
            window.console.error(errorMsg);
            org.errorMsg = errorMsg;
            org.dataStatus = vm.dataState.error;
          });
    }

    function setOrgInfo() {
      // TODO Validate input

      // Send to WAPI
      WapiService.setOrgInfo(vm.org.info.contactInfo)
        .then(function (response) {
          // Refresh data
          getOrgInfo();
        }, function (errorMsg) {
          window.console.error(errorMsg);
        });
    }

    function setOrgInfoCallback() {
      getOrgInfo();
    }

    function getUsers() {
      var users = vm.org.users;

      users.dataStatus = vm.dataState.loading;

      var pageNum = 1;
      var pageSize = 5;
      var sortBy = 'creationTime';
      var order = 'dsc';

      WapiService.getUsers2(pageNum, pageSize, sortBy, order)
        .then(function (userList) {
            users.userList = userList;
            users.dataStatus = vm.dataState.loaded;
          },
          function (errorMsg) {
            window.console.error(errorMsg);
            users.errorMsg = errorMsg;
            users.dataStatus = vm.dataState.error;
          });
    }

    function getOrgPolicies() {
      var policies = vm.org.policies;
      policies.dataStatus = vm.dataState.loading;

      WapiService.getOrgPolicies()
        .then(function (receivedPolicies) {
          // Declare loop index once to prevent JSHint warning
          var i = 0;
          var policyNum = 0;

          for (i = 0; i < receivedPolicies.length; i++) {
            WapiService.getPolicyDetails(receivedPolicies[i].policyID)
              .then(function (policyData) {
                policies.policyList.push(policyData);

                // If this is the last policy, sort the policy list
                // for better user experience. Then set state to 'loaded'
                if (++policyNum === receivedPolicies.length) {
                  policies.policyList.sort(function (a, b) {
                    return UtilService.sortBy(a.name, b.name);
                  });

                  policies.dataStatus = vm.dataState.loaded;
                }
              }, function (errorMsg) {
                var error = 'Error getting policy actions: ' + errorMsg;
                window.console.error(error);
                policies.errorMsg = error;
                policies.dataStatus = vm.dataState.error;
              });
          }
        }, function (errorMsg) {
          window.console.error(errorMsg);
          policies.errorMsg = errorMsg;
          policies.dataStatus = vm.dataState.error;
        });
    }

    function updatePolicy(id) {
      // Find policy with ID
      var policies = vm.org.policies.policyList;
      var updatedPolicy = null;

      var i = 0;

      for (i = 0; i < policies.length; i++) {
        var policy = policies[i];

        if (policy.id === id) {
          updatedPolicy = policy;
          break;
        }
      }

      if (null !== updatedPolicy) {
        var enabledActions = [];

        // Add enabled actions
        for (i = 0; i < updatedPolicy.actions.length; i++) {
          var action = updatedPolicy.actions[i];

          if (true === action.enabled) {
            enabledActions.push(action.id);
          }
        }

        // Give the currently checked/enabled policy actions to WapiService
        WapiService.updatePolicy(id, enabledActions);
      } else {
        window.console.warn('Unable to update policy ID ' + id + '; Not Found');
      }
    }

    // CI Calls Inside
    function init() {
      getOrgInfo();

      getOrgPolicies();

      getUsers();

      vm.ciData = CiService.getCiOrgInfo();

      vm.ciAdmins = [];
      CiService.getCiAdmins(vm.ciAdmins);

      vm.ciUsers = [];
      CiService.getCiNonAdmins(vm.ciUsers);

      vm.dev = Config.isDev() && ('testAtlasMsgr' === CiService.orgName) ? true : false;
    }
  }
})();
