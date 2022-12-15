/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.createTable("specials", function (table) {
    table.string("id", { primaryKey: true });
    table.specificType("productIds", "text ARRAY");
  });

  await knex("specials").insert({
    id: "threeForTwo",
    productIds: [],
  });

  await knex("specials").insert({ id: "secondForHalf", productIds: [] });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.dropTable("specials");
};
