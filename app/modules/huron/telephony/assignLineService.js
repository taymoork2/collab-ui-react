'use strict';

angular.module('Huron')
  .factory('HuronAssignedLine', ['Authinfo', 'InternalNumberPoolService', 'DirectoryNumberCopyService',
    function (Authinfo, InternalNumberPoolService, DirectoryNumberCopyService) {
      var lineTemplate;
      var assignedLine;

      return {
        assignDirectoryNumber: function (uuid, dnUsage) {
          if (typeof dnUsage === 'undefined') {
            dnUsage = 'Primary';
          }
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
              return this.getUnassignedDirectoryNumber();
            }.bind(this))
            .then(function (directoryNumber) {
              assignedLine = directoryNumber;
              return this.copyFromUlt(directoryNumber, dnUsage, uuid)
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
