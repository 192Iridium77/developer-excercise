export interface Order {
  id: string;
  userId: string;
}

export interface OrderProduct {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productPrice: number;
}
