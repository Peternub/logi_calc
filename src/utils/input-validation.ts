/**
 * Система валидации входных данных
 * Защита от XSS, SQL инъекций и других атак через валидацию пользовательского ввода
 */

// Типы валидации
type ValidationType = 
  | 'email' 
  | 'password' 
  | 'text' 
  | 'number' 
  | 'url' 
  | 'phone' 
  | 'date' 
  | 'html' 
  | 'sql'
  | 'json';

// Результат валидации
interface ValidationResult {
  isValid: boolean;
  sanitizedValue: string;
  errors: string[];
  warnings: string[];
}

// Конфигурация валидатора
interface ValidatorConfig {
  strictMode: boolean;
  allowHTML: boolean;
  maxLength: number;
  minLength: number;
  customPatterns: { [key: string]: RegExp };
}

// Валидатор входных данных
export class InputValidator {
  private config: ValidatorConfig;

  constructor(config: Partial<ValidatorConfig> = {}) {
    this.config = {
      strictMode: true,
      allowHTML: false,
      maxLength: 1000,
      minLength: 0,
      customPatterns: {},
      ...config
    };
  }

  // Основная функция валидации
  validate(value: string, type: ValidationType): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      sanitizedValue: value,
      errors: [],
      warnings: []
    };

    // Проверка на пустое значение
    if (!value || value.trim().length === 0) {
      result.errors.push('Значение не может быть пустым');
      result.isValid = false;
      return result;
    }

    // Проверка длины
    if (value.length > this.config.maxLength) {
      result.errors.push(`Значение слишком длинное (максимум ${this.config.maxLength} символов)`);
      result.isValid = false;
    }

    if (value.length < this.config.minLength) {
      result.errors.push(`Значение слишком короткое (минимум ${this.config.minLength} символов)`);
      result.isValid = false;
    }

    // Проверка на потенциально опасные символы
    result.sanitizedValue = this.sanitizeInput(value, type);

    // Специфичная валидация по типу
    switch (type) {
      case 'email':
        this.validateEmail(result);
        break;
      case 'password':
        this.validatePassword(result);
        break;
      case 'text':
        this.validateText(result);
        break;
      case 'number':
        this.validateNumber(result);
        break;
      case 'url':
        this.validateURL(result);
        break;
      case 'phone':
        this.validatePhone(result);
        break;
      case 'date':
        this.validateDate(result);
        break;
      case 'html':
        this.validateHTML(result);
        break;
      case 'sql':
        this.validateSQL(result);
        break;
      case 'json':
        this.validateJSON(result);
        break;
    }

    return result;
  }

  // Санитизация входных данных
  private sanitizeInput(value: string, type: ValidationType): string {
    let sanitized = value;

    // Удаление потенциально опасных символов
    if (!this.config.allowHTML && type !== 'html') {
      // Экранирование HTML тегов
      sanitized = sanitized
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
    }

    // Удаление потенциально опасных JavaScript кодов
    if (this.config.strictMode) {
      sanitized = sanitized
        .replace(/javascript:/gi, '')
        .replace(/vbscript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .replace(/<script[^>]*>.*?<\/script>/gi, '')
        .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '');
    }

    // Удаление SQL инъекций
    if (type !== 'sql') {
      sanitized = this.removeSQLInjection(sanitized);
    }

    return sanitized.trim();
  }

  // Удаление потенциальных SQL инъекций
  private removeSQLInjection(value: string): string {
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
      /('|('')|;|%|_|\*|\?)/g,
      /(\/\*.*?\*\/)/g,
      /(--.*$)/gm
    ];

    let sanitized = value;
    sqlPatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });

    return sanitized;
  }

  // Валидация email
  private validateEmail(result: ValidationResult): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(result.sanitizedValue)) {
      result.errors.push('Неверный формат email адреса');
      result.isValid = false;
    }

    // Проверка на потенциально опасные домены
    const suspiciousDomains = ['tempmail.', 'guerrillamail.', '10minutemail.'];
    const domain = result.sanitizedValue.split('@')[1];
    
    if (domain && suspiciousDomains.some(sus => domain.includes(sus))) {
      result.warnings.push('Использован временный email сервис');
    }
  }

  // Валидация пароля
  private validatePassword(result: ValidationResult): void {
    const password = result.sanitizedValue;
    
    if (password.length < 8) {
      result.errors.push('Пароль должен содержать минимум 8 символов');
      result.isValid = false;
    }

    if (!/[A-Z]/.test(password)) {
      result.errors.push('Пароль должен содержать хотя бы одну заглавную букву');
      result.isValid = false;
    }

    if (!/[a-z]/.test(password)) {
      result.errors.push('Пароль должен содержать хотя бы одну строчную букву');
      result.isValid = false;
    }

    if (!/\d/.test(password)) {
      result.errors.push('Пароль должен содержать хотя бы одну цифру');
      result.isValid = false;
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      result.warnings.push('Рекомендуется добавить специальные символы для усиления пароля');
    }

    // Проверка на распространенные пароли
    const commonPasswords = ['password', '123456', 'qwerty', 'admin', 'root'];
    if (commonPasswords.includes(password.toLowerCase())) {
      result.errors.push('Пароль слишком простой и небезопасный');
      result.isValid = false;
    }
  }

  // Валидация текста
  private validateText(result: ValidationResult): void {
    // Проверка на подозрительные паттерны
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /vbscript:/i,
      /onload=/i,
      /onerror=/i,
      /onclick=/i
    ];

    suspiciousPatterns.forEach(pattern => {
      if (pattern.test(result.sanitizedValue)) {
        result.errors.push('Обнаружен потенциально опасный код');
        result.isValid = false;
      }
    });
  }

  // Валидация числа
  private validateNumber(result: ValidationResult): void {
    const num = parseFloat(result.sanitizedValue);
    
    if (isNaN(num)) {
      result.errors.push('Значение должно быть числом');
      result.isValid = false;
    }

    // Проверка на SQL инъекции через числа
    if (/[;'"\\]/.test(result.sanitizedValue)) {
      result.errors.push('Обнаружены недопустимые символы в числовом значении');
      result.isValid = false;
    }
  }

  // Валидация URL
  private validateURL(result: ValidationResult): void {
    try {
      const url = new URL(result.sanitizedValue);
      
      // Проверка на допустимые протоколы
      const allowedProtocols = ['http:', 'https:'];
      if (!allowedProtocols.includes(url.protocol)) {
        result.errors.push('Недопустимый протокол URL');
        result.isValid = false;
      }

      // Проверка на подозрительные домены
      const suspiciousDomains = ['bit.ly', 'tinyurl.com', 'short.link'];
      if (suspiciousDomains.includes(url.hostname)) {
        result.warnings.push('Использован сервис сокращения ссылок');
      }

    } catch (error) {
      result.errors.push('Неверный формат URL');
      result.isValid = false;
    }
  }

  // Валидация телефона
  private validatePhone(result: ValidationResult): void {
    // Удаление всех символов кроме цифр и +
    const cleanPhone = result.sanitizedValue.replace(/[^\d+]/g, '');
    result.sanitizedValue = cleanPhone;

    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(cleanPhone)) {
      result.errors.push('Неверный формат номера телефона');
      result.isValid = false;
    }
  }

  // Валидация даты
  private validateDate(result: ValidationResult): void {
    const date = new Date(result.sanitizedValue);
    
    if (isNaN(date.getTime())) {
      result.errors.push('Неверный формат даты');
      result.isValid = false;
    }

    // Проверка на разумные пределы дат
    const currentYear = new Date().getFullYear();
    const year = date.getFullYear();
    
    if (year < 1900 || year > currentYear + 10) {
      result.warnings.push('Дата выходит за разумные пределы');
    }
  }

  // Валидация HTML
  private validateHTML(result: ValidationResult): void {
    if (!this.config.allowHTML) {
      result.errors.push('HTML не разрешен в данном поле');
      result.isValid = false;
      return;
    }

    // Список разрешенных тегов
    const allowedTags = ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li'];
    const tagRegex = /<(\/?[a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g;
    
    let match;
    while ((match = tagRegex.exec(result.sanitizedValue)) !== null) {
      const tag = match[1].replace('/', '').toLowerCase();
      if (!allowedTags.includes(tag)) {
        result.warnings.push(`Обнаружен потенциально небезопасный тег: ${tag}`);
      }
    }

    // Проверка на JavaScript в HTML
    if (/on\w+\s*=/gi.test(result.sanitizedValue)) {
      result.errors.push('Обнаружены JavaScript события в HTML');
      result.isValid = false;
    }
  }

  // Валидация SQL (для разработчиков)
  private validateSQL(result: ValidationResult): void {
    // Проверка на потенциально опасные SQL команды
    const dangerousCommands = [
      'DROP', 'DELETE', 'UPDATE', 'INSERT', 'ALTER', 
      'CREATE', 'EXEC', 'EXECUTE', 'SCRIPT'
    ];

    const upperValue = result.sanitizedValue.toUpperCase();
    dangerousCommands.forEach(cmd => {
      if (upperValue.includes(cmd)) {
        result.warnings.push(`Обнаружена потенциально опасная SQL команда: ${cmd}`);
      }
    });
  }

  // Валидация JSON
  private validateJSON(result: ValidationResult): void {
    try {
      JSON.parse(result.sanitizedValue);
    } catch (error) {
      result.errors.push('Неверный формат JSON');
      result.isValid = false;
    }
  }

  // Массовая валидация объекта
  validateObject(data: { [key: string]: any }, schema: { [key: string]: ValidationType }): { [key: string]: ValidationResult } {
    const results: { [key: string]: ValidationResult } = {};

    Object.keys(schema).forEach(key => {
      if (data[key] !== undefined) {
        results[key] = this.validate(String(data[key]), schema[key]);
      } else {
        results[key] = {
          isValid: false,
          sanitizedValue: '',
          errors: ['Поле обязательно для заполнения'],
          warnings: []
        };
      }
    });

    return results;
  }

  // Получение безопасного объекта данных
  getSanitizedObject(data: { [key: string]: any }, schema: { [key: string]: ValidationType }): { [key: string]: string } {
    const sanitized: { [key: string]: string } = {};
    const results = this.validateObject(data, schema);

    Object.keys(results).forEach(key => {
      if (results[key].isValid) {
        sanitized[key] = results[key].sanitizedValue;
      }
    });

    return sanitized;
  }

  // Проверка безопасности всего объекта
  isObjectSafe(data: { [key: string]: any }, schema: { [key: string]: ValidationType }): boolean {
    const results = this.validateObject(data, schema);
    return Object.values(results).every(result => result.isValid);
  }
}

// Создание валидатора по умолчанию
export const defaultValidator = new InputValidator({
  strictMode: true,
  allowHTML: false,
  maxLength: 10000,
  minLength: 1
});

// Быстрые функции валидации
export const validateEmail = (email: string): ValidationResult => 
  defaultValidator.validate(email, 'email');

export const validatePassword = (password: string): ValidationResult => 
  defaultValidator.validate(password, 'password');

export const validateText = (text: string): ValidationResult => 
  defaultValidator.validate(text, 'text');

export const validateNumber = (number: string): ValidationResult => 
  defaultValidator.validate(number, 'number');

export const validateURL = (url: string): ValidationResult => 
  defaultValidator.validate(url, 'url');

// Функция для санитизации входных данных в API
export function sanitizeAPIInput(data: any): any {
  if (typeof data === 'string') {
    return defaultValidator.validate(data, 'text').sanitizedValue;
  }
  
  if (typeof data === 'object' && data !== null) {
    const sanitized: any = {};
    Object.keys(data).forEach(key => {
      sanitized[key] = sanitizeAPIInput(data[key]);
    });
    return sanitized;
  }
  
  return data;
}

// Middleware для валидации API запросов
export function createValidationMiddleware(schema: { [key: string]: ValidationType }) {
  return (req: any, res: any, next: any) => {
    try {
      const validator = new InputValidator();
      const results = validator.validateObject(req.body, schema);
      
      const errors = Object.keys(results)
        .filter(key => !results[key].isValid)
        .map(key => ({ field: key, errors: results[key].errors }));

      if (errors.length > 0) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors
        });
      }

      // Добавляем санитизированные данные к запросу
      req.sanitizedBody = validator.getSanitizedObject(req.body, schema);
      next();
      
    } catch (error) {
      return res.status(500).json({
        error: 'Internal validation error'
      });
    }
  };
}

// Демонстрация использования
export function demonstrateValidation() {
  console.log('🛡️ Демонстрация системы валидации входных данных\n');

  const validator = new InputValidator();

  // Тестовые данные
  const testData = [
    { value: 'user@example.com', type: 'email' as ValidationType },
    { value: 'Password123!', type: 'password' as ValidationType },
    { value: '<script>alert("xss")</script>Обычный текст', type: 'text' as ValidationType },
    { value: 'https://example.com', type: 'url' as ValidationType },
    { value: '+7 (999) 123-45-67', type: 'phone' as ValidationType }
  ];

  testData.forEach(({ value, type }) => {
    console.log(`Тестирование: ${type} = "${value}"`);
    const result = validator.validate(value, type);
    
    console.log(`✅ Валидно: ${result.isValid}`);
    console.log(`🧹 Санитизировано: "${result.sanitizedValue}"`);
    
    if (result.errors.length > 0) {
      console.log(`❌ Ошибки: ${result.errors.join(', ')}`);
    }
    
    if (result.warnings.length > 0) {
      console.log(`⚠️ Предупреждения: ${result.warnings.join(', ')}`);
    }
    
    console.log('');
  });

  console.log('🎉 Демонстрация завершена!');
}

// Запуск демонстрации в Node.js окружении
if (typeof window === 'undefined') {
  demonstrateValidation();
}