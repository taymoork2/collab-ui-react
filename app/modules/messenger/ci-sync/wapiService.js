(function () {
  "use strict";

  angular
    .module('Messenger')
    .factory('WapiService', WapiService);

  /** @ngInject */
  function WapiService(Authinfo, UtilService, $http, $q) {
    // Interface ---------------------------------------------------------------

    var wapiService = {
      getOrgInfo: getOrgInfo,
      setOrgInfo: setOrgInfo,
      getUsers: getUsers,
      getUsers2: getUsers2,
      getOrgPolicies: getOrgPolicies,
      getPolicyDetails: getPolicyDetails,
      updatePolicy: updatePolicy
    };

    // Messenger Admin Service

    var adminService = {
      protocol: 'http://',

      // Shawn's laptop ip on Cisco
      //host: '10.35.132.65',

      // Ned's IPs
      //host: '64.101.72.167',
      host: '10.129.24.103',

      // Default
      //host: '127.0.0.1',
      port: 8080,
      api: '/messenger/admin/api/v1/',
      apiUsers: 'users/',
      apiPolicies: 'policies/'
    };

    var policyActions = {
      AllowBroadcast: {
        name: 'Send Internal Broadcast Message',
        enabled: false
      },
      AllowBroadcastExt: {
        name: 'Send External Broadcast Message',
        enabled: false
      },
      DesktopShareExt: {
        name: 'External Desktop Share',
        enabled: false
      },
      DesktopShareInt: {
        name: 'Internal Desktop Share',
        enabled: false
      },
      FileTransferExt: {
        name: 'External File Transfer',
        enabled: false
      },
      FileTransferInt: {
        name: 'Internal File Transfer',
        enabled: false
      },
      IMExt: {
        name: 'External IM',
        enabled: false
      },
      IMIntWhitelist: {
        name: 'Internal IM (including whitelisted domains)',
        enabled: false
      },
      IM_AES_ENCODING: {
        name: 'Support End-to-End Encryption for IM',
        enabled: false
      },
      IM_NO_ENCODING: {
        name: 'Support NO Encoding for IM',
        enabled: false
      },
      LocalArchive: {
        name: 'Local Archive',
        enabled: false
      },
      ManageProfile: {
        name: 'Allow user to edit profile',
        enabled: false
      },
      ManageViewProfileSetting: {
        name: 'Allow user to edit the view profile setting',
        enabled: false
      },
      ScreenCaptureEnable: {
        name: 'Internal Screen Capture',
        enabled: false
      },
      ScreenCaptureEnableExt: {
        name: 'External Screen Capture',
        enabled: false
      },
      SendToDirectoryEnable: {
        name: 'Allow user to send broadcast to a directory group',
        enabled: false
      },
      VideoExt: {
        name: 'External Video',
        enabled: false
      },
      VideoInt: {
        name: 'Internal Video',
        enabled: false
      },
      VoIPExt: {
        name: 'External VOIP',
        enabled: false
      },
      VoIPInt: {
        name: 'Internal VOIP',
        enabled: false
      }
    };

    var orgName = Authinfo.getOrgName();
    var adminServiceUrl = adminService.protocol + adminService.host + ':' + adminService.port + adminService.api;
    var apiOrg = adminServiceUrl + 'org/' + orgName + '/';

    // Return the service
    return wapiService;

    ////////////////////////////////////////////////////////////////////////////

    // Implementation ----------------------------------------------------------

    function getOrgInfo() {
      var defer = $q.defer();

      $http.get(apiOrg)
        .success(function (data, status, headers, config) {
          defer.resolve(parseOrgInfo(data));
        })
        .error(function (data, status, headers, config) {
          defer.reject('Failed getting info for org \'' + orgName + '\'; HTTP status: ' + status);
        });

      return defer.promise;
    }

    function setOrgInfo(newInfo) {
      var defer = $q.defer();

      $http.patch(apiOrg, newInfo)
        .success(function (data, status, headers, config) {
          defer.resolve('Org info updated for \'' + orgName + '\'; HTTP status: ' + status + '; response: ' + JSON.stringify(data));
        })
        .error(function (data, status, headers, config) {
          defer.reject('Failed setting info for org \'' + orgName + '\'; HTTP status: ' + status + '; response: ' + JSON.stringify(data));
        });

      return defer.promise;
    }

    function getUsers() {
      var defer = $q.defer();

      $http.get(apiOrg + adminService.apiUsers)
        .success(function (data, status, headers, config) {
          var userList = [];
          var returnedUsers = data.users;

          for (var i = 0; i < returnedUsers.length; i++) {
            var user = returnedUsers[i];

            userList.push({
              email: user.email,
              isActive: user.isActive,
              creationTime: user.createTime,
              modifiedTime: user.lastModifiedTime,
              id: user.userID
            });
          }

          defer.resolve(userList);
        })
        .error(function (data, status, headers, config) {
          defer.reject('Failed getting users for org \'' + orgName + '\'; HTTP status: ' + status + '; response: ' + JSON.stringify(data));
        });

      return defer.promise;
    }

    function getUsers2(pageNum, pageSize, sortBy, order) {
      var defer = $q.defer();

      var url = apiOrg + adminService.apiUsers;
      var params = '?page=' + pageNum + '&pageSize=' + pageSize + '&sortBy=' + sortBy + '&order=' + order;

      $http.get(url + params)
        .success(function (data, status, headers, config) {
          var userList = [];
          var returnedUsers = data.users;

          for (var i = 0; i < returnedUsers.length; i++) {
            var user = returnedUsers[i];

            userList.push({
              email: user.email,
              isActive: user.isActive,
              creationTime: user.createTime,
              modifiedTime: user.lastModifiedTime,
              id: user.userID
            });
          }

          defer.resolve(userList);
        })
        .error(function (data, status, headers, config) {
          defer.reject('Failed getting users for org \'' + orgName + '\'; HTTP status: ' + status + '; response: ' + JSON.stringify(data));
        });

      return defer.promise;
    }

    function getOrgPolicies() {
      var defer = $q.defer();

      $http.get(apiOrg + adminService.apiPolicies)
        .success(function (data, status, headers, config) {
          // 'data' is the policy array
          defer.resolve(data);
        })
        .error(function (data, status, headers, config) {
          defer.reject('Failed getting policies for org \'' + orgName + '\'; HTTP status: ' + status);
        });

      return defer.promise;
    }

    function getPolicyDetails(policyID) {
      var defer = $q.defer();

      $http.get(apiOrg + adminService.apiPolicies + policyID)
        .success(function (data, status, headers, config) {
          var actionObject = data.policyExpression.customizedPolicy;
          var action = null;

          // Make a copy of policy actions for each policy to not pollute it
          var currentPolicyActions = JSON.parse(JSON.stringify(policyActions));

          for (action in actionObject) {
            // For each enabled action, enable it in policyActions
            currentPolicyActions[action].enabled = ('true' === Object.keys(actionObject[action])[0]) ? true : false;
          }

          var actions = [];

          for (action in currentPolicyActions) {
            var actionObj = currentPolicyActions[action];

            actions.push({
              id: action,
              name: actionObj.name,
              enabled: actionObj.enabled
            });
          }

          actions.sort(function (a, b) {
            return UtilService.sortBy(a.name, b.name);
          });

          defer.resolve({
            id: data.policyID,
            name: data.policyName,
            actions: actions
          });
        })
        .error(function (data, status, headers, config) {
          defer.reject('Failed getting actions for policy ' + policyID + '; HTTP status: ' + status);
        });

      return defer.promise;
    }

    function updatePolicy(id, enabledActions) {
      window.console.log('Updating policy "' + id + '"');
      window.console.log('Actions:');
      window.console.log(enabledActions);

      $http.put(apiOrg + adminService.apiPolicies + id, enabledActions)
        .success(function (data, status, headers, config) {
          window.console.log('Successfully updated policy ' + id + '; status ' + status);
        })
        .error(function (data, status, headers, config) {
          window.console.error('Error updating policy ' + id + '; status ' + status);
        });
    }

    function parseOrgInfo(data) {
      var parsedData = {
        generalInfo: [],
        orgInfo: [],
        policies: [],
        contactInfo: {},
        ext: []
      };

      // Temporary used in for-loops, declared here to prevent JSHint warning
      var i = 0;

      var generalInfo = parsedData.generalInfo;
      var contactInfo = parsedData.contactInfo;

      for (var wapiKey in data) {
        // Add non-object, non-array items (array will be 'object' in typeof)
        var item = data[wapiKey];

        if ('object' !== typeof item) {
          if ('orgName' === wapiKey) {
            contactInfo.company = item;
          }

          parsedData.orgInfo.push({
            key: wapiKey,
            value: item
          });
        } else if ('policies' === wapiKey) {
          var policies = item.policy;
          for (i = 0; i < policies.length; i++) {
            var policy = policies[i];
            parsedData.policies.push({
              key: policy.policyID,
              value: policy.policyName
            });
          }
        } else if ('ext' === wapiKey) {
          // Add General Info (phone, address, etc)
          var orgInfo = item.WBX.orgInfo;
          var address = orgInfo.addresses.address;
          var phoneNumbers = orgInfo.phoneNumbers.phoneNumber;

          generalInfo.push({
            key: 'website',
            value: orgInfo.website
          });

          for (var addressItem in address) {
            generalInfo.push({
              key: addressItem,
              value: address[addressItem]
            });
          }

          contactInfo.city = address.city;
          contactInfo.addr1 = address.streetLine1;
          contactInfo.addr2 = address.streetLine2;
          contactInfo.state = address.state;
          contactInfo.zip = address.zipCode;
          contactInfo.country = address.country;

          for (i = 0; i < phoneNumbers.length; i++) {
            var phone = phoneNumbers[i];

            // Get business phone number, ignore fax number
            if ('BusinessPhone' === phone.phoneType) {
              generalInfo.push({
                key: 'Phone',
                value: phone.number
              });

              contactInfo.phone = phone.number.toString();

              break;
            }
          }

          // Add WBXCR Org Attributes
          var orgAttributes = item.WBXCR.organizationAttributes;

          for (var attribute in orgAttributes) {
            parsedData.ext.push({
              key: attribute,
              value: orgAttributes[attribute]
            });
          }

        }
      }

      parsedData.generalInfo.sort(function (a, b) {
        return UtilService.sortBy(a.key, b.key);
      });

      parsedData.orgInfo.sort(function (a, b) {
        return UtilService.sortBy(a.key, b.key);
      });

      return parsedData;
    }
  }
})();
