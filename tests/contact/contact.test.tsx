import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Contact from '@/app/contact/page';

// Mock du toast pour intercepter l'appel
jest.mock('@/components/ui/use-toast', () => ({
  toast: jest.fn(),
}));

const { toast } = require('@/components/ui/use-toast');

describe('Page Contact', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn() as jest.Mock;
  });

  it('affiche le formulaire de contact', () => {
    render(<Contact />);
    expect(screen.getByLabelText(/Nom/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Message/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Envoyer/i })).toBeInTheDocument();
  });

  it('envoie le formulaire et affiche le toast de succès', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });
    render(<Contact />);
    fireEvent.change(screen.getByLabelText(/Nom/i), { target: { value: 'Jean' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'jean@example.com' } });
    fireEvent.change(screen.getByLabelText(/Message/i), { target: { value: 'Bonjour' } });
    fireEvent.click(screen.getByRole('button', { name: /Envoyer/i }));
    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Message envoyé',
          description: expect.stringContaining('répondrons'),
        })
      );
    });
    expect(screen.getByLabelText(/Nom/i)).toHaveValue('');
    expect(screen.getByLabelText(/Email/i)).toHaveValue('');
    expect(screen.getByLabelText(/Message/i)).toHaveValue('');
  });

  it('affiche le toast d\'erreur si l\'API échoue', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false });
    render(<Contact />);
    fireEvent.change(screen.getByLabelText(/Nom/i), { target: { value: 'Jean' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'jean@example.com' } });
    fireEvent.change(screen.getByLabelText(/Message/i), { target: { value: 'Bonjour' } });
    fireEvent.click(screen.getByRole('button', { name: /Envoyer/i }));
    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Erreur',
          description: expect.stringContaining('erreur'),
        })
      );
    });
    // Les champs ne doivent PAS être réinitialisés
    expect(screen.getByLabelText(/Nom/i)).toHaveValue('Jean');
    expect(screen.getByLabelText(/Email/i)).toHaveValue('jean@example.com');
    expect(screen.getByLabelText(/Message/i)).toHaveValue('Bonjour');
  });
}); 