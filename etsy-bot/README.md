# Etsy Bot v2.0 - Natural Human Behavior Edition

Selenium tabanlı, listing ID hedefli, tamamen doğal insan davranışları sergileyen Etsy engagement botu.

## 🎯 Özellikler

- ✅ **Listing ID Hedefleme**: Belirli ürünleri (listing ID) hedefleyerek favorileme ve sepete ekleme
- ✅ **Çoklu Keyword Stratejisi**: Bir ürün için birden fazla keyword ile arama yapma
- ✅ **Doğal İnsan Davranışları**:
  - Rastgele scroll hareketleri
  - Ürün görsellerine bakma ve hover
  - Açıklama okuma simülasyonu
  - Yorumları kontrol etme
  - Satıcı bilgilerini inceleme
  - Benzer ürünlere göz atma (decoy)
  - Her seferinde farklı davranış paterni
- ✅ **Multi-Account Desteği**: Email listesi ile birden fazla hesap
- ✅ **Proxy Rotasyonu**: Her session için farklı proxy
- ✅ **Mobil Cihaz Simülasyonu**: 5 farklı mobil cihaz (iPhone, Samsung, Pixel)
- ✅ **Anti-Detection**: Gelişmiş bot tespit önleme teknikleri
- ✅ **Akıllı Bekleme Süreleri**: Rastgele, insan benzeri gecikmeler

## 📁 Proje Yapısı

```
etsy-bot/
├── main.py                    # Ana çalıştırma scripti
├── requirements.txt           # Python bağımlılıkları
├── run.sh / run.bat          # Hızlı başlatma scriptleri
├── .env.example              # Örnek çevre değişkenleri
├── .gitignore                # Git ignore kuralları
├── config/                   # Konfigürasyon dosyaları
│   ├── emails.txt           # Email:password listesi
│   ├── listings.txt         # Listing ID:keywords listesi (YENİ!)
│   └── proxies.txt          # Proxy listesi (opsiyonel)
├── modules/                  # Ana modüller
│   ├── etsy_login.py        # Etsy login işlemleri
│   └── etsy_actions.py      # Listing arama, favorileme, sepet
└── utils/                    # Yardımcı araçlar
    ├── config_loader.py     # Config dosya yönetimi
    ├── driver_manager.py    # WebDriver ve proxy yönetimi
    ├── helpers.py           # Yardımcı fonksiyonlar
    └── human_behavior.py    # İnsani davranış simülasyonu (YENİ!)
```

## 🚀 Kurulum

### 1. Gereksinimler

- Python 3.8+
- Chrome tarayıcı
- İnternet bağlantısı

### 2. Bağımlılıkları Yükleyin

```bash
cd etsy-bot
pip install -r requirements.txt
```

veya sanal ortam ile:

```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows
pip install -r requirements.txt
```

## ⚙️ Konfigürasyon

### 1. Email Listesi (`config/emails.txt`)

Her satıra bir email:password formatında:

```
user1@example.com:password123
user2@example.com:password456
user3@example.com:password789
```

### 2. Listing Listesi (`config/listings.txt`) - ⭐ YENİ FORMAT

Her satıra bir listing ID ve o listing'i bulmak için kullanılacak keywordler:

```
# Format: listing_id:keyword1,keyword2,keyword3

# Örnek 1: Wolf pendant
1802588667:wolf pendant,nordic wolf,fenrir necklace,viking wolf jewelry

# Örnek 2: Vintage lamp
1234567890:vintage lamp,retro light,desk lamp,antique lighting

# Örnek 3: Handmade bracelet
9876543210:handmade bracelet,silver bracelet,custom jewelry,artisan bracelet
```

**Nasıl Çalışır?**
- Bot her keyword ile sırayla arama yapar
- Arama sonuçlarında belirtilen listing ID'yi arar
- Listing bulununca favoriler ve sepete ekler
- Her seferinde tamamen doğal, rastgele davranışlar sergiler

### 3. Proxy Listesi (`config/proxies.txt`) - Opsiyonel

```
# Format: ip:port veya ip:port:username:password
123.45.67.89:8080
98.76.54.32:3128:user:pass
```

## 🎮 Kullanım

### Temel Kullanım

```bash
python main.py
```

### Headless Mod (Arka Planda)

```bash
python main.py --headless
```

### Hızlı Başlatma Scriptleri

```bash
# Linux/Mac
./run.sh

# Windows
run.bat
```

### Özel Config Klasörü

```bash
python main.py --config /path/to/custom/config
```

### Yardım

```bash
python main.py --help
```

## 🤖 Bot Nasıl Çalışır?

### İşlem Akışı

1. **Başlangıç**: Config dosyalarını yükle
2. **Her Email Hesabı İçin**:
   - Rastgele proxy seç (varsa)
   - Rastgele mobil cihaz simülasyonu yap
   - Chrome tarayıcıyı aç
   - Etsy'e giriş yap

3. **Her Listing İçin**:
   - Keyword listesinden sırayla dene
   - Keyword ile arama yap
   - Ana sayfada biraz gez (rastgele)
   - Arama sonuçlarında scroll yaparak listing'i ara
   - Bazen diğer ürünlere de bak (decoy)
   - Listing bulununca tıkla

4. **Listing Sayfasında**:
   - Görsellere bak, hover yap
   - Bazen görseli büyüt
   - Aşağı kaydırarak açıklamayı oku
   - Bazen yorumları kontrol et
   - Bazen satıcı bilgilerine bak
   - **Her seferinde farklı davranış sergilenir!**
   - Favorilere ekle
   - Sepete ekle

5. **Sonraki Listing'e Geç**: 5-15 saniye bekle
6. **Çıkış**: Hesaptan çık, tarayıcıyı kapat
7. **Sonraki Hesaba Geç**: 10-20 saniye bekle

### İnsani Davranışlar

Bot aşağıdaki doğal davranışları sergiler:

- 📜 **Rastgele Scroll**: Her seferinde farklı miktarda ve hızda
- 🖼️ **Görsel İnceleme**: Ürün görsellerine bakma, hover yapma
- 📖 **Okuma Simülasyonu**: Açıklamayı okuyormuş gibi scroll
- ⭐ **Yorum Kontrolü**: Bazen yorumları okuma
- 👤 **Satıcı İnceleme**: Bazen satıcı bilgilerine bakma
- 🔍 **Decoy Davranış**: Bazen diğer ürünlere göz atma
- ⏱️ **Değişken Bekleme**: Her işlem arası farklı bekleme süreleri
- 🖱️ **Mouse Hareketi**: Doğal mouse hareketleri simülasyonu

## 📱 Mobil Cihaz Simülasyonu

Bot her session için rastgele bir mobil cihaz seçer:

- iPhone 12 Pro
- iPhone 13
- Samsung Galaxy S21
- Samsung Galaxy S22
- Google Pixel 6

Her cihazın gerçek user agent, ekran boyutu ve pixel ratio değerleri kullanılır.

## 🔒 Güvenlik ve Önemli Notlar

### ⚠️ Uyarılar

1. **Etsy Kullanım Şartları**: Bu bot, Etsy'nin kullanım şartlarına aykırı olabilir. Kendi riskinizle kullanın.
2. **Hesap Güvenliği**: Hesaplarınız askıya alınabilir veya yasaklanabilir.
3. **Rate Limiting**: Çok fazla istek gönderirseniz IP adresiniz engellenebilir.
4. **Proxy Kullanımı**: Güvenilir ve legal proxy servisleri kullanın.

### 🛡️ Öneriler

- **Test Hesapları Kullanın**: Ana hesaplarınızı kullanmayın
- **Az Sayıda Başlayın**: İlk başta 1-2 hesap ve listing ile test edin
- **Proxy Kullanın**: Mümkünse güvenilir proxy servisleri kullanın
- **Makul Sınırlar**: Günde 5-10'dan fazla listing işlemeyin
- **Bekleme Süreleri**: Bot'un bekleme sürelerini azaltmayın

### 🔐 Git Güvenliği

Config dosyalarınız `.gitignore`'da olduğu için Git'e eklenmez:

```gitignore
config/emails.txt
config/listings.txt
config/proxies.txt
```

## 🐛 Sorun Giderme

### Chrome Driver Hatası

```bash
pip install --upgrade webdriver-manager
```

### Timeout Hataları

`.env` dosyasında timeout'u artırın:

```env
TIMEOUT=20
```

### Element Bulunamadı

Etsy arayüzü değişmiş olabilir. Selectors güncellenmelidir:
- `modules/etsy_actions.py` - Ürün sayfası selectors
- `modules/etsy_login.py` - Login sayfası selectors

### Proxy Hataları

- Proxy formatının doğru olduğundan emin olun
- Proxy'nin çalıştığını test edin
- Geçici olarak proxy olmadan deneyin

## 📊 Çıktı Örneği

```
======================================================================
                         ETSY BOT v2.0
                  Natural Human Behavior Edition
======================================================================

Features:
  ✓ Listing ID-based targeting
  ✓ Multiple keyword search strategies
  ✓ Human-like browsing patterns
  ✓ Random delays and behaviors
  ✓ Mobile device simulation
  ✓ Proxy rotation support
======================================================================

[2025-01-15 10:30:45] [INFO] Loading configurations...
[2025-01-15 10:30:45] [INFO] Loaded 2 email account(s)
[2025-01-15 10:30:45] [INFO] Loaded 3 listing(s) to process
[2025-01-15 10:30:45] [INFO] Loaded 5 proxy/proxies

======================================================================
Processing account 1/2: user1@example.com
======================================================================
Using mobile device: iPhone 13
Using proxy: 123.45.67.89:8080

----------------------------------------------------------------------
Processing listing 1/3: ID 1802588667
Keywords: wolf pendant, nordic wolf, fenrir necklace
----------------------------------------------------------------------
[2025-01-15 10:31:02] [INFO] Searching for: wolf pendant
[2025-01-15 10:31:08] [SUCCESS] Search results loaded for: wolf pendant
[2025-01-15 10:31:10] [INFO] Looking for listing ID: 1802588667
[2025-01-15 10:31:15] [SUCCESS] Found listing 1802588667!
[2025-01-15 10:31:18] [SUCCESS] Product page loaded
[2025-01-15 10:31:20] [INFO] Viewing product naturally...
[2025-01-15 10:31:35] [INFO] Adding to favorites...
[2025-01-15 10:31:37] [SUCCESS] Product added to favorites!
[2025-01-15 10:31:40] [INFO] Adding to cart...
[2025-01-15 10:31:43] [SUCCESS] Product added to cart!

✓ Listing 1802588667 found with keyword: 'wolf pendant'
  ✓ Added to favorites
  ✓ Added to cart
```

## 🎯 İpuçları

1. **Keyword Seçimi**: Listing'in gerçekten çıkacağı keywordleri kullanın
2. **Çeşitlilik**: Farklı account'lar için farklı listingler kullanın
3. **Zaman**: En yoğun saatlerde çalıştırmayın
4. **Miktar**: Günde hesap başına max 5-10 listing
5. **Takip**: Log'ları düzenli kontrol edin

## 📝 Versiyon Geçmişi

### v2.0 (Güncel)
- ✨ Listing ID bazlı hedefleme
- ✨ Çoklu keyword stratejisi
- ✨ Gelişmiş insan davranışı simülasyonu
- ✨ Rastgele davranış patternleri
- ✨ Decoy davranışlar
- ✨ İyileştirilmiş anti-detection

### v1.0
- ✅ Temel keyword bazlı arama
- ✅ Email list desteği
- ✅ Proxy desteği
- ✅ Mobil simülasyon

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

Bu proje eğitim amaçlıdır. Kullanımdan doğacak sorumluluk kullanıcıya aittir.

## ⚖️ Sorumluluk Reddi

Bu araç yalnızca eğitim ve araştırma amaçlıdır. Etsy'nin kullanım şartlarına aykırı kullanımlardan, hesap yasaklamalarından veya yasal sorunlardan kullanıcı sorumludur. Yazılımı kullanarak tüm riskleri kabul etmiş sayılırsınız.

---

**Not**: Bu bot'u kullanmadan önce Etsy'nin [Terms of Service](https://www.etsy.com/legal/terms-of-use) ve [API Terms](https://www.etsy.com/legal/api) dokümanlarını okuyun.
