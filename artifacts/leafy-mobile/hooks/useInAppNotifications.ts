import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { apiFetch } from "@/lib/api";

export interface InAppNotification {
  id: number;
  type: string;
  title: string;
  body: string;
  icon: string;
  isRead: boolean;
  createdAt: string;
}

export function useInAppNotifications(enabled: boolean) {
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery<InAppNotification[]>({
    queryKey: ["in-app-notifications"],
    queryFn: () => apiFetch("/notifications"),
    enabled,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllRead = useCallback(async () => {
    try {
      await apiFetch("/notifications/read-all", { method: "PATCH" });
      queryClient.setQueryData<InAppNotification[]>(["in-app-notifications"], prev =>
        (prev ?? []).map(n => ({ ...n, isRead: true }))
      );
    } catch {}
  }, [queryClient]);

  const refetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["in-app-notifications"] });
  }, [queryClient]);

  return { notifications, unreadCount, isLoading, markAllRead, refetch };
}
