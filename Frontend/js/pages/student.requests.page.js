import { toast } from "../ui/components.js";
import { sendWhatsappTest } from "../services/notifications.api.js";

export function initStudentNotificationsPage() {
  const btn = document.getElementById("btnTestNotify");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    btn.disabled = true;
    try {
      await sendWhatsappTest();
      toast({ title: "Sent", message: "Notification requested." });
    } catch (err) {
      toast({ title: "Note", message: "Backend endpoint /notifications/whatsapp not implemented yet." });
    } finally {
      btn.disabled = false;
    }
  });
}
