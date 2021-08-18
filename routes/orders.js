const { Order } = require("../models/order");
const express = require("express");
const { OrderItem } = require("../models/order-item");
const mongoose = require("mongoose");

const ResponseController = require("../helpers/response-controller");

const router = express.Router();

getAllOrders();
getOrder();
getInProgressOrders();
postOrder();
updateOrder();
deleteOrder();
getTotalSales();
getTotalOrders();
getUserAllOrders();

function getAllOrders() {
  router.get(`/`, async (req, res) => {
    const orderList = await _getAllOrdersFromMongoDB();
    ResponseController.sendResponse(res, orderList, "The order list is empty");
  });
}

function _getAllOrdersFromMongoDB() {
  return Order.find()
    .populate({
      path: "orderItems",
      populate: {
        path: "product",
      },
    })
    .populate({
      path: "user",
    })
    .sort({ dateOrdered: -1 });
}

function getInProgressOrders() {
  router.get(`/getInProgressOrders`, async (req, res) => {
    const orderList = await _getInProgressOrdersFromMongoDB();
    ResponseController.sendResponse(res, orderList, "The order list is empty");
  });
}

function _getInProgressOrdersFromMongoDB() {
  return Order.find({ status: { $in: ["Pending", "Shipping", "Shipped"] } })
    .populate({
      path: "orderItems",
      populate: {
        path: "product",
      },
    })
    .populate({
      path: "user",
    })
    .sort({ dateOrdered: -1 });
}

function getOrder() {
  router.get(`/:userId/:status`, async (req, res) => {
    const order = await _getOrderFromMongoDB(req);
    //ResponseController.sendResponse(res, order, "The order is not found");
    res.send(order);
  });
}

function _getOrderFromMongoDB(req) {
  return Order.find({
    user: mongoose.Types.ObjectId(req.params.userId),
    status: req.params.status,
  })
    .populate("user", "-id -passwordHash")
    .populate({
      path: "orderItems",
      populate: {
        path: "product",
        populate: "category",
      },
    });
}

function getTotalSales() {
  router.get("/get/totalsales", async (req, res) => {
    const totalSales = await _getTotalSalesFromMongoDB();

    ResponseController.sendResponse(
      res,
      totalSales.pop(),
      "The order sales cannot be generated"
    );
  });
}

function _getTotalSalesFromMongoDB() {
  return Order.aggregate([
    { $group: { _id: null, totalSales: { $sum: "$totalPrice" } } },
  ]);
}

function getTotalOrders() {
  router.get(`/get/count`, async (req, res) => {
    const orderCount = await _getTotalOrdersFromMongoDB();

    ResponseController.sendResponse(
      res,
      orderCount.toString(),
      "There are no orders"
    );
  });
}

function _getTotalOrdersFromMongoDB() {
  return Order.countDocuments((count) => count);
}

function getUserAllOrders() {
  router.get(`/get/userorders/:userid`, async (req, res) => {
    const userOrderList = await _getUserAllOrdersFromMongoDB(req);

    ResponseController.sendResponse(res, userOrderList, "User has no orders");
  });
}

function _getUserAllOrdersFromMongoDB(req) {
  return Order.find({ user: req.params.userid })
    .populate({
      path: "orderItems",
      populate: {
        path: "product",
        populate: "category",
      },
    })
    .sort({ dateOrdered: -1 });
}

function postOrder() {
  router.post("/", async (req, res) => {
    const orderItemsIds = await _createOrderItems(req);

    const totalPrices = await _getOrderItemsTotalPrices(orderItemsIds);

    const totalPrice = _getOrderTotalPrice(totalPrices);

    let order = await _createOrder(req, orderItemsIds, totalPrice);

    ResponseController.sendResponse(res, order, "The order cannot be created");
  });
}

function _getOrderItemsTotalPrices(orderItemsIds) {
  return Promise.all(
    orderItemsIds.map(async (orderItemId) => {
      const orderItem = await OrderItem.findById(orderItemId).populate(
        "product",
        "price"
      );
      console.log(orderItem);
      console.log(orderItem.product);

      const totalPrice = orderItem.product.price * orderItem.quantity;

      return totalPrice;
    })
  );
}

function _getOrderTotalPrice(totalPrices) {
  return totalPrices.reduce((a, b) => a + b, 0);
}

function _createOrder(req, orderItemsIds, totalPrice) {
  return _postOrderToMongoDB(
    new Order({
      orderItems: orderItemsIds,
      shippingAddress1: req.body.shippingAddress1,
      city: req.body.city,
      zip: req.body.zip,
      country: req.body.country,
      phone: req.body.phone,
      status: req.body.status,
      totalPrice: totalPrice,
      user: req.body.user,
    })
  );
}

function _postOrderToMongoDB(product) {
  return product.save();
}

function updateOrder() {
  router.put("/:id/:status", async (req, res) => {
    // we are taking oldItems from a cart
    if (req.params.status == "Cart") {
      const cartOrder = await _getOldCartItems(req);
      // creating new orderItems from put params
      const orderItemsNew = await _createOrderItems(req);
      let orderItems = [];

      // pushing both of them to a single array of combined
      // old and new items
      for (let orderItemOld of cartOrder[0].orderItems) {
        orderItems.push(orderItemOld);
      }

      for (let orderItemNew of orderItemsNew) {
        orderItems.push(orderItemNew);
      }

      const totalPrices = await _getOrderItemsTotalPrices(orderItems);

      const totalPrice = _getOrderTotalPrice(totalPrices);
      const order = await _updateCartOrderFromMongoDB(
        req,
        orderItems,
        totalPrice
      );

      ResponseController.sendResponse(
        res,
        order,
        "The order cannot be updated"
      );
    } else if (req.params.status == "Pending") {
      const order = await _updatePendingOrderFromMongoDB(req);

      ResponseController.sendResponse(
        res,
        order,
        "The order cannot be updated"
      );
    }

    // creating the order
  });
}

function _getOldCartItems(req) {
  return Order.find({ _id: mongoose.Types.ObjectId(req.params.id) });
}

function _createOrderItems(req) {
  return Promise.all(
    req.body.orderItems.map(async (orderItem) => {
      // orderItem.product.id is for mobile
      // orderItem.product is for POSTMAN
      let newOrderItem = new OrderItem({
        quantity: orderItem.quantity,
        product: orderItem.product,
        pickedSize: orderItem.pickedSize,
      });

      newOrderItem = await newOrderItem.save();

      return newOrderItem._id;
    })
  );
}

function _updateCartOrderFromMongoDB(req, orderItems, totalPrice) {
  return Order.findByIdAndUpdate(
    req.params.id,
    {
      orderItems: orderItems,
      status: req.body.status,
      totalPrice: totalPrice,
    },
    { new: true }
  );
}

function _updatePendingOrderFromMongoDB(req) {
  return Order.findByIdAndUpdate(
    req.params.id,
    {
      status: req.params.status,
    },
    { new: true }
  );
}

function deleteOrder() {
  router.delete("/:id", (req, res) => {
    Order.findByIdAndRemove(req.params.id)
      .then(async (order) => {
        if (order) {
          await order.orderItems.map(async (orderItem) => {
            await OrderItem.findByIdAndRemove(orderItem);
          });
          return res
            .status(200)
            .json({ success: true, message: "the order is deleted!" });
        } else {
          return res
            .status(404)
            .json({ success: false, message: "order not found!" });
        }
      })
      .catch((err) => {
        return res.status(500).json({ success: false, error: err });
      });
  });
}

module.exports = router;
