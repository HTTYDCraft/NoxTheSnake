// config.js — главный конфигурационный файл для NoxTheSnake

export const config = {
    profile: {
        avatar: "./assets/avatar.png",
        minecraftSkinUrl: "./assets/skin.png"
    },

    links: [
        {
            label: "Telegram",
            url: "https://t.me/NoxTheSnake_TG",
            icon: "send",
            order: 1,
            active: true
        },
        {
            label: "X (Twitter)",
            url: "https://x.com/NoxTheSnakeX",
            icon: "public",
            order: 2,
            active: true
        },
        {
            label: "Instagram",
            url: "https://www.instagram.com/noxthesnake",
            icon: "photo_camera",
            order: 3,
            active: true
        },
        {
            label: "YouTube",
            url: "https://youtube.com/@noxthesnake",
            icon: "play_arrow",
            order: 4,
            active: true
        }
    ],

    strings: {
        profileName: "NoxTheSnake",
        profileDescription: "Snake into programming, videos & games",
        minecraftTitle: "My Minecraft Skin",
        downloadSkin: "Download Skin",
        avatarAlt: "NoxTheSnake's Profile Avatar",
    }
};