import React from 'react';

// Imports dynamiques des composants volumineux
export const DynamicProductVariantModal = React.lazy(() => 
  import('./ProductVariantModal').then(mod => ({ default: mod.ProductVariantModal }))
);

// Correction pour les exports par défaut
export const DynamicUserProfile = React.lazy(() => 
  import('./UserProfile')
);

export const DynamicOrderHistory = React.lazy(() => 
  import('./OrderHistory')
);

export const DynamicLatestCollections = React.lazy(() => 
  import('./LatestCollections').then(mod => ({ default: mod.LatestCollections }))
);

export const DynamicStoreSelection = React.lazy(() => 
  import('./StoreSelection').then(mod => ({ default: mod.StoreSelection }))
); 