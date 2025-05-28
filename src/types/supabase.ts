export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          name: string
          description: string
          price: number
          image_url: string
          seller_id: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          price: number
          image_url: string
          seller_id: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          price?: number
          image_url?: string
          seller_id?: number
          created_at?: string
        }
      }
      ratings: {
        Row: {
          id: string
          product_id: string
          user_id: string
          seller_id: number
          item_description_accuracy: number
          communication_support: number
          delivery_speed: number
          overall_experience: number
          comment: string
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          user_id: string
          seller_id: number
          item_description_accuracy: number
          communication_support: number
          delivery_speed: number
          overall_experience: number
          comment: string
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          user_id?: string
          seller_id?: number
          item_description_accuracy?: number
          communication_support?: number
          delivery_speed?: number
          overall_experience?: number
          comment?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 