import { definePlugin } from "emdash";

/**
 * TCM Inquiry Notifier Plugin
 * 
 * This plugin listens for new "inquiries" and sends notifications.
 */
export default definePlugin({
  id: "tcm-inquiry-notifier",
  capabilities: ["read:content"],
  hooks: {
    "content:afterSave": async (event, ctx) => {
      // Only trigger for 'inquiries' collection
      if (event.collection !== "inquiries") return;
      
      // We usually treat 'published' as the trigger for a new inquiry
      if (event.content.status !== "published") return;
      
      const inquiry = event.content.data;
      const { title, name, email, message } = inquiry;

      console.log(`[Plugin] New Inquiry: ${title} from ${name} (${email})`);
      
      // Send Email Notification via Resend (Example service)
      if (ctx.env.RESEND_API_KEY) {
        try {
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${ctx.env.RESEND_API_KEY}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              from: "DaoYiGuan <onboarding@resend.dev>", // Replace with your verified domain in production
              to: ["psqhhh@gmail.com"],
              subject: `[新询盘] ${title} - 来自 ${name}`,
              html: `
                <h2>道医馆接收到新询盘</h2>
                <p><strong>咨询主题:</strong> ${title}</p>
                <p><strong>客户姓名:</strong> ${name}</p>
                <p><strong>客户邮箱:</strong> ${email}</p>
                <hr />
                <p><strong>咨询内容:</strong></p>
                <p>${message.replace(/\n/g, '<br>')}</p>
                <hr />
                <p><a href="${ctx.env.SITE_URL || 'http://localhost:4321'}/_emdash/admin">点击进入后台查看详情</a></p>
              `
            }),
          });
          console.log(`[Plugin] Notification email sent to psqhhh@gmail.com`);
        } catch (err) {
          console.error(`[Plugin] Failed to send email:`, err);
        }
      } else {
        console.warn("[Plugin] RESEND_API_KEY not found. Skipping email notification.");
      }
      
      // Business Logic: Send to Slack/CRM...
    },
  },
});
