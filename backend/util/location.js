const API_KEY = ''

const HttpError = require("../models/http-error");
// const axios = require('axios')


const getCoordsForAddress = async (address) => {
//Dummy code to convert coordinates into location
  const response = await new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({
        data: {
          results: [
            {
              geometry: {
                location: {
                  lat: 40.7484474,
                  lng: -73.9871516
                }
              }
            }
          ]
        }
      });
    }, 1000);
  });

  const data = response.data;

  if (!data) {
    throw new HttpError('Could not find location.', 404);
  }

  const coordinates = data.results[0].geometry.location;
  return coordinates;
};


module.exports = getCoordsForAddress
