export type CustomerSummary = {
  email: string;
  name: string | null;
  orderCount: number;
  customRequestCount: number;
  serviceJobCount: number;
  courierJobCount: number;
  totalTouchpoints: number;
  lastActivityAt: string | null;
};
