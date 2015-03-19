'use strict';

angular.module('WebExUserSettings')
  .service('XmlApiInfoSvc', [
    function XmlApiInfo() {
      return {
        xmlServerURL: "",
        siteID: "", // TODO: remove this
        webexAdminID: "",
        webexAdminPswd: "", // TODO: remove this
        webexSessionTicket: "",
        webexUserId: ""
      }; // return
    } // XmlApiConstants
  ]); // service
