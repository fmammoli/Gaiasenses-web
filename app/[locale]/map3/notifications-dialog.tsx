"use client";
import {
	Dialog,
	DialogTrigger,
	DialogContent,
	DialogClose,
} from "@/components/ui/dialog";
import { BellRing } from "lucide-react";
import PushNotificationManager from "../notifications/notifications";

export default function NotificationDialog() {
	return (
		<>
			<Dialog>
				<DialogTrigger asChild>
					<div className="absolute top-[215px] right-0 z-10">
						<div className="mr-[10px] mt-[10px]">
							<button className="bg-white w-[29px] h-[29px] rounded-sm flex justify-center items-center hover:bg-gray-200">
								<BellRing width={22} height={22} strokeWidth={2.5} />
							</button>
						</div>
					</div>
				</DialogTrigger>
				<DialogContent className="max-w-[30%]">
					<PushNotificationManager />
					<DialogClose></DialogClose>
				</DialogContent>
			</Dialog>
		</>
	);
}
