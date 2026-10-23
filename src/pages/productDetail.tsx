import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

type Product = {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  thumbnail: string;
  images?: string[];
  rating: number | { rate: number; count: number };
  stock?: number;
  brand?: string;
};

function ProductDetails() {
  const { id } = useParams<{ id: string }>();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedImage, setSelectedImage] = useState<string>("");

  useEffect(() => {
    const fetchProduct = async (): Promise<void> => {
      try {
        setLoading(true);
        setError("");
        setProduct(null);

        const response = await fetch(
          `https://dummyjson.com/products/${id}`
        );

        if (!response.ok) {
          throw new Error("Product not found");
        }

        const data: Product = await response.json();

        setProduct(data);
        setSelectedImage(data.thumbnail);
        setQuantity(1);
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load product"
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      void fetchProduct();
    } else {
      setError("Invalid product ID");
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return <p className="message">Loading product details...</p>;
  }

  if (error || !product) {
    return (
      <div className="product-error">
        <h2>{error || "Product not found"}</h2>
        <Link to="/">Back to Shop</Link>
      </div>
    );
  }

  const rating =
    typeof product.rating === "number"
      ? product.rating
      : product.rating.rate;

  const reviewCount =
    typeof product.rating === "number"
      ? undefined
      : product.rating.count;

  const images = [
    product.thumbnail,
    ...(product.images ?? []),
  ].filter(
    (image, index, allImages) =>
      Boolean(image) && allImages.indexOf(image) === index
  );

  const maxQuantity = Math.max(0, product.stock ?? 99);

  const addToCart = (): void => {
    alert(`${quantity} × ${product.title} added to cart!`);
  };

  const buyNow = (): void => {
    alert(
      `Demo checkout: ${quantity} × ${product.title}. A checkout and payment system is required for real purchases.`
    );
  };

  return (
    <div>
      <Helmet>
        <title>{product.title} | ShopZone</title>

        <meta
          name="description"
          content={product.description.slice(0, 155)}
        />

        <meta name="robots" content="index, follow" />

        <meta property="og:type" content="product" />
        <meta property="og:site_name" content="ShopZone" />
        <meta
          property="og:title"
          content={`${product.title} | ShopZone`}
        />
        <meta
          property="og:description"
          content={product.description.slice(0, 155)}
        />
        <meta property="og:image" content={product.thumbnail} />
        <meta
          property="og:url"
          content={window.location.href}
        />

        <meta
          name="twitter:card"
          content="summary_large_image"
        />
        <meta
          name="twitter:title"
          content={`${product.title} | ShopZone`}
        />
        <meta
          name="twitter:description"
          content={product.description.slice(0, 155)}
        />
        <meta
          name="twitter:image"
          content={product.thumbnail}
        />
      </Helmet>


      <div className="details-page">
        <div className="details-topbar">
          <Link to="/" className="back-link">
            ← Back to Shop
          </Link>

          <span>ShopZone / Product Details</span>
        </div>

        <div className="details-layout">
          {/* Product Images */}
          <div className="details-gallery">
            <div className="main-product-image">
              <img src={selectedImage} alt={product.title} />
            </div>

            {images.length > 1 && (
              <div className="thumbnail-list">
                {images.map((image, index) => (
                  <button
                    type="button"
                    key={image}
                    className={
                      selectedImage === image
                        ? "thumbnail active"
                        : "thumbnail"
                    }
                    onClick={() => setSelectedImage(image)}
                    aria-label={`View product image ${index + 1}`}
                  >
                    <img src={image} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="details-info">
            <p className="details-category">
              {product.category}
            </p>

            <h1>{product.title}</h1>

            {product.brand && (
              <p className="details-brand">
                Brand: {product.brand}
              </p>
            )}

            <p className="details-rating">
              ⭐ {rating.toFixed(1)}
              {reviewCount !== undefined && (
                <span> ({reviewCount} reviews)</span>
              )}
            </p>

            <div className="details-price">
              ${product.price.toFixed(2)}
            </div>

            <p className="details-description">
              {product.description}
            </p>

            {product.stock !== undefined && (
              <p
                className={
                  product.stock > 0
                    ? "stock available"
                    : "stock unavailable"
                }
              >
                {product.stock > 0
                  ? `${product.stock} items in stock`
                  : "Out of stock"}
              </p>
            )}

            {/* Quantity Selector */}
            <div className="quantity-control">
              <label htmlFor="quantity">Quantity:</label>

              <button
                type="button"
                onClick={() =>
                  setQuantity((previous) =>
                    Math.max(1, previous - 1)
                  )
                }
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
              >
                −
              </button>

              <span id="quantity">{quantity}</span>

              <button
                type="button"
                onClick={() =>
                  setQuantity((previous) =>
                    Math.min(previous + 1, maxQuantity)
                  )
                }
                disabled={
                  quantity >= maxQuantity || maxQuantity === 0
                }
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            <div className="details-total">
              Total: ${(product.price * quantity).toFixed(2)}
            </div>

            {/* Purchase Buttons */}
            <div className="purchase-buttons">
              <button
                type="button"
                className="add-cart-btn"
                onClick={addToCart}
                disabled={maxQuantity === 0}
              >
                Add to Cart
              </button>

              <button
                type="button"
                className="buy-now-btn"
                onClick={buyNow}
                disabled={maxQuantity === 0}
              >
                Buy Now
              </button>
            </div>

            <div className="delivery-info">
              <p>✓ Product details and pricing</p>
              <p>✓ Quantity selection</p>
              <p>✓ Ready for checkout integration</p>
            </div>
          </div>
        </div>
      </div>v
      </div>
      );
}

      export default ProductDetails;