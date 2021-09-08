const mongoose = require("mongoose");

const statisticsSchema = mongoose.Schema({
  financials: {
    totalSales: {
      type: Number,
    },
  },

  orders: {
    totalOrders: {
      type: Number,
    },
  },
  users: {
    totalUsers: {
      type: Number,
      required: true,
    },
  },

  /*
  topSellableProducts: [
    {
      topProductName: {
        type: String,
      },
      topProductSales: {
        type: Number,
      },
    },
  ],
  
  topSellableAddresses: [
    {
      topAddresstName: {
        type: String,
      },
      topAddressSale: {
        type: Number,
      },
    },
  ],
  productsValue: [
    {
      topProductByValueName: {
        type: String,
      },
      topProductByValueValue: {
        type: Number,
      },
      topProductByValueCount: {
        type: String,
      },
      topProductByValueCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
      },
    },
  ],
  */
});

statisticsSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

statisticsSchema.set("toJSON", {
  virtuals: true,
});

exports.Statistics = mongoose.model("Statistics", statisticsSchema);
