const { supabase, json, safeText } = require('./_lib');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return json(res, 405, { error: 'POST required' });
  try {
    const body = req.body || {};
    const allowed = new Set(['page_view', 'join_click', 'telegram_open']);
    const event_name = safeText(body.event_name, 40);
    const channel_slug = safeText(body.channel_slug, 80);
    if (!allowed.has(event_name) || !channel_slug) return json(res, 400, { error: 'Invalid event_name or channel_slug' });

    const db = supabase();
    const { data: channel, error: channelError } = await db.from('channels')
      .select('slug, active').eq('slug', channel_slug).maybeSingle();
    if (channelError) throw channelError;
    if (!channel || !channel.active) return json(res, 404, { error: 'Channel not found or inactive' });

    const row = {
      channel_slug,
      event_name,
      event_id: safeText(body.event_id, 100),
      utm_source: safeText(body.utm_source, 200),
      utm_medium: safeText(body.utm_medium, 200),
      utm_campaign: safeText(body.utm_campaign, 300),
      utm_content: safeText(body.utm_content, 300),
      utm_term: safeText(body.utm_term, 300),
      fbclid: safeText(body.fbclid, 1000),
      fbc: safeText(body.fbc, 1000),
      fbp: safeText(body.fbp, 1000),
      user_agent: safeText(req.headers['user-agent'], 500)
    };
    const { error } = await db.from('tracking_events').insert(row);
    if (error) throw error;
    return json(res, 200, { ok: true });
  } catch (e) {
    console.error('track endpoint error:', e.message);
    return json(res, 500, { error: 'Tracking event could not be saved' });
  }
};
