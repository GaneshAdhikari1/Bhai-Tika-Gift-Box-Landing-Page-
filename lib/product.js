export const PRODUCT = {
  name: "Premium Bhai Tika Gift Box",
  regularPrice: 3499,
  offerPrice: 2999,
  currency: "NPR",
  description:
    "A beautifully arranged festive hamper with premium chocolates, Ferrero Rocher, Haldiram's Gulab Jamun, a refreshing bottle, and thoughtful treats—elegantly wrapped and ready to delight your brother this Bhai Tika.",
  images: [
    "/products/vaitika-pyaro-dai-ferrero-plum-rosegold.png",
    "/products/vaitika-pyaro-dai-lindt-emerald-gold.png",
    "/products/vaitika-hamper-burgundy-gold.png",
    "/products/vaitika-hamper-navy-silver.png",
    "/products/vaitika-hamper-sage-ivory.png"
  ]
};

export const DELIVERY_FEES = {
  inside_valley: 100,
  outside_valley: 200
};

export function formatNpr(value) {
  return `Rs. ${new Intl.NumberFormat("en-NP").format(value)}`;
}
