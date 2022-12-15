import { differenceBy, filter, minBy, reduce, sumBy } from "lodash";
import { Product, Item } from "../products/product.model";
import { Special } from "../specials/special.model";
import { OrderProduct } from "./order.model";

const formatPrice = (price: number) => {
  const aws = Math.floor(price / 100);
  const c = price % 100;
  return { aws, c };
};

// could separate into two functions, but for the sake of time and efficiency
export const validateItemsAndTransform = (
  items: Item[],
  products: Product[]
): { valid: Product[]; invalid: Item[] } => {
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

const calculateThreeForTwoDeals = (
  productIds: string[],
  orderProducts: OrderProduct[]
) => {
  // cheapest is free
  const deals = [];
  let checkThreeForTwo: OrderProduct[] = [];
  let productsToRemove: OrderProduct[] = [];

  orderProducts.forEach((orderProduct) => {
    if (productIds.find((id) => id === orderProduct.productId)) {
      checkThreeForTwo.push(orderProduct);
    }

    if (checkThreeForTwo.length === 3) {
      productsToRemove.push(...checkThreeForTwo);

      const cheapestProduct = minBy(checkThreeForTwo, "productPrice");

      deals.push({
        price:
          sumBy(checkThreeForTwo, "productPrice") -
          cheapestProduct.productPrice,
      });

      checkThreeForTwo.length = 0;
    }
  });

  return { dealsPrice: sumBy(deals, "price"), productsToRemove };
};

const calculateSecondForHalfDeduction = (
  remainingProducts: OrderProduct[],
  productIds: string[]
) => {
  const specialProductId = productIds.length && productIds[0];

  if (!specialProductId) return 0;

  const specialProduct = remainingProducts.find((prod) => {
    return prod.productId === specialProductId;
  });

  if (!specialProduct) return 0;

  const specialProducts = remainingProducts.filter((remainingProd) => {
    return remainingProd.productId === specialProduct.productId;
  });

  const productPairsCount = Math.floor(specialProducts.length / 2);

  const deduction = (productPairsCount * specialProduct.productPrice) / 2;

  return deduction;
};

export const calculatePriceWithSpecials = (
  orderProducts: OrderProduct[],
  threeForTwo: Special,
  secondForHalf: Special
) => {
  // assumption: a product can only be part of one deal
  // assumption: the order that the specials are applied is irrelevant

  const { dealsPrice, productsToRemove } = calculateThreeForTwoDeals(
    threeForTwo.productIds,
    orderProducts
  );

  const remainingProducts = differenceBy(
    orderProducts,
    productsToRemove,
    "productId"
  );

  const deduction = calculateSecondForHalfDeduction(
    remainingProducts,
    secondForHalf.productIds
  );

  return formatPrice(
    dealsPrice + sumBy(remainingProducts, "productPrice") - deduction
  );
};
