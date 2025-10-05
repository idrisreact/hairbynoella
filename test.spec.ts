import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { ProductList } from './ProductList';

// Mock fetch globally
global.fetch = jest.fn();

describe('ProductList', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('displays loading state initially', () => {
    fetch.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(<ProductList />);
    
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText(/loading products/i)).toBeInTheDocument();
  });

  test('displays products when fetch succeeds', async () => {
    const mockProducts = {
      products: [
        { id: 1, name: 'Laptop', price: 999, inStock: true, image: '/laptop.jpg' },
        { id: 2, name: 'Mouse', price: 29, inStock: false, image: '/mouse.jpg' }
      ]
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockProducts,
    });

    render(<ProductList />);

    await waitFor(() => {
      expect(screen.getByText('Laptop')).toBeInTheDocument();
      expect(screen.getByText('Mouse')).toBeInTheDocument();
      expect(screen.getByText('$999')).toBeInTheDocument();
      expect(screen.getByText('Out of Stock')).toBeInTheDocument();
    });

    expect(screen.getByRole('list', { name: /available products/i })).toBeInTheDocument();
  });

  test('displays error state when fetch fails', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));

    render(<ProductList />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/unable to load products/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry loading products/i })).toBeInTheDocument();
    });
  });

  test('retry button refetches products', async () => {
    fetch
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ products: [{ id: 1, name: 'Laptop', price: 999, inStock: true }] }),
      });

    render(<ProductList />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /retry/i }));

    await waitFor(() => {
      expect(screen.getByText('Laptop')).toBeInTheDocument();
    });

    expect(fetch).toHaveBeenCalledTimes(2);
  });
});