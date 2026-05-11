import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface ShopCustomer {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  phone: string;
  loyalty_points: number;
  tier: string;
  created_at: string;
  updated_at: string;
}

export interface ShopAddress {
  id: string;
  user_id: string;
  label: string;
  recipient_name: string;
  phone: string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  state: string;
  country: string;
  is_default: boolean;
}

export interface ShopOrder {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total: number;
  currency: string;
  created_at: string;
}

export const useShopCustomer = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["shop-customer", user?.id],
    enabled: !!user,
    retry: false,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("shop_customers")
        .select("*")
        .eq("user_id", user?.id)
        .maybeSingle();

      if (error) throw error;
      return data as ShopCustomer | null;
    },
  });
};

export const useEnsureShopCustomer = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile?: { fullName?: string; phone?: string }) => {
      if (!user) throw new Error("Sign in required");
      const { data, error } = await (supabase as any)
        .from("shop_customers")
        .upsert(
          {
            user_id: user.id,
            email: user.email || "",
            full_name: profile?.fullName || user.user_metadata?.full_name || "",
            phone: profile?.phone || "",
          },
          { onConflict: "user_id" }
        )
        .select()
        .single();

      if (error) throw error;
      return data as ShopCustomer;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["shop-customer", user?.id] }),
  });
};

export const useShopAddresses = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["shop-addresses", user?.id],
    enabled: !!user,
    retry: false,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("shop_addresses")
        .select("*")
        .eq("user_id", user?.id)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as ShopAddress[];
    },
  });
};

export const useSaveShopAddress = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (address: {
      label: string;
      recipientName: string;
      phone: string;
      addressLine1: string;
      addressLine2?: string;
      city: string;
      state: string;
      country: string;
      isDefault: boolean;
    }) => {
      if (!user) throw new Error("Sign in required");
      const { data, error } = await (supabase as any)
        .from("shop_addresses")
        .insert({
          user_id: user.id,
          label: address.label,
          recipient_name: address.recipientName,
          phone: address.phone,
          address_line_1: address.addressLine1,
          address_line_2: address.addressLine2 || "",
          city: address.city,
          state: address.state,
          country: address.country,
          is_default: address.isDefault,
        })
        .select()
        .single();

      if (error) throw error;
      return data as ShopAddress;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["shop-addresses", user?.id] }),
  });
};

export const useShopOrders = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["shop-orders", user?.id],
    enabled: !!user,
    retry: false,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("shop_orders")
        .select("id, order_number, status, payment_status, total, currency, created_at")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      return (data || []) as ShopOrder[];
    },
  });
};
