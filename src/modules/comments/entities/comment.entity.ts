/**
 * Comment entity interface
 * Represents a user comment/review on a location
 * Supports nested replies via parent_id
 */
export interface Comment {
    id: string;
    location_id: string;
    user_id: string;
    parent_id?: string; // For nested replies
    content: string;
    created_at: string;
    updated_at: string;
    is_deleted: boolean;
}
