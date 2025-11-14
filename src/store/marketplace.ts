import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Database } from '@/types/database'

// Типы из базы данных
type MarketplaceAccount = Database['public']['Tables']['marketplace_accounts']['Row']
type Product = Database['public']['Tables']['products']['Row']
type Sale = Database['public']['Tables']['sales']['Row']

// Фильтры для продуктов
interface ProductFilters {
  marketplace?: string
  status?: string
  category?: string
  search?: string
  priceMin?: number
  priceMax?: number
}

// Фильтры для продаж
interface SaleFilters {
  dateFrom?: string
  dateTo?: string
  marketplace?: string
  productId?: string
}

// Интерфейс состояния маркетплейсов
interface MarketplaceState {
  // Аккаунты маркетплейсов
  accounts: MarketplaceAccount[]
  selectedAccount: MarketplaceAccount | null
  
  // Продукты
  products: Product[]
  selectedProducts: string[]
  productFilters: ProductFilters
  
  // Продажи
  sales: Sale[]
  saleFilters: SaleFilters
  
  // Состояние загрузки
  loading: {
    accounts: boolean
    products: boolean
    sales: boolean
    sync: boolean
  }
  
  // Статистика синхронизации
  lastSync: {
    accounts: Date | null
    products: Date | null
    sales: Date | null
  }
  
  // Действия для аккаунтов
  setAccounts: (accounts: MarketplaceAccount[]) => void
  addAccount: (account: MarketplaceAccount) => void
  updateAccount: (id: string, updates: Partial<MarketplaceAccount>) => void
  removeAccount: (id: string) => void
  selectAccount: (account: MarketplaceAccount | null) => void
  
  // Действия для продуктов
  setProducts: (products: Product[]) => void
  addProduct: (product: Product) => void
  updateProduct: (id: string, updates: Partial<Product>) => void
  removeProduct: (id: string) => void
  selectProducts: (productIds: string[]) => void
  clearSelectedProducts: () => void
  setProductFilters: (filters: Partial<ProductFilters>) => void
  clearProductFilters: () => void
  
  // Действия для продаж
  setSales: (sales: Sale[]) => void
  addSale: (sale: Sale) => void
  setSaleFilters: (filters: Partial<SaleFilters>) => void
  clearSaleFilters: () => void
  
  // Действия для загрузки
  setLoading: (type: keyof MarketplaceState['loading'], loading: boolean) => void
  
  // Действия для синхронизации
  setLastSync: (type: keyof MarketplaceState['lastSync'], date: Date) => void
  
  // Вычисляемые данные
  getAccountsByMarketplace: (marketplace: string) => MarketplaceAccount[]
  getActiveAccounts: () => MarketplaceAccount[]
  getProductsByAccount: (accountId: string) => Product[]
  getSalesByDateRange: (start: Date, end: Date) => Sale[]
  getTotalSales: () => number
  getTotalProfit: () => number
}

// Создание хранилища состояния маркетплейсов
export const useMarketplaceStore = create<MarketplaceState>()(
  persist(
    (set, get) => ({
      // Начальные значения
      accounts: [],
      selectedAccount: null,
      products: [],
      selectedProducts: [],
      productFilters: {},
      sales: [],
      saleFilters: {},
      loading: {
        accounts: false,
        products: false,
        sales: false,
        sync: false
      },
      lastSync: {
        accounts: null,
        products: null,
        sales: null
      },

      // Действия для аккаунтов
      setAccounts: (accounts) => set({ accounts }),
      
      addAccount: (account) =>
        set((state) => ({
          accounts: [...state.accounts, account]
        })),
        
      updateAccount: (id, updates) =>
        set((state) => ({
          accounts: state.accounts.map((account) =>
            account.id === id ? { ...account, ...updates } : account
          )
        })),
        
      removeAccount: (id) =>
        set((state) => ({
          accounts: state.accounts.filter((account) => account.id !== id),
          selectedAccount: state.selectedAccount?.id === id ? null : state.selectedAccount
        })),
        
      selectAccount: (account) => set({ selectedAccount: account }),

      // Действия для продуктов
      setProducts: (products) => set({ products }),
      
      addProduct: (product) =>
        set((state) => ({
          products: [...state.products, product]
        })),
        
      updateProduct: (id, updates) =>
        set((state) => ({
          products: state.products.map((product) =>
            product.id === id ? { ...product, ...updates } : product
          )
        })),
        
      removeProduct: (id) =>
        set((state) => ({
          products: state.products.filter((product) => product.id !== id),
          selectedProducts: state.selectedProducts.filter((productId) => productId !== id)
        })),
        
      selectProducts: (productIds) => set({ selectedProducts: productIds }),
      clearSelectedProducts: () => set({ selectedProducts: [] }),
      
      setProductFilters: (filters) =>
        set((state) => ({
          productFilters: { ...state.productFilters, ...filters }
        })),
        
      clearProductFilters: () => set({ productFilters: {} }),

      // Действия для продаж
      setSales: (sales) => set({ sales }),
      
      addSale: (sale) =>
        set((state) => ({
          sales: [...state.sales, sale]
        })),
        
      setSaleFilters: (filters) =>
        set((state) => ({
          saleFilters: { ...state.saleFilters, ...filters }
        })),
        
      clearSaleFilters: () => set({ saleFilters: {} }),

      // Действия для загрузки
      setLoading: (type, loading) =>
        set((state) => ({
          loading: { ...state.loading, [type]: loading }
        })),

      // Действия для синхронизации
      setLastSync: (type, date) =>
        set((state) => ({
          lastSync: { ...state.lastSync, [type]: date }
        })),

      // Вычисляемые данные
      getAccountsByMarketplace: (marketplace) =>
        get().accounts.filter((account) => account.marketplace === marketplace),
        
      getActiveAccounts: () =>
        get().accounts.filter((account) => account.is_active),
        
      getProductsByAccount: (accountId) =>
        get().products.filter((product) => product.marketplace_account_id === accountId),
        
      getSalesByDateRange: (start, end) =>
        get().sales.filter((sale) => {
          const saleDate = new Date(sale.sale_date)
          return saleDate >= start && saleDate <= end
        }),
        
      getTotalSales: () =>
        get().sales.reduce((total, sale) => total + sale.price * sale.quantity, 0),
        
      getTotalProfit: () =>
        get().sales.reduce((total, sale) => total + sale.net_profit, 0)
    }),
    {
      name: 'logicalc-marketplace-state',
      partialize: (state) => ({
        productFilters: state.productFilters,
        saleFilters: state.saleFilters,
        selectedAccount: state.selectedAccount
      })
    }
  )
)