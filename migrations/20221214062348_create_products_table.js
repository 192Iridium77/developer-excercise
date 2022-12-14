const uuid = require("uuid");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.createTable("products", function (table) {
    table.uuid("id", { primaryKey: true });
    table.string("name").unique();
    table.integer("price");
    table.timestamps();
  });

  const apple = {
    id: uuid.v4(),
    name: "apple",
    price: 50,
  };
  const banana = {
    id: uuid.v4(),
    name: "banana",
    price: 40,
  };
  const tomato = {
    id: uuid.v4(),
    name: "tomato",
    price: 30,
  };
  const potato = {
    id: uuid.v4(),
    name: "potato",
    price: 26,
  };

  await knex.batchInsert("products", [apple, banana, tomato, potato], 30);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.dropTable("products");
};
