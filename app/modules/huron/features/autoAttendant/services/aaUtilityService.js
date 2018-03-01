(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .factory('AAUtilityService', AAUtilityService);

  function AAUtilityService(ASTParser, ASTWalker) {
    //methods and exposable vars
    var CONSTANTS = {};
    CONSTANTS.expressions = {};
    CONSTANTS.js = {};
    CONSTANTS.expressions.CallExpression = 'CallExpression';
    CONSTANTS.expressions.ThisExpression = 'ThisExpression';
    CONSTANTS.expressions.BinaryExpression = 'BinaryExpression';
    CONSTANTS.js.func = 'var func = function ()';
    CONSTANTS.js.conditionalArr = 'checks';
    CONSTANTS.cs = {};
    CONSTANTS.cs.currentTime = 'CURRENT_TIME';
    CONSTANTS.cs.lastCallTime = 'CS_LAST_CALL_TIME';
    var service = {
      splitOnCommas: splitOnCommas,
      addQuotesAroundCommadQuotedValues: addQuotesAroundCommadQuotedValues,
      countOccurences: countOccurences,
      generateFunction: generateFunction,
      pullJSPieces: pullJSPieces,
      removeEscapeChars: removeEscapeChars,
      CONSTANTS: CONSTANTS,
    };
    //private vars
    var commaSplitter = ','//match on comma
                       + '(?='//positive look ahead
                       + '(?:'//non capturing group
                       + '[^"]*'//match up to " 0 to n times
                       + '"'//match "
                       + '[^"]*'//match up to " 0 to n times
                       + '"'//match "
                       + ')*'//close non capturing group and do whole op 0...n
                       + '[^"]*'//match up to " 0 to n times
                       + '$)';//end string and close positive lookahead
    var commaSplitterRegex = new RegExp(commaSplitter);//regex --> new RegRxp(/,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/)

    return service;

    /////////////////////
    //public methods

    //add quotes around string values with quotes or commas
    function addQuotesAroundCommadQuotedValues(string) {
      return (
        string
              &&
              (string.indexOf(',') > -1
              ||
              string.indexOf('"') > -1)
              //if has quote or comma,
          ?
          //add quotes around string
          '"' + string.concat('"')
          :
          //otherwise return string
          string
      );
    }

    function removeEscapeChars(string) {
      return string ? string.replace(/\\/g, '') : string;
    }

    //split string based on commas
    function splitOnCommas(string) {
      var separate = [];
      if (string && string.split) {
        var lines = string.split(/\n/); //get each user applied carriage return
        _.each(lines, function (line) { //for each natural line
          var split = line.split(commaSplitterRegex); //apply the comma delimited regex
          _.each(split, function (piece) {
            //compact
            if (piece) {
              separate.push(cleanOnQuotes(piece));
            }
          });
        });
      }
      return separate;
    }

    //count number of occurences in string of given (char) var
    function countOccurences(string, char) {
      var count = string ? string.match(new RegExp(char, 'g')) : false;
      return count ? count.length : 0;
    }

    //insert into alter at index
    function insert(alter, insert, index) {
      return alter && insert && index ? alter.substr(0, index) + insert + alter.substr(index) : alter;
    }

    /*
     Here we want to generate a valid javascript function to send to the backend based on the elements and condition
     if it's a callerReturned type function we are generating a type of function that checks for value < otherValue because we can't just check for exact match
     like the other format. with the other format we are expecting to validate that one value in the array stored in the textarea matches the session variable in ces backend for if condition
     if there is any problem with if condition or elements, we "fake" a function and generate something that will always be false.
     see AAUtilityService.spec.js for function string examples
    */
    function generateFunction(ifCondition, elementsToCheck) {
      if (_.isEqual(ifCondition, 'callerReturned') && elementsToCheck) {
        return generateCallerReturnedFunction(elementsToCheck);
      } else if (ifCondition && elementsToCheck && elementsToCheck.length > 0) {
        return generateTrueFunction(ifCondition, elementsToCheck);
      } else {
        return service.CONSTANTS.js.func + ' { return this[\'' + ifCondition + '\'] != this[\'' + ifCondition + '\']; };';
      }
    }

    function pullJSPieces(expression) {
      var pieces = {
        ifCondition: '',
        isConditions: '',
      };
      if (expression) {
        return parseLeftRightExpression(pieces, expression);
      }
      return pieces;
    }

    /***********/
    //private helper methods

    function parseLeftRightExpression(pieces, expression) {
      try {
        var ast = ASTParser.parse(expression, []);
        if (ast) {
          pieces.ifCondition = grabThisCheckAgainstCondition(ast);
          var checkConditions = grabCheckConditions(ast);
          pieces.isConditions = checkConditions.length >= 0 ? checkConditions.join(', ') : checkConditions;
        }
      } catch (exception) {
        return pieces;
      }
      return pieces;
    }

    function grabThisCheckAgainstCondition(abstractSyntaxTree) {
      //innerfunction details guaranteed currently with var func = { ... };
      var body = abstractSyntaxTree.body;
      if (body) {
        var declarations = body[0].declarations;
        if (declarations) {
          var init = declarations[0].init;
          if (init) {
            var innerFunctionDetails = init.body.body;
            return checkPropertyHandler(innerFunctionDetails);
          }
        }
      }
      return '';
    }

    function grabCheckConditions(abstractSyntaxTree) {
      var conditions = [];
      ASTWalker.ancestor(abstractSyntaxTree, {
        Literal: function (node, ancestors) {
          var nodeValue = literalHandler(node, ancestors);
          if (nodeValue) {
            if (_.isNumber(nodeValue)) {
              conditions = nodeValue;
              return conditions;
            } else {
              conditions.push(removeEscapeChars(addQuotesAroundCommadQuotedValues(nodeValue)));
            }
          }
        },
      });
      return conditions;
    }

    function literalHandler(node, ancestors) {
      if (ancestors.length > 2 && ancestors[ancestors.length - 2].type === service.CONSTANTS.expressions.CallExpression) {
        return node.value;
      } else if (ancestors.length > 2 && ancestors[ancestors.length - 2].type === service.CONSTANTS.expressions.BinaryExpression) {
        return node.value;
      }
    }

    function checkPropertyHandler(innerFunctionDetails) {
      var simpleLeftArgument = innerFunctionDetails[innerFunctionDetails.length - 1].argument.left;
      if (simpleLeftArgument) {
        var checkAgainstProperty = getCallerReturned(simpleLeftArgument);
        return _.isUndefined(checkAgainstProperty) ? getCheckAgainstProperty(simpleLeftArgument.arguments) : checkAgainstProperty;
      }
      return '';
    }

    function getCallerReturned(simpleLeftArgument) {
      var callerReturned = undefined;
      ASTWalker.simple(simpleLeftArgument, {
        Literal: function (node) {
          if (node.value === service.CONSTANTS.cs.lastCallTime) {
            callerReturned = 'callerReturned';
          }
        },
      });
      return callerReturned;
    }

    function getCheckAgainstProperty(argumentLeft) {
      if (argumentLeft && argumentLeft.length > 0) {
        if (argumentLeft[0].object.type === service.CONSTANTS.expressions.ThisExpression) {
          return argumentLeft[0].property.value;
        }
      }
      return '';
    }

    function generateTrueFunction(condition, elements) {
      return service.CONSTANTS.js.func + ' {' + generateList(['var ' + service.CONSTANTS.js.conditionalArr + ' = []; '], elements).join('') + 'return ' + service.CONSTANTS.js.conditionalArr + '.indexOf(this[\'' + condition + '\']) !== -1 };';
    }

    function generateCallerReturnedFunction(elements) {
      return service.CONSTANTS.js.func + ' {' + 'return (parseInt(this[\'' + service.CONSTANTS.cs.currentTime + '\']) - parseInt(this[\'' + service.CONSTANTS.cs.lastCallTime + '\']) < ' + elements + '); };';//done in minutes
    }

    function generateList(arr, elements) {
      _.forEach(elements, function (element) { arr.push(service.CONSTANTS.js.conditionalArr + '.push(\'' + element + '\'); '); });
      return arr;
    }

    function cleanOnQuotes(piece) {
      //add escape char for single quote
      if (piece) {
        var singleQuoteIndex = piece.indexOf('\'');
        piece = singleQuoteIndex > -1 ? insert(piece, '\\', singleQuoteIndex) : piece;
        //trim up to quotes
        piece = piece.trim();
        //once you hit quotes remove first but don't alter inside
        piece = piece && _.startsWith(piece, '"') ? piece.substr(1) : piece;
        //once you end in quotes remove last but don't alter inside
        piece = piece && _.endsWith(piece, '"') ? piece.slice(0, -1) : piece;
      }
      return piece;
    }
  }
})();
