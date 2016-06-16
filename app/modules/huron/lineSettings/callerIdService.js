(function () {
  'use strict';

  angular
    .module('Huron')
    .factory('CallerId', CallerId);

  /* @ngInject */
  function CallerId(Authinfo, $q, CompanyNumberService, UserDirectoryNumberService, DirectoryNumberUserService, DirectoryNumber,
    UserEndpointService, SipEndpointDirectoryNumberService) {

    var callerIdOptions = [];
    var userDnList = [];
    // The following do not need to be localized
    var companyCallerId_type = 'Company Caller ID';
    var companyNumber_type = 'Company Number';

    var service = {
      loadCompanyNumbers: loadCompanyNumbers,
      getCompanyNumberList: getCompanyNumberList,
      getUserDnList: getUserDnList,
      constructCallerIdOption: constructCallerIdOption,
      getCallerIdOption: getCallerIdOption,
      getCallerIdOptionIndex: getCallerIdOptionIndex,
      listCompanyNumbers: listCompanyNumbers,
      saveCompanyNumber: saveCompanyNumber,
      updateCompanyNumber: updateCompanyNumber,
      deleteCompanyNumber: deleteCompanyNumber,
      getUserDn: getUserDn,
      listUserEndPoints: listUserEndPoints,
      listEndPointDirectoryNumbers: listEndPointDirectoryNumbers,
      updateEndPointDn: updateEndPointDn,
      updateLineEndPoint: updateLineEndPoint,
      updateInternalCallerId: updateInternalCallerId
    };
    return service;
    //////////////////////

    function loadCompanyNumbers() {
      callerIdOptions = [];
      return listCompanyNumbers().then(function (companyNumbers) {
        // Company Number
        companyNumbers.filter(function (companyNumber) {
            return companyNumber.externalCallerIdType === companyNumber_type;
          })
          .forEach(function (companyNumber) {
            callerIdOptions.push(constructCallerIdOption(companyNumber.name, companyNumber_type, '', companyNumber.pattern, companyNumber.uuid));
          });
        // Company Caller ID
        companyNumbers.filter(function (companyNumber) {
            return companyNumber.externalCallerIdType === companyCallerId_type;
          })
          .forEach(function (companyNumber) { // there should be only one company caller ID record
            callerIdOptions.push(constructCallerIdOption('', companyCallerId_type, companyNumber.name, companyNumber.pattern, companyNumber.uuid));
          });
      });
    }

    function getCompanyNumberList() {
      return callerIdOptions;
    }

    function getUserDnList() {
      return userDnList;
    }

    function constructCallerIdOption(label, externalCallerIdType, name, pattern, uuid) {
      return {
        label: label,
        value: {
          externalCallerIdType: externalCallerIdType,
          name: name,
          pattern: pattern,
          uuid: uuid
        }
      };
    }

    function getCallerIdOption(callerIdOptions, callerIdType) {
      var retOption;
      callerIdOptions.forEach(function (option, index) {
        if (option.value.externalCallerIdType === callerIdType) {
          retOption = option;
        }
      });
      return retOption;
    }

    function getCallerIdOptionIndex(callerIdOptions, callerIdType) {
      var retIndex = -1;
      callerIdOptions.forEach(function (option, index) {
        if (option.value.externalCallerIdType === callerIdType) {
          retIndex = index;
        }
      });
      return retIndex;
    }

    function listCompanyNumbers() {
      return CompanyNumberService.query({
        customerId: Authinfo.getOrgId()
      }).$promise;
    }

    function saveCompanyNumber(data) {
      return CompanyNumberService.save({
        customerId: Authinfo.getOrgId()
      }, data).$promise;
    }

    function updateCompanyNumber(companyNumberId, data) {
      return CompanyNumberService.update({
        customerId: Authinfo.getOrgId(),
        companyNumberId: companyNumberId
      }, data).$promise;
    }

    function deleteCompanyNumber(companyNumberId) {
      return CompanyNumberService.delete({
        customerId: Authinfo.getOrgId(),
        companyNumberId: companyNumberId
      }).$promise;
    }

    function updateInternalCallerId(userUuid, userName) {
      var promises = [];
      var promise;
      return getUserDn(userUuid).then(function () {
        // for each line
        getUserDnList().forEach(function (userDn) {
          var lineTextLabel = (userName.length > 30 - userDn.pattern.length - 3) ?
            userName.substr(0, 30 - userDn.pattern.length - 3) :
            userName;
          lineTextLabel = userDn.pattern + ' - ' + lineTextLabel;
          var data = {
            display: userName,
            label: lineTextLabel
          };
          // Only update on primary line and all primary lines where there's no primary user.
          if (userDn.isPrimary || !userDn.hasSharedPrimary) {
            // Update alerting name on DN
            promise = DirectoryNumber.updateDirectoryNumber(userDn.uuid, {
              alertingName: userName
            }).then(function () {
              // for each shared user
              var sharedUserPromises = [];
              var sharedUserPromise;
              userDn.sharedUsers.forEach(function (user) {
                sharedUserPromise = listUserEndPoints(user.uuid).then(function (devices) {
                  // for each device
                  var endPointPromises = [];
                  var endPointPromise;
                  devices.forEach(function (device) {
                    endPointPromise = updateEndPointDn(device.endpoint.uuid, userDn.uuid, data);
                    endPointPromises.push(endPointPromise);
                  });
                  return $q.all(endPointPromises);
                });
                sharedUserPromises.push(sharedUserPromise);
              });
              return $q.all(sharedUserPromises);
            });
            promises.push(promise);
          }
        });
        return $q.all(promises);
      });
    }

    function getUserDn(userUuid) {
      userDnList = [];
      // Get all the lines of the user
      return UserDirectoryNumberService.query({
          customerId: Authinfo.getOrgId(),
          userId: userUuid
        }).$promise.then(function (userDnInfo) {
          var promises = [];
          var promise;
          userDnInfo.forEach(function (userDn) {
            var userLine = {
              uuid: userDn.directoryNumber.uuid,
              pattern: userDn.directoryNumber.pattern,
              isPrimary: (userDn.dnUsage === 'Primary') ? true : false,
              userDnUuid: userDn.uuid,
              hasSharedPrimary: false,
              sharedUsers: []
            };
            userDnList.push(userLine);

            // Get all the users of the line to decide if this line is a shared line
            promise = DirectoryNumberUserService.query({
                'customerId': Authinfo.getOrgId(),
                'directoryNumberId': userLine.uuid
              }).$promise
              .then(function (dnUserInfo) {
                dnUserInfo.forEach(function (dnUser) {
                  this.sharedUsers.push(dnUser.user);
                  if (dnUser.dnUsage === 'Primary') {
                    this.hasSharedPrimary = true;
                  }
                }.bind(this));
              }.bind(userLine));
            promises.push(promise);
          });
          return $q.all(promises);
        })
        .catch(function (response) {
          return $q.reject(response);
        });
    }

    function updateEndPointDn(endPointUuid, dnUuid, data) {
      var promises = [];
      var promise;
      return listEndPointDirectoryNumbers(endPointUuid).then(function (endpointDn) {
        // find the EndPointDirectoryNumberMap uuid
        endpointDn.forEach(function (d) {
          if (d.directoryNumber.uuid === dnUuid) {
            // update display name and line text label
            promise = updateLineEndPoint(endPointUuid, d.uuid, data);
            promises.push(promise);
          }
        });
        return $q.all(promises);
      });
    }

    function listUserEndPoints(userUuid) {
      return UserEndpointService.query({
        customerId: Authinfo.getOrgId(),
        userId: userUuid
      }).$promise;
    }

    function listEndPointDirectoryNumbers(endPointUuid) {
      return SipEndpointDirectoryNumberService.query({
        customerId: Authinfo.getOrgId(),
        sipendpointId: endPointUuid
      }).$promise;
    }

    function updateLineEndPoint(endPointUuid, endpointDnAssnId, data) {
      return SipEndpointDirectoryNumberService.update({
        customerId: Authinfo.getOrgId(),
        sipendpointId: endPointUuid,
        endpointDnAssnId: endpointDnAssnId
      }, data).$promise;
    }

  }
})();
