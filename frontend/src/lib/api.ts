export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export interface APIResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: unknown;
}

export interface Category {
  id: number;
  name: string;
  display_order: number;
  is_active: boolean;
}

export interface PortfolioImage {
  id: number;
  public_id: string;
  image_url: string;
  category_id: number;
  caption: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  edited_at: string;
}

export interface Service {
  id: number;
  title: string;
  description: string;
  includes: string;
  price: number;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  edited_at: string;
}

export type BookingStatus = "NEW" | "REVIEWED" | "RESPONDED";

export interface Booking {
  id: number;
  service_id: number | null;
  service_title?: string | null;
  name: string;
  email: string;
  phone: string | null;
  event_name: string | null;
  event_date: string | null;
  message: string | null;
  status: BookingStatus;
  admin_note?: string | null;
  reviewed_at?: string | null;
  created_at: string;
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("admin_token");
}

async function request<T = unknown>(
  path: string,
  options: RequestInit & { auth?: boolean } = {},
): Promise<APIResponse<T>> {
  const { auth, headers, ...rest } = options;
  const h: Record<string, string> = { ...(headers as Record<string, string>) };
  if (!(rest.body instanceof FormData) && rest.body && !h["Content-Type"]) {
    h["Content-Type"] = "application/json";
  }
  if (auth) {
    const t = getToken();
    if (t) h["Authorization"] = `Bearer ${t}`;
  }
  const res = await fetch(`${API_URL}${path}`, { ...rest, headers: h });
  const raw = (await res.json().catch(() => null)) as
    | (APIResponse<T> & { detail?: unknown; access_token?: string })
    | null;

  if (!res.ok) {
    const msg =
      (raw && typeof raw === "object" && "detail" in raw && typeof raw.detail === "string"
        ? raw.detail
        : raw && typeof raw === "object" && "message" in raw && typeof raw.message === "string"
          ? raw.message
          : null) || `Request failed (${res.status})`;
    throw new Error(msg);
  }

  // Wrapped shape: { success, message, data }
  if (raw && typeof raw === "object" && "success" in raw) {
    if (!raw.success) throw new Error(raw.message || `Request failed (${res.status})`);
    return raw as APIResponse<T>;
  }

  // Raw FastAPI shape: payload is the data
  return { success: true, message: "ok", data: raw as T };
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<{ token: string; expires_in: number }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  logout: () => request("/auth/logout", { method: "POST", auth: true }),

  // Categories
  listCategories: () => request<Category[]>("/categories"),
  createCategory: (name: string) =>
    request<Category>("/categories", {
      method: "POST",
      auth: true,
      body: JSON.stringify({ name }),
    }),
  updateCategory: (
    id: number,
    body: Partial<{ name: string; display_order: number; is_active: boolean }>,
  ) =>
    request<Category>(`/categories/${id}`, {
      method: "PUT",
      auth: true,
      body: JSON.stringify(body),
    }),
  deleteCategory: (id: number) =>
    request(`/categories/${id}`, { method: "DELETE", auth: true }),

  // Portfolio
  listImages: () => request<PortfolioImage[]>("/portfolio/images"),
  uploadImage: (file: File, category_id: number, caption?: string) => {
    const fd = new FormData();
    fd.append("image", file);
    fd.append("category_id", String(category_id));
    if (caption) fd.append("caption", caption);
    return request<PortfolioImage>("/portfolio/images", {
      method: "POST",
      auth: true,
      body: fd,
    });
  },
  updateImage: (
    id: number,
    body: Partial<{ category_id: number; caption: string; display_order: number; is_active: boolean }>,
  ) =>
    request<PortfolioImage>(`/portfolio/images/${id}`, {
      method: "PUT",
      auth: true,
      body: JSON.stringify(body),
    }),
  deleteImage: (id: number) =>
    request(`/portfolio/images/${id}`, { method: "DELETE", auth: true }),

  // Services
  listServices: () => request<Service[]>("/services"),
  createService: (body: {
    title: string;
    description: string;
    includes: string;
    price: number;
    image_url?: string | null;
  }) =>
    request<Service>("/services", {
      method: "POST",
      auth: true,
      body: JSON.stringify(body),
    }),
  updateService: (id: number, body: Partial<Service>) =>
    request<Service>(`/services/${id}`, {
      method: "PUT",
      auth: true,
      body: JSON.stringify(body),
    }),
  deleteService: (id: number) =>
    request(`/services/${id}`, { method: "DELETE", auth: true }),

  // Bookings
  publicBooking: (body: {
    service_id?: number | null;
    name: string;
    email: string;
    phone?: string | null;
    event_name?: string | null;
    event_date?: string | null;
    message?: string | null;
  }) =>
    request<Booking>("/bookings/public", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  listBookings: () => request<Booking[]>("/bookings", { auth: true }),
  updateBookingStatus: (
    id: number,
    status: BookingStatus,
    admin_note?: string,
  ) =>
    request<Booking>(`/bookings/${id}/status`, {
      method: "PUT",
      auth: true,
      body: JSON.stringify({ status, admin_note }),
    }),

  // Dashboard
  dashboard: () => request<Record<string, number>>("/dashboard", { auth: true }),
};
