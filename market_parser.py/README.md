# Wildberries Parser с антидетектом

Этот парсер Wildberries включает в себя продвинутые меры для обхода защиты от ботов:

## Антидетект-меры

1. **Ротация User-Agent и Referer** - каждый запрос использует случайные заголовки
2. **Поддержка прокси** - возможность использовать список прокси с автоматической ротацией
3. **Случайные паузы** - паузы между запросами для имитации человеческого поведения
4. **Обработка ошибки 498** - автоматическая смена прокси при обнаружении блокировки

## Использование

### Базовый запуск:
```bash
python wb_full_parser.py --url "https://www.wildberries.ru/catalog/elektronika/telefony" --category "Электроника/Телефоны" --limit 50
```

### Запуск с прокси:
```bash
python wb_full_parser.py --url "https://www.wildberries.ru/catalog/elektronika/telefony" --category "Электроника/Телефоны" --proxies-file proxies.json
```

## Формат файла прокси

Создайте файл `proxies.json` со следующей структурой:

```json
[
  {
    "http": "http://user:pass@proxy1.example.com:8080",
    "https": "https://user:pass@proxy1.example.com:8080"
  },
  {
    "http": "http://user:pass@proxy2.example.com:8080",
    "https": "https://user:pass@proxy2.example.com:8080"
  }
]
```

## Интеграция с TypeScript

В TypeScript-сервисе автоматически используется файл прокси по умолчанию (`market_parser.py/proxies.json`), если он существует.
Также можно указать свой файл через API:

```typescript
const response = await fetch('/api/marketplace-accounts/parse', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    account_id: accountId,
    url: "https://www.wildberries.ru/catalog/...",
    category: "Категория",
    limit: 50,
    proxies_file: "path/to/proxies.json" // Опционально
  }),
})
```

## Рекомендации

1. Используйте надежные прокси с ротацией IP
2. Не устанавливайте слишком маленькие паузы между запросами
3. Избегайте парсинга больших объемов данных за короткий промежуток времени
4. Регулярно обновляйте список User-Agent