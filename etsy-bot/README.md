# Etsy Bot

Selenium tabanlı otomatik Etsy ürün arama, favorileme ve sepete ekleme botu.

## Özellikler

- ✅ **Email Listesi ile Giriş**: Birden fazla Etsy hesabı ile otomatik giriş
- ✅ **Keyword Bazlı Arama**: Belirlediğiniz anahtar kelimelerle ürün arama
- ✅ **Otomatik Favorileme**: Bulunan ürünleri favorilere ekleme
- ✅ **Sepete Ekleme**: Ürünleri otomatik olarak sepete atma
- ✅ **Proxy Desteği**: Her session için farklı proxy kullanımı
- ✅ **Mobil Cihaz Simülasyonu**: Gerçekçi mobil cihaz (iPhone, Samsung, Pixel) kullanıcı deneyimi
- ✅ **İnsan Benzeri Davranış**: Rastgele gecikmeler ve insan gibi yazma
- ✅ **Anti-Detection**: Selenium tespitini engelleyen yapılandırmalar

## Gereksinimler

- Python 3.8+
- Chrome tarayıcı
- İnternet bağlantısı

## Kurulum

### 1. Projeyi İndirin

```bash
cd etsy-bot
```

### 2. Sanal Ortam Oluşturun (Önerilen)

```bash
python -m venv venv

# Linux/Mac
source venv/bin/activate

# Windows
venv\Scripts\activate
```

### 3. Bağımlılıkları Yükleyin

```bash
pip install -r requirements.txt
```

### 4. Konfigürasyonları Ayarlayın

#### Email Listesi (`config/emails.txt`)

Her satıra bir email:password formatında ekleyin:

```
user1@example.com:password123
user2@example.com:password456
user3@example.com:password789
```

#### Keyword Listesi (`config/keywords.txt`)

Her satıra bir anahtar kelime ekleyin:

```
vintage lamp
handmade bracelet
custom mug
wooden table
leather wallet
```

#### Proxy Listesi (`config/proxies.txt`) - Opsiyonel

Her satıra bir proxy adresi ekleyin:

```
123.45.67.89:8080
98.76.54.32:3128:username:password
```

**Not**: Proxy kullanmak zorunda değilsiniz. Proxy kullanmayacaksanız bu dosyayı boş bırakabilirsiniz.

### 5. Çevre Değişkenlerini Ayarlayın (Opsiyonel)

`.env.example` dosyasını `.env` olarak kopyalayın ve düzenleyin:

```bash
cp .env.example .env
```

`.env` içeriği:

```env
HEADLESS=False          # True yaparsanız tarayıcı görünmez modda çalışır
TIMEOUT=10              # WebDriver timeout süresi (saniye)
MAX_RETRIES=3           # Başarısız işlemler için tekrar sayısı
DELAY_MIN=2             # Minimum bekleme süresi (saniye)
DELAY_MAX=5             # Maximum bekleme süresi (saniye)
```

## Kullanım

### Temel Kullanım

```bash
python main.py
```

### Headless Modda Çalıştırma

Tarayıcıyı görünmez modda çalıştırmak için:

```bash
python main.py --headless
```

### Özel Config Klasörü Kullanma

```bash
python main.py --config /path/to/custom/config
```

### Yardım

```bash
python main.py --help
```

## Proje Yapısı

```
etsy-bot/
├── main.py                 # Ana çalıştırma scripti
├── requirements.txt        # Python bağımlılıkları
├── .env.example           # Örnek çevre değişkenleri
├── README.md              # Bu dosya
├── config/                # Konfigürasyon dosyaları
│   ├── emails.txt        # Email:password listesi
│   ├── keywords.txt      # Anahtar kelime listesi
│   └── proxies.txt       # Proxy listesi (opsiyonel)
├── modules/               # Ana modüller
│   ├── __init__.py
│   ├── etsy_login.py     # Etsy giriş işlemleri
│   └── etsy_actions.py   # Ürün işlemleri (arama, favorileme, sepet)
└── utils/                 # Yardımcı araçlar
    ├── __init__.py
    ├── config_loader.py  # Config dosyalarını yükleme
    ├── driver_manager.py # WebDriver ve proxy yönetimi
    └── helpers.py        # Yardımcı fonksiyonlar
```

## Bot Nasıl Çalışır?

1. **Başlangıç**: Bot, config klasöründen email, keyword ve proxy listelerini yükler
2. **Her Email için**:
   - Rastgele bir proxy seçer (varsa)
   - Rastgele bir mobil cihaz simülasyonu yapar
   - Chrome tarayıcıyı açar
   - Etsy'e giriş yapar
   - **Her Keyword için**:
     - Ürünü arar
     - İlk ürünü favorilere ekler
     - İlk ürünü sepete ekler
     - İnsan benzeri gecikmeler yapar
   - Hesaptan çıkış yapar
   - Tarayıcıyı kapatır
3. **Bir sonraki hesaba geçer** (varsa)

## Özellikler Detayı

### Mobil Cihaz Simülasyonu

Bot, her session için rastgele bir mobil cihaz seçer:

- iPhone 12 Pro
- iPhone 13
- Samsung Galaxy S21
- Samsung Galaxy S22
- Google Pixel 6

Her cihazın gerçek user agent, ekran boyutu ve pixel ratio değerleri kullanılır.

### Anti-Detection Özellikleri

- Selenium tespitini engelleyen yapılandırmalar
- Gerçek mobil cihaz user agent'ları
- Rastgele gecikmeler (2-5 saniye arası)
- İnsan gibi karakter karakter yazma
- Görüntü yüklemeyi devre dışı bırakma (daha hızlı)

### Proxy Rotasyonu

Her hesap için farklı bir proxy kullanılır (listeden rastgele seçilir).

## Güvenlik Notları

⚠️ **Önemli Uyarılar**:

1. **Hesap Güvenliği**: Bot, Etsy'nin kullanım şartlarına aykırı olabilir. Kendi riskiniz dahilinde kullanın.
2. **Rate Limiting**: Çok fazla istek gönderirseniz Etsy tarafından engellenebilirsiniz.
3. **Proxy Kullanımı**: Güvenilir proxy servisleri kullanın.
4. **Şifreler**: Email ve şifrelerinizi güvenli tutun. Bu dosyaları asla paylaşmayın.
5. **Git**: `config/*.txt` dosyalarını `.gitignore`'a ekleyin!

## Sorun Giderme

### Chrome Driver Hatası

Eğer "chromedriver not found" hatası alırsanız:

```bash
pip install --upgrade webdriver-manager
```

### Timeout Hataları

`.env` dosyasında TIMEOUT değerini artırın:

```env
TIMEOUT=20
```

### Proxy Bağlantı Hataları

- Proxy adreslerinin doğru formatda olduğundan emin olun
- Proxy'nin çalıştığını test edin
- Proxy listesini boş bırakarak proxy olmadan çalıştırın

### Element Bulunamadı Hataları

Etsy arayüzü değişmiş olabilir. Element seçicileri güncellenmelidir:

- `modules/etsy_login.py` - Login sayfası element'leri
- `modules/etsy_actions.py` - Ürün sayfası element'leri

## Lisans

Bu proje eğitim amaçlıdır. Kullanımdan doğacak sorumluluk kullanıcıya aittir.

## Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## İletişim

Sorularınız için issue açabilirsiniz.

---

**Not**: Bu bot, kişisel kullanım için tasarlanmıştır. Ticari kullanım veya kötüye kullanımdan doğacak sorumluluk kullanıcıya aittir.
