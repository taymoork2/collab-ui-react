export function huronPlaces(number, ext, pstnNumbers) {
  if (number) {
    number = number > 5 ? 5 : number;
    const places = [];
    for (let i = 0; i < number; i++) {
      const place = placesData[i];
      place.name = placesData[i].name.displayName;
      if (ext) {
        place.directoryNumber = (parseInt(ext) + i).toString();
      } else {
        place.directoryNumber = (300 + i).toString();
      }
      place.entitlements = ['ciscouc', 'webex-squared'];
      place.machineType = 'room'
      if (pstnNumbers && pstnNumbers[i]) {
        place.externalNumber = pstnNumbers[i]
      }
      places.push(place);
    }
    return places;
  }
}

const placesData = [{
  name: {
    displayName: 'Mustafar',
  },
}, {
  name: {
    displayName: 'Naboo',
  },
}, {
  name: {
    displayName: 'Eadu',
  },
}, {
  name: {
    displayName: 'Mos Eisley',
  },
}, {
  name: {
    displayName: 'Death Star',
  },
}];
