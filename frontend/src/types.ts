export type Farmer = {
  id: string;
  name: string;
  phone_number: string;
  region?: string;
  district?: string;
  pin?: string;
  created_at?: string;
  updated_at?: string;
  };
  
  export type Device = {
  id: string;
  device_id: string;
  sim_number?: string;
  farmer_id?: string;
  api_token?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  };
  
  export type Recommendation = {
  id: string;
  recommendation_type: string;
  content: string;
  crops_suggested?: any;
  created_at?: string;
  };
  
  export type SoilTest = {
  id: string;
  device_id?: string;
  farmer_id?: string;
  timestamp: string;
  latitude?: number;
  longitude?: number;
  ph?: number;
  moisture?: number;
  temperature?: number;
  ec?: number;
  nitrogen?: number;
  phosphorus?: number;
  potassium?: number;
  location_name?: string;
  sample_number?: number;
  sample_depth_cm?: number;
  recommendations?: Recommendation[];
  created_at?: string;
  };
  
export type SMSLog = {
  id: string;
  farmer_id?: string;
  direction: "inbound" | "outbound";
  phone_number: string;
  message: string;
  status?: string;
  telerivet_id?: string;
  created_at?: string;
  };

export type AdminUser = {
  id: string;
  email: string;
  is_active: boolean;
  created_at: string;
};

export type AuthResponse = {
  access_token: string;
  token_type: "bearer";
  user: AdminUser;
};
