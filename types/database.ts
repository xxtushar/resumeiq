// Hand-written to match supabase/migrations/0001_init.sql. Once the project
// is linked, regenerate with:
//   supabase gen types typescript --linked > types/database.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      resumes: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          source: "uploaded" | "builder";
          storage_path: string | null;
          raw_text: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string;
          source: "uploaded" | "builder";
          storage_path?: string | null;
          raw_text?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          source?: "uploaded" | "builder";
          storage_path?: string | null;
          raw_text?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      resume_versions: {
        Row: {
          id: string;
          resume_id: string;
          user_id: string;
          content: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          resume_id: string;
          user_id: string;
          content: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          resume_id?: string;
          user_id?: string;
          content?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      analyses: {
        Row: {
          id: string;
          resume_id: string;
          user_id: string;
          job_description: string | null;
          job_id: string | null;
          score: number;
          result: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          resume_id: string;
          user_id: string;
          job_description?: string | null;
          job_id?: string | null;
          score: number;
          result: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          resume_id?: string;
          user_id?: string;
          job_description?: string | null;
          job_id?: string | null;
          score?: number;
          result?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      ai_usage: {
        Row: {
          id: number;
          user_id: string;
          kind: "analysis" | "generate" | "job_parse";
          created_at: string;
        };
        Insert: {
          id?: never;
          user_id?: string;
          kind: "analysis" | "generate" | "job_parse";
          created_at?: string;
        };
        Update: {
          id?: never;
          user_id?: string;
          kind?: "analysis" | "generate" | "job_parse";
          created_at?: string;
        };
        Relationships: [];
      };
      jobs: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          company: string | null;
          description: string;
          requirements: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          title: string;
          company?: string | null;
          description: string;
          requirements: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          company?: string | null;
          description?: string;
          requirements?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      resume_chunks: {
        Row: {
          id: number;
          resume_id: string;
          user_id: string;
          chunk_index: number;
          content: string;
          embedding: string;
        };
        Insert: {
          id?: never;
          resume_id: string;
          user_id?: string;
          chunk_index: number;
          content: string;
          /** pgvector literal, e.g. JSON.stringify(number[]) */
          embedding: string;
        };
        Update: {
          id?: never;
          resume_id?: string;
          user_id?: string;
          chunk_index?: number;
          content?: string;
          embedding?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      delete_own_account: {
        Args: Record<string, never>;
        Returns: undefined;
      };
      match_resume_chunks: {
        Args: {
          p_resume_id: string;
          query_embedding: string;
          match_count?: number;
        };
        Returns: {
          chunk_index: number;
          content: string;
          similarity: number;
        }[];
      };
    };
  };
}
