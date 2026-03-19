"use server";
 
import webpush from 'web-push';
import supabase from '@/lib/usersdb';
import crypto from 'crypto';
 
webpush.setVapidDetails(
	'mailto:gaiasenses.cti@gmail.com',
	process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
	process.env.VAPID_PRIVATE_KEY
);
  
export async function isValidEmail(email) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function subscribeUser(user) {
  //teste abaixo, remover depois
  console.log('SUBSCRIBE PAYLOAD:', user);
  if (!user.name || !user.email || !user.freq || !user.first_push || !user.sub) {
    throw new Error('Missing informations');
  }

  if (!isValidEmail(user.email)) {
    throw new Error('Invalid email');
  }

  const user_id = crypto.randomUUID();

  const { error } = await supabase
    .from('GaiaSubs')
    .insert({
      user_id,
      name: user.name,
      email: user.email,
      frequency: user.freq,
      next_push: user.first_push,
      subscription: user.sub
    });

  if (error) {
    throw new Error('Error while subscribing user');
  }

  return { success: true, user_id };
}
 
export async function unsubscribeUser(sub) {
  const { error, data } = await supabase
    .from('GaiaSubs')
    .delete()
    .eq('subscription->>endpoint', sub.endpoint);

  if (error || !data?.length) {
    return { success: false };
  }

  return { success: true };
}

export async function sendNotification() {
  const now = new Date();

  //buscar qual user precisa receber a notificaçao (next_push < agora)
  const { data: users, error } = await supabase
    .from('GaiaSubs')
    .select('*')
    .lte('next_push', now.toISOString()); 

  if (error) throw new Error('Error fetching users: ' + error.message);
  if (!users || users.length === 0) return { success: true, message: 'No notifications to send' };
//http://localhost:3000/api/notifications
  const payload = JSON.stringify({
    title: 'GaiaSenses',
    body: 'Clique e veja o clima na sua região!',
    icon: '/icon.png'
  });

  for (const user of users) {
    try {
      //calculo da proxima data
      let nextDate = new Date(user.next_push);
      
      //deixar o calculo a partir de 'now' para evitar loops
      const baseDate = new Date(nextDate < now ? now : nextDate);

      console.log("Frequency from DB:", user.frequency);

      switch (user.frequency) {
        /*
        case '60secondTest':
          baseDate.setUTCMinutes(baseDate.getUTCMinutes() + 1);
          break;
          */

        case 'Daily':
          baseDate.setUTCDate(baseDate.getUTCDate() + 1);
          break;

        case 'Weekly':
          baseDate.setUTCDate(baseDate.getUTCDate() + 7);
          break;

        case 'Monthly':
          baseDate.setUTCMonth(baseDate.getUTCMonth() + 1);
          break;

        default:
          console.error("Unknown frequency:", user.frequency);
      }

      //atualizaçao do next_push no banco do supabase (evita loops no caso de falha no envio da notif.)
      const { error: updateError } = await supabase
        .from('GaiaSubs')
        .update({ next_push: baseDate.toISOString() })
        .eq('user_id', user.user_id);
        /*console.log(`\nUPDATE!\n———————————————————————————————————————\nUpdated next_push for user ${user.name} to ${baseDate.toISOString()}\n———————————————————————————————————————\n`); */

      if (updateError) throw updateError;

      //enviar a notificaçao
      await webpush.sendNotification(user.subscription, payload);

    } catch (err) {
      console.error(`Falha ao processar usuário ${user.name}, id: ${user.user_id}:`, err);//se ocorre uma falha, o banco ignora, e a notif. tenta enviar na proxima execuçao
    }
  }

  return { success: true };
}