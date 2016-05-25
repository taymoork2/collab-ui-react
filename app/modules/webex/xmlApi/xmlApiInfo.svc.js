(function () {
  'use strict';

  angular.module('WebExApp')
    .service('WebExXmlApiInfoSvc', WebExXmlApiInfoSvc);

  function WebExXmlApiInfoSvc() {
    return {
      xmlApiUrl: "",
      webexAdminID: "",
      webexSessionTicket: "",
      webexUserId: ""
    }; // return
  } // WebExXmlApiInfo()
})();
