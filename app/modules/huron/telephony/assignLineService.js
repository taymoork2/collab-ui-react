'use strict';

angular.module('Huron')
  .factory('HuronAssignedLine', ['Authinfo', 'InternalNumberPoolService', 'DirectoryNumberCopyService',
    function (Authinfo, InternalNumberPoolService, DirectoryNumberCopyService) {
      var lineTemplate;
      var assignedLine;
     
      return {
        assignDirectoryNumber: function (userUuid, dnUsage, dnPattern) {
          if (typeof dnUsage === 'undefined') {
            dnUsage = 'Primary';
          }
          if (typeof dnPattern === 'undefined') {
            return this.autoAssignDn(userUuid, dnUsage);
          } else {
            return this.assignDn(userUuid, dnUsage, dnPattern);
          }
        },
        autoAssignDn: function (userUuid, dnUsage) {
        return DirectoryNumberCopyService.query({
            customerId: Authinfo.getOrgId()
          }).$promise
          .then(function (lineTemplates) {
            var siteId = Authinfo.getOrgId() + '_000001_ULT'
            if (angular.isArray(lineTemplates.choice) && lineTemplates.choice.length > 0) {
              angular.forEach(lineTemplates.choice, function(dataset) {
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
          }.bind(this))
          .then(function () {
            return assignedLine;
          });
        },

        getUnassignedDirectoryNumber: function () {
          return InternalNumberPoolService.query({
              customerId: Authinfo.getOrgId(),
              directorynumber: ''
            }).$promise
            .then(function (directoryNumbers) {
              if (angular.isArray(directoryNumbers) && directoryNumbers.length > 0) {
                return directoryNumbers[0];
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
          }, copyFromUlt).$promise;
        }
      };
    }
  ]);
