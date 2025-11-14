import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProductForm from '@/components/products/ProductForm';

// Мокаем хуки и зависимости
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id' },
    isAuthenticated: true
  })
}));

describe('ProductForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  const defaultProps = {
    onSubmit: mockOnSubmit,
    onCancel: mockOnCancel,
    isLoading: false
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('должен отображать форму создания продукта', () => {
    render(<ProductForm {...defaultProps} />);
    
    expect(screen.getByLabelText(/название товара/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/артикул/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/цена/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/описание/i)).toBeInTheDocument();
  });

  it('должен отображать данные существующего продукта при редактировании', () => {
    const existingProduct = {
      id: '1',
      name: 'Тестовый товар',
      sku: 'TEST-001',
      price: 1000,
      description: 'Описание товара'
    };

    render(<ProductForm {...defaultProps} product={existingProduct} />);
    
    expect(screen.getByDisplayValue('Тестовый товар')).toBeInTheDocument();
    expect(screen.getByDisplayValue('TEST-001')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1000')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Описание товара')).toBeInTheDocument();
  });

  it('должен валидировать обязательные поля', async () => {
    render(<ProductForm {...defaultProps} />);
    
    const submitButton = screen.getByRole('button', { name: /сохранить/i });
    fireEvent.click(submitButton);

    // Проверяем, что onSubmit не был вызван без заполнения обязательных полей
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('должен вызывать onSubmit с корректными данными', async () => {
    render(<ProductForm {...defaultProps} />);
    
    fireEvent.change(screen.getByLabelText(/название товара/i), {
      target: { value: 'Новый товар' }
    });
    fireEvent.change(screen.getByLabelText(/артикул/i), {
      target: { value: 'NEW-001' }
    });
    fireEvent.change(screen.getByLabelText(/цена/i), {
      target: { value: '2000' }
    });

    fireEvent.click(screen.getByRole('button', { name: /сохранить/i }));

    expect(mockOnSubmit).toHaveBeenCalledWith({
      name: 'Новый товар',
      sku: 'NEW-001',
      price: 2000,
      description: ''
    });
  });

  it('должен вызывать onCancel при нажатии отмены', () => {
    render(<ProductForm {...defaultProps} />);
    
    fireEvent.click(screen.getByRole('button', { name: /отмена/i }));
    
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('должен показывать состояние загрузки', () => {
    render(<ProductForm {...defaultProps} isLoading={true} />);
    
    expect(screen.getByRole('button', { name: /сохранение/i })).toBeDisabled();
  });
});