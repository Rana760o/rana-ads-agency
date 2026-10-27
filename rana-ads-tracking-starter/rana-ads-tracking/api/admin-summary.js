const { supabase, json, safeText } = require('./_lib');

module.exports = async (req, res) => {
  if (req.method !== 'GET') return json(res, 405, { error: 'GET required' });
  const auth = req.headers.authorization || '';
  if (!process.env.ADMIN_API_KEY || auth !== `Bearer ${process.env.ADMIN_API_KEY}`) return json(res, 401, { error: 'Unauthorized' });
  try {
    const slug = safeText(req.query.slug, 80);
    if (!slug) return json(res, 400, { error: 'Provide ?slug=channel-slug' });
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await supabase().from('tracking_events')
      .select('event_name, created_at').eq('channel_slug', slug).gte('created_at', since);
    if (error) throw error;
    const counts = {};
    for (const row of data || []) counts[row.event_name] = (counts[row.event_name] || 0) + 1;
    return json(res, 200, { channel_slug: slug, period: '7 days', counts });
  } catch (e) {
    console.error('admin summary error:', e.message);
    return json(res, 500, { error: 'Could not load report' });
  }
};
