/**
 * Tag entity interface
 * Represents a tag that can be voted on for locations
 */
export interface Tag {
    id: string;
    name_vi: string;
    name_en: string;
    category: 'positive' | 'negative';
    icon: string;
}
