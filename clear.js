// Bu yerda siz Telegram bot API ni ishlatib, kerakli chatdan eski, o'yinda ishtirok etmaydigan xabarlarni o'chirish funksiyasini yozasiz

async function clearNonParticipants(bot, chatId, participants) {
    try {
        // Bu yerda Telegram API bilan o'sha guruhdan xabarlarni olish va ishtirok etmaydiganlarni o'chirish lozim
        // Masalan, siz botga admin huquqini berib, chatdan so'nggi 50 yoki 100 ta xabarni tekshirib chiqasiz
        // va ishtirok etmayotganlar xabarlarini o'chirasiz

        // Ammo Telegram API to'g'ridan-to'g'ri xabarlar ro'yxatini olish imkonini bermaydi,
        // shuning uchun odatda faqat ma'lum IDlar orqali yoki callback query orqali o'chirish mumkin.

        // Shu sababli, har bir o'yinchi qo'shgan xabarlarni saqlab, keyin ularni o'chirish yoki botni admin qilib,
        // maxsus komandalar bilan xabarlarni o'chirishni tashkil qilishingiz kerak.

        console.log('clearNonParticipants funksiyasi ishladi, ammo Telegram API cheklovi bor.');
    } catch (e) {
        console.error('Xatolik clearNonParticipants da:', e);
    }
}

module.exports = {
    clearNonParticipants,
};
