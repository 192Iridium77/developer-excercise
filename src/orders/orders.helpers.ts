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
  console.log(
    "🚀 ~ file: orders.helpers.ts ~ line 69 ~ specialProductId",
    specialProductId
  );

  if (!specialProductId) return 0;

  console.log(
    "🚀 ~ file: orders.helpers.ts ~ line 77 ~ specialProduct ~ remainingProducts",
    remainingProducts
  );
  const specialProduct = remainingProducts.find((prod) => {
    return prod.productId === specialProductId;
  });
  console.log(
    "🚀 ~ file: orders.helpers.ts ~ line 76 ~ specialProduct ~ specialProduct",
    specialProduct
  );

  if (!specialProduct) return 0;

  const specialProducts = remainingProducts.filter((remainingProd) => {
    return remainingProd.productId === specialProduct.productId;
  });
  console.log(
    "🚀 ~ file: orders.helpers.ts ~ line 83 ~ specialProducts ~ specialProducts",
    specialProducts
  );

  const productPairsCount = Math.floor(specialProducts.length / 2);
  console.log(
    "🚀 ~ file: orders.helpers.ts ~ line 86 ~ productPairsCount",
    productPairsCount
  );

  const deduction = (productPairsCount * specialProduct.productPrice) / 2;
  console.log("🚀 ~ file: orders.helpers.ts ~ line 89 ~ deduction", deduction);

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
