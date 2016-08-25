(function () {
  'use strict';

  angular
    .module('Huron')
    .factory('InternationalDialing', InternationalDialing);

  /* @ngInject */
  function InternationalDialing(Authinfo, UserCosRestrictionServiceV2, FeatureToggleService) {

    var disableInternationalDialing;

    var internationalDialing = {
      INTERNATIONAL_DIALING: 'DIALINGCOSTAG_INTERNATIONAL',
      listCosRestrictions: listCosRestrictions,
      updateCosRestriction: updateCosRestriction,
      isDisableInternationalDialing: isDisableInternationalDialing
    };

    return internationalDialing;

    function listCosRestrictions(curUserId) {
      return UserCosRestrictionServiceV2.get({
        customerId: Authinfo.getOrgId(),
        userId: curUserId
      }, angular.bind(this, function (cosRestrictions) {
        this.cosRestrictions = cosRestrictions;
      })).$promise;
    }

    function updateCosRestriction(curUserId, cosEnabled, cosUuid, cosType) {
      if ((cosUuid != null) && (cosEnabled.value === '-1')) {
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

    function getLicenseCommunicationIsTrial(isOverride) {
      if (isOverride) {
        // customer has trial override for international dialing
        disableInternationalDialing = false;
        return disableInternationalDialing;
      }

      // no override, check if communication license is in trial period
      disableInternationalDialing = Authinfo.getLicenseIsTrial('COMMUNICATION', 'ciscouc');
      return _.isUndefined(disableInternationalDialing) || disableInternationalDialing;
    }

    function isDisableInternationalDialing() {
      if (disableInternationalDialing) {
        return disableInternationalDialing;
      }

      return FeatureToggleService.supports(FeatureToggleService.features.huronInternationalDialingTrialOverride)
        .then(getLicenseCommunicationIsTrial);
    }

  }
})();
