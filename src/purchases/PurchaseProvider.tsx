import React from 'react';
import { useIAP } from 'react-native-iap';
import { isExpoGo } from '@/utils/env';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { PRO_SKUS, SKU_LIFETIME, SKU_MONTHLY } from './products';

export type PlanProduct = { id: string; title: string; displayPrice: string };

type PurchaseContextValue = {
  available: boolean; // 課金機能が使えるか（Expo Goでは false）
  loading: boolean;
  lifetime?: PlanProduct;
  monthly?: PlanProduct;
  buy: (sku: string) => Promise<void>;
  restore: () => Promise<void>;
};

const noop = async () => {};
const PurchaseContext = React.createContext<PurchaseContextValue>({
  available: false,
  loading: false,
  buy: noop,
  restore: noop,
});

export const usePurchases = () => React.useContext(PurchaseContext);

export function PurchaseProvider({ children }: { children: React.ReactNode }) {
  // Expo Go ではネイティブ課金が無いため no-op プロバイダ
  if (isExpoGo) {
    return <PurchaseContext.Provider value={{ available: false, loading: false, buy: noop, restore: noop }}>{children}</PurchaseContext.Provider>;
  }
  return <NativePurchaseProvider>{children}</NativePurchaseProvider>;
}

function NativePurchaseProvider({ children }: { children: React.ReactNode }) {
  const setPro = useSettingsStore((s) => s.setPro);
  const {
    connected,
    products,
    subscriptions,
    availablePurchases,
    activeSubscriptions,
    fetchProducts,
    getAvailablePurchases,
    requestPurchase,
    finishTransaction,
  } = useIAP({
    onPurchaseSuccess: async (purchase) => {
      try {
        await finishTransaction({ purchase, isConsumable: false });
      } catch {
        // 失敗時も次回起動で再処理される
      }
      setPro(true);
    },
  });
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!connected) return;
    void fetchProducts({ skus: [SKU_LIFETIME], type: 'in-app' });
    void fetchProducts({ skus: [SKU_MONTHLY], type: 'subs' });
    void getAvailablePurchases();
  }, [connected, fetchProducts, getAvailablePurchases]);

  // エンタイトルメント反映（買い切り所有 or サブスク有効）
  React.useEffect(() => {
    const owned = availablePurchases.some((p) => PRO_SKUS.includes(p.productId));
    const subscribed = activeSubscriptions.length > 0;
    setPro(owned || subscribed);
  }, [availablePurchases, activeSubscriptions, setPro]);

  const buy = React.useCallback(
    async (sku: string) => {
      setLoading(true);
      try {
        await requestPurchase({
          request: { apple: { sku }, google: { skus: [sku] } },
          type: sku === SKU_MONTHLY ? 'subs' : 'in-app',
        });
      } finally {
        setLoading(false);
      }
    },
    [requestPurchase],
  );

  const restore = React.useCallback(async () => {
    setLoading(true);
    try {
      await getAvailablePurchases();
    } finally {
      setLoading(false);
    }
  }, [getAvailablePurchases]);

  const value: PurchaseContextValue = {
    available: true,
    loading,
    lifetime: products.find((p) => p.id === SKU_LIFETIME),
    monthly: subscriptions.find((p) => p.id === SKU_MONTHLY),
    buy,
    restore,
  };

  return <PurchaseContext.Provider value={value}>{children}</PurchaseContext.Provider>;
}
