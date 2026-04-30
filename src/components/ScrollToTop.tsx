import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// React Router preserves scroll position across navigations by default. That's
// surprising on a catalog/product flow — clicking a product 800 px down the
// catalog opens the product page already scrolled. Reset to the top whenever
// the pathname changes.
export default function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);
  return null;
}
