import { Link } from 'react-router-dom';
import type { Product } from '../types';
import { formatAed } from '../lib/pricing';
import ProductImage from './ProductImage';

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link to={`/product/${product.id}`} className="product-card">
      <div className="product-card-image">
        <ProductImage product={product} />
      </div>
      <div className="product-card-body">
        <div className="product-card-brand">{product.brand}</div>
        <h3 className="product-card-title">{product.title}</h3>
        <p className="product-card-desc">{product.shortDescription}</p>
        <div className="product-card-foot">
          <span className="price">{formatAed(product.pricePerDay)}<span className="price-sub">/day</span></span>
          <span className="deposit">deposit {formatAed(product.deposit)}</span>
        </div>
      </div>
    </Link>
  );
}
