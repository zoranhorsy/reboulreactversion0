import config from '../config';

export interface CollectionCarousel {
  id: number;
  name: string;
  description: string;
  image_url: string;
  link_url: string;
  badge?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCollectionCarouselData {
  name: string;
  description: string;
  image_url: string;
  link_url: string;
  badge?: string;
  sort_order?: number;
}

export interface UpdateCollectionCarouselData {
  name?: string;
  description?: string;
  image_url?: string;
  link_url?: string;
  badge?: string;
  sort_order?: number;
  is_active?: boolean;
}

class CollectionsCarouselAPI {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${config.urls.api}/collections-carousel`;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    return response.json();
  }

  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // Public methods (no auth required)
  
  /**
   * Récupère toutes les collections actives du carousel
   */
  async fetchCollections(): Promise<CollectionCarousel[]> {
    return this.makeRequest<CollectionCarousel[]>('');
  }

  /**
   * Récupère une collection par son ID
   */
  async fetchCollectionById(id: number): Promise<CollectionCarousel> {
    return this.makeRequest<CollectionCarousel>(`/${id}`);
  }

  // Admin methods (auth required)
  
  /**
   * Crée une nouvelle collection (admin only)
   */
  async createCollection(
    data: CreateCollectionCarouselData, 
    token: string
  ): Promise<CollectionCarousel> {
    return this.makeRequest<CollectionCarousel>('', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  }

  /**
   * Met à jour une collection (admin only)
   */
  async updateCollection(
    id: number, 
    data: UpdateCollectionCarouselData, 
    token: string
  ): Promise<CollectionCarousel> {
    return this.makeRequest<CollectionCarousel>(`/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  }

  /**
   * Supprime une collection (admin only)
   */
  async deleteCollection(id: number, token: string): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>(`/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  /**
   * Change le statut actif/inactif d'une collection (admin only)
   */
  async toggleCollectionStatus(
    id: number, 
    token: string
  ): Promise<CollectionCarousel> {
    return this.makeRequest<CollectionCarousel>(`/${id}/toggle-status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }
}

// Instance singleton
export const collectionsCarouselAPI = new CollectionsCarouselAPI();

// Export des méthodes principales pour faciliter l'utilisation
export const fetchCollections = () => collectionsCarouselAPI.fetchCollections();
export const fetchCollectionById = (id: number) => collectionsCarouselAPI.fetchCollectionById(id);
