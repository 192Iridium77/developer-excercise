/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.createTable("orderProducts", function (table) {
    table.uuid("id", { primaryKey: true });
    table.uuid("orderId").references("id").inTable("orders");
    table.uuid("productId").references("id").inTable("products");
    table.string("productName");
    table.integer("productPrice").notNullable();
    table.timestamps();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.dropTable("orderProducts");
};
