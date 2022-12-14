import { differenceBy, filter, minBy, reduce, sumBy } from "lodash";
import { Product, Item } from "../products/product.model";
import { Special } from "../specials/special.model";

// could separate into two functions, but for the sake of time and efficiency
export const validateItemsAndTransform = (
  items: Item[],
  products: Product[]
) => {
  const invalid = [];
  const valid = [];

  items.forEach((item) => {
    const found = products.find((p) => p.name === item);

    if (found) {
      valid.push(found);
    } else {
      invalid.push(item);
    }
  });
  return { valid, invalid };
};

export const calculatePriceWithSpecials = (
  products: Product[],
  threeForTwo: Special,
  secondForHalf: Special
) => {
  products = products.map((p, index) => ({ ...p, index }));

  // assumption: a product can only be part of one deal
  // assumption: the order that the specials are applied is irrelevant

  // cheapest is free
  const deals = [];
  let checkThreeForTwo = [];
  let productsToRemove = [];

  products.forEach((product) => {
    if (threeForTwo.productIds.find((id) => id === product.id)) {
      checkThreeForTwo.push(product);
    }
    if (checkThreeForTwo.length === 3) {
      productsToRemove.push(...checkThreeForTwo);

      const cheapestProduct = minBy(checkThreeForTwo, "price");

      deals.push({
        specialId: threeForTwo.id,
        originalProducts: threeForTwo.productIds,
        price: sumBy(checkThreeForTwo, "price") - cheapestProduct.price,
      });

      checkThreeForTwo.length = 0;
    }
  });

  const remainingProducts = differenceBy(products, productsToRemove, "index");

  // TODO separate the two calculations into functions

  const secondForHalfProductId = secondForHalf?.productIds.length
    ? secondForHalf.productIds[0]
    : "";

  const hasAtLeastOne = remainingProducts.find((prod) => {
    return prod.id === secondForHalfProductId;
  });

  const priceOfSecondForHalfProduct = hasAtLeastOne?.price || 0;

  const productsMatchingSecondForHalfSpecial = remainingProducts.filter(
    (remainingProd) => {
      return remainingProd.id === secondForHalfProductId;
    }
  );

  const secondForHalfDeduction =
    Math.floor(productsMatchingSecondForHalfSpecial.length / 2) *
    priceOfSecondForHalfProduct;

  return (
    sumBy(deals, "price") +
    sumBy(remainingProducts, "price") -
    secondForHalfDeduction
  );
};
