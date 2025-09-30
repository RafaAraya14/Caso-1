// src/types/supabase/database.types.ts
// Tipos generados para Supabase

export interface Database {
  public: {
    Tables: {
      coaches: {
        Row: {
          id: number;
          name: string;
          email: string;
          rating: number | null;
          specialties: string[] | null;
          is_available: boolean | null;
          sessions_today: number | null;
          bio: string | null;
          experience_years: number | null;
          tier: 'bronze' | 'silver' | 'gold' | 'platinum' | null;
          created_at: string | null;
          updated_at: string | null;
          profile_image_url: string | null;
          hourly_rate: number | null;
          total_sessions: number | null;
          languages: string[] | null;
          timezone: string | null;
        };
        Insert: {
          id?: number;
          name: string;
          email: string;
          rating?: number | null;
          specialties?: string[] | null;
          is_available?: boolean | null;
          sessions_today?: number | null;
          bio?: string | null;
          experience_years?: number | null;
          tier?: 'bronze' | 'silver' | 'gold' | 'platinum' | null;
          created_at?: string | null;
          updated_at?: string | null;
          profile_image_url?: string | null;
          hourly_rate?: number | null;
          total_sessions?: number | null;
          languages?: string[] | null;
          timezone?: string | null;
        };
        Update: {
          id?: number;
          name?: string;
          email?: string;
          rating?: number | null;
          specialties?: string[] | null;
          is_available?: boolean | null;
          sessions_today?: number | null;
          bio?: string | null;
          experience_years?: number | null;
          tier?: 'bronze' | 'silver' | 'gold' | 'platinum' | null;
          created_at?: string | null;
          updated_at?: string | null;
          profile_image_url?: string | null;
          hourly_rate?: number | null;
          total_sessions?: number | null;
          languages?: string[] | null;
          timezone?: string | null;
        };
      };
      sessions: {
        Row: {
          id: string;
          userid: string;
          coachid: number;
          createdat: string;
          status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
          duration: number;
          scheduled_at: string | null;
          completed_at: string | null;
          notes: string | null;
          rating: number | null;
          feedback: string | null;
          actual_duration: number | null;
          session_type: 'video' | 'audio' | 'chat' | null;
          specialty_focus: string | null;
        };
        Insert: {
          id?: string;
          userid: string;
          coachid: number;
          createdat?: string;
          status?: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
          duration?: number;
          scheduled_at?: string | null;
          completed_at?: string | null;
          notes?: string | null;
          rating?: number | null;
          feedback?: string | null;
          actual_duration?: number | null;
          session_type?: 'video' | 'audio' | 'chat' | null;
          specialty_focus?: string | null;
        };
        Update: {
          id?: string;
          userid?: string;
          coachid?: number;
          createdat?: string;
          status?: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
          duration?: number;
          scheduled_at?: string | null;
          completed_at?: string | null;
          notes?: string | null;
          rating?: number | null;
          feedback?: string | null;
          actual_duration?: number | null;
          session_type?: 'video' | 'audio' | 'chat' | null;
          specialty_focus?: string | null;
        };
      };
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          user_type: 'BasicUser' | 'PremiumUser' | 'Coach';
          has_active_subscription: boolean | null;
          sessions_remaining: number | null;
          created_at: string | null;
          updated_at: string | null;
          profile_image_url: string | null;
          phone: string | null;
          date_of_birth: string | null;
          timezone: string | null;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          user_type?: 'BasicUser' | 'PremiumUser' | 'Coach';
          has_active_subscription?: boolean | null;
          sessions_remaining?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
          profile_image_url?: string | null;
          phone?: string | null;
          date_of_birth?: string | null;
          timezone?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          user_type?: 'BasicUser' | 'PremiumUser' | 'Coach';
          has_active_subscription?: boolean | null;
          sessions_remaining?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
          profile_image_url?: string | null;
          phone?: string | null;
          date_of_birth?: string | null;
          timezone?: string | null;
        };
      };
      userpackages: {
        Row: {
          id: string;
          useridfk: string;
          creditsremaining: number | null;
          purchasedat: string | null;
          expires_at: string | null;
          package_type: 'basic' | 'premium' | 'pro' | null;
          initial_credits: number | null;
        };
        Insert: {
          id?: string;
          useridfk: string;
          creditsremaining?: number | null;
          purchasedat?: string | null;
          expires_at?: string | null;
          package_type?: 'basic' | 'premium' | 'pro' | null;
          initial_credits?: number | null;
        };
        Update: {
          id?: string;
          useridfk?: string;
          creditsremaining?: number | null;
          purchasedat?: string | null;
          expires_at?: string | null;
          package_type?: 'basic' | 'premium' | 'pro' | null;
          initial_credits?: number | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      increment_coach_sessions: {
        Args: {
          coach_id: string;
        };
        Returns: undefined;
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Tipos de utilidad para trabajar con las tablas
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

// Tipos específicos para las tablas principales
export type CoachRow = Tables<'coaches'>;
export type SessionRow = Tables<'sessions'>;
export type UserRow = Tables<'users'>;
export type UserPackageRow = Tables<'userpackages'>;

export type CoachInsert = Inserts<'coaches'>;
export type SessionInsert = Inserts<'sessions'>;
export type UserInsert = Inserts<'users'>;
export type UserPackageInsert = Inserts<'userpackages'>;