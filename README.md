# 📦 Terabox API

This is a simple API that extracts direct download links from Terabox shared links.  
It uses **Playwright (Chromium)** to bypass the frontend and fetch the actual API response.  

---

## 🚀 Features
- Get **direct download links** from Terabox share links.
- Run it locally or deploy to platforms like **Render**, **Vercel**, or any VPS.
- Lightweight Node.js server with Express.

---

## 📂 Project Structure
```
Terabox-Api/
│── server.js   # Main server file (Express + Playwright)
│── package.json
│── README.md
```

---

## 🔧 Installation

Clone this repository:

```bash
git clone https://github.com/devz-on/Terabox-Api.git
cd Terabox-Api
```

Install dependencies:

```bash
npm install
```

---

## ▶️ Usage (Local)

Start the server:

```bash
node server.js
```

Server will start at:

```
http://localhost:3000
```

---

## 🌐 API Endpoint

### `GET /api`

Query Parameters:
- `link` → Terabox share link

#### Example Request:
```
http://localhost:3000/api?link=https://teraboxapp.com/s/XXXXXXXXXXX
```

#### Example Response:
```json
{
  "status": "success",
  "direct_link": "https://download-link-generated.com/file.mp4",
  "file_name": "example.mp4",
  "size": "120MB"
}
```

---

## 📤 Deployment

### Render (Free Tier)
1. Fork this repo.
2. Go to [Render](https://render.com/).
3. Create a **Web Service** → connect your GitHub repo.
4. Build command:
   ```
   npm install
   ```
5. Start command:
   ```
   node server.js
   ```
6. Done ✅ — Your API will be live.

---

## ⚠️ Notes
- This project is for **educational purposes only**.
- Use responsibly, as Terabox may update its APIs at any time.

---

## 👤 Author
Developed by [**devz-on**](https://github.com/devz-on) 💻  
