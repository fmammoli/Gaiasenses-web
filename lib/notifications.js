"use server";
 
import webpush from 'web-push';
import clientPromise from '@/lib/usersdb';
 
webpush.setVapidDetails(
	'mailto:gaiasenses.cti@gmail.com',
	process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
	process.env.VAPID_PRIVATE_KEY
);
  
export async function isValidEmail(email) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function subscribeUser(user) {
	// if (!user.name || !user.email || !user.freq) {
	// 	throw new Error('Missing informations');
	// }

	// if (!isValidEmail(user.email)) {
	// 	throw new Error('Invalid email');
	// }

	if (!user.freq) {
		throw new Error('Missing information');
	}
	
	try {
		const client = await clientPromise;
		const db = client.db('subscriptions');

		await db.collection('users').insertOne({
			// name: user.name,
			// email: user.email,
			frequency: user.freq,
			next_push: user.first_push,
			subscription: user.sub
		});

		return { success: true };
	} catch (error) {
		throw new Error('Error while subscribing user:', error);
	}
}
 
export async function unsubscribeUser(sub) {
	try {
		const client = await clientPromise;
		const db = client.db('subscriptions');

		const result = await db.collection('users').findOneAndDelete({
			"subscription.endpoint": sub.endpoint
		});

		if (result === null) {
			console.log('User not found');
			return { success: false };
		}

		return { success: true };
	} catch (error) {
		console.error('Error while unsubscribing user:', error);
		return { success: false };
	}
}
 
export async function sendNotification() {
	const today = new Date();
	const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
	const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
	
	let results = []

	try {
		const client = await clientPromise;
		const db = client.db('subscriptions');
		
		const todayUsers = await db.collection('users').find({
			next_push: {
				$gte: start,
				$lt: end
			}
		}).toArray();

		const payload = JSON.stringify({
			title: 'GaiaSenses',
			body: 'Clique e veja o clima na sua região!',
			icon: '/icon.png'
		}); // podemos salvar qual idioma o usuario se inscreveu para personalizar isto
	
		for (const user of todayUsers) {
			try {
				await webpush.sendNotification(
					user.subscription,
					payload
				);
				results.push({ success: true });

				let update_push = new Date(user.next_push);
				switch (user.frequency) {
					case 'Daily':
						update_push.setDate(update_push.getDate() + 1);
						break;

					case 'Weekly':						
						update_push.setDate(update_push.getDate() + 7);
						break;
						
					case 'Monthly':
						update_push.setMonth(update_push.getMonth() + 1);						
						break;
				
					default:
						break;
				}

				await db.collection('users').updateOne(
					{_id: user._id},
					{$set: {next_push: update_push}}
				)

			} catch (error) {
				console.error('Error sending push notification:', error);
				results.push({ success: false, error: 'Failed to send notification' });
			}
		}
	} catch (error) {
		throw new Error('Error while connecting to database');
	}
	return { success: true, results};
}