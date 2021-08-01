const { Order } = require("../models/order");
const express = require("express");
const { OrderItem } = require("../models/order-item");
const ResponseController = require("../helpers/response-controller");

const router = express.Router();

getAllOrders();
getOrder();
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
  return Order.find().populate("user", "name").sort({ dateOrdered: -1 });
}

function getOrder() {
  router.get(`/:id`, async (req, res) => {
    const order = await _getOrderFromMongoDB();
    ResponseController.sendResponse(res, order, "The order is not found");
  });
}

function _getOrderFromMongoDB() {
  return Order.findById(req.params.id)
    .populate("user", "name")
    .populate({
      path: "orderItems",
      populate: {
        path: "product",
        populate: "category",
      },
    });
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

function _createOrderItems(req) {
  return Promise.all(
    req.body.orderItems.map(async (orderItem) => {
      let newOrderItem = new OrderItem({
        quantity: orderItem.quantity,
        product: orderItem.product,
      });

      newOrderItem = await newOrderItem.save();

      return newOrderItem._id;
    })
  );
}

function _getOrderItemsTotalPrices(orderItemsIds) {
  return Promise.all(
    orderItemsIds.map(async (orderItemId) => {
      const orderItem = await OrderItem.findById(orderItemId).populate(
        "product",
        "price"
      );

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
      shippingAddress2: req.body.shippingAddress2,
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
  router.put("/:id", async (req, res) => {
    const order = await _updateOrderFromMongoDB(req);

    ResponseController.sendResponse(res, order, "The order cannot be updated");
  });
}

function _updateOrderFromMongoDB(req) {
  return Order.findByIdAndUpdate(
    req.params.id,
    {
      status: req.body.status,
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

module.exports = router;
