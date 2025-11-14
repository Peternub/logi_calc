#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
test_wb_simple.py
Простой тестовый скрипт для проверки работы с Wildberries
"""

import requests
from bs4 import BeautifulSoup
import time
import random
import pandas as pd

# User agents для имитации браузера
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
]

def get_random_headers():
    return {
        "User-Agent": random.choice(USER_AGENTS),
        "Accept-Language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
    }

def test_wb_access():
    """Тест доступа к Wildberries"""
    print("Тест доступа к Wildberries...")
    
    # Пробуем получить главную страницу
    try:
        headers = get_random_headers()
        response = requests.get("https://www.wildberries.ru", headers=headers, timeout=10)
        print(f"Главная страница: {response.status_code}")
        
        if response.status_code == 200:
            print("✓ Доступ к Wildberries получен")
            return True
        else:
            print(f"✗ Ошибка доступа: {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ Ошибка подключения: {e}")
        return False

def search_rive_gauche():
    """Поиск товаров Рив Гош"""
    print("\nПоиск товаров Рив Гош...")
    
    # URL для поиска "Рив Гош"
    search_url = "https://search.wb.ru/exactmatch/ru/male/v4/search?appType=1&couponsGeo=12,3,18,15,21&curr=rub&dest=-1029256,-102269,-1278703,-1255563&emp=0&lang=ru&locale=ru&pricemarginCoeff=1.0&query=%D0%A0%D0%B8%D0%B2+%D0%93%D0%BE%D1%88&reg=0&regions=68,64,83,4,38,80,33,70,82,86,75,30,69,22,66,31,40,1,48&resultset=catalog&sort=popular&spp=0&suppressSpellcheck=false"
    
    try:
        headers = get_random_headers()
        response = requests.get(search_url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print(f"Найдено товаров: {len(data.get('data', {}).get('products', []))}")
            
            # Показываем первые несколько товаров
            products = data.get('data', {}).get('products', [])[:5]
            for product in products:
                print(f"- {product.get('name', 'Без названия')} ({product.get('id', 'N/A')})")
            
            return True
        else:
            print(f"Ошибка поиска: {response.status_code}")
            return False
    except Exception as e:
        print(f"Ошибка поиска: {e}")
        return False

def main():
    print("Тестовый скрипт для Wildberries")
    print("=" * 40)
    
    # Тест доступа
    if not test_wb_access():
        return
    
    # Поиск Рив Гош
    search_rive_gauche()
    
    print("\nТест завершен")

if __name__ == "__main__":
    main()