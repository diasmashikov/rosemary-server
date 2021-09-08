const express = require("express");
const router = express.Router();
const ResponseController = require("../helpers/response-controller");

const { Order } = require("../models/order");
const { OrderItem } = require("../models/order-item");
const { Product } = require("../models/product");
const { User } = require("../models/user");
const { Statistic, Statistics } = require("../models/statistic");

getStatistics();

function getStatistics() {
  router.get(`/`, async (req, res) => {
    const totalSalesObject = await _getTotalSalesFromMongoDB();
    const financialsParam = {
      totalSales: totalSalesObject.pop().totalSales,
    };
    const totalOrders = await _getTotalOrdersFromMongoDB();
    const ordersParam = {
      totalOrders: totalOrders,
    };

    const totalUsers = await _getTotalUsersFromMongoDB();
    const usersParam = {
      totalUsers: totalUsers,
    };

    const topSellableProducts = await _getTopSellableProducts();
    const topSellableProductsParam = {
      theMostSellableProduct: topSellableProducts,
    };

    const statistics = await _createStatistics(
      financialsParam,
      ordersParam,
      usersParam
    );

    ResponseController.sendResponse(
      res,
      statistics,
      "The asked question list is empty"
    );
  });
}

function _createStatistics(
  financialsParam,
  ordersParam,
  usersParam,
  topSellableProductsParam /*, topSellableAddressesParam, productsValueParam*/
) {
  return _saveStatisticsFromMongoDB(
    new Statistics({
      financials: financialsParam,
      orders: ordersParam,
      users: usersParam,
      topSellableProducts: topSellableProductsParam,
      /*
        topSellableProducts: topSellableProductsParam,
        topSellableAddresses: topSellableAddressesParam,
        
        productsValue: productsValueParam
        */
    })
  );
}

function _saveStatisticsFromMongoDB(statistics) {
  return statistics.save();
}

function _getTotalSalesFromMongoDB() {
  return Order.aggregate([
    { $group: { _id: null, totalSales: { $sum: "$totalPrice" } } },
  ]);
}

function _getTotalOrdersFromMongoDB() {
  return Order.countDocuments({ status: "Shipped" });
}

function _getTotalUsersFromMongoDB() {
  return User.countDocuments((count) => count);
}

function _getTopSellableProducts() {
  return Order.aggregate([
    { $match: { status: "Shipped" } },
    {
      $group: {
        _id: null,
        totalPrice: { $sum: "$orderItems.product.price" },
      },
    },
  ]);
}

module.exports = router;
