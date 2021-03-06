import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const cardProducts = await AsyncStorage.getItem(
        '@GoMarketPlaceCardItens',
      );

      if (cardProducts) {
        setProducts(JSON.parse(cardProducts));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const productId = products.findIndex(
        findProduct => findProduct.id === product.id,
      );

      if (productId < 0) {
        product.quantity += 1;
        setProducts([...products, product]);
      } else {
        const productsUpdated = products.map(oldProduct => {
          if (product.id === oldProduct.id) {
            oldProduct.quantity += 1;
          }
          return oldProduct;
        });
        setProducts(productsUpdated);
      }

      await AsyncStorage.setItem(
        '@GoMarketPlaceCardItens',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const productId = products.findIndex(
        findProduct => findProduct.id === id,
      );

      if (productId >= 0) {
        products[productId].quantity += 1;
      }

      const newProducts = products.filter(product => product.quantity > 0);

      setProducts(newProducts);
      await AsyncStorage.setItem(
        '@GoMarketPlaceCardItens',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const productId = products.findIndex(
        findProduct => findProduct.id === id,
      );

      if (productId >= 0) {
        products[productId].quantity -= 1;
      }

      const newProducts = products.filter(product => product.quantity > 0);

      if (newProducts) {
        setProducts(newProducts);
      } else {
        setProducts([]);
      }
      await AsyncStorage.setItem(
        '@GoMarketPlaceCardItens',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
