// TODO: replace this with a typescript interface once 'OnboardCtrl' can be revisited
(function () {
  'use strict';

  module.exports = Feature;

  function Feature(name, state) {
    this.entitlementName = name;
    this.entitlementState = state ? 'ACTIVE' : 'INACTIVE';
    this.properties = {};
  }
})();
