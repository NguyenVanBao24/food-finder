/**
 * Location entity interface
 * Represents a restaurant/cafe/bar location
 */
export interface Location {
    id: string;
    name_vi: string;
    name_en?: string;
    slug_vi: string;
    slug_en?: string;
    latitude: number;
    longitude: number;
    address_vi: string;
    address_en?: string;
    district_vi: string;
    district_en?: string;
    cuisine_vi: string;
    cuisine_en?: string;
    category?: string; // Legacy
    category_id?: string;
    categories?: {
        name_vi: string;
        name_en?: string;
        icon?: string;
        slug: string;
    };
    phone?: string;
    website?: string;
    hours_open?: string;
    hours_close?: string;
    price_range: string;
    description_vi?: string;
    description_en?: string;
    status: 'pending' | 'approved' | 'rejected';
    submitted_by: string;
    approved_by?: string;
    created_at: string;
    updated_at: string;
}
