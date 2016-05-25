(function () {
  'use strict';

  angular.module('Core')
    .factory('Utils', Utils);

  /* @ngInject */
  function Utils($rootScope, $location, $window) {

    var guid = (function () {
      function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
      }
      return function () {
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
          s4() + '-' + s4() + s4() + s4();
      };
    })();

    var Base64 = {
      _keyStr: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
      encode: function (input) {
        var output = '';
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;
        input = Base64.utf8Encode(input);
        while (i < input.length) {
          chr1 = input.charCodeAt(i++);
          chr2 = input.charCodeAt(i++);
          chr3 = input.charCodeAt(i++);
          enc1 = chr1 >> 2;
          enc2 = (chr1 & 3) << 4 | chr2 >> 4;
          enc3 = (chr2 & 15) << 2 | chr3 >> 6;
          enc4 = chr3 & 63;
          if (isNaN(chr2)) {
            enc3 = enc4 = 64;
          } else if (isNaN(chr3)) {
            enc4 = 64;
          }
          output = output + this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) + this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
        }
        return output;
      },
      decode: function (input) {
        var output = '';
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '');
        while (i < input.length) {
          enc1 = this._keyStr.indexOf(input.charAt(i++));
          enc2 = this._keyStr.indexOf(input.charAt(i++));
          enc3 = this._keyStr.indexOf(input.charAt(i++));
          enc4 = this._keyStr.indexOf(input.charAt(i++));
          chr1 = enc1 << 2 | enc2 >> 4;
          chr2 = (enc2 & 15) << 4 | enc3 >> 2;
          chr3 = (enc3 & 3) << 6 | enc4;
          output = output + String.fromCharCode(chr1);
          if (enc3 !== 64) {
            output = output + String.fromCharCode(chr2);
          }
          if (enc4 !== 64) {
            output = output + String.fromCharCode(chr3);
          }
        }
        output = Base64.utf8Decode(output);
        return output;
      },
      utf8Encode: function (string) {
        string = string.replace(/\r\n/g, '\n');
        var utftext = '';
        for (var n = 0; n < string.length; n++) {
          var c = string.charCodeAt(n);
          if (c < 128) {
            utftext += String.fromCharCode(c);
          } else if (c > 127 && c < 2048) {
            utftext += String.fromCharCode(c >> 6 | 192);
            utftext += String.fromCharCode(c & 63 | 128);
          } else {
            utftext += String.fromCharCode(c >> 12 | 224);
            utftext += String.fromCharCode(c >> 6 & 63 | 128);
            utftext += String.fromCharCode(c & 63 | 128);
          }
        }
        return utftext;
      },
      utf8Decode: function (utftext) {
        var string = '';
        var i = 0;
        var c = 0;
        var c2 = 0;
        var c3 = 0;
        while (i < utftext.length) {
          c = utftext.charCodeAt(i);
          if (c < 128) {
            string += String.fromCharCode(c);
            i++;
          } else if (c > 191 && c < 224) {
            c2 = utftext.charCodeAt(i + 1);
            string += String.fromCharCode((c & 31) << 6 | c2 & 63);
            i += 2;
          } else {
            c2 = utftext.charCodeAt(i + 1);
            c3 = utftext.charCodeAt(i + 2);
            string += String.fromCharCode((c & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
            i += 3;
          }
        }
        return string;
      }
    };

    return {
      Base64: Base64,

      sprintf: function (template, params) {
        var values = _.clone(params);

        var url = template.replace(/%s/g, function () {
          return values.shift();
        });

        return url;
      },

      startsWith: function (str, prefix) {
        return str.lastIndexOf(prefix, 0) === 0;
      },

      endsWith: function (str, suffix) {
        return str.indexOf(suffix, str.length - suffix.length) !== -1;
      },

      isAdminPage: function () {
        var nonAdminRoutes = ['activate', 'downloads', 'invite', 'invitelauncher', 'applauncher', 'appdownload', 'processorder'];
        for (var i = 0; i < nonAdminRoutes.length; i++) {
          if ($location.url().indexOf(nonAdminRoutes[i]) > -1) {
            return false;
          }
        }
        return true;
      },

      isIPhone: function () {
        if ($window.navigator.userAgent.match(/iPhone/i) || $window.navigator.userAgent.match(/iPod/i) || $window.navigator.userAgent.match(/iPad/i)) {
          return true;
        } else {
          return false;
        }
      },

      isAndroid: function () {
        if ($window.navigator.userAgent.match(/Android/i)) {
          return true;
        } else {
          return false;
        }
      },

      isWindowsPhone: function () {
        if ($window.navigator.userAgent.match(/WPDesktop/i) || $window.navigator.userAgent.match(/Windows Phone/i)) {
          return true;
        } else {
          return false;
        }
      },

      isWeb: function () {
        return !this.isIPhone() && !this.isAndroid() && !this.isWindowsPhone();
      },

      removeDuplicates: function (array, key) {
        var a = array.concat();
        for (var i = 0; i < a.length; ++i) {
          if (typeof a[i] === 'undefined') {
            a.splice(i--, 1);
            continue;
          }
          for (var j = i + 1; j < a.length; ++j) {
            if ((typeof a[j] === 'undefined') || (a[i][key] === a[j][key])) {
              a.splice(j--, 1);
            }
          }
        }
        return a;
      },

      comparePaths: function (path1, path2) {
        // if either paths are undefined return false.
        if (!path1 || !path2) {
          return false;
        }

        var path1Trimmed, path2Trimmed;

        if (this.startsWith(path1, '/') || this.startsWith(path1, '#')) {
          path1Trimmed = path1.substring(1);
        } else {
          path1Trimmed = path1;
        }

        if (this.startsWith(path2, '/') || this.startsWith(path2, '#')) {
          path2Trimmed = path2.substring(1);
        } else {
          path2Trimmed = path2;
        }

        return path1Trimmed === path2Trimmed;
      },

      changedKey: function (newObject, oldObject) {
        for (var key in newObject) {
          if (newObject[key] !== oldObject[key]) {
            return key;
          }
        }
      },

      areEntitlementsActive: function (entitlements) {
        var result = false;
        for (var key in entitlements) {
          if (entitlements[key] === true) {
            result = true;
          }
        }
        return result;
      },

      getUUID: function () {
        return guid();
      },

      // Validates between v1-v5 of the UUID spec: RFC4122
      // http://stackoverflow.com/a/13653180
      isUUID: function (string) {
        var regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return regex.test(string);
      },

      getSqEntitlements: function (user) {
        var entitlements = {};
        if (angular.isArray($rootScope.services)) {
          for (var i = $rootScope.services.length - 1; i >= 0; i--) {
            var service = $rootScope.services[i].serviceId;
            var ciName = $rootScope.services[i].ciName;
            if (angular.isDefined(user) && angular.isArray(user.entitlements) && user.entitlements.indexOf(ciName) > -1) {
              entitlements[service] = true;
              entitlements.webExSquared = true;
            } else {
              entitlements[service] = false;
            }
          }
        }
        return entitlements;
      },

      // Remove when Microsoft fixes flexbox problem when min-height is defined (in messagebox-small).
      isIe: function () {
        return ($window.navigator.userAgent.indexOf('MSIE') > 0 || $window.navigator.userAgent.indexOf('Trident') > 0);
      },

      checkForIeWorkaround: function () {
        if (this.isIe()) {
          return "vertical-ie-workaround";
        } else {
          return "";
        }
      }

    };
  }
})();
