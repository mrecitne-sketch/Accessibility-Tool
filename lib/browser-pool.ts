import puppeteer, { Browser, Page } from 'puppeteer'

// Simple singleton browser pool with fixed page concurrency
class BrowserPool {
  private static instance: BrowserPool
  private browserPromise: Promise<Browser> | null = null
  private maxPages: number
  private activePages = 0
  private queue: Array<() => void> = []

  private constructor(maxPages: number) {
    this.maxPages = Math.max(1, maxPages)
  }

  static getInstance(maxPages = 3) {
    if (!BrowserPool.instance) {
      BrowserPool.instance = new BrowserPool(maxPages)
    }
    return BrowserPool.instance
  }

  private async getBrowser(): Promise<Browser> {
    if (!this.browserPromise) {
      this.browserPromise = puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-features=SitePerProcess',
          '--disable-background-networking',
          '--disable-background-timer-throttling',
        ],
      })
    }
    return this.browserPromise
  }

  async acquirePage(): Promise<{ page: Page; release: () => Promise<void> }> {
    // Wait until under concurrency limit
    if (this.activePages >= this.maxPages) {
      await new Promise<void>((resolve) => this.queue.push(resolve))
    }
    this.activePages += 1

    const browser = await this.getBrowser()
    const page = await browser.newPage()

    const release = async () => {
      try {
        if (!page.isClosed()) await page.close({ runBeforeUnload: false })
      } finally {
        this.activePages -= 1
        const next = this.queue.shift()
        if (next) next()
      }
    }

    return { page, release }
  }
}

export const getBrowserPool = (maxPages = 3) => BrowserPool.getInstance(maxPages)


