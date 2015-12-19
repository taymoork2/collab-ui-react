(function () {
  'use strict';

  angular
    .module('Huron')
    .factory('InternationalDialing', InternationalDialing);

  /* @ngInject */
  function InternationalDialing(Authinfo, $q, $translate, UserCosRestrictionServiceV2) {
    var cbUseGlobal = {
      opt: $translate.instant('internationalDialingPanel.useGlobal'),
      val: '-1'
    };
    var cbAlwaysAllow = {
      opt: $translate.instant('internationalDialingPanel.alwaysAllow'),
      val: '1'
    };
    var cbNeverAllow = {
      opt: $translate.instant('internationalDialingPanel.neverAllow'),
      val: '0'
    };

    return {
      listCosRestrictions: function (curUserId) {
        return UserCosRestrictionServiceV2.query({
          customerId: Authinfo.getOrgId(),
          userId: curUserId
        }, angular.bind(this, function (cosRestrictions) {
          this.cosRestrictions = cosRestrictions;
        })).$promise;
      },

      updateCosRestriction: function (curUserId, cosEnabled, cosUuid, cosType) {
        if ((cosUuid != null) && (cosEnabled.val === '-1')) {
          return UserCosRestrictionServiceV2.delete({
            customerId: Authinfo.getOrgId(),
            userId: curUserId,
            restrictionId: cosUuid
          }).$promise;
        } else {
          if (cosUuid == null) {
            return UserCosRestrictionServiceV2.save({
              customerId: Authinfo.getOrgId(),
              userId: curUserId,
              restrictionId: cosUuid
            }, cosType).$promise;
          } else {
            return UserCosRestrictionServiceV2.update({
              customerId: Authinfo.getOrgId(),
              userId: curUserId,
              restrictionId: cosUuid
            }, cosType).$promise;
          }
        }
      }
    };
  }
})();
