const mongoose = require("mongoose");

const slug = require("mongoose-slug-updater");
const generate = require("../helper/generate");
mongoose.plugin(slug);

const accountSchema = new mongoose.Schema(
    {
        fullName: String,
        email: String,
        password: String,
        token: {
            type: String,
            default: generate.generateRandomString(32)
        },
        avatar: String,
        role_id: {
            type: String,
            ref: "Role"
        },
        status: String,
        deleted: {
            type: Boolean,
            default: false,
        },
        deletedAt: Date,
    },
    { timestamps: true },
);

const Account = mongoose.model("Account", accountSchema, "accounts");

module.exports = Account;
