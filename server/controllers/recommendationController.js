import Product from '../models/Product.js';
import Order from '../models/Order.js';

// @desc    Get AI product recommendations for a specific product
// @route   GET /api/recommendations/:productId
// @access  Public
export const getRecommendations = async (req, res) => {
  try {
    const { productId } = req.params;

    const currentProduct = await Product.findById(productId);
    if (!currentProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // 1. Fetch all other products
    const otherProducts = await Product.find({ _id: { $ne: productId } });

    // 2. Fetch orders containing current product to calculate "Frequently bought together"
    const ordersWithCurrent = await Order.find({ 'items.productId': productId });
    
    // Map of how many times other products were bought with the current one
    const frequentlyBoughtMap = {};
    ordersWithCurrent.forEach((order) => {
      order.items.forEach((item) => {
        const idStr = item.productId.toString();
        if (idStr !== productId) {
          frequentlyBoughtMap[idStr] = (frequentlyBoughtMap[idStr] || 0) + 1;
        }
      });
    });

    // 3. Fetch all orders to determine general popularity
    const allOrders = await Order.find({});
    const popularityMap = {};
    allOrders.forEach((order) => {
      order.items.forEach((item) => {
        const idStr = item.productId.toString();
        popularityMap[idStr] = (popularityMap[idStr] || 0) + 1;
      });
    });

    // 4. Calculate scores for all other products
    const scoredProducts = otherProducts.map((p) => {
      let score = 0;
      const pIdStr = p._id.toString();

      // - Same category: +5
      if (p.category === currentProduct.category) {
        score += 5;
      }

      // - Related product mapping: +10
      // Check if currentProduct has this candidate in its relatedProducts
      const isRelated = currentProduct.relatedProducts && currentProduct.relatedProducts.some(
        (relId) => relId.toString() === pIdStr
      );
      if (isRelated) {
        score += 10;
      }

      // - Frequently bought together: +8 per occurrence
      if (frequentlyBoughtMap[pIdStr]) {
        score += 8 * frequentlyBoughtMap[pIdStr];
      }

      // - Popular products: +2 if ever ordered
      if (popularityMap[pIdStr]) {
        score += 2;
      }

      return {
        product: p,
        score,
      };
    });

    // 5. Sort by score descending and take top 4
    const topScored = scoredProducts
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map((item) => item.product);

    res.json(topScored);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
