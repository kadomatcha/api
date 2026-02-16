const UnrestrictedAIScraper = require('../scraper/unress')

module.exports = (app) => {
  app.get('/api/unress', async (req, res) => {
    try {
      const { prompt, style } = req.query

      if (!prompt) {
        return res.status(400).json({
          status: false,
          error: 'Parameter prompt wajib diisi'
        })
      }

      const scraper = new UnrestrictedAIScraper()
      const result = await scraper.generateImage(prompt, style)

      res.json({
        status: true,
        data: result
      })

    } catch (err) {
      res.status(500).json({
        status: false,
        error: err.message
      })
    }
  })
}