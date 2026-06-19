const BASE = import.meta.env.VITE_API_URL ?? '/api';

async function req<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...opts?.headers },
    credentials: 'include',
    ...opts,
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(`API ${path} → ${res.status}: ${msg}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  // Dogs
  getDogs:        ()                 => req<any[]>('/dogs'),
  getDog:         (id: string)       => req<any>(`/dogs/${id}`),
  createDog:      (d: any)           => req<any>('/dogs', { method: 'POST', body: JSON.stringify(d) }),
  updateDog:      (id: string, d: any) => req<any>(`/dogs/${id}`, { method: 'PATCH', body: JSON.stringify(d) }),
  deleteDog:      (id: string)       => req<any>(`/dogs/${id}`, { method: 'DELETE' }),
  // Lost reports
  reportLost:     (d: any)           => req<any>('/reports/lost', { method: 'POST', body: JSON.stringify(d) }),
  closeLost:      (id: string)       => req<any>(`/reports/lost/${id}/close`, { method: 'POST' }),
  getActiveReport:(dogId: string)    => req<any>(`/reports/lost/active/${dogId}`),
  // Sightings
  getSightings:   (dogId: string)    => req<any[]>(`/sightings/${dogId}`),
  reportSighting: (d: any)           => req<any>('/sightings', { method: 'POST', body: JSON.stringify(d) }),
  // Chip
  lookupChip:     (chipId: string)   => req<any>(`/chip/${chipId}`),
  registerChip:   (d: any)           => req<any>('/chip/register', { method: 'POST', body: JSON.stringify(d) }),
  reportScan:     (d: any)           => req<any>('/chip/scan', { method: 'POST', body: JSON.stringify(d) }),
  // Alerts
  sendBroadcast:  (d: any)           => req<any>('/alerts/broadcast', { method: 'POST', body: JSON.stringify(d) }),
  // Community
  getNearby:      (lat: number, lng: number, r?: number) =>
    req<any[]>(`/community/nearby?lat=${lat}&lng=${lng}&radius=${r ?? 5000}`),
  // Poster
  getPosterData:  (dogId: string)    => req<any>(`/poster/${dogId}`),

  // Shop
  getShopCatalog: ()                 => req<any>('/shop/catalog'),
  createCheckout: (chip_type: string, dog_id?: string) =>
    req<any>('/shop/checkout', { method: 'POST', body: JSON.stringify({ chip_type, dog_id }) }),
  getOrders:      ()                 => req<any[]>('/shop/orders'),
  getCheckoutSession: (sessionId: string) => req<any>(`/shop/session/${sessionId}`),
  registerOrderChip: (orderId: string, chip_id: string) =>
    req<any>(`/shop/orders/${orderId}/register`, { method: 'PATCH', body: JSON.stringify({ chip_id }) }),
};
