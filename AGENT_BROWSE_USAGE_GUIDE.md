# agent-browse Kullanım Kılavuzu

## Kurulum

agent-browse zaten `agent-browse-main/` klasöründe mevcut. Şimdi kurulumu yapalım:

```bash
cd agent-browse-main
npm install
```

## Gerekli API Key

Anthropic API key gerekli. Şu şekilde ayarla:

```bash
export ANTHROPIC_API_KEY="your-anthropic-api-key"
```

Ya da `.env` dosyası oluştur:

```bash
echo 'ANTHROPIC_API_KEY="your-key-here"' > .env
```

## Kullanım

### 1. İnteraktif Mod

Direkt çalıştır ve agent ile konuş:

```bash
cd agent-browse-main
npm run claude
```

Sonra istediğini söyle:
- "Go to https://n8n-fjzd-production.up.railway.app/ and login with mkilagoz@gmail.com / 6297834Nn"
- "Create a new workflow with webhook trigger and HTTP request node"
- "Extract all workflow names from the page"

### 2. Tek Komut Modu

Direkt komut ver:

```bash
npm run claude -- "Go to Hacker News and get the top post"
```

### 3. CLI Komutları (Elle Kontrol)

Browser'ı adım adım kontrol et:

```bash
# Browser'ı aç ve navigate et
tsx src/cli.ts navigate "https://n8n-fjzd-production.up.railway.app/"

# Login yap
tsx src/cli.ts act "enter mkilagoz@gmail.com in the email field"
tsx src/cli.ts act "enter 6297834Nn in the password field"
tsx src/cli.ts act "click the sign in button"

# Workflow oluştur
tsx src/cli.ts act "click create new workflow button"
tsx src/cli.ts act "add a webhook trigger node"

# Data çek
tsx src/cli.ts extract "get all workflow names" '{"workflows": "string"}'

# Screenshot al
tsx src/cli.ts screenshot

# Browser'ı kapat
tsx src/cli.ts close
```

## Komutlar

### navigate
```bash
tsx src/cli.ts navigate <url>
```
URL'e git ve screenshot al.

### act
```bash
tsx src/cli.ts act "<doğal dil komut>"
```
Sayfada bir işlem yap. Örnekler:
- "click the blue button"
- "enter 'text' in the search field"
- "select option from dropdown"
- "scroll down"

### extract
```bash
tsx src/cli.ts extract "<ne çekilecek>" '{"field": "type"}'
```
Sayfadan data çek. Schema opsiyonel.

### observe
```bash
tsx src/cli.ts observe "<ne gözlemlenecek>"
```
Sayfadaki elementleri keşfet.

### screenshot
```bash
tsx src/cli.ts screenshot
```
Screenshot al. `agent/browser_screenshots/` klasörüne kaydedilir.

### close
```bash
tsx src/cli.ts close
```
Browser'ı kapat.

## n8n Workflow Automation Örneği

### İnteraktif Yöntem (Kolay)

```bash
cd agent-browse-main
npm run claude
```

Sonra şunu söyle:
```
Go to https://n8n-fjzd-production.up.railway.app/
Login with email: mkilagoz@gmail.com and password: 6297834Nn
After login, create a new workflow with these nodes:
1. Webhook trigger
2. HTTP Request node pointing to https://api.example.com
3. Connect them together
4. Save the workflow with name "API Webhook Flow"
```

Agent bunu otomatik yapacak!

### Manuel CLI Yöntemi

```bash
cd agent-browse-main

# 1. Navigate
tsx src/cli.ts navigate "https://n8n-fjzd-production.up.railway.app/"

# 2. Login
tsx src/cli.ts act "click the email input field and type mkilagoz@gmail.com"
tsx src/cli.ts act "click the password field and type 6297834Nn"
tsx src/cli.ts act "click the sign in button"

# 3. Bekle (login için)
sleep 3

# 4. Workflow oluştur
tsx src/cli.ts act "click the create workflow button or new workflow button"
sleep 2

# 5. Node ekle
tsx src/cli.ts act "add a webhook trigger node to the canvas"
sleep 2
tsx src/cli.ts act "add an HTTP request node"
sleep 2

# 6. Connect
tsx src/cli.ts act "connect the webhook node to the HTTP request node"
sleep 1

# 7. Save
tsx src/cli.ts act "click the save button"
sleep 1

# 8. Screenshot al
tsx src/cli.ts screenshot

# 9. Kapat
tsx src/cli.ts close
```

## Önemli Notlar

### ✅ Browser Persistence
Browser komutlar arasında açık kalır. Yani:
```bash
tsx src/cli.ts navigate "https://example.com"
# Browser açık kalıyor...
tsx src/cli.ts act "click button"
# Hala aynı browser...
tsx src/cli.ts close
# Şimdi kapandı
```

### ✅ Automatic Screenshots
Her komut otomatik screenshot alır ve JSON'da path döner:
```json
{
  "success": true,
  "message": "...",
  "screenshot": "/path/to/screenshot.png"
}
```

### ✅ Chrome Profile
İlk çalıştırmada Chrome profilini `.chrome-profile/` klasörüne kopyalar. Bu sayede:
- Cookies korunur
- Login states persist
- Preferences maintained

### ⚠️ API Key
Anthropic API key şart! OpenAI değil, Anthropic gerekli.

```bash
export ANTHROPIC_API_KEY="sk-ant-..."
```

## Debugging

### Chrome bulunamadı hatası?
Linux'ta:
```bash
sudo apt install google-chrome-stable
```

macOS'ta:
```bash
# https://www.google.com/chrome/ dan indir
```

### Profile refresh gerekirse?
```bash
rm -rf agent-browse-main/.chrome-profile
```

### Browser kapanmıyor?
```bash
# Force close
pkill -f chrome
# Ya da
tsx src/cli.ts close
```

## Hızlı Test

En basit test:

```bash
cd agent-browse-main
export ANTHROPIC_API_KEY="your-key"
npm run claude -- "Go to google.com and search for 'Stagehand browser automation'"
```

Bu kadar! Agent otomatik her şeyi yapar.

## Production Usage

### Tek satırda workflow oluşturma:

```bash
cd agent-browse-main
npm run claude -- "Go to n8n at https://n8n-fjzd-production.up.railway.app/, login with mkilagoz@gmail.com / 6297834Nn, create a workflow with webhook and HTTP request nodes, save it as 'Auto Created Flow'"
```

Agent tüm adımları otomatik yapacak ve sonucu bildirecek.

## Avantajlar

1. **Doğal Dil**: Her şeyi söyleyerek yapabilirsin
2. **Otomatik Screenshot**: Her adımdan görüntü alınır
3. **Persistent Browser**: Hızlı, tekrar açmaya gerek yok
4. **Session Korunur**: Chrome profili kopyalandığı için login'ler kalıcı
5. **Claude Agent SDK**: Çok adımlı taskları otomatik halleder

## Sonuç

En kolay yöntem:
```bash
cd agent-browse-main
export ANTHROPIC_API_KEY="your-key"
npm run claude
```

Sonra ne istiyorsan söyle, agent halleder!
