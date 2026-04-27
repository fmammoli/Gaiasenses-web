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

// A lógica do sendNotification funciona com o seguinte: a cada execução, o sistema verifica quais usuários estão dentro do bloco de tempo atual (00:00-11:59 ou 12:00-23:59) e envia a notificação para eles. Depois disso, ele calcula a próxima data de envio com base na frequência do usuário e atualiza o campo next_push no banco de dados. Dessa forma, mesmo que haja uma falha no envio da notificação, o sistema tentará novamente na próxima execução, evitando loops infinitos.

export async function sendNotification() {
  const now = new Date();
  const currentHour = now.getUTCHours();

  let windowStart, windowEnd;

  // definição dos dois blocos (em UTC)
  if (currentHour < 12) {
    // 00:00 → 11:59
    windowStart = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      0, 0, 0
    ));

    windowEnd = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      11, 59, 59
    ));
  } else {
    // 12:00 → 23:59
    windowStart = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      12, 0, 0
    ));

    windowEnd = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      23, 59, 59
    ));
  }

  // busca dos usuários dentro do bloco
  const { data: users, error } = await supabase
    .from('GaiaSubs')
    .select('*')
    .gte('next_push', windowStart.toISOString())
    .lte('next_push', windowEnd.toISOString());

  if (error) throw new Error('Error fetching users: ' + error.message);
  if (!users || users.length === 0) {
    return { success: true, message: 'No notifications in this block' };
  }

  const payload = JSON.stringify({
    title: 'GaiaSenses',
    body: 'Clique e veja o clima na sua região!',
    icon: '/icon.png'
  });

  for (const user of users) {
    try {
      let baseDate = new Date(user.next_push);

      // calculando a próxima ocorrência
      switch (user.frequency) {
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
          continue;
      }

      // enviar notificação primeiro
      await webpush.sendNotification(user.subscription, payload);

      // daí atualizar next_push depois (evita perder envio)
      const { error: updateError } = await supabase
        .from('GaiaSubs')
        .update({ next_push: baseDate.toISOString() })
        .eq('user_id', user.user_id);
        console.log(`\nUPDATE!\n———————————————————————————————————————\nUpdated next_push for user ${user.name} to ${baseDate.toISOString()}\n———————————————————————————————————————\n`);

      if (updateError) throw updateError;

    } catch (err) {
      console.error(
        `Falha ao processar usuário ${user.name}, id: ${user.user_id}:`,
        err
      );
    }
  }

  return { success: true };
}


//http://localhost:3000/api/notifications