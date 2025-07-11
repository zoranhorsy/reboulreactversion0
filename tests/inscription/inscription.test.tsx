import axios from 'axios';

// Test de l'inscription frontend -> backend
describe('Test d\'inscription Frontend -> Backend Railway', () => {
  const API_URL = 'https://reboul-store-api-production.up.railway.app/api';

  beforeEach(() => {
    // Nettoyer les mocks avant chaque test
    jest.clearAllMocks();
  });

  it('devrait s\'inscrire avec succès sur Railway', async () => {
    const testUser = {
      username: 'testfrontend' + Date.now(),
      email: 'testfrontend' + Date.now() + '@example.com',
      password: 'motdepasse123'
    };

    try {
      // Simuler l'appel d'inscription depuis le frontend
      const response = await axios.post(`${API_URL}/auth/inscription`, testUser);

      // Vérifier que l'inscription a réussi
      expect(response.status).toBe(201);
      expect(response.data.message).toBe('Inscription réussie');
      expect(response.data.user.email).toBe(testUser.email);
      expect(response.data.user.username).toBe(testUser.username);
      expect(response.data.token).toBeDefined();
      expect(response.data.user.is_admin).toBe(false);

      console.log('✅ Inscription frontend réussie:', response.data.user);
    } catch (error) {
      console.error('❌ Erreur inscription frontend:', error.response?.data);
      throw error;
    }
  });

  it('devrait se connecter après inscription', async () => {
    const testUser = {
      username: 'testlogin' + Date.now(),
      email: 'testlogin' + Date.now() + '@example.com',  
      password: 'motdepasse123'
    };

    try {
      // 1. S'inscrire
      const inscriptionResponse = await axios.post(`${API_URL}/auth/inscription`, testUser);
      expect(inscriptionResponse.status).toBe(201);

      // 2. Se connecter avec les mêmes identifiants
      const loginResponse = await axios.post(`${API_URL}/auth/login`, {
        email: testUser.email,
        password: testUser.password
      });

      // Vérifier que la connexion a réussi
      expect(loginResponse.status).toBe(200);
      expect(loginResponse.data.message).toBe('Connexion réussie');
      expect(loginResponse.data.user.email).toBe(testUser.email);
      expect(loginResponse.data.token).toBeDefined();

      console.log('✅ Connexion après inscription réussie:', loginResponse.data.user);
    } catch (error) {
      console.error('❌ Erreur connexion frontend:', error.response?.data);
      throw error;
    }
  });

  it('devrait rejeter une inscription avec email invalide', async () => {
    const invalidUser = {
      username: 'testinvalid',
      email: 'email-invalide',
      password: 'motdepasse123'
    };

    try {
      await axios.post(`${API_URL}/auth/inscription`, invalidUser);
      // Si on arrive ici, le test a échoué
      throw new Error('L\'inscription devrait avoir échoué');
    } catch (error) {
      // Vérifier que l'erreur est bien due à l'email invalide
      expect(error.response.status).toBe(400);
      console.log('✅ Email invalide correctement rejeté:', error.response.data);
    }
  });

  it('devrait rejeter une inscription avec mot de passe trop court', async () => {
    const invalidUser = {
      username: 'testshort',
      email: 'testshort@example.com',
      password: '123' // Trop court
    };

    try {
      await axios.post(`${API_URL}/auth/inscription`, invalidUser);
      throw new Error('L\'inscription devrait avoir échoué');
    } catch (error) {
      expect(error.response.status).toBe(400);
      console.log('✅ Mot de passe trop court correctement rejeté:', error.response.data);
    }
  });

  it('devrait rejeter une inscription avec email déjà utilisé', async () => {
    const testUser = {
      username: 'testduplicate1',
      email: 'duplicate@example.com',
      password: 'motdepasse123'
    };

    try {
      // 1. Première inscription
      await axios.post(`${API_URL}/auth/inscription`, testUser);

      // 2. Tentative de deuxième inscription avec le même email
      const duplicateUser = {
        username: 'testduplicate2',
        email: 'duplicate@example.com', // Même email
        password: 'motdepasse123'
      };

      await axios.post(`${API_URL}/auth/inscription`, duplicateUser);
      throw new Error('L\'inscription devrait avoir échoué');
    } catch (error) {
      if (error.message === 'L\'inscription devrait avoir échoué') {
        throw error;
      }
      expect(error.response.status).toBe(400);
      console.log('✅ Email dupliqué correctement rejeté:', error.response.data);
    }
  });
});

// Test de la logique d'authentification du contexte
describe('Logique AuthContext avec Railway', () => {
  it('devrait simuler la fonction register du contexte', async () => {
    const API_URL = 'https://reboul-store-api-production.up.railway.app/api';
    
    // Simuler la fonction register du contexte AuthContext
    const mockRegister = async (username: string, email: string, password: string) => {
      try {
        const response = await axios.post(`${API_URL}/auth/inscription`, {
          username,
          email,
          password,
        });

        const { token } = response.data;
        
        // Simuler le stockage du token (comme dans AuthContext)
        if (typeof window !== 'undefined') {
          localStorage.setItem('test_token', token);
        }

        return response.data;
      } catch (error) {
        throw error;
      }
    };

    const testUser = {
      username: 'testcontext' + Date.now(),
      email: 'testcontext' + Date.now() + '@example.com',
      password: 'motdepasse123'
    };

    const result = await mockRegister(testUser.username, testUser.email, testUser.password);

    expect(result.message).toBe('Inscription réussie');
    expect(result.user.email).toBe(testUser.email);
    expect(result.token).toBeDefined();

    console.log('✅ Fonction register du contexte fonctionne:', result.user);
  });
}); 