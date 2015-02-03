(function () {
  'use strict';

  angular
    .module('Huron')
    .factory('HuronAssignedLine', HuronAssignedLine)

  /* @ngInject */
  function HuronAssignedLine(Authinfo, InternalNumberPoolService, DirectoryNumberCopyService) {
    var lineTemplate;

    var assignLineService = {
      assignDirectoryNumber: assignDirectoryNumber,
      getUnassignedDirectoryNumber: getUnassignedDirectoryNumber
    };

    return assignLineService;
    /////////////////////

    function assignDirectoryNumber(userUuid, dnUsage, dnPattern) {
      if (typeof dnUsage === 'undefined' || dnUsage === '') {
        dnUsage = 'Undefined';
      }
      if (typeof dnPattern === 'undefined') {
        return autoAssignDn(userUuid, dnUsage);
      } else {
        return assignDn(userUuid, dnUsage, dnPattern);
      }
    }

    function autoAssignDn(userUuid, dnUsage) {
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
          return getUnassignedDirectoryNumber();
        })
        .then(function (directoryNumber) {
          assignedLine = directoryNumber;
          return copyFromUlt(directoryNumber, dnUsage, userUuid)
        })
        .then(function () {
          return assignedLine;
        });
    }

    function assignDn(userUuid, dnUsage, dnPattern) {
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
          return copyFromUlt(directoryNumber, dnUsage, userUuid)
        });
    }

    function getUnassignedDirectoryNumber() {
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
    }

    function copyFromUlt(directoryNumber, dnUsage, userUuid) {
      var copyFromUlt = {
        'pattern': directoryNumber.pattern,
        'hasVoicemail': true,
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
  }
})();
