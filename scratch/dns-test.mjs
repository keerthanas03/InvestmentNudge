import dns from 'node:dns';

dns.resolve4('db.uxntbehxikausnzpvrcw.supabase.co', (err, addresses) => {
  if (err) {
    console.error('IPv4 resolution failed:', err);
  } else {
    console.log('IPv4 addresses:', addresses);
  }
});

dns.resolve6('db.uxntbehxikausnzpvrcw.supabase.co', (err, addresses) => {
  if (err) {
    console.error('IPv6 resolution failed:', err);
  } else {
    console.log('IPv6 addresses:', addresses);
  }
});
