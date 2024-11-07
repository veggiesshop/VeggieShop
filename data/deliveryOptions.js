export const deliveryOptions = [
  {
    id: '1',
    deliveryDays: 7,
    priceCents: 0,
    label: "Standard"
  },
  {
    id: '2',
    deliveryDays: 3,
    priceCents: 20.00,
    label: "Express"
  },
  {
    id: '3',
    deliveryDays: 1,
    priceCents: 50.00,
    label: "Next Day"
  }
];

export function getDeliveryOption(deliveryOptionId) {
  return deliveryOptions.find(option => option.id === deliveryOptionId) || deliveryOptions[0];
}