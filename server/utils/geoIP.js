const mockGeoData = {
  '185.10.20.4':    { country: 'Russia',        countryCode: 'RU', city: 'Moscow',        lat: 55.7558,  lon: 37.6173,   isp: 'Bulletproof Hosting LLC', org: 'AS47583' },
  '45.142.212.100': { country: 'Netherlands',   countryCode: 'NL', city: 'Amsterdam',     lat: 52.3702,  lon: 4.8952,    isp: 'Serverius Holding BV',    org: 'AS50673' },
  '91.108.4.1':     { country: 'Netherlands',   countryCode: 'NL', city: 'Amsterdam',     lat: 52.3676,  lon: 4.9041,    isp: 'DigitalOcean LLC',         org: 'AS14061' },
  '194.165.16.78':  { country: 'Iran',          countryCode: 'IR', city: 'Tehran',        lat: 35.6892,  lon: 51.3890,   isp: 'Noyan Abr Arvan Co',      org: 'AS205207' },
  '104.21.44.102':  { country: 'United States', countryCode: 'US', city: 'San Francisco', lat: 37.7749,  lon: -122.4194, isp: 'Cloudflare Inc',           org: 'AS13335' },
  '172.67.68.21':   { country: 'United States', countryCode: 'US', city: 'Los Angeles',   lat: 34.0522,  lon: -118.2437, isp: 'Cloudflare Inc',           org: 'AS13335' },
  '5.188.206.14':   { country: 'Russia',        countryCode: 'RU', city: 'St. Petersburg',lat: 59.9311,  lon: 30.3609,   isp: 'PE Freehost',              org: 'AS29182' },
  '213.109.202.26': { country: 'Ukraine',       countryCode: 'UA', city: 'Kyiv',          lat: 50.4501,  lon: 30.5234,   isp: 'Selectel LLC',             org: 'AS49505' },
  '193.106.191.25': { country: 'China',         countryCode: 'CN', city: 'Beijing',       lat: 39.9042,  lon: 116.4074,  isp: 'ChinaNet',                 org: 'AS4134' },
  '46.17.43.10':    { country: 'Germany',       countryCode: 'DE', city: 'Frankfurt',     lat: 50.1109,  lon: 8.6821,    isp: 'Hetzner Online GmbH',      org: 'AS24940' },
};

exports.geoLookup = async (ip) => {
  if (mockGeoData[ip]) return mockGeoData[ip];
  // Try free ip-api.com with 3s timeout
  try {
    return await new Promise((resolve) => {
      const https = require('https');
      const req = https.get(`http://ip-api.com/json/${ip}?fields=country,countryCode,city,lat,lon,isp,org`, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try { resolve(JSON.parse(data)); }
          catch { resolve(mockGeoData.default || { country: 'Unknown', countryCode: 'XX', lat: 0, lon: 0 }); }
        });
      });
      req.on('error', () => resolve({ country: 'Unknown', countryCode: 'XX', lat: 0, lon: 0 }));
      req.setTimeout(3000, () => { req.destroy(); resolve({ country: 'Unknown', countryCode: 'XX', lat: 0, lon: 0 }); });
    });
  } catch {
    return { country: 'Unknown', countryCode: 'XX', lat: 0, lon: 0 };
  }
};

exports.getMockMarkers = () => Object.entries(mockGeoData).map(([ip, geo]) => ({ ip, ...geo }));
