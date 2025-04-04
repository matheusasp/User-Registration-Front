
export interface User {
    id: number;
    name: string | null;
    email: string;
    birth_date: string | null;
    cpf: string | null;
    google_token: string | null;
    created_at: string;
    updated_at: string;
  }
  
  export interface UserFilters {
    name?: string;
    cpf?: string;
  }
  
  export interface PaginatedResponse<T> {
    current_page: number;
    data: T[];
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
  }