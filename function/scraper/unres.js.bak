import axios from 'axios'
import fs from 'fs'
import path from 'path'

export default class UnrestrictedAIScraper {
  constructor() {
    this.baseURL = 'https://unrestrictedaiimagegenerator.com'
    this.headers = {
      'authority': 'unrestrictedaiimagegenerator.com',
      'accept': '*/*',
      'accept-encoding': 'gzip, deflate, br, zstd',
      'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
      'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'origin': this.baseURL,
      'referer': this.baseURL + '/',
      'sec-ch-ua': '"Chromium";v="144"',
      'sec-ch-ua-mobile': '?1',
      'sec-ch-ua-platform': '"Android"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'user-agent':
        'Mozilla/5.0 (Linux; Android 6.0) AppleWebKit/537.36 Chrome/144.0.0.0 Mobile Safari/537.36',
      'x-requested-with': 'XMLHttpRequest'
    }

    this.cookie = this.generateCookies()
    this.headers.cookie = this.cookie

    this.session = axios.create({
      baseURL: this.baseURL,
      headers: this.headers,
      withCredentials: true
    })
  }

  generateCookies() {
    const t = Math.floor(Date.now() / 1000)
    const ga1 = `GA1.1.${Math.floor(Math.random() * 1e9)}.${t}`
    const ga2 = `GS2.1.s${t}$o1$g1$t${t}`
    return `_ga=${ga1}; _ga_J4MEF7G6YX=${ga2}`
  }

  async getNonce() {
    const res = await this.session.get('/')
    const m =
      res.data.match(/name="_wpnonce" value="([^"]+)"/) ||
      res.data.match(/name="_wpnonce".*?value="([^"]+)"/)
    return m?.[1] || '218155152c'
  }

  async generateImage(prompt, style = 'photorealistic') {
    const nonce = await this.getNonce()

    const payload = new URLSearchParams({
      generate_image: 'true',
      image_description: prompt,
      image_style: style,
      _wpnonce: nonce
    }).toString()

    const res = await this.session.post('/', payload, {
      headers: {
        ...this.headers,
        'content-length': Buffer.byteLength(payload),
        cookie: this.cookie
      }
    })

    const imageUrl = this.extractImageUrl(res.data)
    if (!imageUrl)
      return {
        success: false,
        error: 'image not found'
      }

    return {
      success: true,
      imageUrl,
      prompt,
      style,
      nonce,
      info: this.extractImageInfo(res.data)
    }
  }

  extractImageUrl(html) {
    const patterns = [
      /src="([^"]*\/ai-images\/[^"]*\.(png|jpg|jpeg|webp))"/i,
      /src="([^"]*\/wp-content\/uploads\/ai-images\/[^"]*)"/i,
      /resultImage.*?src="([^"]+)"/i
    ]

    for (const p of patterns) {
      const m = html.match(p)
      if (m?.[1]) return m[1]
    }
    return null
  }

  extractImageInfo(html) {
    const info = { recentImages: [] }
    const rgx =
      /<div class="recent-item">[\s\S]*?<img[^>]*src="([^"]*)"[^>]*>[\s\S]*?<div class="recent-item-prompt">([^<]*)<\/div>[\s\S]*?<div class="recent-item-style">([^<]*)<\/div>/gi

    let m
    while ((m = rgx.exec(html)) !== null) {
      info.recentImages.push({
        imageUrl: m[1],
        prompt: m[2],
        style: m[3]
      })
    }
    return info
  }

  async downloadImage(imageUrl, savePath = './downloads') {
    if (!fs.existsSync(savePath))
      fs.mkdirSync(savePath, { recursive: true })

    const filename = path.basename(imageUrl)
    const filePath = path.join(savePath, filename)

    const res = await axios.get(imageUrl, {
      responseType: 'stream',
      headers: {
        referer: this.baseURL,
        'user-agent': this.headers['user-agent']
      }
    })

    const writer = fs.createWriteStream(filePath)
    res.data.pipe(writer)

    return new Promise((resolve, reject) => {
      writer.on('finish', () => resolve(filePath))
      writer.on('error', reject)
    })
  }

  sleep(ms) {
    return new Promise(r => setTimeout(r, ms))
  }
}
