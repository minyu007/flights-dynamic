const mongoose = require('mongoose');
const uuid = require('node-uuid');
const model = {};

const airline_dynamicSchema = new mongoose.Schema({
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
  airline: String,
  airlineCN: String,
  departure: String,
  arrival: String,
  url: String,
  zone: String,
  zoneCode: String,
  price: String,
  discount: String,
  departureDateType: String,
  departureCN: String,
  arrivalCN: String,
  // minSeats: String,
  // maxSeats: String,
  departureDate: String,
  scrapeDate: String,
  departureTime: String,
  arrivalTime: String,
  departureTerminal: String,
  arrivalTerminal: String,
  formatPrice: String,
  formatDiscount: String,
  formatAircraft: String,
  punctualityRate: String,
  distance: String,

  economySeats: String,
  firstSeats: String,
  businessSeats: String,
  premiumEconomySeats: String,
  economySeatsStr: String,

  planeModel: String,
  manufacturer: String,
  weekly: String,
});

airline_dynamicSchema.statics.createData = function (payload) {
  return this.create({
    day: payload.day,
    weekly: payload.weekly,
    carrier: payload.carrier,
    carrierCN: payload.carrierCN,
    flightCode: payload.flightCode,
    airline: payload.airline,
    airlineCN: payload.airlineCN,
    zone: payload.zone,
    zoneCode: payload.zoneCode,
    aircraft: payload.aircraft,
    price: payload.price,
    discount: payload.discount,
    departureDateType: payload.departureDateType,
    url: payload.url,
    departure: payload.departure,
    arrival: payload.arrival,
    departureCN: payload.departureCN,
    arrivalCN: payload.arrivalCN,
    // minSeats: payload.minSeats,
    // maxSeats: payload.maxSeats,
    departureDate: payload.departureDate,
    scrapeDate: payload.scrapeDate,
    departureTime: payload.departureTime,
    arrivalTime: payload.arrivalTime,
    departureTerminal: payload.departureTerminal,
    arrivalTerminal: payload.arrivalTerminal,
    formatPrice: payload.formatPrice,
    formatDiscount: payload.formatDiscount,
    formatAircraft: payload.formatAircraft,
    punctualityRate: payload.punctualityRate,
    distance: payload.distance,

    economySeats: payload.economySeats,
    firstSeats: payload.firstSeats,
    businessSeats: payload.businessSeats,
    premiumEconomySeats: payload.premiumEconomySeats,

    planeModel: payload.planeModel,
    manufacturer: payload.manufacturer,
    economySeatsStr: payload.economySeatsStr,
  });
};

airline_dynamicSchema.statics.getData = function (payload) {
  return this.find(payload)
    .sort({
      day: 1,
    })
    .exec();
};

model.airline_dynamic = mongoose.model('airline_dynamic', airline_dynamicSchema);
module.exports = model;
