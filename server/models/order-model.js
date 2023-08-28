const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    orderNum: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    orderStatus: {
      type: String,
      required: true,
      enum: ["PENDING", "IN KITCHEN", "COMPLETED", "READY TO SERVE", "CANCELLED"],
      default: "PENDING",
    },
    orderList: [
      {
        name: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        qty: {
          type: Number,
          required: true,
          default: 1,
        },
        notes: {
          type: String,
          default: "",
        },
      },
    ],
    tableName: {
      type: String,
      required: true,
    },
    customerName: {
      type: String,
    },
    payment: {
      status: {
        type: String,
        required: true,
        enum: ["UNPAID", "PAID"],
        default: "UNPAID",
      },
      type: {
        type: String,
        enum: ["", "Cash", "Credit Card", " Debit Card", "QRIS"],
        default: "",
      },
      isMerged: {
        type: Boolean,
        required: true,
        default: false,
      },
      total: {
        subtotal: {
          type: Number,
          required: true,
          default: 0,
        },
        mergedPayment: [
          {
            orderNum: {
              type: String,
            },
            subtotal: {
              type: Number,
            },
          },
        ],
        tax: {
          type: Number,
          default: 0,
        },
        serviceCharges: {
          type: Number,
          default: 0,
        },
        discount: {
          type: {
            type: String,
            enum: ["Percentage", "Fixed Amount"],
            default: "Fixed Amount",
          },
          amount: {
            type: Number,
            default: 0,
          },
        },
        totalAmount: {
          type: Number,
          required: true,
          default: 0,
        },
        paidAmount: {
          type: Number,
          required: true,
          default: 0,
        },
        changes: {
          type: Number,
          required: true,
          default: 0,
        },
      },
    },
    
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);
