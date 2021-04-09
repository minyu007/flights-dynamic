const mongoose = require('mongoose');
const uuid = require('node-uuid');
const model = {};

const flightSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuid.v4,
  },
  createdOn: {
    type: Date,
    default: Date.now,
  },
  day: String,
  carrier: String,
  carrierCN: String,
  flightCode: String,
  aircraft: String,
  aircraftFullName: String,
  airline: String,
  airlineCN: String,
  departure: String,
  arrival: String,
  departureCN: String,
  arrivalCN: String,
  formatAircraft: String,
  economySeatsStr: String,
  firstSeats: String,
  businessSeats: String,
  premiumEconomySeats: String,
  economySeats: String,
  isMatched: String,
});

flightSchema.statics.createData = function (payload) {
  return this.create({
    day: payload.day,
    carrier: payload.carrier,
    carrierCN: payload.carrierCN,
    flightCode: payload.flightCode,
    aircraft: payload.aircraft,
    aircraftFullName: payload.aircraftFullName,
    airline: payload.airline,
    airlineCN: payload.airlineCN,
    departure: payload.departure,
    arrival: payload.arrival,
    departureCN: payload.departureCN,
    arrivalCN: payload.arrivalCN,
    economySeats: payload.economySeats,
    firstSeats: payload.firstSeats,
    businessSeats: payload.businessSeats,
    premiumEconomySeats: payload.premiumEconomySeats,
    economySeatsStr: payload.economySeatsStr,
    formatAircraft: payload.formatAircraft,
    isMatched: payload.isMatched,
  });
};

flightSchema.statics.getData = function (payload) {
  return this.find(payload)
    .sort({
      day: 1,
    })
    .exec();
};

model.flight = mongoose.model('flight', flightSchema);
module.exports = model;
