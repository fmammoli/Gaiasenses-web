"use client";
import { useState, useEffect, useRef } from 'react';
import { isValidEmail, subscribeUser, unsubscribeUser } from '@/lib/notifications.js';
// import { Input } from '@/components/ui/input';
import { DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';

// as linhas comentadas contém futura implementação de nome e e-mail
export default function PushNotificationManager() {
	const [isSupported, setIsSupported] = useState(false);
	const [subscription, setSubscription] = useState<PushSubscription | null>(null);
	// const nameRef = useRef<HTMLInputElement>(null);
	// const emailRef = useRef<HTMLInputElement>(null);
	const [frequency, setFrequency] = useState('');
	const t = useTranslations("Notification");

	function urlBase64ToUint8Array(base64String: string) {
		const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
		const base64 = (base64String + padding)
		.replace(/-/g, '+')
		.replace(/_/g, '/');
	
		const rawData = window.atob(base64);
		const outputArray = new Uint8Array(rawData.length);
	
		for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
		return outputArray;
	}
	
	useEffect(() => {
		if ('serviceWorker' in navigator && 'PushManager' in window) {
			setIsSupported(true);
			registerServiceWorker();
		}
	}, []);
 
	async function registerServiceWorker() {
		const registration = await navigator.serviceWorker.register('/sw.js', {
			scope: '/',
			updateViaCache: 'none',
		});
		const sub = await registration.pushManager.getSubscription();
		setSubscription(sub);
	}
 
	async function subscribeToPush() {
		// const name = nameRef.current?.value;
		// const email = emailRef.current?.value;
		// const validEmail = await isValidEmail(email);

		// if (!name || !email || !frequency) {
		// 	alert('Please, fill up all the fields')
		// 	return;
		// }

		// if (!validEmail) {
		// 	alert('Please, insert a valid email')
		// 	return;
		// }

		if (!frequency) {
			alert(t("notificationAlert"));
			return;
		}

		const registration = await navigator.serviceWorker.ready;
		const sub = await registration.pushManager.subscribe({
			userVisibleOnly: true,
			applicationServerKey: urlBase64ToUint8Array(
				process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
			)
		});
		setSubscription(sub);
		const serializedSub = JSON.parse(JSON.stringify(sub));

		let first_push = new Date();
		let formatFreq = "";
		switch (frequency) {
			case 'Daily':
			case 'Diária':
				first_push.setDate(first_push.getDate() + 1);
				formatFreq = 'Daily';
				break;

			case 'Weekly':
			case 'Semanal':			
				first_push.setDate(first_push.getDate() + 7);
				formatFreq = 'Weekly';
				break;

			case 'Monthly':
			case 'Mensal':
				first_push.setMonth(first_push.getMonth() + 1);
				formatFreq = 'Monthly';
				break;
		
			default:
				break;
		}

		// await subscribeUser({name, email, freq: frequency, first_push, sub: serializedSub});
		await subscribeUser({freq: formatFreq, first_push, sub: serializedSub});

		// if (nameRef.current) nameRef.current.value = '';
		// if (emailRef.current) emailRef.current.value = '';
		if (frequency) setFrequency('');
	}
 
	async function unsubscribeFromPush() {
		await unsubscribeUser(subscription);
		await subscription?.unsubscribe();
		setSubscription(null);
		setFrequency('');
	}
 
	if (!isSupported) {
		return (
			<div className="flex-col items-center justify-center">
				<p className='text-center text-red-500'>{t("notificationNotSuported")}</p>
			</div>
		);
	}
 
	return (
		<div className="flex-col items-center justify-center">
			<p className="text-2xl font-bold mb-4">{t("notificationTitle")}</p>
			<p className="text-md mb-4">
				{subscription ?
				t("notificationSubtitle1") :
				t("notificationSubtitle2")
				}
			</p>
			<p className="space-y-4">
				{subscription ? (
					<Button variant='destructive' className='w-full' onClick={unsubscribeFromPush}>{t("notificationUnsubscribe")}</Button>
				) : (
					<>
						<div className='space-y-2'>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant='outline' className='w-full'>
										{frequency ? frequency : t("notificationSelect")}
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent className='w-full'>
									<DropdownMenuItem onClick={() => setFrequency(t("notificationDaily"))}>{t("notificationDaily")}</DropdownMenuItem>
									<DropdownMenuItem onClick={() => setFrequency(t("notificationWeekly"))}>{t("notificationWeekly")}</DropdownMenuItem>
									<DropdownMenuItem onClick={() => setFrequency(t("notificationMonthly"))}>{t("notificationMonthly")}</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
						<Button className='w-full' onClick={subscribeToPush}>{t("notificationSubscribe")}</Button>
					</>
				)}
			</p>
		</div>
	);
}