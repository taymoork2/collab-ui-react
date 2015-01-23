(function () {
  'use strict';

  angular
    .module('Huron')
    .factory('HuronAssignedLine', ['Authinfo', 'InternalNumberPoolService', 'DirectoryNumberCopyService',
      function (Authinfo, InternalNumberPoolService, DirectoryNumberCopyService) {
        var lineTemplate;

        return {
          assignDirectoryNumber: function (userUuid, dnUsage, dnPattern) {
            if (typeof dnUsage === 'undefined' || dnUsage === '') {
              dnUsage = 'Undefined';
            }
            if (typeof dnPattern === 'undefined') {
              return this.autoAssignDn(userUuid, dnUsage);
            } else {
              return this.assignDn(userUuid, dnUsage, dnPattern);
            }
          },
          autoAssignDn: function (userUuid, dnUsage) {
            var assignedLine;

            return DirectoryNumberCopyService.query({
                customerId: Authinfo.getOrgId()
              }).$promise
              .then(function (lineTemplates) {
                var siteId = Authinfo.getOrgId() + '_000001_ULT'
                if (angular.isArray(lineTemplates.choice) && lineTemplates.choice.length > 0) {
                  angular.forEach(lineTemplates.choice, function (dataset) {
                    if (siteId === dataset.value) {
                      lineTemplate = dataset;
                    }
                  });
                }
                return this.getUnassignedDirectoryNumber();
              }.bind(this))
              .then(function (directoryNumber) {
                assignedLine = directoryNumber;
                return this.copyFromUlt(directoryNumber, dnUsage, userUuid)
              }.bind(this))
              .then(function () {
                return assignedLine;
              });
          },
          assignDn: function (userUuid, dnUsage, dnPattern) {
            return DirectoryNumberCopyService.query({
                customerId: Authinfo.getOrgId()
              }).$promise
              .then(function (lineTemplates) {
                var siteId = Authinfo.getOrgId() + '_000001_ULT'
                if (angular.isArray(lineTemplates.choice) && lineTemplates.choice.length > 0) {
                  for (var i = 0; i < lineTemplates.choice.length; i++) {
                    if (siteId === lineTemplates.choice[i].value) {
                      lineTemplate = lineTemplates.choice[i];
                    }
                  }
                }
                var directoryNumber = {
                  'pattern': dnPattern
                };
                return this.copyFromUlt(directoryNumber, dnUsage, userUuid)
              }.bind(this));
          },

          getUnassignedDirectoryNumber: function () {
            return InternalNumberPoolService.query({
                customerId: Authinfo.getOrgId(),
                directorynumber: ''
              }).$promise
              .then(function (directoryNumbers) {
                if (angular.isArray(directoryNumbers) && directoryNumbers.length > 0) {
                  var randomIndex = Math.floor(Math.random() * (directoryNumbers.length - 0 + 1) + 0);
                  return directoryNumbers[randomIndex];
                }
              });
          },

          copyFromUlt: function (directoryNumber, dnUsage, userUuid) {
            var copyFromUlt = {
              'pattern': directoryNumber.pattern,
              'customer': {
                'uuid': Authinfo.getOrgId()
              },
              'user': {
                'uuid': userUuid
              },
              'dnUsage': dnUsage
            };
            return DirectoryNumberCopyService.save({
              customerId: Authinfo.getOrgId(),
              ultId: lineTemplate.uuid
            }, copyFromUlt, function (data, headers) {
              data.uuid = headers('location').split("/").pop();
              return data;
            }).$promise;
          }

        }; // end return
      }
    ]);
})();
