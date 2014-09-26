'use strict';

/*jshint bitwise: false*/
angular.module('Core')
  .factory('Utils', ['$rootScope', '$location',
    function($rootScope, $location) {

      var Base64 = {
        _keyStr: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
        encode: function(input) {
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
        decode: function(input) {
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
        utf8Encode: function(string) {
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
        utf8Decode: function(utftext) {
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

        sprintf: function(template, values) {
          return template.replace(/%s/g, function() {
            return values.shift();
          });
        },

        startsWith: function(str, prefix) {
          return str.lastIndexOf(prefix, 0) === 0;
        },

        endsWith: function(str, suffix) {
          return str.indexOf(suffix, str.length - suffix.length) !== -1;
        },

        isAdminPage: function() {
          var nonAdminRoutes = ['activate', 'downloads', 'invite'];
          for (var i = 0; i < nonAdminRoutes.length; i++) {
            if ($location.url().indexOf(nonAdminRoutes[i]) > -1) {
              return false;
            }
          }
          return true;
        },

        isIPhone: function() {
          if (navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPod/i) || navigator.userAgent.match(/iPad/i)) {
            return true;
          } else {
            return false;
          }
        },

        isAndroid: function() {
          if (navigator.userAgent.match(/Android/i)) {
            return true;
          } else {
            return false;
          }
        },

        isWeb: function() {
          return !this.isIPhone() && !this.isAndroid();
        },

        removeDuplicates: function(array, key) {
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

        changeTab: function(curPath, param) {
          var path = '/home';
          for (var idx in $rootScope.tabs) {
            if ($rootScope.tabs[idx].subPages) {
              for(var i in $rootScope.tabs[idx].subPages) {
                if (this.comparePaths(curPath, $rootScope.tabs[idx].subPages[i].link)) {
                  $rootScope.tabs[idx].subPages[i].isActive = 'true';
                  path = curPath;
                  break;
                }
              }
            }
            if (this.comparePaths(curPath, $rootScope.tabs[idx].link)) {
              $rootScope.tabs[idx].isActive = 'true';
              path = curPath;
              break;
            }

          } //end for
          if (!param) {
            $location.path(path);
          } else {
            $location.search(param.key, param.val).path(path);
            param = undefined;
          }
        },

        comparePaths: function(path1, path2) {
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
        }

      };
    }
  ]);
