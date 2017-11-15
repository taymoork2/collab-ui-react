export function highlightFilter() {
  return function (input, textToHighlight) {
    if (input && textToHighlight) {
      const regex = new RegExp(`(${textToHighlight})`, 'gi');
      return input.replace(regex, '<b>$1</b>');
    }
    return input;
  };
}

