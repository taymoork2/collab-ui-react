require('modules/squared/processOrder/_countrySelectModal.scss');

(function () {
  'use strict';

  angular
    .module('Squared')
    .controller('ProcessorderCtrl', ProcessorderCtrl);

  /* @ngInject */
  function ProcessorderCtrl($location, $translate, $modal, Auth, HuronCountryService, ModalService, Orgservice) {
    var vm = this;
    var enc = $location.search().enc;
    var call = $location.search().call;

    vm.countryList = [];
    vm.country = '';
    vm.isProcessing = true;

    if (call && (call === 'emea' || call === 'thinktel')) {
      HuronCountryService.getHardCodedCountryList()
        .then(function (countries) {
          if (call === 'thinktel') {
            vm.countryList = _.filter(countries, function (country) {
              if (_.get(country, 'id') === 'US' || _.get(country, 'id') === 'CA' || _.get(country, 'id') === 'N/A') {
                return true;
              }
            });
          } else {
            vm.countryList = countries;
          }
          openCountryModal();
        });
    } else {
      createOrg(enc);
    }

    function openCountryModal() {
      $modal.open({
        type: 'full',
        template: require('modules/squared/processOrder/countrySelectModal.html'),
        controller: function () {
          var ctrl = this;
          ctrl.country = '';
          ctrl.countryList = vm.countryList;
          ctrl.placeholder = $translate.instant('processOrderPage.countrySelectPlaceholder');
        },
        controllerAs: 'ctrl',
      }).result.then(function (country) {
        if (_.get(country, 'id') === 'N/A') {
          createOrg(enc);
        } else {
          createOrg(enc, country);
        }
      });
    }

    function createOrg(enc, country) {
      // 'createOrg()' provisions a limited-privilege access token in order to perform this operation,
      // so we currently use 'logoutAndRedirectTo()' to clear tokens before allowing redirection
      Orgservice.createOrg(enc, country)
        .then(function (data) {
          Auth.logoutAndRedirectTo(data.redirectUrl);
        })
        .catch(function () {
          ModalService.open({
            title: $translate.instant('processOrderPage.info'),
            message: $translate.instant('processOrderPage.errOrgCreation'),
            hideDismiss: true,
          });
        })
        .finally(function () {
          vm.isProcessing = false;
        });
    }
  }
})();
