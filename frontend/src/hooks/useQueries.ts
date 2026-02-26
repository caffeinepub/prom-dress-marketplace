import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { DressListing, UserProfile, Message } from '../backend';
import { ExternalBlob } from '../backend';
import type { Principal } from '@icp-sdk/core/principal';

// ---- User Profile ----

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useGetUserProfile(userId: Principal | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ['userProfile', userId?.toString()],
    queryFn: async () => {
      if (!actor || !userId) return null;
      return actor.getUserProfile(userId);
    },
    enabled: !!actor && !actorFetching && !!userId,
    retry: false,
  });
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ---- Listings ----

export function useGetAllListings() {
  const { actor, isFetching } = useActor();

  return useQuery<DressListing[]>({
    queryKey: ['allListings'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllListings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAvailableListings() {
  const { actor, isFetching } = useActor();

  return useQuery<DressListing[]>({
    queryKey: ['availableListings'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAvailableListings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetFeaturedListings() {
  const { actor, isFetching } = useActor();

  return useQuery<DressListing[]>({
    queryKey: ['featuredListings'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFeaturedListings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetListing(id: bigint | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<DressListing | null>({
    queryKey: ['listing', id?.toString()],
    queryFn: async () => {
      if (!actor || id === undefined) return null;
      return actor.getListing(id);
    },
    enabled: !!actor && !isFetching && id !== undefined,
  });
}

export function useGetSellerListings(sellerId: Principal | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<DressListing[]>({
    queryKey: ['sellerListings', sellerId?.toString()],
    queryFn: async () => {
      if (!actor || !sellerId) return [];
      return actor.getSellerListings(sellerId);
    },
    enabled: !!actor && !isFetching && !!sellerId,
  });
}

export function useSearchListings(keyword: string) {
  const { actor, isFetching } = useActor();

  return useQuery<DressListing[]>({
    queryKey: ['searchListings', keyword],
    queryFn: async () => {
      if (!actor) return [];
      if (!keyword.trim()) return actor.getAvailableListings();
      return actor.searchListings(keyword);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddListing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      title: string;
      description: string;
      price: bigint;
      size: string;
      condition: string;
      color: string;
      photos: ExternalBlob[];
      isFeatured: boolean;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addListing(
        params.title,
        params.description,
        params.price,
        params.size,
        params.condition,
        params.color,
        params.photos,
        params.isFeatured
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allListings'] });
      queryClient.invalidateQueries({ queryKey: ['availableListings'] });
      queryClient.invalidateQueries({ queryKey: ['featuredListings'] });
      queryClient.invalidateQueries({ queryKey: ['sellerListings'] });
    },
  });
}

export function useUpdateListing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      listingId: bigint;
      title: string;
      description: string;
      price: bigint;
      size: string;
      condition: string;
      color: string;
      photos: ExternalBlob[];
      isAvailable: boolean;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateListing(
        params.listingId,
        params.title,
        params.description,
        params.price,
        params.size,
        params.condition,
        params.color,
        params.photos,
        params.isAvailable
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['listing', variables.listingId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['allListings'] });
      queryClient.invalidateQueries({ queryKey: ['availableListings'] });
      queryClient.invalidateQueries({ queryKey: ['featuredListings'] });
      queryClient.invalidateQueries({ queryKey: ['sellerListings'] });
    },
  });
}

export function useDeleteListing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listingId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteListing(listingId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allListings'] });
      queryClient.invalidateQueries({ queryKey: ['availableListings'] });
      queryClient.invalidateQueries({ queryKey: ['featuredListings'] });
      queryClient.invalidateQueries({ queryKey: ['sellerListings'] });
    },
  });
}

export function usePromoteListing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listingId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.promoteListing(listingId);
    },
    onSuccess: (_data, listingId) => {
      queryClient.invalidateQueries({ queryKey: ['listing', listingId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['allListings'] });
      queryClient.invalidateQueries({ queryKey: ['featuredListings'] });
      queryClient.invalidateQueries({ queryKey: ['sellerListings'] });
    },
  });
}

// ---- Messages ----

export function useGetMessages(listingId: bigint | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<Message[]>({
    queryKey: ['messages', listingId?.toString()],
    queryFn: async () => {
      if (!actor || listingId === undefined) return [];
      return actor.getMessages(listingId);
    },
    enabled: !!actor && !isFetching && listingId !== undefined,
    retry: false,
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      sellerId: Principal;
      listingId: bigint;
      message: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.sendMessage(params.sellerId, params.listingId, params.message);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.listingId.toString()] });
    },
  });
}
