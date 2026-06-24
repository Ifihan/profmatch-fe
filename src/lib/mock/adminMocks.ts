import type {
  AdminStats,
  PromoCode,
  PromoCodeRedemptionResponse,
  User,
  TokenResponse,
} from "@/types";

export const mockAdminUser: User = {
  id: "admin-1",
  email: "admin@test.com",
  name: "Admin User",
  created_at: "2025-01-01T00:00:00Z",
  is_admin: true,
  search_credits: { balance: 99, next_free_credit_at: null },
};

export const mockRegularUser: User = {
  id: "user-1",
  email: "user@test.com",
  name: "Test User",
  created_at: "2025-06-01T00:00:00Z",
  is_admin: false,
  search_credits: { balance: 3, next_free_credit_at: null },
};

export const mockAdminAuthResponse: TokenResponse = {
  access_token: "mock-admin-token",
  refresh_token: "mock-admin-refresh-token",
  token_type: "bearer",
};

export const mockRegularAuthResponse: TokenResponse = {
  access_token: "mock-user-token",
  refresh_token: "mock-user-refresh-token",
  token_type: "bearer",
};

export const mockAdminStats: AdminStats = {
  total_users: 287,
  total_searches: 1023,
  active_users: 142,
  paid_users: 34,
};

export const mockPromoCodes: PromoCode[] = [
  {
    id: "pc-1",
    code: "WELCOME10",
    credits: 10,
    max_redemptions: 100,
    times_redeemed: 47,
    is_disabled: false,
  },
  {
    id: "pc-2",
    code: "BETA5",
    credits: 5,
    max_redemptions: 50,
    times_redeemed: 50,
    is_disabled: false,
  },
  {
    id: "pc-3",
    code: "SUMMER20",
    credits: 20,
    max_redemptions: 200,
    times_redeemed: 12,
    is_disabled: true,
  },
  {
    id: "pc-4",
    code: "LAUNCH3",
    credits: 3,
    max_redemptions: null,
    times_redeemed: 189,
    is_disabled: false,
  },
];

export const mockRedeemResponse: PromoCodeRedemptionResponse = {
  credits_granted: 10,
  balance: 13,
};

export function delay(ms = 500): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
