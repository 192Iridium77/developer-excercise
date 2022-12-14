const bcrypt = require("bcrypt");
const uuid = require("uuid");
require("dotenv").config({ path: "../.env" });

const now = () => new Date().toISOString();

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

exports.up = async function (knex) {
  let customerPassword, adminPassword;

  try {
    const salt = await bcrypt.genSalt();

    // this is not actually secure, but just for the demo
    customerPassword = await bcrypt.hash("customer22", salt);
    adminPassword = await bcrypt.hash("admin22", salt);
  } catch (err) {
    throw Error(err);
  }

  const customer = {
    id: uuid.v4(),
    username: "Chris",
    password: customerPassword,
    role: "customer",
    created_at: now(),
    updated_at: now(),
  };

  const admin = {
    id: uuid.v4(),
    username: "Alice",
    password: adminPassword,
    role: "admin",
    created_at: now(),
    updated_at: now(),
  };

  await knex.schema.createTable("users", function (table) {
    table.uuid("id", { primaryKey: true });
    table.string("username");
    table.string("password");
    table.string("role");
    table.timestamps();
  });

  await knex.batchInsert("users", [customer, admin], 30);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("users");
};
