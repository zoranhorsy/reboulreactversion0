import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Composant simple pour tester la logique du panier
const SimpleCartLogic = ({ 
  isAuthenticated, 
  onPayment, 
  onShowLogin 
}: {
  isAuthenticated: boolean;
  onPayment: () => void;
  onShowLogin: () => void;
}) => {
  const handlePaymentClick = () => {
    if (isAuthenticated) {
      onPayment();
    } else {
      onShowLogin();
    }
  };

  return (
    <div>
      <h1>Mon Panier</h1>
      <p>Statut: {isAuthenticated ? 'Connecté' : 'Non connecté'}</p>
      <button onClick={handlePaymentClick}>
        {isAuthenticated ? 'Payer avec Stripe' : 'Se connecter et payer'}
      </button>
    </div>
  );
};

// Tests simples pour la logique du panier
describe('Logique simple du panier', () => {
  it('devrait afficher "Connecté" quand l\'utilisateur est authentifié', () => {
    render(
      <SimpleCartLogic 
        isAuthenticated={true} 
        onPayment={() => {}} 
        onShowLogin={() => {}} 
      />
    );

    expect(screen.getByText('Connecté')).toBeInTheDocument();
    expect(screen.getByText('Payer avec Stripe')).toBeInTheDocument();
  });

  it('devrait afficher "Non connecté" quand l\'utilisateur n\'est pas authentifié', () => {
    render(
      <SimpleCartLogic 
        isAuthenticated={false} 
        onPayment={() => {}} 
        onShowLogin={() => {}} 
      />
    );

    expect(screen.getByText('Non connecté')).toBeInTheDocument();
    expect(screen.getByText('Se connecter et payer')).toBeInTheDocument();
  });

  it('devrait appeler onPayment quand l\'utilisateur est connecté et clique sur le bouton', () => {
    const mockOnPayment = jest.fn();
    const mockOnShowLogin = jest.fn();

    render(
      <SimpleCartLogic 
        isAuthenticated={true} 
        onPayment={mockOnPayment} 
        onShowLogin={mockOnShowLogin} 
      />
    );

    const button = screen.getByText('Payer avec Stripe');
    fireEvent.click(button);

    expect(mockOnPayment).toHaveBeenCalled();
    expect(mockOnShowLogin).not.toHaveBeenCalled();
  });

  it('devrait appeler onShowLogin quand l\'utilisateur n\'est pas connecté et clique sur le bouton', () => {
    const mockOnPayment = jest.fn();
    const mockOnShowLogin = jest.fn();

    render(
      <SimpleCartLogic 
        isAuthenticated={false} 
        onPayment={mockOnPayment} 
        onShowLogin={mockOnShowLogin} 
      />
    );

    const button = screen.getByText('Se connecter et payer');
    fireEvent.click(button);

    expect(mockOnShowLogin).toHaveBeenCalled();
    expect(mockOnPayment).not.toHaveBeenCalled();
  });
});

// Tests pour les fonctions pures (logique métier)
describe('Fonctions de calcul du panier', () => {
  const calculateTotal = (items: { price: number; quantity: number }[]) => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateShipping = (total: number) => {
    return total >= 100 ? 0 : 5.90;
  };

  it('devrait calculer le total correctement', () => {
    const items = [
      { price: 50, quantity: 2 },
      { price: 25, quantity: 1 }
    ];

    const total = calculateTotal(items);
    
    expect(total).toBe(125); // 50*2 + 25*1 = 125
  });

  it('devrait calculer la livraison gratuite pour les commandes >= 100€', () => {
    const shipping = calculateShipping(100);
    
    expect(shipping).toBe(0);
  });

  it('devrait calculer les frais de livraison pour les commandes < 100€', () => {
    const shipping = calculateShipping(50);
    
    expect(shipping).toBe(5.90);
  });

  it('devrait calculer le total avec TVA', () => {
    const calculateTotalWithTax = (subtotal: number, taxRate: number = 0.2) => {
      return subtotal * (1 + taxRate);
    };

    const totalWithTax = calculateTotalWithTax(100);
    
    expect(totalWithTax).toBe(120); // 100 + 20% = 120
  });
});

// Tests pour la validation des données
describe('Validation du panier', () => {
  const validateCart = (items: any[]) => {
    if (items.length === 0) {
      return { isValid: false, error: 'Panier vide' };
    }

    for (const item of items) {
      if (item.quantity <= 0) {
        return { isValid: false, error: 'Quantité invalide' };
      }
      if (item.price <= 0) {
        return { isValid: false, error: 'Prix invalide' };
      }
    }

    return { isValid: true, error: null };
  };

  it('devrait valider un panier correct', () => {
    const items = [
      { id: '1', name: 'Produit 1', price: 50, quantity: 2 }
    ];

    const result = validateCart(items);
    
    expect(result.isValid).toBe(true);
    expect(result.error).toBeNull();
  });

  it('devrait rejeter un panier vide', () => {
    const items: any[] = [];

    const result = validateCart(items);
    
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Panier vide');
  });

  it('devrait rejeter un article avec quantité invalide', () => {
    const items = [
      { id: '1', name: 'Produit 1', price: 50, quantity: 0 }
    ];

    const result = validateCart(items);
    
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Quantité invalide');
  });

  it('devrait rejeter un article avec prix invalide', () => {
    const items = [
      { id: '1', name: 'Produit 1', price: -10, quantity: 1 }
    ];

    const result = validateCart(items);
    
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Prix invalide');
  });
}); 