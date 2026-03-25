require('dotenv').config();
const { 
    Client, GatewayIntentBits, Partials, EmbedBuilder, 
    ActionRowBuilder, ButtonBuilder, ButtonStyle, 
    SlashCommandBuilder, PermissionFlagsBits, Collection 
} = require('discord.js');
const express = require('express');

const app = express();
app.use(express.urlencoded({ extended: true }));
const port = process.env.PORT || 3000;

const ADMIN_PASSWORD = "123"; // كلمة سر لوحة التحكم

// --- [ الموقع ولوحة التحكم ] ---
app.get('/', (req, res) => {
    res.send(`<body style="background:#2c2f33;color:white;text-align:center;padding:50px;font-family:sans-serif;"><h1>🚀 ${client.user?.username || 'Bot'} Dashboard</h1><p>38 Commands Active</p></body>`);
});

app.get('/admin/' + ADMIN_PASSWORD, (req, res) => {
    res.send(`<body style="background:#1a1c1e;color:white;padding:30px;font-family:sans-serif;"><h2>⚙️ Admin Panel</h2><form action="/update-bot" method="POST"><input type="hidden" name="password" value="${ADMIN_PASSWORD}"><h3>Status:</h3><input type="text" name="status" style="width:100%;padding:10px;"><br><h3>Message:</h3><input type="text" name="channelId" placeholder="Channel ID"><br><textarea name="message" style="width:100%;height:80px;"></textarea><br><button type="submit">Update 🚀</button></form></body>`);
});

app.post('/update-bot', (req, res) => {
    const { password, status, channelId, message } = req.body;
    if (password !== ADMIN_PASSWORD) return res.send("❌ Access Denied");
    if (status) client.user.setActivity(status);
    if (channelId && message) { client.channels.cache.get(channelId)?.send(message); }
    res.send("✅ Updated!");
});

app.listen(port);

// --- [ إعداد البوت ] ---
const client = new Client({
    intents: [3276799], // All Intents
    partials: [Partials.Channel, Partials.Message, Partials.User]
});

const db = new Collection(); // تخزين مؤقت للاقتصاد

client.on('ready', async () => {
    console.log(`✅ ${client.user.tag} is Online with 38 commands!`);

    const commands = [
        // 1. الإدارة (10)
        new SlashCommandBuilder().setName('clear').setDescription('مسح الرسائل').addIntegerOption(o => o.setName('amount').setRequired(true).setDescription('العدد')),
        new SlashCommandBuilder().setName('ban').setDescription('حظر عضو').addUserOption(o => o.setName('user').setRequired(true).setDescription('العضو')),
        new SlashCommandBuilder().setName('kick').setDescription('طرد عضو').addUserOption(o => o.setName('user').setRequired(true).setDescription('العضو')),
        new SlashCommandBuilder().setName('mute').setDescription('إسكات مؤقت').addUserOption(o => o.setName('user').setRequired(true).setDescription('العضو')).addIntegerOption(o => o.setName('time').setRequired(true).setDescription('بالدقائق')),
        new SlashCommandBuilder().setName('unmute').setDescription('فك الإسكات').addUserOption(o => o.setName('user').setRequired(true).setDescription('العضو')),
        new SlashCommandBuilder().setName('lock').setDescription('قفل القناة'),
        new SlashCommandBuilder().setName('unlock').setDescription('فتح القناة'),
        new SlashCommandBuilder().setName('slowmode').setDescription('الوضع البطيء').addIntegerOption(o => o.setName('sec').setRequired(true).setDescription('الثواني')),
        new SlashCommandBuilder().setName('nick').setDescription('تغيير لقب عضو').addUserOption(o => o.setName('user').setRequired(true).setDescription('العضو')).addStringOption(o => o.setName('name').setRequired(true).setDescription('الاسم')),
        new SlashCommandBuilder().setName('embed').setDescription('إرسال إمبد').addStringOption(o => o.setName('text').setRequired(true).setDescription('المحتوى')),

        // 2. الاقتصاد (7)
        new SlashCommandBuilder().setName('daily').setDescription('الراتب اليومي'),
        new SlashCommandBuilder().setName('work').setDescription('العمل'),
        new SlashCommandBuilder().setName('balance').setDescription('الرصيد').addUserOption(o => o.setName('user').setDescription('العضو')),
        new SlashCommandBuilder().setName('give').setDescription('تحويل مال').addUserOption(o => o.setName('user').setRequired(true).setDescription('المستلم')).addIntegerOption(o => o.setName('money').setRequired(true).setDescription('المبلغ')),
        new SlashCommandBuilder().setName('shop').setDescription('المتجر'),
        new SlashCommandBuilder().setName('buy').setDescription('شراء رتبة').addStringOption(o => o.setName('item').setRequired(true).setDescription('الرتبة')),
        new SlashCommandBuilder().setName('top').setDescription('قائمة الأغنياء'),

        // 3. التذاكر (5)
        new SlashCommandBuilder().setName('ticket-setup').setDescription('إعداد نظام التذاكر'),
        new SlashCommandBuilder().setName('close').setDescription('إغلاق التذكرة'),
        new SlashCommandBuilder().setName('add').setDescription('إضافة عضو للتذكرة').addUserOption(o => o.setName('user').setRequired(true).setDescription('العضو')),
        new SlashCommandBuilder().setName('remove').setDescription('إزالة عضو').addUserOption(o => o.setName('user').setRequired(true).setDescription('العضو')),
        new SlashCommandBuilder().setName('rename').setDescription('تغيير اسم التذكرة').addStringOption(o => o.setName('name').setRequired(true).setDescription('الاسم الجديد')),

        // 4. ترفيه وعامة (11)
        new SlashCommandBuilder().setName('avatar').setDescription('صورة الحساب').addUserOption(o => o.setName('user').setDescription('العضو')),
        new SlashCommandBuilder().setName('user-info').setDescription('معلومات الحساب'),
        new SlashCommandBuilder().setName('server-info').setDescription('معلومات السيرفر'),
        new SlashCommandBuilder().setName('ping').setDescription('سرعة اتصال البوت'),
        new SlashCommandBuilder().setName('joke').setDescription('نكته عشوائية'),
        new SlashCommandBuilder().setName('8ball').setDescription('توقع المستقبل').addStringOption(o => o.setName('question').setRequired(true).setDescription('سؤالك')),
        new SlashCommandBuilder().setName('kill').setDescription('لعبة القتل').addUserOption(o => o.setName('user').setRequired(true).setDescription('الضحية')),
        new SlashCommandBuilder().setName('hug').setDescription('حضن شخص').addUserOption(o => o.setName('user').setRequired(true).setDescription('الشخص')),
        new SlashCommandBuilder().setName('choose').setDescription('البوت يختار لك').addStringOption(o => o.setName('options').setRequired(true).setDescription('الخيارات مفصولة بفاصلة')),
        new SlashCommandBuilder().setName('say').setDescription('تكرار كلامك').addStringOption(o => o.setName('msg').setRequired(true).setDescription('النص')),
        new SlashCommandBuilder().setName('roll').setDescription('رمي الزهر'),

        // 5. القرآن والموسيقى (5)
        new SlashCommandBuilder().setName('play').setDescription('تشغيل صوتي').addStringOption(o => o.setName('query').setRequired(true).setDescription('اسم السورة أو المقطع')),
        new SlashCommandBuilder().setName('stop').setDescription('إيقاف الصوت'),
        new SlashCommandBuilder().setName('skip').setDescription('تخطي'),
        new SlashCommandBuilder().setName('volume').setDescription('مستوى الصوت').addIntegerOption(o => o.setName('level').setRequired(true).setDescription('1-100')),
        new SlashCommandBuilder().setName('quran-list').setDescription('قائمة السور المتاحة')
    ];

    await client.application.commands.set(commands);
});

// --- [ معالج التفاعلات والأوامر ] ---
client.on('interactionCreate', async (i) => {
    if (!i.isChatInputCommand()) return;

    // 1. الإدارة
    if (i.commandName === 'clear') {
        const amount = i.options.getInteger('amount');
        await i.channel.bulkDelete(amount).catch(() => null);
        return i.reply({ content: `✅ تم مسح ${amount} رسالة.`, ephemeral: true });
    }

    if (i.commandName === 'lock') {
        await i.channel.permissionOverwrites.edit(i.guild.roles.everyone, { SendMessages: false });
        return i.reply('🔒 تم قفل القناة بنجاح.');
    }

    // 2. الاقتصاد
    if (i.commandName === 'daily') {
        let user = db.get(i.user.id) || { bal: 0 };
        user.bal += 500;
        db.set(i.user.id, user);
        return i.reply(`💰 استلمت راتبك اليومي (500 عملة)! رصيدك الحالي: ${user.bal}`);
    }

    if (i.commandName === 'balance') {
        const target = i.options.getUser('user') || i.user;
        const bal = db.get(target.id)?.bal || 0;
        return i.reply(`💳 رصيد ${target.username} هو: ${bal} عملة.`);
    }

    // 3. التذاكر
    if (i.commandName === 'ticket-setup') {
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('open_ticket').setLabel('فتح تذكرة 🎫').setStyle(ButtonStyle.Primary)
        );
        const embed = new EmbedBuilder().setTitle('الدعم الفني').setDescription('اضغط على الزر لفتح تذكرة').setColor('Blue');
        return i.reply({ embeds: [embed], components: [row] });
    }

    // 4. الترفيه
    if (i.commandName === 'ping') return i.reply(`🏓 Pong! ${client.ws.ping}ms`);

    if (i.commandName === 'avatar') {
        const user = i.options.getUser('user') || i.user;
        return i.reply(user.displayAvatarURL({ dynamic: true, size: 1024 }));
    }
});

// معالج الأزرار (التذاكر)
client.on('interactionCreate', async (i) => {
    if (!i.isButton()) return;
    if (i.customId === 'open_ticket') {
        const channel = await i.guild.channels.create({
            name: `ticket-${i.user.username}`,
            permissionOverwrites: [
                { id: i.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                { id: i.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }
            ]
        });
        await i.reply({ content: `✅ تم فتح تذكرتك: ${channel}`, ephemeral: true });
    }
});

client.login(process.env.TOKEN);
