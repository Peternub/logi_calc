@echo off
chcp 65001
echo y | python "c:\Users\HUAWEI\Documents\LogiCalc\market_parser.py\wb_full_parser.py.txt" --url "https://www.wildberries.ru/catalog/parfyeriya-i-kosmetika/ukhod-za-litsom/tonizatory" --category "Парфюмерия и косметика/Уход за лицом/Тонизирующие средства" --limit 5
pause