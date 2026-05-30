import type { AppLocale } from '@/i18n';

export const CONTACT_EMAIL = '625.somq2525@gmail.com';
const UPDATED_JA = '2026年5月31日';
const UPDATED_EN = 'May 31, 2026';

export type DocSection = { heading?: string; body: string[] };
export type DocContent = { title: string; updated?: string; intro?: string; sections: DocSection[] };
export type DocKey = 'profit' | 'faq' | 'terms' | 'privacy';

const ja: Record<DocKey, DocContent> = {
  profit: {
    title: '利益の計算方法',
    intro: 'ホームや一覧に表示される「見込み利益」は、次の式で計算しています。',
    sections: [
      {
        heading: '計算式',
        body: [
          '見込み利益 = 売却予定価格 − 販売手数料 − 送料',
          '販売手数料 = 売却予定価格 × 手数料率 + 固定手数料',
          '手数料率・固定手数料は、商品ごとに選んだ販売プラットフォームの値を使います。',
        ],
      },
      {
        heading: 'プラットフォームについて',
        body: ['eBay・Poshmark・Mercari・Vinted・Depop などのプリセットから選べます。各手数料は地域や時期で変動するため、目安として必要に応じて調整してください。'],
      },
      {
        heading: '送料について',
        body: ['商品ごとに登録した送料を差し引きます。送料が未入力の場合は 0 として計算します。'],
      },
      {
        heading: '実際の利益',
        body: ['売却を記録すると、実際の売却価格・実際の送料をもとに「実利益」を再計算します。見込み利益はあくまで登録時点の予測値です。'],
      },
    ],
  },
  faq: {
    title: 'よくある質問',
    sections: [
      { heading: 'データはどこに保存されますか？', body: ['入力した商品・写真・売却記録は、すべてお使いの端末内にのみ保存されます。外部サーバーへ送信することはありません。'] },
      { heading: '登録できる件数に上限はありますか？', body: ['無料版では商品を 20 件まで登録できます。21 件目以降は Pro プランで登録できます。'] },
      { heading: '写真は何枚登録できますか？', body: ['無料版では 1 商品につき 1 枚です。Pro プランでは複数枚登録できます。'] },
      { heading: '見込み金額はどう計算されますか？', body: ['設定 →「利益の計算方法」をご覧ください。売却予定価格から販売手数料と送料を差し引いて算出します。'] },
      { heading: 'Pro プランでできることは？', body: ['広告の非表示、写真の複数枚登録、分析機能、商品の無制限登録が利用できます。'] },
      { heading: '購入を復元するには？', body: ['機種変更や再インストール後は、設定 →「プランを確認」から購入の復元ができます。'] },
      { heading: '機種変更でデータは引き継げますか？', body: ['現在のバージョンではデータは端末内に保存されるため、自動的な引き継ぎには対応していません。バックアップ・移行機能は今後のアップデートで検討しています。'] },
    ],
  },
  terms: {
    title: '利用規約',
    updated: UPDATED_JA,
    intro: 'この利用規約（以下「本規約」）は、本アプリの利用条件を定めるものです。ご利用の際は本規約に同意したものとみなします。',
    sections: [
      { heading: '第1条（適用）', body: ['本規約は、本アプリの利用に関わる一切の関係に適用されます。'] },
      { heading: '第2条（料金・課金）', body: ['本アプリの一部機能（Pro プラン）は有料です。購入は Apple の App Store を通じて行われます。', '自動更新サブスクリプションは、期間終了の 24 時間以上前に解約しない限り自動更新されます。解約・管理は端末の「設定 → Apple ID → サブスクリプション」から行えます。'] },
      { heading: '第3条（禁止事項）', body: ['法令または公序良俗に違反する行為、本アプリの運営を妨害する行為、リバースエンジニアリング等の行為を禁止します。'] },
      { heading: '第4条（免責事項）', body: ['本アプリは現状有姿で提供されます。見込み利益などの表示は予測値であり、実際の取引結果を保証するものではありません。', '端末の故障・削除・不具合等によるデータの消失について、運営者は責任を負いません。重要なデータはご自身で管理してください。'] },
      { heading: '第5条（サービスの変更・終了）', body: ['運営者は、利用者への事前の通知なく、本アプリの内容を変更または提供を終了できるものとします。'] },
      { heading: '第6条（規約の変更）', body: ['運営者は、必要と判断した場合に本規約を変更できます。変更後の規約は、本アプリ内に表示した時点で効力を生じます。'] },
      { heading: 'お問い合わせ', body: [`本規約に関するお問い合わせは ${CONTACT_EMAIL} までご連絡ください。`] },
    ],
  },
  privacy: {
    title: 'プライバシーポリシー',
    updated: UPDATED_JA,
    intro: '本アプリにおける、利用者の情報の取扱いについて説明します。',
    sections: [
      { heading: '取得する情報と保存場所', body: ['商品名・価格・写真・売却記録など、利用者が本アプリに入力した情報は、お使いの端末内（アプリのデータベースおよびファイル）にのみ保存されます。運営者がこれらの情報を収集・閲覧することはありません。'] },
      { heading: '課金情報の取扱い', body: ['Pro プランの購入処理は Apple および購入管理サービス「RevenueCat」を通じて行われます。購入状態の管理のため、RevenueCat は匿名の識別子や購入情報を処理します。クレジットカード番号等の決済情報を本アプリが取得・保存することはありません。'] },
      { heading: '広告について', body: ['無料版では Google の広告サービス「AdMob」を表示します。AdMob は広告配信・計測のために、広告識別子やデバイス情報等を取得する場合があります。トラッキングの可否は端末の設定（App Tracking Transparency）に従います。', 'Google のプライバシーポリシー: https://policies.google.com/privacy'] },
      { heading: '第三者への提供', body: ['法令に基づく場合を除き、上記のサービス提供者（Apple・RevenueCat・Google）以外の第三者へ利用者の情報を提供することはありません。'] },
      { heading: 'お問い合わせ', body: [`本ポリシーに関するお問い合わせは ${CONTACT_EMAIL} までご連絡ください。`] },
    ],
  },
};

const en: Record<DocKey, DocContent> = {
  profit: {
    title: 'How profit is calculated',
    intro: 'The "estimated profit" shown on Home and the item list is calculated as follows.',
    sections: [
      {
        heading: 'Formula',
        body: [
          'Estimated profit = Expected sale price − Selling fee − Shipping',
          'Selling fee = Expected sale price × fee rate + fixed fee',
          'The fee rate and fixed fee come from the selling platform you choose for each item.',
        ],
      },
      {
        heading: 'About platforms',
        body: ['Choose from presets such as eBay, Poshmark, Mercari, Vinted, and Depop. Fees vary by region and change over time, so treat them as estimates and adjust as needed.'],
      },
      {
        heading: 'About shipping',
        body: ['The shipping you enter per item is deducted. If left blank, it is treated as 0.'],
      },
      {
        heading: 'Actual profit',
        body: ['When you record a sale, the actual profit is recalculated from the actual sale price and actual shipping. The estimated profit is only a prediction at the time of entry.'],
      },
    ],
  },
  faq: {
    title: 'FAQ',
    sections: [
      { heading: 'Where is my data stored?', body: ['Items, photos, and sales records you enter are stored only on your device. Nothing is sent to an external server.'] },
      { heading: 'Is there a limit on the number of items?', body: ['The free version lets you register up to 20 items. From the 21st item, a Pro plan is required.'] },
      { heading: 'How many photos can I add?', body: ['The free version allows 1 photo per item. Pro allows multiple photos.'] },
      { heading: 'How is the estimate calculated?', body: ['See Settings → "How profit is calculated". It deducts the selling fee and shipping from the expected sale price.'] },
      { heading: 'What does Pro include?', body: ['Ad-free use, multiple photos per item, analytics, and unlimited item registration.'] },
      { heading: 'How do I restore a purchase?', body: ['After changing devices or reinstalling, restore your purchase from Settings → "View plans".'] },
      { heading: 'Can I transfer data to a new device?', body: ['In the current version, data is stored on-device and is not transferred automatically. Backup and migration are being considered for a future update.'] },
    ],
  },
  terms: {
    title: 'Terms of Service',
    updated: UPDATED_EN,
    intro: 'These Terms of Service ("Terms") set out the conditions for using this app. By using the app, you are deemed to have agreed to these Terms.',
    sections: [
      { heading: '1. Application', body: ['These Terms apply to all relationships related to the use of this app.'] },
      { heading: '2. Fees & Purchases', body: ['Some features (the Pro plan) are paid. Purchases are made through the Apple App Store.', 'Auto-renewing subscriptions renew automatically unless canceled at least 24 hours before the end of the period. Manage or cancel from your device under Settings → Apple ID → Subscriptions.'] },
      { heading: '3. Prohibited conduct', body: ['You must not violate laws or public order, interfere with the operation of the app, or attempt reverse engineering.'] },
      { heading: '4. Disclaimer', body: ['The app is provided "as is". Estimated profit and similar figures are predictions and do not guarantee actual results.', 'The operator is not liable for data loss due to device failure, deletion, or malfunction. Please manage important data yourself.'] },
      { heading: '5. Changes or termination', body: ['The operator may change or discontinue the app without prior notice to users.'] },
      { heading: '6. Changes to these Terms', body: ['The operator may revise these Terms when deemed necessary. The revised Terms take effect when displayed in the app.'] },
      { heading: 'Contact', body: [`For questions about these Terms, contact ${CONTACT_EMAIL}.`] },
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    updated: UPDATED_EN,
    intro: 'This policy explains how user information is handled in this app.',
    sections: [
      { heading: 'Information collected and where it is stored', body: ['Information you enter (item names, prices, photos, sales records, etc.) is stored only on your device (the app database and files). The operator does not collect or view this information.'] },
      { heading: 'Purchase information', body: ['Pro plan purchases are processed through Apple and the purchase-management service "RevenueCat". To manage purchase status, RevenueCat processes anonymous identifiers and purchase information. The app does not collect or store payment details such as credit card numbers.'] },
      { heading: 'Advertising', body: ['The free version shows Google\'s advertising service "AdMob". AdMob may collect advertising identifiers and device information for ad delivery and measurement. Tracking follows your device setting (App Tracking Transparency).', 'Google Privacy Policy: https://policies.google.com/privacy'] },
      { heading: 'Provision to third parties', body: ['Except as required by law, user information is not provided to third parties other than the service providers above (Apple, RevenueCat, Google).'] },
      { heading: 'Contact', body: [`For questions about this policy, contact ${CONTACT_EMAIL}.`] },
    ],
  },
};

const DOCS: Record<AppLocale, Record<DocKey, DocContent>> = { ja, en };

export function getDoc(locale: AppLocale, key: string): DocContent | undefined {
  return DOCS[locale]?.[key as DocKey];
}
