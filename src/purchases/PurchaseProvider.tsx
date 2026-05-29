import React from 'react';
import Purchases, { type CustomerInfo, type PurchasesPackage } from 'react-native-purchases';
import { isExpoGo } from '@/utils/env';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { ENTITLEMENT_PRO, REVENUECAT_IOS_API_KEY } from './config';

export type PlanPackage = {
  id: string;
  productId: string;
  title: string;
  priceString: string;
  pkg: PurchasesPackage;
};

type PurchaseContextValue = {
  available: boolean; // 課金が使えるか（Expo Goでは false）
  loading: boolean;
  packages: PlanPackage[];
  buy: (pkg: PurchasesPackage) => Promise<void>;
  restore: () => Promise<void>;
};

const noop = async () => {};
const PurchaseContext = React.createContext<PurchaseContextValue>({
  available: false,
  loading: false,
  packages: [],
  buy: noop,
  restore: noop,
});

export const usePurchases = () => React.useContext(PurchaseContext);

export function PurchaseProvider({ children }: { children: React.ReactNode }) {
  if (isExpoGo) {
    return (
      <PurchaseContext.Provider value={{ available: false, loading: false, packages: [], buy: noop, restore: noop }}>
        {children}
      </PurchaseContext.Provider>
    );
  }
  return <NativePurchaseProvider>{children}</NativePurchaseProvider>;
}

const hasPro = (info: CustomerInfo) => info.entitlements.active[ENTITLEMENT_PRO] !== undefined;

function NativePurchaseProvider({ children }: { children: React.ReactNode }) {
  const setPro = useSettingsStore((s) => s.setPro);
  const [packages, setPackages] = React.useState<PlanPackage[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    const apply = (info: CustomerInfo) => setPro(hasPro(info));
    Purchases.configure({ apiKey: REVENUECAT_IOS_API_KEY });
    Purchases.addCustomerInfoUpdateListener(apply);

    (async () => {
      try {
        apply(await Purchases.getCustomerInfo());
        const offerings = await Purchases.getOfferings();
        const pkgs = offerings.current?.availablePackages ?? [];
        if (mounted) {
          setPackages(
            pkgs.map((p) => ({
              id: p.identifier,
              productId: p.product.identifier,
              title: p.product.title,
              priceString: p.product.priceString,
              pkg: p,
            })),
          );
        }
      } catch {
        // オフライン等は無視（リスナーが後で更新）
      }
    })();

    return () => {
      mounted = false;
      Purchases.removeCustomerInfoUpdateListener(apply);
    };
  }, [setPro]);

  const buy = React.useCallback(
    async (pkg: PurchasesPackage) => {
      setLoading(true);
      try {
        const { customerInfo } = await Purchases.purchasePackage(pkg);
        setPro(hasPro(customerInfo));
      } catch {
        // ユーザーキャンセル等は無視
      } finally {
        setLoading(false);
      }
    },
    [setPro],
  );

  const restore = React.useCallback(async () => {
    setLoading(true);
    try {
      setPro(hasPro(await Purchases.restorePurchases()));
    } finally {
      setLoading(false);
    }
  }, [setPro]);

  return (
    <PurchaseContext.Provider value={{ available: true, loading, packages, buy, restore }}>
      {children}
    </PurchaseContext.Provider>
  );
}
