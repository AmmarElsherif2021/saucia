// TODO: implement
const orderRules = {
  // Example rule: Ensure that the order has at least one item
  hasItems: (order) => {
    return order.items && order.items.length > 0;
  }
};