const mongoose = require('mongoose');
const uuid = require('node-uuid');
const model = {};

const airline_report_dynamicSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuid.v4,
  },
  createdOn: {
    type: Date,
    default: Date.now,
  },
  weekly: String,
  airline: String,
  airlineCN: String,
  distance: Number,
  _20210702Price: Number,
  _20210806Price: Number,

  _20210702PriceDivideByKM: Number,
  _20210806PriceDivideByKM: Number,

  _20210702Discount: Number,
  _20210806Discount: Number,

  _20210702ASK: Number,
  _20210806ASK: Number,

  ASK: Number,
  carrier: String,
  carrierCN: String,
  order: Number,
  sheet: String,
  scrapeDate: String,
  _20210702: String,
  _20210806: String,
});

airline_report_dynamicSchema.statics.createData = function (payload) {
  return this.create({
    weekly: payload.weekly,
    airline: payload.airline,
    airlineCN: payload.airlineCN,
    distance: payload.distance,
    _20210702Price: payload._20210702Price,
    _20210806Price: payload._20210806Price,

    _20210702PriceDivideByKM: payload._20210702PriceDivideByKM,
    _20210806PriceDivideByKM: payload._20210806PriceDivideByKM,

    _20210702Discount: payload._20210702Discount,
    _20210806Discount: payload._20210806Discount,

    _20210702ASK: payload._20210702ASK,
    _20210806ASK: payload._20210806ASK,

    ASK: payload.ASK,
    carrier: payload.carrier,
    carrierCN: payload.carrierCN,
    order: payload.order,
    sheet: payload.sheet,
    scrapeDate: payload.scrapeDate,
    _20210702: payload._20210702,
    _20210806: payload._20210806,
  });
};

airline_report_dynamicSchema.statics.getData = function (payload) {
  return this.find(payload)
    .sort({
      day: 1,
    })
    .exec();
};

model.airline_report_dynamic = mongoose.model(
  'airline_report_dynamic',
  airline_report_dynamicSchema
);
module.exports = model;
