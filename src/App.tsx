import { useEffect, useState } from "react";
import ProductCard from "./components/productCard";
import "./App.css";
import { Routes, Route } from "react-router-dom";
import ProductDetails from "./pages/productDetail";

type Product = {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  thumbnail: string;
  rating: number;
};
function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const [search, setSearch] = useState<string>("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sort, setSort] = useState<string>("default");

  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(0);

  const [apiMinPrice, setApiMinPrice] = useState<number>(0);
  const [apiMaxPrice, setApiMaxPrice] = useState<number>(0);

  // Pagination

  const [currentPage, setCurrentPage] = useState<number>(1);
  const productsPerPage = 12;

  // Fetch products

  useEffect(() => {
    const fetchProducts = async (): Promise<void> => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "https://dummyjson.com/products?limit=0"
        );

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data: { products: Product[] } =
          await response.json();

        const prices = data.products.map((product) => product.price);

        const lowestPrice = prices.length ? Math.min(...prices) : 0;
        const highestPrice = prices.length ? Math.max(...prices) : 0;

        setProducts(data.products);

        setApiMinPrice(lowestPrice);
        setApiMaxPrice(highestPrice);

        setMinPrice(lowestPrice);
        setMaxPrice(highestPrice);
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong"
        );
      } finally {
        setLoading(false);
      }
    };

    void fetchProducts();
  }, []);

  // Reset pagination when filters change

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategories, minPrice, maxPrice, sort]);

  // Get unique categories

  const categories: string[] = [
    "all",
    ...new Set(products.map((product) => product.category)),
  ];

  // Search, filter, and sort products

  const filteredProducts = products
    .filter((product) =>
      product.title.toLowerCase().includes(search.toLowerCase())
    )
    .filter(
      (product) =>
        selectedCategories.length === 0 ||
        selectedCategories.includes(product.category)
    )
    .filter(
      (product) =>
        product.price >= minPrice &&
        product.price <= maxPrice
    )
    .sort((a, b) => {
      if (sort === "low-high") {
        return a.price - b.price;
      }

      if (sort === "high-low") {
        return b.price - a.price;
      }

      return 0;
    });

  // Clear all filters

  const clearFilters = (): void => {
    setSearch("");
    setSelectedCategories([]);
    setSort("default");
    setMinPrice(apiMinPrice);
    setMaxPrice(apiMaxPrice);
    setCurrentPage(1);
  };

  // Pagination calculations

  const totalPages = Math.ceil(
    filteredProducts.length / productsPerPage
  );

  const startIndex = (currentPage - 1) * productsPerPage;

  const currentProducts = filteredProducts.slice(
    startIndex,
    startIndex + productsPerPage
  );

  return (
    <div className="app">

      {/* Header */}

      <header className="header">
        <h1>ShopZone</h1>
        <p>Find your favorite products</p>
      </header>

      <main className="container">

        {/* Search and Sorting */}

        <div className="toolbar">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="default">Default Sorting</option>
            <option value="low-high">Price: Low to High</option>
            <option value="high-low">Price: High to Low</option>
          </select>
        </div>

        {/* Loading */}

        {loading && (
          <p className="message">Loading products...</p>
        )}

        {/* Error */}

        {error && (
          <div className="message error">
            {error}

            <button onClick={() => window.location.reload()}>
              Retry
            </button>
          </div>
        )}

        {/* Shop Content */}

        {!loading && !error && (
          <div className="shop-layout">

            {/* Sidebar */}

            <aside className="sidebar">
              <div className="filter-heading">
                <h2>Filters</h2>

                <button
                  className="clear-btn"
                  onClick={clearFilters}
                >
                  Clear all
                </button>
              </div>

              {/* Category Filter */}
              <div className="filter-section">
                <h3>Category</h3>

                <div className="category-scroll">
                  {categories.map((cat) => (
                    <label key={cat} className="category-label">
                      <input
                        type="checkbox"
                        checked={
                          cat === "all"
                            ? selectedCategories.length === 0
                            : selectedCategories.includes(cat)
                        }
                        onChange={(e) => {
                          if (cat === "all") {
                            setSelectedCategories([]);
                          } else {
                            setSelectedCategories((prev) =>
                              e.target.checked
                                ? [...prev, cat]
                                : prev.filter((item) => item !== cat)
                            );
                          }
                        }}
                      />

                      <span>
                        {cat === "all" ? "All Categories" : cat}
                      </span>
                    </label>
                  ))}
                </div>
              </div>


              {/* Price Filter */}
              <div className="filter-section">
                <h3>Price</h3>

                {/* Minimum and Maximum Price Inputs */}
                <div className="price-inputs">
                  <div className="price-field">
                    <label htmlFor="min-price">Min price ($)</label>

                    <input
                      id="min-price"
                      type="number"
                      min={apiMinPrice}
                      max={maxPrice}
                      step="any"
                      value={minPrice}
                      onChange={(e) => {
                        const value = Number(e.target.value);

                        if (
                          value >= apiMinPrice &&
                          value <= maxPrice
                        ) {
                          setMinPrice(value);
                        }
                      }}
                    />
                  </div>

                  <span>to</span>

                  <div className="price-field">
                    <label htmlFor="max-price">Max price ($)</label>

                    <input
                      id="max-price"
                      type="number"
                      min={minPrice}
                      max={apiMaxPrice}
                      step="any"
                      value={maxPrice}
                      onChange={(e) => {
                        const value = Number(e.target.value);

                        if (
                          value >= minPrice &&
                          value <= apiMaxPrice
                        ) {
                          setMaxPrice(value);
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Dual Range Slider */}
                <div className="range-slider">
                  <div className="slider-track" />

                  <div
                    className="slider-range"
                    style={{
                      left: `${((minPrice - apiMinPrice) /
                        (apiMaxPrice - apiMinPrice || 1)) * 100
                        }%`,
                      right: `${100 -
                        ((maxPrice - apiMinPrice) /
                          (apiMaxPrice - apiMinPrice || 1)) * 100
                        }%`,
                    }}
                  />

                  {/* Minimum Price Slider */}
                  <input
                    type="range"
                    min={apiMinPrice}
                    max={apiMaxPrice}
                    step="any"
                    value={minPrice}
                    disabled={apiMinPrice === apiMaxPrice}
                    aria-label="Minimum price slider"
                    onChange={(e) => {
                      setMinPrice(
                        Math.min(Number(e.target.value), maxPrice)
                      );
                    }}
                  />

                  {/* Maximum Price Slider */}
                  <input
                    type="range"
                    min={apiMinPrice}
                    max={apiMaxPrice}
                    step="any"
                    value={maxPrice}
                    disabled={apiMinPrice === apiMaxPrice}
                    aria-label="Maximum price slider"
                    onChange={(e) => {
                      setMaxPrice(
                        Math.max(Number(e.target.value), minPrice)
                      );
                    }}
                  />
                </div>

                {/* Price Labels */}
                <div className="range-labels">
                  <span>${minPrice.toFixed(2)}</span>
                  <span>${maxPrice.toFixed(2)}</span>
                </div>
              </div>

              <p className="filter-note">
                Adjust the sliders to find products in your budget.
              </p>
            </aside>

            {/* Products Section */}

            <section className="products-section">

              {/* Results Count */}

              <div className="results">
                Showing{" "}
                {filteredProducts.length === 0
                  ? 0
                  : startIndex + 1}
                {"–"}
                {Math.min(
                  startIndex + productsPerPage,
                  filteredProducts.length
                )}{" "}
                of {filteredProducts.length} products
              </div>

              {filteredProducts.length > 0 ? (
                <>
                  {/* Product Grid */}

                  <div className="product-grid">
                    {currentProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                      />
                    ))}
                  </div>
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="pagination-wrapper">
                      <span className="page-info">
                        Page {currentPage} of {totalPages}
                      </span>

                      <div className="pagination">
                        <button
                          className="page-number"
                          onClick={() => setCurrentPage(1)}
                          disabled={currentPage === 1}
                          title="Go to first page"
                        >
                          Page 1
                        </button>
                        
                        {/* Previous page */}
                        <button
                          className="page-arrow"
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                          }
                          disabled={currentPage === 1}
                          aria-label="Previous page"
                        >
                          &#8249;
                        </button>

                        {Array.from(
                          { length: totalPages },
                          (_, index) => index + 1
                        )
                          .filter(
                            (page) =>
                              page >= Math.max(1, currentPage - 2) &&
                              page <= Math.min(totalPages, currentPage + 2)
                          )
                          .map((page) => (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`page-number ${currentPage === page ? "active" : ""
                                }`}
                              aria-current={
                                currentPage === page ? "page" : undefined
                              }
                            >
                              {page}
                            </button>
                          ))}

                        <button
                          className="page-arrow"
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(prev + 1, totalPages)
                            )
                          }
                          disabled={currentPage === totalPages}
                          aria-label="Next page"
                        >
                          &#8250;
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="message">
                  No products found. Try changing your filters.
                </p>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<ShopPage />} />
      <Route
        path="/product/:id"
        element={<ProductDetails />}
      />
    </Routes>
  );
}

export default App;