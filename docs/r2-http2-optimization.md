# R2 HTTP/2 Optimization Solution

## Problem

Images served from `pub-760132b719d849e3aea8daf679b700b7.r2.dev` are loading over **HTTP/1.1**, causing:
- 600-900ms load time per image
- Sequential loading instead of parallel
- Poor LCP (4.8s vs target 2.5s)

Lighthouse shows:
```
R2.dev images: http/1.1, 633ms, 60.2KB
R2.dev images: http/1.1, 491ms, 25.6KB
R2.dev images: http/1.1, 883ms, 26.0KB
```

## Solution: Cloudflare Custom Domain for R2

### Option 1: Cloudflare R2 Custom Domain (Recommended)

Set up a custom domain (e.g., `images.tasteui.dev`) for your R2 bucket through Cloudflare:

1. **In Cloudflare Dashboard:**
   - Go to R2 > Manage R2 buckets > Your bucket
   - Click "Custom Domains" tab
   - Click "Add Custom Domain"
   - Enter: `images.tasteui.dev`
   - Follow the DNS setup instructions

2. **DNS Configuration:**
   - Add CNAME record: `images` → `<bucket>.r2.cloudflarestorage.com`
   - Or use the provided DNS records from Cloudflare

3. **Update Environment Variable:**
   ```bash
   # apps/api/.env
   R2_PUBLIC_URL=https://images.tasteui.dev
   ```

4. **Update Frontend Preconnect:**
   ```typescript
   // apps/web/src/routes/__root.tsx
   {
     rel: "preconnect",
     href: "https://images.tasteui.dev",
     crossOrigin: "anonymous",
   }
   ```

### Benefits:
- ✅ HTTP/2 multiplexing (parallel image loading)
- ✅ Cloudflare edge caching (faster global delivery)
- ✅ Brotli compression
- ✅ Automatic WebP/AVIF conversion (with Polish)
- ✅ Better LCP (estimated 1-2s improvement)

---

### Option 2: Cloudflare Worker Proxy (Alternative)

If you can't use a custom domain, create a Cloudflare Worker that proxies requests:

**worker.js:**
```javascript
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Proxy to R2
    const r2Url = `https://pub-760132b719d849e3aea8daf679b700b7.r2.dev${url.pathname}`;
    
    const response = await fetch(r2Url, {
      cf: {
        // Cache everything at edge for 1 year (immutable assets)
        cacheTtl: 31536000,
        cacheEverything: true,
      },
    });
    
    // Add caching headers
    const modifiedResponse = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        ...response.headers,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
    
    return modifiedResponse;
  },
};
```

Deploy to `images.tasteui.dev` and update `R2_PUBLIC_URL`.

---

### Option 3: Use Cloudflare Images (Paid)

For even better optimization, use Cloudflare Images:

1. Upload images to Cloudflare Images instead of R2
2. Use the Images API for on-the-fly resizing
3. Automatic format selection (WebP/AVIF)
4. Costs $5/month per 100k images

---

## Implementation Checklist

- [ ] Set up `images.tasteui.dev` custom domain in Cloudflare R2
- [ ] Update `R2_PUBLIC_URL` environment variable
- [ ] Update preconnect link in `__root.tsx`
- [ ] Re-upload existing images or migrate URLs
- [ ] Test image loading with Lighthouse
- [ ] Verify HTTP/2 in browser dev tools Network tab

## Expected Results

After implementing HTTP/2:
- Image load time: 600-900ms → 150-300ms
- LCP: 4.8s → ~3s
- Performance score: 74 → 85+
- Parallel image loading instead of sequential

## References

- [Cloudflare R2 Custom Domains](https://developers.cloudflare.com/r2/buckets/custom-domains/)
- [Cloudflare R2 Pricing](https://developers.cloudflare.com/r2/pricing/)
- [HTTP/2 vs HTTP/1.1](https://developers.cloudflare.com/fundamentals/http2/)
