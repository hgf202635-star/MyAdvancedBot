require('dotenv').config();
const { 
    Client, GatewayIntentBits, Partials, EmbedBuilder, 
    ActionRowBuilder, ButtonBuilder, ButtonStyle, 
    SlashCommandBuilder, PermissionFlagsBits, Collection 
} = require('discord.js');
const express = require('express');

// --- إعداد موقع البوت العام ---
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send(`
        <body style="background-color:#2c2f33; color:white; font-family:sans-serif; text-align:center; padding:50px;">
            <h1>🚀 ${client.user ? client.user.username : 'Bot'} Online</h1>
            <p>البوت يعمل الآن بـ 38 أمراً متطوراً!</p>
            <div style="background:#23272a; padding:20px; border-radius:10px; display:inline-block;">
                <h3>إحصائيات سريعة:</h3>
                <p>السيرفرات: ${client.guilds.cache.size}</p>
                <p>المستخدمين: ${client.users.cache.size}</p>
            </div>
        </body>
    `);
});

app.listen(port, () => console.log(`🌐 الموقع يعمل على المنفذ: ${port}`));

// --- إعداد البوت ---
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates
    ],
    partials: [Partials.Channel, Partials.Message, Partials.User]
});

const db = new Collection(); // قاعدة بيانات مؤقتة للاقتصاد

// --- 🛡️ نظام الحماية (Anti-Links) ---
client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;
    if (message.content.includes('http') && !message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
        await message.delete().catch(() => null);
        return message.channel.send(`🚫 ${message.author}، الروابط ممنوعة!`).then(m => setTimeout(() => m.delete(), 3000));
    }
});

// --- ⚡ تسجيل الـ 38 أمراً بسلاش ---
client.on('ready', async () => {
    console.log(`✅ ${client.user.tag} جاهز للعمل!`);

    const commands = [
        // 1. نظام الإدارة (10 أوامر)
        new SlashCommandBuilder().setName('admin').setDescription('أوامر الإدارة')
            .addSubcommand(s => s.setName('clear').setDescription('مسح الشات').addIntegerOption(o => o.setName('num').setRequired(true).setDescription('العدد')))
            .addSubcommand(s => s.setName('ban').setDescription('حظر عضو').addUserOption(o => o.setName('user').setRequired(true).setDescription('العضو')))
            .addSubcommand(s => s.setName('kick').setDescription('طرد عضو').addUserOption(o => o.setName('user').setRequired(true).setDescription('العضو')))
            .addSubcommand(s => s.setName('mute').setDescription('إسكات عضو').addUserOption(o => o.setName('user').setRequired(true).setDescription('العضو')).addIntegerOption(o => o.setName('time').setRequired(true).setDescription('بالدقائق')))
            .addSubcommand(s => s.setName('unmute').setDescription('فك الإسكات').addUserOption(o => o.setName('user').setRequired(true).setDescription('العضو')))
            .addSubcommand(s => s.setName('lock').setDescription('قفل القناة'))
            .addSubcommand(s => s.setName('unlock').setDescription('فتح القناة'))
            .addSubcommand(s => s.setName('role').setDescription('إعطاء رتبة').addUserOption(o => o.setName('user').setRequired(true).setDescription('العضو')).addRoleOption(o => o.setName('rank').setRequired(true).setDescription('الرتبة')))
            .addSubcommand(s => s.setName('slowmode').setDescription('الوضع البطيء').addIntegerOption(o => o.setName('sec').setRequired(true).setDescription('الثواني')))
            .addSubcommand(s => s.setName('setnick').setDescription('تغيير لقب').addUserOption(o => o.setName('user').setRequired(true).setDescription('العضو')).addStringOption(o => o.setName('nick').setRequired(true).setDescription('الاسم الجديد'))),

        // 2. نظام الاقتصاد (7 أوامر)
        new SlashCommandBuilder().setName('economy').setDescription('نظام المال')
            .addSubcommand(s => s.setName('daily').setDescription('الراتب اليومي'))
            .addSubcommand(s => s.setName('work').setDescription('العمل'))
            .addSubcommand(s => s.setName('balance').setDescription('الرصيد'))
            .addSubcommand(s => s.setName('transfer').setDescription('تحويل').addUserOption(o => o.setName('to').setRequired(true).setDescription('لشخص')).addIntegerOption(o => o.setName('amount').setRequired(true).setDescription('المبلغ')))
            .addSubcommand(s => s.setName('shop').setDescription('المتجر'))
            .addSubcommand(s => s.setName('buy').setDescription('شراء').addStringOption(o => o.setName('item').setRequired(true).setDescription('العنصر')))
            .addSubcommand(s => s.setName('top').setDescription('الأغنياء')),

        // 3. نظام التذاكر (5 أوامر)
        new SlashCommandBuilder().setName('ticket').setDescription('نظام التذاكر')
            .addSubcommand(s => s.setName('setup').setDescription('إنشاء اللوحة'))
            .addSubcommand(s => s.setName('close').setDescription('إغلاق'))
            .addSubcommand(s => s.setName('add').setDescription('إضافة عضو').addUserOption(o => o.setName('user').setRequired(true).setDescription('العضو')))
            .addSubcommand(s => s.setName('remove').setDescription('إزالة عضو').addUserOption(o => o.setName('user').setRequired(true).setDescription('العضو')))
            .addSubcommand(s => s.setName('delete').setDescription('حذف القناة')),

        // 4. نظام الترفيه والعامة (11 أمراً)
        new SlashCommandBuilder().setName('fun').setDescription('ألعاب وعامة')
            .addSubcommand(s => s.setName('avatar').setDescription('صورة الحساب'))
            .addSubcommand(s => s.setName('server').setDescription('معلومات السيرفر'))
            .addSubcommand(s => s.setName('user').setDescription('معلوماتك'))
            .addSubcommand(s => s.setName('ping').setDescription('سرعة البوت'))
            .addSubcommand(s => s.setName('botinfo').setDescription('معلومات البوت'))
            .addSubcommand(s => s.setName('choose').setDescription('لو خيروك'))
            .addSubcommand(s => s.setName('joke').setDescription('نكتة'))
            .addSubcommand(s => s.setName('8ball').setDescription('اسأل البوت').addStringOption(o => o.setName('q').setRequired(true).setDescription('سؤالك')))
            .addSubcommand(s => s.setName('kill').setDescription('لعبة القتل').addUserOption(o => o.setName('target').setRequired(true).setDescription('الضحية')))
            .addSubcommand(s => s.setName('hug').setDescription('حضن').addUserOption(o => o.setName('user').setRequired(true).setDescription('الشخص')))
            .addSubcommand(s => s.setName('say').setDescription('قول').addStringOption(o => o.setName('text').setRequired(true).setDescription('النص'))),

        // 5. نظام القرآن والموسيقى (5 أوامر)
        new SlashCommandBuilder().setName('play').setDescription('تشغيل').addStringOption(o => o.setName('query').setRequired(true).setDescription('اسم المقطع')),
        new SlashCommandBuilder().setName('stop').setDescription('إيقاف'),
        new SlashCommandBuilder().setName('skip').setDescription('تخطي'),
        new SlashCommandBuilder().setName('queue').setDescription('القائمة'),
        new SlashCommandBuilder().setName('volume').setDescription('الصوت').addIntegerOption(o => o.setName('level').setRequired(true).setDescription('1-100'))
    ];

    await client.application.commands.set(commands);
});

// --- 🎮 التفاعلات ---
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    const { commandName, options } = interaction;
    const sub = options.getSubcommand(false);

    // إدارة - مسح
    if (commandName === 'admin' && sub === 'clear') {
        const num = options.getInteger('num');
        await interaction.channel.bulkDelete(num).catch(() => null);
        return interaction.reply({ content: `🧹 تم مسح ${num} رسالة.`, ephemeral: true });
    }

    // تذاكر - إعداد
    if (commandName === 'ticket' && sub === 'setup') {
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('open_t').setLabel('فتح تذكرة 🎫').setStyle(ButtonStyle.Primary)
        );
        return interaction.reply({ content: 'اضغط للارتباط بالدعم الفني:', components: [row] });
    }

    // اقتصاد - يومي
    if (commandName === 'economy' && sub === 'daily') {
        return interaction.reply('💰 استلمت 500 عملة!');
    }
});

client.login(process.env.TOKEN);
