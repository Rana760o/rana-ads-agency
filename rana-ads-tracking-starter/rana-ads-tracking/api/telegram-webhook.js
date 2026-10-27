const { supabase, json, safeText } = require('./_lib');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return json(res, 405, { error: 'POST required' });
  const supplied = req.headers['x-telegram-bot-api-secret-token'];
  if (!process.env.TELEGRAM_WEBHOOK_SECRET || supplied !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return json(res, 401, { error: 'Unauthorized webhook' });
  }
  try {
    const update = req.body || {};
    let event_name, member, chat, inviteLink;
    if (update.chat_join_request) {
      event_name = 'join_request';
      member = update.chat_join_request.from;
      chat = update.chat_join_request.chat;
      inviteLink = update.chat_join_request.invite_link && update.chat_join_request.invite_link.invite_link;
    } else if (update.chat_member) {
      const oldStatus = update.chat_member.old_chat_member && update.chat_member.old_chat_member.status;
      const newStatus = update.chat_member.new_chat_member && update.chat_member.new_chat_member.status;
      member = update.chat_member.new_chat_member && update.chat_member.new_chat_member.user;
      chat = update.chat_member.chat;
      if (['member','administrator','creator'].includes(newStatus) && !['member','administrator','creator'].includes(oldStatus)) event_name = 'member_joined';
      if (['left','kicked'].includes(newStatus) && ['member','administrator','creator'].includes(oldStatus)) event_name = 'member_left';
    }
    if (!event_name || !member || !chat) return json(res, 200, { ok: true, ignored: true });

    const db = supabase();
    const { data: channel, error: lookupError } = await db.from('channels')
      .select('slug').eq('telegram_chat_id', String(chat.id)).maybeSingle();
    if (lookupError) throw lookupError;
    if (!channel) return json(res, 200, { ok: true, ignored: true, reason: 'Channel not configured' });

    const { error } = await db.from('tracking_events').insert({
      channel_slug: channel.slug,
      event_name,
      telegram_user_id: String(member.id),
      telegram_username: safeText(member.username, 100),
      invite_link: safeText(inviteLink, 2000)
    });
    if (error) throw error;
    return json(res, 200, { ok: true });
  } catch (e) {
    console.error('telegram webhook error:', e.message);
    return json(res, 500, { error: 'Webhook processing failed' });
  }
};
