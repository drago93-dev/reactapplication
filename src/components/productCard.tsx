
import { Link } from "react-router-dom";

type Product = {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  thumbnail: string;
  rating: number;
};

type ProductCardProps = {
  product: Product;
};

function ProductCard({ product }: ProductCardProps) {
  const addToCart = () => {
    alert(`${product.title} added to cart!`);
  };

  return (
    <div className="product-card">
      <Link
        to={`/product/${product.id}`}
        className="product-card-link"
      >
        <div className="product-image">
          <img
            src={product.thumbnail}
            alt={product.title}
          />
        </div>

        <div className="product-info">
          <p className="category">{product.category}</p>

          <h3>{product.title}</h3>

          <p className="rating">
            ⭐{" "}
            {typeof product.rating === "number"
              ? product.rating.toFixed(1)
              : Number(product.rating).toFixed(1)}
          </p>

          <p className="price">
            ${product.price.toFixed(2)}
          </p>
        </div>
      </Link>

      <div className="product-card-actions">
        <Link
          to={`/product/${product.id}`}
          className="view-details-btn"
        >
          View Details
        </Link>

        <button type="button" onClick={addToCart}>
          Add to Cart
        </button>
      </div>
    </div>
  );
}

export default ProductCard;