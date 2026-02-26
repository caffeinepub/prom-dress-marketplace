import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface DressListing {
    id: bigint;
    title: string;
    color: string;
    size: string;
    isAvailable: boolean;
    description: string;
    isFeatured: boolean;
    sellerId: Principal;
    price: bigint;
    photos: Array<ExternalBlob>;
    condition: string;
}
export interface Message {
    listingId: bigint;
    message: string;
    buyerId: Principal;
    sellerId: Principal;
}
export interface UserProfile {
    bio: string;
    name: string;
    role: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addListing(title: string, description: string, price: bigint, size: string, condition: string, color: string, photos: Array<ExternalBlob>, isFeatured: boolean): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteListing(listingId: bigint): Promise<void>;
    filterByColor(color: string): Promise<Array<DressListing>>;
    filterByCondition(condition: string): Promise<Array<DressListing>>;
    filterByPrice(minPrice: bigint, maxPrice: bigint): Promise<Array<DressListing>>;
    filterBySize(size: string): Promise<Array<DressListing>>;
    getAllListings(): Promise<Array<DressListing>>;
    getAvailableListings(): Promise<Array<DressListing>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getFeaturedListings(): Promise<Array<DressListing>>;
    getListing(id: bigint): Promise<DressListing | null>;
    getMessages(listingId: bigint): Promise<Array<Message>>;
    getSellerListings(sellerId: Principal): Promise<Array<DressListing>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    promoteListing(listingId: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchListings(keyword: string): Promise<Array<DressListing>>;
    sendMessage(sellerId: Principal, listingId: bigint, message: string): Promise<void>;
    updateListing(listingId: bigint, title: string, description: string, price: bigint, size: string, condition: string, color: string, photos: Array<ExternalBlob>, isAvailable: boolean): Promise<void>;
}
