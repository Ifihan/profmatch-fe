import type {
  AdminStats,
  PromoCode,
  PromoCodeRedemptionResponse,
  User,
  AuthResponse,
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

export const mockAdminAuthResponse: AuthResponse = {
  user: mockAdminUser,
  access_token: "mock-admin-token",
  token_type: "bearer",
};

export const mockRegularAuthResponse: AuthResponse = {
  user: mockRegularUser,
  access_token: "mock-user-token",
  token_type: "bearer",
};

export const mockAdminStats: AdminStats = {
  total_users: 287,
  total_searches: 1023,
  active_users_last_30d: 142,
  paid_users: 34,
};

export const mockPromoCodes: PromoCode[] = [
  {
    id: "pc-1",
    code: "WELCOME10",
    credits: 10,
    max_uses: 100,
    use_count: 47,
    is_active: true,
    created_at: "2025-08-01T10:00:00Z",
  },
  {
    id: "pc-2",
    code: "BETA5",
    credits: 5,
    max_uses: 50,
    use_count: 50,
    is_active: true,
    created_at: "2025-07-15T08:30:00Z",
  },
  {
    id: "pc-3",
    code: "SUMMER20",
    credits: 20,
    max_uses: 200,
    use_count: 12,
    is_active: false,
    created_at: "2025-09-01T12:00:00Z",
  },
  {
    id: "pc-4",
    code: "LAUNCH3",
    credits: 3,
    max_uses: 500,
    use_count: 189,
    is_active: true,
    created_at: "2025-10-10T09:00:00Z",
  },
];

export const mockRedeemResponse: PromoCodeRedemptionResponse = {
  credits_granted: 10,
  new_balance: 13,
};

export function delay(ms = 500): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
